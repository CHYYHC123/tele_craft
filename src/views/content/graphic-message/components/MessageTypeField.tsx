import type { FC } from 'react';
import { Image as ImageIcon, Type } from 'lucide-react';

import type { MessageType } from '@/views/content/graphic-message/types';

const OPTIONS = [
  { value: 'graphic', label: 'Graphic message', icon: ImageIcon },
  { value: 'text', label: 'Text message', icon: Type },
] as const;

interface MessageTypeFieldProps {
  value: MessageType;
  onChange: (value: MessageType) => void;
}

const MessageTypeField: FC<MessageTypeFieldProps> = ({ value, onChange }) => {
  return (
    <div role="radiogroup" aria-label="Message type" className="flex flex-wrap items-center gap-6">
      {OPTIONS.map((option) => (
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
