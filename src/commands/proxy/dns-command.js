// @flow
import logger from '@app/helpers/logger';
import hostFile from '@app/helpers/host-file';
import type { Chart, Mapping } from '@app/type';
import contextService from '@app/services/context-service';

const dnsCommand = () => {
  const context = contextService.fetch();

  const records = [];
  context.workspace.charts.forEach((chart: Chart) => {
    chart.mappings.forEach((mapping: Mapping) => {
      if (records.indexOf(mapping.host) === -1) records.push(mapping.host);
    });
  });

  const result = hostFile.generateHostsRecords(records, context.workspace.name);
  logger.write(result);
};

export default {
  run: dnsCommand,
};
