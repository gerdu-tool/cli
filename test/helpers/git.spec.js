import git from '@app/helpers/git';
import shell from '@app/helpers/shell';

describe('git', () => {
  const repo = 'git@test.git';
  const branch = 'main';
  const destination = './test';
  beforeEach(() => {
    jest.spyOn(shell, 'exec').mockImplementation(() => Promise.resolve('success'));
  });
  it('clones the repository', async () => {
    await git.clone(repo, destination, branch);
    expect(shell.exec).toHaveBeenCalledWith({ cwd: '.', commands: `git clone ${repo} -b ${branch} ${destination}` });
  });
  it('clones the repository by branch', async () => {
    await git.clone(repo, destination);
    expect(shell.exec).toHaveBeenCalledWith({ cwd: '.', commands: `git clone ${repo} ${destination}` });
  });
  it('checkouts the repository', async () => {
    await git.checkout(branch, destination);
    expect(shell.exec).toHaveBeenCalledWith({ cwd: destination, commands: `git checkout ${branch}` });
  });
  it('fetchs objects and refs', async () => {
    await git.fetch(destination);
    expect(shell.exec).toHaveBeenCalledWith({ cwd: destination, commands: 'git fetch' });
  });
  it('pulls the latest code', async () => {
    await git.pull(destination);
    expect(shell.exec).toHaveBeenCalledWith({ cwd: destination, commands: 'git pull' });
  });
  it('returns the current branch name', async () => {
    shell.exec.mockImplementation(() => 'main');
    const result = await git.getCurrentBranchName(destination);
    expect(shell.exec).toHaveBeenCalledWith({ cwd: destination, commands: 'git rev-parse --abbrev-ref HEAD' });
    expect(result).toBe('main');
  });
  it('returns the head commit hash', async () => {
    shell.exec.mockImplementation(() => 'd6788ss');
    const result = await git.getCurrentCommitHash(destination);
    expect(shell.exec).toHaveBeenCalledWith({ cwd: destination, commands: 'git rev-parse HEAD' });
    expect(result).toBe('d6788ss');
  });
});
