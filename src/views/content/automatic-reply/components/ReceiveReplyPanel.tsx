import { useState, type FC } from 'react';
import { toast } from 'sonner';

import Button from '@/components/Button';
import DescriptionEditor from '@/components/DescriptionEditor';
import FormRow from '@/components/FormRow';
import ReplySwitchCard from '@/views/content/automatic-reply/components/ReplySwitchCard';
import {
  DEFAULT_RECEIVE_REPLY_CONTENT,
  REPLY_CONTENT_MAX_LENGTH,
} from '@/views/content/automatic-reply/constants';

/** 用户发来的消息没有命中任何关键词时，机器人统一回复的内容 */
const ReceiveReplyPanel: FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [content, setContent] = useState(DEFAULT_RECEIVE_REPLY_CONTENT);

  const handleSave = () => {
    toast.success('Receive message reply saved');
  };

  return (
    <div className="space-y-5">
      <ReplySwitchCard
        title="Receive message reply"
        description="When a user sends a message that doesn't match any keyword, the bot will reply with the content below. Once you turn it off, it will take effect immediately for all users."
        checked={enabled}
        onChange={setEnabled}
      />

      <section className="rounded-2xl bg-white p-6">
        <header className="flex items-start justify-between gap-4 border-b border-[#e4e7ee] pb-5">
          <div>
            <h2 className="text-base font-semibold">Reply content</h2>
            <p className="mt-1 text-xs text-[#5c6170]">
              Set the default reply for messages without a matching keyword
            </p>
          </div>
          <Button className="rounded-lg" disabled={content.trim() === ''} onClick={handleSave}>
            Save and publish
          </Button>
        </header>

        <FormRow label="Description" hint="Write a brief description">
          <DescriptionEditor
            value={content}
            maxLength={REPLY_CONTENT_MAX_LENGTH}
            onChange={setContent}
          />
        </FormRow>
      </section>
    </div>
  );
};

export default ReceiveReplyPanel;
