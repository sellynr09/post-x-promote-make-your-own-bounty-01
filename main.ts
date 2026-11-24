// Entry program for the make.fun bounty post-x-promote-make-your-own-bounty-01,
// "Promote make.fun's make-your-own-bounty post on X".
//
// The entry itself is the X post named in POST.json: a quote post of
// make.fun's make-your-own-bounty announcement, with an original
// promotional photo, carrying the @makefunai tag and the entrant's
// play code. This program's only job is to hand that post to the
// grader: it copies POST.json from the repository root into the
// output directory, then sanity-checks the copy so a broken file
// fails loudly here instead of silently at grading time.
//
// In the grader's sandbox the repository is mounted at /bot and the
// output directory is /output. Outside the sandbox, MAKEFUN_BOT_DIR
// and MAKEFUN_OUTPUT_DIR stand in for them, e.g.:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Node 22, standard library only, no network, no model calls.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });

const outPath = join(OUTPUT_DIR, 'POST.json');
try {
  copyFileSync(join(BOT_DIR, 'POST.json'), outPath);
} catch (err) {
  const reason = err instanceof Error ? err.message : String(err);
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${reason}`);
  process.exit(1);
}

// The copied file must be a JSON object naming an X post. The house
// reads the post itself from X; nothing written here is judged, but
// a malformed POST.json would make the whole entry invalid, so check
// the shape before declaring success.
let post;
try {
  post = JSON.parse(readFileSync(outPath, 'utf8'));
} catch (err) {
  const reason = err instanceof Error ? err.message : String(err);
  console.error(`Copied POST.json is not valid JSON: ${reason}`);
  process.exit(1);
}

if (
  typeof post !== 'object' ||
  post === null ||
  typeof post.url !== 'string'
) {
  console.error('POST.json does not name an X post URL');
  process.exit(1);
}

// An X post address has the shape
// https://x.com/<handle>/status/<digits> (twitter.com, and www. or
// mobile. prefixes, read the same). The house reads the post from X,
// so a URL that is not shaped like one would be refused at the gate;
// reject it here instead of passing a bad address on.
const postMatch =
  /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/.exec(
    post.url,
  );
if (postMatch === null) {
  console.error('POST.json does not name an X post URL');
  process.exit(1);
}

console.log(`Entry post: ${post.url} (status ${postMatch[3]})`);
