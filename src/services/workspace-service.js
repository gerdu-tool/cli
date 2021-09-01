// @flow
import path from '@app/helpers/path';
import type { Workspace } from '@app/type';
import configService from '@app/services/config-service';
import workspaceSchema from '@app/schema/workspace-schema';
import { WORKSPACE_CONFIG_FILE_NAME } from '@app/consts';

const fetch = (name?: string): Workspace => {
  const workspaceSpec = name
    ? configService.getWorkspace(name)
    : configService.getActiveWorkspace();

  const workspacePath = path.resolve(workspaceSpec.path, WORKSPACE_CONFIG_FILE_NAME);
  return workspaceSchema.get(workspacePath);
};

export default {
  fetch,
};
