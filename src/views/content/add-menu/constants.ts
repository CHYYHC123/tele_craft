/** 自定义命令最多 99 条（/start 不占这条额度） */
export const ADD_MENU_MAX_COUNT = 99;

/** 命令本体最长 32，不含斜杠 */
export const MENU_COMMAND_MAX_LENGTH = 32;

/** 命令下方说明，1 到 256 个字符 */
export const MENU_COMMAND_DESCRIPTION_MAX_LENGTH = 256;

/** 消息正文最长 1024 */
export const MENU_MESSAGE_MAX_LENGTH = 1024;

/** 系统自带的默认菜单项，已有自定义菜单时显示在最上面，不可编辑 */
export const DEFAULT_COMMAND = {
  name: 'start',
  description: 'Start',
} as const;

/** 菜单项没有填写名称 / 描述时，在预览里显示的占位文案 */
export const MENU_NAME_PLACEHOLDER = 'menu name';
export const MENU_DESCRIPTION_PLACEHOLDER = 'menu description';
