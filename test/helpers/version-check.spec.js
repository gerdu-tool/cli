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

  it('returns true, if new version is available', async () => {
    onData.mockImplementation((cb) => cb(Buffer.from(JSON.stringify(genReply(availableVersion)), 'utf8')));
    onEnd.mockImplementation((cb) => cb());
    const [isAvailable, version] = await versionCheck();
    expect(https.get).toHaveBeenCalledWith('https://api.npms.io/v2/package/%40gerdu%2Fcli', expect.any(Function));
    expect(isAvailable).toBeTruthy();
    expect(version).toBe(availableVersion);

    // expect(console.log).toHaveBeenCalledWith([
    //   '╭───────────────────────────────────────────────────────────╮',
    //   `│ There is a new version of @gerdu/cli available (${availableVersion}).   │`,
    //   `│ You are currently using @gerdu/cli ${packageJson.version}                  │`,
    //   '│ Run `yarn global add @gerdu/cli -g` to get latest version │',
    //   '╰───────────────────────────────────────────────────────────╯',
    // ].join('\n'));
  });
  it('returns false, if no new version available', async () => {
    onData.mockImplementation((cb) => cb(Buffer.from(JSON.stringify(genReply(packageJson.version)), 'utf8')));
    onEnd.mockImplementation((cb) => cb());
    const [isAvailable, version] = await versionCheck();
    expect(https.get).toHaveBeenCalledWith('https://api.npms.io/v2/package/%40gerdu%2Fcli', expect.any(Function));
    expect(isAvailable).toBeFalsy();
    expect(version).toBe(null);
  });
  it('returns false, for invalid response', async () => {
    onData.mockImplementation((cb) => cb(Buffer.from(JSON.stringify({ collected: {} }), 'utf8')));
    onEnd.mockImplementation((cb) => cb());
    const [isAvailable] = await versionCheck();
    expect(isAvailable).toBeFalsy();
  });
  it('ignores any error', async () => {
    onData.mockImplementation((cb) => cb(Buffer.from(JSON.stringify(genReply(packageJson.version)), 'utf8')));
    onError.mockImplementation((cb) => cb());
    await expect(() => versionCheck()).not.toThrow();
  });
});
