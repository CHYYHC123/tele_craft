import type { FC } from 'react';

import { cn } from '@/utils';

const LINK_PATTERN = /([A-Za-z0-9-]+\.(?:com|net|org|io|uz))(?=[\s!.,?]|$)/g;

interface MessageBubbleProps {
  text: string;
  /** 选中态：外层显示蓝色描边 */
  selected?: boolean;
}

const MessageBubble: FC<MessageBubbleProps> = ({ text, selected = false }) => {
  // split 带捕获组时，奇数下标即匹配到的链接
  const parts = text.split(LINK_PATTERN);

  return (
    <div className={cn('rounded-xl p-1', selected && 'border-2 border-[#1d8cf8]')}>
      <p className="rounded-xl bg-[#dff0fb] px-3 py-2.5 text-[11px] leading-snug break-words whitespace-pre-wrap text-[#191b26]">
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
    </div>
  );
};

export default MessageBubble;
