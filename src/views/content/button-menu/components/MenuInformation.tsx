import type { FC } from 'react';

import MessageConfigForm from '@/components/MessageConfigForm';
import type { ActionButtonItem } from '@/types/message';
import MenuPanelActions from '@/views/content/button-menu/components/MenuPanelActions';
import type { MenuButtonItem, MenuButtonPatch } from '@/views/content/button-menu/types';

interface MenuInformationProps {
  button: MenuButtonItem;
  onChange: (patch: MenuButtonPatch) => void;
  onSelectImage: (file: File) => void;
  onAddAction: () => void;
  onUpdateAction: (
    actionId: number,
    patch: Partial<Pick<ActionButtonItem, 'name' | 'link'>>,
  ) => void;
  onRemoveAction: (actionId: number) => void;
}

/** 选中某个按钮后，配置点击它时触发的消息 */
const MenuInformation: FC<MenuInformationProps> = ({ button, ...handlers }) => {
  return (
    <section className="w-full min-w-0 flex-1 rounded-2xl bg-white p-6">
      <header className="flex items-center justify-between gap-4 border-b border-[#e4e7ee] pb-5">
        <h2 className="text-base font-semibold">Menu information</h2>
        <MenuPanelActions />
      </header>

      <MessageConfigForm value={button} {...handlers} />
    </section>
  );
};

export default MenuInformation;
