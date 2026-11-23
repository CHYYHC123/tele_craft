import { useRef, useState } from 'react';

import { useObjectUrls } from '@/hooks/useObjectUrls';
import type { ActionButtonItem, MessageConfig, MessageConfigPatch } from '@/types/message';
import { appendAction, createMessageConfig, dropAction, patchAction } from '@/utils/message-config';
import { ADD_MENU_MAX_COUNT } from '@/views/content/add-menu/constants';
import { moveItemUp } from '@/views/content/add-menu/utils';

type ActionPatch = Partial<Pick<ActionButtonItem, 'name' | 'link'>>;

export const useAddMenu = () => {
  const [items, setItems] = useState<MessageConfig[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const nextId = useRef(1);
  const imageUrls = useObjectUrls();

  const selected = items.find((item) => item.id === selectedId) ?? null;
  const canAdd = items.length < ADD_MENU_MAX_COUNT;

  const mapItem = (id: number, update: (item: MessageConfig) => MessageConfig) => {
    setItems((prev) => prev.map((item) => (item.id === id ? update(item) : item)));
  };

  const addItem = () => {
    if (!canAdd) return;
    // id 在 updater 外生成，避免 StrictMode 下 updater 执行两次导致 id 跳号
    const id = nextId.current++;
    setItems((prev) => [...prev, createMessageConfig(id)]);
    setSelectedId(id);
  };

  const removeItem = (id: number) => {
    imageUrls.release(id);

    const index = items.findIndex((item) => item.id === id);
    const nextItems = items.filter((item) => item.id !== id);
    setItems(nextItems);
    // 删除的是选中项时，选中原位置的下一项，没有就选上一项
    if (selectedId === id) setSelectedId((nextItems[index] ?? nextItems[index - 1])?.id ?? null);
  };

  const moveUp = (id: number) => {
    setItems((prev) => moveItemUp(prev, id));
  };

  const updateItem = (id: number, patch: MessageConfigPatch) => {
    mapItem(id, (item) => ({ ...item, ...patch }));
  };

  const selectImage = (id: number, file: File) => {
    const url = imageUrls.replace(id, file);
    updateItem(id, { image: { url, name: file.name } });
  };

  const addAction = (id: number) => {
    mapItem(id, (item) => ({ ...item, actions: appendAction(item.actions) }));
  };

  const updateAction = (id: number, actionId: number, patch: ActionPatch) => {
    mapItem(id, (item) => ({ ...item, actions: patchAction(item.actions, actionId, patch) }));
  };

  const removeAction = (id: number, actionId: number) => {
    mapItem(id, (item) => ({ ...item, actions: dropAction(item.actions, actionId) }));
  };

  return {
    items,
    selected,
    canAdd,
    addItem,
    removeItem,
    moveUp,
    selectItem: setSelectedId,
    updateItem,
    selectImage,
    addAction,
    updateAction,
    removeAction,
  };
};
