import type { FC, ReactNode } from 'react';

import { cn } from '@/utils';

const LINK_PATTERN = /([A-Za-z0-9-]+\.(?:com|net|org|io|uz))(?=[\s!.,?]|$)/g;

interface MessageBubbleProps {
  text: string;
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
  selected = false,
  media,
  time,
  actions = [],
}) => {
  // split 带捕获组时，奇数下标即匹配到的链接
  const parts = text.split(LINK_PATTERN);

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-1',
        selected ? 'border-[#1d8cf8]' : 'border-transparent',
      )}
    >
      <div className="overflow-hidden rounded-xl bg-[#dff0fb] text-[#191b26]">
        {media}
        {text || time ? (
          <div className="px-3 py-2.5">
            {text ? (
              <p className="text-[11px] leading-snug break-words whitespace-pre-wrap">
                {parts.map((part, index) =>
                  index % 2 === 1 ? (
                    <span key={index} className="text-[#1d8cf8] underline">
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </p>
            ) : null}
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
