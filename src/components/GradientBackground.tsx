import { useEffect, useRef } from 'react';
import type { FC } from 'react';

import { cn } from '@/utils';
import { createGradientPixels } from '@/utils/gradient';
import type { GradientCorners } from '@/utils/gradient';

/** 取不到 SVG 固有尺寸时的兜底宽高比（tg_bg1/3/4 的 viewBox 为 1440×2960） */
const FALLBACK_PATTERN_ASPECT = 2960 / 1440;

interface GradientBackgroundProps {
  /** 四角颜色，顺序：左上、右上、右下、左下；请使用模块级常量，避免每次渲染重绘 */
  colors: GradientCorners;
  /** 离屏像素网格边长，越小越模糊、越省性能（画布会被 CSS 拉伸铺满） */
  resolution?: number;
  /** 叠加在渐变上的图案（SVG 地址，黑色线稿），用第二个 canvas 绘制并以 soft-light 混合 */
  pattern?: string;
  /** 图案层不透明度，0 ~ 1 */
  patternOpacity?: number;
  /** 附加样式；根节点已是 relative，不要再传 absolute/fixed 等定位类，需要定位请在外层包一层 */
  className?: string;
}

/**
 * 基于 canvas 的聊天壁纸：
 * 1. 渐变层：小尺寸像素绘制，依赖 CSS 拉伸与浏览器平滑插值
 * 2. 图案层（可选）：SVG 按容器宽度铺满、向下平铺，按设备像素比绘制保证清晰
 */
const GradientBackground: FC<GradientBackgroundProps> = ({
  colors,
  resolution = 50,
  pattern,
  patternOpacity = 0.5,
  className,
}) => {
  const gradientRef = useRef<HTMLCanvasElement>(null);
  const patternRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = gradientRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    canvas.width = resolution;
    canvas.height = resolution;

    const pixels = createGradientPixels(colors, resolution);
    ctx.putImageData(new ImageData(pixels, resolution, resolution), 0, 0);
  }, [colors, resolution]);

  useEffect(() => {
    const canvas = patternRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !pattern) return;

    const image = new Image();
    let loaded = false;

    const draw = () => {
      if (!loaded) return;
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;

      // 设置宽高会清空画布，每次重绘前无需额外 clear
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);

      const aspect =
        image.naturalWidth && image.naturalHeight
          ? image.naturalHeight / image.naturalWidth
          : FALLBACK_PATTERN_ASPECT;
      const tileWidth = canvas.width;
      const tileHeight = Math.round(tileWidth * aspect);

      // 部分浏览器（如 Firefox）绘制没有固有尺寸的 SVG 时需要显式指定 image 尺寸
      image.width = tileWidth;
      image.height = tileHeight;

      for (let y = 0; y < canvas.height; y += tileHeight) {
        ctx.drawImage(image, 0, y, tileWidth, tileHeight);
      }
    };

    image.onload = () => {
      loaded = true;
      draw();
    };
    image.src = pattern;

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);

    return () => {
      loaded = false;
      image.onload = null;
      observer.disconnect();
    };
  }, [pattern]);

  return (
    <div aria-hidden className={cn('relative isolate size-full overflow-hidden', className)}>
      <canvas ref={gradientRef} className="absolute inset-0 block size-full" />
      {pattern ? (
        <canvas
          ref={patternRef}
          className="absolute inset-0 block size-full mix-blend-soft-light"
          style={{ opacity: patternOpacity }}
        />
      ) : null}
    </div>
  );
};

export default GradientBackground;
