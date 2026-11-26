import type { FC } from 'react';
import { ArrowUp, Plus, Trash2 } from 'lucide-react';

import BotAvatar from '@/components/BotAvatar';
import { cn } from '@/utils';
import {
  DEFAULT_COMMAND,
  MENU_DESCRIPTION_PLACEHOLDER,
  MENU_NAME_PLACEHOLDER,
} from '@/views/content/add-menu/constants';
import type { MenuDraft } from '@/views/content/add-menu/types';

interface MenuPopupProps {
  items: MenuDraft[];
  selectedId: string | null;
  canAdd: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onSelectPrevious: (id: string) => void;
  onRemove: (id: string) => void;
}

const SIDE_BUTTON_CLASS =
  'grid size-6 cursor-pointer place-items-center rounded-full text-[#5c6170] hover:bg-[#f0f2f6] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

const AVATAR_CLASS = 'size-4';

interface CommandTextProps {
  name: string;
  description: string;
}

/** 一行命令：加粗的 /命令 + 灰色说明 */
const CommandText: FC<CommandTextProps> = ({ name, description }) => (
  <span className="flex min-w-0 items-baseline gap-1.5">
    <span className="shrink-0 text-[11px] font-semibold text-[#191b26]">/{name}</span>
    <span className="truncate text-[10px] text-[#a0a5b1]">{description}</span>
  </span>
);

/** 手机里点开「M」菜单按钮后弹出的命令列表 */
const MenuPopup: FC<MenuPopupProps> = ({
  items,
  selectedId,
  canAdd,
  onSelect,
  onAdd,
  onSelectPrevious,
  onRemove,
}) => {
  const hasItems = items.length > 0;

  return (
    <div className="relative w-[86%]">
      <div className="flex flex-col gap-0.5 rounded-xl bg-white p-1 shadow-lg">
        {hasItems ? (
          <div
            aria-disabled="true"
            className="flex cursor-not-allowed items-center gap-2 rounded-lg px-2 py-1.5"
          >
            <BotAvatar className={AVATAR_CLASS} />
            <CommandText name={DEFAULT_COMMAND.name} description={DEFAULT_COMMAND.description} />
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
                  'flex w-full cursor-pointer items-center gap-2 rounded-lg border-2 px-2 py-1 text-left',
                  selected
                    ? 'border-[#2F6EFF] bg-[#e3eefc]'
                    : 'border-transparent hover:bg-[#f6f7f9]',
                )}
              >
                <BotAvatar className={AVATAR_CLASS} />
                <CommandText
                  name={item.name.trim() || MENU_NAME_PLACEHOLDER}
                  description={item.menuDescription.trim() || MENU_DESCRIPTION_PLACEHOLDER}
                />
              </button>

              {selected ? (
                <div className="absolute top-1/2 left-full ml-1.5 flex -translate-y-1/2 flex-col gap-0.5 rounded-full bg-white p-0.5 shadow-md">
                  <button
                    type="button"
                    aria-label="Select previous menu"
                    disabled={index === 0}
                    onClick={() => onSelectPrevious(item.id)}
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
      <span className="absolute -bottom-1 left-3 size-2 rotate-45 bg-white" aria-hidden="true" />
    </div>
  );
};

export default MenuPopup;
