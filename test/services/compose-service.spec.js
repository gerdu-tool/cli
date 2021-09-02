import path from '@app/helpers/path';
import faker from '@test/__utils__/faker';
import dockerCompose from '@app/helpers/docker-compose';
import composeService from '@app/services/compose-service';
import { WORKSPACE_COMPOSE_FILE_NAME } from '@app/consts';

describe('compose-service', () => {
  const cmd = 'rm -f -s -v';
  const workspace = faker.createWorkspace();
  const files = [path.resolve(workspace.path, WORKSPACE_COMPOSE_FILE_NAME)];
  const services = ['service1'];
  const profiles = [workspace.profiles[0].name];
  const profile1Services = workspace.profiles[0].services;

  beforeEach(() => {
    jest.spyOn(dockerCompose, 'exec').mockImplementation(() => Promise.resolve());
  });

  it('executes command', async () => {
    await composeService.exec({ workspace, services: [], cmd });
    expect(dockerCompose.exec).toHaveBeenCalledWith({
      cwd: workspace.path, files, services: [], cmd, options: {},
    });
  });
  it('executes command, with specified services', async () => {
    await composeService.exec({ workspace, services, cmd });
    expect(dockerCompose.exec).toHaveBeenCalledWith({
      cwd: workspace.path, files, services, cmd, options: {},
    });
  });
  it('executes command, with specified profiles', async () => {
    await composeService.exec({ workspace, profiles, cmd });
    expect(dockerCompose.exec).toHaveBeenCalledWith({
      cwd: workspace.path, files, services: profile1Services, cmd, options: {},
    });
  });
  it('executes silent command', async () => {
    await composeService.exec({
      workspace, profiles, cmd, options: { silent: true },
    });
    expect(dockerCompose.exec).toHaveBeenCalledWith({
      cwd: workspace.path, files, services: profile1Services, cmd, options: { silent: true },
    });
  });
  it('executes interactive command', async () => {
    await composeService.exec({
      workspace, profiles, cmd, options: { interactive: true },
    });
    expect(dockerCompose.exec).toHaveBeenCalledWith({
      cwd: workspace.path, files, services: profile1Services, cmd, options: { interactive: true },
    });
  });
});
