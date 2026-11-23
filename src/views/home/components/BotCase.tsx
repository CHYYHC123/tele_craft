import type { FC } from 'react';

import type { BotCaseItem } from '@/views/home/constants';

interface BotCaseProps {
  items: BotCaseItem[];
}

const BotCase: FC<BotCaseProps> = ({ items }) => {
  return (
    <section className="rounded-2xl bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Bot case</h2>
        <div className="flex items-center gap-1" aria-hidden="true">
          <span className="h-1 w-3 rounded-full bg-[#2F6EFF]" />
          <span className="h-1 w-2 rounded-full bg-[#e4e7ee]" />
          <span className="h-1 w-2 rounded-full bg-[#e4e7ee]" />
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-3 rounded-xl bg-[#eef5ff] px-3 py-2.5"
          >
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            >
              {item.initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#2F6EFF]">{item.name}</p>
              <p className="truncate text-xs text-[#5c6170]">{item.category}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default BotCase;
