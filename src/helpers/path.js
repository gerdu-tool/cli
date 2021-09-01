// @flow
import os from 'os';
import path from 'path';

const tempdir = (): string => os.tmpdir();
const root = (): string => path.resolve(__dirname);
const homedir = (): string => process.env.HOME || '~/';
const dirname = (p: string): string => path.dirname(p);
const normalize = (p: string): string => path.normalize(p);
const join = (...paths: string[]): string => path.join(...paths);
const resolve = (...paths: string[]): string => path.resolve(...paths);
const isAbsolute = (p: string): boolean => normalize(`${p}/`) === normalize(`${resolve(p)}/`);

export default {
  root,
  join,
  tempdir,
  resolve,
  dirname,
  homedir,
  normalize,
  isAbsolute,
};
