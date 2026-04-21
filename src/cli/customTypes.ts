import type { TypeScaleUnit } from '#src/lib';

declare module '@gud/cli' {
  interface CustomOptionTypes {
    roundDirection: 'up' | 'down' | 'nearest';
    unit: TypeScaleUnit;
  }
}

export const roundDirectionChoices = ['up', 'down', 'nearest'];
export const unitChoices = ['cm', 'mm', 'Q', 'in', 'pc', 'pt', 'px', 'em', 'rem'];
