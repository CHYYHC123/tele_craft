import type { FC } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { cn } from '@/utils';
import { formatChange } from '@/utils/format';
import type { StatItem } from '@/views/home/constants';

const AVATAR_PLACEHOLDERS = [0, 1, 2, 3, 4];

interface StatCardsProps {
  items: StatItem[];
}

const StatCards: FC<StatCardsProps> = ({ items }) => {
  return (
    <section aria-label="Statistics" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.key} className="rounded-2xl bg-white p-5">
          <span className="text-3xl leading-none" aria-hidden="true">
            {item.emoji}
          </span>
          <p className="mt-4 text-sm text-[#5c6170]">{item.label}</p>

          <div className="mt-3 flex items-end justify-between gap-2">
            <p className="text-2xl leading-none font-semibold">{item.value ?? '--'}</p>

            {item.compare ? (
              <div className="text-right text-xs leading-5 text-[#5c6170]">
                <p
                  className={cn(
                    'flex items-center justify-end gap-1',
                    item.change == null
                      ? 'text-[#5c6170]'
                      : item.change < 0
                        ? 'text-[#ef5b5b]'
                        : 'text-[#3bb59a]',
                  )}
                >
                  {item.change == null || item.change === 0 ? null : item.change < 0 ? (
                    <TrendingDown className="size-3.5" aria-hidden="true" />
                  ) : (
                    <TrendingUp className="size-3.5" aria-hidden="true" />
                  )}
                  {formatChange(item.change)}
                </p>
                <p>{item.compare}</p>
              </div>
            ) : null}

            {item.showAvatars ? (
              <div className="flex -space-x-2" aria-hidden="true">
                {AVATAR_PLACEHOLDERS.map((index) => (
                  <span
                    key={index}
                    className="size-6 rounded-full bg-[#eceef2] ring-2 ring-white"
                  />
                ))}
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
};

export default StatCards;
