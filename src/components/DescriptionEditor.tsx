import { useRef, type FC, type KeyboardEvent } from 'react';
import { Bold, Italic, Link, List, ListOrdered } from 'lucide-react';

import { applyFormat, type FormatKind } from '@/utils/markdown-format';

const TOOLS: { label: string; kind: FormatKind; icon: typeof Bold }[] = [
  { label: 'Bold', kind: 'bold', icon: Bold },
  { label: 'Italic', kind: 'italic', icon: Italic },
  { label: 'Link', kind: 'link', icon: Link },
  { label: 'Bulleted list', kind: 'bullet', icon: List },
  { label: 'Numbered list', kind: 'ordered', icon: ListOrdered },
];

interface DescriptionEditorProps {
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
}

const DescriptionEditor: FC<DescriptionEditorProps> = ({ value, maxLength, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const remaining = maxLength - value.length;

  const format = (kind: FormatKind) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const result = applyFormat(value, selectionStart, selectionEnd, kind, maxLength);
    if (result.value === value) return;

    onChange(result.value);
    // 受控组件：等 React 把新值写进 textarea 后再恢复选区
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selStart, result.selEnd);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
    const kind = event.key === 'b' ? 'bold' : event.key === 'i' ? 'italic' : null;
    if (!kind) return;
    event.preventDefault();
    format(kind);
  };

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
            // 阻止按钮抢走焦点，否则 textarea 失焦后选区会丢失
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => format(tool.kind)}
            className="grid size-8 cursor-pointer place-items-center rounded-md hover:bg-[#f5f6f8]"
          >
            <tool.icon className="size-4" strokeWidth={2} />
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        maxLength={maxLength}
        aria-label="Description"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-32 w-full resize-none rounded-lg border border-[#e4e7ee] p-3 text-sm leading-relaxed outline-none focus:border-[#2F6EFF]"
      />
      <p className="mt-2 text-xs text-[#5c6170]">{remaining} characters left</p>
    </div>
  );
};

export default DescriptionEditor;
