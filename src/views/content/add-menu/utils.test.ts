import { describe, it, expect } from 'vitest';

import { moveItemUp } from '@/views/content/add-menu/utils';

const items = [{ id: 1 }, { id: 2 }, { id: 3 }];

describe('moveItemUp', () => {
  it('与上一项交换位置', () => {
    expect(moveItemUp(items, 3)).toEqual([{ id: 1 }, { id: 3 }, { id: 2 }]);
  });

  it('已经在最上面时保持不变', () => {
    expect(moveItemUp(items, 1)).toBe(items);
  });

  it('找不到 id 时保持不变', () => {
    expect(moveItemUp(items, 9)).toBe(items);
  });

  it('不修改原数组', () => {
    moveItemUp(items, 2);
    expect(items).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });
});
