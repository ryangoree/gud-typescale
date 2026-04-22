import { describe, expect, it } from 'vitest';
import { gudPreviewHtml } from '#src/lib/preview/html';

const typeScale = {
  p: { fontSize: '1rem', lineHeight: '1.5rem' },
  h1: { fontSize: '2rem', lineHeight: '2.5rem' },
};

const palettes = {
  blue: { 50: '#eff6ff', 500: '#3b82f6', 950: '#172554' },
};

describe('generatePreviewHtml', () => {
  it('returns a valid HTML document', () => {
    const html = gudPreviewHtml({ typeScale, palettes });
    expect(html, 'Missing DOCTYPE').toContain('<!DOCTYPE html>');
    expect(html, 'Missing closing html tag').toContain('</html>');
  });

  it('includes the type scale section when styles are provided', () => {
    const html = gudPreviewHtml({ typeScale, palettes });
    expect(html, 'Missing type scale section').toContain('id="type-scale"');
    expect(html, 'Missing p style sample').toContain('font-size: 1rem');
    expect(html, 'Missing h1 style sample').toContain('font-size: 2rem');
  });

  it('omits the type scale section when typeScale is empty', () => {
    const html = gudPreviewHtml({ typeScale: {}, palettes });
    expect(html, 'Type scale section should be absent').not.toContain('id="type-scale"');
    expect(html, 'Color section should still be present').toContain('id="colors"');
  });

  it('includes the color palette section when palettes are provided', () => {
    const html = gudPreviewHtml({ typeScale, palettes });
    expect(html, 'Missing colors section').toContain('id="colors"');
    expect(html, 'Missing blue palette heading').toContain('<h3>blue</h3>');
    expect(html, 'Missing swatch hex value').toContain('#3b82f6');
  });

  it('omits the color section when palettes is empty', () => {
    const html = gudPreviewHtml({ typeScale, palettes: {} });
    expect(html, 'Color section should be absent').not.toContain('id="colors"');
    expect(html, 'Type scale section should still be present').toContain('id="type-scale"');
  });

  it('uses standard CSS variable names by default', () => {
    const html = gudPreviewHtml({ typeScale, palettes });
    expect(html, 'Missing font-size var').toContain('--font-size-p');
    expect(html, 'Missing line-height var').toContain('--line-height-p');
    expect(html, 'Missing utility class').toContain('.text-p');
  });

  it('uses Tailwind CSS variable names when tailwind is true', () => {
    const html = gudPreviewHtml({ typeScale, palettes, tailwind: true });
    expect(html, 'Missing --text-p var').toContain('--text-p');
    expect(html, 'Missing --leading-p var').toContain('--leading-p');
    expect(html, 'Stray --line-height-p var').not.toContain('--line-height-p');
  });

  it('applies prefix to variable names and utility classes', () => {
    const html = gudPreviewHtml({ typeScale, palettes, prefix: 'my-' });
    expect(html, 'Missing prefixed font-size var').toContain('--my-font-size-p');
    expect(html, 'Missing prefixed utility class').toContain('.my-text-p');
    expect(html, 'Missing prefixed color var').toContain('--my-color-blue-500');
  });
});
