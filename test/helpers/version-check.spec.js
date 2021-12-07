/* eslint-disable no-console */
import https from 'https';
import packageJson from '@root/package.json';
import versionCheck from '@app/helpers/version-check';

describe('version-check', () => {
  const availableVersion = '1.0.0';
  const genReply = (v) => ({
    collected: {
      metadata: {
        version: v,
      },
    },
  });

  const onData = jest.fn();
  const onEnd = jest.fn();
  const onError = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(https, 'get').mockImplementation((url, cb) => {
      cb({
        on: (key, onCb) => {
          if (key === 'data') onData(onCb);
          if (key === 'end') onEnd(onCb);
        },
      });
      return {
        on: (key, onCb) => {
          if (key === 'error') onError(onCb);
        },
      };
    });
  });

  it('notify user with new version', async () => {
    onData.mockImplementation((cb) => cb(Buffer.from(JSON.stringify(genReply(availableVersion)), 'utf8')));
    onEnd.mockImplementation((cb) => cb());
    await versionCheck();
    expect(https.get).toHaveBeenCalledWith('https://api.npms.io/v2/package/%40gerdu%2Fcli', expect.any(Function));

    expect(console.log).toHaveBeenCalledWith([
      '╭───────────────────────────────────────────────────────────╮',
      `│ There is a new version of @gerdu/cli available (${availableVersion}).   │`,
      `│ You are currently using @gerdu/cli ${packageJson.version}                  │`,
      '│ Run `yarn global add @gerdu/cli -g` to get latest version │',
      '╰───────────────────────────────────────────────────────────╯',
    ].join('\n'));
  });
  it('wont notify user if no new version available', async () => {
    onData.mockImplementation((cb) => cb(Buffer.from(JSON.stringify(genReply(packageJson.version)), 'utf8')));
    onEnd.mockImplementation((cb) => cb());
    await versionCheck();
    expect(https.get).toHaveBeenCalledWith('https://api.npms.io/v2/package/%40gerdu%2Fcli', expect.any(Function));
    expect(console.log).not.toHaveBeenCalled();
  });
  it('ignores for invalid response', async () => {
    onData.mockImplementation((cb) => cb(Buffer.from(JSON.stringify({ collected: {} }), 'utf8')));
    onEnd.mockImplementation((cb) => cb());
    await versionCheck();
    expect(console.log).not.toHaveBeenCalled();
  });
  it('ignores any error', async () => {
    onData.mockImplementation((cb) => cb(Buffer.from(JSON.stringify(genReply(packageJson.version)), 'utf8')));
    onError.mockImplementation((cb) => cb());
    await expect(() => versionCheck()).not.toThrow();
  });
});
