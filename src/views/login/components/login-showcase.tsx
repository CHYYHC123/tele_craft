import type { FC } from 'react';
import { ChevronRight, Star } from 'lucide-react';

import login_bg from '@/assets/image/login/login_bg.png';
import logo from '@/assets/image/login/logo.png';
import { cn } from '@/utils';

const STARS = [0, 1, 2, 3, 4];

interface ChevronIconProps {
  className?: string;
}

const ChevronIcon: FC<ChevronIconProps> = ({ className }) => {
  return (
    <span
      className={cn(
        'grid size-11 place-items-center rounded-full border border-white/55 bg-white/10 text-white',
        'cursor-pointer',
        className,
      )}
    >
      <ChevronRight className="size-5" strokeWidth={1.8} />
    </span>
  );
};

const LoginShowcase: FC = () => {
  return (
    <aside className="relative hidden min-h-screen w-1/2 overflow-hidden bg-[#4EC4FF] lg:block">
      <img src={login_bg} alt="" className="absolute inset-0 size-full object-cover" />
      <img src={logo} alt="AEON" className="absolute top-8 left-10 z-10 size-12" />

      <div className="relative z-10 mt-28 mr-28 ml-10 max-w-xl rounded-[28px] border border-white/35 bg-white/20 p-7 text-white backdrop-blur-md">
        <p className="font-display text-xl leading-snug font-medium">
          “ We’ve been using Alchemy Pay to create bots and can’t imagine working without it. It’s
          incredible. 👍 ”
        </p>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1a1a1a]">
              🐶
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">CryptoDoge</p>
              <p className="text-xs text-white/80">@deep_cat_bot</p>
            </div>
          </div>

          <div className="flex gap-0.5" aria-label="5 stars">
            {STARS.map((star) => (
              <Star key={star} className="size-4 fill-white stroke-none" aria-hidden="true" />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-[44%] right-8 z-10 flex gap-3" aria-hidden="true">
        <ChevronIcon className="rotate-180" />
        <ChevronIcon />
      </div>
    </aside>
  );
};

export default LoginShowcase;
