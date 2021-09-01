import fs from '@app/helpers/fs';
import path from '@app/helpers/path';
import messages from '@app/messages';
import faker from '@test/__utils__/faker';
import configService from '@app/services/config-service';
import contextService from '@app/services/context-service';
import { WORKSPACE_CACHE_DIR_NAME, WORKSPACE_CACHE_CONTEXT_FILE_NAME } from '@app/consts';

describe('context-service', () => {
  const workspace = faker.createWorkspace();
  const actvieWorkspcae = faker.createGerduConfigWorkspace();
  const context = faker.createContext({ workspace });
  const contextPath = path.resolve(workspace.path, WORKSPACE_CACHE_DIR_NAME, WORKSPACE_CACHE_CONTEXT_FILE_NAME);

  beforeEach(() => {
    jest.spyOn(fs, 'exists').mockImplementation(() => true);
    jest.spyOn(configService, 'getActiveWorkspace').mockImplementation(() => actvieWorkspcae);
    jest.spyOn(fs, 'readAllJson').mockImplementation(() => ({ ...context, config: undefined }));
    jest.spyOn(fs, 'writeAllJson').mockImplementation(() => {});
  });
  describe('fetch', () => {
    it('returns context', () => {
      expect(contextService.fetch()).toMatchObject(context);
      expect(fs.exists).toHaveBeenCalledWith(contextPath);
      expect(fs.readAllJson).toHaveBeenCalledWith(contextPath);
    });
    it('raises if context file not found', () => {
      jest.spyOn(fs, 'exists').mockImplementation((p) => p !== contextPath);
      expect(() => contextService.fetch()).toThrowError(messages.workspaceIsOutOfSynced(workspace.name));
    });
  });
  describe('save', () => {
    it('saves context', () => {
      jest.spyOn(fs, 'exists').mockImplementation(() => false);
      contextService.save(context);
      expect(fs.mkdir).toHaveBeenCalledWith(path.resolve(workspace.path, WORKSPACE_CACHE_DIR_NAME));
      expect(fs.writeAllJson).toHaveBeenCalledWith(contextPath, context);
    });
    it('wont create cache directory if does exists', () => {
      jest.spyOn(fs, 'exists').mockImplementation(() => true);
      contextService.save(context);
      expect(fs.mkdir).not.toHaveBeenCalledWith(path.resolve(workspace.path, WORKSPACE_CACHE_DIR_NAME));
      expect(fs.writeAllJson).toHaveBeenCalledWith(contextPath, context);
    });
  });
});
