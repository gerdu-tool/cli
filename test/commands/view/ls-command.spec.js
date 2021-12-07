/* eslint-disable no-console */
import faker from '@test/__utils__/faker';
import command from '@app/commands/view/ls-command';
import contextService from '@app/services/context-service';

describe('view-ls-command', () => {
  const context = faker.createContext();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(contextService, 'fetch').mockImplementation(() => context);
  });
  it('list all services', async () => {
    await command.run();
    const services = context.services.map((s) => ({ type: 'service', name: s }));
    const profiles = context.workspace.profiles.map((p) => ({ type: 'profile', name: p.name }));
    expect(console.table).toHaveBeenCalledWith([...services, ...profiles]);
  });
});
