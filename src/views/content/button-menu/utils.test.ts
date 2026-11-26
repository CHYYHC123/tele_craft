import { describe, it, expect } from 'vitest';

import type { KeyboardButton } from '@/types/bot';
import type { MenuButtonItem, MenuRows } from '@/views/content/button-menu/types';
import {
  canPublishButton,
  createButtonDraft,
  keyboardToDraft,
  moveButton,
  moveButtonToNewRow,
  pinDrafts,
  toKeyboardParams,
  toLayoutIds,
} from '@/views/content/button-menu/utils';

const saved = (id: string, patch: Partial<KeyboardButton> = {}): KeyboardButton => ({
  id,
  text: `Button ${id}`,
  remark: '',
  messageType: 'text',
  imageUrl: null,
  description: 'Hi',
  linkUrl: null,
  buttonsEnabled: false,
  buttons: [],
  ...patch,
});

const b = (id: string) => keyboardToDraft(saved(id));
const draft = (id: string) => createButtonDraft(id);
const ids = (rows: MenuRows) => rows.map((row) => row.map((item) => item.id));

describe('moveButton', () => {
  it('目标行有空位时并排插入到目标前面', () => {
    const rows = [[b('1')], [b('2')]];
    expect(ids(moveButton(rows, '2', '1', 'before'))).toEqual([['2', '1']]);
  });

  it('目标行有空位时并排插入到目标后面', () => {
    const rows = [[b('1')], [b('2')]];
    expect(ids(moveButton(rows, '2', '1', 'after'))).toEqual([['1', '2']]);
  });

  it('目标行已满时，作为新的一行插到目标行下方 / 上方', () => {
    const rows = [[b('1'), b('2'), b('3')], [b('4')]];
    expect(ids(moveButton(rows, '4', '1', 'after'))).toEqual([['1', '2', '3'], ['4']]);
    expect(ids(moveButton(rows, '4', '3', 'before'))).toEqual([['4'], ['1', '2', '3']]);
  });

  it('每行默认最多 3 个并排', () => {
    const rows = [[b('1'), b('2')], [b('3')]];
    expect(ids(moveButton(rows, '3', '2', 'after'))).toEqual([['1', '2', '3']]);
  });

  it('同一行内可以调换顺序', () => {
    const rows = [[b('1'), b('2')]];
    expect(ids(moveButton(rows, '1', '2', 'after'))).toEqual([['2', '1']]);
  });

  it('被拖走后留下的空行会被移除', () => {
    const rows = [[b('1')], [b('2')], [b('3')]];
    expect(ids(moveButton(rows, '1', '3', 'after'))).toEqual([['2'], ['3', '1']]);
  });

  it('拖到自己身上或找不到按钮时保持不变', () => {
    const rows = [[b('1')], [b('2')]];
    expect(moveButton(rows, '1', '1', 'after')).toBe(rows);
    expect(moveButton(rows, '9', '1', 'after')).toBe(rows);
    expect(moveButton(rows, '1', '9', 'after')).toBe(rows);
  });
});

describe('moveButtonToNewRow', () => {
  it('把按钮单独移到最后一行', () => {
    const rows = [[b('1'), b('2')], [b('3')]];
    expect(ids(moveButtonToNewRow(rows, '1'))).toEqual([['2'], ['3'], ['1']]);
  });

  it('原行只剩它一个时，不会留下空行', () => {
    const rows = [[b('1')], [b('2')]];
    expect(ids(moveButtonToNewRow(rows, '1'))).toEqual([['2'], ['1']]);
  });
});

describe('toLayoutIds / pinDrafts', () => {
  it('布局请求体只带已保存的按钮，未保存的草稿不参与，也不留空行', () => {
    const rows = [[b('1'), b('2')], [draft('local-1')], [b('3')]];
    expect(toLayoutIds(rows)).toEqual([['1', '2'], ['3']]);
  });

  it('草稿固定排到已保存按钮之后，各自成一行', () => {
    const rows = [[draft('local-1')], [b('1')], [draft('local-2')]];
    expect(ids(pinDrafts(rows))).toEqual([['1'], ['local-1'], ['local-2']]);
  });
});

describe('toKeyboardParams', () => {
  it('名称与备注去掉首尾空格，text 类型不带图片', () => {
    const item: MenuButtonItem = {
      ...draft('local-1'),
      name: '  Create Card ',
      menuDescription: ' note ',
      messageType: 'text',
      description: 'Hi',
    };
    expect(toKeyboardParams(item, 'https://x/y.png')).toEqual({
      text: 'Create Card',
      remark: 'note',
      messageType: 'text',
      imageUrl: null,
      description: 'Hi',
      linkUrl: null,
      buttonsEnabled: false,
      buttons: [{ name: '', url: '' }].filter(() => false),
    });
  });

  it('graphic 类型带上图片地址，过滤掉空的跳转按钮', () => {
    const item: MenuButtonItem = {
      ...draft('local-1'),
      name: 'A',
      actionEnabled: true,
      actions: [
        { id: 1, name: 'Open', link: 'https://example.com' },
        { id: 2, name: '', link: '' },
      ],
    };
    const params = toKeyboardParams(item, 'https://x/y.png');
    expect(params.imageUrl).toBe('https://x/y.png');
    expect(params.buttonsEnabled).toBe(true);
    expect(params.buttons).toEqual([{ name: 'Open', url: 'https://example.com' }]);
  });

  it('link 类型只保存外链，不保存正文和按钮', () => {
    const item: MenuButtonItem = {
      ...draft('local-1'),
      name: 'A',
      messageType: 'link',
      link: ' https://example.com ',
      actionEnabled: true,
    };
    expect(toKeyboardParams(item, null)).toMatchObject({
      messageType: 'link',
      imageUrl: null,
      description: '',
      linkUrl: 'https://example.com',
      buttonsEnabled: false,
      buttons: [],
    });
  });
});

describe('canPublishButton', () => {
  const text = (name: string): MenuButtonItem => ({
    ...draft('local-1'),
    name,
    messageType: 'text',
    description: 'Hi',
  });

  it('名称为空、以 / 开头时不能提交', () => {
    expect(canPublishButton(text('  '), false, [])).toBe(false);
    expect(canPublishButton(text('/start'), false, [])).toBe(false);
    expect(canPublishButton(text('Hello'), false, [])).toBe(true);
  });

  it('和其它按钮重名时不能提交', () => {
    const other = b('1');
    expect(canPublishButton(text('Button 1'), false, [other])).toBe(false);
  });

  it('graphic 需要图片，text 需要正文，link 需要 http(s) 地址', () => {
    const graphic: MenuButtonItem = { ...draft('local-1'), name: 'A' };
    expect(canPublishButton(graphic, false, [])).toBe(false);
    expect(canPublishButton(graphic, true, [])).toBe(true);
    expect(canPublishButton({ ...text('A'), description: ' ' }, false, [])).toBe(false);
    expect(
      canPublishButton({ ...text('A'), messageType: 'link', link: 'ftp://x' }, false, []),
    ).toBe(false);
    expect(
      canPublishButton({ ...text('A'), messageType: 'link', link: 'https://x.com' }, false, []),
    ).toBe(true);
  });

  it('已保存且没有改动时不能提交', () => {
    expect(canPublishButton(b('1'), false, [])).toBe(false);
    expect(canPublishButton({ ...b('1'), name: 'Renamed' }, false, [])).toBe(true);
  });
});
