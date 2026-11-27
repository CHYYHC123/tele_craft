import type { LucideIcon } from 'lucide-react';
import { LayoutGrid, MessageSquare, Terminal } from 'lucide-react';

import type { MenuStrategyType } from '@/types/bot';

/** 键盘按钮最多 30 个 */
export const BUTTON_MENU_MAX_COUNT = 30;

/** 每行最多 3 个按钮 */
export const MAX_BUTTONS_PER_ROW = 3;

/** 按钮文字（text）最长 64，不能以 / 开头 */
export const BUTTON_TEXT_MAX_LENGTH = 64;

/** 后台备注（remark）最长 256，可为空 */
export const BUTTON_REMARK_MAX_LENGTH = 256;

/** 消息正文最长 1024 */
export const BUTTON_MESSAGE_MAX_LENGTH = 1024;

/** 按钮没有填写名称时，在预览里显示的文案 */
export const DEFAULT_BUTTON_LABEL = 'Button';

export interface DispatchChannelConfig {
  id: MenuStrategyType;
  label: string;
  icon: LucideIcon;
}

/** 下发渠道（对应 strategy 的三个取值），顺序即展示顺序 */
export const DISPATCH_CHANNELS: DispatchChannelConfig[] = [
  { id: 'command', label: '/menu', icon: Terminal },
  { id: 'keyboard', label: 'Button menu', icon: LayoutGrid },
  { id: 'message', label: 'message', icon: MessageSquare },
];

/** 选中非 /menu 渠道时，下方显示的说明 */
export const DISPATCH_CHANNEL_NOTES: Partial<Record<MenuStrategyType, string>> = {
  keyboard: 'Primary reply keyboard',
  message: 'Standard chat message',
};
