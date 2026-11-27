import type { FC } from 'react';

import PhonePreview from '@/components/PhonePreview';
import type { KeyboardButton, MenuStrategy } from '@/types/bot';
import { TELEGRAM_WALLPAPER_COLORS } from '@/utils/gradient';
import DispatchStrategyCard from '@/views/content/button-menu/components/DispatchStrategyCard';
import EmptyMenuCard from '@/views/content/button-menu/components/EmptyMenuCard';
import MenuComposer from '@/views/content/button-menu/components/MenuComposer';
import MenuInformation from '@/views/content/button-menu/components/MenuInformation';
import MenuPreview from '@/views/content/button-menu/components/MenuPreview';
import { useButtonMenu } from '@/views/content/button-menu/hooks/useButtonMenu';
import { useDispatchStrategy } from '@/views/content/button-menu/hooks/useDispatchStrategy';
import { toMessageConfig } from '@/views/content/button-menu/utils';

interface ButtonMenuEditorProps {
  botId: string;
  botName: string;
  rows: KeyboardButton[][];
  /** 服务端已保存的下发策略，作为草稿起点 */
  strategy: MenuStrategy;
}

/** 键盘按钮编辑器。由页面在数据到位后挂载，并以 botId 为 key，切换 Bot 时丢掉草稿 */
const ButtonMenuEditor: FC<ButtonMenuEditorProps> = ({ botId, botName, rows, strategy }) => {
  const menu = useButtonMenu(botId, rows);
  const dispatch = useDispatchStrategy(botId, strategy);
  const { selected } = menu;

  return (
    <div className="mt-5 flex flex-col items-start gap-6 lg:flex-row">
      <PhonePreview
        wallpaperColors={TELEGRAM_WALLPAPER_COLORS}
        botName={botName}
        footer={
          <MenuComposer>
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
          </MenuComposer>
        }
      />

      <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
        {selected ? (
          <MenuInformation
            button={toMessageConfig(selected)}
            publishing={menu.isSaving}
            canPublish={menu.canPublish}
            canCancel={menu.canCancel}
            onPublish={menu.publish}
            onCancel={menu.cancel}
            onChange={(patch) => menu.updateButton(selected.id, patch)}
            onSelectImage={(file) => menu.selectImage(selected.id, file)}
            onAddAction={() => menu.addAction(selected.id)}
            onUpdateAction={(actionId, patch) => menu.updateAction(selected.id, actionId, patch)}
            onRemoveAction={(actionId) => menu.removeAction(selected.id, actionId)}
          />
        ) : (
          <EmptyMenuCard canAdd={menu.canAdd} onAdd={menu.addButton} />
        )}

        <DispatchStrategyCard
          value={dispatch.value}
          menus={dispatch.menus}
          canSave={dispatch.isDirty}
          saving={dispatch.isSaving}
          onToggle={dispatch.setEnabled}
          onSelectStrategy={dispatch.setStrategy}
          onSelectDefaultMenu={dispatch.setDefaultMenu}
          onSave={dispatch.save}
        />
      </div>
    </div>
  );
};

export default ButtonMenuEditor;
