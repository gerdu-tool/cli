// @flow
import { Command } from 'commander';
import packageJson from '../package.json';
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

export default (argv: any): Promise<void> => {
  const commander = new Command(TOOL_NAME)
    .version(packageJson.version)
    .name(TOOL_NAME)
    .description('Define and manage micro services with docker for development');

  // workspace
  {
    const wsCommand = commander.command('ws').description('manage workspaces');
    wsCommand.command('add <name> <path>')
      .description('adds an existing workspace')
      .action((name: string, workspacePath: string) => addWorkspaceCommand.run({ name, workspacePath }));
    wsCommand.command('ls')
      .description('lists all workspaces')
      .action(() => lsWorkspaceCommand.run());
    wsCommand.command('switch <name>')
      .description('switchs to workspace')
      .action((name: string) => switchWorkspaceCommand.run({ name }));
  }

  // setup
  {
    commander.command('install')
      .description('installs charts')
      .action(async () => {
        await pullInstallCommand.run();
        await syncInstallCommand.run();
        await setupInstallCommand.run({ });
      });
    commander.command('pull')
      .description('pulls charts')
      .action(() => pullInstallCommand.run());
    commander.command('sync')
      .description('syncs charts')
      .action(() => syncInstallCommand.run());
    commander.command('setup [charts...]')
      .description('setups charts or services')
      .action((charts: string[]) => setupInstallCommand.run({ charts }));
  }

  // compose
  {
    const composeCommand = commander.option('-p, --profile <profiles...>', 'enable profile');
    composeCommand.command('build [services...]')
      .option('-p, --profile <profiles...>', 'enable profile')
      .description('builds or rebuilds services')
      .action((services: string[]) => composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'build' }));

    composeCommand.command('up [services...]')
      .option('-p, --profile <profiles...>', 'enable profile')
      .description('starts services')
      .action((services: string[]) => composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'up -d' }));

    composeCommand.command('down [services...]')
      .description('stops and removes containers, networks')
      .option('-p, --profile <profiles...>', 'enable profile')
      .action((services: string[]) => composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'rm -f -s -v' }));

    composeCommand.command('logs [services...]')
      .description('displays services logs')
      .option('-p, --profile <profiles...>', 'enable profile')
      .action((services: string[]) => composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'logs -f' }));

    composeCommand.command('stop [services...]')
      .description('stops services')
      .option('-p, --profile <profiles...>', 'enable profile')
      .action((services: string[]) => composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'stop' }));

    composeCommand.command('kill [services...]')
      .description('force stops services')
      .option('-p, --profile <profiles...>', 'enable profile')
      .action((services: string[]) => composeExecCommand.run({ services, profiles: composeCommand.opts().profile || [], cmd: 'kill' }));

    commander.command('ps')
      .description('lists running containers')
      .action(() => composeExecCommand.run({ cmd: 'ps' }));

    commander.command('exec <service> <args...>')
      .allowUnknownOption()
      .description('executes a command in a running service')
      .action((service: string) => composeExecCommand.run({ cmd: `exec ${service} ${commander.args.slice(2).join(' ')}` }));

    commander.command('compose <args...>')
      .allowUnknownOption()
      .description('docker compose alias')
      .action(() => composeExecCommand.run({ cmd: commander.args.slice(1).join(' ') }));
  }

  // view
  {
    commander.command('ls')
      .description('lists services and profiles')
      .action(() => lsViewCommand.run());
  }

  // Proxy
  {
    const proxyCommand = commander.command('proxy').description('manage proxy service');
    proxyCommand.command('up')
      .description('starts proxy service')
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

    const dnsCommand = proxyCommand.command('dns');
    dnsCommand
      .option('-w, --write', 'write to hosts')
      .description('generates dns records')
      .action(() => proxyDnsCommand.run({ write: dnsCommand.opts().write }));
  }

  return commander.parseAsync(argv);
};
