import type { FC } from 'react';
import { Paperclip, Smile } from 'lucide-react';

/**
 * 菜单预览底部的输入栏。
 * 负边距抵消 PhonePreview 聊天区的 px-2 / pb-2，让白底贴齐屏幕左右和底边。
 */
const MenuComposer: FC = () => {
  return (
    <div
      className="relative -mx-2 -mb-2 flex items-center gap-2.5 bg-white px-3 pt-2 pb-5 select-none"
      aria-hidden="true"
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#2AABEE] text-[13px] font-semibold text-white">
        M
      </span>
      <Paperclip className="size-4.5 shrink-0 text-[#8a90a0]" strokeWidth={1.8} />
      <span className="min-w-0 flex-1 truncate text-[13px] text-[#8a90a0]">输入消息...</span>
      <Smile className="size-4.5 shrink-0 text-[#8a90a0]" strokeWidth={1.8} />
      <svg className="size-4.5 shrink-0 text-[#8a90a0]" viewBox="0 0 24 24" fill="none">
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    </div>
  );
};

export default MenuComposer;
