import { useRef, useState } from 'react';

import { useObjectUrls } from '@/hooks/useObjectUrls';
import {
  useCreateBotMenu,
  useDeleteBotMenu,
  useUpdateBotMenu,
  useUploadBotMenuImage,
} from '@/hooks/useBots';
import type { BotMenu } from '@/types/bot';
import type { ActionButtonItem, MessageConfigPatch } from '@/types/message';
import { appendAction, dropAction, patchAction } from '@/utils/message-config';
import { ADD_MENU_MAX_COUNT } from '@/views/content/add-menu/constants';
import type { MenuDraft } from '@/views/content/add-menu/types';
import {
  canPublishMenu,
  createMenuDraft,
  isMenuDraftDirty,
  menuToDraft,
  toMenuParams,
} from '@/views/content/add-menu/utils';

type ActionPatch = Partial<Pick<ActionButtonItem, 'name' | 'link'>>;

export const useAddMenu = (botId: string, menus: BotMenu[]) => {
  const [items, setItems] = useState<MenuDraft[]>(() => menus.map(menuToDraft));
  const [selectedId, setSelectedId] = useState<string | null>(menus[0]?.id ?? null);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(() => new Set());
  const nextId = useRef(1);
  const imageUrls = useObjectUrls<string>();
  const pendingFiles = useRef(new Map<string, File>());

  const { mutateAsync: createMenu, isPending: isCreating } = useCreateBotMenu(botId);
  const { mutateAsync: updateMenu, isPending: isUpdating } = useUpdateBotMenu(botId);
  const { mutateAsync: removeMenu, isPending: isDeleting } = useDeleteBotMenu(botId);
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadBotMenuImage(botId);

  const selected = items.find((item) => item.id === selectedId) ?? null;
  const canAdd = items.length < ADD_MENU_MAX_COUNT;
  const pendingImage = selected ? pendingIds.has(selected.id) : false;
  const isSaving = isCreating || isUpdating || isUploading;
  const canPublish = selected ? canPublishMenu(selected, pendingImage) : false;
  const canCancel = selected ? selected.isNew || isMenuDraftDirty(selected, pendingImage) : false;

  const replaceItem = (id: string, update: (item: MenuDraft) => MenuDraft) => {
    setItems((prev) => prev.map((item) => (item.id === id ? update(item) : item)));
  };

  const forgetImage = (id: string) => {
    imageUrls.release(id);
    pendingFiles.current.delete(id);
    setPendingIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const dropItem = (id: string) => {
    forgetImage(id);
    const index = items.findIndex((item) => item.id === id);
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    setSelectedId((current) =>
      current === id ? ((next[index] ?? next[index - 1])?.id ?? null) : current,
    );
  };

  const addItem = () => {
    if (!canAdd) return;
    const id = `local-${nextId.current++}`;
    setItems((prev) => [...prev, createMenuDraft(id)]);
    setSelectedId(id);
  };

  const removeItem = async (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (!item || isDeleting) return;
    if (!item.isNew) {
      try {
        await removeMenu(id);
      } catch {
        // 错误已由请求拦截器提示；删除失败时菜单仍保留
        return;
      }
    }
    dropItem(id);
  };

  /** 上箭头只选中上一项，不改变列表顺序 */
  const selectPrevious = (id: string) => {
    const index = items.findIndex((item) => item.id === id);
    if (index > 0) setSelectedId(items[index - 1].id);
  };

  const updateItem = (id: string, patch: MessageConfigPatch) => {
    replaceItem(id, (item) => ({ ...item, ...patch }));
  };

  const selectImage = (id: string, file: File) => {
    const url = imageUrls.replace(id, file);
    pendingFiles.current.set(id, file);
    setPendingIds((prev) => new Set(prev).add(id));
    updateItem(id, { image: { url, name: file.name } });
  };

  const addAction = (id: string) => {
    replaceItem(id, (item) => ({ ...item, actions: appendAction(item.actions) }));
  };

  const updateAction = (id: string, actionId: number, patch: ActionPatch) => {
    replaceItem(id, (item) => ({ ...item, actions: patchAction(item.actions, actionId, patch) }));
  };

  const removeAction = (id: string, actionId: number) => {
    replaceItem(id, (item) => ({ ...item, actions: dropAction(item.actions, actionId) }));
  };

  const cancel = () => {
    if (!selected) return;
    if (selected.isNew || !selected.baseline) {
      dropItem(selected.id);
      return;
    }
    const baseline = selected.baseline;
    forgetImage(selected.id);
    replaceItem(selected.id, () => menuToDraft(baseline));
  };

  const publish = async () => {
    if (!selected || isSaving || !canPublishMenu(selected, pendingIds.has(selected.id))) return;
    const draft = selected;
    const file = pendingFiles.current.get(draft.id);
    try {
      const imageUrl =
        draft.messageType === 'graphic'
          ? file
            ? (await uploadImage(file)).imageUrl
            : (draft.image?.url ?? null)
          : null;
      const params = toMenuParams(draft, imageUrl);
      const saved = draft.isNew
        ? await createMenu(params)
        : await updateMenu({ menuId: draft.id, ...params });
      forgetImage(draft.id);
      setItems((prev) => prev.map((item) => (item.id === draft.id ? menuToDraft(saved) : item)));
      setSelectedId(saved.id);
    } catch {
      // 错误已由请求拦截器统一提示，草稿保留以便重试
    }
  };

  return {
    items,
    selected,
    canAdd,
    canPublish,
    canCancel,
    isSaving,
    addItem,
    removeItem,
    selectPrevious,
    selectItem: setSelectedId,
    updateItem,
    selectImage,
    addAction,
    updateAction,
    removeAction,
    cancel,
    publish,
  };
};
