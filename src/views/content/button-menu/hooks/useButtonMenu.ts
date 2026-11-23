import { useRef, useState } from 'react';

import { useObjectUrls } from '@/hooks/useObjectUrls';
import type { ActionButtonItem } from '@/types/message';
import { appendAction, createMessageConfig, dropAction, patchAction } from '@/utils/message-config';
import { BUTTON_MENU_MAX_COUNT } from '@/views/content/button-menu/constants';
import type {
  DropPlacement,
  MenuButtonItem,
  MenuButtonPatch,
  MenuRows,
} from '@/views/content/button-menu/types';
import { moveButton, moveButtonToNewRow } from '@/views/content/button-menu/utils';

type ActionPatch = Partial<Pick<ActionButtonItem, 'name' | 'link'>>;

export const useButtonMenu = () => {
  const [rows, setRows] = useState<MenuRows>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const nextId = useRef(1);
  const imageUrls = useObjectUrls();

  const buttons = rows.flat();
  const selected = buttons.find((item) => item.id === selectedId) ?? null;
  const canAdd = buttons.length < BUTTON_MENU_MAX_COUNT;

  const mapButton = (id: number, update: (item: MenuButtonItem) => MenuButtonItem) => {
    setRows((prev) => prev.map((row) => row.map((item) => (item.id === id ? update(item) : item))));
  };

  const addButton = () => {
    if (!canAdd) return;
    // id 在 updater 外生成，避免 StrictMode 下 updater 执行两次导致 id 跳号
    const id = nextId.current++;
    setRows((prev) => [...prev, [createMessageConfig(id)]]);
    setSelectedId(id);
  };

  const removeButton = (id: number) => {
    imageUrls.release(id);

    const nextRows = rows
      .map((row) => row.filter((item) => item.id !== id))
      .filter((row) => row.length > 0);
    setRows(nextRows);
    if (selectedId === id) setSelectedId(nextRows[0]?.[0]?.id ?? null);
  };

  const updateButton = (id: number, patch: MenuButtonPatch) => {
    mapButton(id, (item) => ({ ...item, ...patch }));
  };

  const selectImage = (id: number, file: File) => {
    const url = imageUrls.replace(id, file);
    updateButton(id, { image: { url, name: file.name } });
  };

  const addAction = (id: number) => {
    mapButton(id, (item) => ({ ...item, actions: appendAction(item.actions) }));
  };

  const updateAction = (id: number, actionId: number, patch: ActionPatch) => {
    mapButton(id, (item) => ({ ...item, actions: patchAction(item.actions, actionId, patch) }));
  };

  const removeAction = (id: number, actionId: number) => {
    mapButton(id, (item) => ({ ...item, actions: dropAction(item.actions, actionId) }));
  };

  const moveTo = (dragId: number, targetId: number, placement: DropPlacement) => {
    setRows((prev) => moveButton(prev, dragId, targetId, placement));
  };

  const moveToNewRow = (dragId: number) => {
    setRows((prev) => moveButtonToNewRow(prev, dragId));
  };

  return {
    rows,
    selected,
    canAdd,
    addButton,
    removeButton,
    selectButton: setSelectedId,
    updateButton,
    selectImage,
    addAction,
    updateAction,
    removeAction,
    moveTo,
    moveToNewRow,
  };
};
