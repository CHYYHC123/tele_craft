import { useRef, useState } from 'react';

import { INITIAL_CHATS } from '@/views/user-chat/constants';
import type { Chat, ChatFolder } from '@/views/user-chat/types';
import {
  filterChats,
  formatDateLabel,
  formatListTime,
  formatMessageTime,
} from '@/views/user-chat/utils';

export const useUserChat = () => {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [folder, setFolderState] = useState<ChatFolder>('open');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const nextMessageId = useRef(1000);

  const folderChats = chats.filter((chat) => chat.folder === folder);
  const visibleChats = filterChats(folderChats, search);
  // 会话被静音/关闭后离开当前分组，selected 自然回到 null，右侧显示 "Please select chat"
  const selected = folderChats.find((chat) => chat.id === selectedId) ?? null;

  const counts: Record<ChatFolder, number> = {
    open: chats.filter((chat) => chat.folder === 'open').length,
    muted: chats.filter((chat) => chat.folder === 'muted').length,
    closed: chats.filter((chat) => chat.folder === 'closed').length,
  };

  const setFolder = (next: ChatFolder) => {
    setFolderState(next);
    setSelectedId(null);
    setSearch('');
  };

  const updateChat = (id: number, update: (chat: Chat) => Chat) => {
    setChats((prev) => prev.map((chat) => (chat.id === id ? update(chat) : chat)));
  };

  const muteChat = (id: number, mutedFor: string) => {
    updateChat(id, (chat) => ({ ...chat, folder: 'muted', mutedFor }));
  };

  /** 取消静音 / 重新打开：回到 Open chats */
  const openChat = (id: number) => {
    updateChat(id, (chat) => ({ ...chat, folder: 'open', mutedFor: null }));
  };

  const closeChat = (id: number) => {
    updateChat(id, (chat) => ({ ...chat, folder: 'closed', mutedFor: null }));
  };

  const sendMessage = (id: number, text: string) => {
    const content = text.trim();
    if (!content) return;
    const now = new Date();
    const messageId = nextMessageId.current++;
    updateChat(id, (chat) => ({
      ...chat,
      lastTime: formatListTime(now),
      messages: [
        ...chat.messages,
        {
          id: messageId,
          sender: 'bot',
          text: content,
          time: formatMessageTime(now),
          dateLabel: formatDateLabel(now),
        },
      ],
    }));
  };

  return {
    folder,
    setFolder,
    counts,
    search,
    setSearch,
    chats: visibleChats,
    selected,
    selectChat: setSelectedId,
    muteChat,
    openChat,
    closeChat,
    sendMessage,
  };
};
