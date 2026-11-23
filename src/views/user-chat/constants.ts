import type { Chat, ChatFolder } from '@/views/user-chat/types';

export const BOT_NAME = 'Bit.Store Card';
export const BOT_USERNAME = '@Bit.Store Card_bot';

export const FOLDER_OPTIONS: { value: ChatFolder; label: string }[] = [
  { value: 'open', label: 'Open chats' },
  { value: 'muted', label: 'Muted chats' },
  { value: 'closed', label: 'Closed chats' },
];

export const MUTE_OPTIONS = ['3 hours', '12 hours', '1 days', '3 days', '7 days'];

export const COMPOSER_PLACEHOLDER = 'Type # to add a saved reply...';

// 暂无后端接口，先用本地 mock 数据驱动 UI；接入接口后替换为 react-query
export const INITIAL_CHATS: Chat[] = [
  {
    id: 1,
    name: 'Ahmet',
    tone: 'red',
    lastTime: '11:55 AM',
    folder: 'open',
    mutedFor: null,
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'I do have a list of FAQs, but I might need help with refining the processes.',
        time: '11:43',
        dateLabel: 'August 15, 2024',
      },
      {
        id: 2,
        sender: 'user',
        text: 'Hello are you still there?',
        time: '11:43',
        dateLabel: 'August 15, 2024',
      },
      {
        id: 3,
        sender: 'bot',
        text: 'No problem! We can start by integrating the FAQs into the bot, and I can help you outline and refine the processes for a smoother customer experience. Would you also like the bot to escalate more complex queries to a human agent?',
        time: '11:44',
        dateLabel: 'August 15, 2024',
      },
      {
        id: 4,
        sender: 'user',
        text: 'Yes, that would be great.',
        time: '11:44',
        dateLabel: 'August 15, 2024',
      },
      {
        id: 5,
        sender: 'bot',
        text: "I'm excited to get started on this project for you.",
        time: '11:45',
        dateLabel: 'August 15, 2024',
      },
    ],
  },
  {
    id: 2,
    name: 'xiao',
    tone: 'blue',
    lastTime: '11:46 AM',
    folder: 'open',
    mutedFor: null,
    messages: [
      { id: 1, sender: 'user', text: 'Hello', time: '11:46', dateLabel: 'August 15, 2024' },
    ],
  },
  {
    id: 3,
    name: 'xiaodu',
    tone: 'blue',
    lastTime: 'Thu',
    folder: 'open',
    mutedFor: null,
    messages: [
      { id: 1, sender: 'user', text: 'Hello', time: '09:12', dateLabel: 'August 15, 2024' },
    ],
  },
  {
    id: 4,
    name: 'xiao123',
    tone: 'blue',
    lastTime: '08/13/2024',
    folder: 'open',
    mutedFor: null,
    messages: [
      { id: 1, sender: 'user', text: 'Hello', time: '16:30', dateLabel: 'August 13, 2024' },
    ],
  },
];
