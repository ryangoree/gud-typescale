#!/usr/bin/env node
import { help, run } from '@gud/cli';
import { menu } from '@gud/cli-menu';

run({
  plugins: [
    help({
      helpFlags: ['help'],
      maxWidth: 120,
    }),
    menu({
      title: 'Gud Design System',
    }),
  ],
}).catch((error) => {
  console.error(String(error));
  process.exit(1);
});
