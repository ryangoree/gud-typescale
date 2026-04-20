/**
 * Returns a new rounding function for rounding to a target multiple.
 *
 * @param targetMultiple - The multiple to which the new function will round.
 * @param direction - The direction to round.
 */
export function rounder(
  targetMultiple: number,
  direction?: 'up' | 'down' | 'nearest',
): (n: number) => number {
  switch (direction) {
    case 'up':
      return (n: number) => Math.ceil(n / targetMultiple) * targetMultiple;
    case 'down':
      return (n: number) => Math.floor(n / targetMultiple) * targetMultiple;
    default:
      return (n: number) => Math.round(n / targetMultiple) * targetMultiple;
  }
}
