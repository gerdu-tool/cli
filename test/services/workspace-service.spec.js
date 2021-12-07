import path from '@app/helpers/path';
import faker from '@test/__utils__/faker';
import configService from '@app/services/config-service';
import workspaceSchema from '@app/schema/workspace-schema';
import workspaceService from '@app/services/workspace-service';
import { WORKSPACE_CONFIG_FILE_NAME } from '@app/consts';

describe('workspace-service', () => {
  const workspaceSpec = faker.createGerduConfigWorkspace();
  const workspace = faker.createWorkspace();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(configService, 'getActiveWorkspace').mockImplementation(() => workspaceSpec);
    jest.spyOn(configService, 'getWorkspace').mockImplementation(() => workspaceSpec);
    jest.spyOn(workspaceSchema, 'get').mockImplementation(() => workspace);
  });

  it('returns active workspace', () => {
    expect(workspaceService.fetch()).toMatchObject(workspace);
    expect(configService.getActiveWorkspace).toHaveBeenCalledWith();
    expect(workspaceSchema.get).toHaveBeenCalledWith(path.resolve(workspaceSpec.path, WORKSPACE_CONFIG_FILE_NAME));
  });
  it('returns workspace by name', () => {
    expect(workspaceService.fetch(workspace.name)).toMatchObject(workspace);
    expect(configService.getWorkspace).toHaveBeenCalledWith(workspace.name);
    expect(workspaceSchema.get).toHaveBeenCalledWith(path.resolve(workspaceSpec.path, WORKSPACE_CONFIG_FILE_NAME));
  });
});
