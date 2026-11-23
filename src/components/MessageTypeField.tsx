import type { FC } from 'react';
import { Image as ImageIcon, Link as LinkIcon, Type } from 'lucide-react';

import type { MessageType } from '@/types/message';

const OPTIONS = [
  { value: 'graphic', label: 'Graphic message', icon: ImageIcon },
  { value: 'text', label: 'Text message', icon: Type },
  { value: 'link', label: 'Link', icon: LinkIcon },
] as const;

interface MessageTypeFieldProps {
  value: MessageType;
  onChange: (value: MessageType) => void;
  /** 是否提供「Link」类型，默认只有图文 / 文本 */
  allowLink?: boolean;
}

const MessageTypeField: FC<MessageTypeFieldProps> = ({ value, onChange, allowLink = false }) => {
  const options = allowLink ? OPTIONS : OPTIONS.filter((option) => option.value !== 'link');

  return (
    <div role="radiogroup" aria-label="Message type" className="flex flex-wrap items-center gap-6">
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="message-type"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="size-4 cursor-pointer accent-[#2F6EFF]"
          />
          <span
            className="grid size-5 place-items-center rounded border border-[#c9cedb] text-[#5c6170]"
            aria-hidden="true"
          >
            <option.icon className="size-3.5" strokeWidth={1.8} />
          </span>
          {option.label}
        </label>
      ))}
    </div>
  );
};

export default MessageTypeField;
