import type { FC } from 'react';

import duckBg from '@/assets/image/home/duck_bg.png';
import Button from '@/components/Button';

interface TutorialBannerProps {
  onStart?: () => void;
}

const TutorialBanner: FC<TutorialBannerProps> = ({ onStart }) => {
  return (
    <section className="relative flex min-h-40 items-center overflow-hidden rounded-2xl bg-[#4e96ff] p-6 text-white">
      <img src={duckBg} alt="" className="absolute inset-0 size-full object-cover object-right" />

      <div className="relative z-10 max-w-[60%]">
        <span className="inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-xs">/start</span>
        <h2 className="mt-2 text-xl leading-snug font-semibold">
          How to start your robot configuration
        </h2>
        <Button
          size="sm"
          className="mt-4 rounded-full bg-[#5fd3ff] px-5 text-white hover:bg-[#4cc6f5]"
          onClick={onStart}
        >
          Start tutorial
        </Button>
      </div>
    </section>
  );
};

export default TutorialBanner;
