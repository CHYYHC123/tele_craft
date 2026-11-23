import { create } from 'zustand';

interface BotState {
  /** 用户在头部选中的 Bot id；为空或不在列表中时按列表第一个处理 */
  selectedBotId: string | null;
  setSelectedBotId: (id: string | null) => void;
}

export const useBotStore = create<BotState>((set) => ({
  selectedBotId: null,
  setSelectedBotId: (id) => set({ selectedBotId: id }),
}));
