import type { FC } from 'react';

import type { ChatSession, ChatStatus } from '@/types/chat';
import ChatComposer from '@/views/user-chat/components/ChatComposer';
import ChatHeader from '@/views/user-chat/components/ChatHeader';
import MessageList from '@/views/user-chat/components/MessageList';
import { useChatPanel } from '@/views/user-chat/hooks/useChatPanel';
import { getAvatarTone, getChatName } from '@/views/user-chat/utils';

interface ChatPanelProps {
  botId: string;
  botName: string;
  /** 形如 @shop_bot */
  botUsername: string;
  chat: ChatSession;
  onStatusChange: (status: ChatStatus) => void;
}

/** 右侧聊天区；父级以会话 id 为 key，切换会话时整体重置（滚动位置、输入框草稿） */
const ChatPanel: FC<ChatPanelProps> = ({ botId, botName, botUsername, chat, onStatusChange }) => {
  const panel = useChatPanel(botId, chat.id);

  return (
    <>
      <ChatHeader
        chat={chat}
        subscriber={panel.subscriber}
        botUsername={botUsername}
        onStatusChange={onStatusChange}
      />
      <MessageList
        messages={panel.messages}
        loading={panel.isLoading}
        userName={getChatName(chat)}
        userTone={getAvatarTone(chat.telegramUserId)}
        botName={botName}
        hasMore={panel.hasMore}
        loadingOlder={panel.isLoadingOlder}
        onLoadOlder={panel.loadOlder}
      />
      <ChatComposer
        disabled={chat.status === 'closed'}
        blocked={!!panel.subscriber?.unsubscribedAt}
        sending={panel.isSending}
        onSend={panel.send}
      />
    </>
  );
};

export default ChatPanel;
