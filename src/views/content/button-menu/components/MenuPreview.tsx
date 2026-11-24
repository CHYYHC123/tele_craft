import { useState, type DragEvent, type FC } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

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

/** 手机输入栏下方的自定义按钮键盘（输入栏与底部横条由 PhonePreview 提供） */
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
    <div className="flex flex-col gap-1.5">
      {rows.map((row) => (
        <div key={row[0].id} role="group" aria-label="Menu row" className="flex gap-1.5">
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
                  'flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border bg-white px-3 py-2 shadow-2xs transition',
                  selected
                    ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                    : 'border-slate-200 hover:bg-slate-50',
                  draggingId === item.id && 'opacity-50',
                )}
              >
                <GripVertical
                  className="size-3 shrink-0 cursor-grab text-slate-300"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(item.id)}
                  className="min-w-0 flex-1 cursor-pointer truncate text-left text-xs font-medium text-slate-800"
                >
                  {label}
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${label}`}
                  onClick={() => onRemove(item.id)}
                  className="grid shrink-0 cursor-pointer place-items-center p-0.5 text-slate-300 transition hover:text-rose-500"
                >
                  <Trash2 className="size-3.5" strokeWidth={2} />
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
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50/70 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 active:scale-[0.98]"
        >
          <Plus className="size-4" strokeWidth={2.2} aria-hidden="true" />
          Add a button
        </button>
      ) : null}
    </div>
  );
};

export default MenuPreview;
