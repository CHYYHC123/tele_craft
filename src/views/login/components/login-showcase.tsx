import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import logo from '@/assets/image/login/logo.png';

const STARS = [0, 1, 2, 3, 4];

const LoginShowcase: FC = () => {
  return (
    <aside className="relative hidden min-h-screen w-1/2 overflow-hidden bg-[#4EC4FF] lg:block">
      <img src={logo} alt="AEON" className="absolute top-8 left-10 size-12" />

      <div className="relative z-10 mt-28 mr-28 ml-10 max-w-xl rounded-[28px] border border-white/35 bg-white/20 p-7 text-white backdrop-blur-md">
        <p className="font-display text-xl leading-snug font-medium">
          “ We’ve been using Alchemy Pay to create bots and can’t imagine working without it. It’s
          incredible. 👍 ”
        </p>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1a1a1a]">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                <rect x="3" y="6" width="18" height="12" rx="2" fill="#F5C542" />
                <rect x="3" y="9" width="18" height="3" fill="#1a1a1a" fillOpacity="0.35" />
              </svg>
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Bit. Store Card</p>
              <p className="text-xs text-white/80">@bit.store card_bot</p>
            </div>
          </div>

          <div className="flex gap-0.5" aria-label="5 stars">
            {STARS.map((star) => (
              <svg key={star} viewBox="0 0 16 16" className="size-4 fill-white" aria-hidden="true">
                <path d="M8 1.2 9.9 5l4.1.6-3 2.9.7 4.1L8 10.6 4.3 12.6l.7-4.1-3-2.9L6.1 5 8 1.2Z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-[44%] right-8 z-10 flex gap-3" aria-hidden="true">
        <span className="grid size-11 place-items-center rounded-full border border-white/55 bg-white/10 text-white">
          <ChevronLeft className="size-5" strokeWidth={1.8} />
        </span>
        <span className="grid size-11 place-items-center rounded-full border border-white/55 bg-white/10 text-white">
          <ChevronRight className="size-5" strokeWidth={1.8} />
        </span>
      </div>
    </aside>
  );
};

export default LoginShowcase;
