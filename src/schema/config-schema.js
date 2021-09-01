// @flow
import fs from '@app/helpers/fs';
import messages from '@app/messages';
import type { GerduConfig } from '@app/type';

const missingPropError = (file: string, prop: string) => { throw Error(messages.schemaPropMissing(file, prop)); };

const set = (file: string, config: GerduConfig): void => fs.writeAllYaml(file, config);
const get = (file: string): GerduConfig => {
  const config = fs.readAllYaml(file);
  if (!config) throw Error(messages.schemaParseError(file));

  return {
    workspaces: (config.workspaces || []).map((workspace: any) => ({
      name: workspace.name || missingPropError(file, 'workspace.name'),
      path: workspace.path || missingPropError(file, 'workspace.path'),
    })),
    settings: config.settings || {},
  };
};

export default { get, set };
