import app from '@app/app';
import logger from '@app/helpers/logger';
import { PROXY_SERVICE_NAME } from '@app/consts';
import versionCheck from '@app/helpers/version-check';

// workspace
import workspaceAddCommand from '@app/commands/workspace/add-command';
import workspaceListCommand from '@app/commands/workspace/ls-command';
import workspaceSwitchCommand from '@app/commands/workspace/switch-command';

// setup
import installPullCommand from '@app/commands/install/pull-command';
import installSyncCommand from '@app/commands/install/sync-command';
import installSetupCommand from '@app/commands/install/setup-command';

// view
import viewLsCommand from '@app/commands/view/ls-command';

// Compose
import composeExecCommand from '@app/commands/compose/compose-command';

// proxy
import proxyLsCommand from '@app/commands/proxy/ls-command';
import proxyDnsCommand from '@app/commands/proxy/dns-command';
import switchCommand from '@app/commands/workspace/switch-command';

const mockOmpletteInit = jest.fn();
const mockOmletteTree = jest.fn(() => ({ init: mockOmpletteInit }));
const mockOmletteCleanupShellInitFile = jest.fn();
const mockOmletteSetupShellInitFile = jest.fn();

jest.mock('@app/helpers/version-check', () => jest.fn(() => Promise.resolve([false, null])));
jest.mock('omelette', () => jest.fn(() => ({
  tree: mockOmletteTree,
  cleanupShellInitFile: mockOmletteCleanupShellInitFile,
  setupShellInitFile: mockOmletteSetupShellInitFile,
})));

describe('app', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  it('logs error if invalid action happense', async () => {
    jest.spyOn(logger, 'logError').mockImplementation(() => { });
    jest.spyOn(composeExecCommand, 'run').mockImplementation(() => Promise.reject(Error('error')));
    await app(['node', 'gerdu', 'proxy', 'up']);
    expect(logger.logError).toHaveBeenCalledWith('error');
  });
  it('wont log any error', async () => {
    jest.spyOn(logger, 'logError').mockImplementation(() => { });
    jest.spyOn(composeExecCommand, 'run').mockImplementation(() => Promise.reject(Error('error')));
    await app(['node', 'gerdu', 'proxy']);
    expect(logger.logError).not.toHaveBeenCalledWith('error');
  });
  describe('install', () => {
    it('install services by calling pull/sync/setup', async () => {
      jest.spyOn(installPullCommand, 'run').mockImplementation(() => Promise.resolve());
      jest.spyOn(installSyncCommand, 'run').mockImplementation(() => Promise.resolve());
      jest.spyOn(installSetupCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'install']);
      expect(installPullCommand.run).toHaveBeenCalledWith();
      expect(installSyncCommand.run).toHaveBeenCalledWith();
      expect(installSetupCommand.run).toHaveBeenCalledWith({});
    });
    it('pulls services', async () => {
      jest.spyOn(installPullCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'pull']);
      expect(installPullCommand.run).toHaveBeenCalledWith();
    });
    it('syncs services', async () => {
      jest.spyOn(installSyncCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'sync']);
      expect(installSyncCommand.run).toHaveBeenCalledWith();
    });
    it('setups services', async () => {
      jest.spyOn(installSetupCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'setup']);
      expect(installSetupCommand.run).toHaveBeenCalledWith({ charts: [] });

      await app(['node', 'gerdu', 'setup', 's1', 's2']);
      expect(installSetupCommand.run).toHaveBeenCalledWith({ charts: ['s1', 's2'] });
    });
  });
  describe('compose', () => {
    beforeEach(() => {
      jest.spyOn(composeExecCommand, 'run').mockImplementation(() => Promise.resolve());
    });
    it('starts services', async () => {
      await app(['node', 'gerdu', 'up']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: [], cmd: 'up -d' });

      await app(['node', 'gerdu', 'up', 's1', 's2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: ['s1', 's2'], profiles: [], cmd: 'up -d' });

      await app(['node', 'gerdu', 'up', '-p', 'p1']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1'], cmd: 'up -d' });

      await app(['node', 'gerdu', 'up', '-p', 'p1', 'p2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1', 'p2'], cmd: 'up -d' });
    });
    it('build services', async () => {
      await app(['node', 'gerdu', 'build']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: [], cmd: 'build' });

      await app(['node', 'gerdu', 'build', 's1', 's2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: ['s1', 's2'], profiles: [], cmd: 'build' });

      await app(['node', 'gerdu', 'build', '-p', 'p1']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1'], cmd: 'build' });

      await app(['node', 'gerdu', 'build', '-p', 'p1', 'p2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1', 'p2'], cmd: 'build' });
    });
    it('stops and removes containers, networks', async () => {
      await app(['node', 'gerdu', 'down']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: [], cmd: 'rm -f -s -v' });

      await app(['node', 'gerdu', 'down', 's1', 's2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: ['s1', 's2'], profiles: [], cmd: 'rm -f -s -v' });

      await app(['node', 'gerdu', 'down', '-p', 'p1']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1'], cmd: 'rm -f -s -v' });

      await app(['node', 'gerdu', 'down', '-p', 'p1', 'p2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1', 'p2'], cmd: 'rm -f -s -v' });
    });
    it('stops container', async () => {
      await app(['node', 'gerdu', 'stop']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: [], cmd: 'stop' });

      await app(['node', 'gerdu', 'stop', 's1', 's2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: ['s1', 's2'], profiles: [], cmd: 'stop' });

      await app(['node', 'gerdu', 'stop', '-p', 'p1']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1'], cmd: 'stop' });

      await app(['node', 'gerdu', 'stop', '-p', 'p1', 'p2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1', 'p2'], cmd: 'stop' });
    });
    it('reload container', async () => {
      await app(['node', 'gerdu', 'reload']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: [], cmd: 'rm -f -s -v' });
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: [], cmd: 'up -d' });

      await app(['node', 'gerdu', 'reload', 's1', 's2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: ['s1', 's2'], profiles: [], cmd: 'rm -f -s -v' });
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: ['s1', 's2'], profiles: [], cmd: 'up -d' });

      await app(['node', 'gerdu', 'reload', '-p', 'p1']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1'], cmd: 'rm -f -s -v' });
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1'], cmd: 'up -d' });

      await app(['node', 'gerdu', 'reload', '-p', 'p1', 'p2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1', 'p2'], cmd: 'rm -f -s -v' });
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1', 'p2'], cmd: 'up -d' });
    });
    it('force stops container', async () => {
      await app(['node', 'gerdu', 'kill']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: [], cmd: 'kill' });

      await app(['node', 'gerdu', 'kill', 's1', 's2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: ['s1', 's2'], profiles: [], cmd: 'kill' });

      await app(['node', 'gerdu', 'kill', '-p', 'p1']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1'], cmd: 'kill' });

      await app(['node', 'gerdu', 'kill', '-p', 'p1', 'p2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1', 'p2'], cmd: 'kill' });
    });
    it('displays services logs', async () => {
      await app(['node', 'gerdu', 'logs']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: [], cmd: 'logs -f' });

      await app(['node', 'gerdu', 'logs', 's1', 's2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: ['s1', 's2'], profiles: [], cmd: 'logs -f' });

      await app(['node', 'gerdu', 'logs', '-p', 'p1']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1'], cmd: 'logs -f' });

      await app(['node', 'gerdu', 'logs', '-p', 'p1', 'p2']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [], profiles: ['p1', 'p2'], cmd: 'logs -f' });
    });
    it('list running services', async () => {
      await app(['node', 'gerdu', 'ps']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ cmd: 'ps' });
    });
    it('executes a command into a running service', async () => {
      await app(['node', 'gerdu', 'exec', 'service1', 'sh']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ cmd: 'exec service1 sh' });
    });
    it('creates and exec into on-mode off service', async () => {
      await app(['node', 'gerdu', 'run', '--rm', 'service1', 'sh']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ cmd: 'run --rm service1 sh' });
    });
    it('executes a docker-compose command', async () => {
      jest.spyOn(composeExecCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'compose', 'run', '--rm', 'service1']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ cmd: 'run --rm service1' });
    });
  });
  it('displays services and profiles', async () => {
    jest.spyOn(viewLsCommand, 'run').mockImplementation(() => Promise.resolve());
    await app(['node', 'gerdu', 'ls']);
    expect(viewLsCommand.run).toHaveBeenCalledWith();
  });
  describe('workspace', () => {
    it('registers a new workspace', async () => {
      jest.spyOn(workspaceAddCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'ws', 'add', 'my-dev', './dev/ws1']);
      expect(workspaceAddCommand.run).toHaveBeenCalledWith({
        name: 'my-dev',
        workspacePath: './dev/ws1',
      });
    });
    it('displays registered workspaces', async () => {
      jest.spyOn(workspaceListCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'ws', 'ls']);
      expect(workspaceListCommand.run).toHaveBeenCalledWith();
    });
    it('actives workspace', async () => {
      jest.spyOn(workspaceSwitchCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'ws', 'switch', 'ws1']);
      expect(workspaceSwitchCommand.run).toHaveBeenCalledWith({ name: 'ws1' });
    });
  });
  describe('proxy', () => {
    it('starts proxy service', async () => {
      jest.spyOn(composeExecCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'proxy', 'up']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [PROXY_SERVICE_NAME], profiles: [], cmd: 'up -d' });
    });
    it('stops proxy service', async () => {
      jest.spyOn(composeExecCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'proxy', 'down']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [PROXY_SERVICE_NAME], profiles: [], cmd: 'rm -f -s -v' });
    });
    it('displays proxy service logs', async () => {
      jest.spyOn(composeExecCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'proxy', 'logs']);
      expect(composeExecCommand.run).toHaveBeenCalledWith({ services: [PROXY_SERVICE_NAME], profiles: [], cmd: 'logs -f' });
    });
    it('prints updated dns records', async () => {
      jest.spyOn(proxyDnsCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'proxy', 'dns']);
      expect(proxyDnsCommand.run).toHaveBeenCalledWith({});
    });
    it('writes dns records into hosts file', async () => {
      jest.spyOn(proxyDnsCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'proxy', 'dns', '-w']);
      expect(proxyDnsCommand.run).toHaveBeenCalledWith({ write: true });
    });
    it('list all mappings', async () => {
      jest.spyOn(proxyLsCommand, 'run').mockImplementation(() => Promise.resolve());
      await app(['node', 'gerdu', 'proxy', 'ls']);
      expect(proxyLsCommand.run).toHaveBeenCalledWith();
    });
  });
  it('notify user with new version', async () => {
    jest.spyOn(logger, 'printBox').mockImplementation(() => { });
    jest.spyOn(proxyLsCommand, 'run').mockImplementation(() => { });
    versionCheck.mockImplementation(() => Promise.resolve([true, '1.0.0']));
    await app(['node', 'gerdu', 'proxy', 'ls']);
    expect(versionCheck).toHaveBeenCalled();
    expect(logger.printBox).toHaveBeenCalledWith([
      'There is a new version of @gerdu/cli available (1.0.0).',
      'You are currently using @gerdu/cli 0.0.0',
      'Run `yarn global add @gerdu/cli -g` to get latest version',
    ]);
  });
  it('wont notify user if no new version is available', async () => {
    jest.spyOn(logger, 'printBox').mockImplementation(() => { });
    jest.spyOn(proxyLsCommand, 'run').mockImplementation(() => { });
    versionCheck.mockImplementation(() => Promise.resolve([false]));
    await app(['node', 'gerdu', 'proxy', 'ls']);
    expect(versionCheck).toHaveBeenCalled();
    expect(logger.printBox).not.toHaveBeenCalledWith();
  });
  describe('config', () => {
    describe('completion', () => {
      beforeEach(() => {
        jest.spyOn(switchCommand, 'suggest').mockImplementation(() => { });
        jest.spyOn(composeExecCommand, 'suggest').mockImplementation(() => { });
        jest.spyOn(installSetupCommand, 'suggest').mockImplementation(() => { });
      });

      it('execute suggestions', async () => {
        await app(['node', 'gerdu', 'config', 'completion', 'remove']);
        const tree = mockOmletteTree.mock.calls[0];
        const testTreeRecursive = (childTree) => {
          if (typeof childTree === 'function') {
            expect(() => childTree()).not.toThrow();
          }
          if (typeof childTree === 'object') {
            Object.keys(childTree).forEach((k) => testTreeRecursive(childTree[k]));
          }
        };
        testTreeRecursive(tree);
      });
      it('removes completion setup', async () => {
        await app(['node', 'gerdu', 'config', 'completion', 'remove']);
        expect(mockOmletteCleanupShellInitFile).toHaveBeenCalled();
      });
      it('setup completion setup', async () => {
        await app(['node', 'gerdu', 'config', 'completion', 'setup']);
        expect(mockOmletteSetupShellInitFile).toHaveBeenCalled();
      });
    });
  });
});
