import type { FC } from 'react';

import { useBotsQuery, useBotStartMessageQuery } from '@/hooks/useBots';
import { useBotStore } from '@/store/bot';
import { resolveCurrentBot } from '@/utils/bot';
import GraphicEditor from '@/views/content/graphic-message/components/GraphicEditor';

const GraphicMessage: FC = () => {
  const selectedBotId = useBotStore((state) => state.selectedBotId);
  const { data: bots = [] } = useBotsQuery();
  const currentBot = resolveCurrentBot(bots, selectedBotId);
  const { data: startMessage } = useBotStartMessageQuery(currentBot?.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Graphic message</h1>

      {/* 数据到位后再挂载编辑器；以 botId 为 key，切换 Bot 时重置草稿 */}
      {currentBot && startMessage ? (
        <GraphicEditor
          key={currentBot.id}
          botId={currentBot.id}
          botName={currentBot.displayName}
          startMessage={startMessage}
        />
      ) : null}
    </div>
  );
};

export default GraphicMessage;
