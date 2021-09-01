// @flow
import type { Env } from '@app/type';
import { spawn } from 'child_process';
import logger from '@app/helpers/logger';
import { SHELL_CMD } from '@app/consts';

const SPECIAL_KEY = 'ERRORCODE';

type Options= { silent?: boolean; interactive?: boolean };
type Params = {
  cwd: string;
  commands: string | string[];
  env?: Env;
  options?: Options;
};

const isExitedSuccessfully = (data: string) => data.trim().endsWith(`${SPECIAL_KEY}=0`);
const parseOutput = (output: string) => output
  .split('\n')
  .filter((line: string) => !line.includes(SPECIAL_KEY) && line.trim().length > 0)
  .join('\n').trim();

const openSession = (cwd: string, env: Env, options: Options) => {
  const shell = spawn(SHELL_CMD, {
    shell: true,
    cwd,
    env,
  });

  // logger
  if (!options.silent) {
    shell.stdout.on('data', (data: string) => logger.logDebug(parseOutput(data.toString())));
    shell.stderr.on('data', (data: string) => logger.logDebug(parseOutput(data.toString())));
  }

  // apis
  const close = () => shell.stdin.end();
  const exec = (command: string) => new Promise<any>((resolve: any, reject: any) => {
    logger.logShell(command);
    let output = '';
    const onData = (bufferLine: any) => {
      const strLine = bufferLine.toString();
      output += strLine;
      if (strLine.includes(SPECIAL_KEY)) {
        const isSuccess = isExitedSuccessfully(strLine);
        if (isSuccess) resolve(parseOutput(output));
        else {
          reject(parseOutput(output));
          close();
        }
      }
    };
    shell.stdout.on('data', onData);
    shell.stderr.on('data', onData);

    const cmd = `${command} && echo ${SPECIAL_KEY}=$? || echo ${SPECIAL_KEY}=$?`;
    shell.stdin.write(cmd);
    shell.stdin.write('\n');
  });
  return { exec, close };
};

type execManagedParams = {cwd: string; commands: string[]; env: Env; options: Options;};
const execManaged = async ({
  cwd, commands, env, options,
}: execManagedParams): Promise<string> => {
  const session = openSession(cwd, env, options);

  let output = '';
  for (const command of commands) {
    const result = await session.exec(command);
    output += `${parseOutput(result)}\n`;
  }
  session.close();
  return output;
};

type execInteractiveParams = {cwd: string; commands: string[]; env: Env; options: Options;};
const execInteractive = async ({ cwd, commands, env }: execInteractiveParams): Promise<string> => {
  for (const command of commands) {
    logger.logShell(command);
    const args = command.split(' ');
    await spawn(args[0], args.slice(1), {
      cwd,
      env,
      stdio: 'inherit',
      shell: true,
    });
  }
  return '';
};

const defaultOptions: Options = { silent: false, interactive: false };
const exec = ({
  cwd, commands, env = {}, options = {},
}: Params): Promise<string> => {
  const finalOptions = { ...defaultOptions, ...options };
  const finalCommands = Array.isArray(commands) ? commands : [commands];
  const finalEnv = { ...env, ...process.env };
  if (options.interactive) {
    return execInteractive({
      cwd, commands: finalCommands, env: finalEnv, options: finalOptions,
    });
  }
  return execManaged({
    cwd, commands: finalCommands, env: finalEnv, options: finalOptions,
  });
};

export default {
  exec,
};
