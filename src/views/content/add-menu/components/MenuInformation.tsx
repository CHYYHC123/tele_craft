import type { FC } from 'react';

import Button from '@/components/Button';
import MessageConfigForm from '@/components/MessageConfigForm';
import type { ActionButtonItem, MessageConfig, MessageConfigPatch } from '@/types/message';
import {
  MENU_COMMAND_DESCRIPTION_MAX_LENGTH,
  MENU_COMMAND_MAX_LENGTH,
  MENU_MESSAGE_MAX_LENGTH,
} from '@/views/content/add-menu/constants';

interface MenuInformationProps {
  item: MessageConfig;
  publishing: boolean;
  canPublish: boolean;
  canCancel: boolean;
  onPublish: () => void;
  onCancel: () => void;
  onChange: (patch: MessageConfigPatch) => void;
  onSelectImage: (file: File) => void;
  onAddAction: () => void;
  onUpdateAction: (
    actionId: number,
    patch: Partial<Pick<ActionButtonItem, 'name' | 'link'>>,
  ) => void;
  onRemoveAction: (actionId: number) => void;
}

/** 选中某个菜单项后，配置点击它时触发的会话消息 */
const MenuInformation: FC<MenuInformationProps> = ({
  item,
  publishing,
  canPublish,
  canCancel,
  onPublish,
  onCancel,
  ...handlers
}) => {
  return (
    <section className="w-full min-w-0 flex-1 rounded-2xl bg-white p-6">
      <header className="flex items-center justify-between gap-4 border-b border-[#e4e7ee] pb-5">
        <h2 className="text-base font-semibold">Menu information</h2>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="rounded-lg"
            disabled={!canCancel || publishing}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button className="rounded-lg" disabled={!canPublish || publishing} onClick={onPublish}>
            {publishing ? 'Publishing...' : 'Save and publish'}
          </Button>
        </div>
      </header>

      <MessageConfigForm
        value={item}
        nameMaxLength={MENU_COMMAND_MAX_LENGTH}
        menuDescriptionMaxLength={MENU_COMMAND_DESCRIPTION_MAX_LENGTH}
        descriptionMaxLength={MENU_MESSAGE_MAX_LENGTH}
        {...handlers}
      />
    </section>
  );
};

export default MenuInformation;
