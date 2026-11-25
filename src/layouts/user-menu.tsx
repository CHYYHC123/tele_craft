import { useState, type FC } from 'react';
import { LogOut } from 'lucide-react';

import DropdownMenu from '@/components/DropdownMenu';
import { useLogout } from '@/hooks/useLogout';
import { useUserStore } from '@/store/user';
import { getUserDisplayName } from '@/utils/user';

/** 头部用户头像菜单：点击头像展开，包含退出登录 */
const UserMenu: FC = () => {
  const [open, setOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  const { mutate: logout, isPending } = useLogout();
  const displayName = getUserDisplayName(user);
  const initial = displayName[0]?.toUpperCase() ?? '';

  const close = () => setOpen(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="User menu"
        aria-haspopup="menu"
        aria-expanded={open}
        title={displayName}
        onClick={() => setOpen((value) => !value)}
        className="grid size-9 cursor-pointer place-items-center rounded-full bg-[#e4e7ee] text-sm font-medium text-[#5c6170] transition-shadow hover:shadow-[0_0_0_3px_rgba(92,97,112,0.12)] aria-expanded:shadow-[0_0_0_3px_rgba(92,97,112,0.12)]"
      >
        {initial}
      </button>

      <DropdownMenu
        open={open}
        onClose={close}
        className="top-full right-0 mt-2 min-w-52 overflow-hidden rounded-2xl py-0!"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e4e7ee] text-sm font-medium text-[#5c6170]"
          >
            {initial}
          </span>
          <span className="max-w-40 truncate text-base font-medium text-[#191b26]">
            {displayName}
          </span>
        </div>
        <div className="border-t border-[#e4e7ee]" />
        <button
          type="button"
          role="menuitem"
          disabled={isPending}
          onClick={() => {
            close();
            logout();
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-b-2xl px-4 py-3 text-left text-sm font-medium text-[#191b26] transition-colors hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="size-5" strokeWidth={1.6} aria-hidden="true" />
          Log Out
        </button>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
