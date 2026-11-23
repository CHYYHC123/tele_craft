import type { FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import tgIcon from '@/assets/image/login/tg.svg';
import type { TelegramProfile } from '@/types/auth';
import { getUserDisplayName } from '@/utils/user';
import { useTelegramLogin } from '@/views/login/hooks/useTelegramLogin';
import { useTelegramQrLogin, type QrLoginStatus } from '@/views/login/hooks/useTelegramQrLogin';

function getStatusText(status: QrLoginStatus, scannedBy: TelegramProfile | null): string {
  switch (status) {
    case 'loading':
      return 'Generating QR code…';
    case 'error':
      return 'Could not generate the QR code';
    case 'scanned': {
      const name = getUserDisplayName(scannedBy);
      return name ? `Scanned by ${name}. Confirm in Telegram` : 'Scanned. Confirm in Telegram';
    }
    case 'confirmed':
      return 'Logging in…';
    case 'expired':
      return 'QR code expired, refreshing…';
    default:
      return 'Open Telegram and scan the QR code';
  }
}

const LoginPanel: FC = () => {
  const { login, ready, pending } = useTelegramLogin();
  const { deepLink, status, scannedBy, refresh } = useTelegramQrLogin();

  const copyLink = async () => {
    if (!deepLink) return;
    try {
      await navigator.clipboard.writeText(deepLink);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy the link');
    }
  };

  const showQr = Boolean(deepLink);
  const needsRefresh = status === 'error';
  const dimmed = status !== 'pending' && status !== 'scanned';

  return (
    <section className="flex min-h-screen w-full min-w-0 flex-1 items-center justify-center bg-white px-6 py-16">
      <div className="w-full min-w-0 max-w-105">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900">
          Log in
        </h1>
        <p className="mt-2 text-sm text-neutral-500">Welcome to Tele Craft robot</p>
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
          <div className="relative mx-auto size-52 rounded-2xl bg-white p-4 shadow-sm">
            {showQr && deepLink ? (
              <QRCodeSVG
                value={deepLink}
                className={`size-full text-neutral-900 transition-opacity ${dimmed ? 'opacity-20' : ''}`}
                role="img"
                aria-label="Telegram login QR code"
              />
            ) : (
              <div className="size-full animate-pulse rounded-lg bg-neutral-100" />
            )}
            {needsRefresh && (
              <button
                type="button"
                onClick={refresh}
                className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl bg-white/80 text-sm text-neutral-700"
              >
                <RefreshCw className="size-5" />
                Refresh
              </button>
            )}
          </div>

          <p role="status" className="mt-4 text-center text-sm text-neutral-500">
            {getStatusText(status, scannedBy)}
          </p>

          <button
            type="button"
            onClick={copyLink}
            disabled={!deepLink}
            className="mx-auto mt-3 flex cursor-pointer items-center gap-1.5 text-sm text-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Copy link to clipboard
          </button>
        </div>
      </div>
    </section>
  );
};

export default LoginPanel;
