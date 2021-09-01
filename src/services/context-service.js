// @flow
import fs from '@app/helpers/fs';
import path from '@app/helpers/path';
import messages from '@app/messages';
import type { Context } from '@app/type';
import configService from '@app/services/config-service';
import { WORKSPACE_CACHE_DIR_NAME, WORKSPACE_CACHE_CONTEXT_FILE_NAME } from '@app/consts';

const fetch = (): Context => {
  const workspace = configService.getActiveWorkspace();
  const contextPath = path.resolve(workspace.path, WORKSPACE_CACHE_DIR_NAME, WORKSPACE_CACHE_CONTEXT_FILE_NAME);
  if (!fs.exists(contextPath)) { throw Error(messages.workspaceIsOutOfSynced(workspace.name)); }

  const context = fs.readAllJson(contextPath);
  return { ...context };
};
const save = (context: Context) => {
  const workspace = configService.getActiveWorkspace();

  const cacheDirPath = path.resolve(workspace.path, WORKSPACE_CACHE_DIR_NAME);
  if (!fs.exists(cacheDirPath)) fs.mkdir(cacheDirPath);

  const contextPath = path.resolve(cacheDirPath, WORKSPACE_CACHE_CONTEXT_FILE_NAME);
  fs.writeAllJson(contextPath, context);
};

export default {
  fetch,
  save,
};
