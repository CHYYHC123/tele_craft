import { useState, type FC } from 'react';
import { Search } from 'lucide-react';

import Button from '@/components/Button';
import { useUpdateBotAutoReply } from '@/hooks/useBots';
import type { KeywordReplyRule } from '@/types/bot';
import ReplyDialog from '@/views/content/automatic-reply/components/ReplyDialog';
import ReplySwitchCard from '@/views/content/automatic-reply/components/ReplySwitchCard';
import { useKeywordReplies } from '@/views/content/automatic-reply/hooks/useKeywordReplies';
import type { ReplyDialogMode } from '@/views/content/automatic-reply/types';
import { formatKeywords } from '@/views/content/automatic-reply/utils';

interface DialogState {
  mode: ReplyDialogMode;
  reply: KeywordReplyRule | null;
}

interface KeywordReplyPanelProps {
  botId: string;
  /** 服务端已保存的关键词总开关 */
  keywordEnabled: boolean;
  /** 服务端已保存的全部关键词规则 */
  replies: KeywordReplyRule[];
}

const ACTION_CLASS = 'cursor-pointer text-[#2F6EFF] hover:underline disabled:opacity-50';

const KeywordReplyPanel: FC<KeywordReplyPanelProps> = ({
  botId,
  keywordEnabled,
  replies: saved,
}) => {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const { mutate: updateAutoReply } = useUpdateBotAutoReply(botId);
  const { replies, search, setSearch, addReply, updateReply, removeReply, isSaving, isRemoving } =
    useKeywordReplies(botId, saved);

  return (
    <div className="space-y-5">
      <ReplySwitchCard
        title="Automatic reply"
        description="Quickly set up automatic replies by editing content or keyword rules. Once you turn off auto-responses, it will take effect immediately for all users."
        checked={keywordEnabled}
        onChange={(checked) => updateAutoReply({ keywordEnabled: checked })}
      />

      <section className="rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <label className="relative block w-full max-w-64">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8a90a0]" />
            <input
              aria-label="Search keywords"
              placeholder="Search keywords"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 w-full rounded-full border border-[#e4e7ee] pr-4 pl-9 text-sm outline-none focus:border-[#2F6EFF]"
            />
          </label>
          <Button className="rounded-lg" onClick={() => setDialog({ mode: 'add', reply: null })}>
            Add reply
          </Button>
        </div>

        <table className="mt-5 w-full text-left text-sm">
          <thead>
            <tr className="bg-[#f5f6f8] text-[#8a90a0]">
              <th className="w-1/4 px-6 py-3 font-normal">Keywords</th>
              <th className="px-3 py-3 font-normal">Reply content</th>
              <th className="w-48 px-6 py-3 text-right font-normal">Operate</th>
            </tr>
          </thead>
          <tbody>
            {replies.map((item) => (
              <tr key={item.id} className="border-b border-[#e4e7ee]">
                <td className="px-6 py-4 align-middle">{formatKeywords(item.keywords)}</td>
                <td className="px-3 py-4 align-middle">
                  <p className="max-w-sm leading-relaxed">{item.content}</p>
                </td>
                <td className="px-6 py-4 text-right align-middle">
                  <span className="inline-flex gap-4">
                    <button
                      type="button"
                      className={ACTION_CLASS}
                      onClick={() => setDialog({ mode: 'details', reply: item })}
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      className={ACTION_CLASS}
                      onClick={() => setDialog({ mode: 'edit', reply: item })}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={ACTION_CLASS}
                      disabled={isRemoving}
                      onClick={() => removeReply(item.id)}
                    >
                      Delete
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {replies.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#8a90a0]">No replies found</p>
        ) : null}
      </section>

      {dialog ? (
        <ReplyDialog
          mode={dialog.mode}
          reply={dialog.reply}
          submitting={isSaving}
          onClose={() => setDialog(null)}
          onSubmit={(draft) => {
            const close = () => setDialog(null);
            if (dialog.mode === 'edit' && dialog.reply) updateReply(dialog.reply.id, draft, close);
            else addReply(draft, close);
          }}
        />
      ) : null}
    </div>
  );
};

export default KeywordReplyPanel;
