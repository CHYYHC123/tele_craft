import type { FC } from 'react';

import { useBotsQuery, useBotStatsQuery } from '@/hooks/useBots';
import { useBotStore } from '@/store/bot';
import { resolveCurrentBot } from '@/utils/bot';
import BotCase from '@/views/home/components/BotCase';
import BotInfoBar from '@/views/home/components/BotInfoBar';
import EditBotDialog from '@/views/home/components/EditBotDialog';
import StatCards from '@/views/home/components/StatCards';
import TutorialBanner from '@/views/home/components/TutorialBanner';
import UserInformation from '@/views/home/components/UserInformation';
import { BOT_CASES } from '@/views/home/constants';
import { useAutoOpenAddBot } from '@/views/home/hooks/useAutoOpenAddBot';
import { buildStatItems } from '@/views/home/utils';

const Home: FC = () => {
  useAutoOpenAddBot();
  const selectedBotId = useBotStore((state) => state.selectedBotId);
  const { data: bots = [] } = useBotsQuery();
  const currentBot = resolveCurrentBot(bots, selectedBotId);
  const { data: stats } = useBotStatsQuery(currentBot?.id);

  return (
    <div className="flex flex-col gap-4">
      {currentBot ? (
        <>
          <BotInfoBar bot={currentBot} />
          <EditBotDialog bot={currentBot} />
        </>
      ) : null}

      <StatCards items={buildStatItems(stats)} />

      <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
        <TutorialBanner />
        <BotCase items={BOT_CASES} />
      </div>

      {/* 以 botId 为 key：切换 Bot 时重置搜索与分页 */}
      <UserInformation key={currentBot?.id} botId={currentBot?.id} />
    </div>
  );
};

export default Home;
