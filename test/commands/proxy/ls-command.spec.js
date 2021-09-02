/* eslint-disable no-console */
import faker from '@test/__utils__/faker';
import command from '@app/commands/proxy/ls-command';
import contextService from '@app/services/context-service';

describe('view-ls-command', () => {
  const context = faker.createContext();
  const mappings = context.workspace.charts.reduce((c, chart) => [
    ...c,
    ...chart.mappings.map((mapping) => ({
      name: `${chart.name}_${mapping.name}`,
      url: mapping.host,
      path: mapping.path,
      to: `${mapping.service}:${mapping.port}`,
    })),
  ], []);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(contextService, 'fetch').mockImplementation(() => context);
  });
  it('list all mappings', async () => {
    await command.run();
    expect(console.table).toHaveBeenCalledWith(mappings);
  });
});
