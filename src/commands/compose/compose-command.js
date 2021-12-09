// @flow
import logger from '@app/helpers/logger';
import composeService from '@app/services/compose-service';
import contextService from '@app/services/context-service';

type Props = { services?: string[], profiles?: string[], cmd: string }
const composeCommand = async ({ services = [], profiles = [], cmd }: Props) => {
  const context = contextService.fetch();
  await composeService.exec({
    cmd,
    context,
    services,
    profiles,
    options: { interactive: true },
  });
  logger.commandCompleted();
};
const suggestCommand = (): string[] => {
  const context = contextService.fetch();
  return context.services;
};

export default {
  run: composeCommand,
  suggest: suggestCommand,
};
