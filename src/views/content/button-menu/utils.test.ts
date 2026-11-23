import { describe, it, expect } from 'vitest';

import { createMessageConfig } from '@/utils/message-config';
import type { MenuRows } from '@/views/content/button-menu/types';
import { moveButton, moveButtonToNewRow } from '@/views/content/button-menu/utils';

const b = (id: number) => createMessageConfig(id);
const ids = (rows: MenuRows) => rows.map((row) => row.map((item) => item.id));

describe('moveButton', () => {
  it('目标行有空位时并排插入到目标前面', () => {
    const rows = [[b(1)], [b(2)]];
    expect(ids(moveButton(rows, 2, 1, 'before'))).toEqual([[2, 1]]);
  });

  it('目标行有空位时并排插入到目标后面', () => {
    const rows = [[b(1)], [b(2)]];
    expect(ids(moveButton(rows, 2, 1, 'after'))).toEqual([[1, 2]]);
  });

  it('目标行已满时，作为新的一行插到目标行下方 / 上方', () => {
    const rows = [[b(1), b(2)], [b(3)]];
    expect(ids(moveButton(rows, 3, 1, 'after', 2))).toEqual([[1, 2], [3]]);
    expect(ids(moveButton(rows, 3, 2, 'before', 2))).toEqual([[3], [1, 2]]);
  });

  it('同一行内可以调换顺序', () => {
    const rows = [[b(1), b(2)]];
    expect(ids(moveButton(rows, 1, 2, 'after', 2))).toEqual([[2, 1]]);
  });

  it('被拖走后留下的空行会被移除', () => {
    const rows = [[b(1)], [b(2)], [b(3)]];
    expect(ids(moveButton(rows, 1, 3, 'after'))).toEqual([[2], [3, 1]]);
  });

  it('拖到自己身上或找不到按钮时保持不变', () => {
    const rows = [[b(1)], [b(2)]];
    expect(moveButton(rows, 1, 1, 'after')).toBe(rows);
    expect(moveButton(rows, 9, 1, 'after')).toBe(rows);
    expect(moveButton(rows, 1, 9, 'after')).toBe(rows);
  });
});

describe('moveButtonToNewRow', () => {
  it('把按钮单独移到最后一行', () => {
    const rows = [[b(1), b(2)], [b(3)]];
    expect(ids(moveButtonToNewRow(rows, 1))).toEqual([[2], [3], [1]]);
  });

  it('原行只剩它一个时，不会留下空行', () => {
    const rows = [[b(1)], [b(2)]];
    expect(ids(moveButtonToNewRow(rows, 1))).toEqual([[2], [1]]);
  });
});
