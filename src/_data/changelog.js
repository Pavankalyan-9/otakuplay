/**
 * A changelog built from real git history rather than a hand-maintained list
 * — a hand-written one drifts from what actually shipped the moment someone
 * forgets to update it. Requires full history at build time (CI's checkout
 * step now uses fetch-depth: 0 for exactly this reason); falls back to an
 * empty list rather than failing the build if history isn't available
 * (e.g. a shallow clone or a source tarball with no .git directory).
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const FIELD_SEP = '\x1f';

function getChangelog() {
  let raw;
  try {
    raw = execFileSync(
      'git',
      ['log', '--date=rfc', `--pretty=format:%h${FIELD_SEP}%ad${FIELD_SEP}%s`, '--', 'data.js'],
      { cwd: ROOT, encoding: 'utf8' },
    );
  } catch {
    return [];
  }

  return raw
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [hash, rfcDate, subject] = line.split(FIELD_SEP);
      const parsed = new Date(rfcDate);
      return { hash, subject, rfcDate, date: Number.isNaN(+parsed) ? '' : parsed.toISOString().slice(0, 10) };
    });
}

export default getChangelog();
