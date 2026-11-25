import type { FC, ReactNode } from 'react';

import { cn } from '@/utils';
import { renderMarkdown } from '@/utils/markdown-render';

interface MessageBubbleProps {
  text: string;
  /** 气泡顶部的固定标题，仅用于展示，不属于 text */
  title?: string;
  /** 选中态：外层显示蓝色描边 */
  selected?: boolean;
  /** 气泡顶部的媒体内容（图片等） */
  media?: ReactNode;
  /** 气泡右下角的时间 */
  time?: string;
  /** 气泡下方的操作按钮文案 */
  actions?: string[];
}

const MessageBubble: FC<MessageBubbleProps> = ({
  text,
  title,
  selected = false,
  media,
  time,
  actions = [],
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border-2 p-1',
        selected ? 'border-[#1d8cf8]' : 'border-transparent',
      )}
    >
      <div className="overflow-hidden rounded-xl bg-[#dff0fb] text-[#191b26]">
        {media}
        {title || text || time ? (
          <div className="px-3 py-2.5">
            {title ? (
              <p className="mb-2 text-[11px] leading-snug font-medium wrap-break-word">{title}</p>
            ) : null}
            {text ? <div className="text-[11px] leading-snug">{renderMarkdown(text)}</div> : null}
            {time ? (
              <span className="mt-0.5 block text-right text-[9px] text-[#7a93a8]">{time}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      {actions.length > 0 ? (
        <ul className="mt-1 flex flex-col gap-1">
          {actions.map((label, index) => (
            <li
              key={index}
              className="truncate rounded-lg bg-[#6fae8e] py-1.5 text-center text-[11px] text-white"
            >
              {label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default MessageBubble;
