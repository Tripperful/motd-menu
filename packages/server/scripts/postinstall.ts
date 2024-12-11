import '../src/config';

import { execSync } from 'child_process';

try {
  console.info('Updating geoip data from maxmind.com...');

  const maxmindLicenseKey = process.env.MOTD_MAXMIND_LICENSE_KEY;

  execSync(
    `cd ../../node_modules/geoip-lite && npm run-script updatedb license_key=${maxmindLicenseKey}`,
  );

  console.info('Geoip data updated successfully.');
} catch (e) {
  console.error('Failed to update geoip data from maxmind.com:', e);
}
