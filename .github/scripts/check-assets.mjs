// Verifies that every local file referenced by the site actually exists.
//
// The portfolio is static: there is no bundler to complain about a missing
// import, and a broken image path still renders as a blank space in the
// browser. This script turns that silent failure into a red build.
//
//   node .github/scripts/check-assets.mjs [repo-root]
//
// With no argument the repository root is derived from the script location,
// so it works unchanged in CI. Pass a path to point it at another checkout.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(here, '..', '..');

const indexPath = join(root, 'index.html');
if (!existsSync(indexPath)) {
  console.error(`::error::index.html not found at ${root}`);
  console.error('Pass the repository root as the first argument.');
  process.exit(1);
}

const html = readFileSync(indexPath, 'utf8');

const problems = [];

// Matches src="..." and href="..." on any tag.
const attrPattern = /(?:src|href)\s*=\s*["']([^"']+)["']/g;
let match;

// Skip anything that is not a local file: absolute URLs, protocol-relative
// URLs, data URIs, mailto:, tel:, and bare fragments.
const isLocal = (value) =>
  value !== '' &&
  !value.startsWith('#') &&
  !value.startsWith('//') &&
  !value.startsWith('http') &&
  !value.startsWith('mailto:') &&
  !value.startsWith('tel:') &&
  !value.startsWith('data:');

const seen = new Set();

while ((match = attrPattern.exec(html)) !== null) {
  const value = match[1].split('#')[0].split('?')[0];
  if (!isLocal(value)) continue;
  if (seen.has(value)) continue;
  seen.add(value);

  const target = resolve(root, value);
  if (!existsSync(target)) {
    problems.push(value);
  }
}

if (problems.length > 0) {
  console.error('::error::These files are referenced by index.html but do not exist:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(`ok - ${seen.size} local references resolve`);
