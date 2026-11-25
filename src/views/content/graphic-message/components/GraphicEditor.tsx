import { useRef, useState, type FC } from 'react';
import { CircleHelp, Image as ImageIcon } from 'lucide-react';

import ActionButtonsField from '@/components/ActionButtonsField';
import Button from '@/components/Button';
import DescriptionEditor from '@/components/DescriptionEditor';
import FormRow from '@/components/FormRow';
import ImageUpload from '@/components/ImageUpload';
import MessageBubble from '@/components/MessageBubble';
import MessageTypeField from '@/components/MessageTypeField';
import PhonePreview from '@/components/PhonePreview';
import Switch from '@/components/Switch';
import { useUpdateBotStartMessage, useUploadStartMessageImage } from '@/hooks/useBots';
import type { StartMessage } from '@/types/bot';
import type { ActionButtonItem, MessageType } from '@/types/message';
import { TELEGRAM_WALLPAPER_COLORS } from '@/utils/gradient';
import {
  GRAPHIC_MESSAGE_MAX_LENGTH,
  PREVIEW_TIME,
} from '@/views/content/graphic-message/constants';
import { useImagePreview } from '@/views/content/graphic-message/hooks/useImagePreview';

interface GraphicEditorProps {
  botId: string;
  botName: string;
  /** 服务端已保存的开场消息；未配置时是空模板 */
  startMessage: StartMessage;
}

const createActionButton = (id: number): ActionButtonItem => ({ id, name: '', link: '' });

/** 服务端按钮 -> 表单项；没有按钮时保留一条空按钮，方便开启开关后直接填写 */
const toActionItems = (buttons: StartMessage['buttons']): ActionButtonItem[] =>
  buttons.length > 0
    ? buttons.map((button, index) => ({ id: index + 1, name: button.name, link: button.url }))
    : [createActionButton(1)];

/** 取图片地址最后一段作为文件名 */
const getImageName = (url: string) => url.split('?')[0].split('/').pop() || url;

const GraphicEditor: FC<GraphicEditorProps> = ({ botId, botName, startMessage }) => {
  const [messageType, setMessageType] = useState<MessageType>(startMessage.messageType);
  const [description, setDescription] = useState(startMessage.description);
  const [actionEnabled, setActionEnabled] = useState(startMessage.buttonsEnabled);
  const [actions, setActions] = useState<ActionButtonItem[]>(() =>
    toActionItems(startMessage.buttons),
  );
  const nextActionId = useRef(Math.max(startMessage.buttons.length, 1) + 1);
  const { image, select } = useImagePreview(
    startMessage.imageUrl
      ? { url: startMessage.imageUrl, name: getImageName(startMessage.imageUrl) }
      : null,
  );
  /** 本地新选的、还没上传的图片；保存时才上传 */
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const { mutateAsync: publish, isPending: isPublishing } = useUpdateBotStartMessage(botId);
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadStartMessageImage(botId);
  const isSaving = isPublishing || isUploading;

  const selectImage = (file: File) => {
    setPendingImage(file);
    select(file);
  };

  const handlePublish = async () => {
    const isGraphicMessage = messageType === 'graphic';
    try {
      // 图文且选了新图：先上传拿到地址；没选新图则沿用已发布的地址
      const imageUrl = isGraphicMessage
        ? pendingImage
          ? (await uploadImage(pendingImage)).imageUrl
          : startMessage.imageUrl
        : null;
      await publish({
        messageType: isGraphicMessage ? 'graphic' : 'text',
        imageUrl,
        description,
        buttonsEnabled: actionEnabled,
        // 空行（名称和链接都没填）不提交；buttonsEnabled 为 false 时按钮仍会保存
        buttons: actions
          .filter((item) => item.name.trim() || item.link.trim())
          .map((item) => ({ name: item.name.trim(), url: item.link.trim() })),
      });
      setPendingImage(null);
    } catch {
      // 错误已由请求拦截器统一提示，编辑内容保留以便重试
    }
  };

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
    <div className="mt-5 flex flex-col items-start gap-6 lg:flex-row">
      <PhonePreview wallpaperColors={TELEGRAM_WALLPAPER_COLORS} botName={botName}>
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
          <Button className="rounded-lg" disabled={isSaving} onClick={handlePublish}>
            {isSaving ? 'Publishing...' : 'Save and publish'}
          </Button>
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
              <ImageUpload fileName={image?.name} onSelect={selectImage} />
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
                <Switch checked={actionEnabled} onChange={setActionEnabled} label="Action button" />
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
  );
};

export default GraphicEditor;
