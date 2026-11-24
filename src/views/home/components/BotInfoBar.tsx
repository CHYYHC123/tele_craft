import type { FC } from 'react';
import { Pencil } from 'lucide-react';

import BotAvatar from '@/components/BotAvatar';
import { useUiStore } from '@/store/ui';
import type { Bot } from '@/types/bot';

interface BotInfoBarProps {
  bot: Bot;
}

/** 首页顶部的当前 Bot 信息：头像、显示名（可修改）、@username */
const BotInfoBar: FC<BotInfoBarProps> = ({ bot }) => {
  const openEditBot = useUiStore((state) => state.openEditBot);

  return (
    <section aria-label="Current bot" className="flex items-center gap-3">
      <BotAvatar badge className="size-11" />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <h1 className="max-w-80 truncate text-sm font-semibold text-[#191b26]">
            {bot.displayName}
          </h1>
          <button
            type="button"
            aria-label="Edit bot"
            onClick={openEditBot}
            className="grid size-5 cursor-pointer place-items-center rounded text-[#8a90a0] hover:text-[#191b26]"
          >
            <Pencil className="size-3.5" strokeWidth={1.8} />
          </button>
        </div>
        <p className="text-xs text-[#2F6EFF]">@{bot.username}</p>
      </div>
    </section>
  );
};

export default BotInfoBar;
