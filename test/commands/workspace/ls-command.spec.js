/* eslint-disable no-console */
import fs from '@app/helpers/fs';
import faker from '@test/__utils__/faker';
import command from '@app/commands/workspace/ls-command';
import configService from '@app/services/config-service';

describe('workspace-ls-command', () => {
  const workspace1 = faker.createGerduConfigWorkspace({ name: 'ws-1' });
  const workspace2 = faker.createGerduConfigWorkspace({ name: 'ws-2' });
  const config = faker.createGerduConfig({ workspaces: [workspace1, workspace2] });

  beforeEach(() => {
    jest.clearAllMocks();
    fs.exists.mockImplementation(() => true);
    jest.spyOn(configService, 'fetch').mockImplementation(() => config);
  });
  it('prints all workspaces', () => {
    command.run();
    const data = config.workspaces.map((ws) => ({ ...ws, active: false }));
    expect(console.table).toHaveBeenCalledWith(data);
  });
  it('prints active/de-active workspaces', () => {
    jest.spyOn(configService, 'fetch').mockImplementation(() => ({ ...config, settings: { active_workspace: workspace1.name } }));
    command.run();
    const data = config.workspaces.map((ws) => ({ ...ws, active: ws.name === workspace1.name }));
    expect(console.table).toHaveBeenCalledWith(data);
  });
});
