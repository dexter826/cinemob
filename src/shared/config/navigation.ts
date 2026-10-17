export interface NavigationItem {
  to: string;
  label: string;
  match: 'exact' | 'prefix';
  /** Route prefix phụ cũng tính là mục này (vd. /person/* → Tìm phim, /movie/* → Thư viện). */
  extraPrefixes?: string[];
}

export const NAV_ITEMS: NavigationItem[] = [
  { to: '/', label: 'Thư viện', match: 'exact', extraPrefixes: ['/movie/'] },
  { to: '/search', label: 'Tìm phim', match: 'exact', extraPrefixes: ['/person/'] },
  { to: '/stats', label: 'Thống kê', match: 'exact' },
  { to: '/albums', label: 'Album', match: 'prefix' },
  { to: '/calendar', label: 'Lịch', match: 'exact' },
];

export function isNavItemActive(
  pathname: string,
  item: Pick<NavigationItem, 'to' | 'match' | 'extraPrefixes'>,
): boolean {
  if (item.match === 'exact') {
    if (pathname === item.to) return true;
  } else if (pathname === item.to || pathname.startsWith(`${item.to}/`)) {
    return true;
  }
  return (item.extraPrefixes ?? []).some((prefix) => pathname.startsWith(prefix));
}
