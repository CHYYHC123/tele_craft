import { useEffect, useRef, useState } from 'react';

import type { ActionButtonItem } from '@/types/message';
import { BUTTON_MENU_MAX_COUNT } from '@/views/content/button-menu/constants';
import type {
  DropPlacement,
  MenuButtonItem,
  MenuButtonPatch,
  MenuRows,
} from '@/views/content/button-menu/types';
import {
  createMenuButton,
  moveButton,
  moveButtonToNewRow,
} from '@/views/content/button-menu/utils';

type ActionPatch = Partial<Pick<ActionButtonItem, 'name' | 'link'>>;

export const useButtonMenu = () => {
  const [rows, setRows] = useState<MenuRows>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const nextId = useRef(1);
  // 每个按钮的图片预览地址，替换 / 删除 / 卸载时释放
  const imageUrls = useRef(new Map<number, string>());

  useEffect(() => {
    const urls = imageUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

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
    setRows((prev) => [...prev, [createMenuButton(id)]]);
    setSelectedId(id);
  };

  const removeButton = (id: number) => {
    const url = imageUrls.current.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      imageUrls.current.delete(id);
    }

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
    const previous = imageUrls.current.get(id);
    if (previous) URL.revokeObjectURL(previous);

    const url = URL.createObjectURL(file);
    imageUrls.current.set(id, url);
    updateButton(id, { image: { url, name: file.name } });
  };

  const addAction = (id: number) => {
    mapButton(id, (item) => {
      const nextActionId = Math.max(0, ...item.actions.map((action) => action.id)) + 1;
      return { ...item, actions: [...item.actions, { id: nextActionId, name: '', link: '' }] };
    });
  };

  const updateAction = (id: number, actionId: number, patch: ActionPatch) => {
    mapButton(id, (item) => ({
      ...item,
      actions: item.actions.map((action) =>
        action.id === actionId ? { ...action, ...patch } : action,
      ),
    }));
  };

  const removeAction = (id: number, actionId: number) => {
    mapButton(id, (item) => ({
      ...item,
      actions: item.actions.filter((action) => action.id !== actionId),
    }));
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
