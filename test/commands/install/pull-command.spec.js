/* eslint-disable no-console */
import fs from '@app/helpers/fs';
import git from '@app/helpers/git';
import path from '@app/helpers/path';
import faker from '@test/__utils__/faker';
import command from '@app/commands/install/pull-command';
import stageService from '@app/services/stage-service';
import workspaceService from '@app/services/workspace-service';

describe('install-pull-command', () => {
  const workspace = faker.createWorkspace();
  const chart = workspace.charts[0];
  const chartPath = path.resolve(workspace.path, chart.repo.output);

  beforeEach(() => {
    jest.clearAllMocks();
    fs.exists.mockImplementation((p) => p === chart.repo.output);
    jest.spyOn(workspaceService, 'fetch').mockImplementation(() => workspace);
    jest.spyOn(git, 'clone').mockImplementation(() => Promise.resolve());
    jest.spyOn(git, 'fetch').mockImplementation(() => Promise.resolve());
    jest.spyOn(git, 'pull').mockImplementation(() => Promise.resolve());
    jest.spyOn(stageService, 'executeStage').mockImplementation(() => Promise.resolve());
  });
  it('pull all active workspace charts', async () => {
    await command.run();
    expect(git.clone).toHaveBeenCalledWith(chart.repo.git, chartPath, chart.repo.branch);
    expect(git.fetch).toHaveBeenCalledWith(chartPath);
    expect(git.pull).toHaveBeenCalledWith(chartPath);
  });
  it('wont pull all active workspace charts if repo is false', async () => {
    const ws = faker.createWorkspace({
      charts: [
        faker.createChart({ repo: false }),
      ],
    });
    jest.spyOn(workspaceService, 'fetch').mockImplementation(() => ws);
    await command.run();
    expect(git.clone).not.toHaveBeenCalledWith(chart.repo.git, chartPath, chart.repo.branch);
    expect(git.fetch).not.toHaveBeenCalledWith(chartPath);
    expect(git.pull).not.toHaveBeenCalledWith(chartPath);
  });
  it('wont clone chart if already exists', async () => {
    fs.exists.mockImplementation((p) => p === chartPath);
    await command.run();
    expect(git.clone).not.toHaveBeenCalled();
    expect(git.fetch).toHaveBeenCalledWith(chartPath);
    expect(git.pull).toHaveBeenCalledWith(chartPath);
  });
  it('executes stage scripts', async () => {
    fs.exists.mockImplementation((p) => p === chartPath);
    await command.run();
    expect(stageService.executeStage).toHaveBeenCalledWith(
      workspace,
      chart.stages,
      'pull',
    );
  });
  it('continue if one chart failed', async () => {
    const localWorkspace = faker.createWorkspace({
      charts: [
        faker.createChart(),
        faker.createChart(),
      ],
    });
    jest.spyOn(workspaceService, 'fetch').mockImplementation(() => localWorkspace);
    fs.exists.mockImplementation((p) => p === chartPath);
    jest.spyOn(stageService, 'executeStage').mockImplementationOnce(() => Promise.reject());
    jest.spyOn(stageService, 'executeStage').mockImplementation(() => Promise.resolve());
    await command.run();
    expect(stageService.executeStage).toHaveBeenCalledWith(
      localWorkspace,
      chart.stages,
      'pull',
    );
  });
});
