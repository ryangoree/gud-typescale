import assert from 'node:assert';
import { describe, it } from 'node:test';
import { gudTypeScale, gudTypeScaleCss } from '#src/lib/typography/typeScale';
import { rounder } from '#src/lib/utils/rounder';

describe('rounder', () => {
  it('rounds correctly', () => {
    const round = rounder(5);
    const roundUp = rounder(5, 'up');
    const roundDown = rounder(5, 'down');
    assert.strictEqual(round(1), 0);
    assert.strictEqual(round(4), 5);
    assert.strictEqual(roundUp(1), 5);
    assert.strictEqual(roundDown(4), 0);
  });
});

describe('gudTypeScale', () => {
  it('generates a style for each hierarchy item', () => {
    const hierarchy = ['xs', 's', 'm', 'l', 'xl'] as const;
    const typeScale = gudTypeScale({ hierarchy });
    hierarchy.forEach((style) => {
      assert.ok(typeScale[style], `Entry for ${style} is missing`);
      assert.strictEqual(
        typeof typeScale[style].fontSize,
        'number',
        `Font size for ${style} should be a number`,
      );
      assert.strictEqual(
        typeof typeScale[style].lineHeight,
        'number',
        `Line height for ${style} should be a number`,
      );
    });
  });

  it('generates the right types based on options', () => {
    const {
      p: { fontSize: numberFontSize },
    } = gudTypeScale();
    const {
      p: { fontSize: stringFontSize },
    } = gudTypeScale({ unit: 'px' });
    assert.strictEqual(typeof numberFontSize, 'number', 'Font size should be a number');
    assert.match(stringFontSize, /^\d+(\.\d+)?px$/, 'Font size should be a string with px unit');
  });
});

describe('gudTypeScaleCss', () => {
  it('generates CSS styles for the type scale', () => {
    const hierarchy = ['xs', 's', 'm', 'l', 'xl'] as const;
    const css = gudTypeScaleCss({
      typeScale: gudTypeScale({ hierarchy }),
    });
    hierarchy.forEach((style) => {
      assert.ok(css.includes(`--font-size-${style}:`), `Missing font size variable for ${style}`);
      assert.ok(
        css.includes(`--line-height-${style}:`),
        `Missing line height variable for ${style}`,
      );
      assert.ok(css.includes(`.text-${style} {`), `Missing text class for ${style}`);
      assert.ok(css.includes(`.leading-${style} {`), `Missing leading class for ${style}`);
    });
  });

  it('generates CSS for Tailwind', () => {
    const hierarchy = ['xs', 's', 'm', 'l', 'xl'] as const;
    const css = gudTypeScaleCss({
      typeScale: gudTypeScale({ hierarchy }),
      tailwind: true,
    });
    assert.ok(css.includes('@theme'), 'Missing @theme directive for Tailwind CSS');
    hierarchy.forEach((style) => {
      assert.ok(css.includes(`--text-${style}:`), `Missing text variable for ${style}`);
      assert.ok(
        css.includes(`--text-${style}--line-height:`),
        `Missing line height variable for ${style}`,
      );
      assert.ok(css.includes(`--leading-${style}:`), `Missing leading variable for ${style}`);
    });
  });
});
