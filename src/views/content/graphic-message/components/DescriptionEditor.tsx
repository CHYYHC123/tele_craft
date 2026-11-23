import type { FC } from 'react';
import { Bold, Italic, Link, List, ListOrdered } from 'lucide-react';

const TOOLS = [
  { label: 'Bold', icon: Bold },
  { label: 'Italic', icon: Italic },
  { label: 'Link', icon: Link },
  { label: 'Bulleted list', icon: List },
  { label: 'Numbered list', icon: ListOrdered },
];

interface DescriptionEditorProps {
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
}

const DescriptionEditor: FC<DescriptionEditorProps> = ({ value, maxLength, onChange }) => {
  const remaining = maxLength - value.length;

  return (
    <div>
      <div
        className="mb-2 flex items-center gap-1 text-[#8a90a0]"
        role="toolbar"
        aria-label="Formatting"
      >
        {TOOLS.map((tool) => (
          <button
            key={tool.label}
            type="button"
            aria-label={tool.label}
            className="grid size-8 cursor-pointer place-items-center rounded-md hover:bg-[#f5f6f8]"
          >
            <tool.icon className="size-4" strokeWidth={2} />
          </button>
        ))}
      </div>

      <textarea
        value={value}
        maxLength={maxLength}
        aria-label="Description"
        onChange={(event) => onChange(event.target.value)}
        className="min-h-32 w-full resize-none rounded-lg border border-[#e4e7ee] p-3 text-sm leading-relaxed outline-none focus:border-[#2F6EFF]"
      />
      <p className="mt-2 text-xs text-[#5c6170]">{remaining} characters left</p>
    </div>
  );
};

export default DescriptionEditor;
