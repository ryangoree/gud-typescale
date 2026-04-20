/**
 * Scales a number from one range to another.
 * @param value - The number to scale.
 * @param fromRange - The original range of the number as a tuple [min, max].
 * @param toRange - The target range to scale to as a tuple [min, max].
 * @param options - Optional settings for scaling.
 * @returns
 */
export function scale(
  value: number,
  fromRange: [min: number, max: number],
  toRange: [min: number, max: number],
  options?: {
    /**
     * Whether to clamp the output value to the target range. Defaults to false.
     */
    clamp?: boolean;
  },
): number {
  const [fromMin, fromMax] = fromRange;
  const [toMin, toMax] = toRange;
  const { clamp = false } = options || {};
  const scaledValue = ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
  if (clamp) {
    return Math.min(Math.max(scaledValue, toMin), toMax);
  }
  return scaledValue;
}
