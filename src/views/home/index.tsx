import type { FC } from 'react';

import BotCase from '@/views/home/components/BotCase';
import StatCards from '@/views/home/components/StatCards';
import TutorialBanner from '@/views/home/components/TutorialBanner';
import UserInformation from '@/views/home/components/UserInformation';
import { BOT_CASES, STAT_ITEMS } from '@/views/home/constants';

const Home: FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <StatCards items={STAT_ITEMS} />

      <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
        <TutorialBanner />
        <BotCase items={BOT_CASES} />
      </div>

      <UserInformation />
    </div>
  );
};

export default Home;
