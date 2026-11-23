import type { FC } from 'react';

import { cn } from '@/utils';
import type { AvatarTone } from '@/views/user-chat/types';

const TONE_CLASS: Record<AvatarTone, string> = {
  red: 'bg-gradient-to-br from-[#d9304a] to-[#2a0f1c]',
  blue: 'bg-gradient-to-b from-[#5ac8fa] to-[#1d8cf8]',
};

interface ChatAvatarProps {
  name: string;
  tone: AvatarTone;
  className?: string;
}

/** 用户头像：没有真实图片时，用首字母 + 渐变底色 */
const ChatAvatar: FC<ChatAvatarProps> = ({ name, tone, className }) => {
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white uppercase',
        TONE_CLASS[tone],
        className,
      )}
    >
      {name[0]}
    </span>
  );
};

export default ChatAvatar;
