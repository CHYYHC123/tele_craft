import { useState, type FC, type FormEvent } from 'react';
import { Paperclip, Smile } from 'lucide-react';

import { COMPOSER_PLACEHOLDER } from '@/views/user-chat/constants';

const TOOL_CLASS =
  'grid size-9 cursor-pointer place-items-center rounded-full text-[#8a90a0] hover:bg-[#f5f6f8]';

interface ChatComposerProps {
  disabled?: boolean;
  onSend: (text: string) => void;
}

const ChatComposer: FC<ChatComposerProps> = ({ disabled = false, onSend }) => {
  const [text, setText] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-[#e4e7ee] px-6 py-3"
    >
      <input
        aria-label="Message"
        value={text}
        disabled={disabled}
        placeholder={COMPOSER_PLACEHOLDER}
        onChange={(event) => setText(event.target.value)}
        className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8a90a0] disabled:cursor-not-allowed"
      />
      <button type="button" aria-label="Emoji" className={TOOL_CLASS}>
        <Smile className="size-5" strokeWidth={1.8} />
      </button>
      <button type="button" aria-label="Attach file" className={TOOL_CLASS}>
        <Paperclip className="size-5" strokeWidth={1.8} />
      </button>
    </form>
  );
};

export default ChatComposer;
