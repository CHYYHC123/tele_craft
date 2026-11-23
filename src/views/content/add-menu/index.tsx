import type { FC } from 'react';

import menuBg from '@/assets/image/content/menu_bg.png';
import PhonePreview from '@/components/PhonePreview';
import EmptyMenuCard from '@/views/content/add-menu/components/EmptyMenuCard';
import MenuInformation from '@/views/content/add-menu/components/MenuInformation';
import MenuPopup from '@/views/content/add-menu/components/MenuPopup';
import { BOT_NAME } from '@/views/content/add-menu/constants';
import { useAddMenu } from '@/views/content/add-menu/hooks/useAddMenu';

const AddMenu: FC = () => {
  const menu = useAddMenu();
  const { selected } = menu;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Add menu</h1>

      <div className="mt-5 flex flex-col items-start gap-6 lg:flex-row">
        <PhonePreview
          background={menuBg}
          botName={BOT_NAME}
          contentBottom={12.5}
          overlay={
            // 还没有自定义菜单时，高亮底部的「M」菜单按钮，引导用户点击 Add menu
            menu.items.length === 0 ? (
              <span className="absolute top-[88.8%] left-[1%] h-[6.7%] w-[19%] rounded-2xl border-2 border-[#2F6EFF]" />
            ) : null
          }
        >
          <MenuPopup
            items={menu.items}
            selectedId={selected?.id ?? null}
            canAdd={menu.canAdd}
            onSelect={menu.selectItem}
            onAdd={menu.addItem}
            onMoveUp={menu.moveUp}
            onRemove={menu.removeItem}
          />
        </PhonePreview>

        {selected ? (
          <MenuInformation
            item={selected}
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
    </div>
  );
};

export default AddMenu;
