import shell from '@app/helpers/shell';
import faker from '@test/__utils__/faker';
import stageService from '@app/services/stage-service';

describe('stage-service', () => {
  const stage1 = faker.createStage({ stage: 'pull', script: ['A1', 'A2'] });
  const stage2 = faker.createStage({ stage: 'pull', script: ['B1', 'B2'] });
  const stage3 = faker.createStage({ stage: 'invalid', script: ['C1', 'C2'] });
  const chart = faker.createChart({ stages: [stage1, stage2, stage3] });
  const workspace = faker.createWorkspace({ charts: [chart] });

  beforeEach(() => {
    jest.spyOn(shell, 'exec').mockImplementation(() => Promise.resolve());
  });

  it('execute stage script', async () => {
    await stageService.executeStage(workspace, chart.stages, 'pull');
    expect(shell.exec).toHaveBeenCalledTimes(2);
    expect(shell.exec).toHaveBeenCalledWith({
      cwd: workspace.path,
      commands: stage1.script,
      options: {
        silent: false,
      },
    });
    expect(shell.exec).toHaveBeenCalledWith({
      cwd: workspace.path,
      commands: stage2.script,
      options: {
        silent: false,
      },
    });
  });
});
