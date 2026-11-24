import { useEffect, useState } from 'react';

import { useBotSubscribersQuery, useExportSubscribers } from '@/hooks/useBots';
import { SUBSCRIBER_PAGE_SIZE } from '@/views/home/constants';

const SEARCH_DEBOUNCE_MS = 300;

/** 首页订阅者表：搜索（防抖）、分页、导出 */
export function useSubscribers(botId: string | undefined) {
  const [keyword, setKeyword] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(keyword.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [keyword]);

  const query = useBotSubscribersQuery(botId, {
    q: debounced || undefined,
    page,
    pageSize: SUBSCRIBER_PAGE_SIZE,
  });
  const exporter = useExportSubscribers();

  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / SUBSCRIBER_PAGE_SIZE));

  return {
    keyword,
    setKeyword,
    page,
    setPage,
    totalPages,
    total,
    items: query.data?.items ?? [],
    isExporting: exporter.isPending,
    exportAll: () => {
      if (botId) exporter.mutate(botId);
    },
  };
}
