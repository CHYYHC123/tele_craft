import { FileText, House, MessageCircle, type LucideIcon } from 'lucide-react';

export interface NavChild {
  label: string;
  to: string;
}

export interface NavLinkItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export interface NavGroupItem {
  label: string;
  icon: LucideIcon;
  children: NavChild[];
}

export type NavItem = NavLinkItem | NavGroupItem;

export const isNavGroup = (item: NavItem): item is NavGroupItem => 'children' in item;

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/', icon: House },
  {
    label: 'Content',
    icon: FileText,
    children: [
      { label: 'Welcome message', to: '/content/welcome-message' },
      { label: 'Graphic message', to: '/content/graphic-message' },
      { label: 'Automatic reply', to: '/content/automatic-reply' },
      { label: 'Add menu', to: '/content/add-menu' },
    ],
  },
  { label: 'User chat', to: '/user-chat', icon: MessageCircle },
];
