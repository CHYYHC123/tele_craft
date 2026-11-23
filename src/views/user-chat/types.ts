/** 会话所在的分组：进行中 / 已静音 / 已关闭 */
export type ChatFolder = 'open' | 'muted' | 'closed';

export type AvatarTone = 'red' | 'blue';

/** user：终端用户；bot：当前机器人（客服侧） */
export type MessageSender = 'user' | 'bot';

export interface ChatMessage {
  id: number;
  sender: MessageSender;
  text: string;
  /** 气泡右下角时间，如 11:43 */
  time: string;
  /** 日期分隔文案，如 August 15, 2024 */
  dateLabel: string;
}

export interface Chat {
  id: number;
  name: string;
  tone: AvatarTone;
  /** 列表右上角的时间文案：11:55 AM / Thu / 08/13/2024 */
  lastTime: string;
  folder: ChatFolder;
  /** 静音时长文案，仅 folder 为 muted 时有值 */
  mutedFor: string | null;
  messages: ChatMessage[];
}
