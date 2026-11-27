import type { FC } from 'react';

import { useBotKeyboardQuery, useBotMenuStrategyQuery, useBotsQuery } from '@/hooks/useBots';
import { useBotStore } from '@/store/bot';
import { resolveCurrentBot } from '@/utils/bot';
import ButtonMenuEditor from '@/views/content/button-menu/components/ButtonMenuEditor';

const ButtonMenu: FC = () => {
  const selectedBotId = useBotStore((state) => state.selectedBotId);
  const { data: bots = [] } = useBotsQuery();
  const currentBot = resolveCurrentBot(bots, selectedBotId);
  const { data: keyboard } = useBotKeyboardQuery(currentBot?.id);
  const { data: strategy } = useBotMenuStrategyQuery(currentBot?.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Button menu</h1>

      {/* 数据到位后再挂载编辑器；以 botId 为 key，切换 Bot 时重置草稿 */}
      {currentBot && keyboard && strategy ? (
        <ButtonMenuEditor
          key={currentBot.id}
          botId={currentBot.id}
          botName={currentBot.displayName}
          rows={keyboard.rows}
          strategy={strategy}
        />
      ) : null}
    </div>
  );
};

export default ButtonMenu;
