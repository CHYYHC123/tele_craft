import type { KeyboardButton } from '@/types/bot';
import type { MessageConfigPatch, MessageConfig } from '@/types/message';

/**
 * 键盘按钮的本地草稿：按钮本身（名称）+ 点击后触发的消息配置。
 * id 为服务端 id，或未保存时的本地 id（local-N）。
 */
export interface MenuButtonItem extends Omit<MessageConfig, 'id'> {
  id: string;
  /** 还没有 POST 过 */
  isNew: boolean;
  /** 已保存内容；新草稿为 null，Cancel 用它恢复 */
  baseline: KeyboardButton | null;
}

export type MenuButtonPatch = MessageConfigPatch;

/** 按钮菜单按行排列，每行最多 MAX_BUTTONS_PER_ROW 个按钮并排 */
export type MenuRows = MenuButtonItem[][];

export type DropPlacement = 'before' | 'after';
