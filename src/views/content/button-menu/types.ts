import type { MessageConfig, MessageConfigPatch } from '@/types/message';

/** 菜单按钮：按钮本身（名称）+ 点击后触发的消息配置 */
export type MenuButtonItem = MessageConfig;

export type MenuButtonPatch = MessageConfigPatch;

/** 按钮菜单按行排列，每行最多 MAX_BUTTONS_PER_ROW 个按钮并排 */
export type MenuRows = MenuButtonItem[][];

export type DropPlacement = 'before' | 'after';
