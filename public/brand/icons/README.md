# maavaDao icon variants

All share one glyph (mint "M", orange dot, open book) on a 100-unit grid; `src/components/Logo.tsx` draws the same shapes.

| File | Use |
| --- | --- |
| `maava-icon.svg` | Default: slate tile. Nav, footer, favicon, app icon |
| `maava-icon-navy.svg` | Navy tile, for white or light backgrounds that need more weight |
| `maava-icon-mint.svg` | Mint tile with navy glyph: stickers, social avatars, highlights |
| `maava-icon-white.svg` | White tile with a hairline edge: for dark photos or coloured grounds |
| `maava-icon-maskable.svg` | Full-bleed square for Android adaptive icons (glyph inside the safe zone) |
| `maava-glyph.svg` | No tile, brand colours, for navy grounds |
| `maava-glyph-light.svg` | No tile, teal and navy, for white grounds (mint is too faint on white) |
| `maava-glyph-mono-navy.svg` / `maava-glyph-mono-white.svg` | One colour, for print, stamps and watermarks |

PNG exports: `*-512.png` for each coloured variant, `maava-icon-{16,32,48,192}.png`, `maava-icon-maskable-{192,512}.png`. `src/app/favicon.ico` holds 16, 32 and 48.
