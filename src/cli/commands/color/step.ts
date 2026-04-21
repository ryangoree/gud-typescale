import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { command } from '@gud/cli';
import { generateColorScale } from '#src/lib/index';

export default command({
  description: 'Generate a single CSS color step from a base color.',

  options: {
    color: {
      alias: ['c'],
      description: 'Base color in "name=hex" format (e.g. blue=#3b82f6).',
      type: 'string',
      required: true,
    },
    step: {
      alias: ['s'],
      description: 'Scale step to generate (e.g. 500).',
      type: 'number',
      required: true,
    },
    stepsMin: {
      description: 'Minimum step value for scale curve context.',
      type: 'number',
      default: 50,
    },
    stepsMax: {
      description: 'Maximum step value for scale curve context.',
      type: 'number',
      default: 950,
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
    amend: {
      alias: ['a'],
      description: 'Add or update the step in an existing CSS file.',
      type: 'boolean',
      default: false,
    },
  },

  handler: async ({ options }) => {
    const colorEntry = await options.color();
    const step = await options.step();
    const stepsMin = await options.stepsMin();
    const stepsMax = await options.stepsMax();
    const lightnessMin = await options.lightnessMin();
    const lightnessMax = await options.lightnessMax();
    const chromaMin = await options.chromaMin();
    const chromaMax = await options.chromaMax();
    const prefix = await options.prefix();
    const tailwind = await options.tailwind();
    const output = await options.output();
    const amend = await options.amend();

    const eq = colorEntry.indexOf('=');
    const name = colorEntry.slice(0, eq);
    const hex = colorEntry.slice(eq + 1);

    // Include stepsMin/stepsMax in the steps array so the curve is computed relative to the full
    // intended range, not just the single requested step.
    const stepsForCurve = [...new Set([stepsMin, step, stepsMax])].sort((a, b) => a - b);
    const scale = generateColorScale(hex, {
      steps: stepsForCurve,
      lightnessRange: [lightnessMin, lightnessMax],
      chromaRange: [chromaMin, chromaMax],
    });
    const value = scale[step];
    const propName = `--${prefix ?? ''}color-${name}-${step}`;

    if (amend && existsSync(output)) {
      let existing = readFileSync(output, 'utf8');
      const propPattern = new RegExp(`([ \\t]*${escapeRegex(propName)}:\\s*)([^;]+)(;)`);
      if (propPattern.test(existing)) {
        existing = existing.replace(propPattern, `$1${value}$3`);
      } else {
        const colorPropPattern = new RegExp(
          `[ \\t]*--${escapeRegex(prefix ?? '')}color-${escapeRegex(name)}-(\\d+):\\s*[^;]+;`,
          'g',
        );
        let insertIndex: number | null = null;
        let colorMatch: RegExpExecArray | null;
        while ((colorMatch = colorPropPattern.exec(existing)) !== null) {
          if (colorMatch[1] !== undefined && parseInt(colorMatch[1], 10) > step) {
            insertIndex = colorMatch.index;
            break;
          }
        }
        if (insertIndex !== null) {
          existing =
            existing.slice(0, insertIndex) +
            `  ${propName}: ${value};\n` +
            existing.slice(insertIndex);
        } else {
          existing = existing.replace(/(\n\}\n?)$/, `\n  ${propName}: ${value};\n}\n`);
        }
      }
      writeFileSync(output, existing, 'utf8');
    } else {
      const block = tailwind ? '@theme' : ':root';
      const css = `/* Generated Gud Color Palette */\n\n${block} {\n  ${propName}: ${value};\n}\n`;
      writeFileSync(output, css, 'utf8');
    }

    console.log(`✅ Color step ${propName} written to ${output}`);
  },
});

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
