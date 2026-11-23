import { useEffect, useRef, type FC } from 'react';
import { CheckCheck } from 'lucide-react';

import { cn } from '@/utils';
import BotAvatar from '@/views/user-chat/components/BotAvatar';
import ChatAvatar from '@/views/user-chat/components/ChatAvatar';
import { BOT_NAME } from '@/views/user-chat/constants';
import type { Chat } from '@/views/user-chat/types';

interface MessageListProps {
  chat: Chat;
}

const MessageList: FC<MessageListProps> = ({ chat }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { messages } = chat;

  // 切换会话或有新消息时滚动到底部
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.id, messages.length]);

  return (
    <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
      {messages.map((message, index) => {
        const prev = messages[index - 1];
        const next = messages[index + 1];
        const isBot = message.sender === 'bot';
        const newDay = prev?.dateLabel !== message.dateLabel;
        // 连续同一发送者的消息归为一组：组首显示名字，组尾显示头像
        const isGroupStart = newDay || prev?.sender !== message.sender;
        const isGroupEnd = next?.dateLabel !== message.dateLabel || next?.sender !== message.sender;

        return (
          <div key={message.id}>
            {newDay ? (
              <p className="my-6 text-center text-sm text-[#8a90a0]">{message.dateLabel}</p>
            ) : null}

            <div
              className={cn(
                'flex items-end gap-2',
                isBot ? 'flex-row-reverse' : 'flex-row',
                isGroupStart && !newDay ? 'mt-3' : 'mt-1',
              )}
            >
              <div className="size-9 shrink-0">
                {isGroupEnd ? (
                  isBot ? (
                    <BotAvatar />
                  ) : (
                    <ChatAvatar name={chat.name} tone={chat.tone} />
                  )
                ) : null}
              </div>

              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-3 py-2',
                  isBot ? 'bg-[#e2f7cb]' : 'bg-[#f3f4f6]',
                )}
              >
                {isGroupStart ? (
                  <p
                    className={cn(
                      'text-xs font-semibold',
                      isBot ? 'text-[#2f9a6c]' : 'text-[#e1792b]',
                    )}
                  >
                    {isBot ? BOT_NAME : chat.name}
                  </p>
                ) : null}
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {message.text}
                </p>
                <p
                  className={cn(
                    'mt-0.5 flex items-center justify-end gap-1 text-[11px]',
                    isBot ? 'text-[#4fae4e]' : 'text-[#8a90a0]',
                  )}
                >
                  {message.time}
                  {isBot ? <CheckCheck className="size-3.5" aria-label="Delivered" /> : null}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
