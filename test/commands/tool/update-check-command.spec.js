/* eslint-disable no-console */
import logger from '@app/helpers/logger';
import versionCheck from '@app/helpers/version-check';
import command from '@app/commands/tool/update-check-command';

versionCheck.mockImplementation(() => Promise.resolve([true, '1.0.0']));

jest.mock('@app/helpers/version-check', () => jest.fn(() => Promise.resolve([false, null])));

describe('view-ls-command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('new version is available', async () => {
    jest.spyOn(logger, 'printBox').mockImplementation(() => { });
    versionCheck.mockImplementation(() => Promise.resolve([true, '1.0.0']));
    await command.run();
    expect(logger.printBox).toHaveBeenCalledWith([
      'There is a new version of @gerdu/cli available (1.0.0).',
      'You are currently using @gerdu/cli 0.0.0',
      'Run `yarn global add @gerdu/cli -g` to get latest version',
    ]);
  });
  it('new version is not available', async () => {
    jest.spyOn(logger, 'printBox').mockImplementation(() => { });
    versionCheck.mockImplementation(() => Promise.resolve([false, '0.0.0']));
    await command.run();
    expect(logger.printBox).toHaveBeenCalledWith([
      'You are running the latest version of @gerdu/cli (0.0.0)',
    ]);
  });
});
