import { useLayoutEffect, useRef, type FC } from 'react';
import { CheckCheck } from 'lucide-react';

import { cn } from '@/utils';
import BotAvatar from '@/components/BotAvatar';
import ChatAvatar from '@/views/user-chat/components/ChatAvatar';
import type { ChatMessage } from '@/types/chat';
import type { AvatarTone } from '@/views/user-chat/types';
import { formatDateLabel, formatMessageTime } from '@/views/user-chat/utils';

/** 离底部不超过这个距离就算「正在看最新消息」，来新消息时才跟着滚到底 */
const STICK_TO_BOTTOM_PX = 80;

interface MessageListProps {
  /** 旧的在前 */
  messages: ChatMessage[];
  loading: boolean;
  userName: string;
  userTone: AvatarTone;
  botName: string;
  hasMore: boolean;
  loadingOlder: boolean;
  onLoadOlder: () => void;
}

interface MessageContentProps {
  message: ChatMessage;
}

/** 气泡正文：图片消息显示图片（保存失败时给占位）和可选图注 */
const MessageContent: FC<MessageContentProps> = ({ message }) => {
  const isImage = message.messageType === 'image';

  return (
    <>
      {isImage ? (
        message.imageUrl ? (
          <img
            src={message.imageUrl}
            alt="Sent image"
            loading="lazy"
            className="mb-1 max-h-64 max-w-full rounded-lg object-contain"
          />
        ) : (
          <p className="mb-1 text-sm text-[#8a90a0] italic">Image unavailable</p>
        )
      ) : null}
      {message.text ? (
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
      ) : null}
    </>
  );
};

const MessageList: FC<MessageListProps> = ({
  messages,
  loading,
  userName,
  userTone,
  botName,
  hasMore,
  loadingOlder,
  onLoadOlder,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const prevRef = useRef<{ newest?: string; oldest?: string; height: number } | null>(null);
  const newest = messages.at(-1);
  const oldestId = messages[0]?.id;

  // 来了新消息（或自己刚发送）滚到底；翻出更早的历史时保持当前阅读位置不跳动
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prev = prevRef.current;
    if (!prev || prev.newest !== newest?.id) {
      if (!prev || stickRef.current || newest?.direction === 'out') {
        el.scrollTop = el.scrollHeight;
      }
    } else if (prev.oldest !== oldestId) {
      el.scrollTop += el.scrollHeight - prev.height;
    }
    prevRef.current = { newest: newest?.id, oldest: oldestId, height: el.scrollHeight };
  }, [newest?.id, newest?.direction, oldestId]);

  return (
    <div
      ref={containerRef}
      onScroll={(event) => {
        const el = event.currentTarget;
        stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_TO_BOTTOM_PX;
      }}
      className="min-h-0 flex-1 overflow-y-auto px-6 py-4"
    >
      {loading ? <p className="py-6 text-center text-sm text-[#8a90a0]">Loading...</p> : null}

      {hasMore ? (
        <div className="flex justify-center pb-2">
          <button
            type="button"
            disabled={loadingOlder}
            onClick={onLoadOlder}
            className="cursor-pointer rounded-full px-4 py-1.5 text-xs text-[#2F6EFF] hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingOlder ? 'Loading...' : 'Load earlier messages'}
          </button>
        </div>
      ) : null}

      {messages.map((message, index) => {
        const prev = messages[index - 1];
        const next = messages[index + 1];
        const isBot = message.direction === 'out';
        const dateLabel = formatDateLabel(message.createdAt);
        const newDay = !prev || formatDateLabel(prev.createdAt) !== dateLabel;
        // 连续同一发送者的消息归为一组：组首显示名字，组尾显示头像
        const isGroupStart = newDay || prev.direction !== message.direction;
        const isGroupEnd =
          !next ||
          formatDateLabel(next.createdAt) !== dateLabel ||
          next.direction !== message.direction;

        return (
          <div key={message.id}>
            {newDay ? <p className="my-6 text-center text-sm text-[#8a90a0]">{dateLabel}</p> : null}

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
                    <ChatAvatar name={userName} tone={userTone} />
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
                    {isBot ? botName : userName}
                  </p>
                ) : null}
                <MessageContent message={message} />
                <p
                  className={cn(
                    'mt-0.5 flex items-center justify-end gap-1 text-[11px]',
                    isBot ? 'text-[#4fae4e]' : 'text-[#8a90a0]',
                  )}
                >
                  {formatMessageTime(message.createdAt)}
                  {isBot ? <CheckCheck className="size-3.5" aria-label="Sent" /> : null}
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
