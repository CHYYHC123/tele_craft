import { useState, type FC } from 'react';

import Button from '@/components/Button';
import DescriptionEditor from '@/components/DescriptionEditor';
import MessageBubble from '@/components/MessageBubble';
import PhonePreview from '@/components/PhonePreview';
import { useUpdateBotWelcome } from '@/hooks/useBots';
import { TELEGRAM_WALLPAPER_COLORS } from '@/utils/gradient';
import StartBar from '@/views/content/welcome-message/components/StartBar';
import {
  WELCOME_MESSAGE_MAX_LENGTH,
  WELCOME_PREVIEW_TITLE,
  WELCOME_START_LABEL,
} from '@/views/content/welcome-message/constants';

interface WelcomeEditorProps {
  botId: string;
  botName: string;
  /** 服务端已保存的欢迎语；未配置时为 null */
  savedDescription: string | null;
}

const WelcomeEditor: FC<WelcomeEditorProps> = ({ botId, botName, savedDescription }) => {
  const [description, setDescription] = useState(savedDescription ?? '');
  const { mutate: publish, isPending } = useUpdateBotWelcome(botId);
  const isDirty = description !== (savedDescription ?? '');

  return (
    <div className="mt-5 flex flex-col items-start gap-6 lg:flex-row">
      <PhonePreview
        wallpaperColors={TELEGRAM_WALLPAPER_COLORS}
        botName={botName}
        footer={<StartBar label={WELCOME_START_LABEL} />}
      >
        <MessageBubble title={WELCOME_PREVIEW_TITLE} text={description} selected />
      </PhonePreview>

      <section className="w-full min-w-0 flex-1 rounded-2xl bg-white p-6">
        <header className="flex items-start justify-between gap-4 border-b border-[#e4e7ee] pb-5">
          <div>
            <h2 className="text-base font-semibold">Welcome message</h2>
            <p className="mt-1 text-xs text-[#5c6170]">Update your welcome message here</p>
          </div>
          <Button
            className="rounded-lg"
            disabled={!isDirty || isPending}
            onClick={() => publish(description)}
          >
            {isPending ? 'Publishing...' : 'Save and publish'}
          </Button>
        </header>

        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
          <div>
            <span className="block text-sm font-semibold">Description</span>
            <span className="mt-0.5 block text-xs text-[#5c6170]">Write a brief description</span>
          </div>

          <DescriptionEditor
            value={description}
            maxLength={WELCOME_MESSAGE_MAX_LENGTH}
            onChange={setDescription}
          />
        </div>
      </section>
    </div>
  );
};

export default WelcomeEditor;
