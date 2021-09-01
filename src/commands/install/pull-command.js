// @flow
import fs from '@app/helpers/fs';
import git from '@app/helpers/git';
import path from '@app/helpers/path';
import logger from '@app/helpers/logger';
import type { Workspace, Chart } from '@app/type';
import stageService from '@app/services/stage-service';
import workspaceService from '@app/services/workspace-service';

const pullChart = async ({ workspace, chart }: {workspace: Workspace, chart: Chart}) => {
  if (chart.repo) {
    const { repo } = chart;
    const chartPath = path.resolve(workspace.path, repo.output);

    // check that already cloned or not
    if (!fs.exists(chartPath)) {
      logger.logTask('cloning ...');
      await git.clone(repo.git, chartPath, repo.branch);
    }

    // fetch all other branches
    logger.logTask('fetching ...');
    await git.fetch(chartPath);

    // pull latest code
    logger.logTask('pulling ...');
    await git.pull(chartPath);
  }

  // execute the pull stages
  await stageService.executeStage(workspace, chart.stages, 'pull');
};

const pullCommand = async () => {
  logger.commandStart('Pulling');
  const workspace = workspaceService.fetch();

  let [success, errors] = [0, 0];
  for (const chart of workspace.charts) {
    logger.commandStart(chart.name);
    try {
      await pullChart({ workspace, chart });
      success++;
    } catch (err) {
      logger.error(err);
      errors++;
    }
    logger.commandCompleted();
  }

  logger.commandCompleted();
  logger.info(`Done, Success:${success}, Errors:${errors}`);
};

export default {
  run: pullCommand,
};
