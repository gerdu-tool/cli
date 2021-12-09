// @flow
import messages from '@app/messages';
import logger from '@app/helpers/logger';
import type { GerduConfigWorkspace } from '@app/type';
import configService from '@app/services/config-service';

const required = (param: string) => { throw new Error(`${param} is required!`); };

type Props={ name: string; }
const switchCommand = ({ name = required('name') }: Props) => {
  const config = configService.fetch();

  const workspace = config.workspaces.find((ws: GerduConfigWorkspace) => ws.name === name);
  if (!workspace) throw new Error(messages.workspaceNotFound(name));

  configService.save({
    ...config,
    settings: {
      ...config.settings,
      active_workspace: name,
    },
  });

  logger.info(`Done, Switched to ${name}`);
};
const suggestCommand = (): string[] => {
  const config = configService.fetch();
  return config.workspaces.map((ws: GerduConfigWorkspace) => ws.name);
};

export default {
  run: switchCommand,
  suggest: suggestCommand,
};
