// @flow
import fs from '@app/helpers/fs';
import path from '@app/helpers/path';
import messages from '@app/messages';
import type { Chart } from '@app/type';

const missingPropError = (file: string, prop: string) => { throw Error(messages.schemaPropMissing(file, prop)); };
const arrayAsString = (value: any) => {
  if (!value) return null;
  if (Array.isArray(value)) return value.join(',');
  if (typeof (value) === 'string') return value;
  return Object.keys(value).join(',');
};

const get = (file: string): Chart => {
  const chartFilePath = path.resolve(file);
  const config = fs.readAllYaml(chartFilePath);
  if (!config) throw Error(messages.schemaParseError(chartFilePath));

  return {
    name: config.name || missingPropError(chartFilePath, 'chart.name'),
    repo: (config.repo && {
      branch: config.repo.branch,
      output: config.repo.output || config.name,
      git: config.repo.git || missingPropError(chartFilePath, 'chart.repo.git'),
    }) || false,
    compose: config.compose || { version: '3.9' },
    stages: Object.entries((config.stages || {}))
      .map(([key, script]: [string, any]) => ({ stage: (key: any), script: (script || []) })),
    mappings: Object.entries((config.mappings || {})).map(([key, mapping]: [string, any]) => ({
      name: (key: any),
      host: mapping.host || missingPropError(chartFilePath, 'chart.mapping.host'),
      port: mapping.port || missingPropError(chartFilePath, 'chart.mapping.port'),
      path: mapping.path || '/',
      service: mapping.service || missingPropError(chartFilePath, 'chart.mapping.service'),
      cors: (mapping.cors && {
        allowCredentials: mapping.cors.allowCredentials || false,
        allowOrigins: arrayAsString(mapping.cors.allowOrigins) || '*',
        allowHeaders: arrayAsString(mapping.cors.allowHeaders) || 'Content-Type,Authorization',
        allowMethods: arrayAsString(mapping.cors.allowMethods) || 'GET,PUT,POST,PATCH,DELETE,OPTIONS',
      }) || false,
    })),
  };
};

export default { get };
