import type { FC } from 'react';

import ChatPanel from '@/views/user-chat/components/ChatPanel';
import ChatSidebar from '@/views/user-chat/components/ChatSidebar';
import { useUserChat } from '@/views/user-chat/hooks/useUserChat';

const UserChat: FC = () => {
  const chat = useUserChat();
  const { bot, selected } = chat;

  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-130 overflow-hidden rounded-2xl bg-white">
      <ChatSidebar
        folder={chat.folder}
        counts={chat.counts}
        chats={chat.chats}
        loading={chat.isLoading}
        selectedId={selected?.id ?? null}
        search={chat.search}
        onSearch={chat.setSearch}
        onFolderChange={chat.setFolder}
        onSelect={chat.selectChat}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        {bot && selected ? (
          <ChatPanel
            key={selected.id}
            botId={bot.id}
            botName={bot.displayName}
            botUsername={`@${bot.username}`}
            chat={selected}
            onStatusChange={(status) => chat.changeStatus(selected.id, status)}
          />
        ) : (
          <div className="grid flex-1 place-items-center text-sm text-[#8a90a0]">
            Please select chat
          </div>
        )}
      </section>
    </div>
  );
};

export default UserChat;
