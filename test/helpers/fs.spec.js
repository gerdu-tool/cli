import fs from 'fs';
import pathHelper from 'path';
import helper from '@app/helpers/fs';

describe('fs', () => {
  beforeAll(() => {
    helper.dirFiles.mockRestore();
    helper.exists.mockRestore();
    helper.lnSymDir.mockRestore();
    helper.mkdir.mockRestore();
    helper.readAllText.mockRestore();
    helper.readAllJson.mockRestore();
    helper.readAllYaml.mockRestore();
    helper.rm.mockRestore();
    helper.rmLnSymDir.mockRestore();
    helper.writeAllText.mockRestore();
    helper.writeAllYaml.mockRestore();
    helper.isDirectory.mockRestore();
    helper.writeAllJson.mockRestore();
    helper.rmDir.mockRestore();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  it('returns true if file or path exists', () => {
    jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
    const path = './.gerdu-dev.yaml';
    expect(helper.exists(path)).toBeTruthy();
    expect(fs.existsSync).toHaveBeenCalledWith(path);
  });
  it('returns false if file or path exists', () => {
    jest.spyOn(fs, 'existsSync').mockImplementation(() => false);
    const path = './.gerdu-dev.yaml';
    expect(helper.exists(path)).toBeFalsy();
    expect(fs.existsSync).toHaveBeenCalledWith(path);
  });
  it('read all file content as text', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => 'value');
    const path = './test.js';
    expect(helper.readAllText(path)).toBe('value');
    expect(fs.readFileSync).toHaveBeenCalledWith(path, { encoding: 'utf-8' });
  });
  it('read all file content as json', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => '{ "x": "a" }');
    const path = './test.js';
    expect(helper.readAllJson(path)).toMatchObject({ x: 'a' });
    expect(fs.readFileSync).toHaveBeenCalledWith(path, { encoding: 'utf-8' });
  });
  it('read all yaml file content as json', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => 'service: 1');
    const path = './test.js';
    expect(helper.readAllYaml(path)).toMatchObject({ service: 1 });
    expect(fs.readFileSync).toHaveBeenCalledWith(path, { encoding: 'utf-8' });
  });
  it('read all files in path', () => {
    const path = './test.yaml';
    jest.spyOn(fs, 'lstatSync').mockImplementation((p) => ({ isDirectory: () => p === pathHelper.resolve(path, 'dir3') }));
    jest.spyOn(fs, 'readdirSync').mockImplementation(() => ['file1', 'file2', 'dir3']);
    expect(helper.dirFiles(path)).toMatchObject(['file1', 'file2']);
  });
  it('read all directories in path', () => {
    const path = './test.yaml';
    jest.spyOn(fs, 'lstatSync').mockImplementation((p) => ({ isDirectory: () => p === pathHelper.resolve(path, 'dir3') }));
    jest.spyOn(fs, 'readdirSync').mockImplementation(() => ['file1', 'file2', 'dir3']);
    expect(helper.dirs(path)).toMatchObject(['dir3']);
  });
  it('creates directory', () => {
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => true);
    const path = './working-dir';
    helper.mkdir(path);
    expect(fs.mkdirSync).toHaveBeenCalledWith(path);
  });
  it('creates symbolic link to a dir', () => {
    jest.spyOn(fs, 'symlinkSync').mockImplementation(() => true);
    const sourcePath = './source-dir';
    const targetPath = './target-dir';
    helper.lnSymDir(sourcePath, targetPath);
    expect(fs.symlinkSync).toHaveBeenCalledWith(sourcePath, targetPath, 'dir');
  });
  it('removes symbolic dir link', () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => true);
    const path = './source-dir';
    helper.rmLnSymDir(path);
    expect(fs.unlinkSync).toHaveBeenCalledWith(path);
  });
  it('writes content into file', () => {
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => true);
    const path = './source-dir';
    helper.writeAllText(path, 'data');
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path, 'data', { encoding: 'utf-8' },
    );
  });
  it('removes the file', () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => true);
    const path = './source-dir';
    helper.rm(path);
    expect(fs.unlinkSync).toHaveBeenCalledWith(path);
  });
  it('write json object as yaml file', () => {
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const object = {
      version: '1',
      projects: {
        project1: {
          name: 'name',
          files: ['file1', 'file2'],
        },
      },
    };
    const path = './test.js';
    helper.writeAllYaml(path, object);
    const expected = `
version: "1"
projects:
  project1:
    name: name
    files:
      - file1
      - file2
    `.trim();
    expect(fs.writeFileSync.mock.calls[0][0]).toBe(path);
    expect(fs.writeFileSync.mock.calls[0][1].trim()).toBe(expected);
    expect(fs.writeFileSync.mock.calls[0][2]).toMatchObject({ encoding: 'utf-8' });
  });
  it('write json object as json file', () => {
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const object = { value: 'value' };
    const path = './test.json';
    helper.writeAllJson(path, object);
    const expected = '{"value":"value"}'.trim();
    expect(fs.writeFileSync.mock.calls[0][0]).toBe(path);
    expect(fs.writeFileSync.mock.calls[0][1].trim()).toBe(expected);
    expect(fs.writeFileSync.mock.calls[0][2]).toMatchObject({ encoding: 'utf-8' });
  });
  it('returns true if path is directory', () => {
    jest.spyOn(fs, 'lstatSync').mockImplementation(() => ({ isDirectory: () => true }));
    expect(helper.isDirectory('./path')).toBeTruthy();
    expect(fs.lstatSync).toHaveBeenCalledWith('./path');
  });
  it('returns false if path is file', () => {
    jest.spyOn(fs, 'lstatSync').mockImplementation(() => ({ isDirectory: () => false }));
    expect(helper.isDirectory('./path')).toBeFalsy();
    expect(fs.lstatSync).toHaveBeenCalledWith('./path');
  });
  it('rm directory recursively', () => {
    jest.spyOn(fs, 'rmdirSync').mockImplementation(() => {});
    helper.rmDir('./path');
    expect(fs.rmdirSync).toHaveBeenCalledWith('./path', { recursive: true, force: true });
  });
});
