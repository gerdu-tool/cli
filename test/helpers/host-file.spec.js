import fs from '@app/helpers/fs';
import { TOOL_NAME } from '@app/consts';
import hostFile from '@app/helpers/host-file';

describe('host-file-helper', () => {
  const records = ['api.gerdu.com', 'web.gerdu.com'];
  const toolUppercaseName = TOOL_NAME.toUpperCase();
  const scope = 'cli-dev';
  it('appends new records to hosts', () => {
    const result = hostFile.generateHostsRecords(records, scope);
    const expected = records.map((record) => `127.0.0.1\t${record}\t# ${toolUppercaseName}-${scope}`).join('\n');
    expect(result).toBe(`\n${expected}\n`);
  });
  it('removes pre existings managed records', () => {
    const original = [
      `127.0.0.1\tservice3.local\t# ${toolUppercaseName}-${scope}`,
      `127.0.0.1\tservice4.local\t# ${toolUppercaseName}-${scope}`,
    ].join('\n');
    fs.readAllText.mockImplementation(() => original);
    const result = hostFile.generateHostsRecords(records, scope);
    const expected = records.map((record) => `127.0.0.1\t${record}\t# ${toolUppercaseName}-${scope}`).join('\n');
    expect(result).toBe(`\n${expected}\n`);
  });
  it('keeps un managed records', () => {
    const original = [
      '127.0.0.1\tservice3.local',
      '127.0.0.1\tservice4.local\t# DUMMY COMMENT',
    ].join('\n');
    fs.readAllText.mockImplementation(() => original);
    const result = hostFile.generateHostsRecords(records, scope);
    const expected = records.map((record) => `127.0.0.1\t${record}\t# ${toolUppercaseName}-${scope}`).join('\n');
    expect(result).toBe(`${original}\n${expected}\n`);
  });
});
