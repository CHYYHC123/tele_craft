import type { FC, ReactNode } from 'react';

import deviceFrame from '@/assets/image/content/device.png';
import tgPattern from '@/assets/image/content/tg_bg1.svg';
import GradientBackground from '@/components/GradientBackground';
import PhoneStatusBar from '@/components/PhoneStatusBar';
import type { GradientCorners } from '@/utils/gradient';

interface PhonePreviewBaseProps {
  botName: string;
  /** 图片模式下：聊天内容区底部距离（占整体高度的百分比），因背景图底部栏高度不同而异 */
  contentBottom?: number;
  /** 放在聊天区底部的内容，如消息气泡 */
  children?: ReactNode;
  /** 铺满整个手机的装饰层（不拦截点击），用于相对手机整体定位的高亮框等 */
  overlay?: ReactNode;
}

/** 图片模式：整机截图（含顶栏、壁纸、底栏）作为背景 */
interface PhonePreviewImageProps extends PhonePreviewBaseProps {
  background: string;
  wallpaperColors?: never;
  wallpaperPattern?: never;
  keyboard?: never;
}

/** canvas 模式：外壳用 device.png，状态栏 / 顶栏 / 输入栏由组件绘制，聊天壁纸使用 canvas 渐变 */
interface PhonePreviewCanvasProps extends PhonePreviewBaseProps {
  /** 聊天壁纸的四角颜色，顺序：左上、右上、右下、左下 */
  wallpaperColors: GradientCorners;
  /** 壁纸图案（SVG 地址），默认使用 tg_bg1.svg */
  wallpaperPattern?: string;
  /** 输入栏下方的自定义键盘区，如机器人的回复按钮 */
  keyboard?: ReactNode;
  background?: never;
}

export type PhonePreviewProps = PhonePreviewImageProps | PhonePreviewCanvasProps;

const PhonePreview: FC<PhonePreviewProps> = (props) => {
  const { botName, contentBottom = 14, children, overlay } = props;

  if (props.wallpaperColors) {
    return (
      <div className="relative aspect-[870/1772] w-[327px] shrink-0">
        {/* 机身外壳图（屏幕区域为不透明黑色，内容放在它上面）；容器按图片原始比例 870:1772 缩放，勿拉伸 */}
        <img src={deviceFrame} alt="" className="absolute inset-0 size-full" />

        {/* 屏幕：外壳 327×666，左右各缩进 18px、上下各缩进 16.5px → 屏幕 291×633 */}
        <div className="absolute inset-x-[18px] inset-y-[16.5px] flex flex-col overflow-hidden rounded-[41px] bg-white">
          <PhoneStatusBar />

          {/* 聊天顶栏 */}
          <div className="z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 py-2.5">
            <span className="flex items-center text-sm font-medium text-[#2AABEE]">
              <svg
                className="mr-0.5 size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              </svg>
              Chats
            </span>
            <div className="text-center">
              <div className="text-xs leading-tight font-bold text-slate-900">{botName}</div>
              <div className="text-[10px] text-slate-400">bot</div>
            </div>
            <div
              className="flex size-8 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100"
              aria-hidden="true"
            >
              <div className="flex size-full items-center justify-center bg-gradient-to-tr from-amber-400 to-amber-600 text-[11px] font-bold text-white">
                💳
              </div>
            </div>
          </div>

          {/* 聊天区：canvas 渐变壁纸 */}
          <div className="relative flex flex-1 flex-col justify-end overflow-hidden px-2 py-4">
            <div className="absolute inset-0">
              <GradientBackground
                colors={props.wallpaperColors}
                pattern={props.wallpaperPattern ?? tgPattern}
              />
            </div>
            <div className="relative mt-4 mb-auto self-center rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-slate-500 backdrop-blur-xs">
              Today
            </div>
            {children ? <div className="relative mb-3 w-full">{children}</div> : null}
          </div>

          {/* 输入栏 + 自定义键盘 */}
          <div className="z-20 shrink-0 space-y-2 border-t border-slate-200/80 bg-white px-2.5 pt-2.5 pb-2">
            <div className="flex items-center gap-2 text-slate-400" aria-hidden="true">
              <span className="p-1">
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <div className="flex flex-1 items-center justify-between rounded-full bg-slate-100 px-3.5 py-1.5 text-xs">
                <span>Message</span>
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect height="12" rx="2" strokeWidth="2" width="18" x="3" y="6" />
                  <circle cx="7" cy="10" fill="currentColor" r="1" />
                  <circle cx="12" cy="10" fill="currentColor" r="1" />
                  <circle cx="17" cy="10" fill="currentColor" r="1" />
                  <circle cx="7" cy="14" fill="currentColor" r="1" />
                  <circle cx="12" cy="14" fill="currentColor" r="1" />
                  <circle cx="17" cy="14" fill="currentColor" r="1" />
                </svg>
              </div>
              <span className="p-1">
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
            </div>

            {props.keyboard ? <div className="pt-1">{props.keyboard}</div> : null}

            <div className="mx-auto h-1 w-28 rounded-full bg-slate-300 pt-0.5" aria-hidden="true" />
          </div>
        </div>

        {/* 灵动岛 + 摄像头：盖在状态栏之上，位置按外壳图比例定位 */}
        <div
          className="absolute top-[3.8%] left-[36.2%] h-[3.75%] w-[27.6%] rounded-full bg-black"
          aria-hidden="true"
        >
          <span className="absolute top-1/2 left-[78.7%] aspect-square w-[16.7%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#3b4a7a_0%,#141a33_35%,#05060d_70%)]" />
        </div>

        {overlay ? <div className="pointer-events-none absolute inset-0">{overlay}</div> : null}
      </div>
    );
  }

  return (
    <div className="relative aspect-[560/1024] w-64 shrink-0 overflow-hidden rounded-3xl bg-white shadow-sm">
      <img src={props.background} alt="" className="absolute inset-0 size-full" />

      <p className="absolute inset-x-0 top-[7%] text-center text-[11px] font-semibold text-[#191b26]">
        {botName}
      </p>
      <span
        className="absolute top-[6.5%] right-[3.5%] size-[11%] rounded-full bg-[#f3c53f] ring-2 ring-[#1b1b1b]"
        aria-hidden="true"
      />

      <div className="absolute inset-x-[2%]" style={{ bottom: `${contentBottom}%` }}>
        {children}
      </div>

      {overlay ? <div className="pointer-events-none absolute inset-0">{overlay}</div> : null}
    </div>
  );
};

export default PhonePreview;
