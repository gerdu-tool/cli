/* eslint-disable no-console */
// @flow
import https from 'https';
import packageJson from '@root/package.json';
import logger from '@app/helpers/logger';

const checkVersion = () => new Promise<void>((resolve: any) => {
  https.get('https://api.npms.io/v2/package/%40gerdu%2Fcli', (res: any) => {
    const data = [];
    res.on('data', (chunk: any) => data.push(chunk));
    res.on('end', () => {
      const body = JSON.parse(Buffer.concat(data).toString());
      const value = body?.collected?.metadata?.version || '0.0.0';
      const serverVersion = parseInt(value.replace(/\./g, ''), 10);
      const currentVersion = parseInt(packageJson.version.replace(/\./g, ''), 10);
      if (serverVersion > currentVersion) {
        logger.printBox([
          `There is a new version of @gerdu/cli available (${value}).`,
          `You are currently using @gerdu/cli ${packageJson.version}`,
          'Run `yarn global add @gerdu/cli -g` to get latest version',
        ]);
      }
      resolve('');
    });
  }).on('error', () => resolve());
});
export default checkVersion;
