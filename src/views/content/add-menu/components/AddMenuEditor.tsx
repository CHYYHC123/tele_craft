import type { FC } from 'react';

import PhonePreview from '@/components/PhonePreview';
import type { BotMenu } from '@/types/bot';
import { TELEGRAM_WALLPAPER_COLORS } from '@/utils/gradient';
import EmptyMenuCard from '@/views/content/add-menu/components/EmptyMenuCard';
import MenuComposer from '@/views/content/add-menu/components/MenuComposer';
import MenuInformation from '@/views/content/add-menu/components/MenuInformation';
import MenuPopup from '@/views/content/add-menu/components/MenuPopup';
import { useAddMenu } from '@/views/content/add-menu/hooks/useAddMenu';
import { toMessageConfig } from '@/views/content/add-menu/utils';

interface AddMenuEditorProps {
  botId: string;
  botName: string;
  menus: BotMenu[];
}

/** 菜单编辑器。由页面在数据到位后挂载，并以 botId 为 key，切换 Bot 时丢掉草稿 */
const AddMenuEditor: FC<AddMenuEditorProps> = ({ botId, botName, menus }) => {
  const menu = useAddMenu(botId, menus);
  const { selected } = menu;

  return (
    <div className="mt-5 flex flex-col items-start gap-6 lg:flex-row">
      <PhonePreview
        wallpaperColors={TELEGRAM_WALLPAPER_COLORS}
        botName={botName}
        footer={<MenuComposer />}
      >
        <MenuPopup
          items={menu.items}
          selectedId={selected?.id ?? null}
          canAdd={menu.canAdd}
          onSelect={menu.selectItem}
          onAdd={menu.addItem}
          onSelectPrevious={menu.selectPrevious}
          onRemove={menu.removeItem}
        />
      </PhonePreview>

      {selected ? (
        <MenuInformation
          item={toMessageConfig(selected)}
          publishing={menu.isSaving}
          canPublish={menu.canPublish}
          canCancel={menu.canCancel}
          onPublish={menu.publish}
          onCancel={menu.cancel}
          onChange={(patch) => menu.updateItem(selected.id, patch)}
          onSelectImage={(file) => menu.selectImage(selected.id, file)}
          onAddAction={() => menu.addAction(selected.id)}
          onUpdateAction={(actionId, patch) => menu.updateAction(selected.id, actionId, patch)}
          onRemoveAction={(actionId) => menu.removeAction(selected.id, actionId)}
        />
      ) : (
        <EmptyMenuCard />
      )}
    </div>
  );
};

export default AddMenuEditor;
