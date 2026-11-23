import { useEffect, useRef } from 'react';

import { useBotsQuery } from '@/hooks/useBots';
import { useUiStore } from '@/store/ui';

/** 登录后 Bot 列表查询成功且为空时，自动弹出「添加 Bot」弹窗（每次进入首页只弹一次） */
export function useAutoOpenAddBot() {
  const { data, isSuccess } = useBotsQuery();
  const openAddBot = useUiStore((state) => state.openAddBot);
  const handled = useRef(false);

  useEffect(() => {
    if (!isSuccess || handled.current) return;
    handled.current = true;
    if (data.length === 0) openAddBot();
  }, [isSuccess, data, openAddBot]);
}
