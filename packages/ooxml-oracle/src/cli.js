#!/usr/bin/env node
import { runGenerator } from '../generator/src/index.js';
import { runChildrenCLI } from './children/index.js';
import { runBlockOrInlineCLI } from './block-inline-context/index.js';

const [, , cmd, ...rest] = process.argv;

switch (cmd) {
  case undefined:
    runGenerator();
    break;
  case 'children':
  case 'tags':
  case 'namespaces':
  case 'attrs':
    runChildrenCLI([cmd, ...rest]);
    break;
  case 'block-or-inline':
  case 'kind': // alias
    runBlockOrInlineCLI(rest);
    break;
  default:
    console.error(`Unknown command: ${cmd}`);
    process.exit(2);
}
