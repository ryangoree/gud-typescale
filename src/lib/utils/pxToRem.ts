export function pxToRem(px: number, base = 16) {
  return Math.round((px / base) * 1e4) / 1e4;
}
