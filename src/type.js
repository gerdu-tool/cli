// @flow

export type KeyValue<K, T> = { [key: K]: T }
export type Env = KeyValue<string, string | any>;
export type Stages = 'pull' | 'sync' | 'setup';

/// ////////////////////////////////////////////
// DOCKER
/// ////////////////////////////////////////////
export type ContainerSpec = {
  Id: string;
  Name: string;
  Config: {
    Hostname: string;
    Domainname: string;
    Image: string;
    Labels: KeyValue<string, string>;
  },
  NetworkSettings: {
    Networks: KeyValue<string, {
      NetworkID: string;
      IPAddress: string;
    }>
  }
}

/// ////////////////////////////////////////////
// WORKSPACE
/// ////////////////////////////////////////////
export type MappingCors = {
  allowMethods: string;
  allowHeaders: string;
  allowOrigins: string;
  allowCredentials: boolean;
}
export type Mapping = {
  name: string;
  host: string;
  port: number;
  path: string;
  host: string;
  service: string;
  cors?: MappingCors;
}
export type Profile = {
  name: string;
  services: Array<string>;
}
export type Stage = {
  stage: Stages;
  script: Array<string>;
}
export type Chart = {
  name: string;
  repo?: {
    git: string;
    branch?: string;
    output: string;
  };
  compose: any;
  stages: Array<Stage>;
  mappings: Array<Mapping>;
};
export type Workspace = {
  name: string;
  path: string;
  compose: any;
  charts: Array<Chart>;
  profiles: Array<Profile>;
}

/// ////////////////////////////////////////////
// CONFIG
/// ////////////////////////////////////////////
export type GerduConfigWorkspace = {
  name: string;
  path: string;
}
export type GerduConfig = {
  workspaces: Array<GerduConfigWorkspace>;
  settings: {
    active_workspace?: string;
  }
}

/// ////////////////////////////////////////////
// Context
/// ////////////////////////////////////////////
export type Context = {
  composeFile: string;
  workspace: Workspace;
  services: Array<string>;
}
