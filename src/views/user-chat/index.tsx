import type { FC } from 'react';

import ChatComposer from '@/views/user-chat/components/ChatComposer';
import ChatHeader from '@/views/user-chat/components/ChatHeader';
import ChatSidebar from '@/views/user-chat/components/ChatSidebar';
import MessageList from '@/views/user-chat/components/MessageList';
import { useUserChat } from '@/views/user-chat/hooks/useUserChat';

const UserChat: FC = () => {
  const chat = useUserChat();
  const { selected } = chat;

  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-130 overflow-hidden rounded-2xl bg-white">
      <ChatSidebar
        folder={chat.folder}
        counts={chat.counts}
        chats={chat.chats}
        selectedId={selected?.id ?? null}
        search={chat.search}
        onSearch={chat.setSearch}
        onFolderChange={chat.setFolder}
        onSelect={chat.selectChat}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            <ChatHeader
              chat={selected}
              onMute={(mutedFor) => chat.muteChat(selected.id, mutedFor)}
              onOpen={() => chat.openChat(selected.id)}
              onClose={() => chat.closeChat(selected.id)}
            />
            <MessageList chat={selected} />
            <ChatComposer
              disabled={selected.folder === 'closed'}
              onSend={(text) => chat.sendMessage(selected.id, text)}
            />
          </>
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
