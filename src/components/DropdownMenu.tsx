import { useEffect, type FC, type ReactNode } from 'react';

import { cn } from '@/utils';

interface DropdownMenuProps {
  open: boolean;
  onClose: () => void;
  /** 相对父级（需 relative）的定位 className */
  className?: string;
  children: ReactNode;
}

/** 点击外部或按 Esc 关闭的下拉面板 */
const DropdownMenu: FC<DropdownMenuProps> = ({ open, onClose, className, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-10" onClick={onClose} />
      <div
        role="menu"
        className={cn(
          'absolute z-20 min-w-40 rounded-xl bg-white py-1 shadow-[0_6px_24px_rgba(25,27,38,0.14)]',
          className,
        )}
      >
        {children}
      </div>
    </>
  );
};

export default DropdownMenu;
