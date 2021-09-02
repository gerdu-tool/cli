// @flow
import fs from '@app/helpers/fs';
import { TOOL_NAME, HOST_FILE } from '@app/consts';

const TOOL_UPPER_CASE = TOOL_NAME.toUpperCase();

const filterRelatedLines = (content: string, comment: string) => content
  .split('\n')
  .filter((line: string) => line.indexOf(comment) === -1); // filter lines related to project

const removeRecords = (content: string, scope: string) => {
  const lines = filterRelatedLines(content, `# ${TOOL_UPPER_CASE}-${scope}`);
  const finalValue = lines.join('\n');
  return finalValue;
};

const setRecords = (records: string[], scope: string): string => {
  const content = fs.readAllText(HOST_FILE);
  const cleanContent = removeRecords(content, scope);

  const recordComment = `# ${TOOL_UPPER_CASE}-${scope}`;
  const recordsLines = records
    .map((record: string) => `127.0.0.1\t${record}\t${recordComment}`)
    .join('\n');

  return `${cleanContent.trim()}\n${recordsLines}\n`;
};

const generateHostsRecords = (records: string[], scope: string): string => setRecords(records, scope);

export default {
  generateHostsRecords,
};
