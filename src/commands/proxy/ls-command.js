// @flow
import logger from '@app/helpers/logger';
import type { Chart, Mapping } from '@app/type';
import contextService from '@app/services/context-service';

const lsCommand = () => {
  const context = contextService.fetch();

  const mappings = [];
  context.workspace.charts.forEach((chart: Chart) => {
    chart.mappings.forEach((mapping: Mapping) => {
      mappings.push({
        name: `${chart.name}_${mapping.name}`,
        url: mapping.host,
        path: mapping.path,
        to: `${mapping.service}:${mapping.port}`,
      });
    });
  });

  logger.writeTable(mappings);
};

export default {
  run: lsCommand,
};
