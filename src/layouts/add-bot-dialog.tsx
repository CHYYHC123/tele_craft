import { useEffect, useState, type FC, type FormEvent } from 'react';
import { Bot, X } from 'lucide-react';

import logo from '@/assets/image/login/logo.png';
import Button from '@/components/Button';
import { useAddBot } from '@/hooks/useBots';
import { useUiStore } from '@/store/ui';
import { isValidBotToken } from '@/utils/bot';

const BOT_FATHER_URL = 'https://t.me/BotFather';
const TOKEN_PLACEHOLDER = '123456789:ABCabcabcabcabcabcabcabc...';

interface AddBotFormProps {
  onClose: () => void;
}

/** 弹窗内容；每次打开都会重新挂载，因此输入框状态自动重置 */
const AddBotForm: FC<AddBotFormProps> = ({ onClose }) => {
  const [token, setToken] = useState('');
  const { mutate, isPending } = useAddBot();
  const canSubmit = isValidBotToken(token) && !isPending;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canSubmit) mutate({ token: token.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add a bot"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-100 overflow-hidden rounded-2xl bg-white"
      >
        <div className="h-24 bg-[#e3eefc]" aria-hidden="true" />
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 grid size-6 cursor-pointer place-items-center rounded-md text-[#5c6170] hover:bg-white/60"
        >
          <X className="size-4" />
        </button>

        <div className="-mt-12 flex flex-col items-center px-8 pb-8">
          <span className="grid size-26 place-items-center rounded-3xl bg-[#0a63ee]">
            <img src={logo} alt="" className="size-14 brightness-0 invert" />
          </span>

          <h2 className="mt-8 text-2xl font-bold text-[#191b26]">Let&apos;s add a bot</h2>
          <p className="mt-3 text-center text-sm leading-relaxed text-[#5c6170]">
            Paste the API key into the field below
            <br />
            and let&apos;s start collaborating:
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex w-full items-center gap-2">
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#e4e7ee] px-3 focus-within:border-[#2F6EFF]">
              <Bot className="size-4 shrink-0 text-[#5c6170]" aria-hidden="true" />
              <input
                autoFocus
                value={token}
                placeholder={TOKEN_PLACEHOLDER}
                aria-label="Bot API key"
                onChange={(event) => setToken(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#b4b9c5]"
              />
            </label>
            <Button type="submit" className="rounded-lg" disabled={!canSubmit}>
              {isPending ? 'Adding...' : 'Confirm'}
            </Button>
          </form>

          <a
            href={BOT_FATHER_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-5 text-sm text-[#191b26] hover:underline"
          >
            Where can I get it ?
          </a>
        </div>
      </div>
    </div>
  );
};

/** 「添加 Bot」弹窗：挂在 Layout 中，由 useUiStore 控制开关 */
const AddBotDialog: FC = () => {
  const open = useUiStore((state) => state.addBotOpen);
  const closeAddBot = useUiStore((state) => state.closeAddBot);

  return open ? <AddBotForm onClose={closeAddBot} /> : null;
};

export default AddBotDialog;
