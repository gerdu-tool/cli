// @flow
import type { Env } from '@app/type';
import shell from '@app/helpers/shell';

type executeParams = {
  env?: Env;
  cwd: string;
  cmd: string;
  files?: string[];
  services?: string[];
  options?: { interactive?: boolean; silent?: boolean; }
};
const exec = ({
  cwd, files = [], cmd, env = {}, services = [], options = {},
}: executeParams): Promise<string> => {
  // generate commands
  const command = [
    'docker',
    'compose',
    `--project-directory ${cwd}`,
    files.length === 0 ? '' : `-f ${files.join(' -f ')}`,
    cmd,
    services.join(' '),
  ].filter((p: string) => p.trim().length !== 0).join(' ');

  // execute it
  return shell.exec({
    cwd,
    env,
    options,
    commands: command,
  });
};

export default { exec };
