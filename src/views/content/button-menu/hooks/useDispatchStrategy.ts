import { useState } from 'react';

import { useBotMenusQuery, useUpdateBotMenuStrategy } from '@/hooks/useBots';
import type { MenuStrategy } from '@/types/bot';

const isSame = (a: MenuStrategy, b: MenuStrategy) =>
  a.enabled === b.enabled && a.strategy === b.strategy && a.defaultMenuId === b.defaultMenuId;

/** 下发策略草稿（Bot 级）：以服务端已保存的策略为起点，点保存才提交 */
export const useDispatchStrategy = (botId: string, saved: MenuStrategy) => {
  const [draft, setDraft] = useState(saved);
  const { data: menus = [] } = useBotMenusQuery(botId);
  const { mutateAsync, isPending: isSaving } = useUpdateBotMenuStrategy(botId);

  const isDirty = !isSame(draft, saved);

  const patch = (next: Partial<MenuStrategy>) => setDraft((prev) => ({ ...prev, ...next }));

  const save = async () => {
    if (!isDirty || isSaving) return;
    try {
      setDraft(await mutateAsync(draft));
    } catch {
      // 错误已由请求拦截器统一提示，草稿保留以便重试
    }
  };

  return {
    value: draft,
    menus,
    isDirty,
    isSaving,
    setEnabled: (enabled: boolean) => patch({ enabled }),
    setStrategy: (strategy: MenuStrategy['strategy']) => patch({ strategy }),
    setDefaultMenu: (defaultMenuId: string | null) => patch({ defaultMenuId }),
    save,
  };
};
