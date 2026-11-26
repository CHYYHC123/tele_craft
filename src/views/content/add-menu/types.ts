import type { BotMenu } from '@/types/bot';
import type { ActionButtonItem, MessageImage, MessageType } from '@/types/message';

/** 一条命令菜单的本地草稿。id 为服务端 id，或未发布时的本地 id */
export interface MenuDraft {
  id: string;
  /** 还没有 POST 过 */
  isNew: boolean;
  /** 已发布内容；新草稿为 null，Cancel 用它恢复 */
  baseline: BotMenu | null;
  name: string;
  menuDescription: string;
  messageType: MessageType;
  image: MessageImage | null;
  description: string;
  link: string;
  actionEnabled: boolean;
  actions: ActionButtonItem[];
}
