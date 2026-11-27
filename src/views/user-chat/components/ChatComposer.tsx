import { useRef, useState, type ChangeEvent, type FC, type FormEvent } from 'react';
import { Paperclip, Smile } from 'lucide-react';
import { toast } from 'sonner';

import {
  CHAT_IMAGE_ERROR,
  CHAT_IMAGE_MAX_BYTES,
  CHAT_IMAGE_TYPES,
  COMPOSER_BLOCKED_PLACEHOLDER,
  COMPOSER_PLACEHOLDER,
} from '@/views/user-chat/constants';

const TOOL_CLASS =
  'grid size-9 cursor-pointer place-items-center rounded-full text-[#8a90a0] hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-40';

interface ChatComposerProps {
  /** 会话已关闭 */
  disabled?: boolean;
  /** 用户已屏蔽 Bot，发消息会失败 */
  blocked?: boolean;
  sending?: boolean;
  /** 发送文本，或带图注的图片；失败时 reject，输入框内容会保留 */
  onSend: (text: string, file?: File) => Promise<void>;
}

const ChatComposer: FC<ChatComposerProps> = ({
  disabled = false,
  blocked = false,
  sending = false,
  onSend,
}) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locked = disabled || blocked;

  const submit = async (file?: File) => {
    if (sending || locked) return;
    if (!file && !text.trim()) return;
    try {
      await onSend(text, file);
      setText('');
    } catch {
      // 错误已由请求拦截器 toast，这里保留输入方便重试
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 允许连续选同一个文件
    event.target.value = '';
    if (!file) return;
    if (!CHAT_IMAGE_TYPES.includes(file.type) || file.size > CHAT_IMAGE_MAX_BYTES) {
      toast.error(CHAT_IMAGE_ERROR);
      return;
    }
    void submit(file);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-[#e4e7ee] px-6 py-3"
      >
        <input
          aria-label="Message"
          value={text}
          disabled={locked}
          maxLength={4096}
          placeholder={blocked ? COMPOSER_BLOCKED_PLACEHOLDER : COMPOSER_PLACEHOLDER}
          onChange={(event) => setText(event.target.value)}
          className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8a90a0] disabled:cursor-not-allowed"
        />
        <button type="button" aria-label="Emoji" className={TOOL_CLASS}>
          <Smile className="size-5" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label="Attach image"
          disabled={locked || sending}
          onClick={() => fileInputRef.current?.click()}
          className={TOOL_CLASS}
        >
          <Paperclip className="size-5" strokeWidth={1.8} />
        </button>
      </form>
      {/* 放在表单外：表单里只有一个文本框时，回车才会触发提交 */}
      <input
        ref={fileInputRef}
        type="file"
        aria-label="Image file"
        accept={CHAT_IMAGE_TYPES.join(',')}
        hidden
        onChange={handleFileChange}
      />
    </>
  );
};

export default ChatComposer;
