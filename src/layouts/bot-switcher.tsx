import { useState, type FC } from 'react';
import { ChevronDown, CirclePlus } from 'lucide-react';

import BotAvatar from '@/components/BotAvatar';
import DropdownMenu from '@/components/DropdownMenu';
import { useBotStore } from '@/store/bot';
import { useUiStore } from '@/store/ui';
import type { Bot } from '@/types/bot';
import { cn } from '@/utils';

interface BotSwitcherProps {
  bots: Bot[];
  current: Bot;
}

const AVATAR_CLASS = 'size-5 [&_svg]:size-3';

/** 头部 Bot 选择器：展示当前 Bot，下拉切换，底部可继续添加 */
const BotSwitcher: FC<BotSwitcherProps> = ({ bots, current }) => {
  const [open, setOpen] = useState(false);
  const setSelectedBotId = useBotStore((state) => state.setSelectedBotId);
  const openAddBot = useUiStore((state) => state.openAddBot);

  const close = () => setOpen(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm font-medium text-[#191b26] opacity-80 transition-opacity hover:opacity-100 aria-expanded:opacity-100"
      >
        <BotAvatar className={AVATAR_CLASS} />
        <span className="max-w-40 truncate">{current.displayName}</span>
        <ChevronDown
          className={cn('size-4 text-[#5c6170] transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      <DropdownMenu open={open} onClose={close} className="top-full left-0 mt-1 min-w-48 py-1">
        {bots.map((bot) => (
          <button
            key={bot.id}
            type="button"
            role="menuitemradio"
            aria-checked={bot.id === current.id}
            onClick={() => {
              setSelectedBotId(bot.id);
              close();
            }}
            className={cn(
              'block w-full cursor-pointer truncate px-4 py-2 text-left text-sm text-[#191b26] hover:bg-[#f5f6f8]',
              bot.id === current.id && 'bg-[#f5f6f8]',
            )}
          >
            {bot.displayName}
          </button>
        ))}
        <div className="my-1 border-t border-[#e4e7ee]" />
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            close();
            openAddBot();
          }}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 px-4 py-2 text-sm text-[#191b26] hover:bg-[#f5f6f8]"
        >
          <CirclePlus className="size-4" aria-hidden="true" />
          Add a bot
        </button>
      </DropdownMenu>
    </div>
  );
};

export default BotSwitcher;
