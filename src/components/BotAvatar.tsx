import type { FC } from 'react';
import { CreditCard } from 'lucide-react';

import { cn } from '@/utils';

interface BotAvatarProps {
  /** 右上角的蓝色在线点 */
  badge?: boolean;
  className?: string;
}

/** 机器人头像：黑底黄色卡片 */
const BotAvatar: FC<BotAvatarProps> = ({ badge = false, className }) => {
  return (
    <span
      aria-hidden
      className={cn(
        'relative grid size-9 shrink-0 place-items-center rounded-full bg-black text-[#ffc42e]',
        className,
      )}
    >
      <CreditCard className="size-1/2" strokeWidth={2} />
      {badge ? (
        <span className="absolute top-0 right-0 size-2.5 rounded-full border-2 border-black bg-[#1d8cf8]" />
      ) : null}
    </span>
  );
};

export default BotAvatar;
