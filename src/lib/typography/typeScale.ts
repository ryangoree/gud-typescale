import { gudLineHeight, type LineHeightOptions } from '#src/lib/typography/lineHeight';
import { rounder } from '#src/lib/utils/rounder';

export interface BaseTypeScaleOptions {
  /**
   * The base font size.
   *
   * @default 16
   */
  base?: number;

  /**
   * The increment multiplier.
   *
   * @default 2
   */
  multiplier?: number;

  /**
   * The number steps it takes to go from one multiple to the next.
   *
   * @default 5
   */
  steps?: number;

  /**
   * The function used to round font sizes.
   *
   * @default rounder(0.25, 'up')
   */
  round?: (size: number) => number;
}

/**
 * A function to get a single font size in a type scale at a given index.
 *
 * @param scaleIndex - The index of the font size to calculate.
 * @param options - Options for the type scale.
 */
export function gudFontSize(scaleIndex: number, options?: BaseTypeScaleOptions): number {
  const { base = 16, multiplier = 2, steps = 5, round = rounder(0.25, 'up') } = options || {};
  return round(base * multiplier ** (scaleIndex / steps));
}

/**
 * A util function for getting an index on a scale for a given hierarchy index.
 * Uses a power function to ensure that the scale is not linear, with special
 * handling for negative indexes.
 *
 * @param index - The hierarchy index of the type style.
 */
export function gudTypeScaleIndex(index: number): number {
  const abs = Math.abs(index) ** 1.4;
  return index < 0 ? -abs : abs;
}

/**
 * The unit of measurement used in the type scale.
 *
 * ### Absolute Length Units
 *
 * | Unit   | Name                | Equivalent to            |
 * | :----- | :------------------ | :----------------------- |
 * | **cm** | Centimeters         | 1cm = 37.8px = 25.2/64in |
 * | **mm** | Millimeters         | 1mm = 1/10th of 1cm      |
 * | **Q**  | Quarter-millimeters | 1Q = 1/40th of 1cm       |
 * | **in** | Inches              | 1in = 2.54cm = 96px      |
 * | **pc** | Picas               | 1pc = 1/6th of 1in       |
 * | **pt** | Points              | 1pt = 1/72nd of 1in      |
 * | **px** | Pixels              | 1px = 1/96th of 1in      |
 *
 * ### Relative Length Units
 *
 * | Unit    | Description                                                                                                   |
 * | :------ | :------------------------------------------------------------------------------------------------------------ |
 * | **em**  | is relative to the font size of this element, or the font size of the parent element when used for font-size. |
 * | **rem** | is relative to the font size of the root element.                                                             |
 *
 * @see [MDN - Values And Units - Lengths](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units#lengths)
 */
export type TypeScaleUnit = 'cm' | 'mm' | 'Q' | 'in' | 'pc' | 'pt' | 'px' | 'em' | 'rem';

export type TypeScaleValue<TUnit extends TypeScaleUnit | undefined> = TUnit extends undefined
  ? number
  : string;

export type TypeScale<
  TStyle extends string = string,
  TUnit extends TypeScaleUnit | undefined = TypeScaleUnit | undefined,
> = Record<
  TStyle,
  {
    fontSize: TypeScaleValue<TUnit>;
    lineHeight: TypeScaleValue<TUnit>;
  }
>;

export interface TypeScaleOptions<
  TStyle extends string = string,
  TUnit extends TypeScaleUnit | undefined = TypeScaleUnit | undefined,
> extends BaseTypeScaleOptions,
    Omit<LineHeightOptions, 'multiplier'> {
  /**
   * The hierarchy of font styles to generate.
   *
   * This is an array of strings representing the font styles in the order
   * they should be generated. The first item in the array will be the smallest
   * font size, and the last item will be the largest.
   *
   * @default DEFAULT_TYPE_SCALE_HIERARCHY
   * @see {@linkcode DEFAULT_TYPE_SCALE_HIERARCHY}
   */
  hierarchy?: readonly TStyle[];

  /**
   * The index of the base font size in the hierarchy.
   *
   * This is useful if you want some styles smaller than the base.
   *
   * For example, if the hierarchy is `["footnote", "body", ...]`, then the
   * `baseIndex` would be `1` to make `"body"` the base font size.
   *
   * @default 2
   */
  baseIndex?: number;

  /**
   * A function to convert hierarchy indexes to scale indexes
   *
   * **Example**
   *
   * given the following hierarchy: `["body", "h6", "h5", "h4", "h3", "h2",
   * "h1"]` and the following scale: `[12, 14, 16, 18.25, 21, 24, 27.75, 31.75,
   * 36.5, 42, 48]` *(base: 12, multiplier: 2, steps: 5)*
   *
   * A 1 to 1 fn of `(i) => i` would mean `"body"` *(hierarchy index 0)* would
   * be `12` *(scale index 0)*, and `"h1"` *(hierarchy index 6)* would be
   * `27.75` *(scale index 6)*.
   *
   * Using `(i) => i * 1.5`, `"body"` *(hierarchy index 0)* would be `12`
   * *(scale index 0)*, and `"h1"` *(hierarchy index 6)* would be `42` *(scale
   * index 9)*.
   *
   * @default (i) => gudTypeScaleIndex(i)
   * @see {@linkcode gudTypeScaleIndex}
   */
  getScaleIndex?: (hierarchyIndex: number) => number;

  /**
   * The multiplier to use when deciding the line height of a given font size.
   * The resulting line height will be rounded up to the closest factor of the
   * `gridHeight`.
   *
   * @default 1.3
   */
  lineHeightMultiplier?: number;

  /**
   * An optional unit to add to the returned values. This will change the values
   * from numbers to strings. If provided a relative unit (`"rem"` or `"em"`),
   * the font sizes will be relative to the base font size.
   *
   * @default undefined
   */
  unit?: TUnit;
}

/**
 * The default hierarchy of font styles used by {@linkcode gudTypeScale}.
 */
export const DEFAULT_TYPE_SCALE_HIERARCHY = [
  'footnote',
  'caption',
  'p',
  'h6',
  'h5',
  'h4',
  'h3',
  'h2',
  'h1',
] as const;

/**
 * The default type scale style.
 */
export type DefaultTypeScaleStyle = (typeof DEFAULT_TYPE_SCALE_HIERARCHY)[number];

/**
 * Generate font sizes and line heights for a given hierarchy of font styles.
 *
 * @param options - Options for the type scale.
 */
export function gudTypeScale<
  TStyle extends string = DefaultTypeScaleStyle,
  TUnit extends TypeScaleUnit | undefined = undefined,
>(options?: TypeScaleOptions<TStyle, TUnit>): TypeScale<TStyle, TUnit> {
  const {
    hierarchy = DEFAULT_TYPE_SCALE_HIERARCHY,
    baseIndex = 2,
    getScaleIndex = gudTypeScaleIndex,
    base = 16,
    multiplier = 2,
    steps = 5,
    round = rounder(0.25, 'up'),
    gridHeight = 8,
    lineHeightMultiplier = 1.3,
    unit,
  } = options || {};

  return hierarchy.reduce((typeScale, style, i) => {
    const scaleIndex = getScaleIndex(i - baseIndex);
    const rawFontSize = gudFontSize(scaleIndex, {
      base,
      multiplier,
      steps,
      round,
    });
    const rawLineHeight = gudLineHeight(rawFontSize, {
      gridHeight,
      multiplier: lineHeightMultiplier,
    });

    let fontSize = rawFontSize as TypeScaleValue<TUnit>;
    let lineHeight = rawLineHeight as TypeScaleValue<TUnit>;
    if (unit === 'rem' || unit === 'em') {
      fontSize = `${parseFloat((rawFontSize / base).toFixed(4))}${unit}` as TypeScaleValue<TUnit>;
      lineHeight =
        `${parseFloat((rawLineHeight / base).toFixed(4))}${unit}` as TypeScaleValue<TUnit>;
    } else if (unit) {
      fontSize = `${rawFontSize}${unit}` as TypeScaleValue<TUnit>;
      lineHeight = `${rawLineHeight}${unit}` as TypeScaleValue<TUnit>;
    }

    typeScale[style] = {
      fontSize,
      lineHeight,
    };

    return typeScale;
  }, {} as TypeScale);
}

/**
 * Options for generating CSS for a type scale.
 */
export interface TypeScaleCSSOptions<T extends TypeScale = TypeScale> {
  /**
   * The type scale to generate CSS for.
   *
   * @default gudTypeScale({ unit: 'rem' })
   * @see {@linkcode gudTypeScale}
   */
  typeScale?: T;

  /**
   * The prefix to use for the CSS classes.
   */
  prefix?: string;

  /**
   * Whether to generate CSS with [Tailwind CSS](https://tailwindcss.com/) v4
   * directives.
   *
   * @default false
   */
  tailwind?: boolean;
}

/**
 * Generate CSS for a type scale.
 */
export function gudTypeScaleCss<
  const T extends TypeScale = TypeScale<DefaultTypeScaleStyle, undefined>,
>(options?: TypeScaleCSSOptions<T>): string {
  const {
    typeScale = gudTypeScale({ unit: 'rem' }),
    prefix = '',
    tailwind = false,
  } = options || {};

  let css = '/* Generated Gud TypeScale */\n';
  css += '\n';

  if (tailwind) {
    css += '@theme {\n';
  } else {
    css += ':root {\n';
  }

  // Generate CSS custom properties (variables)
  const fontSizeVariablePrefix = tailwind ? `text-${prefix}` : 'font-size-';
  const lineHeightVariablePrefix = tailwind ? `leading-${prefix}` : 'line-height-';
  const fontSizeProperties: string[] = [];
  const lineHeightProperties: string[] = [];
  for (const [key, value] of Object.entries(typeScale)) {
    fontSizeProperties.push(`  --${fontSizeVariablePrefix}${key}: ${value.fontSize};`);
    if (tailwind) {
      fontSizeProperties.push(
        `  --${fontSizeVariablePrefix}${key}--line-height: ${value.lineHeight};`,
      );
    }
    lineHeightProperties.push(`  --${lineHeightVariablePrefix}${key}: ${value.lineHeight};`);
  }

  css += `${fontSizeProperties.join('\n')}\n`;
  css += '\n';
  css += `${lineHeightProperties.join('\n')}\n`;
  css += '}\n';

  if (!tailwind) {
    // Generate utility classes
    for (const key of Object.keys(typeScale)) {
      css += '\n';
      css += `.${prefix}text-${key} {\n`;
      css += `  font-size: var(--${fontSizeVariablePrefix}${key});\n`;
      css += `  line-height: var(--${lineHeightVariablePrefix}${key});\n`;
      css += '}\n';
      css += `.${prefix ? prefix : ''}leading-${key} {\n`;
      css += `  line-height: var(--${lineHeightVariablePrefix}${key});\n`;
      css += '}\n';
    }
  }

  return css;
}
