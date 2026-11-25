import { useState, type FC } from 'react';
import { toast } from 'sonner';

import Button from '@/components/Button';
import DescriptionEditor from '@/components/DescriptionEditor';
import FormRow from '@/components/FormRow';
import { useUpdateBotAutoReply } from '@/hooks/useBots';
import ReplySwitchCard from '@/views/content/automatic-reply/components/ReplySwitchCard';
import { REPLY_CONTENT_MAX_LENGTH } from '@/views/content/automatic-reply/constants';

interface ReceiveReplyPanelProps {
  botId: string;
  /** 服务端已保存的兜底回复开关 */
  savedEnabled: boolean;
  /** 服务端已保存的兜底回复正文；未配置时为空字符串 */
  savedContent: string;
}

/** 用户发来的消息没有命中任何关键词时，机器人统一回复的内容 */
const ReceiveReplyPanel: FC<ReceiveReplyPanelProps> = ({ botId, savedEnabled, savedContent }) => {
  const [content, setContent] = useState(savedContent);
  const { mutate: update, isPending } = useUpdateBotAutoReply(botId);
  const isDirty = content !== savedContent;

  const handleToggle = (checked: boolean) => {
    if (!checked) {
      update({ receiveEnabled: false });
      return;
    }
    // 服务端要求打开兜底回复时正文不能为空：已存正文为空就带上当前草稿一起提交
    if (savedContent.trim() === '') {
      if (content.trim() === '') {
        toast.error('Enter reply content before turning it on');
        return;
      }
      update({ receiveEnabled: true, receiveContent: content });
      return;
    }
    update({ receiveEnabled: true });
  };

  const handleSave = () => {
    update(
      { receiveContent: content },
      { onSuccess: () => toast.success('Receive message reply saved') },
    );
  };

  return (
    <div className="space-y-5">
      <ReplySwitchCard
        title="Receive message reply"
        description="When a user sends a message that doesn't match any keyword, the bot will reply with the content below. Once you turn it off, it will take effect immediately for all users."
        checked={savedEnabled}
        onChange={handleToggle}
      />

      <section className="rounded-2xl bg-white p-6">
        <header className="flex items-start justify-between gap-4 border-b border-[#e4e7ee] pb-5">
          <div>
            <h2 className="text-base font-semibold">Reply content</h2>
            <p className="mt-1 text-xs text-[#5c6170]">
              Set the default reply for messages without a matching keyword
            </p>
          </div>
          <Button
            className="rounded-lg"
            disabled={content.trim() === '' || !isDirty || isPending}
            onClick={handleSave}
          >
            {isPending ? 'Saving...' : 'Save and publish'}
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
