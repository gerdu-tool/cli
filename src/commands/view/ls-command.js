// @flow
import logger from '@app/helpers/logger';
import type { Profile } from '@app/type';
import contextService from '@app/services/context-service';

const lsCommand = () => {
  const context = contextService.fetch();
  const services = context.services.map((s: string) => ({ type: 'service', name: s }));
  const profiles = context.workspace.profiles.map((p: Profile) => ({ type: 'profile', name: p.name }));
  logger.writeTable([...services, ...profiles]);
};

export default {
  run: lsCommand,
};
