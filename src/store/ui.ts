import { create } from 'zustand';

interface UiState {
  /** 「添加 Bot」弹窗是否打开（头部与首页共用） */
  addBotOpen: boolean;
  openAddBot: () => void;
  closeAddBot: () => void;
  /** 「修改 Bot 信息」弹窗是否打开 */
  editBotOpen: boolean;
  openEditBot: () => void;
  closeEditBot: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  addBotOpen: false,
  openAddBot: () => set({ addBotOpen: true }),
  closeAddBot: () => set({ addBotOpen: false }),
  editBotOpen: false,
  openEditBot: () => set({ editBotOpen: true }),
  closeEditBot: () => set({ editBotOpen: false }),
}));
