import fs from '@app/helpers/fs';
import path from '@app/helpers/path';
import messages from '@app/messages';
import faker from '@test/__utils__/faker';
import configSchema from '@app/schema/config-schema';
import configService from '@app/services/config-service';
import { GERDU_HOME_DIR_NAME, GERDU_CONFIG_FILE_NAME, GERDU_CACHE_DIR_NAME } from '@app/consts';

describe('config-service', () => {
  const homedir = path.resolve(path.homedir(), GERDU_HOME_DIR_NAME);
  const cachedir = path.resolve(path.homedir(), GERDU_HOME_DIR_NAME, GERDU_CACHE_DIR_NAME);
  const filePath = path.resolve(path.homedir(), GERDU_HOME_DIR_NAME, GERDU_CONFIG_FILE_NAME);
  const workspace = faker.createGerduConfigWorkspace();
  const config = faker.createGerduConfig({ workspaces: [workspace], settings: { active_workspace: workspace.name } });

  beforeEach(() => {
    jest.spyOn(fs, 'exists').mockImplementation(() => true);
    jest.spyOn(configSchema, 'set').mockImplementation(() => {});
    jest.spyOn(configSchema, 'get').mockImplementation(() => config);
  });

  it('returns config file path', () => {
    expect(configService.getGerduHomeDirectory()).toMatch(homedir);
  });
  it('returns tool home directory', () => {
    expect(configService.getGerduConfigFilePath()).toMatch(filePath);
  });
  it('returns cache directory', () => {
    expect(configService.getCacheDirectory()).toMatch(cachedir);
  });
  describe('fetch', () => {
    it('returns configuration', () => {
      expect(configService.fetch()).toMatchObject(config);
      expect(configSchema.get).toHaveBeenCalledWith(filePath);
    });
    it('creates default config file if does not exists and returns it', () => {
      jest.spyOn(fs, 'exists').mockImplementation(() => false);
      const result = configService.fetch();
      expect(result).toMatchObject(config);
      expect(fs.mkdir).toHaveBeenCalledWith(homedir);
      expect(configSchema.set).toHaveBeenCalledWith(filePath, configService.defaultConfig);
      expect(configSchema.get).toHaveBeenCalledWith(filePath);
    });
  });
  describe('save', () => {
    it('saves configuration', () => {
      configService.save(config);
      expect(configSchema.set).toHaveBeenCalledWith(filePath, config);
    });
    it('creates default config file if does not exists and saves it', () => {
      jest.spyOn(fs, 'exists').mockImplementation(() => false);
      const result = configService.fetch();
      expect(result).toMatchObject(config);
      expect(fs.mkdir).toHaveBeenCalledWith(homedir);
      expect(configSchema.set).toHaveBeenCalledWith(filePath, configService.defaultConfig);
      expect(configSchema.get).toHaveBeenCalledWith(filePath);
    });
  });
  describe('getWorkspace', () => {
    it('returns active workspace', () => {
      expect(configService.getWorkspace(workspace.name)).toMatchObject(workspace);
    });
    it('raise if workspace not found in workspaces', () => {
      expect(() => configService.getWorkspace('invalid')).toThrowError(messages.workspaceNotFound('invalid'));
    });
  });
  describe('getActiveWorkspace', () => {
    it('returns active workspace', () => {
      expect(configService.getActiveWorkspace()).toMatchObject(workspace);
    });
    it('raise if no active workspace defined', () => {
      jest.spyOn(configSchema, 'get').mockImplementation(() => ({ ...config, settings: { active_workspace: undefined } }));
      expect(() => configService.getActiveWorkspace()).toThrowError(messages.noActiveWorkspaceFound());
    });
    it('raise if active workspace not found in workspaces', () => {
      jest.spyOn(configSchema, 'get').mockImplementation(() => ({ ...config, settings: { active_workspace: 'invalid' } }));
      expect(() => configService.getActiveWorkspace()).toThrowError(messages.workspaceNotFound('invalid'));
    });
  });
});
