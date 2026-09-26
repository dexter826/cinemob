export interface NavigationItem {
  to: string;
  label: string;
  match: 'exact' | 'prefix';
}

export const NAV_ITEMS: NavigationItem[] = [
  { to: '/', label: 'Thư viện', match: 'exact' },
  { to: '/search', label: 'Tìm phim', match: 'exact' },
  { to: '/stats', label: 'Thống kê', match: 'exact' },
  { to: '/albums', label: 'Album', match: 'prefix' },
  { to: '/calendar', label: 'Lịch', match: 'exact' },
];

export function isNavItemActive(pathname: string, item: Pick<NavigationItem, 'to' | 'match'>): boolean {
  if (item.match === 'exact') return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}
