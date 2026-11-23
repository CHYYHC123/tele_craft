import { useState, type FC } from 'react';
import { ChevronDown } from 'lucide-react';
import { NavLink, useLocation } from 'react-router';

import { isNavGroup, NAV_ITEMS } from '@/layouts/nav';
import { cn } from '@/utils';

const linkClass = (isActive: boolean) =>
  cn(
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm',
    isActive ? 'bg-white font-medium text-[#191b26] shadow-sm' : 'text-[#5c6170] hover:bg-white/70',
  );

const AppSidebar: FC = () => {
  const { pathname } = useLocation();
  const inContent = pathname.startsWith('/content');
  const [contentOpen, setContentOpen] = useState(true);
  const [seenContent, setSeenContent] = useState(inContent);

  if (inContent && !seenContent) {
    setSeenContent(true);
    setContentOpen(true);
  } else if (!inContent && seenContent) {
    setSeenContent(false);
  }

  return (
    <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-60 shrink-0 flex-col overflow-y-auto border-r border-[#e4e7ee] px-3 py-2">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          if (isNavGroup(item)) {
            return (
              <div key={item.label}>
                <button
                  type="button"
                  aria-expanded={contentOpen}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#5c6170] hover:bg-white/70"
                  onClick={() => setContentOpen((open) => !open)}
                >
                  <item.icon className="size-5" strokeWidth={1.8} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn('size-4 transition-transform', contentOpen ? '' : '-rotate-90')}
                    strokeWidth={1.8}
                  />
                </button>
                {contentOpen ? (
                  <div className="mt-1 flex flex-col gap-1 pl-9">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) => linkClass(isActive)}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => linkClass(isActive)}
            >
              <item.icon className="size-5" strokeWidth={1.8} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AppSidebar;
