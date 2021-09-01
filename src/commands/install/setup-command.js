// @flow
import type { Chart } from '@app/type';
import logger from '@app/helpers/logger';
import stageService from '@app/services/stage-service';
import contextService from '@app/services/context-service';

type Props = { charts?: string[] }
const setupCommand = async ({ charts = [] }: Props) => {
  logger.commandStart('Setting up');
  const { workspace } = contextService.fetch();

  const theCharts = charts.length === 0
    ? workspace.charts
    : workspace.charts.filter((s: Chart) => charts.indexOf(s.name) !== -1);

  for (const chart of theCharts) {
    logger.commandStart(chart.name);

    await stageService.executeStage(workspace, chart.stages, 'setup');

    logger.commandCompleted();
  }

  logger.commandCompleted();
  logger.info('Done');
};

export default {
  run: setupCommand,
};
