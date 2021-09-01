/* eslint-disable no-console */
import fs from '@app/helpers/fs';
import path from '@app/helpers/path';
import messages from '@app/messages';
import faker from '@test/__utils__/faker';
import command from '@app/commands/install/sync-command';
import stageService from '@app/services/stage-service';
import configService from '@app/services/config-service';
import contextService from '@app/services/context-service';
import workspaceService from '@app/services/workspace-service';
import dockerCompose from '@app/helpers/docker-compose';
import {
  WORKSPACE_CACHE_DIR_NAME, WORKSPACE_COMPOSE_FILE_NAME, WORKSPACE_CACHE_TEMP_DIR_NAME,
} from '@app/consts';

describe('install-sync-command', () => {
  const config = faker.createGerduConfig();
  const workspace = Object.freeze(faker.createWorkspace());
  const chart = workspace.charts[0];
  const mapping = workspace.charts[0].mappings[0];
  const cacheDirectory = path.resolve(workspace.path, WORKSPACE_CACHE_DIR_NAME);
  const tempDirectory = path.resolve(cacheDirectory, WORKSPACE_CACHE_TEMP_DIR_NAME);
  const finalComposeFile = path.resolve(cacheDirectory, WORKSPACE_COMPOSE_FILE_NAME);
  const chartSpec = path.resolve(tempDirectory, '1-compose.yaml');

  beforeEach(() => {
    jest.clearAllMocks();
    fs.exists.mockImplementation((p) => p === chart.repo.output);
    jest.spyOn(workspaceService, 'fetch').mockImplementation(() => workspace);
    jest.spyOn(stageService, 'executeStage').mockImplementation(() => Promise.resolve());
    jest.spyOn(contextService, 'save').mockImplementation(() => {});
    jest.spyOn(configService, 'fetch').mockImplementation(() => config);
    jest.spyOn(dockerCompose, 'exec').mockImplementation(() => Promise.resolve('{ result:1.0 }'));
  });
  it('creates cache directory if does not exists', async () => {
    fs.exists.mockImplementation(() => false);
    await command.run();
    expect(fs.mkdir).toHaveBeenCalledWith(cacheDirectory);
  });
  it('wont create cache directory if exists', async () => {
    fs.exists.mockImplementation(() => true);
    await command.run();
    expect(fs.mkdir).not.toHaveBeenCalledWith(cacheDirectory);
  });
  it('removes temp directory if exists', async () => {
    fs.exists.mockImplementation(() => true);
    await command.run();
    expect(fs.rmDir).toHaveBeenCalledTimes(2);
    expect(fs.rmDir).toHaveBeenCalledWith(tempDirectory);
  });
  it('wont removes temp directory if does not exists', async () => {
    fs.exists.mockImplementation(() => false);
    await command.run();
    expect(fs.rmDir).toHaveBeenCalledTimes(1);
  });
  it('creates temp directory', async () => {
    await command.run();
    expect(fs.mkdir).toHaveBeenCalledWith(tempDirectory);
  });
  it('process and caches workspace compose spec', async () => {
    fs.exists.mockImplementation(() => false);
    jest.spyOn(workspaceService, 'fetch').mockImplementation(() => ({
      ...workspace,
      charts: [],
    }));
    await command.run();
    const expectedSpec = { ...workspace.compose };
    expect(fs.writeAllYaml).toHaveBeenCalledWith(
      path.resolve(tempDirectory, '0-compose.yaml'),
      expectedSpec,
    );
  });

  describe('service spec', () => {
    it('store service spec by adds mapping labels', async () => {
      fs.exists.mockImplementation(() => false);
      await command.run();
      const traefikUniqueName = `${chart.name}_${chart.mappings[0].name}`;
      const expectedSpec = {
        ...chart.compose,
        services: {
          ...chart.compose.services,
          service1: {
            ...chart.compose.services.service1,
            labels: {
              'traefik.enable': 'true',
              [`traefik.http.services.${traefikUniqueName}.loadbalancer.server.port`]: `${mapping.port}`,
              [`traefik.http.routers.${traefikUniqueName}.entrypoints`]: 'public',
              [`traefik.http.routers.${traefikUniqueName}.service`]: traefikUniqueName,
              [`traefik.http.middlewares.${traefikUniqueName}_headers.headers.customresponseheaders.X-GATEWAY`]: 'gerdu_treafik',
              [`traefik.http.middlewares.${traefikUniqueName}_stripprefix.stripprefix.prefixes`]: mapping.path,

              [`traefik.http.middlewares.${traefikUniqueName}_headers.headers.accesscontrolallowmethods`]: mapping.cors.allowMethods,
              [`traefik.http.middlewares.${traefikUniqueName}_headers.headers.accesscontrolallowheaders`]: mapping.cors.allowHeaders,
              [`traefik.http.middlewares.${traefikUniqueName}_headers.headers.accesscontrolalloworiginlist`]: mapping.cors.allowOrigins,
              [`traefik.http.middlewares.${traefikUniqueName}_headers.headers.accesscontrolallowcredentials`]: `${mapping.cors.allowCredentials}`,

              [`traefik.http.routers.${traefikUniqueName}.entrypoints`]: 'public',
              [`traefik.http.routers.${traefikUniqueName}.service`]: traefikUniqueName,
              [`traefik.http.routers.${traefikUniqueName}.rule`]: `Host(\`${mapping.host}\`) && PathPrefix(\`${mapping.path}\`)`,
              [`traefik.http.routers.${traefikUniqueName}.middlewares`]: `${traefikUniqueName}_stripprefix@docker,${traefikUniqueName}_headers@docker`,
            },
          },
        },
      };
      expect(fs.writeAllYaml).toHaveBeenCalledWith(chartSpec, expectedSpec);
    });
    it('store service spec without adding mapping cors labels to service spec', async () => {
      const localWorkspace = {
        ...workspace,
        charts: [{ ...chart, mappings: [{ ...mapping, cors: false }] }],
      };
      fs.exists.mockImplementation(() => false);
      jest.spyOn(workspaceService, 'fetch').mockImplementation(() => localWorkspace);
      await command.run();
      const traefikUniqueName = `${chart.name}_${chart.mappings[0].name}`;
      const expectedSpec = {
        ...chart.compose,
        services: {
          ...chart.compose.services,
          service1: {
            ...chart.compose.services.service1,
            labels: {
              'traefik.enable': 'true',
              [`traefik.http.services.${traefikUniqueName}.loadbalancer.server.port`]: `${mapping.port}`,
              [`traefik.http.routers.${traefikUniqueName}.entrypoints`]: 'public',
              [`traefik.http.routers.${traefikUniqueName}.service`]: traefikUniqueName,
              [`traefik.http.middlewares.${traefikUniqueName}_headers.headers.customresponseheaders.X-GATEWAY`]: 'gerdu_treafik',
              [`traefik.http.middlewares.${traefikUniqueName}_stripprefix.stripprefix.prefixes`]: mapping.path,

              [`traefik.http.routers.${traefikUniqueName}.entrypoints`]: 'public',
              [`traefik.http.routers.${traefikUniqueName}.service`]: traefikUniqueName,
              [`traefik.http.routers.${traefikUniqueName}.rule`]: `Host(\`${mapping.host}\`) && PathPrefix(\`${mapping.path}\`)`,
              [`traefik.http.routers.${traefikUniqueName}.middlewares`]: `${traefikUniqueName}_stripprefix@docker,${traefikUniqueName}_headers@docker`,
            },
          },
        },
      };
      expect(fs.writeAllYaml).toHaveBeenCalledWith(chartSpec, expectedSpec);
    });
    it('ignores if chart does not contains any service', async () => {
      jest.spyOn(workspaceService, 'fetch').mockImplementation(() => ({
        ...workspace,
        compose: {},
      }));
      await expect(() => command.run()).not.toThrowError();
    });
  });

  it('merges and stores all compose files', async () => {
    await command.run();
    expect(fs.writeAllText).toHaveBeenCalledWith(
      finalComposeFile,
      '{ result:1.0 }',
    );
  });

  it('executes stage scripts', async () => {
    fs.exists.mockImplementation(() => true);
    await command.run();
    expect(stageService.executeStage).toHaveBeenCalledWith(
      workspace,
      chart.stages,
      'sync',
    );
  });
  it('creates context lock file', async () => {
    const ws = faker.createWorkspace({
      charts: [
        faker.createChart({ name: 's1', compose: { services: { service1: {}, service2: {} } } }),
        faker.createChart({ name: 's2', compose: { services: { service1: {}, service3: {} } } }),
      ],
    });
    jest.spyOn(workspaceService, 'fetch').mockImplementation(() => ws);
    await command.run();
    expect(contextService.save).toHaveBeenCalledWith({
      config,
      workspace: ws,
      composeFile: finalComposeFile,
      services: ['service1', 'service2', 'service3'],
    });
  });
  it('raise if mapping service not found', async () => {
    const localMapping = faker.createMapping({ service: 'not-found' });
    const localChart = faker.createChart({ name: 's1', mappings: [localMapping], compose: { services: { service1: {}, service2: {} } } });
    const ws = faker.createWorkspace({
      charts: [localChart],
    });
    jest.spyOn(workspaceService, 'fetch').mockImplementation(() => ws);
    await expect(() => command.run()).rejects.toThrowError(messages.mappingChartNotFound(localChart.name, localMapping.name));
  });
});
