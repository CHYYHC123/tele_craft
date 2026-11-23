import { MAX_BUTTONS_PER_ROW } from '@/views/content/button-menu/constants';
import type { DropPlacement, MenuRows } from '@/views/content/button-menu/types';

const withoutEmptyRows = (rows: MenuRows): MenuRows => rows.filter((row) => row.length > 0);

/**
 * 把 dragId 对应的按钮移动到 targetId 按钮的前 / 后：
 * - 目标所在行还有空位：并排插入该行；
 * - 目标所在行已满：作为新的一行插到目标行上方 / 下方。
 */
export const moveButton = (
  rows: MenuRows,
  dragId: number,
  targetId: number,
  placement: DropPlacement,
  maxPerRow: number = MAX_BUTTONS_PER_ROW,
): MenuRows => {
  if (dragId === targetId) return rows;

  const dragged = rows.flat().find((item) => item.id === dragId);
  if (!dragged) return rows;

  const rest = rows.map((row) => row.filter((item) => item.id !== dragId));
  const rowIndex = rest.findIndex((row) => row.some((item) => item.id === targetId));
  if (rowIndex === -1) return rows;

  const targetRow = rest[rowIndex];
  const offset = placement === 'after' ? 1 : 0;

  if (targetRow.length < maxPerRow) {
    const at = targetRow.findIndex((item) => item.id === targetId) + offset;
    const nextRow = [...targetRow.slice(0, at), dragged, ...targetRow.slice(at)];
    return withoutEmptyRows(rest.map((row, index) => (index === rowIndex ? nextRow : row)));
  }

  const at = rowIndex + offset;
  return withoutEmptyRows([...rest.slice(0, at), [dragged], ...rest.slice(at)]);
};

/** 把按钮单独移到最后一行 */
export const moveButtonToNewRow = (rows: MenuRows, dragId: number): MenuRows => {
  const dragged = rows.flat().find((item) => item.id === dragId);
  if (!dragged) return rows;

  const rest = rows.map((row) => row.filter((item) => item.id !== dragId));
  return withoutEmptyRows([...rest, [dragged]]);
};
