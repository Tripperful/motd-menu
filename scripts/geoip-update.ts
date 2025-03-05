import '../packages/server/src/config';

import { execSync } from 'child_process';
import fs from 'fs';

try {
  console.info('Updating geoip data from maxmind.com...');

  const maxmindLicenseKey = process.env.MOTD_MAXMIND_LICENSE_KEY;

  execSync(
    `npm run --prefix ./node_modules/geoip-lite updatedb license_key=${maxmindLicenseKey}`,
  );

  fs.cpSync('node_modules/geoip-lite/data/', 'packages/server/data/', {
    recursive: true,
    force: true,
  });

  console.info('Geoip data updated successfully.');
} catch (e) {
  console.error('Failed to update geoip data from maxmind.com:', e);
}
