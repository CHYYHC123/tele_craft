import type { FC } from 'react';

import type { ChatSession } from '@/types/chat';
import { cn } from '@/utils';
import ChatAvatar from '@/views/user-chat/components/ChatAvatar';
import { formatListTime, getAvatarTone, getChatName } from '@/views/user-chat/utils';

interface ChatListItemProps {
  chat: ChatSession;
  selected: boolean;
  onSelect: (chat: ChatSession) => void;
}

const ChatListItem: FC<ChatListItemProps> = ({ chat, selected, onSelect }) => {
  const name = getChatName(chat);

  return (
    <li>
      <button
        type="button"
        aria-current={selected}
        onClick={() => onSelect(chat)}
        className={cn(
          'flex w-full cursor-pointer items-center gap-3 border-b px-4 py-2.5 text-left',
          selected
            ? 'border-[#2F6EFF] bg-[#2F6EFF] text-white'
            : 'border-[#e4e7ee] hover:bg-[#f5f6f8]',
        )}
      >
        <ChatAvatar name={name} tone={getAvatarTone(chat.telegramUserId)} className="size-10" />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-semibold">{name}</span>
            <span className={cn('shrink-0 text-xs', selected ? 'text-white/80' : 'text-[#8a90a0]')}>
              {formatListTime(chat.lastMessageAt)}
            </span>
          </span>
          <span className="mt-0.5 flex items-center justify-between gap-2">
            <span className={cn('truncate text-xs', selected ? 'text-white/90' : 'text-[#8a90a0]')}>
              {chat.lastMessagePreview}
            </span>
            {chat.unreadCount > 0 ? (
              <span
                aria-label={`${chat.unreadCount} unread`}
                className={cn(
                  'grid min-w-5 shrink-0 place-items-center rounded-full px-1.5 text-[11px] leading-5 font-semibold',
                  selected ? 'bg-white text-[#2F6EFF]' : 'bg-[#2F6EFF] text-white',
                )}
              >
                {chat.unreadCount}
              </span>
            ) : null}
          </span>
        </span>
      </button>
    </li>
  );
};

export default ChatListItem;
