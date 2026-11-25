import { useState, type FC } from 'react';
import { X } from 'lucide-react';

import Button from '@/components/Button';
import type { KeywordReplyRule } from '@/types/bot';
import {
  KEYWORD_MAX_COUNT,
  REPLY_CONTENT_MAX_LENGTH,
} from '@/views/content/automatic-reply/constants';
import type { KeywordReplyDraft, ReplyDialogMode } from '@/views/content/automatic-reply/types';
import { formatKeywords, parseKeywords } from '@/views/content/automatic-reply/utils';

const INPUT_CLASS =
  'w-full rounded-lg border border-[#e4e7ee] px-3 text-sm outline-none focus:border-[#2F6EFF] read-only:bg-[#f5f6f8]';

const TITLES: Record<ReplyDialogMode, string> = {
  add: 'Add reply',
  edit: 'Edit reply',
  details: 'Reply details',
};

interface ReplyDialogProps {
  mode: ReplyDialogMode;
  /** add 模式为 null */
  reply: KeywordReplyRule | null;
  /** 提交中：禁用保存按钮 */
  submitting?: boolean;
  onSubmit: (draft: KeywordReplyDraft) => void;
  onClose: () => void;
}

/** 返回关键词的前端预校验错误；通过时返回 null（重复/总数上限等交给服务端） */
const validateKeywords = (keywords: string[]): string | null => {
  if (keywords.length > KEYWORD_MAX_COUNT) return `At most ${KEYWORD_MAX_COUNT} keywords`;
  if (keywords.some((word) => word.startsWith('/'))) return 'Keywords cannot start with "/"';
  return null;
};

const ReplyDialog: FC<ReplyDialogProps> = ({
  mode,
  reply,
  submitting = false,
  onSubmit,
  onClose,
}) => {
  const [keywords, setKeywords] = useState(formatKeywords(reply?.keywords ?? []));
  const [content, setContent] = useState(reply?.content ?? '');

  const readOnly = mode === 'details';
  const parsed = parseKeywords(keywords);
  const keywordError = validateKeywords(parsed);
  const canSubmit = parsed.length > 0 && !keywordError && content.trim() !== '' && !submitting;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={TITLES[mode]}
        className="w-full max-w-lg rounded-2xl bg-white p-6"
      >
        <header className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{TITLES[mode]}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-8 cursor-pointer place-items-center rounded-md text-[#8a90a0] hover:bg-[#f5f6f8]"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">Keywords</span>
            <input
              value={keywords}
              readOnly={readOnly}
              placeholder="Enter keywords, separated by commas"
              onChange={(event) => setKeywords(event.target.value)}
              className={`${INPUT_CLASS} mt-2 h-10`}
            />
            {readOnly ? null : keywordError ? (
              <span role="alert" className="mt-1 block text-xs text-red-500">
                {keywordError}
              </span>
            ) : (
              <span className="mt-1 block text-xs text-[#5c6170]">
                Up to {KEYWORD_MAX_COUNT} keywords. Matching ignores case.
              </span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Reply content</span>
            <textarea
              value={content}
              readOnly={readOnly}
              maxLength={REPLY_CONTENT_MAX_LENGTH}
              placeholder="Enter the reply content"
              onChange={(event) => setContent(event.target.value)}
              className={`${INPUT_CLASS} mt-2 min-h-32 resize-none py-2 leading-relaxed`}
            />
            {readOnly ? null : (
              <span className="mt-1 block text-xs text-[#5c6170]">
                {REPLY_CONTENT_MAX_LENGTH - content.length} characters left
              </span>
            )}
          </label>
        </div>

        <footer className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" className="rounded-lg" onClick={onClose}>
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {readOnly ? null : (
            <Button
              className="rounded-lg"
              disabled={!canSubmit}
              onClick={() => onSubmit({ keywords: parsed, content: content.trim() })}
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default ReplyDialog;
