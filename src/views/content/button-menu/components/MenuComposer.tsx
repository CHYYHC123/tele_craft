import type { FC, ReactNode } from 'react';
import { Keyboard, Mic, Paperclip } from 'lucide-react';

interface MenuComposerProps {
  /** 输入栏下方的自定义按钮键盘 */
  children: ReactNode;
}

/**
 * 菜单预览底部：输入栏 + 自定义按钮键盘。
 * 负边距抵消 PhonePreview 聊天区的 px-2 / pb-2，让底部区域贴齐屏幕左右和底边；
 * pb-6 为 PhonePreview 悬浮的 Home 横条留出空间。
 */
const MenuComposer: FC<MenuComposerProps> = ({ children }) => {
  return (
    <div className="-mx-2 -mb-2 bg-[#f1f1f2]/95 pb-6 backdrop-blur-xs">
      <div
        className="flex items-center gap-2 px-2.5 pt-2 pb-1.5 text-[#8a90a0] select-none"
        aria-hidden="true"
      >
        <Paperclip className="size-5 shrink-0" strokeWidth={1.8} />
        <div className="flex min-w-0 flex-1 items-center justify-between rounded-full border border-slate-200 bg-white py-1 pr-1 pl-3">
          <span className="truncate text-xs">Message</span>
          <span className="grid size-6 shrink-0 place-items-center rounded-md border-2 border-[#2f7cf6] bg-slate-100 text-slate-600">
            <Keyboard className="size-3.5" strokeWidth={1.8} />
          </span>
        </div>
        <Mic className="size-5 shrink-0" strokeWidth={1.8} />
      </div>

      <div className="px-1.5 pt-1">{children}</div>
    </div>
  );
};

export default MenuComposer;
