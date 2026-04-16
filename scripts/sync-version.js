import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const featureMapPath = path.resolve(__dirname, '../src/data/featuremap.json');
const packageJsonPath = path.resolve(__dirname, '../package.json');

try {
  const featureMap = JSON.parse(fs.readFileSync(featureMapPath, 'utf8'));
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (featureMap.achieved && featureMap.achieved.length > 0) {
    const latestVersion = featureMap.achieved[0].version;
    
    if (packageJson.version !== latestVersion) {
      packageJson.version = latestVersion;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`✅ Version synchronized to ${latestVersion}`);
    } else {
      console.log(`ℹ️ Version is already up to date (${latestVersion})`);
    }
  } else {
    console.error('❌ No achieved versions found in featuremap.json');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Synchronization failed:', error.message);
  process.exit(1);
}
