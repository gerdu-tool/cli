/* eslint-disable no-console */
// @flow

import colors from 'colors';

export const icons = {
  none: '',
  success: (colors.green('✔'): string),
  error: (colors.red('✖'): string),
  command: '❯',
  shell: '$',
  comment: '❯',
  warning: (colors.yellow('!'): string),
};

const write = (...params: any[]): void => console.log(...params);
const writeTable = (...params: any[]): void => console.table(...params);

const prepareMessage = (
  msg: string,
  icon: string,
  colorFn: ((str: string)=>string) | null,
  ...params: any[]
) => {
  const lines = msg.trimRight().split('\n');
  if (lines.length === 1 && lines[0].trim().length === 0) return;
  lines.forEach((line: string) => {
    const the_line = icon === '' ? `${line}` : `${icon} ${line}`;
    const colorizedLine = colorFn ? colorFn(the_line) : the_line;
    write(colorizedLine, ...params);
  });
};

const groupStart = (): void => console.group();
const groupEnd = (): void => console.groupEnd();

const error = (msg: string, ...params: any[]): void => prepareMessage(msg, icons.none, colors.red.bold, ...params);
const info = (msg: string, ...params: any[]): void => prepareMessage(msg, icons.none, colors.green.bold, ...params);
const debug = (msg: string, ...params: any[]): void => prepareMessage(msg, icons.none, colors.gray.bold, ...params);
const warning = (msg: string, ...params: any[]): void => prepareMessage(msg, icons.none, colors.yellow.bold, ...params);

const logTask = (msg: string, ...params: any[]): void => prepareMessage(msg, icons.command, null, ...params);
const logShell = (msg: string, ...params: any[]): void => prepareMessage(msg, icons.shell, colors.grey, ...params);
const logError = (msg: string, ...params: any[]): void => prepareMessage(msg, icons.error, colors.red, ...params);
const logDebug = (msg: string, ...params: any[]): void => prepareMessage(msg, icons.comment, colors.grey, ...params);
const logSuccess = (msg: string, ...params: any[]): void => prepareMessage(msg, icons.success, colors.grey, ...params);
const logWarning = (msg: string, ...params: any[]): void => prepareMessage(msg, icons.warning, colors.yellow, ...params);

const commandStart = (msg: string, ...params: any[]): void => {
  prepareMessage(msg, icons.command, colors.green, ...params);
  groupStart();
};
const commandCompleted = (): void => { groupEnd(); };

const printBox = (lines: string[]) => {
  const maxLen = Math.max(...lines.map((s: string) => s.length)) + 2;
  const trim = (start: string, middle: String, end: string, text: string) => {
    const middleStr = Array.from({ length: maxLen - text.length }).join(middle);
    return `${start}${middle}${text}${middleStr}${end}`;
  };
  const box = [];
  box.push(trim('╭', '─', '╮', ''));
  lines.forEach((line: string) => box.push((trim('│', ' ', '│', line))));
  box.push((trim('╰', '─', '╯', '')));
  write(box.join('\n'));
};

export default {
  write,
  writeTable,

  // general
  info,
  error,
  debug,
  warning,

  // command
  commandStart,
  commandCompleted,

  // log
  logTask,
  logShell,
  logError,
  logDebug,
  logSuccess,
  logWarning,

  // grouping
  groupStart,
  groupEnd,

  // utils
  printBox,
};
