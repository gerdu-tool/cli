// @flow
import shell from '@app/helpers/shell';

const clone = async (repo: string, destination: string, branch?: string) => {
  if (branch) await shell.exec({ cwd: '.', commands: `git clone ${repo} -b ${branch} ${destination}` });
  else await shell.exec({ cwd: '.', commands: `git clone ${repo} ${destination}` });
};
const pull = async (destination: string) => { await shell.exec({ cwd: destination, commands: 'git pull' }); };
const fetch = async (destination: string) => { await shell.exec({ cwd: destination, commands: 'git fetch' }); };
const getCurrentCommitHash = (path: string): Promise<string> => shell.exec({ cwd: path, commands: 'git rev-parse HEAD' });
const getCurrentBranchName = (path: string): Promise<string> => shell.exec({ cwd: path, commands: 'git rev-parse --abbrev-ref HEAD' });
const checkout = async (branch: string, destination: string) => { await shell.exec({ cwd: destination, commands: `git checkout ${branch}` }); };

export default {
  pull,
  fetch,
  clone,
  checkout,
  getCurrentBranchName,
  getCurrentCommitHash,
};
