import fs from '@app/helpers/fs';
import path from '@app/helpers/path';
import faker from '@test/__utils__/faker';
import configService from '@app/services/config-service';
import command from '@app/commands/workspace/add-command';

describe('workspace-add-command', () => {
  const wsPath = './ws/ws-1';
  const wsName = 'test-ws-name';
  const config = faker.createGerduConfig();

  beforeEach(() => {
    jest.clearAllMocks();
    fs.exists.mockImplementation(() => true);
    jest.spyOn(configService, 'fetch').mockImplementation(() => config);
    jest.spyOn(configService, 'save').mockImplementation(() => {});
  });
  it('adds new workspace', () => {
    command.run({ name: wsName, workspacePath: wsPath });
    expect(configService.save).toHaveBeenCalledWith({
      ...config,
      workspaces: [...config.workspaces, { name: wsName, path: path.resolve(wsPath) }],
    });
  });
  it('raise error for invalid params', () => {
    expect(() => command.run({ name: wsName, workspacePath: undefined })).toThrowError('path is required!');
    expect(() => command.run({ name: undefined, workspacePath: wsPath })).toThrowError('name is required!');
  });
  it('raise error if workspace name already exists', () => {
    expect(() => command.run({ name: config.workspaces[0].name, workspacePath: wsPath })).toThrowError('Name already exists!');
  });
});
