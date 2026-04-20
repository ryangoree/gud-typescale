import { describe, expect, it } from 'vitest';
import { gudTypeScale, gudTypeScaleCss } from '#src/lib/typography/typeScale';
import { rounder } from '#src/lib/utils/rounder';

describe('rounder', () => {
  it('rounds correctly', () => {
    const round = rounder(5);
    const roundUp = rounder(5, 'up');
    const roundDown = rounder(5, 'down');
    expect(round(1)).toBe(0);
    expect(round(4)).toBe(5);
    expect(roundUp(1)).toBe(5);
    expect(roundDown(4)).toBe(0);
  });
});

describe('gudTypeScale', () => {
  it('generates a style for each hierarchy item', () => {
    const hierarchy = ['xs', 's', 'm', 'l', 'xl'] as const;
    const typeScale = gudTypeScale({ hierarchy });
    hierarchy.forEach((style) => {
      expect(typeScale[style], `Entry for ${style} is missing`).toBeTruthy();
      expect(typeof typeScale[style].fontSize, `Font size for ${style} should be a number`).toBe(
        'number',
      );
      expect(
        typeof typeScale[style].lineHeight,
        `Line height for ${style} should be a number`,
      ).toBe('number');
    });
  });

  it('generates the right types based on options', () => {
    const {
      p: { fontSize: numberFontSize },
    } = gudTypeScale();
    const {
      p: { fontSize: stringFontSize },
    } = gudTypeScale({ unit: 'px' });
    expect(typeof numberFontSize, 'Font size should be a number').toBe('number');
    expect(stringFontSize, 'Font size should be a string with px unit').toMatch(/^\d+(\.\d+)?px$/);
  });
});

describe('gudTypeScaleCss', () => {
  it('generates CSS styles for the type scale', () => {
    const hierarchy = ['xs', 's', 'm', 'l', 'xl'] as const;
    const css = gudTypeScaleCss({
      typeScale: gudTypeScale({ hierarchy }),
    });
    hierarchy.forEach((style) => {
      expect(css, `Missing font size variable for ${style}`).toContain(`--font-size-${style}:`);
      expect(css, `Missing line height variable for ${style}`).toContain(`--line-height-${style}:`);
      expect(css, `Missing text class for ${style}`).toContain(`.text-${style} {`);
      expect(css, `Missing leading class for ${style}`).toContain(`.leading-${style} {`);
    });
  });

  it('generates CSS for Tailwind', () => {
    const hierarchy = ['xs', 's', 'm', 'l', 'xl'] as const;
    const css = gudTypeScaleCss({
      typeScale: gudTypeScale({ hierarchy }),
      tailwind: true,
    });
    expect(css, 'Missing @theme directive for Tailwind CSS').toContain('@theme');
    hierarchy.forEach((style) => {
      expect(css, `Missing text variable for ${style}`).toContain(`--text-${style}:`);
      expect(css, `Missing line height variable for ${style}`).toContain(
        `--text-${style}--line-height:`,
      );
      expect(css, `Missing leading variable for ${style}`).toContain(`--leading-${style}:`);
    });
  });
});
