import '../packages/server/src/config';
import { execSync } from 'child_process';

try {
  console.info('Updating geoip data from maxmind.com...');

  const maxmindLicenseKey = process.env.MOTD_MAXMIND_LICENSE_KEY;

  execSync(
    `npm run --prefix ./node_modules/geoip-lite updatedb license_key=${maxmindLicenseKey}`,
  );

  console.info('Geoip data updated successfully.');
} catch (e) {
  console.error('Failed to update geoip data from maxmind.com:', e);
}
