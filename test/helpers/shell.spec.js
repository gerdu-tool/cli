import EventEmitter from 'events';
import shell from '@app/helpers/shell';
import { SHELL_CMD } from '@app/consts';
import logger from '@app/helpers/logger';
import child, { spawn } from 'child_process';

const mocker = () => {
  const session = ({
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    stdin: {
      write: jest.fn(),
      end: jest.fn(),
    },
  });
  jest.spyOn(child, 'spawn').mockImplementation(() => session);

  return {
    session,
    stdout_data: (msg) => session.stdout.emit('data', `${msg}\n`),
    stderr_data: (msg) => session.stderr.emit('data', `${msg}`),
    exit: (exitCode) => session.stdout.emit('data', `\nERRORCODE=${exitCode}`),
  };
};

describe('shell', () => {
  const ENDKEY = 'ERRORCODE=$?';
  const env = { MD_VALUE: 'MD_1', ...process.env };
  const cwd = './';
  const cmd1 = 'ls -a';
  const cmd2 = 'echo "hi"';
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(logger, 'logDebug').mockImplementation(() => {});
    jest.spyOn(logger, 'logError').mockImplementation(() => {});
    jest.spyOn(logger, 'logSuccess').mockImplementation(() => {});
    jest.spyOn(logger, 'logWarning').mockImplementation(() => {});
  });
  describe('exec', () => {
    it('execute success single command', async () => {
      const mock = mocker();
      const promise = shell.exec({ cwd, commands: cmd1, env });
      expect(spawn).toHaveBeenCalledWith(SHELL_CMD, { shell: true, cwd, env });
      expect(mock.session.stdin.write).toHaveBeenNthCalledWith(1, `${cmd1} && echo ${ENDKEY} || echo ${ENDKEY}`);
      expect(mock.session.stdin.write).toHaveBeenNthCalledWith(2, '\n');
      mock.exit(0);
      await promise;

      expect(mock.session.stdin.end).toHaveBeenCalledTimes(1);
    });
    it('execute multiple commands', async () => {
      const mock = mocker();
      const promise = shell.exec({ cwd, commands: [cmd1, cmd2], env });
      expect(spawn).toHaveBeenCalledWith(SHELL_CMD, { shell: true, cwd, env });
      expect(mock.session.stdin.write).toHaveBeenNthCalledWith(1, `${cmd1} && echo ${ENDKEY} || echo ${ENDKEY}`);
      expect(mock.session.stdin.write).toHaveBeenNthCalledWith(2, '\n');
      mock.exit(0);

      await Promise.resolve(); // very small tick

      expect(mock.session.stdin.write).toHaveBeenNthCalledWith(3, `${cmd2} && echo ${ENDKEY} || echo ${ENDKEY}`);
      expect(mock.session.stdin.write).toHaveBeenNthCalledWith(4, '\n');
      mock.exit(0);

      await promise;

      expect(mock.session.stdin.end).toHaveBeenCalledTimes(1);
    });
    it('throws on error', async () => {
      const mock = mocker();
      const promise = shell.exec({ cwd, commands: cmd1, env });
      expect(spawn).toHaveBeenCalledWith(SHELL_CMD, { shell: true, cwd, env });
      expect(mock.session.stdin.write).toHaveBeenNthCalledWith(1, `${cmd1} && echo ${ENDKEY} || echo ${ENDKEY}`);
      expect(mock.session.stdin.write).toHaveBeenNthCalledWith(2, '\n');
      mock.stderr_data('An error occured');
      mock.exit(2);
      await expect(promise).rejects.toBe('An error occured');
      expect(mock.session.stdin.end).toHaveBeenCalledTimes(1);
    });
    it('returns single command output', async () => {
      const mock = mocker();
      const promise = shell.exec({ cwd, commands: cmd1, env });
      mock.stdout_data('Sample-1');
      mock.stdout_data('Sample-2');
      mock.exit(0);
      const reuslt = await promise;
      expect(reuslt).toBe('Sample-1\nSample-2\n');
    });
    it('logs stdout', async () => {
      const mock = mocker();
      const promise = shell.exec({
        cwd, commands: cmd1, env, options: { silent: false },
      });
      mock.stdout_data('Sample-1');
      mock.stdout_data('Sample-2');
      mock.exit(0);
      await promise;
      expect(logger.logDebug).toHaveBeenCalledWith('Sample-1');
      expect(logger.logDebug).toHaveBeenCalledWith('Sample-2');
    });
    it('logs stderr', async () => {
      const mock = mocker();
      const promise = shell.exec({
        cwd, commands: cmd1, env, options: { silent: false },
      });
      mock.stderr_data('An error occured');
      mock.exit(0);
      await promise.catch(() => {});
      expect(logger.logDebug).toHaveBeenCalledWith('An error occured');
    });
    it('DOES NOT logs stderr/stdout if its silent', async () => {
      const mock = mocker();
      const promise = shell.exec({
        cwd, commands: cmd1, env, options: { silent: true },
      });
      mock.stderr_data('An error occured');
      mock.stdout_data('A log');
      mock.exit(0);
      await promise.catch(() => {});
      expect(global.console.log).not.toHaveBeenCalled();
    });
    it('use empty env', async () => {
      const mock = mocker();
      const promise = shell.exec({ cwd, commands: cmd1 });
      expect(spawn).toHaveBeenCalledWith(SHELL_CMD, { shell: true, cwd, env: process.env });
      expect(mock.session.stdin.write).toHaveBeenNthCalledWith(1, `${cmd1} && echo ${ENDKEY} || echo ${ENDKEY}`);
      expect(mock.session.stdin.write).toHaveBeenNthCalledWith(2, '\n');
      mock.exit(0);
      await promise;

      expect(mock.session.stdin.end).toHaveBeenCalledTimes(1);
    });
    it('execute interactive command', async () => {
      const promise = shell.exec({
        cwd, commands: cmd1, env, options: { interactive: true },
      });
      expect(spawn).toHaveBeenCalledWith('ls', ['-a'], {
        shell: true, cwd, env, stdio: 'inherit',
      });
      await promise;
    });
  });
  // describe('execit', () => {
  //   it('execute interactive command', async () => {
  //     const promise = shell.execit({ cwd, command: cmd1, env });
  //     expect(spawn).toHaveBeenCalledWith('ls', ['-a'], {
  //       shell: true, cwd, env, stdio: 'inherit',
  //     });
  //     await promise;
  //   });
  //   it('use empty env', async () => {
  //     const promise = shell.execit({ cwd, command: cmd1 });
  //     expect(spawn).toHaveBeenCalledWith('ls', ['-a'], {
  //       shell: true, env: process.env, cwd, stdio: 'inherit',
  //     });
  //     await promise;
  //   });
  // });
});
