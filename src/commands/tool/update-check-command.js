// @flow
import logger from '@app/helpers/logger';
import versionCheck from '@app/helpers/version-check';

// $FlowFixMe
import packageJson from '@root/package.json';

const updateCheckCommand = async () => {
  const versionCheckPromise = versionCheck();
  const [isNewVersionAvailable, version] = await versionCheckPromise;
  if (isNewVersionAvailable) {
    logger.printBox([
      `There is a new version of @gerdu/cli available (${version}).`,
      `You are currently using @gerdu/cli ${packageJson.version}`,
      'Run `yarn global add @gerdu/cli -g` to get latest version',
    ]);
  } else {
    logger.printBox([
      `You are running the latest version of @gerdu/cli (${version})`,
    ]);
  }
};

export default {
  run: updateCheckCommand,
};
