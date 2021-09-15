// @flow
import fs from 'fs';
import yaml from 'yaml';
import pathHelper from 'path';

const rm = (p: string): void => fs.unlinkSync(p);
const mkdir = (p: string): void => fs.mkdirSync(p);
const rmDir = (p: string): void => {
  if (fs.rmSync) fs.rmSync(p, { recursive: true, force: true });
  else fs.rmdirSync(p, { recursive: true, force: true });
};
const exists = (p: string): boolean => fs.existsSync(p);
const rmLnSymDir = (path: string): void => fs.unlinkSync(path);
const isDirectory = (p: string): boolean => fs.lstatSync(p).isDirectory();
const dirFiles = (p: string): Array<string> => fs.readdirSync(p).filter((pp: string) => !isDirectory(pathHelper.resolve(p, pp)));
const dirs = (p: string): Array<string> => fs.readdirSync(p).filter((pp: string) => isDirectory(pathHelper.resolve(p, pp)));
const readAllText = (p: string): string => fs.readFileSync(p, { encoding: 'utf-8' });
const readAllJson = <T>(p: string): T | null => JSON.parse(fs.readFileSync(p, { encoding: 'utf-8' }));
const readAllYaml = <T>(p: string): T | null => yaml.parse(fs.readFileSync(p, { encoding: 'utf-8' }));
const writeAllText = (p: string, content: string): void => fs.writeFileSync(p, content, { encoding: 'utf-8' });
const writeAllJson = (p: string, data: any): void => fs.writeFileSync(p, JSON.stringify(data), { encoding: 'utf-8' });
const lnSymDir = (sourcePath: string, destinationPath: string): void => fs.symlinkSync(sourcePath, destinationPath, 'dir');
const writeAllYaml = (p: string, content: any): void => {
  const doc = new yaml.Document();
  doc.contents = content;
  writeAllText(p, doc.toString());
};

export default {
  rm,
  dirs,
  mkdir,
  rmDir,
  exists,
  lnSymDir,
  dirFiles,
  rmLnSymDir,
  readAllText,
  readAllJson,
  readAllYaml,
  writeAllText,
  writeAllYaml,
  writeAllJson,
  isDirectory,
};
