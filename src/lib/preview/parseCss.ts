import type { TypeScale } from '#src/lib/typography/typeScale';

export interface ParseTypeScaleCssOptions {
  /** CSS custom property prefix used when generating the CSS. */
  prefix?: string;
  /** Whether the CSS uses Tailwind v4 directives. */
  tailwind?: boolean;
}

export interface ParsedTypeScaleCss {
  typeScale: TypeScale;
  /** Style names in document order. */
  styles: string[];
}

export function parseTypeScaleCss(
  css: string,
  { prefix = '', tailwind = false }: ParseTypeScaleCssOptions = {},
): ParsedTypeScaleCss {
  const fontSizes: Record<string, string> = {};
  const lineHeights: Record<string, string> = {};
  const styles: string[] = [];

  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (tailwind) {
    // --text-{prefix}{name}: {value}  (font size; exclude --line-height suffix entries)
    // --leading-{prefix}{name}: {value}  (line height)
    const fontSizeRegex = new RegExp(`--text-${esc(prefix)}(\\w+):\\s*([^;]+)`, 'g');
    const lineHeightRegex = new RegExp(`--leading-${esc(prefix)}(\\w+):\\s*([^;]+)`, 'g');
    for (const [match, name, fontSize] of css.matchAll(fontSizeRegex)) {
      if (!name || !fontSize) {
        throw new Error(`Unexpected font size format: ${match}`);
      }
      fontSizes[name] = fontSize.trim();
      if (!styles.includes(name)) styles.push(name);
    }
    for (const [match, name, lineHeight] of css.matchAll(lineHeightRegex)) {
      if (!name || !lineHeight) {
        throw new Error(`Unexpected line height format: ${match}`);
      }
      lineHeights[name] = lineHeight.trim();
    }
  } else {
    // --font-size-{name}: {value}
    // --line-height-{name}: {value}
    // Note: the CSS generator does not embed the prefix in non-tailwind var names.
    const fontSizeRegex = /--font-size-([\w-]+):\s*([^;]+)/g;
    const lineHeightRegex = /--line-height-([\w-]+):\s*([^;]+)/g;
    for (const [match, name, fontSize] of css.matchAll(fontSizeRegex)) {
      if (!name || !fontSize) {
        throw new Error(`Unexpected font size format: ${match}`);
      }
      fontSizes[name] = fontSize.trim();
      if (!styles.includes(name)) styles.push(name);
    }
    for (const [match, name, lineHeight] of css.matchAll(lineHeightRegex)) {
      if (!name || !lineHeight) {
        throw new Error(`Unexpected line height format: ${match}`);
      }
      lineHeights[name] = lineHeight.trim();
    }
  }

  const typeScale: TypeScale = {};
  for (const style of styles) {
    typeScale[style] = {
      fontSize: fontSizes[style] ?? '',
      lineHeight: lineHeights[style] ?? '',
    };
  }

  return { typeScale, styles };
}

export interface ParseColorPaletteCssOptions {
  /** CSS custom property prefix used when generating the CSS. */
  prefix?: string;
}

export interface ParsedColorPaletteCss {
  palettes: Record<string, Record<number, string>>;
  /** Sorted list of step values found in the CSS. */
  colorSteps: number[];
}

export function parseColorPaletteCss(
  css: string,
  { prefix = '' }: ParseColorPaletteCssOptions = {},
): ParsedColorPaletteCss {
  const palettes: Record<string, Record<number, string>> = {};
  const colorStepsSet = new Set<number>();

  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`--${esc(prefix)}color-(.+?)-(\\d+):\\s*([^;]+)`, 'g');

  for (const [match, name, stepString, value] of css.matchAll(regex)) {
    if (!name || !stepString || !value) {
      throw new Error(`Unexpected line height format: ${match}`);
    }
    const step = parseInt(stepString, 10);
    if (!palettes[name]) palettes[name] = {};
    palettes[name][step] = value.trim();
    colorStepsSet.add(step);
  }

  const colorSteps = [...colorStepsSet].sort((a, b) => a - b);
  return { palettes, colorSteps };
}
