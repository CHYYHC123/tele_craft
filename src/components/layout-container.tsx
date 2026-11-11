import type { FC, ReactNode } from 'react';

interface LayoutContainerProps {
  children?: ReactNode;
}

const LayoutContainer: FC<LayoutContainerProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#fbf8ff] text-[#191b26] antialiased">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-linear-to-b from-[#E8F7FD] via-[#ECEBFF]/50 to-[#fbf8ff]" />
        <div className="absolute -top-24 -left-20 size-96 rounded-full bg-[#b6ebff]/50 blur-3xl" />
        <div className="absolute top-10 -right-16 size-[30rem] rounded-full bg-[#FFD6E8]/55 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16">{children}</div>
    </div>
  );
};

export default LayoutContainer;
