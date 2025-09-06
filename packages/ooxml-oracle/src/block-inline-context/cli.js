import { classifyBlockOrInline } from './classify.js';

/**
 * CLI: ooxml block-or-inline <QName> [--depth <n>] [--json]
 * Examples:
 *   ooxml block-or-inline w:r
 *   ooxml kind w:tbl --depth 3
 */
export async function runBlockOrInlineCLI(args) {
  let qname = null;
  let depth = 2;
  let json = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!qname && !a.startsWith('--')) {
      qname = a;
      continue;
    }
    if (a === '--depth') {
      depth = parseInt(args[i + 1], 10) || 2;
      i++;
      continue;
    }
    if (a === '--json') {
      json = true;
      continue;
    }
  }

  if (!qname) {
    console.error('Usage: ooxml block-or-inline <QName> [--xsd <dir>] [--depth <n>] [--json]');
    process.exit(2);
  }

  const kind = classifyBlockOrInline(qname, depth);

  if (json) {
    console.log(JSON.stringify({ qname, kind, depth }, null, 2));
  } else {
    console.log(kind);
  }
}
