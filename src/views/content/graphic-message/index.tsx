import { useRef, useState, type FC } from 'react';
import { CircleHelp, Image as ImageIcon } from 'lucide-react';

import graBg from '@/assets/image/content/gra_bg.png';
import Button from '@/components/Button';
import MessageBubble from '@/components/MessageBubble';
import PhonePreview from '@/components/PhonePreview';
import ActionButtonsField from '@/views/content/graphic-message/components/ActionButtonsField';
import DescriptionEditor from '@/views/content/graphic-message/components/DescriptionEditor';
import FormRow from '@/views/content/graphic-message/components/FormRow';
import ImageUpload from '@/views/content/graphic-message/components/ImageUpload';
import MessageTypeField from '@/views/content/graphic-message/components/MessageTypeField';
import Switch from '@/views/content/graphic-message/components/Switch';
import {
  BOT_NAME,
  DEFAULT_GRAPHIC_MESSAGE,
  GRAPHIC_MESSAGE_MAX_LENGTH,
  PREVIEW_TIME,
} from '@/views/content/graphic-message/constants';
import { useImagePreview } from '@/views/content/graphic-message/hooks/useImagePreview';
import type { ActionButtonItem, MessageType } from '@/views/content/graphic-message/types';

const createActionButton = (id: number): ActionButtonItem => ({ id, name: '', link: '' });

const GraphicMessage: FC = () => {
  const [messageType, setMessageType] = useState<MessageType>('graphic');
  const [description, setDescription] = useState(DEFAULT_GRAPHIC_MESSAGE);
  const [actionEnabled, setActionEnabled] = useState(false);
  const [actions, setActions] = useState<ActionButtonItem[]>([createActionButton(1)]);
  const nextActionId = useRef(2);
  const { image, select } = useImagePreview();

  const isGraphic = messageType === 'graphic';
  const previewActions = actionEnabled
    ? actions.map((item) => item.name.trim()).filter(Boolean)
    : [];

  const updateAction = (id: number, patch: Partial<Pick<ActionButtonItem, 'name' | 'link'>>) => {
    setActions((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addAction = () => {
    setActions((prev) => [...prev, createActionButton(nextActionId.current++)]);
  };

  const removeAction = (id: number) => {
    setActions((prev) => prev.filter((item) => item.id !== id));
  };

  const media = isGraphic ? (
    image ? (
      <img src={image.url} alt="" className="block aspect-video w-full object-cover" />
    ) : (
      <div className="grid aspect-video w-full place-items-center bg-[#c9dcec] text-[#7c93a8]">
        <ImageIcon className="size-6" strokeWidth={1.6} />
      </div>
    )
  ) : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Graphic message</h1>

      <div className="mt-5 flex flex-col items-start gap-6 lg:flex-row">
        <PhonePreview background={graBg} botName={BOT_NAME} contentBottom={13}>
          <MessageBubble
            text={description}
            selected
            media={media}
            time={PREVIEW_TIME}
            actions={previewActions}
          />
        </PhonePreview>

        <section className="w-full min-w-0 flex-1 rounded-2xl bg-white p-6">
          <header className="flex items-start justify-between gap-4 border-b border-[#e4e7ee] pb-5">
            <div>
              <h2 className="text-base font-semibold">Graphic messages</h2>
              <p className="mt-1 text-xs text-[#5c6170]">Update your images and content here</p>
            </div>
            <Button className="rounded-lg">Save and publish</Button>
          </header>

          <div>
            <FormRow label="Message type">
              <MessageTypeField value={messageType} onChange={setMessageType} />
            </FormRow>

            {isGraphic ? (
              <FormRow
                label={
                  <span className="flex items-center gap-1.5">
                    Image
                    <CircleHelp className="size-3.5 text-[#8a90a0]" strokeWidth={1.8} />
                  </span>
                }
                hint="This will appear above the content"
              >
                <ImageUpload fileName={image?.name} onSelect={select} />
              </FormRow>
            ) : null}

            <FormRow label="Description" hint="Write a brief description">
              <DescriptionEditor
                value={description}
                maxLength={GRAPHIC_MESSAGE_MAX_LENGTH}
                onChange={setDescription}
              />
            </FormRow>

            <FormRow
              label={
                <span className="flex items-center gap-2">
                  Action button
                  <Switch
                    checked={actionEnabled}
                    onChange={setActionEnabled}
                    label="Action button"
                  />
                </span>
              }
              hint="Used to jump to websites or other Bots"
            >
              {actionEnabled ? (
                <ActionButtonsField
                  items={actions}
                  onChange={updateAction}
                  onAdd={addAction}
                  onRemove={removeAction}
                />
              ) : null}
            </FormRow>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GraphicMessage;
