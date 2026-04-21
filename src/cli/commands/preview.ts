import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { command } from '@gud/cli';
import { unitChoices } from '#src/cli/customTypes';
import { generatePreviewHtml, parseColorPaletteCss, parseTypeScaleCss } from '#src/lib';

declare module '@gud/cli' {
  interface CustomOptionTypes {
    previewMode: 'standalone' | 'linked';
  }
}

export default command({
  description: 'Generate an HTML preview from existing type scale and/or color palette CSS files.',

  options: {
    typeScale: {
      alias: ['t'],
      description: 'Path to a previously generated type scale CSS file.',
      type: 'string',
      required: true,
    },
    colorPalette: {
      alias: ['c'],
      description: 'Path to a previously generated color palette CSS file (optional).',
      type: 'string',
    },
    mode: {
      alias: ['m'],
      description:
        '"standalone" embeds all CSS data inline for a self-contained file. "linked" references the CSS files by path so the preview stays live when the files are updated and the page is refreshed.',
      type: 'string',
      customType: 'previewMode',
      choices: ['standalone', 'linked'],
      default: 'standalone',
    },
    output: {
      alias: ['o'],
      description: 'Output path for the HTML preview.',
      type: 'string',
      default: 'preview.html',
    },
    previewUnit: {
      description:
        'Unit used to display font-size and line-height values in the preview. Only applies in standalone mode. Defaults to the unit found in the CSS.',
      type: 'string',
      customType: 'unit',
      choices: unitChoices,
    },
    prefix: {
      alias: ['p'],
      description:
        'CSS custom property prefix that was used when the CSS was generated. Needed for correct parsing when a prefix was used.',
      type: 'string',
    },
    tailwind: {
      alias: ['T'],
      description: 'Indicates that the CSS uses Tailwind v4 directives (@theme instead of :root).',
      type: 'boolean',
      default: false,
    },
    base: {
      alias: ['b'],
      description: 'Base font size in px, used for rem/px conversions in the preview.',
      type: 'number',
      default: 16,
    },
  },

  handler: async ({ options }) => {
    const typeScalePath = await options.typeScale();
    const colorPalettePath = await options.colorPalette();
    const mode = await options.mode();
    const output = await options.output();
    const previewUnit = await options.previewUnit();
    const prefix = await options.prefix();
    const tailwind = await options.tailwind();
    const base = await options.base();

    const typeScaleCss = readFileSync(typeScalePath, 'utf8');
    const { typeScale } = parseTypeScaleCss(typeScaleCss, { prefix, tailwind });

    let palettes: Record<string, Record<number, string>> = {};
    let colorSteps: number[] = [];

    if (colorPalettePath) {
      const colorPaletteCss = readFileSync(colorPalettePath, 'utf8');
      ({ palettes, colorSteps } = parseColorPaletteCss(colorPaletteCss, { prefix }));
    }

    const linked = mode === 'linked';

    const cssFiles = linked
      ? [
          relative(dirname(resolve(output)), resolve(typeScalePath)),
          ...(colorPalettePath
            ? [relative(dirname(resolve(output)), resolve(colorPalettePath))]
            : []),
        ]
      : [];

    const html = generatePreviewHtml({
      typeScale,
      palettes,
      colorSteps,
      prefix,
      tailwind,
      previewUnit,
      base,
      linked,
      cssFiles,
    });

    writeFileSync(output, html, 'utf8');
    console.log(`✅ Design system preview saved to ${output}`);
    if (linked) {
      console.log(`   CSS files are linked — refresh the browser after updating them.`);
    }
  },
});
