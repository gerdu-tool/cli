import colors from 'colors';
import logger, { icons } from '@app/helpers/logger';

describe('logger', () => {
  const the_msg = 'Message';
  const prepareMessage = (msg, icon, colorFn) => {
    const the_line = icon === '' ? `${msg}` : `${icon} ${msg}`;
    const colorizedLine = colorFn ? colorFn(the_line) : the_line;
    return colorizedLine;
  };
  beforeEach(() => {
    process.env.VERBOSE = 'true';

    jest.spyOn(logger, 'write').mockRestore();
    jest.spyOn(logger, 'info').mockRestore();
    jest.spyOn(logger, 'error').mockRestore();
    jest.spyOn(logger, 'debug').mockRestore();
    jest.spyOn(logger, 'warning').mockRestore();
    jest.spyOn(logger, 'commandStart').mockRestore();
    jest.spyOn(logger, 'commandCompleted').mockRestore();
    jest.spyOn(logger, 'logTask').mockRestore();
    jest.spyOn(logger, 'logShell').mockRestore();
    jest.spyOn(logger, 'logError').mockRestore();
    jest.spyOn(logger, 'logDebug').mockRestore();
    jest.spyOn(logger, 'logSuccess').mockRestore();
    jest.spyOn(logger, 'logWarning').mockRestore();
    jest.spyOn(logger, 'groupStart').mockRestore();
    jest.spyOn(logger, 'groupEnd').mockRestore();
    jest.spyOn(global.console, 'log').mockImplementation(() => {});
  });

  it('writes msg console.log', () => {
    logger.write(the_msg);
    expect(global.console.log).toHaveBeenCalledWith(the_msg);
  });
  it('writes table to console.table', () => {
    logger.writeTable(the_msg);
    expect(global.console.table).toHaveBeenCalledWith(the_msg);
  });

  it.each([
    ['INF', 'info', prepareMessage(the_msg, '', colors.green.bold)],
    ['ERR', 'error', prepareMessage(the_msg, '', colors.red.bold)],
    ['WRN', 'warning', prepareMessage(the_msg, '', colors.yellow.bold)],
    ['DBG', 'debug', prepareMessage(the_msg, '', colors.gray.bold)],
  ])('writes %s event into console.log', (_, func, expected) => {
    logger[func](the_msg);
    expect(global.console.log).toHaveBeenCalledWith(expected);
  });

  it('starts new command', () => {
    logger.commandStart(the_msg);
    expect(global.console.log).toHaveBeenCalledWith(prepareMessage(the_msg, icons.command, colors.green));
    expect(global.console.group).toHaveBeenCalled();
  });
  it('completes prv command', () => {
    logger.commandCompleted();
    expect(global.console.groupEnd).toHaveBeenCalled();
  });

  it.each([
    ['ERR', 'logTask', prepareMessage(the_msg, icons.command, null)],
    ['ERR', 'logShell', prepareMessage(the_msg, icons.shell, colors.gray)],
    ['ERR', 'logError', prepareMessage(the_msg, icons.error, colors.red)],
    ['DBG', 'logDebug', prepareMessage(the_msg, icons.comment, colors.gray)],
    ['SUC', 'logSuccess', prepareMessage(the_msg, icons.success, colors.gray)],
    ['WRN', 'logWarning', prepareMessage(the_msg, icons.warning, colors.yellow)],
  ])('writes %s log even into console.log', (_, func, expected) => {
    logger[func](the_msg);
    expect(global.console.log).toHaveBeenCalledWith(expected);
  });

  it('starts a new group', () => {
    logger.groupStart();
    expect(global.console.group).toHaveBeenCalled();
  });
  it('ends prv group', () => {
    logger.groupEnd();
    expect(global.console.groupEnd).toHaveBeenCalled();
  });

  it('Truncate empty line', () => {
    logger.error('');
    expect(global.console.log).toHaveBeenCalledTimes(0);
  });

  it('prints box', () => {
    logger.printBox(['Line1', 'Line2', 'Line---3']);
    const expectedBox = [
      '╭──────────╮',
      '│ Line1    │',
      '│ Line2    │',
      '│ Line---3 │',
      '╰──────────╯',
    ].join('\n');
    expect(global.console.log).toHaveBeenCalledWith(expectedBox);
  });
});
