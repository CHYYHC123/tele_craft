import type { FC } from 'react';

import Button from '@/components/Button';
import MessageConfigForm from '@/components/MessageConfigForm';
import type { ActionButtonItem, MessageConfig, MessageConfigPatch } from '@/types/message';

interface MenuInformationProps {
  item: MessageConfig;
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
const MenuInformation: FC<MenuInformationProps> = ({ item, ...handlers }) => {
  return (
    <section className="w-full min-w-0 flex-1 rounded-2xl bg-white p-6">
      <header className="flex items-center justify-between gap-4 border-b border-[#e4e7ee] pb-5">
        <h2 className="text-base font-semibold">Menu information</h2>
        <Button className="rounded-lg">Save and publish</Button>
      </header>

      <MessageConfigForm value={item} {...handlers} />
    </section>
  );
};

export default MenuInformation;
