import { useState, type FC } from 'react';
import { Check, Menu, Search } from 'lucide-react';

import BotAvatar from '@/views/user-chat/components/BotAvatar';
import ChatListItem from '@/views/user-chat/components/ChatListItem';
import DropdownMenu from '@/views/user-chat/components/DropdownMenu';
import EmptyChatList from '@/views/user-chat/components/EmptyChatList';
import { FOLDER_OPTIONS } from '@/views/user-chat/constants';
import type { Chat, ChatFolder } from '@/views/user-chat/types';

interface ChatSidebarProps {
  folder: ChatFolder;
  counts: Record<ChatFolder, number>;
  chats: Chat[];
  selectedId: number | null;
  search: string;
  onSearch: (value: string) => void;
  onFolderChange: (folder: ChatFolder) => void;
  onSelect: (id: number) => void;
}

const ChatSidebar: FC<ChatSidebarProps> = ({
  folder,
  counts,
  chats,
  selectedId,
  search,
  onSearch,
  onFolderChange,
  onSelect,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const title = FOLDER_OPTIONS.find((option) => option.value === folder)?.label ?? '';

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-[#e4e7ee]">
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <div className="relative flex items-center gap-3">
          <button
            type="button"
            aria-label="Chat folders"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="grid size-8 cursor-pointer place-items-center rounded-md hover:bg-[#f5f6f8]"
          >
            <Menu className="size-5" strokeWidth={1.8} />
          </button>
          <h2 className="text-base font-semibold">{title}</h2>
          <span
            aria-label={`${counts[folder]} chats`}
            className="rounded-md border border-[#e4e7ee] px-1.5 text-xs leading-5 text-[#5c6170]"
          >
            {counts[folder]}
          </span>

          <DropdownMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            className="top-10 left-0"
          >
            {FOLDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={option.value === folder}
                onClick={() => {
                  onFolderChange(option.value);
                  setMenuOpen(false);
                }}
                className="flex w-full cursor-pointer items-center justify-between gap-6 px-4 py-2.5 text-left text-sm hover:bg-[#f5f6f8]"
              >
                <span>{option.label}</span>
                {option.value === folder ? (
                  <Check className="size-4 text-[#2F6EFF]" />
                ) : (
                  <span className="text-xs text-[#8a90a0]">{counts[option.value]}</span>
                )}
              </button>
            ))}
          </DropdownMenu>
        </div>

        <BotAvatar badge className="size-10" />
      </div>

      <label className="relative mx-4 mt-4 block">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8a90a0]" />
        <input
          aria-label="Search chats"
          placeholder="Search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="h-10 w-full rounded-lg border border-[#e4e7ee] pr-3 pl-9 text-sm outline-none focus:border-[#2F6EFF]"
        />
      </label>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto border-t border-[#e4e7ee]">
        {chats.length === 0 ? (
          <EmptyChatList />
        ) : (
          <ul>
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                selected={chat.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
