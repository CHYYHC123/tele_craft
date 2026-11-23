import type { FC } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import type { ActionButtonItem } from '@/types/message';

const INPUT_CLASS =
  'mt-1.5 h-10 w-full rounded-lg border border-[#e4e7ee] px-3 text-sm outline-none focus:border-[#2F6EFF]';

interface ActionButtonsFieldProps {
  items: ActionButtonItem[];
  onChange: (id: number, patch: Partial<Pick<ActionButtonItem, 'name' | 'link'>>) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}

const ActionButtonsField: FC<ActionButtonsFieldProps> = ({ items, onChange, onAdd, onRemove }) => {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => (
        <div key={item.id} className="relative grid grid-cols-2 gap-4">
          {index > 0 ? (
            <button
              type="button"
              aria-label="Remove action button"
              onClick={() => onRemove(item.id)}
              className="absolute top-9 -left-8 grid size-6 cursor-pointer place-items-center text-[#5c6170] hover:text-[#191b26]"
            >
              <Trash2 className="size-4" strokeWidth={1.8} />
            </button>
          ) : null}

          <label className="block text-sm font-medium">
            Button name
            <input
              value={item.name}
              onChange={(event) => onChange(item.id, { name: event.target.value })}
              className={INPUT_CLASS}
            />
          </label>
          <label className="block text-sm font-medium">
            External link
            <input
              value={item.link}
              onChange={(event) => onChange(item.id, { link: event.target.value })}
              placeholder="https://"
              className={INPUT_CLASS}
            />
          </label>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium"
      >
        <Plus className="size-4" strokeWidth={2} />
        Add new action button
      </button>
    </div>
  );
};

export default ActionButtonsField;
