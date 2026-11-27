import type { FC } from 'react';
import { CircleHelp, Plus } from 'lucide-react';

import logo from '@/assets/image/login/logo.png';
import Button from '@/components/Button';
import { useBotsQuery } from '@/hooks/useBots';
import BotSwitcher from '@/layouts/bot-switcher';
import { useBotStore } from '@/store/bot';
import { useUiStore } from '@/store/ui';
import UserMenu from '@/layouts/user-menu';
import { resolveCurrentBot } from '@/utils/bot';

const AppHeader: FC = () => {
  const openAddBot = useUiStore((state) => state.openAddBot);
  const selectedBotId = useBotStore((state) => state.selectedBotId);
  const { data: bots = [] } = useBotsQuery();
  const currentBot = resolveCurrentBot(bots, selectedBotId);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e4e7ee] bg-[#f5f6f8] px-6">
      <div className="flex items-center gap-26">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="TeleCraft" className="size-8" />
          <span className="text-[15px] font-semibold tracking-tight text-[#191b26]">TeleCraft</span>
        </div>

        {currentBot ? (
          <BotSwitcher bots={bots} current={currentBot} />
        ) : (
          <Button
            className="rounded-xl"
            icon={<Plus className="size-4" strokeWidth={2.4} />}
            onClick={openAddBot}
          >
            Add a bot
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Help"
          className="grid size-9 place-items-center rounded-full text-[#5c6170]"
        >
          <CircleHelp className="size-5" strokeWidth={1.8} />
        </button>
        <UserMenu />
      </div>
    </header>
  );
};

export default AppHeader;
