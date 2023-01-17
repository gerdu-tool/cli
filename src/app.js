// @flow
import logger from '@app/helpers/logger';

import cli from '@app/helpers/cli';

// $FlowFixMe
import packageJson from '@root/package.json';
import { TOOL_NAME, PROXY_SERVICE_NAME } from '@app/consts';

// Workspace
import lsWorkspaceCommand from '@app/commands/workspace/ls-command';
import addWorkspaceCommand from '@app/commands/workspace/add-command';
import switchWorkspaceCommand from '@app/commands/workspace/switch-command';

// install
import pullInstallCommand from '@app/commands/install/pull-command';
import syncInstallCommand from '@app/commands/install/sync-command';
import setupInstallCommand from '@app/commands/install/setup-command';

// view
import lsViewCommand from '@app/commands/view/ls-command';

// compose
import composeExecCommand from '@app/commands/compose/compose-command';

// proxy
import proxyLsCommand from '@app/commands/proxy/ls-command';
import proxyDnsCommand from '@app/commands/proxy/dns-command';

// tool
import updateCheckCommand from '@app/commands/tool/update-check-command';

const app = async (argv: any): Promise<void> => {
  const commander = cli(TOOL_NAME);
  // we need to handle exit code manually

  commander.version(packageJson.version)
    .name(TOOL_NAME)
    .description('Define and manage micro services with docker for development');

  // workspace
  {
    const wsCommand = commander.command('ws').description('manage workspaces').complete('ws');
    wsCommand.command('add <name> <path>')
      .description('adds an existing workspace')
      .complete('add')
      .action((name: string, workspacePath: string) => addWorkspaceCommand.run({ name, workspacePath }));

    wsCommand.command('ls')
      .description('lists all workspaces')
      .complete('ls')
      .action(() => lsWorkspaceCommand.run());
    wsCommand.command('switch <name>')
      .description('switchs to workspace')
      .complete('switch', () => switchWorkspaceCommand.suggest())
      .action((name: string) => switchWorkspaceCommand.run({ name }));
  }

  // setup
  {
    commander.command('install')
      .description('installs charts')
      .complete('install')
      .action(async () => {
        await pullInstallCommand.run();
        await syncInstallCommand.run();
        await setupInstallCommand.run({});
      });
    commander.command('pull')
      .description('pulls charts')
      .complete('pull')
      .action(() => pullInstallCommand.run());
    commander.command('sync')
      .description('syncs charts')
      .complete('sync')
      .action(() => syncInstallCommand.run());
    commander.command('setup [charts...]')
      .description('setups charts or services')
      .complete('setup', () => setupInstallCommand.suggest())
      .action((charts: string[]) => setupInstallCommand.run({ charts }));
  }

  // compose
  {
    const composeCommand = commander.option('-p, --profile <profiles...>', 'enable profile');
    composeCommand.command('build [services...]')
      .description('builds or rebuilds services')
      .option('-p, --profile <profiles...>', 'enable profile')
      .complete('build', () => composeExecCommand.suggest())
      .action((services: string[]) => composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'build' }));

    composeCommand.command('up [services...]')
      .description('starts services')
      .option('-p, --profile <profiles...>', 'enable profile')
      .complete('up', () => composeExecCommand.suggest())
      .action((services: string[]) => composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'up -d' }));

    composeCommand.command('down [services...]')
      .description('stops and removes containers, networks')
      .option('-p, --profile <profiles...>', 'enable profile')
      .complete('down', () => composeExecCommand.suggest())
      .action((services: string[]) => composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'rm -f -s -v' }));

    composeCommand.command('reload [services...]')
      .description('stops and resstarts containers')
      .option('-p, --profile <profiles...>', 'enable profile')
      .complete('reload', () => composeExecCommand.suggest())
      .action(async (services: string[]) => {
        await composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'rm -f -s -v' });
        await composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'up -d' });
      });

    composeCommand.command('logs [services...]')
      .description('displays services logs')
      .option('-p, --profile <profiles...>', 'enable profile')
      .complete('logs', () => composeExecCommand.suggest())
      .action((services: string[]) => composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'logs -f' }));

    composeCommand.command('stop [services...]')
      .description('stops services')
      .option('-p, --profile <profiles...>', 'enable profile')
      .complete('stop', () => composeExecCommand.suggest())
      .action((services: string[]) => composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'stop' }));

    composeCommand.command('kill [services...]')
      .description('force stops services')
      .option('-p, --profile <profiles...>', 'enable profile')
      .complete('kill', () => composeExecCommand.suggest())
      .action((services: string[]) => composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'kill' }));

    commander.command('ps')
      .description('lists running containers')
      .complete('ps', () => composeExecCommand.suggest())
      .action(() => composeExecCommand.run({ cmd: 'ps' }));

    commander.command('exec <service> <args...>')
      .allowUnknownOption()
      .description('executes a command in a running service')
      .complete('exec', () => composeExecCommand.suggest())
      .action((service: string) => composeExecCommand.run({ cmd: `exec ${service} ${commander.args().slice(2).join(' ')}` }));

    commander.command('run <service> <args...>')
      .allowUnknownOption()
      .description('run a one-off command')
      .complete('run', () => composeExecCommand.suggest())
      .action((service: string) => composeExecCommand.run({ cmd: `run ${service} ${commander.args().slice(2).join(' ')}` }));

    commander.command('compose <args...>')
      .allowUnknownOption()
      .description('docker compose alias')
      .complete('compoase')
      .action(() => composeExecCommand.run({ cmd: commander.args().slice(1).join(' ') }));
  }

  // view
  {
    commander.command('ls')
      .description('lists services and profiles')
      .complete('ls')
      .action(() => lsViewCommand.run());
  }

  // Proxy
  {
    const proxyCommand = commander.command('proxy').description('manage proxy service').complete('proxy');
    proxyCommand.command('up')
      .description('starts proxy service')
      .complete('up')
      .action(() => composeExecCommand.run({ services: [PROXY_SERVICE_NAME], profiles: [], cmd: 'up -d' }));

    proxyCommand.command('down')
      .description('stops proxy service')
      .action(() => composeExecCommand.run({ services: [PROXY_SERVICE_NAME], profiles: [], cmd: 'rm -f -s -v' }));

    proxyCommand.command('logs')
      .description('displays proxy services logs')
      .action(() => composeExecCommand.run({ services: [PROXY_SERVICE_NAME], profiles: [], cmd: 'logs -f' }));

    proxyCommand.command('ls')
      .description('lists mappings')
      .action(() => proxyLsCommand.run());

    const dnsCommand = proxyCommand.command('dns').complete('dns');
    dnsCommand
      .option('-w, --write', 'write to hosts')
      .description('generates dns records')
      .action(() => proxyDnsCommand.run({ write: dnsCommand.opts().write }));
  }

  // auto-complete
  {
    const toolCommand = commander.command('config').description('tool config');

    const completionCommand = toolCommand.command('completion');
    completionCommand
      .command('remove')
      .description('removes autocompletion feature')
      .action(() => commander.$omelette.cleanupShellInitFile());
    completionCommand
      .command('setup')
      .description('installs autocompletion feature')
      .action(() => commander.$omelette.setupShellInitFile());
  }

  // tool
  {
    const toolCommand = commander.command('tool');
    toolCommand.command('update').description('check if new version is available').action(() => updateCheckCommand.run({ check: true }));
  }

  await commander.execute(argv);
};
export default async (argv: string[]) => {
  let executionError = null;
  try {
    await app(argv);
  } catch (err) {
    if (err.exitCode !== 0 && err.code !== 'commander.help') executionError = err;
  }

  // re-throw exception
  if (executionError) {
    logger.logError(executionError.message);
  }
};
