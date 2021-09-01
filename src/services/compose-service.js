// @flow
import path from '@app/helpers/path';
import type { Workspace, Profile } from '@app/type';
import dockerCompose from '@app/helpers/docker-compose';
import {
  WORKSPACE_CACHE_DIR_NAME, WORKSPACE_COMPOSE_FILE_NAME,
} from '@app/consts';

const getFiles = (workspace: Workspace) => {
  const cacheDirectory = path.resolve(workspace.path, WORKSPACE_CACHE_DIR_NAME);
  return [path.resolve(cacheDirectory, WORKSPACE_COMPOSE_FILE_NAME)];
};
const getServices = (workspace: Workspace, services: string[], profiles: string[]) => [
  ...services,
  ...((profiles && profiles.length !== 0 && workspace.profiles
    .filter((p: Profile) => profiles.includes(p.name))
    .reduce((c: string[], p: Profile) => [...c, ...p.services], [])
  ) || []),
];

type Props={
  cmd: string;
  workspace: Workspace;
  services?: string[];
  profiles?: string[];
  options?: { interactive?: boolean, silent?: boolean }
};
const exec = async ({
  workspace, cmd, services = [], profiles = [], options = {},
}: Props): Promise<void> => {
  await dockerCompose.exec({
    cmd,
    cwd: workspace.path,
    files: getFiles(workspace),
    services: getServices(workspace, services, profiles),
    options,
  });
};
export default { exec };
