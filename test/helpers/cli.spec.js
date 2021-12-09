/* eslint-disable no-underscore-dangle */
import cli from '@app/helpers/cli';

describe('cli', () => {
  const cmdName = 'test_cmd';

  beforeEach(() => {
    // console.log.mockRestore();
  });

  it('creates root command', () => {
    const cmd = cli(cmdName);
    expect(cmd.$command.name()).toBe(cmdName);
  });
  it('sets command name', () => {
    const cmd = cli(cmdName).name('new_name');
    expect(cmd.$command.name()).toBe('new_name');
  });
  it('returns options', async () => {
    const cmd = cli(cmdName).command('exec').option('-t, --t <tag...>', 'enable profile');
    const handler = jest.fn(() => {
      expect(cmd.opts()).toMatchObject({ t: ['tag', 'tag2'] });
    });
    cmd.action(handler);
    await cmd.execute(['node', cmdName, 'exec', '-t', 'tag', 'tag2']);
    expect(handler).toHaveBeenCalled();
  });
  it('returns args', async () => {
    const cmd = cli(cmdName).command('exec <service>');
    const handler = jest.fn(() => {
      expect(cmd.args()).toMatchObject(['exec', 'service1']);
    });
    cmd.action(handler);
    await cmd.execute(['node', cmdName, 'exec', 'service1']);
    expect(handler).toHaveBeenCalled();
  });
  it('sets command version', () => {
    const cmd = cli(cmdName).version('1.0.0');
    expect(cmd.$command.version()).toBe('1.0.0');
  });
  it('creates a new command', () => {
    const cmd = cli(cmdName).command('cmd');
    expect(cmd.$command.name()).toBe('cmd');
  });
  it('sets command description', () => {
    const cmd = cli(cmdName).description('command description');
    expect(cmd.$command.description()).toBe('command description');
  });
  it('sets commands handler', () => {
    const handler = jest.fn();
    const cmd = cli(cmdName).action(handler);
    expect(cmd.$command._actionHandler).toBeInstanceOf(Function);
    cmd.$command._actionHandler([]);
    expect(handler).toHaveBeenCalled();
  });
  it('adds command option', () => {
    const cmd = cli(cmdName).option('-p', 'prints data', 'default');
    expect(cmd.$command.options).toHaveLength(1);
    expect(cmd.$command.options[0].flags).toBe('-p');
    expect(cmd.$command.options[0].description).toBe('prints data');
    expect(cmd.$command.options[0].defaultValue).toBe('default');
  });
  it('adds completion tree', () => {
    const cmd = cli(cmdName).complete('options', ['a', 'b']);
    expect(cmd.$command.$data.tree).toMatchObject({ options: ['a', 'b'] });
  });
  it('adds completion with empty tree', () => {
    const cmd = cli(cmdName).complete('options');
    expect(cmd.$command.$data.tree).toMatchObject({ options: {} });
  });
  it('sets allowUnknownOption flag', () => {
    const cmd = cli(cmdName).allowUnknownOption();
    expect(cmd.$command._allowUnknownOption).toBeTruthy();
  });
  it('executes command', async () => {
    const handler = jest.fn();
    await cli(cmdName).action(handler).allowUnknownOption().execute(['arg1', 'arg2']);
    expect(handler).toBeCalled();
  });
});
