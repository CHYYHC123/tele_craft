export interface StatItem {
  key: string;
  emoji: string;
  label: string;
  /** 指标值，未获取到数据时展示 `--` */
  value?: string;
  /** 对比文案，如 vs yesterday；为空则不展示对比 */
  compare?: string;
  /** 对比百分比，null 表示对比基数为 0 */
  change?: number | null;
  /** 是否展示头像堆叠（Active today） */
  showAvatars?: boolean;
}

export interface BotCaseItem {
  name: string;
  category: string;
  initial: string;
  color: string;
}

export const STAT_ITEMS: StatItem[] = [
  { key: 'followers', emoji: '🤵', label: 'Followers all', compare: 'vs last week' },
  { key: 'added', emoji: '✨', label: 'Added today', compare: 'vs yesterday' },
  { key: 'active', emoji: '🏄', label: 'Active today', showAvatars: true },
  { key: 'unsubscribed', emoji: '🥲', label: 'Unsubscribed', compare: 'vs yesterday' },
];

export const BOT_CASES: BotCaseItem[] = [
  { name: 'Fanstore.Uz', category: 'Shop', initial: 'F', color: '#6d4aff' },
  { name: 'Pizza&Cafe', category: 'Shop', initial: 'P', color: '#1f1f1f' },
  { name: 'Gromich', category: 'Education', initial: 'G', color: '#5b2fc9' },
  { name: 'Assist.Bot', category: 'Company', initial: 'A', color: '#111111' },
  { name: 'Tavrida', category: 'Event', initial: 'T', color: '#14b8a6' },
  { name: 'Bot tutorials', category: 'Education', initial: 'B', color: '#3b82f6' },
];

/** 订阅者列表每页条数 */
export const SUBSCRIBER_PAGE_SIZE = 20;

export const USER_TABLE_COLUMNS = [
  'Name',
  'Username',
  'First time entering',
  'Recently active',
  'Phone number',
  'Operate',
];
