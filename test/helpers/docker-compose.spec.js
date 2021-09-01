/* eslint-disable no-template-curly-in-string */
import shell from '@app/helpers/shell';
import dockerCompose from '@app/helpers/docker-compose';

describe('docker-compose-helper', () => {
  const cwd = './services/service1';
  const env = { V: 'V1' };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(shell, 'exec').mockImplementation(() => Promise.resolve('exec-output'));
  });

  it('executes command', async () => {
    const output = await dockerCompose.exec({ cwd, cmd: 'ps' });
    expect(output).toBe('exec-output');
    expect(shell.exec).toHaveBeenCalledWith({
      commands: 'docker compose --project-directory ./services/service1 ps',
      cwd,
      env: {},
      options: {},
    });
  });
  it('executes command with files', async () => {
    const output = await dockerCompose.exec({
      cwd, cmd: 'ps', files: ['f1.yaml', 'f2.yaml'],
    });
    expect(output).toBe('exec-output');
    expect(shell.exec).toHaveBeenCalledWith({
      commands: 'docker compose --project-directory ./services/service1 -f f1.yaml -f f2.yaml ps',
      cwd,
      env: {},
      options: {},
    });
  });
  it('executes command with services', async () => {
    const output = await dockerCompose.exec({
      cwd, cmd: 'ps', services: ['s1', 's2'],
    });
    expect(output).toBe('exec-output');
    expect(shell.exec).toHaveBeenCalledWith({
      commands: 'docker compose --project-directory ./services/service1 ps s1 s2',
      cwd,
      env: {},
      options: {},
    });
  });
  it('executes command with env', async () => {
    const output = await dockerCompose.exec({
      cwd, env, cmd: 'ps',
    });
    expect(output).toBe('exec-output');
    expect(shell.exec).toHaveBeenCalledWith({
      commands: 'docker compose --project-directory ./services/service1 ps',
      cwd,
      env,
      options: {},
    });
  });
  it('executes interactive command', async () => {
    const output = await dockerCompose.exec({
      cwd, cmd: 'ps', options: { interactive: true },
    });
    expect(output).toBe('exec-output');
    expect(shell.exec).toHaveBeenCalledWith({
      commands: 'docker compose --project-directory ./services/service1 ps',
      cwd,
      env: {},
      options: { interactive: true },
    });
  });
  it('executes slient command', async () => {
    const output = await dockerCompose.exec({
      cwd, cmd: 'ps', options: { silent: true },
    });
    expect(output).toBe('exec-output');
    expect(shell.exec).toHaveBeenCalledWith({
      commands: 'docker compose --project-directory ./services/service1 ps',
      cwd,
      env: {},
      options: { silent: true },
    });
  });
});
