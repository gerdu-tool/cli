// @flow
import fs from '@app/helpers/fs';
import logger from '@app/helpers/logger';
import hostFile from '@app/helpers/host-file';
import type { Chart, Mapping } from '@app/type';
import contextService from '@app/services/context-service';
import { HOST_FILE } from '@app/consts';

type Props = { write?: boolean, }
const dnsCommand = ({ write = false }: Props) => {
  const context = contextService.fetch();

  const records = [];
  context.workspace.charts.forEach((chart: Chart) => {
    chart.mappings.forEach((mapping: Mapping) => {
      if (records.indexOf(mapping.host) === -1) records.push(mapping.host);
    });
  });

  const result = hostFile.generateHostsRecords(records, context.workspace.name);

  if (!write) {
    logger.write(result);
  } else {
    fs.writeAllText(HOST_FILE, result);
    logger.info('Done');
  }
};

export default {
  run: dnsCommand,
};
