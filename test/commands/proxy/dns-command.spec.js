/* eslint-disable no-console */
import fs from '@app/helpers/fs';
import logger from '@app/helpers/logger';
import faker from '@test/__utils__/faker';
import hostFile from '@app/helpers/host-file';
import command from '@app/commands/proxy/dns-command';
import contextService from '@app/services/context-service';

describe('dns-command', () => {
  const context = faker.createContext({
    workspace: faker.createWorkspace({
      charts: [faker.createChart({
        mappings: [
          faker.createMapping({ host: 'test1.com' }),
          faker.createMapping({ host: 'test1.com' }),
        ],
      })],
    }),
  });
  const mappings = [...(new Set(context.workspace.charts.reduce((c, chart) => [
    ...c,
    ...chart.mappings.map((mapping) => mapping.host),
  ], [])))];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(contextService, 'fetch').mockImplementation(() => context);
    jest.spyOn(hostFile, 'generateHostsRecords').mockImplementation(() => 'dns-records');
  });
  it('generates dns records', async () => {
    await command.run({});
    expect(logger.write).toHaveBeenCalledWith('dns-records');
    expect(hostFile.generateHostsRecords).toHaveBeenCalledWith(mappings, context.workspace.name);
  });
  it('writes records into hosts file', async () => {
    await command.run({ write: true });
    expect(fs.writeAllText).toHaveBeenCalledWith('/etc/hosts', 'dns-records');
    expect(hostFile.generateHostsRecords).toHaveBeenCalledWith(mappings, context.workspace.name);
  });
});
