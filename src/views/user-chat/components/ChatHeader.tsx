import { useState, type FC } from 'react';
import { Bell, BellOff, Check, RotateCcw, UserRoundCog } from 'lucide-react';

import { cn } from '@/utils';
import ChatAvatar from '@/views/user-chat/components/ChatAvatar';
import ChatProfilePanel from '@/views/user-chat/components/ChatProfilePanel';
import DropdownMenu from '@/components/DropdownMenu';
import type { ChatSession, ChatStatus, ChatSubscriber } from '@/types/chat';
import { getAvatarTone, getChatName } from '@/views/user-chat/utils';

const ACTION_CLASS =
  'grid size-9 cursor-pointer place-items-center rounded-full text-[#5c6170] hover:bg-[#f5f6f8]';

interface ChatHeaderProps {
  chat: ChatSession;
  /** 聊天对象资料，加载中为 undefined */
  subscriber: ChatSubscriber | undefined;
  /** 形如 @shop_bot */
  botUsername: string;
  onStatusChange: (status: ChatStatus) => void;
}

const ChatHeader: FC<ChatHeaderProps> = ({ chat, subscriber, botUsername, onStatusChange }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const isMuted = chat.status === 'muted';
  const isClosed = chat.status === 'closed';
  const name = getChatName(chat);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#e4e7ee] px-6 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <ChatAvatar name={name} tone={getAvatarTone(chat.telegramUserId)} className="size-10" />
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{name}</h2>
          <p className="truncate text-xs text-[#5c6170]">
            via {botUsername}
            {isMuted ? ' · Muted' : null}
            {subscriber?.unsubscribedAt ? ' · Blocked the bot' : null}
          </p>
        </div>
      </div>

      <div className="relative flex items-center gap-1">
        {isMuted ? (
          <button
            type="button"
            aria-label="Unmute chat"
            onClick={() => onStatusChange('open')}
            className={ACTION_CLASS}
          >
            <Bell className="size-5" strokeWidth={1.8} />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Mute chat"
            disabled={isClosed}
            onClick={() => onStatusChange('muted')}
            className={cn(ACTION_CLASS, 'disabled:cursor-not-allowed disabled:opacity-40')}
          >
            <BellOff className="size-5" strokeWidth={1.8} />
          </button>
        )}

        <button
          type="button"
          aria-label="Chat info"
          aria-haspopup="menu"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen((prev) => !prev)}
          className={ACTION_CLASS}
        >
          <UserRoundCog className="size-5" strokeWidth={1.8} />
        </button>

        {isClosed ? (
          <button
            type="button"
            aria-label="Reopen chat"
            onClick={() => onStatusChange('open')}
            className={ACTION_CLASS}
          >
            <RotateCcw className="size-5" strokeWidth={1.8} />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Close chat"
            onClick={() => onStatusChange('closed')}
            className={ACTION_CLASS}
          >
            <Check className="size-5" strokeWidth={1.8} />
          </button>
        )}

        <DropdownMenu
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          className="top-11 right-0 w-72"
        >
          <ChatProfilePanel subscriber={subscriber} />
        </DropdownMenu>
      </div>
    </header>
  );
};

export default ChatHeader;
