import { useState, type DragEvent, type FC } from 'react';
import { GripVertical, Keyboard, Mic, Paperclip, Plus, Trash2 } from 'lucide-react';

import { cn } from '@/utils';
import { DEFAULT_BUTTON_LABEL, MAX_BUTTONS_PER_ROW } from '@/views/content/button-menu/constants';
import type { DropPlacement, MenuButtonItem, MenuRows } from '@/views/content/button-menu/types';

interface MenuPreviewProps {
  rows: MenuRows;
  selectedId: number | null;
  canAdd: boolean;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onMove: (dragId: number, targetId: number, placement: DropPlacement) => void;
  onMoveToNewRow: (dragId: number) => void;
}

/** 手机底部：输入栏 + 自定义按钮键盘，覆盖在背景图自带的底栏之上 */
const MenuPreview: FC<MenuPreviewProps> = ({
  rows,
  selectedId,
  canAdd,
  onSelect,
  onAdd,
  onRemove,
  onMove,
  onMoveToNewRow,
}) => {
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const allowDrop = (event: DragEvent) => {
    if (draggingId !== null) event.preventDefault();
  };

  const handleDropOnButton = (
    event: DragEvent<HTMLDivElement>,
    row: MenuButtonItem[],
    target: MenuButtonItem,
  ) => {
    event.preventDefault();
    if (draggingId === null) return;

    const rect = event.currentTarget.getBoundingClientRect();
    // 目标行（不含被拖拽的按钮）已满时按上下判断，否则按左右判断
    const rowFull = row.filter((item) => item.id !== draggingId).length >= MAX_BUTTONS_PER_ROW;
    const before = rowFull
      ? event.clientY < rect.top + rect.height / 2
      : event.clientX < rect.left + rect.width / 2;

    onMove(draggingId, target.id, before ? 'before' : 'after');
    setDraggingId(null);
  };

  const handleDropOnAdd = (event: DragEvent) => {
    event.preventDefault();
    if (draggingId === null) return;
    onMoveToNewRow(draggingId);
    setDraggingId(null);
  };

  return (
    <div className="overflow-hidden rounded-b-2xl">
      <div className="flex items-center gap-1.5 bg-[#f6f6f7] px-2 py-1.5 text-[#8a90a0]">
        <Paperclip className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
        <div className="flex h-6 min-w-0 flex-1 items-center justify-between rounded-full border border-[#d9dce3] bg-white pr-0.5 pl-2.5 text-[10px] text-[#a0a5b1]">
          Message
          <span
            className={cn(
              'grid size-5 place-items-center rounded-md border',
              rows.length === 0 ? 'border-[#2F6EFF]' : 'border-transparent',
            )}
          >
            <Keyboard className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
          </span>
        </div>
        <Mic className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-1 bg-[#d7e6cf] px-1.5 pt-1.5 pb-1">
        {rows.map((row) => (
          <div key={row[0].id} role="group" aria-label="Menu row" className="flex gap-1">
            {row.map((item) => {
              const label = item.name.trim() || DEFAULT_BUTTON_LABEL;
              const selected = item.id === selectedId;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', String(item.id));
                    event.dataTransfer.effectAllowed = 'move';
                    setDraggingId(item.id);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  onDragOver={allowDrop}
                  onDrop={(event) => handleDropOnButton(event, row, item)}
                  className={cn(
                    'flex h-7 min-w-0 flex-1 items-center gap-0.5 rounded-lg border-2 px-1',
                    selected ? 'border-[#2F6EFF] bg-[#e3eefc]' : 'border-transparent bg-white',
                    draggingId === item.id && 'opacity-50',
                  )}
                >
                  <GripVertical
                    className="size-3 shrink-0 cursor-grab text-[#b5bac6]"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelect(item.id)}
                    className="h-full min-w-0 flex-1 cursor-pointer truncate text-center text-[11px] font-medium text-[#191b26]"
                  >
                    {label}
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${label}`}
                    onClick={() => onRemove(item.id)}
                    className="grid size-4 shrink-0 cursor-pointer place-items-center text-[#b5bac6] hover:text-[#5c6170]"
                  >
                    <Trash2 className="size-3" strokeWidth={1.8} />
                  </button>
                </div>
              );
            })}
          </div>
        ))}

        {canAdd ? (
          <button
            type="button"
            onClick={onAdd}
            onDragOver={allowDrop}
            onDrop={handleDropOnAdd}
            className="flex h-7 w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-white/80 text-[11px] font-medium text-[#3b3f4d]"
          >
            <Plus className="size-3" strokeWidth={2} aria-hidden="true" />
            Add a button
          </button>
        ) : null}
      </div>

      <div className="bg-[#d7e6cf] pt-1 pb-1.5">
        <span className="mx-auto block h-1 w-1/2 rounded-full bg-[#111]" aria-hidden="true" />
      </div>
    </div>
  );
};

export default MenuPreview;
