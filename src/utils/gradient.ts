/** 四角颜色，顺序：左上、右上、右下、左下 */
export type GradientCorners = readonly [string, string, string, string];

const HEX_PATTERN = /^#?([0-9a-f]{6})$/i;

/** `#rrggbb`（`#` 可省略）→ `[r, g, b]`，非法格式直接抛错 */
export function hexToRgb(hex: string): [number, number, number] {
  const match = HEX_PATTERN.exec(hex.trim());
  if (!match) throw new Error(`Invalid hex color: ${hex}`);
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/**
 * 按四角颜色做双线性插值，生成 `size × size` 的 RGBA 像素数据（可直接用于 `ImageData`）。
 * 纯函数，不依赖 DOM，便于单测。
 */
export function createGradientPixels(
  corners: GradientCorners,
  size: number,
): Uint8ClampedArray<ArrayBuffer> {
  const [topLeft, topRight, bottomRight, bottomLeft] = corners.map(hexToRgb);
  const pixels = new Uint8ClampedArray(size * size * 4);
  // size 为 1 时只有一个像素，避免除以 0
  const span = Math.max(size - 1, 1);

  for (let y = 0; y < size; y++) {
    const v = y / span;
    for (let x = 0; x < size; x++) {
      const u = x / span;
      const offset = (y * size + x) * 4;
      for (let channel = 0; channel < 3; channel++) {
        const top = lerp(topLeft[channel], topRight[channel], u);
        const bottom = lerp(bottomLeft[channel], bottomRight[channel], u);
        pixels[offset + channel] = Math.round(lerp(top, bottom, v));
      }
      pixels[offset + 3] = 255;
    }
  }

  return pixels;
}

/** Telegram 聊天壁纸的渐变四角色（取自 TG Web 端），供手机预览复用 */
export const TELEGRAM_WALLPAPER_COLORS: GradientCorners = [
  '#dbddbb',
  '#6ba587',
  '#d5d88d',
  '#88b884',
];
