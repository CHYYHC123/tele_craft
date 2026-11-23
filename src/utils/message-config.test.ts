import { describe, it, expect } from 'vitest';

import { appendAction, createMessageConfig, dropAction, patchAction } from '@/utils/message-config';

describe('message-config actions', () => {
  it('新建配置默认是图文消息，带一个空的操作按钮', () => {
    const config = createMessageConfig(7);

    expect(config.id).toBe(7);
    expect(config.messageType).toBe('graphic');
    expect(config.actionEnabled).toBe(false);
    expect(config.actions).toEqual([{ id: 1, name: '', link: '' }]);
  });

  it('appendAction 的 id 在现有最大值基础上递增', () => {
    const actions = [
      { id: 1, name: 'a', link: '' },
      { id: 4, name: 'b', link: '' },
    ];

    expect(appendAction(actions).map((item) => item.id)).toEqual([1, 4, 5]);
  });

  it('patchAction 只改目标项', () => {
    const actions = [
      { id: 1, name: 'a', link: '' },
      { id: 2, name: 'b', link: '' },
    ];

    expect(patchAction(actions, 2, { link: 'https://x.com' })).toEqual([
      { id: 1, name: 'a', link: '' },
      { id: 2, name: 'b', link: 'https://x.com' },
    ]);
  });

  it('dropAction 删除目标项', () => {
    const actions = [
      { id: 1, name: 'a', link: '' },
      { id: 2, name: 'b', link: '' },
    ];

    expect(dropAction(actions, 1)).toEqual([{ id: 2, name: 'b', link: '' }]);
  });
});
