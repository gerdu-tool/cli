// @flow
import type { Context, Profile } from '@app/type';
import dockerCompose from '@app/helpers/docker-compose';

const getServices = (context: Context, services: string[], profiles: string[]) => [
  ...services,
  ...((profiles && profiles.length !== 0 && context.workspace.profiles
    .filter((p: Profile) => profiles.includes(p.name))
    .reduce((c: string[], p: Profile) => [...c, ...p.services], [])
  ) || []),
];

type Props={
  cmd: string;
  context: Context;
  services?: string[];
  profiles?: string[];
  options?: { interactive?: boolean, silent?: boolean }
};
const exec = async ({
  context, cmd, services = [], profiles = [], options = {},
}: Props): Promise<void> => {
  await dockerCompose.exec({
    cmd,
    cwd: context.workspace.path,
    files: [context.composeFile],
    services: getServices(context, services, profiles),
    options,
  });
};
export default { exec };
