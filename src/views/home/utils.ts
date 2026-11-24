import type { BotStats, Subscriber } from '@/types/bot';
import { STAT_ITEMS, type StatItem } from '@/views/home/constants';

const formatCount = (value: number | undefined): string | undefined =>
  value === undefined ? undefined : value.toLocaleString('en-US');

/** 把接口统计数据合并进静态卡片配置；没有数据时 value 为空（展示 `--`） */
export function buildStatItems(stats: BotStats | undefined): StatItem[] {
  const values: Record<string, { value?: number; change?: number | null }> = {
    followers: { value: stats?.followersAll, change: stats?.followersAllChange },
    added: { value: stats?.addedToday, change: stats?.addedTodayChange },
    active: { value: stats?.activeToday },
    unsubscribed: { value: stats?.unsubscribedToday, change: stats?.unsubscribedTodayChange },
  };
  return STAT_ITEMS.map((item) => ({
    ...item,
    value: formatCount(values[item.key]?.value),
    change: values[item.key]?.change,
  }));
}

/** 姓名：firstName + lastName，空值过滤 */
export const getSubscriberName = (subscriber: Subscriber): string =>
  [subscriber.firstName, subscriber.lastName].filter(Boolean).join(' ') || '--';
