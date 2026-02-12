import { execSync } from 'node:child_process';

export function migrateTestDatabase() {
  execSync('make test-migrate', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });
}
