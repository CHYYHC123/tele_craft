import { describe, it, expect } from 'vitest';
import { createGradientPixels, hexToRgb } from '@/utils/gradient';

const pixelAt = (pixels: Uint8ClampedArray, size: number, x: number, y: number) => {
  const offset = (y * size + x) * 4;
  return Array.from(pixels.slice(offset, offset + 4));
};

describe('hexToRgb', () => {
  it('解析带或不带 # 的 6 位 hex', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
    expect(hexToRgb('6ba587')).toEqual([107, 165, 135]);
  });

  it('非法格式抛出错误', () => {
    expect(() => hexToRgb('#fff')).toThrow('Invalid hex color');
    expect(() => hexToRgb('red')).toThrow('Invalid hex color');
  });
});

describe('createGradientPixels', () => {
  const corners = ['#000000', '#ff0000', '#00ff00', '#0000ff'] as const;

  it('输出长度为 size × size × 4，且 alpha 恒为 255', () => {
    const pixels = createGradientPixels(corners, 4);
    expect(pixels.length).toBe(4 * 4 * 4);
    for (let i = 3; i < pixels.length; i += 4) {
      expect(pixels[i]).toBe(255);
    }
  });

  it('四个角的像素等于对应的角颜色', () => {
    const size = 5;
    const pixels = createGradientPixels(corners, size);
    expect(pixelAt(pixels, size, 0, 0)).toEqual([0, 0, 0, 255]); // 左上
    expect(pixelAt(pixels, size, size - 1, 0)).toEqual([255, 0, 0, 255]); // 右上
    expect(pixelAt(pixels, size, size - 1, size - 1)).toEqual([0, 255, 0, 255]); // 右下
    expect(pixelAt(pixels, size, 0, size - 1)).toEqual([0, 0, 255, 255]); // 左下
  });

  it('上边中点为左上与右上的平均值', () => {
    const size = 3;
    const pixels = createGradientPixels(corners, size);
    expect(pixelAt(pixels, size, 1, 0)).toEqual([128, 0, 0, 255]);
  });

  it('四角颜色相同时整张图都是纯色', () => {
    const size = 3;
    const pixels = createGradientPixels(['#336699', '#336699', '#336699', '#336699'], size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        expect(pixelAt(pixels, size, x, y)).toEqual([0x33, 0x66, 0x99, 255]);
      }
    }
  });

  it('size 为 1 时只输出一个像素而不报错', () => {
    const pixels = createGradientPixels(corners, 1);
    expect(pixels.length).toBe(4);
    expect(pixelAt(pixels, 1, 0, 0)).toEqual([0, 0, 0, 255]);
  });
});
