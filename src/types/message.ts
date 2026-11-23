export type MessageType = 'graphic' | 'text' | 'link';

export interface ActionButtonItem {
  id: number;
  name: string;
  link: string;
}

export interface MessageImage {
  url: string;
  name: string;
}

/** 一条「入口 + 触发后消息」的配置，Button menu / Add menu 共用 */
export interface MessageConfig {
  id: number;
  name: string;
  menuDescription: string;
  messageType: MessageType;
  /** messageType 为 graphic 时的图片 */
  image: MessageImage | null;
  /** messageType 为 graphic / text 时的正文 */
  description: string;
  /** messageType 为 link 时的跳转地址 */
  link: string;
  actionEnabled: boolean;
  actions: ActionButtonItem[];
}

export type MessageConfigPatch = Partial<Omit<MessageConfig, 'id'>>;
