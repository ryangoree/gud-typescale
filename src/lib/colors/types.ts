/**
 * Represents a color in the RGB color space with normalized values (0-1) for red, green, blue, and
 * alpha components.
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
  alpha: number;
}

/**
 * Represents a color in the OKLAB color space.
 */
export interface OKLAB {
  l: number;
  a: number;
  b: number;
  alpha: number;
}

/**
 * Represents a color in the OKLCH color space.
 */
export interface OKLCH {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

/**
 * Represents a color in the HSL color space with h in degrees (0-360) and s/l normalized (0-1).
 */
export interface HSL {
  h: number;
  s: number;
  l: number;
  alpha: number;
}

/**
 * Represents a color in the CMYK color space with normalized values (0-1).
 */
export interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
  alpha: number;
}

/**
 * Represents a color that can be in RGB, OKLAB, OKLCH, HSL, or CMYK format.
 */
export type Color = RGB | OKLAB | OKLCH | HSL | CMYK;
