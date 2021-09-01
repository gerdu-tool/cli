import logger from '@app/helpers/logger';

jest.spyOn(logger, 'write').mockImplementation(() => {});

jest.spyOn(logger, 'info').mockImplementation(() => {});
jest.spyOn(logger, 'error').mockImplementation(() => {});
jest.spyOn(logger, 'debug').mockImplementation(() => {});
jest.spyOn(logger, 'warning').mockImplementation(() => {});

jest.spyOn(logger, 'commandStart').mockImplementation(() => {});
jest.spyOn(logger, 'commandCompleted').mockImplementation(() => {});

jest.spyOn(logger, 'logTask').mockImplementation(() => {});
jest.spyOn(logger, 'logShell').mockImplementation(() => {});
jest.spyOn(logger, 'logError').mockImplementation(() => {});
jest.spyOn(logger, 'logDebug').mockImplementation(() => {});
jest.spyOn(logger, 'logSuccess').mockImplementation(() => {});
jest.spyOn(logger, 'logWarning').mockImplementation(() => {});

jest.spyOn(logger, 'groupStart').mockImplementation(() => {});
jest.spyOn(logger, 'groupEnd').mockImplementation(() => {});
