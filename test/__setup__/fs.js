import fs from '@app/helpers/fs';

jest.spyOn(fs, 'exists').mockImplementation(() => true);
jest.spyOn(fs, 'readAllText').mockImplementation(() => '');
jest.spyOn(fs, 'readAllJson').mockImplementation(() => ({}));
jest.spyOn(fs, 'readAllYaml').mockImplementation(() => ({}));
jest.spyOn(fs, 'writeAllText').mockImplementation(() => {});
jest.spyOn(fs, 'dirFiles').mockImplementation(() => []);
jest.spyOn(fs, 'mkdir').mockImplementation(() => {});
jest.spyOn(fs, 'rmDir').mockImplementation(() => {});
jest.spyOn(fs, 'lnSymDir').mockImplementation(() => {});
jest.spyOn(fs, 'rmLnSymDir').mockImplementation(() => {});
jest.spyOn(fs, 'rm').mockImplementation(() => {});
jest.spyOn(fs, 'writeAllYaml').mockImplementation(() => {});
jest.spyOn(fs, 'writeAllJson').mockImplementation(() => {});
jest.spyOn(fs, 'isDirectory').mockImplementation(() => false);
