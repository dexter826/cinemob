# User Profile (/profile) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm trang Hồ sơ `/profile` với 2 cards (thông tin + hành động), sửa displayName đồng bộ public share, tái dùng ChangeAvatarModal/ExportModal.

**Architecture:** Không thêm collection Firestore. Service thuần `profileService` giống `avatarService`, page lazy-loaded, Navbar thêm entry Hồ sơ.

**Tech Stack:** React 19 + TypeScript, react-router-dom v7, Firebase Auth + Firestore, Zustand, Vitest, Tailwind v4 tokens.

## Global Constraints

- Two-space indentation, single quotes, semicolons, functional components (no `React.FC`).
- Keep rendering in components, remote calls in services, shared interfaces in `src/types`.
- Colocated tests `src/**/*.test.ts` with `@/` alias, run via `npm test` (`vitest run`).
- `npx tsc --noEmit` must pass, `npm run lint` 0 errors, `npm run build` must pass.
- Never commit `.env`, no privileged secrets in `VITE_` vars.
- No changes to `firestore.rules`, no new Firestore collections.

---

## File Map

- Create: `src/features/profile/services/profileService.ts` — validate + update displayName + sync share.
- Create: `src/features/profile/services/profileService.test.ts` — unit cho validate + update + sync.
- Create: `src/features/profile/pages/ProfilePage.tsx` — 2 cards UI, edit inline, actions.
- Modify: `src/App.tsx:6-14,29-42` — lazy import + route `/profile`.
- Modify: `src/shared/components/layout/Navbar.tsx:1-10,131-179,197-200` — thêm mục Hồ sơ + giữ ChangeAvatarModal.

---

### Task 1: profileService + unit test (TDD)

**Files:**
- Create: `src/features/profile/services/profileService.ts`
- Test: `src/features/profile/services/profileService.test.ts`

**Interfaces:**
- Consumes: `updateProfile(user, { displayName })` from `firebase/auth`, `doc/getDoc/updateDoc` from `firebase/firestore`, `db` from `@/lib/firebase`.
- Produces: `DISPLAY_NAME_MIN=2`, `DISPLAY_NAME_MAX=50`, `FALLBACK_DISPLAY_NAME='CineMOB User'`, `validateDisplayName(raw: string): { ok: true; value: string } | { ok: false; error: string }`, `updateDisplayName(user: User, rawName: string): Promise<string>`.

- [ ] **Step 1: Write the failing test**

Create `src/features/profile/services/profileService.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { getDoc, updateDoc } from 'firebase/firestore';
import { validateDisplayName, updateDisplayName } from './profileService';

vi.mock('firebase/auth', () => ({
  updateProfile: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('validateDisplayName', () => {
  it('từ chối chuỗi rỗng sau trim', () => {
    expect(validateDisplayName('   ').ok).toBe(false);
  });

  it('từ chối tên 1 ký tự', () => {
    expect(validateDisplayName('A').ok).toBe(false);
  });

  it('chấp nhận tên 2 ký tự và trim khoảng trắng', () => {
    const r = validateDisplayName('  An  ');
    expect(r).toEqual({ ok: true, value: 'An' });
  });

  it('từ chối tên 51 ký tự', () => {
    expect(validateDisplayName('a'.repeat(51)).ok).toBe(false);
  });

  it('chấp nhận tên 50 ký tự', () => {
    const r = validateDisplayName('a'.repeat(50));
    expect(r.ok).toBe(true);
  });
});

describe('updateDisplayName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('trim tên, gọi updateProfile và sync share khi doc tồn tại', async () => {
    const mockUser = { uid: 'u123' } as User;
    vi.mocked(getDoc).mockResolvedValueOnce({ exists: () => true } as never);
    const result = await updateDisplayName(mockUser, '  An Vo  ');
    expect(result).toBe('An Vo');
    expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'An Vo' });
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { displayName: 'An Vo' });
  });

  it('bỏ qua sync share khi doc không tồn tại', async () => {
    const mockUser = { uid: 'u123' } as User;
    vi.mocked(getDoc).mockResolvedValueOnce({ exists: () => false } as never);
    await updateDisplayName(mockUser, 'Binh');
    expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Binh' });
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('throw lỗi validate khi tên không hợp lệ và không gọi updateProfile', async () => {
    const mockUser = { uid: 'u123' } as User;
    await expect(updateDisplayName(mockUser, 'x')).rejects.toThrow();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('không throw khi sync share fail, vẫn trả về tên mới', async () => {
    const mockUser = { uid: 'u123' } as User;
    vi.mocked(getDoc).mockRejectedValueOnce(new Error('net'));
    const result = await updateDisplayName(mockUser, 'Chi');
    expect(result).toBe('Chi');
    expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Chi' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/features/profile/services/profileService.test.ts`

Expected: FAIL with `Failed to resolve import "./profileService"` (file chưa tồn tại).

- [ ] **Step 3: Write minimal implementation**

Create `src/features/profile/services/profileService.ts`:

```ts
import { updateProfile, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 50;
export const FALLBACK_DISPLAY_NAME = 'CineMOB User';

export type ValidateResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function validateDisplayName(raw: string): ValidateResult {
  const value = raw.trim();
  if (value.length < DISPLAY_NAME_MIN) {
    return { ok: false, error: 'Tên hiển thị tối thiểu 2 ký tự' };
  }
  if (value.length > DISPLAY_NAME_MAX) {
    return { ok: false, error: 'Tên hiển thị tối đa 50 ký tự' };
  }
  return { ok: true, value };
}

// Cập nhật displayName Auth + đồng bộ public_shares nếu doc đã có.
export const updateDisplayName = async (user: User, rawName: string): Promise<string> => {
  const checked = validateDisplayName(rawName);
  if (!checked.ok) {
    throw new Error(checked.error);
  }
  const displayName = checked.value;
  await updateProfile(user, { displayName });
  try {
    const shareRef = doc(db, 'public_shares', user.uid);
    const shareSnap = await getDoc(shareRef);
    if (shareSnap.exists()) {
      await updateDoc(shareRef, { displayName });
    }
  } catch (error) {
    console.error('Không thể cập nhật tên trong public share:', error);
  }
  return displayName;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/features/profile/services/profileService.test.ts`

Expected: PASS, 9 tests passed.

- [ ] **Step 5: Run typecheck + lint for new files**

Run: `npx tsc --noEmit`

Expected: PASS, no output.

Run: `npm run lint`

Expected: 0 errors (warnings allowed ≤200).

- [ ] **Step 6: Commit**

```bash
git add src/features/profile/services/profileService.ts src/features/profile/services/profileService.test.ts
git commit -m "feat: them profileService validate va update displayName"
```

---

### Task 2: ProfilePage + route /profile + Navbar entry

**Files:**
- Create: `src/features/profile/pages/ProfilePage.tsx`
- Modify: `src/App.tsx:6-14,29-42`
- Modify: `src/shared/components/layout/Navbar.tsx:1-10,131-179,197-200`

**Interfaces:**
- Consumes: `useAuth()` `{ user, logout, refreshUser }`, `validateDisplayName/updateDisplayName/FALLBACK_DISPLAY_NAME` from Task 1, `ChangeAvatarModal` from `@/features/auth/components/ChangeAvatarModal`, `ExportModal` from `@/features/movies/components/ExportModal`, `useMovieStore` movies, `useToastStore` showToast, `useAlertStore` showAlert, `PageHeader`, `Button`, `IconButton`.
- Produces: default export `ProfilePage`, route `/profile` (login-guarded via `MainApp`).

- [ ] **Step 1: Create ProfilePage**

Create `src/features/profile/pages/ProfilePage.tsx` with exact content:

```tsx
import { Suspense, lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Check, X, Camera, Download, LogOut, BarChart2, Folder, User } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import PageHeader from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';
import useToastStore from '@/shared/stores/toastStore';
import useAlertStore from '@/shared/stores/alertStore';
import useMovieStore from '@/features/movies/stores/movieStore';
import { updateDisplayName, validateDisplayName, FALLBACK_DISPLAY_NAME } from '../services/profileService';

const ChangeAvatarModal = lazy(() => import('@/features/auth/components/ChangeAvatarModal').then((m) => ({ default: m.ChangeAvatarModal })));
const ExportModal = lazy(() => import('@/features/movies/components/ExportModal'));

function formatJoinDate(iso: string | undefined): string {
  if (!iso) return 'Không rõ';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Không rõ';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const { showToast } = useToastStore();
  const { showAlert } = useAlertStore();
  const { movies } = useMovieStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  if (!user) return null;
  const displayName = user.displayName || FALLBACK_DISPLAY_NAME;
  const joinDate = formatJoinDate(user.metadata?.creationTime);

  const startEdit = () => {
    setDraft(displayName);
    setFieldError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFieldError(null);
  };

  const saveEdit = async () => {
    const checked = validateDisplayName(draft);
    if (!checked.ok) {
      setFieldError(checked.error);
      return;
    }
    if (checked.value === displayName) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    setFieldError(null);
    try {
      await updateDisplayName(user, checked.value);
      await refreshUser();
      showToast('Đã cập nhật tên hiển thị', 'success');
      setIsEditing(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể cập nhật tên';
      setFieldError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5">
      <PageHeader
        title="Hồ sơ"
        description="Quản lý thông tin và tài khoản CineMOB."
        onBack={() => navigate('/')}
      />
      <section aria-labelledby="profile-info-title" className="bg-surface border border-border rounded-3xl p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-20 h-20 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-text-secondary mb-1">Tên hiển thị</p>
            {!isEditing ? (
              <div className="flex items-center gap-2 min-w-0">
                <h2 id="profile-info-title" className="text-lg font-bold text-text-primary truncate">{displayName}</h2>
                <IconButton label="Sửa tên hiển thị" onClick={startEdit} size="sm">
                  <Pencil size={15} aria-hidden="true" />
                </IconButton>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    maxLength={50}
                    disabled={isSaving}
                    aria-label="Tên hiển thị mới"
                    className="flex-1 min-w-0 px-3 h-10 rounded-xl border border-border bg-surface-elevated text-sm text-text-primary outline-none focus:border-primary"
                  />
                  <IconButton label="Lưu tên" onClick={saveEdit} disabled={isSaving} size="sm">
                    <Check size={15} aria-hidden="true" />
                  </IconButton>
                  <IconButton label="Hủy sửa tên" onClick={cancelEdit} disabled={isSaving} size="sm">
                    <X size={15} aria-hidden="true" />
                  </IconButton>
                </div>
                {fieldError && <p role="alert" className="mt-2 text-xs text-danger">{fieldError}</p>}
              </div>
            )}
            <p className="mt-2 text-sm text-text-secondary truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary bg-black/5 dark:bg-white/5 border border-border rounded-full px-2.5 py-1">
                <User size={12} aria-hidden="true" /> Google
              </span>
              <span className="text-xs text-text-secondary">Tham gia {joinDate}</span>
            </div>
          </div>
        </div>
      </section>
      <section aria-labelledby="profile-actions-title" className="bg-surface border border-border rounded-3xl p-5 sm:p-6">
        <h2 id="profile-actions-title" className="text-base font-bold text-text-primary mb-4">Hành động</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setIsAvatarOpen(true)} leadingIcon={<Camera size={16} aria-hidden="true" />}>
            Đổi ảnh đại diện
          </Button>
          <Button variant="secondary" onClick={() => setIsExportOpen(true)} leadingIcon={<Download size={16} aria-hidden="true" />}>
            Xuất dữ liệu
          </Button>
          <Button variant="secondary" onClick={() => navigate('/stats')} leadingIcon={<BarChart2 size={16} aria-hidden="true" />}>
            Xem thống kê
          </Button>
          <Button variant="secondary" onClick={() => navigate('/albums')} leadingIcon={<Folder size={16} aria-hidden="true" />}>
            Xem albums
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => {
              showAlert({
                title: 'Xác nhận đăng xuất',
                message: 'Bạn có chắc chắn muốn đăng xuất?',
                type: 'danger',
                confirmText: 'Đăng xuất',
                cancelText: 'Hủy',
                onConfirm: logout,
              });
            }}
            leadingIcon={<LogOut size={16} aria-hidden="true" />}
            className="text-danger hover:bg-danger/10"
          >
            Đăng xuất
          </Button>
        </div>
      </section>
      <Suspense fallback={null}>
        <ChangeAvatarModal isOpen={isAvatarOpen} onClose={() => setIsAvatarOpen(false)} />
      </Suspense>
      <Suspense fallback={null}>
        {isExportOpen && <ExportModal isOpen onClose={() => setIsExportOpen(false)} movies={movies} />}
      </Suspense>
    </main>
  );
}

export default ProfilePage;
```

- [ ] **Step 2: Add route /profile in App.tsx**

In `src/App.tsx`, add lazy import after `SharePage` line:

```ts
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
```

In `AnimatedRoutes`, add before catch-all:

```tsx
<Route path="/profile" element={<ProfilePage />} />
```

Full routes block becomes:

```tsx
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/search" element={<SearchPage />} />
  <Route path="/stats" element={<StatsPage />} />
  <Route path="/albums" element={<AlbumsPage />} />
  <Route path="/albums/:albumId" element={<AlbumDetailPage />} />
  <Route path="/person/:personId" element={<PersonDetailPage />} />
  <Route path="/calendar" element={<ReleaseCalendarPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
```

- [ ] **Step 3: Add Hồ sơ entry in Navbar**

In `src/shared/components/layout/Navbar.tsx`, extend lucide import with `User`:

```ts
import { LogOut, Sun, Moon, BarChart2, Dice5, Folder, Download, ChevronDown, Search, CalendarDays, Camera, Home, User } from 'lucide-react';
```

Insert as first item inside `<div className="p-1.5 space-y-0.5">` before Đổi ảnh đại diện button:

```tsx
<button
  type="button"
  role="menuitem"
  onClick={() => { navigate('/profile'); closeDropdown(); }}
  className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors duration-200 cursor-pointer rounded-xl"
>
  <User size={18} strokeWidth={1.5} />
  <span>Hồ sơ</span>
</button>
```

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`

Expected: PASS, no output.

- [ ] **Step 5: Run lint + unit tests**

Run: `npm run lint`

Expected: 0 errors.

Run: `npm test -- src/features/profile/services/profileService.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/profile/pages/ProfilePage.tsx src/App.tsx src/shared/components/layout/Navbar.tsx
git commit -m "feat: them trang ho so /profile va entry Navbar"
```

---

### Task 3: Verification (build + manual)

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

Run: `npm test`

Expected: all suites PASS (including existing `avatarService.test.ts`, `shareService.test.ts`).

- [ ] **Step 2: Production build**

Run: `npm run build`

Expected: `tsc --noEmit` PASS + `vite build` outputs `dist/` without errors.

- [ ] **Step 3: Manual checklist (browser, http://localhost:3000)**

1. Chưa login mở `/profile` -> hiện `Login`, không crash.
2. Login -> Navbar avatar -> Hồ sơ -> vào `/profile`, thấy avatar + tên + email + `Tham gia dd/mm/yyyy`.
3. Sửa tên: nhập 1 ký tự -> lỗi inline `tối thiểu 2 ký tự`; nhập 51 ký tự -> lỗi `tối đa 50`; Enter tên hợp lệ -> toast thành công, reload vẫn giữ tên mới.
4. Mở `/share/:uid` ở ẩn danh sau khi sửa tên -> tên mới hiển thị (nếu share đã bật).
5. Đổi avatar từ Profile -> mở `ChangeAvatarModal` cũ, lưu xong avatar mới hiện ngay.
6. Xuất dữ liệu từ Profile -> mở `ExportModal`, xuất Excel thành công.
7. Đăng xuất từ Profile -> confirm -> về `Login`.
8. Check 360px mobile + dark/light mode, không vỡ layout.

- [ ] **Step 4: Final commit if fixes needed**

Only if manual fixes were made:

```bash
git add -A
git commit -m "fix: sua loi manual trang profile"
```

If no fixes, skip this step (do not create empty commit).

---

## Self-Review (run by planner)

- Spec §4 (route + module + Navbar + không collection mới) -> Task 2 Steps 2-3. Covered.
- Spec §5 (2 cards, edit 2-50 trim, avatar/export/logout reuse, link stats/albums) -> Task 2 Step 1. Covered, stats card removed as requested.
- Spec §6 (validate inline, giữ giá trị cũ, sync fail console.error, fallback CineMOB User, email readonly, không UID) -> Task 1 Steps 1/3 + Task 2 Step 1. Covered.
- Spec §7 (tsc/build, unit biên + sync, manual login/share/responsive) -> Task 1 Steps 4-5 + Task 3. Covered.
- No TBD/TODO/placeholders. All code blocks complete. Types match: `validateDisplayName` return type used identically in service, test, and page.
