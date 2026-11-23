import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

import { cn } from '@/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const BUTTON_BASE_CLASS =
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60';

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-[#2F6EFF] text-white hover:bg-[#2663f0]',
  secondary: 'border border-[#e4e7ee] bg-white text-[#191b26] hover:bg-[#f5f6f8]',
  ghost: 'text-[#5c6170] hover:bg-white/70',
};

const BUTTON_SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  icon: 'size-9 p-0',
};

const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  type = 'button',
  ...rest
}) => {
  return (
    <button
      type={type}
      className={cn(
        BUTTON_BASE_CLASS,
        BUTTON_VARIANT_CLASS[variant],
        BUTTON_SIZE_CLASS[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
};

export default Button;
