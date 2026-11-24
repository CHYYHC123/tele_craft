import { useEffect, useState, type FC, type FormEvent } from 'react';

import BotAvatar from '@/components/BotAvatar';
import Button from '@/components/Button';
import FormRow from '@/components/FormRow';
import { useUpdateBot } from '@/hooks/useBots';
import { useUiStore } from '@/store/ui';
import type { Bot, UpdateBotParams } from '@/types/bot';

const MAX_NAME_LENGTH = 64;
const MAX_ABOUT_LENGTH = 120;

const INPUT_CLASS =
  'w-full rounded-lg border border-[#e4e7ee] px-3 text-sm outline-none focus:border-[#2F6EFF]';

interface EditBotFormProps {
  bot: Bot;
  onClose: () => void;
}

/** 弹窗内容；每次打开都会重新挂载，输入框自动回到当前名称与简介 */
const EditBotForm: FC<EditBotFormProps> = ({ bot, onClose }) => {
  const initialAbout = bot.shortDescription ?? '';
  const [name, setName] = useState(bot.displayName);
  const [about, setAbout] = useState(initialAbout);
  const { mutate, isPending } = useUpdateBot();

  const trimmedName = name.trim();
  const nameChanged = trimmedName !== bot.displayName;
  const aboutChanged = about !== initialAbout;
  const valid = trimmedName.length > 0 && trimmedName.length <= MAX_NAME_LENGTH;
  const canSubmit = valid && (nameChanged || aboutChanged) && !isPending;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    // 只提交发生变化的字段：避免无谓触发 Telegram 的改名频率限制
    const data: UpdateBotParams = {};
    if (nameChanged) data.displayName = trimmedName;
    if (aboutChanged) data.shortDescription = about;
    mutate({ id: bot.id, ...data });
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-bot-title"
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-180 rounded-2xl bg-white p-6"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#e4e7ee] pb-5">
          <h2 id="edit-bot-title" className="text-base font-semibold text-[#191b26]">
            Modify bot information
          </h2>
          <div className="flex gap-3">
            <Button variant="secondary" className="rounded-lg" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg" disabled={!canSubmit}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <FormRow label="Bot">
          <div className="flex items-center gap-3">
            <BotAvatar badge className="size-10" />
            <div>
              <p className="text-sm font-medium">{bot.displayName}</p>
              <p className="text-xs text-[#8a90a0]">@{bot.username}</p>
            </div>
          </div>
        </FormRow>

        <FormRow label={<label htmlFor="edit-bot-name">Name</label>}>
          <input
            id="edit-bot-name"
            autoFocus
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(event) => setName(event.target.value)}
            className={`${INPUT_CLASS} h-10`}
          />
        </FormRow>

        <FormRow label={<label htmlFor="edit-bot-about">About</label>}>
          <textarea
            id="edit-bot-about"
            value={about}
            maxLength={MAX_ABOUT_LENGTH}
            rows={4}
            onChange={(event) => setAbout(event.target.value)}
            className={`${INPUT_CLASS} resize-none py-2.5`}
          />
          <p className="mt-2 text-xs text-[#5c6170]">
            {MAX_ABOUT_LENGTH - about.length} characters left
          </p>
        </FormRow>
      </form>
    </div>
  );
};

interface EditBotDialogProps {
  bot: Bot;
}

/** 「修改 Bot 信息」弹窗：由 useUiStore 控制开关 */
const EditBotDialog: FC<EditBotDialogProps> = ({ bot }) => {
  const open = useUiStore((state) => state.editBotOpen);
  const closeEditBot = useUiStore((state) => state.closeEditBot);

  return open ? <EditBotForm bot={bot} onClose={closeEditBot} /> : null;
};

export default EditBotDialog;
