import type { FC } from 'react';
import { toast } from 'sonner';

import tgIcon from '@/assets/image/login/tg.svg';

const LOGIN_LINK = 'https://t.me/alchemy_pay_bot';
const QR_MODULES = 25;

function finderOn(x: number, y: number, originX: number, originY: number): boolean | null {
  const localX = x - originX;
  const localY = y - originY;
  if (localX < 0 || localY < 0 || localX > 6 || localY > 6) return null;
  const edge = localX === 0 || localY === 0 || localX === 6 || localY === 6;
  const core = localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4;
  return edge || core;
}

function moduleOn(x: number, y: number): boolean {
  const finders = [
    finderOn(x, y, 0, 0),
    finderOn(x, y, QR_MODULES - 7, 0),
    finderOn(x, y, 0, QR_MODULES - 7),
  ];
  for (const finder of finders) {
    if (finder !== null) return finder;
  }
  if (x === 6 || y === 6) return (x + y) % 2 === 0;
  return (x * 13 + y * 17 + ((x * y) % 11)) % 3 !== 0;
}

const QR_PATH = Array.from({ length: QR_MODULES }, (_, y) =>
  Array.from({ length: QR_MODULES }, (_, x) => (moduleOn(x, y) ? `M${x} ${y}h1v1H${x}z` : '')).join(
    '',
  ),
).join('');

const LoginPanel: FC = () => {
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(LOGIN_LINK);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy the link');
    }
  };

  return (
    <section className="flex min-h-screen w-full min-w-0 flex-1 items-center justify-center bg-white px-6 py-16">
      <div className="w-full min-w-0 max-w-105">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900">
          Log in
        </h1>
        <p className="mt-2 text-sm text-neutral-500">Welcome to Alchemy Pay robot</p>

        <a
          href={LOGIN_LINK}
          className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2F6EFF] text-[15px] font-medium text-white"
        >
          <img src={tgIcon} alt="" className="size-5" />
          Log in via telegram
        </a>

        <h2 className="mt-8 text-sm font-semibold text-neutral-900">Can’t open Telegram?</h2>
        <p className="mt-1 text-sm leading-relaxed text-neutral-500">
          Scan the QR code from a device with the Telegram client installed.
        </p>

        <div className="mt-4 rounded-2xl bg-[#F4F5F7] px-6 py-8">
          <div className="mx-auto w-fit rounded-2xl bg-white p-4 shadow-sm">
            <svg
              viewBox={`0 0 ${QR_MODULES} ${QR_MODULES}`}
              className="size-44 text-neutral-900"
              role="img"
              aria-label="Telegram login QR code"
            >
              <path d={QR_PATH} fill="currentColor" />
            </svg>
          </div>

          <button
            type="button"
            onClick={copyLink}
            className="mx-auto mt-6 flex items-center gap-1.5 text-sm text-neutral-500"
          >
            Copy link to clipboard
          </button>
        </div>
      </div>
    </section>
  );
};

export default LoginPanel;
