import type { FC } from 'react';

import { useBotMenusQuery, useBotsQuery } from '@/hooks/useBots';
import { useBotStore } from '@/store/bot';
import { resolveCurrentBot } from '@/utils/bot';
import AddMenuEditor from '@/views/content/add-menu/components/AddMenuEditor';

const AddMenu: FC = () => {
  const selectedBotId = useBotStore((state) => state.selectedBotId);
  const { data: bots = [] } = useBotsQuery();
  const currentBot = resolveCurrentBot(bots, selectedBotId);
  const { data: menus } = useBotMenusQuery(currentBot?.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Add menu</h1>

      {/* 数据到位后再挂载编辑器；以 botId 为 key，切换 Bot 时重置草稿 */}
      {currentBot && menus ? (
        <AddMenuEditor
          key={currentBot.id}
          botId={currentBot.id}
          botName={currentBot.displayName}
          menus={menus}
        />
      ) : null}
    </div>
  );
};

export default AddMenu;
