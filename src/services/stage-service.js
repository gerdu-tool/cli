// @flow
import shell from '@app/helpers/shell';
import logger from '@app/helpers/logger';
import type { Workspace, Stage, Stages } from '@app/type';

const executeStage = async (workspace: Workspace, stages: Stage[], stage: Stages) => {
  const foundStages = stages.filter((s: Stage) => s.stage === stage);
  for (const foundStage of foundStages) {
    logger.logTask(`executing ${stage} scripts ...`);
    await shell.exec({
      cwd: workspace.path,
      commands: foundStage.script,
      options: {
        silent: false,
      },
    });
  }
};

export default {
  executeStage,
};
