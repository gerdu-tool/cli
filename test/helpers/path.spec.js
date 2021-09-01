import os from 'os';
import path from 'path';
import helper from '@app/helpers/path';

describe('path', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  it('returns joined paths', () => {
    jest.spyOn(path, 'join').mockImplementation((...ps) => ps.join('/'));
    expect(helper.join('a', 'b')).toBe('a/b');
    expect(path.join).toHaveBeenCalledWith('a', 'b');
  });
  it('returns normalize path', () => {
    jest.spyOn(path, 'normalize').mockImplementation((p) => p);
    expect(helper.normalize('a')).toBe('a');
    expect(path.normalize).toHaveBeenCalledWith('a');
  });
  it('returns absolute path', () => {
    jest.spyOn(path, 'resolve').mockImplementation((...p) => `/${p.join('/')}`);
    expect(helper.resolve('a', 'b')).toBe('/a/b');
    expect(path.resolve).toHaveBeenCalledWith('a', 'b');
  });
  it('returns true for absolue path', () => {
    jest.spyOn(path, 'normalize').mockImplementation((p) => p);
    jest.spyOn(path, 'resolve').mockImplementation((...p) => `${p.join('/')}`);
    expect(helper.isAbsolute('/test.txt')).toBe(true);
    expect(path.normalize).toHaveBeenCalledWith('/test.txt/');
    expect(path.resolve).toHaveBeenCalledWith('/test.txt');
  });
  it('returns false for relative path', () => {
    jest.spyOn(path, 'normalize').mockImplementation((p) => p);
    jest.spyOn(path, 'resolve').mockImplementation((...p) => `/${p.join('/')}`);
    expect(helper.isAbsolute('test.txt')).toBe(false);
    expect(path.normalize).toHaveBeenCalledWith('test.txt/');
    expect(path.resolve).toHaveBeenCalledWith('test.txt');
  });
  it('returns directory name of file', () => {
    expect(helper.dirname('./dir/test.txt')).toBe('./dir');
  });
  it('returns root directory', () => {
    expect(helper.root()).toBe(path.resolve('./src/helpers'));
  });
  it('returns home directory', () => {
    process.env.HOME = '/users/home';
    expect(helper.homedir()).toBe(process.env.HOME);
  });
  it('returns default home directory if not exists', () => {
    process.env.HOME = '';
    expect(helper.homedir()).toBe('~/');
  });
  it('returns temp directory', () => {
    process.env.HOME = '';
    expect(helper.tempdir()).toBe(os.tmpdir());
  });
});
