// @flow
import { TOOL_NAME } from '@app/consts';

// schema
const schemaPropMissing = (file: string, prop: string): string => `${file}: Invalid schema file! "${prop}" is missing!`;
const schemaParseError = (path: string): string => `${path}: Invalid schema file! it should be YAML.`;

// Config
const noActiveWorkspaceFound = (): string => `No active workspace found! use '${TOOL_NAME} ws switch <name>'`;

// Workspaces
const workspaceNotFound = (name: string): string => `${name}: Workspace not found!`;
const workspaceIsOutOfSynced = (name: string): string => `${name}: Workspace is out of sync!`;

// Chart
const mappingChartNotFound = (service: string, mapping: string): string => `${service}.${mapping}: Mapping service not found!`;

export default {

  // schema
  schemaPropMissing,
  schemaParseError,

  // Config
  noActiveWorkspaceFound,

  // workspace
  workspaceNotFound,
  workspaceIsOutOfSynced,

  // Chart
  mappingChartNotFound,

};
