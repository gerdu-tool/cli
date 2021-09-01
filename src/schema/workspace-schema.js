// @flow
import fs from '@app/helpers/fs';
import path from '@app/helpers/path';
import messages from '@app/messages';
import chartSchema from './chart-schema';
import type { Workspace } from '@app/type';

const missingPropError = (file: string, prop: string) => { throw Error(messages.schemaPropMissing(file, prop)); };

const get = (file: string): Workspace => {
  const workspaceFilePath = path.resolve(file);
  const config = fs.readAllYaml(workspaceFilePath);
  if (!config) throw Error(messages.schemaParseError(workspaceFilePath));

  return {
    path: path.dirname(workspaceFilePath),
    name: config.name || missingPropError(workspaceFilePath, 'name'),
    compose: config.compose || { version: '3.9' },
    charts: (config.charts || []).map((chartFileName: string) => chartSchema.get(path.resolve(path.dirname(workspaceFilePath), chartFileName))),
    profiles: Object.entries((config.profiles || {}))
      .map(([key, services]: [string, any]) => ({ name: (key: any), services: (services || []) })),
  };
};

export default { get };
