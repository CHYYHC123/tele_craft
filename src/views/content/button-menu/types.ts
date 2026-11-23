import type { ActionButtonItem, MessageType } from '@/types/message';

export interface MenuImage {
  url: string;
  name: string;
}

/** 菜单按钮：按钮本身（名称）+ 点击后触发的消息配置 */
export interface MenuButtonItem {
  id: number;
  name: string;
  menuDescription: string;
  messageType: MessageType;
  /** messageType 为 graphic 时的图片 */
  image: MenuImage | null;
  /** messageType 为 graphic / text 时的正文 */
  description: string;
  /** messageType 为 link 时的跳转地址 */
  link: string;
  actionEnabled: boolean;
  actions: ActionButtonItem[];
}

export type MenuButtonPatch = Partial<Omit<MenuButtonItem, 'id'>>;

/** 按钮菜单按行排列，每行最多 MAX_BUTTONS_PER_ROW 个按钮并排 */
export type MenuRows = MenuButtonItem[][];

export type DropPlacement = 'before' | 'after';
