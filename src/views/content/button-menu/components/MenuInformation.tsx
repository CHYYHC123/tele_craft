import type { FC } from 'react';

import MessageConfigForm from '@/components/MessageConfigForm';
import type { ActionButtonItem, MessageConfig, MessageConfigPatch } from '@/types/message';
import MenuPanelActions from '@/views/content/button-menu/components/MenuPanelActions';
import {
  BUTTON_MESSAGE_MAX_LENGTH,
  BUTTON_REMARK_MAX_LENGTH,
  BUTTON_TEXT_MAX_LENGTH,
} from '@/views/content/button-menu/constants';

interface MenuInformationProps {
  button: MessageConfig;
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

/** 选中某个按钮后，配置点击它时触发的消息 */
const MenuInformation: FC<MenuInformationProps> = ({
  button,
  publishing,
  canPublish,
  canCancel,
  onPublish,
  onCancel,
  ...handlers
}) => {
  return (
    <section className="w-full min-w-0 rounded-2xl bg-white p-6">
      <header className="flex items-center justify-between gap-4 border-b border-[#e4e7ee] pb-5">
        <h2 className="text-base font-semibold">Menu information</h2>
        <MenuPanelActions
          publishing={publishing}
          canPublish={canPublish}
          canCancel={canCancel}
          onPublish={onPublish}
          onCancel={onCancel}
        />
      </header>

      <MessageConfigForm
        value={button}
        nameMaxLength={BUTTON_TEXT_MAX_LENGTH}
        menuDescriptionMaxLength={BUTTON_REMARK_MAX_LENGTH}
        descriptionMaxLength={BUTTON_MESSAGE_MAX_LENGTH}
        {...handlers}
      />
    </section>
  );
};

export default MenuInformation;
