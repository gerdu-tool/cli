/* eslint-disable no-console */
import fs from '@app/helpers/fs';
import faker from '@test/__utils__/faker';
import composeService from '@app/services/compose-service';
import contextService from '@app/services/context-service';
import command from '@app/commands/compose/compose-command';

describe('compose-exec-command', () => {
  const parameters = ['run', '--rm', 'test'];
  const cmd = 'run --rm test';
  const context = faker.createContext();
  const { workspace } = context;
  const chart = workspace.charts[0];
  const services = ['s1', 's2'];
  const profiles = ['p1', 'p2'];

  beforeEach(() => {
    jest.clearAllMocks();
    fs.exists.mockImplementation((p) => p === chart.repo.output);
    jest.spyOn(contextService, 'fetch').mockImplementation(() => context);
    jest.spyOn(composeService, 'exec').mockImplementation(() => Promise.resolve());
  });
  it('execs compose cmd without parameters', async () => {
    await command.run({ cmd: '' });
    expect(composeService.exec).toHaveBeenCalledWith({
      context, services: [], profiles: [], cmd: '', options: { interactive: true },
    });
  });
  it('execs compose cmd for all services', async () => {
    await command.run({ parameters, cmd });
    expect(composeService.exec).toHaveBeenCalledWith({
      context, services: [], profiles: [], cmd, options: { interactive: true },
    });
  });
  it('execs compose cmd for specified services', async () => {
    await command.run({ parameters, services, cmd });
    expect(composeService.exec).toHaveBeenCalledWith({
      context, services, profiles: [], cmd, options: { interactive: true },
    });
  });
  it('execs compose cmd for specified profiles', async () => {
    await command.run({ parameters, profiles, cmd });
    expect(composeService.exec).toHaveBeenCalledWith({
      context, services: [], profiles, cmd, options: { interactive: true },
    });
  });
});
