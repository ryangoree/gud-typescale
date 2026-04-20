#!/usr/bin/env node
import { help, run } from '@gud/cli';

run({
  plugins: [
    help({
      helpFlags: ['help'],
      maxWidth: 120,
    }),
  ],
  defaultCommand: 'typeScale',
}).catch((error) => {
  console.error(String(error));
  process.exit(1);
});
