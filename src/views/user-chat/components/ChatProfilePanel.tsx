import type { FC } from 'react';

import type { ChatSubscriber } from '@/types/chat';
import { formatDateTime, getChatName } from '@/views/user-chat/utils';

interface ProfileRowProps {
  label: string;
  value: string;
}

const ProfileRow: FC<ProfileRowProps> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 text-sm">
    <dt className="shrink-0 text-[#8a90a0]">{label}</dt>
    <dd className="min-w-0 truncate text-right">{value}</dd>
  </div>
);

interface ChatProfilePanelProps {
  /** 资料还在加载时为 undefined */
  subscriber: ChatSubscriber | undefined;
}

/** 聊天对象资料面板：当前正在聊天的 Telegram 用户 */
const ChatProfilePanel: FC<ChatProfilePanelProps> = ({ subscriber }) => {
  if (!subscriber) {
    return <p className="px-4 py-3 text-sm text-[#8a90a0]">Loading...</p>;
  }

  return (
    <div className="px-4 py-3">
      <h3 className="truncate text-sm font-semibold">{getChatName(subscriber)}</h3>
      {subscriber.unsubscribedAt ? (
        <p className="mt-1 text-xs text-[#d9304a]">
          This user has blocked the bot. Messages cannot be delivered.
        </p>
      ) : null}
      <dl className="mt-3 space-y-2">
        <ProfileRow
          label="Username"
          value={subscriber.username ? `@${subscriber.username}` : '-'}
        />
        <ProfileRow label="Telegram ID" value={subscriber.telegramUserId} />
        <ProfileRow label="Phone" value={subscriber.phone ?? '-'} />
        <ProfileRow label="First seen" value={formatDateTime(subscriber.firstSeenAt)} />
        <ProfileRow label="Last active" value={formatDateTime(subscriber.lastActiveAt)} />
      </dl>
    </div>
  );
};

export default ChatProfilePanel;
