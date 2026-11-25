import { useState, type FC } from 'react';

import { useBotAutoReplyQuery, useBotsQuery } from '@/hooks/useBots';
import { useBotStore } from '@/store/bot';
import { cn } from '@/utils';
import { resolveCurrentBot } from '@/utils/bot';
import KeywordReplyPanel from '@/views/content/automatic-reply/components/KeywordReplyPanel';
import ReceiveReplyPanel from '@/views/content/automatic-reply/components/ReceiveReplyPanel';
import { REPLY_TABS } from '@/views/content/automatic-reply/constants';
import type { ReplyTab } from '@/views/content/automatic-reply/types';

const AutomaticReply: FC = () => {
  const [tab, setTab] = useState<ReplyTab>('keyword');
  const selectedBotId = useBotStore((state) => state.selectedBotId);
  const { data: bots = [] } = useBotsQuery();
  const currentBot = resolveCurrentBot(bots, selectedBotId);
  const { data: autoReply } = useBotAutoReplyQuery(currentBot?.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Automatic reply</h1>

      <div role="tablist" className="mt-6 flex gap-8 border-b border-[#e4e7ee]">
        {REPLY_TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            className={cn(
              'cursor-pointer pb-3 text-sm font-medium transition-colors',
              tab === item.value ? 'text-[#2F6EFF]' : 'text-[#191b26]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {/* 数据到位后再挂载；以 botId 为 key，切换 Bot 时重置草稿 */}
        {!currentBot || !autoReply ? null : tab === 'keyword' ? (
          <KeywordReplyPanel
            key={currentBot.id}
            botId={currentBot.id}
            keywordEnabled={autoReply.keywordEnabled}
            replies={autoReply.keywordReplies}
          />
        ) : (
          <ReceiveReplyPanel
            key={currentBot.id}
            botId={currentBot.id}
            savedEnabled={autoReply.receiveEnabled}
            savedContent={autoReply.receiveContent}
          />
        )}
      </div>
    </div>
  );
};

export default AutomaticReply;
