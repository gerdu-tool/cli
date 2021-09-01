// @flow
import logger from '@app/helpers/logger';
import type { GerduConfigWorkspace } from '@app/type';
import configService from '@app/services/config-service';

const lsCommand = () => {
  const config = configService.fetch();
  const data = config.workspaces.map((ws: GerduConfigWorkspace) => ({
    ...ws,
    active: config.settings.active_workspace === ws.name,
  }));
  logger.writeTable(data);
};

export default {
  run: lsCommand,
};
