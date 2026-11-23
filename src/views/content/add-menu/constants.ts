export const BOT_NAME = 'Bit. Store Card';

// 设计稿未标明，暂定值，以真实业务限制为准
export const ADD_MENU_MAX_COUNT = 6;

/** 系统自带的默认菜单项，已有自定义菜单时显示在最上面，不可编辑 */
export const DEFAULT_COMMAND = {
  name: 'start',
  description: 'Start to earn',
} as const;

/** 菜单项没有填写名称 / 描述时，在预览里显示的占位文案 */
export const MENU_NAME_PLACEHOLDER = 'menu name';
export const MENU_DESCRIPTION_PLACEHOLDER = 'menu description';
