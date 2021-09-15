// @flow
import fs from '@app/helpers/fs';
import messages from '@app/messages';
import path from '@app/helpers/path';
import logger from '@app/helpers/logger';
import type { Mapping, Chart } from '@app/type';
import stageService from '@app/services/stage-service';
import dockerCompose from '@app/helpers/docker-compose';
import configService from '@app/services/config-service';
import contextService from '@app/services/context-service';
import workspaceService from '@app/services/workspace-service';
import {
  WORKSPACE_CACHE_DIR_NAME, WORKSPACE_COMPOSE_FILE_NAME, WORKSPACE_CACHE_TEMP_DIR_NAME,
  ASSETS_DIR_NAME, PROXY_DIR_NAME, PROXY_COMPOSE_FILE_NAME,
} from '@app/consts';

const attachMappingLabelsToServiceSpec = ({ chart }: {chart: Chart}) => {
  const spec = JSON.parse(JSON.stringify(chart.compose));

  chart.mappings.forEach((m: Mapping) => {
    const mappingService = spec.services[m.service];
    if (!mappingService) throw Error(messages.mappingChartNotFound(chart.name, m.name));
    mappingService.labels = mappingService.labels || {};

    const traefikUniqueName = `${chart.name}_${m.name}`;

    mappingService.labels['traefik.enable'] = 'true';
    mappingService.labels[`traefik.http.services.${traefikUniqueName}.loadbalancer.server.port`] = `${m.port}`;

    // headers middleware
    mappingService.labels[`traefik.http.middlewares.${traefikUniqueName}_headers.headers.customresponseheaders.X-GATEWAY`] = 'gerdu_treafik';

    // stripprefix middleware
    // mappingService.labels[`traefik.http.routers.${traefikUniqueName}_stripprefix.middlewares`] = `${traefikUniqueName}@docker`;
    mappingService.labels[`traefik.http.middlewares.${traefikUniqueName}_stripprefix.stripprefix.prefixes`] = m.path;

    if (m.cors) {
      const { cors } = m;
      mappingService.labels[`traefik.http.middlewares.${traefikUniqueName}_headers.headers.accesscontrolallowmethods`] = cors.allowMethods;
      mappingService.labels[`traefik.http.middlewares.${traefikUniqueName}_headers.headers.accesscontrolallowheaders`] = cors.allowHeaders;
      mappingService.labels[`traefik.http.middlewares.${traefikUniqueName}_headers.headers.accesscontrolalloworiginlist`] = cors.allowOrigins;
      mappingService.labels[`traefik.http.middlewares.${traefikUniqueName}_headers.headers.accesscontrolallowcredentials`] = cors.allowCredentials.toString();
    }

    mappingService.labels[`traefik.http.routers.${traefikUniqueName}.entrypoints`] = 'public';
    mappingService.labels[`traefik.http.routers.${traefikUniqueName}.service`] = traefikUniqueName; true.toString();
    mappingService.labels[`traefik.http.routers.${traefikUniqueName}.rule`] = `Host(\`${m.host}\`) && PathPrefix(\`${m.path}\`)`;
    mappingService.labels[`traefik.http.routers.${traefikUniqueName}.middlewares`] = `${traefikUniqueName}_stripprefix@docker,${traefikUniqueName}_headers@docker`;
  });

  return spec;
};

const syncCommand = async () => {
  logger.commandStart('Syncing');
  const config = configService.fetch();
  const workspace = workspaceService.fetch();
  const cacheDirectory = path.resolve(workspace.path, WORKSPACE_CACHE_DIR_NAME);
  const tempDirectory = path.resolve(cacheDirectory, WORKSPACE_CACHE_TEMP_DIR_NAME);
  const finalComposeFilePath = path.resolve(workspace.path, WORKSPACE_COMPOSE_FILE_NAME);
  const proxySpec = path.resolve(path.root(), ASSETS_DIR_NAME, PROXY_DIR_NAME, PROXY_COMPOSE_FILE_NAME);

  // create ws cache directory
  if (!fs.exists(cacheDirectory)) {
    logger.logTask('Creating cache directory');
    fs.mkdir(cacheDirectory);
  }

  // create temp directory
  logger.logTask('Creating temp directory');
  if (fs.exists(tempDirectory)) fs.rmDir(tempDirectory);
  fs.mkdir(tempDirectory);

  logger.logTask('processing specs ...');
  const composeSpecs = [
    workspace.compose,
    ...workspace.charts.map((chart: Chart) => attachMappingLabelsToServiceSpec({ chart })),
  ];
  const allUniqueServices = [...(new Set(
    // we need to have uniqe names
    composeSpecs.reduce((services: string[], spec: any) => [...services, ...((spec.services && Object.keys(spec.services)) || [])], []),
  ))];
  allUniqueServices.forEach((s: string) => logger.logDebug(`${s}: service found`));

  const allMappings = workspace.charts
    .reduce((mappings: string[], chart: Chart) => [...mappings, ...chart.mappings.map((m: Mapping) => `${chart.name}-${m.name}`)], []);
  allMappings.forEach((m: string) => logger.logDebug(`${m}: mapping found`));

  logger.logTask('merging specs ...');
  {
    const allComposeFiles = [];
    composeSpecs.forEach((spec: any, index: number) => {
      const output = path.resolve(tempDirectory, `${index}-compose.yaml`);
      fs.writeAllYaml(output, spec);
      allComposeFiles.push(output);
    });
    await dockerCompose.exec({
      files: [...allComposeFiles, proxySpec],
      cwd: path.resolve(workspace.path),
      cmd: `convert --format=yaml > ${finalComposeFilePath}`,
      options: { silent: true },
    });
    logger.logDebug(`specs merged into ${finalComposeFilePath}.`);
  }

  // executing stages
  for (const chart of workspace.charts) {
    logger.logTask(`${chart.name}: executing stages ...`);
    await stageService.executeStage(workspace, chart.stages, 'sync');
  }

  // store context
  logger.logTask('creating lock file ...');
  contextService.save({
    config,
    workspace,
    services: allUniqueServices,
    composeFile: finalComposeFilePath,
  });

  // removing temp directory
  logger.logTask('cleaning up ...');
  fs.rmDir(tempDirectory);

  logger.commandCompleted();
  logger.info('Done');
};

export default {
  run: syncCommand,
};
