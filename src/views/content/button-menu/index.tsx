import type { FC } from 'react';

import PhonePreview from '@/components/PhonePreview';
import { TELEGRAM_WALLPAPER_COLORS } from '@/utils/gradient';
import EmptyMenuCard from '@/views/content/button-menu/components/EmptyMenuCard';
import MenuInformation from '@/views/content/button-menu/components/MenuInformation';
import MenuPreview from '@/views/content/button-menu/components/MenuPreview';
import { BOT_NAME } from '@/views/content/button-menu/constants';
import { useButtonMenu } from '@/views/content/button-menu/hooks/useButtonMenu';

const ButtonMenu: FC = () => {
  const menu = useButtonMenu();
  const { selected } = menu;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Button menu</h1>

      <div className="mt-5 flex flex-col items-start gap-6 lg:flex-row">
        <PhonePreview
          wallpaperColors={TELEGRAM_WALLPAPER_COLORS}
          botName={BOT_NAME}
          keyboard={
            <MenuPreview
              rows={menu.rows}
              selectedId={selected?.id ?? null}
              canAdd={menu.canAdd}
              onSelect={menu.selectButton}
              onAdd={menu.addButton}
              onRemove={menu.removeButton}
              onMove={menu.moveTo}
              onMoveToNewRow={menu.moveToNewRow}
            />
          }
        />

        {selected ? (
          <MenuInformation
            button={selected}
            onChange={(patch) => menu.updateButton(selected.id, patch)}
            onSelectImage={(file) => menu.selectImage(selected.id, file)}
            onAddAction={() => menu.addAction(selected.id)}
            onUpdateAction={(actionId, patch) => menu.updateAction(selected.id, actionId, patch)}
            onRemoveAction={(actionId) => menu.removeAction(selected.id, actionId)}
          />
        ) : (
          <EmptyMenuCard />
        )}
      </div>
    </div>
  );
};

export default ButtonMenu;
