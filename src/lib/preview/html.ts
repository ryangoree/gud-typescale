import type { TypeScale, TypeScaleUnit } from '#src/lib/typography/typeScale';

export interface PreviewHtmlOptions {
  typeScale: TypeScale;
  palettes: Record<string, Record<number, string>>;
  colorSteps: number[];
  prefix?: string;
  tailwind?: boolean;
  /** Override the unit used to display font-size and line-height values in the preview. */
  previewUnit?: TypeScaleUnit;
  /** Base font size in px, used when converting between px and rem. Default: 16 */
  base?: number;
  /**
   * When true, CSS files are referenced via <link> tags instead of having
   * their data embedded inline. CSS variable values are read at runtime so the
   * preview stays live when the CSS files are updated and the page is refreshed.
   */
  linked?: boolean;
  /**
   * Paths to CSS files to include as <link> tags. Only used when `linked` is
   * true. Paths should be relative from the HTML output file.
   */
  cssFiles?: string[];
}

function toDisplayValue(value: string | number, target: TypeScaleUnit, base: number): string {
  if (typeof value === 'number') {
    if (target === 'rem') return `${parseFloat((value / base).toFixed(4))}rem`;
    if (target === 'px') return `${value}px`;
    return `${value}${target}`;
  }
  const match = String(value).match(/^(-?[\d.]+)(.+)$/);
  if (!match) return String(value);
  const [, numStr, unit] = match;
  if (!numStr || !unit) return String(value);
  const num = parseFloat(numStr);
  if (unit === target) return String(value);
  if (unit === 'rem' && target === 'px') return `${Math.round(num * base * 1000) / 1000}px`;
  if (unit === 'px' && target === 'rem') return `${parseFloat((num / base).toFixed(4))}rem`;
  return String(value);
}

export function generatePreviewHtml({
  typeScale,
  palettes,
  colorSteps,
  prefix = '',
  tailwind = false,
  previewUnit,
  base = 16,
  linked = false,
  cssFiles = [],
}: PreviewHtmlOptions): string {
  const hasTypeScale = Object.keys(typeScale).length > 0;
  const hasPalettes = Object.keys(palettes).length > 0;

  const fontSizeVariablePrefix = tailwind ? `text-${prefix}` : `${prefix}font-size-`;
  const lineHeightVariablePrefix = tailwind ? `leading-${prefix}` : `${prefix}line-height-`;

  const typeRows = Object.entries(typeScale)
    .map(([style, { fontSize, lineHeight }]) => {
      const fsVar = `--${fontSizeVariablePrefix}${style}`;
      const lhVar = `--${lineHeightVariablePrefix}${style}`;
      const utilClass = tailwind ? `.text-${prefix}${style}` : `.${prefix}text-${style}`;

      if (linked) {
        return `
    <div class="type-row">
      <div class="type-sample" style="font-size: var(${fsVar}); line-height: var(${lhVar})">The quick brown fox jumps over the lazy dog</div>
      <div class="type-meta">
        <span class="meta-name">${style}</span>
        <span class="meta-value" data-fs-var="${fsVar}" data-lh-var="${lhVar}"></span>
        <code class="meta-var">${fsVar}</code>
        <code class="meta-var">${lhVar}</code>
        <code class="meta-class" onclick="copyText(this,'${utilClass.slice(1)}')" title="Copy ${utilClass}">${utilClass}</code>
      </div>
    </div>`;
      }

      const rawFs = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
      const rawLh = typeof lineHeight === 'number' ? `${lineHeight}px` : lineHeight;
      const fs = previewUnit ? toDisplayValue(rawFs, previewUnit, base) : rawFs;
      const lh = previewUnit ? toDisplayValue(rawLh, previewUnit, base) : rawLh;
      return `
    <div class="type-row">
      <div class="type-sample" style="font-size: ${fs}; line-height: ${lh}">The quick brown fox jumps over the lazy dog</div>
      <div class="type-meta">
        <span class="meta-name">${style}</span>
        <span class="meta-value">${fs} / ${lh}</span>
        <code class="meta-var">${fsVar}</code>
        <code class="meta-var">${lhVar}</code>
        <code class="meta-class" onclick="copyText(this,'${utilClass.slice(1)}')" title="Copy ${utilClass}">${utilClass}</code>
      </div>
    </div>`;
    })
    .join('\n');

  const typeScaleSection = hasTypeScale
    ? `
    <section class="section" id="type-scale">
      <h2>Type Scale</h2>
      ${typeRows}
    </section>`
    : '';

  const paletteSections = Object.entries(palettes)
    .map(([name, scale]) => {
      const swatches = colorSteps
        .map((step) => {
          const colorVar = `--${prefix}color-${name}-${step}`;
          if (linked) {
            return `
          <div class="swatch-cell" onclick="copyVar(this,'${colorVar}')" title="Copy color">
            <div class="swatch-block" style="background: var(${colorVar})"></div>
            <span class="swatch-step">${step}</span>
            <code class="swatch-var">${colorVar}</code>
            <span class="swatch-hex" data-color-var="${colorVar}"></span>
          </div>`;
          }
          const hex = scale[step] ?? '';
          if (!hex) return '';
          return `
          <div class="swatch-cell" onclick="copyHex(this,'${hex}')" title="Copy ${hex}">
            <div class="swatch-block" style="background: ${hex}"></div>
            <span class="swatch-step">${step}</span>
            <code class="swatch-var">${colorVar}</code>
            <span class="swatch-hex">${hex}</span>
          </div>`;
        })
        .join('\n');
      return `
      <div class="palette">
        <h3>${name}</h3>
        <div class="swatch-row">${swatches}
        </div>
      </div>`;
    })
    .join('\n');

  const colorSection = hasPalettes
    ? `
    <section class="section" id="colors">
      <h2>Color Palettes</h2>
      ${paletteSections}
    </section>`
    : '';

  const linkTags = cssFiles.map((f) => `  <link rel="stylesheet" href="${f}">`).join('\n');

  const linkedScript = linked
    ? `
    var rootStyle = getComputedStyle(document.documentElement);
    document.querySelectorAll('[data-fs-var]').forEach(function(el) {
      var fs = rootStyle.getPropertyValue(el.dataset.fsVar).trim();
      var lh = rootStyle.getPropertyValue(el.dataset.lhVar).trim();
      el.textContent = fs + ' / ' + lh;
    });
    document.querySelectorAll('[data-color-var]').forEach(function(el) {
      el.textContent = rootStyle.getPropertyValue(el.dataset.colorVar).trim();
    });
    function copyVar(cell, varName) {
      var value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      navigator.clipboard.writeText(value);
      var label = cell.querySelector('.swatch-hex');
      var prev = label.textContent;
      label.textContent = 'Copied!';
      label.classList.add('copied');
      setTimeout(function() { label.textContent = prev; label.classList.remove('copied'); }, 1500);
    }`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design System Preview</title>
${linkTags ? `${linkTags}\n` : ''}  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; color: #1a1a1a; line-height: 1.5; }
    header { padding: 2rem 3rem; border-bottom: 1px solid #e0e0e0; background: #fff; }
    header h1 { font-size: 1.25rem; font-weight: 600; letter-spacing: -0.01em; }
    header p { color: #666; font-size: 0.875rem; margin-top: 0.25rem; }
    main { max-width: 1440px; margin: 0 auto; padding: 3rem 2rem; }
    .section { margin-bottom: 4rem; }
    .section h2 { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e0e0e0; }
    .palette { margin-bottom: 2rem; }
    .palette h3 { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem; text-transform: capitalize; }
    .swatch-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .swatch-cell { display: flex; flex-direction: column; flex: 1; gap: 0.25rem; cursor: pointer; user-select: none; }
    .swatch-cell:hover .swatch-block { outline: 2px solid rgba(0,0,0,0.2); outline-offset: 2px; }
    .swatch-hex.copied { color: #16a34a; font-weight: 600; }
    .swatch-block { width: 100%; aspect-ratio: 1; border-radius: 6px; border: 1px solid rgba(0,0,0,0.08); }
    .swatch-step { font-size: 0.75rem; font-weight: 600; }
    .swatch-var { font-size: 0.65rem; color: #888; font-family: ui-monospace, monospace; word-break: break-all; }
    .swatch-hex { font-size: 0.7rem; color: #666; font-family: ui-monospace, monospace; }
    .type-row { padding: 1.5rem 0; border-bottom: 1px solid #e8e8e8; display: grid; grid-template-columns: 1fr auto; gap: 2rem; align-items: baseline; }
    .type-sample { color: #1a1a1a; }
    .type-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem; min-width: 220px; }
    .meta-name { font-size: 0.75rem; font-weight: 600; }
    .meta-value { font-size: 0.7rem; color: #888; font-family: ui-monospace, monospace; }
    .meta-var { font-size: 0.7rem; color: #6b7280; font-family: ui-monospace, monospace; }
    .meta-class { font-size: 0.7rem; color: #3b82f6; font-family: ui-monospace, monospace; cursor: pointer; user-select: none; }
    .meta-class:hover { color: #1d4ed8; }
    .meta-class.copied { color: #16a34a; font-weight: 600; }
  </style>
</head>
<body>
  <header>
    <h1>Design System Preview</h1>
    <p>Generated by @gud/design-system</p>
  </header>
  <main>${colorSection}${typeScaleSection}
  </main>
  <script>
    function copyHex(cell, hex) {
      navigator.clipboard.writeText(hex);
      var label = cell.querySelector('.swatch-hex');
      label.textContent = 'Copied!';
      label.classList.add('copied');
      setTimeout(function() { label.textContent = hex; label.classList.remove('copied'); }, 1500);
    }
    function copyText(el, text) {
      navigator.clipboard.writeText(text);
      var prev = el.textContent;
      el.textContent = 'Copied!';
      el.classList.add('copied');
      setTimeout(function() { el.textContent = prev; el.classList.remove('copied'); }, 1500);
    }${linkedScript}
  </script>
</body>
</html>`;
}
