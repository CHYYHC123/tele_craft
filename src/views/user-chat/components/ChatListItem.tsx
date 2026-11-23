import type { FC } from 'react';

import { cn } from '@/utils';
import ChatAvatar from '@/views/user-chat/components/ChatAvatar';
import type { Chat } from '@/views/user-chat/types';
import { getLastMessagePreview } from '@/views/user-chat/utils';

interface ChatListItemProps {
  chat: Chat;
  selected: boolean;
  onSelect: (id: number) => void;
}

const ChatListItem: FC<ChatListItemProps> = ({ chat, selected, onSelect }) => {
  return (
    <li>
      <button
        type="button"
        aria-current={selected}
        onClick={() => onSelect(chat.id)}
        className={cn(
          'flex w-full cursor-pointer items-center gap-3 border-b px-4 py-2.5 text-left',
          selected
            ? 'border-[#2F6EFF] bg-[#2F6EFF] text-white'
            : 'border-[#e4e7ee] hover:bg-[#f5f6f8]',
        )}
      >
        <ChatAvatar name={chat.name} tone={chat.tone} className="size-10" />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-semibold">{chat.name}</span>
            <span className={cn('shrink-0 text-xs', selected ? 'text-white/80' : 'text-[#8a90a0]')}>
              {chat.lastTime}
            </span>
          </span>
          <span
            className={cn(
              'mt-0.5 block truncate text-xs',
              selected ? 'text-white/90' : 'text-[#8a90a0]',
            )}
          >
            {getLastMessagePreview(chat)}
          </span>
        </span>
      </button>
    </li>
  );
};

export default ChatListItem;
