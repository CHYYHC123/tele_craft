import type { FC } from 'react';

import { useBotsQuery, useBotWelcomeQuery } from '@/hooks/useBots';
import { useBotStore } from '@/store/bot';
import { resolveCurrentBot } from '@/utils/bot';
import WelcomeEditor from '@/views/content/welcome-message/components/WelcomeEditor';

const WelcomeMessage: FC = () => {
  const selectedBotId = useBotStore((state) => state.selectedBotId);
  const { data: bots = [] } = useBotsQuery();
  const currentBot = resolveCurrentBot(bots, selectedBotId);
  const { data: welcome } = useBotWelcomeQuery(currentBot?.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome message</h1>

      {/* 数据到位后再挂载编辑器；以 botId 为 key，切换 Bot 时重置草稿 */}
      {currentBot && welcome ? (
        <WelcomeEditor
          key={currentBot.id}
          botId={currentBot.id}
          botName={currentBot.displayName}
          savedDescription={welcome.description}
        />
      ) : null}
    </div>
  );
};

export default WelcomeMessage;
