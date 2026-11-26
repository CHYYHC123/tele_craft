import { useRef, useState } from 'react';

import { useObjectUrls } from '@/hooks/useObjectUrls';
import {
  useCreateKeyboardButton,
  useDeleteKeyboardButton,
  useUpdateKeyboardButton,
  useUpdateKeyboardLayout,
  useUploadKeyboardImage,
} from '@/hooks/useBots';
import type { KeyboardButton } from '@/types/bot';
import type { ActionButtonItem } from '@/types/message';
import { appendAction, dropAction, patchAction } from '@/utils/message-config';
import { BUTTON_MENU_MAX_COUNT } from '@/views/content/button-menu/constants';
import type {
  DropPlacement,
  MenuButtonItem,
  MenuButtonPatch,
  MenuRows,
} from '@/views/content/button-menu/types';
import {
  canPublishButton,
  createButtonDraft,
  isButtonDirty,
  keyboardToDraft,
  moveButton,
  moveButtonToNewRow,
  pinDrafts,
  toKeyboardParams,
  toLayoutIds,
} from '@/views/content/button-menu/utils';

type ActionPatch = Partial<Pick<ActionButtonItem, 'name' | 'link'>>;

export const useButtonMenu = (botId: string, savedRows: KeyboardButton[][]) => {
  const [rows, setRows] = useState<MenuRows>(() =>
    savedRows.map((row) => row.map(keyboardToDraft)),
  );
  const [selectedId, setSelectedId] = useState<string | null>(savedRows[0]?.[0]?.id ?? null);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(() => new Set());
  const nextId = useRef(1);
  const imageUrls = useObjectUrls<string>();
  const pendingFiles = useRef(new Map<string, File>());

  const { mutateAsync: createButton, isPending: isCreating } = useCreateKeyboardButton(botId);
  const { mutateAsync: updateButton, isPending: isUpdating } = useUpdateKeyboardButton(botId);
  const { mutateAsync: deleteButton, isPending: isDeleting } = useDeleteKeyboardButton(botId);
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadKeyboardImage(botId);
  const { mutateAsync: saveLayout, isPending: isMoving } = useUpdateKeyboardLayout(botId);

  const buttons = rows.flat();
  const selected = buttons.find((item) => item.id === selectedId) ?? null;
  const canAdd = buttons.length < BUTTON_MENU_MAX_COUNT;
  const pendingImage = selected ? pendingIds.has(selected.id) : false;
  const isSaving = isCreating || isUpdating || isUploading;
  const canPublish = selected ? canPublishButton(selected, pendingImage, buttons) : false;
  const canCancel = selected ? selected.isNew || isButtonDirty(selected, pendingImage) : false;

  const replaceButton = (id: string, update: (item: MenuButtonItem) => MenuButtonItem) => {
    setRows((prev) => prev.map((row) => row.map((item) => (item.id === id ? update(item) : item))));
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

  const dropButton = (id: string) => {
    forgetImage(id);
    const nextRows = rows
      .map((row) => row.filter((item) => item.id !== id))
      .filter((row) => row.length > 0);
    setRows(nextRows);
    setSelectedId((current) => (current === id ? (nextRows[0]?.[0]?.id ?? null) : current));
  };

  const addButton = () => {
    if (!canAdd) return;
    // id 在 updater 外生成，避免 StrictMode 下 updater 执行两次导致 id 跳号
    const id = `local-${nextId.current++}`;
    setRows((prev) => [...prev, [createButtonDraft(id)]]);
    setSelectedId(id);
  };

  const removeButton = async (id: string) => {
    const item = buttons.find((entry) => entry.id === id);
    if (!item || isDeleting) return;
    if (!item.isNew) {
      try {
        await deleteButton(id);
      } catch {
        // 错误已由请求拦截器提示；删除失败时按钮仍保留
        return;
      }
    }
    dropButton(id);
  };

  const patchButton = (id: string, patch: MenuButtonPatch) => {
    replaceButton(id, (item) => ({ ...item, ...patch }));
  };

  const selectImage = (id: string, file: File) => {
    const url = imageUrls.replace(id, file);
    pendingFiles.current.set(id, file);
    setPendingIds((prev) => new Set(prev).add(id));
    patchButton(id, { image: { url, name: file.name } });
  };

  const addAction = (id: string) => {
    replaceButton(id, (item) => ({ ...item, actions: appendAction(item.actions) }));
  };

  const updateAction = (id: string, actionId: number, patch: ActionPatch) => {
    replaceButton(id, (item) => ({ ...item, actions: patchAction(item.actions, actionId, patch) }));
  };

  const removeAction = (id: string, actionId: number) => {
    replaceButton(id, (item) => ({ ...item, actions: dropAction(item.actions, actionId) }));
  };

  const cancel = () => {
    if (!selected) return;
    if (selected.isNew || !selected.baseline) {
      dropButton(selected.id);
      return;
    }
    const baseline = selected.baseline;
    forgetImage(selected.id);
    replaceButton(selected.id, () => keyboardToDraft(baseline));
  };

  const publish = async () => {
    if (
      !selected ||
      isSaving ||
      !canPublishButton(selected, pendingIds.has(selected.id), buttons)
    ) {
      return;
    }
    const draft = selected;
    const file = pendingFiles.current.get(draft.id);
    try {
      const imageUrl =
        draft.messageType === 'graphic'
          ? file
            ? (await uploadImage(file)).imageUrl
            : (draft.image?.url ?? null)
          : null;
      const params = toKeyboardParams(draft, imageUrl);
      const saved = draft.isNew
        ? await createButton(params)
        : await updateButton({ buttonId: draft.id, ...params });
      forgetImage(draft.id);
      // 服务端把新按钮放在最后，保存后重新把剩余草稿排到已保存按钮之后
      setRows((prev) =>
        pinDrafts(
          prev.map((row) =>
            row.map((item) => (item.id === draft.id ? keyboardToDraft(saved) : item)),
          ),
        ),
      );
      setSelectedId(saved.id);
    } catch {
      // 错误已由请求拦截器统一提示，草稿保留以便重试
    }
  };

  /** 乐观更新本地布局，再提交给服务端；失败则回滚到拖拽前 */
  const commitLayout = async (next: MenuRows) => {
    const previous = rows;
    const ids = toLayoutIds(next);
    setRows(next);
    if (JSON.stringify(ids) === JSON.stringify(toLayoutIds(previous))) return;
    try {
      await saveLayout(ids);
    } catch {
      // 错误已由请求拦截器统一提示
      setRows(previous);
    }
  };

  const canMove = (...ids: string[]) =>
    !isMoving && ids.every((id) => buttons.find((item) => item.id === id)?.isNew === false);

  const moveTo = (dragId: string, targetId: string, placement: DropPlacement) => {
    // 未保存的草稿固定在最后一行，不能被拖，也不能作为落点
    if (!canMove(dragId, targetId)) return;
    const moved = moveButton(rows, dragId, targetId, placement);
    if (moved === rows) return;
    void commitLayout(pinDrafts(moved));
  };

  const moveToNewRow = (dragId: string) => {
    if (!canMove(dragId)) return;
    void commitLayout(pinDrafts(moveButtonToNewRow(rows, dragId)));
  };

  return {
    rows,
    selected,
    canAdd,
    canPublish,
    canCancel,
    isSaving,
    addButton,
    removeButton,
    selectButton: setSelectedId,
    updateButton: patchButton,
    selectImage,
    addAction,
    updateAction,
    removeAction,
    cancel,
    publish,
    moveTo,
    moveToNewRow,
  };
};
