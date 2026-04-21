import { writeFileSync } from 'node:fs';
import { command } from '@gud/cli';
import { generateColorPaletteCss, generateColorPalettes } from '#src/lib';

export default command({
  description: 'Generate a CSS color palette from one or more base colors.',

  options: {
    colors: {
      alias: ['c'],
      description: 'Base colors in "name=hex" format (e.g. blue=#3b82f6).',
      type: 'array',
      required: true,
    },
    steps: {
      alias: ['s'],
      description: 'Scale steps to generate.',
      type: 'array',
      default: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    },
    lightnessMin: {
      description: 'Minimum OKLCH lightness (0-1).',
      type: 'number',
      default: 0.14,
    },
    lightnessMax: {
      description: 'Maximum OKLCH lightness (0-1).',
      type: 'number',
      default: 0.95,
    },
    chromaMin: {
      description: 'Minimum chroma multiplier (0-1).',
      type: 'number',
      default: 0.6,
    },
    chromaMax: {
      description: 'Maximum chroma multiplier (0-1).',
      type: 'number',
      default: 1.0,
    },
    prefix: {
      alias: ['p'],
      description: 'Prefix for CSS custom properties.',
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
      default: 'color-palette.css',
      required: true,
    },
  },

  handler: async ({ options }) => {
    const colorEntries = await options.colors();
    const steps = await options.steps();
    const lightnessMin = await options.lightnessMin();
    const lightnessMax = await options.lightnessMax();
    const chromaMin = await options.chromaMin();
    const chromaMax = await options.chromaMax();
    const prefix = await options.prefix();
    const tailwind = await options.tailwind();
    const output = await options.output();

    const colors = Object.fromEntries(
      colorEntries.map((entry) => {
        const eq = entry.indexOf('=');
        return [entry.slice(0, eq), entry.slice(eq + 1)];
      }),
    );

    const css = generateColorPaletteCss({
      palettes: generateColorPalettes(colors, {
        steps: steps.map(Number),
        lightnessRange: [lightnessMin, lightnessMax],
        chromaRange: [chromaMin, chromaMax],
      }),
      prefix,
      tailwind,
    });

    writeFileSync(output, css, 'utf8');
    console.log(`✅ Color palette CSS generated and saved to ${output}`);
  },
});
