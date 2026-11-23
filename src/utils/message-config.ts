import type { ActionButtonItem, MessageConfig } from '@/types/message';

// 按设计稿反推（默认文案 95 字符，设计稿显示剩余 275）；以真实业务限制为准
export const MESSAGE_MAX_LENGTH = 370;

export const DEFAULT_MESSAGE =
  "Hi, welcome to our support bot. Please type your questions here, we'll reply as soon as we can!";

export const createMessageConfig = (id: number): MessageConfig => ({
  id,
  name: '',
  menuDescription: '',
  messageType: 'graphic',
  image: null,
  description: DEFAULT_MESSAGE,
  link: '',
  actionEnabled: false,
  actions: [{ id: 1, name: '', link: '' }],
});

export const appendAction = (actions: ActionButtonItem[]): ActionButtonItem[] => {
  const id = Math.max(0, ...actions.map((action) => action.id)) + 1;
  return [...actions, { id, name: '', link: '' }];
};

export const patchAction = (
  actions: ActionButtonItem[],
  id: number,
  patch: Partial<Pick<ActionButtonItem, 'name' | 'link'>>,
): ActionButtonItem[] =>
  actions.map((action) => (action.id === id ? { ...action, ...patch } : action));

export const dropAction = (actions: ActionButtonItem[], id: number): ActionButtonItem[] =>
  actions.filter((action) => action.id !== id);
