import fs from '@app/helpers/fs';
import messages from '@app/messages';
import faker from '@test/__utils__/faker';
import configService from '@app/services/config-service';
import command from '@app/commands/workspace/switch-command';

describe('workspace-switch-command', () => {
  const ws1 = faker.createGerduConfigWorkspace({ name: 'ws1' });
  const ws2 = faker.createGerduConfigWorkspace({ name: 'ws2' });
  const config = faker.createGerduConfig({
    workspaces: [ws1, ws2],
    settings: {
      test: true,
      active_workspace: ws1.name,
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fs.exists.mockImplementation(() => true);
    jest.spyOn(configService, 'fetch').mockImplementation(() => config);
    jest.spyOn(configService, 'save').mockImplementation(() => {});
  });
  describe('#run', () => {
    it('switches active workspace', () => {
      command.run({ name: ws2.name });
      expect(configService.save).toHaveBeenCalledWith({
        ...config,
        settings: {
          test: true,
          active_workspace: ws2.name,
        },
      });
    });
    it('raise error for invalid params', () => {
      expect(() => command.run({ name: undefined })).toThrowError('name is required!');
    });
    it('raise error if workspace not found', () => {
      expect(() => command.run({ name: 'invalid' })).toThrowError(messages.workspaceNotFound('invalid'));
    });
  });
  describe('#suggest', () => {
    it('returns suggestion tree', () => {
      expect(command.suggest()).toMatchObject(config.workspaces.map((w) => w.name));
    });
  });
});
