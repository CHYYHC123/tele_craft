import type { FC } from 'react';
import { CircleHelp } from 'lucide-react';

import ActionButtonsField from '@/components/ActionButtonsField';
import DescriptionEditor from '@/components/DescriptionEditor';
import FormRow from '@/components/FormRow';
import ImageUpload from '@/components/ImageUpload';
import MessageTypeField from '@/components/MessageTypeField';
import Switch from '@/components/Switch';
import type { ActionButtonItem, MessageConfig, MessageConfigPatch } from '@/types/message';
import { MESSAGE_MAX_LENGTH } from '@/utils/message-config';

const INPUT_CLASS =
  'h-10 w-full rounded-lg border border-[#e4e7ee] px-3 text-sm outline-none focus:border-[#2F6EFF]';

interface MessageConfigFormProps {
  value: MessageConfig;
  onChange: (patch: MessageConfigPatch) => void;
  onSelectImage: (file: File) => void;
  onAddAction: () => void;
  onUpdateAction: (
    actionId: number,
    patch: Partial<Pick<ActionButtonItem, 'name' | 'link'>>,
  ) => void;
  onRemoveAction: (actionId: number) => void;
}

/** 名称 + 消息类型 + 对应消息内容的表单行，不含外层卡片 */
const MessageConfigForm: FC<MessageConfigFormProps> = ({
  value,
  onChange,
  onSelectImage,
  onAddAction,
  onUpdateAction,
  onRemoveAction,
}) => {
  const { messageType } = value;

  return (
    <div>
      <FormRow label="Name">
        <div className="grid grid-cols-2 gap-3">
          <input
            aria-label="Menu name"
            placeholder="menu name"
            value={value.name}
            onChange={(event) => onChange({ name: event.target.value })}
            className={INPUT_CLASS}
          />
          <input
            aria-label="Menu description"
            placeholder="menu description"
            value={value.menuDescription}
            onChange={(event) => onChange({ menuDescription: event.target.value })}
            className={INPUT_CLASS}
          />
        </div>
      </FormRow>

      <FormRow label="Message type">
        <MessageTypeField
          allowLink
          value={messageType}
          onChange={(type) => onChange({ messageType: type })}
        />
      </FormRow>

      {messageType === 'link' ? (
        <FormRow label="External link">
          <input
            aria-label="External link"
            placeholder="Enter your link"
            value={value.link}
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
              <ImageUpload fileName={value.image?.name} onSelect={onSelectImage} />
            </FormRow>
          ) : null}

          <FormRow label="Description" hint="Write a brief description">
            <DescriptionEditor
              value={value.description}
              maxLength={MESSAGE_MAX_LENGTH}
              onChange={(description) => onChange({ description })}
            />
          </FormRow>

          <FormRow
            label={
              <span className="flex items-center gap-2">
                Action button
                <Switch
                  checked={value.actionEnabled}
                  onChange={(checked) => onChange({ actionEnabled: checked })}
                  label="Action button"
                />
              </span>
            }
            hint="Used to jump to websites or other Bots"
          >
            {value.actionEnabled ? (
              <ActionButtonsField
                items={value.actions}
                onChange={onUpdateAction}
                onAdd={onAddAction}
                onRemove={onRemoveAction}
              />
            ) : null}
          </FormRow>
        </>
      )}
    </div>
  );
};

export default MessageConfigForm;
