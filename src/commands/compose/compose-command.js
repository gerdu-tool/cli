// @flow
import logger from '@app/helpers/logger';
import composeService from '@app/services/compose-service';
import contextService from '@app/services/context-service';

type Props = { services?: string[], profiles?: string[], cmd: string }
const composeCommand = async ({ services = [], profiles = [], cmd }: Props) => {
  const { workspace } = contextService.fetch();
  await composeService.exec({
    workspace,
    services,
    profiles,
    cmd,
    options: { interactive: true },
  });
  logger.commandCompleted();
};

export default {
  run: composeCommand,
};
