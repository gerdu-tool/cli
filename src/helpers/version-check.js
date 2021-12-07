// @flow
import https from 'https';
// $FlowFixMe
import packageJson from '@root/package.json';

const newVersionIsAvailable = () => new Promise<[boolean, string]>((resolve: any) => {
  https.get('https://api.npms.io/v2/package/%40gerdu%2Fcli', (res: any) => {
    const data = [];
    res.on('data', (chunk: any) => data.push(chunk));
    res.on('end', () => {
      const body = JSON.parse(Buffer.concat(data).toString());
      const value = body?.collected?.metadata?.version || '0.0.0';
      const serverVersion = parseInt(value.replace(/\./g, ''), 10);
      const currentVersion = parseInt(packageJson.version.replace(/\./g, ''), 10);
      if (serverVersion > currentVersion) {
        resolve([true, value]);
      }
      resolve([false, null]);
    });
  }).on('error', () => resolve([false, null]));
});
export default (newVersionIsAvailable: ()=>Promise<[boolean, string]>);
