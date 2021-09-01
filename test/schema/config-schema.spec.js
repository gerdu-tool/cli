import messages from '@app/messages';
import fs from '@app/helpers/fs';
import path from '@app/helpers/path';
import faker from '@test/__utils__/faker';
import configSchema from '@app/schema/config-schema';
import { GERDU_CONFIG_FILE_NAME, GERDU_HOME_DIR_NAME } from '@app/consts';

describe('config-schema', () => {
  const homeDir = path.resolve(path.homedir(), GERDU_HOME_DIR_NAME);
  const filePath = path.resolve(homeDir, GERDU_CONFIG_FILE_NAME);
  describe('get', () => {
    const workspace = faker.createGerduConfigWorkspace({ name: 'ws-1', path: './workspaces/ws-1' });
    const config = faker.createGerduConfig({ workspaces: [workspace] });

    beforeEach(() => {
      fs.exists.mockImplementation(() => true);
    });
    it('returns config', () => {
      fs.readAllYaml.mockImplementation(() => config);
      expect(configSchema.get(filePath)).toMatchObject(config);
    });
    it('returns empty settings if not provided', () => {
      fs.readAllYaml.mockImplementation(() => ({ ...config, settings: undefined }));
      expect(configSchema.get(filePath).settings).toMatchObject({});
    });
    it('returns empty workspaces if not provided', () => {
      fs.readAllYaml.mockImplementation(() => ({ ...config, workspaces: undefined }));
      expect(configSchema.get(filePath).workspaces).toMatchObject([]);
    });
    it('raise if workspace is not valid', () => {
      fs.readAllYaml.mockImplementation(() => faker.createGerduConfig({ workspaces: [{ ...workspace, name: undefined }] }));
      expect(() => configSchema.get(filePath)).toThrowError(messages.schemaPropMissing(filePath, 'workspace.name'));

      fs.readAllYaml.mockImplementation(() => faker.createGerduConfig({ workspaces: [{ ...workspace, path: undefined }] }));
      expect(() => configSchema.get(filePath)).toThrowError(messages.schemaPropMissing(filePath, 'workspace.path'));
    });
    it('raise if schema file is invalid', () => {
      fs.readAllYaml.mockImplementation(() => null);
      expect(() => configSchema.get(filePath)).toThrowError(messages.schemaParseError(filePath));
    });
  });
  describe('set', () => {
    it('updated config file with new settings', () => {
      const config = faker.createGerduConfig({});
      configSchema.set(filePath, config);
      expect(fs.writeAllYaml).toHaveBeenCalledWith(filePath, config);
    });
  });
});
