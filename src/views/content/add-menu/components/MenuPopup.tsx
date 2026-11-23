import type { FC } from 'react';
import { ArrowUp, Plus, Trash2 } from 'lucide-react';

import type { MessageConfig } from '@/types/message';
import { cn } from '@/utils';
import {
  DEFAULT_COMMAND,
  MENU_DESCRIPTION_PLACEHOLDER,
  MENU_NAME_PLACEHOLDER,
} from '@/views/content/add-menu/constants';

interface MenuPopupProps {
  items: MessageConfig[];
  selectedId: number | null;
  canAdd: boolean;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onMoveUp: (id: number) => void;
  onRemove: (id: number) => void;
}

const SIDE_BUTTON_CLASS =
  'grid size-6 cursor-pointer place-items-center rounded-full text-[#5c6170] hover:bg-[#f0f2f6] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

/** 手机里点开「M」菜单按钮后弹出的命令列表 */
const MenuPopup: FC<MenuPopupProps> = ({
  items,
  selectedId,
  canAdd,
  onSelect,
  onAdd,
  onMoveUp,
  onRemove,
}) => {
  const hasItems = items.length > 0;

  return (
    <div className="relative w-[86%]">
      <div className="flex flex-col gap-0.5 rounded-xl bg-white p-1 shadow-lg">
        {hasItems ? (
          <div className="px-2 py-1">
            <p className="text-[11px] font-semibold text-[#191b26]">/{DEFAULT_COMMAND.name}</p>
            <p className="text-[9px] text-[#a0a5b1]">{DEFAULT_COMMAND.description}</p>
          </div>
        ) : null}

        {items.map((item, index) => {
          const selected = item.id === selectedId;

          return (
            <div key={item.id} className="relative">
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(item.id)}
                className={cn(
                  'block w-full cursor-pointer rounded-lg border-2 px-2 py-1 text-left',
                  selected ? 'border-[#2F6EFF] bg-[#e3eefc]' : 'border-transparent',
                )}
              >
                <span className="block truncate text-[11px] font-semibold text-[#191b26]">
                  /{item.name.trim() || MENU_NAME_PLACEHOLDER}
                </span>
                <span className="block truncate text-[9px] text-[#a0a5b1]">
                  {item.menuDescription.trim() || MENU_DESCRIPTION_PLACEHOLDER}
                </span>
              </button>

              {selected ? (
                <div className="absolute top-1/2 left-full ml-1.5 flex -translate-y-1/2 flex-col gap-0.5 rounded-full bg-white p-0.5 shadow-md">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => onMoveUp(item.id)}
                    className={SIDE_BUTTON_CLASS}
                  >
                    <ArrowUp className="size-3.5" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete menu"
                    onClick={() => onRemove(item.id)}
                    className={SIDE_BUTTON_CLASS}
                  >
                    <Trash2 className="size-3.5" strokeWidth={1.8} />
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}

        {canAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-[#3b3f4d]"
          >
            <Plus className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {hasItems ? 'Add' : 'Add menu'}
          </button>
        ) : null}
      </div>

      {/* 指向「M」按钮的小三角 */}
      <span
        className="absolute -bottom-1 left-[10%] size-2 rotate-45 bg-white"
        aria-hidden="true"
      />
    </div>
  );
};

export default MenuPopup;
