const DARK_INK = '#1a1a1a';
const LIGHT_INK = '#ffffff';

function relativeLuminance(hex: string): number | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1]!;
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** Dark or white text, whichever has the higher WCAG contrast on the given hex background. */
export function readableInk(background: string): string {
  const l = relativeLuminance(background);
  if (l === null) return LIGHT_INK;
  const onWhite = 1.05 / (l + 0.05);
  const onDark = (l + 0.05) / (relativeLuminance(DARK_INK)! + 0.05);
  return onDark > onWhite ? DARK_INK : LIGHT_INK;
}
