import { rounder } from '#src/lib/utils/rounder';

export interface LineHeightOptions {
  /**
   * The multiplier to use when deciding the line height of a given font size.
   * The resulting line height will be rounded up to the closest factor of the
   * `gridHeight`.
   *
   * @default 1.3
   */
  multiplier?: number;

  /**
   * The desired grid height which will be used to round the line heights.
   *
   * @default 8
   */
  gridHeight?: number;
}

/**
 * A function to get a line height for a font size on a given baseline grid.
 *
 * @param fontSize - The font size for which a line height will be calculated.
 * @param options - Options for the baseline grid.
 */
export function gudLineHeight(fontSize: number, options?: LineHeightOptions): number {
  const { multiplier = 1.3, gridHeight = 8 } = options || {};
  return rounder(gridHeight, 'up')(fontSize * multiplier);
}
