import type { FC } from 'react';
import { CircleHelp } from 'lucide-react';

import ActionButtonsField from '@/components/ActionButtonsField';
import DescriptionEditor from '@/components/DescriptionEditor';
import FormRow from '@/components/FormRow';
import ImageUpload from '@/components/ImageUpload';
import MessageTypeField from '@/components/MessageTypeField';
import Switch from '@/components/Switch';
import type { ActionButtonItem } from '@/types/message';
import MenuPanelActions from '@/views/content/button-menu/components/MenuPanelActions';
import { MENU_MESSAGE_MAX_LENGTH } from '@/views/content/button-menu/constants';
import type { MenuButtonItem, MenuButtonPatch } from '@/views/content/button-menu/types';

const INPUT_CLASS =
  'h-10 w-full rounded-lg border border-[#e4e7ee] px-3 text-sm outline-none focus:border-[#2F6EFF]';

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
const MenuInformation: FC<MenuInformationProps> = ({
  button,
  onChange,
  onSelectImage,
  onAddAction,
  onUpdateAction,
  onRemoveAction,
}) => {
  const { messageType } = button;

  return (
    <section className="w-full min-w-0 flex-1 rounded-2xl bg-white p-6">
      <header className="flex items-center justify-between gap-4 border-b border-[#e4e7ee] pb-5">
        <h2 className="text-base font-semibold">Menu information</h2>
        <MenuPanelActions />
      </header>

      <div>
        <FormRow label="Name">
          <div className="grid grid-cols-2 gap-3">
            <input
              aria-label="Menu name"
              placeholder="menu name"
              value={button.name}
              onChange={(event) => onChange({ name: event.target.value })}
              className={INPUT_CLASS}
            />
            <input
              aria-label="Menu description"
              placeholder="menu description"
              value={button.menuDescription}
              onChange={(event) => onChange({ menuDescription: event.target.value })}
              className={INPUT_CLASS}
            />
          </div>
        </FormRow>

        <FormRow label="Message type">
          <MessageTypeField
            allowLink
            value={messageType}
            onChange={(value) => onChange({ messageType: value })}
          />
        </FormRow>

        {messageType === 'link' ? (
          <FormRow label="Link" hint="Open this address when the button is clicked">
            <input
              aria-label="Link URL"
              placeholder="https://"
              value={button.link}
              onChange={(event) => onChange({ link: event.target.value })}
              className={INPUT_CLASS}
            />
          </FormRow>
        ) : (
          <>
            {messageType === 'graphic' ? (
              <FormRow
                label={
                  <span className="flex items-center gap-1.5">
                    Image
                    <CircleHelp className="size-3.5 text-[#8a90a0]" strokeWidth={1.8} />
                  </span>
                }
                hint="This will appear above the content"
              >
                <ImageUpload fileName={button.image?.name} onSelect={onSelectImage} />
              </FormRow>
            ) : null}

            <FormRow label="Description" hint="Write a brief description">
              <DescriptionEditor
                value={button.description}
                maxLength={MENU_MESSAGE_MAX_LENGTH}
                onChange={(value) => onChange({ description: value })}
              />
            </FormRow>

            <FormRow
              label={
                <span className="flex items-center gap-2">
                  Action button
                  <Switch
                    checked={button.actionEnabled}
                    onChange={(checked) => onChange({ actionEnabled: checked })}
                    label="Action button"
                  />
                </span>
              }
              hint="Used to jump to websites or other Bots"
            >
              {button.actionEnabled ? (
                <ActionButtonsField
                  items={button.actions}
                  onChange={onUpdateAction}
                  onAdd={onAddAction}
                  onRemove={onRemoveAction}
                />
              ) : null}
            </FormRow>
          </>
        )}
      </div>
    </section>
  );
};

export default MenuInformation;
