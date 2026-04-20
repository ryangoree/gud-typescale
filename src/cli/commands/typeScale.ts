import { writeFileSync } from 'node:fs';
import { command } from '@gud/cli';
import {
  DEFAULT_TYPE_SCALE_HIERARCHY,
  gudTypeScale,
  gudTypeScaleCss,
  rounder,
  type TypeScaleUnit,
} from '#src/lib/index';

declare module '@gud/cli' {
  interface CustomOptionTypes {
    roundDirection: 'up' | 'down' | 'nearest';
    unit: TypeScaleUnit;
  }
}

export default command({
  description: 'Generate a CSS type scale based on a hierarchy of font styles.',

  options: {
    hierarchy: {
      alias: ['h'],
      description: 'Hierarchy of font styles to generate.',
      type: 'array',
      default: [...DEFAULT_TYPE_SCALE_HIERARCHY],
    },
    base: {
      alias: ['b'],
      description: 'Base font size.',
      type: 'number',
      default: 16,
    },
    baseIndex: {
      alias: ['i'],
      description: 'Index of the base font size in the hierarchy.',
      type: 'number',
      default: 2,
    },
    multiplier: {
      alias: ['m'],
      description: 'Increment multiplier.',
      type: 'number',
      default: 2,
    },
    steps: {
      alias: ['s'],
      description: 'Steps between multiples.',
      type: 'number',
      default: 5,
    },
    round: {
      alias: ['r'],
      description: 'Font size rounding factor.',
      type: 'number',
      default: '0.25',
    },
    roundDirection: {
      alias: ['d'],
      description: 'Rounding direction.',
      type: 'string',
      customType: 'roundDirection',
      choices: ['up', 'down', 'nearest'],
      default: 'up',
    },
    gridHeight: {
      alias: ['g'],
      description: 'Line height grid size.',
      type: 'number',
      default: 8,
    },
    lineHeightMultiplier: {
      alias: ['l'],
      description: 'Line height multiplier.',
      type: 'number',
      default: 1.3,
    },
    unit: {
      alias: ['u'],
      description: 'CSS unit to append to font sizes and line heights.',
      type: 'string',
      customType: 'unit',
      choices: ['cm', 'mm', 'Q', 'in', 'pc', 'pt', 'px', 'em', 'rem'],
      default: 'rem',
    },
    prefix: {
      alias: ['p'],
      description: 'Prefix for utility classes.',
      type: 'string',
    },
    tailwind: {
      alias: ['t'],
      description: 'Generate CSS with Tailwind CSS directives.',
      type: 'boolean',
      default: false,
    },
    output: {
      alias: ['o'],
      description: 'Output file path.',
      type: 'string',
      default: 'typescale.css',
      required: true,
    },
  },

  handler: async ({ options }) => {
    const hierarchy = await options.hierarchy();
    const base = await options.base();
    const baseIndex = await options.baseIndex();
    const multiplier = await options.multiplier();
    const steps = await options.steps();
    const round = await options.round();
    const roundDirection = await options.roundDirection();
    const gridHeight = await options.gridHeight();
    const lineHeightMultiplier = await options.lineHeightMultiplier();
    const unit = await options.unit();
    const prefix = await options.prefix();
    const tailwind = await options.tailwind();
    const output = await options.output();

    const css = gudTypeScaleCss({
      typeScale: gudTypeScale({
        hierarchy,
        base,
        baseIndex,
        multiplier,
        steps,
        round: round ? rounder(round, roundDirection) : undefined,
        gridHeight,
        lineHeightMultiplier,
        unit,
      }),
      prefix,
      tailwind,
    });

    writeFileSync(output, css, 'utf8');
    console.log(`✅ Type scale CSS generated and saved to ${output}`);
  },
});
