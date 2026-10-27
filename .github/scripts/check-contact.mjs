// Verifies that the contact mechanism on the site actually works.
//
// Three shapes are accepted, and the check must be able to tell them apart:
//
//   1. `mailto:` link            → opens the visitor's own mail client.
//                                 No backend needed. Always valid on a static host.
//   2. absolute https endpoint   → posts to a hosted form service.
//                                 Valid, and it is what you want for a real inbox.
//   3. relative path (e.g. /api/contact)
//                               → only works when a server is running locally.
//                                 On a static host this route does not exist and
//                                 the contact silently does nothing.
//
// Only case 3 fails the build.
//
//   node .github/scripts/check-contact.mjs [repo-root]

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = process.argv[2] ? resolve(process.argv[2]) : resolve(here, '..', '..');

const htmlPath = join(root, 'index.html');
if (!existsSync(htmlPath)) {
  console.error(`::error::index.html not found at ${root}`);
  console.error('Pass the repository root as the first argument.');
  process.exit(1);
}

const html = readFileSync(htmlPath, 'utf8');
const jsPath = join(root, 'js', 'main.js');
const js = existsSync(jsPath) ? readFileSync(jsPath, 'utf8') : '';

// --- Case 1: a mailto: contact link ---------------------------------------
const mailto = html.match(/href\s*=\s*["']mailto:([^"'?]+)/i);

// --- Case 2 or 3: a scripted submission ------------------------------------
const fetchMatch = (js + '\n' + html).match(/fetch\(\s*['"`]([^'"`]+)['"`]/);
const endpoint = fetchMatch ? fetchMatch[1] : null;

if (endpoint) {
  if (endpoint.startsWith('/')) {
    console.error(
      `::error::The contact form posts to "${endpoint}", which only works when a server is running locally.\n` +
        'This site is deployed as static files, so that route does not exist in production and the\n' +
        'contact silently does nothing. Point it at an absolute https form-service URL.'
    );
    process.exit(1);
  }
  if (!endpoint.startsWith('https://')) {
    console.error(`::error::The contact endpoint "${endpoint}" is not an absolute https URL.`);
    process.exit(1);
  }
  console.log(`ok - contact posts to ${endpoint}`);
  process.exit(0);
}

// --- Case 1 wins -----------------------------------------------------------
if (mailto) {
  console.log(`ok - contact uses a mailto: link (${mailto[1]}), no backend required`);
  console.log('note - a mailto: link opens the visitor\'s own mail app. If you want enquiries');
  console.log('       to arrive in a inbox you check reliably, use a hosted form service instead.');
  process.exit(0);
}

// --- Nothing found --------------------------------------------------------
console.error('::error::No contact mechanism found.');
console.error('Add either a mailto: link or a fetch() to an absolute https form-service URL.');
process.exit(1);
