# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run test          # run tests (vitest)
bun run test:watch    # watch mode
bun run test:coverage # coverage report
bun run build         # tsc + tsdown (ESM + CJS)
bun run build:watch   # watch mode
bun run typecheck     # type-check without emit
bun run check         # typecheck + Biome lint
bun run fix           # Biome auto-fix
bun run check:package # publint validation
```

## Architecture

`@gud/design-system` is a library + CLI for generating design system tokens (typographic scales and color palettes), primarily targeting Tailwind CSS v4.

**Library** (`src/lib/`) — dual ESM/CJS via tsdown, exported from `src/lib/index.ts`:

- **typography/** — `typeScale.ts` exports `gudTypeScale()`, `gudFontSize()`, `gudTypeScaleCss()`. Scales use exponential progression: a base size × multiplier^step. `lineHeight.ts` exports `gudLineHeight()` for paired line heights.
- **colors/** — `colorPaletteGenerator.ts` generates color scales via OKLCH interpolation. `convert.ts`, `parse.ts`, `format.ts`, `types.ts` handle color format conversions (hex, rgb, hsl, oklch, oklab, cmyk).
- **preview/** — `html.ts` exports `generatePreviewHtml()`, which renders a standalone HTML page showing the type scale and color palettes. Supports a `previewUnit` option to display values in a different unit than the scale was generated with.
- **utils/** — small helpers: `rounder.ts` (rounding factory), `scale.ts` (value range scaling), `pxToRem.ts`, `clamp.ts`.

**CLI** (`src/cli/`) — uses `@gud/cli` framework with `@gud/cli-menu` for interactive command selection. Commands are auto-discovered from `src/cli/commands/`. **All lib imports in CLI commands must go through `#src/lib`** — never import directly from sub-paths like `#src/lib/preview/parseCss`. The lib is bundled separately by tsdown, so direct sub-path imports break after the build. The `#src/lib` alias is explicitly mapped to `src/lib/index.ts` in `tsconfig.json`.
- `typeScale` — generates CSS with type scale custom properties and Tailwind v4 `@theme` directives
- `colorPalette` — generates CSS color palette custom properties from base colors in `name=hex` format, using OKLCH interpolation
- `system` — generates the full design system in one shot: type scale CSS, color palette CSS (optional), and an HTML preview (optional via `--preview`). Accepts all options from both individual commands plus `--previewUnit` and `--previewOutput`.

## Key Details

- ES module package (`"type": "module"`); path alias `#src/*` maps to source root
- TypeScript strict mode with `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`
- Linter/formatter: Biome (not ESLint/Prettier)
- Versioning: changesets (`npm run release`)
