import type { FC } from 'react';
import { CircleHelp, Plus } from 'lucide-react';

import logo from '@/assets/image/login/logo.png';
import Button from '@/components/Button';
import { useUserStore } from '@/store/user';

const AppHeader: FC = () => {
  const user = useUserStore((state) => state.user);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e4e7ee] bg-[#f5f6f8] px-6">
      <div className="flex items-center gap-26">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="AEON" className="size-8" />
          <span className="text-[15px] font-semibold tracking-tight text-[#191b26]">
            TELE CRAFT
          </span>
        </div>

        <Button className="rounded-xl" icon={<Plus className="size-4" strokeWidth={2.4} />}>
          Add a bot
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Help"
          className="grid size-9 place-items-center rounded-full text-[#5c6170]"
        >
          <CircleHelp className="size-5" strokeWidth={1.8} />
        </button>
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="size-9 rounded-full object-cover" />
        ) : (
          <span
            aria-hidden={!user?.name}
            className="grid size-9 place-items-center rounded-full bg-[#e4e7ee] text-sm font-medium text-[#5c6170]"
          >
            {user?.name?.[0] ?? ''}
          </span>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
