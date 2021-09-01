// @flow
import fs from '@app/helpers/fs';
import path from '@app/helpers/path';
import messages from '@app/messages';
import configSchema from '@app/schema/config-schema';
import type { GerduConfig, GerduConfigWorkspace } from '@app/type';
import {
  GERDU_HOME_DIR_NAME, GERDU_CONFIG_FILE_NAME, GERDU_CACHE_DIR_NAME,
} from '@app/consts';

const defaultConfig: GerduConfig = {
  workspaces: [],
  settings: {},
};

const getGerduHomeDirectory = (): string => path.resolve(path.homedir(), GERDU_HOME_DIR_NAME);
const getGerduConfigFilePath = (): string => path.resolve(path.homedir(), GERDU_HOME_DIR_NAME, GERDU_CONFIG_FILE_NAME);
const getCacheDirectory = (): string => path.resolve(path.homedir(), GERDU_HOME_DIR_NAME, GERDU_CACHE_DIR_NAME);
const initDirectory = () => {
  const directory = getGerduHomeDirectory();
  if (!fs.exists(directory)) fs.mkdir(directory);
};
const initDefault = (value: GerduConfig) => {
  initDirectory();
  const configFilePath = getGerduConfigFilePath();
  if (!fs.exists(configFilePath)) configSchema.set(configFilePath, value);
};
const fetch = (): GerduConfig => {
  initDefault(defaultConfig);
  return configSchema.get(getGerduConfigFilePath());
};
const save = (config: GerduConfig): void => {
  initDirectory();
  configSchema.set(getGerduConfigFilePath(), config);
};
const getWorkspace = (name: string): GerduConfigWorkspace => {
  const config = fetch();
  const workspace = config.workspaces.find((ws: GerduConfigWorkspace) => ws.name === name);
  if (!workspace) { throw new Error(messages.workspaceNotFound(name)); }
  return workspace;
};
const getActiveWorkspace = (): GerduConfigWorkspace => {
  const config = fetch();
  const activeWsName = config.settings.active_workspace;
  if (!activeWsName) { throw new Error(messages.noActiveWorkspaceFound()); }
  const workspace = config.workspaces.find((ws: GerduConfigWorkspace) => ws.name === activeWsName);
  if (!workspace) { throw new Error(messages.workspaceNotFound(activeWsName)); }
  return workspace;
};
export default {
  save,
  fetch,
  getWorkspace,
  defaultConfig,
  getCacheDirectory,
  getActiveWorkspace,
  getGerduHomeDirectory,
  getGerduConfigFilePath,
};
