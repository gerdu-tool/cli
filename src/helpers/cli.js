/* eslint-disable no-param-reassign */
// @flow
// $FlowFixMe
import omelette from 'omelette';
import { Command } from 'commander';

type OmletteTree = {[key: string]: string} | Array<string> | Function;
type CommandType = {
  $command: any;
  $omelette: any;
  opts: ()=> { [key: string]: any },
  args: ()=> string[],
  version: (version: string)=> CommandType;
  name: (name: string)=> CommandType;
  option: (flags: string, description?: string, defaultValue?: any) => CommandType;
  command: (name: string)=> CommandType;
  description: (description: string)=> CommandType;
  action: (fn: (...args: any[]) => void | Promise<void>)=> CommandType;
  complete: (name: string, commandTree?: OmletteTree)=> CommandType;
  allowUnknownOption: ()=> CommandType;
  execute: (argv: any)=> Promise<void>;
}
const wrap = (command: any, tree: OmletteTree): CommandType => {
  const build = (newCommand: any, completion: [ string, OmletteTree ] | null = null): CommandType => {
    newCommand.$data = command.$data;

    if (completion) {
      const [newTreeName, newTree] = completion;
      Object.assign(tree, { [newTreeName]: newTree });
      return wrap(newCommand, newTree);
    }
    return wrap(newCommand, tree);
  };

  return ({
    $command: command,
    $omelette: command.$data.omelette,
    opts: () => command.opts(),
    args: () => command.args,
    version: (version: string) => build(command.version(version)),
    name: (name: string) => build(command.name(name)),
    command: (name: string) => build(command.command(name)),
    description: (description: string) => build(command.description(description)),
    action: (fn: (...args: any[]) => void | Promise<void>) => build(command.action(fn)),
    option: (flags: string, description?: string, defaultValue?: any) => build(command.option(flags, description, defaultValue)),
    complete: (name: string, commandTree: OmletteTree = {}) => build(command, [name, commandTree]),
    allowUnknownOption: () => build(command.allowUnknownOption()),
    execute: (argv: any): Promise<void> => {
      command.$data.omelette.tree(command.$data.tree).init();
      return command.parseAsync(argv);
    },
  });
};

const cli = (name: string): CommandType => {
  const complete = omelette(name);
  const commander = new Command(name);
  commander.$data = {};
  commander.$data.omelette = complete;
  commander.$data.tree = {};
  commander.exitOverride();
  return wrap(commander, commander.$data.tree);
};

export default cli;
