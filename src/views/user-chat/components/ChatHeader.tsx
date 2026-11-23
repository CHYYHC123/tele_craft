import { useState, type FC } from 'react';
import { Bell, BellOff, Check, RotateCcw, UserRoundCog } from 'lucide-react';

import { cn } from '@/utils';
import ChatAvatar from '@/views/user-chat/components/ChatAvatar';
import DropdownMenu from '@/views/user-chat/components/DropdownMenu';
import { BOT_USERNAME, MUTE_OPTIONS } from '@/views/user-chat/constants';
import type { Chat } from '@/views/user-chat/types';

const ACTION_CLASS =
  'grid size-9 cursor-pointer place-items-center rounded-full text-[#5c6170] hover:bg-[#f5f6f8]';

interface ChatHeaderProps {
  chat: Chat;
  onMute: (mutedFor: string) => void;
  /** 取消静音 / 重新打开 */
  onOpen: () => void;
  onClose: () => void;
}

const ChatHeader: FC<ChatHeaderProps> = ({ chat, onMute, onOpen, onClose }) => {
  const [muteMenuOpen, setMuteMenuOpen] = useState(false);
  const isMuted = chat.folder === 'muted';
  const isClosed = chat.folder === 'closed';

  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#e4e7ee] px-6 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <ChatAvatar name={chat.name} tone={chat.tone} className="size-10" />
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{chat.name}</h2>
          <p className="truncate text-xs text-[#5c6170]">
            via {BOT_USERNAME}
            {isMuted && chat.mutedFor ? ` · Muted for ${chat.mutedFor}` : null}
          </p>
        </div>
      </div>

      <div className="relative flex items-center gap-1">
        {isMuted ? (
          <button type="button" aria-label="Unmute chat" onClick={onOpen} className={ACTION_CLASS}>
            <Bell className="size-5" strokeWidth={1.8} />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Mute chat"
            aria-haspopup="menu"
            aria-expanded={muteMenuOpen}
            disabled={isClosed}
            onClick={() => setMuteMenuOpen((prev) => !prev)}
            className={cn(ACTION_CLASS, 'disabled:cursor-not-allowed disabled:opacity-40')}
          >
            <BellOff className="size-5" strokeWidth={1.8} />
          </button>
        )}

        <button type="button" aria-label="Assign chat" className={ACTION_CLASS}>
          <UserRoundCog className="size-5" strokeWidth={1.8} />
        </button>

        {isClosed ? (
          <button type="button" aria-label="Reopen chat" onClick={onOpen} className={ACTION_CLASS}>
            <RotateCcw className="size-5" strokeWidth={1.8} />
          </button>
        ) : (
          <button type="button" aria-label="Close chat" onClick={onClose} className={ACTION_CLASS}>
            <Check className="size-5" strokeWidth={1.8} />
          </button>
        )}

        <DropdownMenu
          open={muteMenuOpen}
          onClose={() => setMuteMenuOpen(false)}
          className="top-11 right-0 w-40"
        >
          <p className="border-b border-[#e4e7ee] px-4 py-2 text-sm text-[#8a90a0]">Muted</p>
          {MUTE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitem"
              onClick={() => {
                onMute(option);
                setMuteMenuOpen(false);
              }}
              className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm hover:bg-[#f5f6f8]"
            >
              {option}
            </button>
          ))}
        </DropdownMenu>
      </div>
    </header>
  );
};

export default ChatHeader;
