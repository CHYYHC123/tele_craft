import type { FC } from 'react';
// import { toast } from 'sonner';

import tgIcon from '@/assets/image/login/tg.svg';
import { useTelegramLogin } from '@/views/login/hooks/useTelegramLogin';

const LoginPanel: FC = () => {
  const { login, ready, pending } = useTelegramLogin();

  // const copyLink = async () => {
  //   try {
  //     await navigator.clipboard.writeText(LOGIN_LINK);
  //     toast.success('Link copied');
  //   } catch {
  //     toast.error('Could not copy the link');
  //   }
  // };

  return (
    <section className="flex min-h-screen w-full min-w-0 flex-1 items-center justify-center bg-white px-6 py-16">
      <div className="w-full min-w-0 max-w-105">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900">
          Log in
        </h1>
        <p className="mt-2 text-sm text-neutral-500">Welcome to Alchemy Pay robot</p>
        <button
          type="button"
          onClick={login}
          disabled={!ready || pending}
          className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2F6EFF] text-[15px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <img src={tgIcon} alt="" className="size-5" />
          Log in via telegram
        </button>

        <h2 className="mt-8 text-sm font-semibold text-neutral-900">Can’t open Telegram?</h2>
        <p className="mt-1 text-sm leading-relaxed text-neutral-500">
          Scan the QR code from a device with the Telegram client installed.
        </p>

        <div className="mt-4 rounded-2xl bg-[#F4F5F7] px-6 py-8">
          <div className="mx-auto w-fit rounded-2xl bg-white p-4 shadow-sm">
            {/* <svg
              viewBox={`0 0 ${QR_MODULES} ${QR_MODULES}`}
              className="size-44 text-neutral-900"
              role="img"
              aria-label="Telegram login QR code"
            >
              <path d={QR_PATH} fill="currentColor" />
            </svg> */}
          </div>

          {/* <button
            type="button"
            onClick={copyLink}
            className="mx-auto mt-6 flex items-center gap-1.5 text-sm text-neutral-500 cursor-pointer"
          >
            Copy link to clipboard
          </button> */}
        </div>
      </div>
    </section>
  );
};

export default LoginPanel;
