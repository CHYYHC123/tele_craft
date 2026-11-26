import { describe, expect, it } from 'vitest';

import type { BotMenu } from '@/types/bot';
import { DEFAULT_MESSAGE } from '@/utils/message-config';
import {
  canPublishMenu,
  createMenuDraft,
  isMenuDraftDirty,
  menuToDraft,
  normalizeCommand,
  toMenuParams,
} from '@/views/content/add-menu/utils';

const menu = (patch: Partial<BotMenu> = {}): BotMenu => ({
  id: 'm1',
  command: 'support',
  commandDescription: 'Contact support',
  messageType: 'text',
  imageUrl: null,
  description: 'Hello',
  linkUrl: null,
  buttonsEnabled: false,
  buttons: [],
  ...patch,
});

describe('normalizeCommand', () => {
  it('去掉开头的斜杠并转成小写', () => {
    expect(normalizeCommand(' /Support ')).toBe('support');
    expect(normalizeCommand('help_2')).toBe('help_2');
  });
});

describe('toMenuParams', () => {
  it('文本消息不带图片和外链，空按钮行不提交', () => {
    const draft = menuToDraft(menu());
    draft.actions = [
      { id: 1, name: 'Open', link: 'https://example.com' },
      { id: 2, name: '  ', link: '' },
    ];
    draft.actionEnabled = true;

    expect(toMenuParams(draft, 'https://ignored.example/a.jpg')).toEqual({
      command: 'support',
      commandDescription: 'Contact support',
      messageType: 'text',
      imageUrl: null,
      description: 'Hello',
      linkUrl: null,
      buttonsEnabled: true,
      buttons: [{ name: 'Open', url: 'https://example.com' }],
    });
  });

  it('链接只提交外链，正文和按钮清空', () => {
    const draft = menuToDraft(
      menu({ messageType: 'link', description: 'ignored', linkUrl: 'https://example.com' }),
    );
    draft.description = 'still ignored';
    draft.actionEnabled = true;
    draft.actions = [{ id: 1, name: 'Open', link: 'https://example.com/go' }];

    expect(toMenuParams(draft, 'https://ignored.example/a.jpg')).toEqual({
      command: 'support',
      commandDescription: 'Contact support',
      messageType: 'link',
      imageUrl: null,
      description: '',
      linkUrl: 'https://example.com',
      buttonsEnabled: false,
      buttons: [],
    });
  });

  it('图文带上调用方传入的图片地址', () => {
    const draft = menuToDraft(menu({ messageType: 'graphic', imageUrl: null, description: 'Hi' }));

    expect(
      toMenuParams(draft, 'https://example.blob.upstash.io/bots/b1/menus/banner.jpg'),
    ).toMatchObject({
      messageType: 'graphic',
      imageUrl: 'https://example.blob.upstash.io/bots/b1/menus/banner.jpg',
      description: 'Hi',
      linkUrl: null,
    });
  });

  it('命令去掉斜杠并转成小写', () => {
    const draft = createMenuDraft('local-1');
    draft.name = '/Promo';
    draft.menuDescription = 'Sale';
    draft.messageType = 'text';

    expect(toMenuParams(draft, null).command).toBe('promo');
  });
});

describe('isMenuDraftDirty', () => {
  it('刚从服务端加载时没有改动', () => {
    expect(isMenuDraftDirty(menuToDraft(menu()), false)).toBe(false);
  });

  it('新草稿和新图片算改动', () => {
    expect(isMenuDraftDirty(createMenuDraft('local-1'), false)).toBe(true);
    expect(isMenuDraftDirty(menuToDraft(menu()), true)).toBe(true);
  });
});

describe('canPublishMenu', () => {
  it('命令为空、是 start，或文本没有正文时不能提交', () => {
    const draft = createMenuDraft('local-1');
    draft.messageType = 'text';
    draft.menuDescription = 'Help';
    expect(canPublishMenu(draft, false)).toBe(false);

    draft.name = '/start';
    draft.description = 'Hi';
    expect(canPublishMenu(draft, false)).toBe(false);

    draft.name = 'help';
    draft.description = '   ';
    expect(canPublishMenu(draft, false)).toBe(false);

    draft.description = DEFAULT_MESSAGE;
    expect(canPublishMenu(draft, false)).toBe(true);
  });

  it('图文没有图片时不能提交，选了新图就可以', () => {
    const draft = createMenuDraft('local-1');
    draft.name = 'promo';
    draft.menuDescription = 'Banner';
    expect(canPublishMenu(draft, false)).toBe(false);
    expect(canPublishMenu(draft, true)).toBe(true);
  });

  it('已发布且没有改动时不能提交', () => {
    expect(canPublishMenu(menuToDraft(menu()), false)).toBe(false);
  });
});
