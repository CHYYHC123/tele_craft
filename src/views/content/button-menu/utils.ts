import type { ActionButtonItem, MessageConfig } from '@/types/message';
import type { KeyboardButton, KeyboardButtonParams } from '@/types/bot';
import { DEFAULT_MESSAGE } from '@/utils/message-config';
import { MAX_BUTTONS_PER_ROW } from '@/views/content/button-menu/constants';
import type { DropPlacement, MenuButtonItem, MenuRows } from '@/views/content/button-menu/types';

const HTTP_URL = /^https?:\/\//;

const emptyActions = (): ActionButtonItem[] => [{ id: 1, name: '', link: '' }];

/** 取图片地址最后一段作为文件名 */
const imageName = (url: string) => url.split('?')[0].split('/').pop() || url;

/** 服务端按钮 -> 本地草稿 */
export const keyboardToDraft = (button: KeyboardButton): MenuButtonItem => ({
  id: button.id,
  isNew: false,
  baseline: button,
  name: button.text,
  menuDescription: button.remark,
  messageType: button.messageType,
  image: button.imageUrl ? { url: button.imageUrl, name: imageName(button.imageUrl) } : null,
  description: button.description,
  link: button.linkUrl ?? '',
  actionEnabled: button.buttonsEnabled,
  actions:
    button.buttons.length > 0
      ? button.buttons.map((item, index) => ({ id: index + 1, name: item.name, link: item.url }))
      : emptyActions(),
});

/** 一条还没保存的空草稿 */
export const createButtonDraft = (id: string): MenuButtonItem => ({
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

/** 草稿 -> 新增/修改请求体。imageUrl 由调用方传入（已上传或当前已保存的地址） */
export const toKeyboardParams = (
  draft: MenuButtonItem,
  imageUrl: string | null,
): KeyboardButtonParams => {
  const text = draft.name.trim();
  const remark = draft.menuDescription.trim();

  if (draft.messageType === 'link') {
    return {
      text,
      remark,
      messageType: 'link',
      imageUrl: null,
      description: '',
      linkUrl: draft.link.trim(),
      buttonsEnabled: false,
      buttons: [],
    };
  }

  return {
    text,
    remark,
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

/** 相对上次保存有没有改动；新草稿和新选的图片都算改动 */
export const isButtonDirty = (draft: MenuButtonItem, pendingImage: boolean): boolean => {
  if (draft.isNew || pendingImage || !draft.baseline) return true;
  const imageUrl = draft.messageType === 'graphic' ? (draft.image?.url ?? null) : null;
  const next = toKeyboardParams(draft, imageUrl);
  const saved = toKeyboardParams(keyboardToDraft(draft.baseline), draft.baseline.imageUrl);
  return JSON.stringify(next) !== JSON.stringify(saved);
};

/** 可以提交：有改动，且名称（唯一、不以 / 开头）和当前消息类型的必填内容都在 */
export const canPublishButton = (
  draft: MenuButtonItem,
  pendingImage: boolean,
  others: MenuButtonItem[],
): boolean => {
  if (!isButtonDirty(draft, pendingImage)) return false;
  const text = draft.name.trim();
  if (!text || text.startsWith('/')) return false;
  if (others.some((item) => item.id !== draft.id && item.name.trim() === text)) return false;
  if (draft.messageType === 'graphic' && !pendingImage && !draft.image?.url) return false;
  if (draft.messageType === 'text' && !draft.description.trim()) return false;
  if (draft.messageType === 'link' && !HTTP_URL.test(draft.link.trim())) return false;
  return true;
};

/** 布局接口的请求体：只带已保存的按钮 id，未保存的草稿不参与 */
export const toLayoutIds = (rows: MenuRows): string[][] =>
  rows
    .map((row) => row.filter((item) => !item.isNew).map((item) => item.id))
    .filter((row) => row.length > 0);

/** 未保存的草稿固定在最后，各自成一行（与服务端新增时「自成一行放在最后」一致） */
export const pinDrafts = (rows: MenuRows): MenuRows => {
  const saved = rows
    .map((row) => row.filter((item) => !item.isNew))
    .filter((row) => row.length > 0);
  const drafts = rows.flat().filter((item) => item.isNew);
  return [...saved, ...drafts.map((item) => [item])];
};

const withoutEmptyRows = (rows: MenuRows): MenuRows => rows.filter((row) => row.length > 0);

/**
 * 把 dragId 对应的按钮移动到 targetId 按钮的前 / 后：
 * - 目标所在行还有空位：并排插入该行；
 * - 目标所在行已满：作为新的一行插到目标行上方 / 下方。
 */
export const moveButton = (
  rows: MenuRows,
  dragId: string,
  targetId: string,
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
export const moveButtonToNewRow = (rows: MenuRows, dragId: string): MenuRows => {
  const dragged = rows.flat().find((item) => item.id === dragId);
  if (!dragged) return rows;

  const rest = rows.map((row) => row.filter((item) => item.id !== dragId));
  return withoutEmptyRows([...rest, [dragged]]);
};

/** 草稿 -> 表单值。表单不使用 id，固定为 0 */
export const toMessageConfig = (draft: MenuButtonItem): MessageConfig => ({
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
