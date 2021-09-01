// @flow
import path from '@app/helpers/path';
import logger from '@app/helpers/logger';
import type { GerduConfigWorkspace } from '@app/type';
import configService from '@app/services/config-service';

const required = (param: string) => { throw new Error(`${param} is required!`); };

type Props={ name: string; workspacePath: string; }
const addCommand = ({ name = required('name'), workspacePath = required('path') }: Props) => {
  const config = configService.fetch();

  // get the full path of workspace
  const resolvedWorkspacePath = path.resolve(workspacePath);

  // we should ignore duplicated workspace name
  const alreadyExists = config.workspaces.some((ws: GerduConfigWorkspace) => ws.name === name);
  if (alreadyExists) throw new Error('Name already exists!');

  // register workspace
  configService.save({
    ...JSON.parse(JSON.stringify(config)),
    workspaces: [...config.workspaces, { name, path: resolvedWorkspacePath }],
  });

  logger.info('Done');
};

export default {
  run: addCommand,
};
