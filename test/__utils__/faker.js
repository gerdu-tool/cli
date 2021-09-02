// @flow
import type {
  GerduConfig, GerduConfigWorkspace,
  Workspace, Chart, Context, Profile,
} from '@app/type';

/// ////////////////////////////////////
const createMappingCors = (params: {allowOrigins: string, allowMethods: string, allowCredentials: boolean, allowHeaders: string }) => ({
  allowOrigins: 'ui.gerdu.local',
  allowMethods: 'GET, PUT',
  allowCredentials: true,
  allowHeaders: 'X-H1,X-H2',
  ...params,
});
const createMapping = (params: {name: string, host: string, port: number, service: string, path: string, cors: any} = {}) => ({
  name: 'website',
  host: 'gerdu.local',
  port: 80,
  service: 'service1',
  path: '/',
  cors: createMappingCors(),
  ...params,
});
const createProfile = (params: {name: String, services: string[]} = {}): Profile => ({
  name: 'profile-1',
  services: ['service1', 'service2'],
  ...params,
});
const createStage = (params: { stage: string, script: string[] } = {}) => ({
  stage: 'pull',
  script: ['echo "A"', 'echo "B"'],
  ...params,
});
const createChart = (params: { name: string, repo: { git: string, branch: string, out: string }, spec: string, compose: any, stages: any[], mappings: any[] } = {}): Chart => ({
  name: 'ws1',
  repo: {
    git: 'git@git:gerdu/cli.git',
    branch: 'master',
    output: 'cli',
  },
  compose: {
    version: '1.0',
    services: {
      service1: {},
      service2: {},
    },
  },
  stages: [createStage()],
  mappings: [createMapping()],
  ...params,
});
const createWorkspace = (params: { name: string, charts: Chart[], profiles: any[], compose: any } = {}): Workspace => ({
  name: 'ws-1',
  path: './workspaces/ws-1',
  charts: [createChart()],
  profiles: [createProfile()],
  compose: {
    version: '1.0',
    services: {
      service1: { override: true },
    },
  },
  ...params,
});
/// ////////////////////////////////////
const createGerduConfigWorkspace = (params: { name: string, path: string } = {}): GerduConfigWorkspace => ({
  name: 'ws-1',
  path: './workspaces/ws-1',
  ...params,
});
const createGerduConfig = (params: {settings: any, workspaces: GerduConfigWorkspace[] } = {}): GerduConfig => ({
  workspaces: [createGerduConfigWorkspace()],
  settings: {},
  ...params,
});
/// ////////////////////////////////////
const createContext = (params: {workspace: Workspace, services: string[], composeFile: string} = {}): Context => ({
  workspace: createWorkspace(),
  services: ['service1', 'service2'],
  composeFile: './workspace/ws-1/docker-compose.yaml',
  ...params,
});
export default {
  createGerduConfig,
  createGerduConfigWorkspace,

  createChart,
  createStage,
  createProfile,
  createMapping,
  createMappingCors,

  createWorkspace,

  createContext,
};
