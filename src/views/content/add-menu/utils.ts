import type { BotMenu, BotMenuParams } from '@/types/bot';
import type { ActionButtonItem, MessageConfig } from '@/types/message';
import { DEFAULT_MESSAGE } from '@/utils/message-config';
import type { MenuDraft } from '@/views/content/add-menu/types';

const HTTP_URL = /^https?:\/\//;

const emptyActions = (): ActionButtonItem[] => [{ id: 1, name: '', link: '' }];

/** 取图片地址最后一段作为文件名 */
const imageName = (url: string) => url.split('?')[0].split('/').pop() || url;

/** 去掉开头的 / 并转成小写，与服务端入库规则一致 */
export const normalizeCommand = (name: string): string =>
  name.trim().replace(/^\/+/, '').toLowerCase();

/** 服务端菜单 -> 本地草稿 */
export const menuToDraft = (menu: BotMenu): MenuDraft => ({
  id: menu.id,
  isNew: false,
  baseline: menu,
  name: menu.command,
  menuDescription: menu.commandDescription,
  messageType: menu.messageType,
  image: menu.imageUrl ? { url: menu.imageUrl, name: imageName(menu.imageUrl) } : null,
  description: menu.description,
  link: menu.linkUrl ?? '',
  actionEnabled: menu.buttonsEnabled,
  actions:
    menu.buttons.length > 0
      ? menu.buttons.map((button, index) => ({
          id: index + 1,
          name: button.name,
          link: button.url,
        }))
      : emptyActions(),
});

/** 一条还没发布的空草稿 */
export const createMenuDraft = (id: string): MenuDraft => ({
  id,
  isNew: true,
  baseline: null,
  name: '',
  menuDescription: '',
  messageType: 'graphic',
  image: null,
  description: DEFAULT_MESSAGE,
  link: '',
  actionEnabled: false,
  actions: emptyActions(),
});

/** 草稿 -> 表单值。表单不使用 id，固定为 0，避免改动按钮菜单共用的数字 id */
export const toMessageConfig = (draft: MenuDraft): MessageConfig => ({
  id: 0,
  name: draft.name,
  menuDescription: draft.menuDescription,
  messageType: draft.messageType,
  image: draft.image,
  description: draft.description,
  link: draft.link,
  actionEnabled: draft.actionEnabled,
  actions: draft.actions,
});

/** 草稿 -> 新建/修改请求体。imageUrl 由调用方传入（已上传或当前已发布的地址） */
export const toMenuParams = (draft: MenuDraft, imageUrl: string | null): BotMenuParams => {
  const command = normalizeCommand(draft.name);
  const commandDescription = draft.menuDescription.trim();

  if (draft.messageType === 'link') {
    return {
      command,
      commandDescription,
      messageType: 'link',
      imageUrl: null,
      description: '',
      linkUrl: draft.link.trim(),
      buttonsEnabled: false,
      buttons: [],
    };
  }

  return {
    command,
    commandDescription,
    messageType: draft.messageType,
    imageUrl: draft.messageType === 'graphic' ? imageUrl : null,
    description: draft.description,
    linkUrl: null,
    buttonsEnabled: draft.actionEnabled,
    buttons: draft.actions
      .filter((item) => item.name.trim() || item.link.trim())
      .map((item) => ({ name: item.name.trim(), url: item.link.trim() })),
  };
};

/** 相对上次发布有没有改动；新草稿和新选的图片都算改动 */
export const isMenuDraftDirty = (draft: MenuDraft, pendingImage: boolean): boolean => {
  if (draft.isNew || pendingImage || !draft.baseline) return true;
  const imageUrl = draft.messageType === 'graphic' ? (draft.image?.url ?? null) : null;
  const next = toMenuParams(draft, imageUrl);
  const saved = toMenuParams(menuToDraft(draft.baseline), draft.baseline.imageUrl);
  return JSON.stringify(next) !== JSON.stringify(saved);
};

/** 可以提交：有改动，且命令、说明和当前消息类型的必填内容都在 */
export const canPublishMenu = (draft: MenuDraft, pendingImage: boolean): boolean => {
  if (!isMenuDraftDirty(draft, pendingImage)) return false;
  const command = normalizeCommand(draft.name);
  if (!command || command === 'start') return false;
  if (!draft.menuDescription.trim()) return false;
  if (draft.messageType === 'graphic' && !pendingImage && !draft.image?.url) return false;
  if (draft.messageType === 'text' && !draft.description.trim()) return false;
  if (draft.messageType === 'link' && !HTTP_URL.test(draft.link.trim())) return false;
  return true;
};
