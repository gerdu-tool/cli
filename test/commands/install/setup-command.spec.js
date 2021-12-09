/* eslint-disable no-console */
import faker from '@test/__utils__/faker';
import command from '@app/commands/install/setup-command';
import stageService from '@app/services/stage-service';
import contextService from '@app/services/context-service';

describe('install-setup-command', () => {
  const c1 = faker.createChart({ name: 's1' });
  const c2 = faker.createChart({ name: 's2' });
  const workspace = faker.createWorkspace({ charts: [c1, c2] });
  const context = faker.createContext({ workspace });
  const charts = ['s1'];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(contextService, 'fetch').mockImplementation(() => context);
    jest.spyOn(stageService, 'executeStage').mockImplementation(() => Promise.resolve());
  });

  describe('#run', () => {
    it('executes setup stage scripts', async () => {
      await command.run({});
      expect(stageService.executeStage).toHaveBeenCalledTimes(2);
      expect(stageService.executeStage).toHaveBeenCalledWith(workspace, c1.stages, 'setup');
      expect(stageService.executeStage).toHaveBeenCalledWith(workspace, c2.stages, 'setup');
    });
    it('executes setup stage scripts for specified charts', async () => {
      await command.run({ charts });
      expect(stageService.executeStage).toHaveBeenCalledTimes(1);
      expect(stageService.executeStage).toHaveBeenCalledWith(workspace, c1.stages, 'setup');
    });
  });
  describe('#suggest', () => {
    it('returns suggestion tree', () => {
      expect(command.suggest()).toMatchObject(workspace.charts.map((s) => s.name));
    });
  });
});
