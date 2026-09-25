# Movie Share via Public Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm chia sẻ danh sách phim đã coi qua 1 link công khai cố định `/share/:uid` xem được không cần đăng nhập.

**Architecture:** Snapshot rút gọn trong collection `public_shares/{uid}` với `isEnabled` điều khiển public read; route `/share/:uid` public tách khỏi Login guard; Dashboard có nút bật/tắt + copy + cập nhật snapshot manual.

**Tech Stack:** React 19 + TypeScript, React Router 7, Firebase Firestore v12, Tailwind CSS v4, Zustand 5

## Global Constraints

- Two-space indentation, single quotes, semicolons, functional React components.
- Component files `PascalCase`, hooks `useX`, stores `xStore.ts`, services `xService.ts`.
- Rendering in components, behavior in hooks, remote calls in services, interfaces in `src/types`.
- Never commit `.env`, API keys, Firebase credentials.
- Run `npx tsc --noEmit` and `npm run build` before done.
- No automated test runner in repo; verification is `tsc` + `build` + manual ẩn danh.

---

## File Structure

- `src/types/movie.ts` — thêm `PublicShareMovie` + `PublicShare` interfaces. Một nơi định nghĩa kiểu dùng chung cho service, hook, page.
- `src/features/share/services/shareService.ts` — mới. Chỉ chứa Firestore CRUD cho `public_shares`: `getPublicShare`, `upsertPublicShare`, `setShareEnabled`. Không chứa UI logic.
- `firestore.rules` — thêm rule `public_shares`. Không sửa rule `movies`/`albums` hiện tại.
- `src/features/share/hooks/useShare.ts` — mới. Gom state loading/enabled/shareUrl/lastUpdated + gọi service + build snapshot từ `Movie[]`. Dashboard chỉ gọi hook này.
- `src/features/dashboard/components/DashboardActions.tsx` — mở rộng props để nhúng nút Share (bật/tắt, copy, cập nhật). Giữ 2 nút hiện tại nguyên vẹn.
- `src/features/share/pages/SharePage.tsx` — mới, lazy-loaded. Public page đọc `uid` từ params, fetch snapshot, render grid read-only. Không yêu cầu `useAuth`.
- `src/App.tsx` — tách routing thành public `/share/:uid` + private guard còn lại. `SharePage` lazy import như các page khác.

---

### Task 1: Types + Service + Firestore rules

**Files:**
- Modify: `src/types/movie.ts`
- Create: `src/features/share/services/shareService.ts`
- Modify: `firestore.rules`

**Interfaces:**
- Consumes: `Movie` from `@/types`, `db` from `@/lib/firebase`, Firestore `doc/getDoc/setDoc/updateDoc/serverTimestamp/Timestamp`.
- Produces: `PublicShareMovie`, `PublicShare`, `getPublicShare(uid: string) => Promise<PublicShare | null>`, `upsertPublicShare(uid: string, data: Omit<PublicShare,'updatedAt'>) => Promise<void>`, `setShareEnabled(uid: string, enabled: boolean) => Promise<void>`.

- [ ] **Step 1: Thêm types vào `src/types/movie.ts`**

Thêm vào cuối file, sau `Stats`:

```typescript
export interface PublicShareMovie {
  id: string | number;
  title: string;
  title_vi?: string;
  poster_path?: string;
  media_type?: 'movie' | 'tv';
  release_date?: string;
  rating?: number;
}

export interface PublicShare {
  displayName: string;
  photoURL?: string;
  isEnabled: boolean;
  updatedAt: Timestamp | Date;
  totalCount: number;
  movies: PublicShareMovie[];
}
```

- [ ] **Step 2: Tạo `src/features/share/services/shareService.ts`**

```typescript
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PublicShare } from '@/types';

const COLLECTION_NAME = 'public_shares';

export const getPublicShare = async (uid: string): Promise<PublicShare | null> => {
  const ref = doc(db, COLLECTION_NAME, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return null;
  }
  return snap.data() as PublicShare;
};

export const upsertPublicShare = async (
  uid: string,
  data: Omit<PublicShare, 'updatedAt'>
): Promise<void> => {
  const ref = doc(db, COLLECTION_NAME, uid);
  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
};

export const setShareEnabled = async (uid: string, enabled: boolean): Promise<void> => {
  const ref = doc(db, COLLECTION_NAME, uid);
  await setDoc(
    ref,
    {
      isEnabled: enabled,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
};

export const buildShareMovies = (movies: import('@/types').Movie[]) => {
  return movies
    .filter((m) => (m.status || 'history') === 'history')
    .slice(0, 500)
    .map((m) => ({
      id: m.id,
      title: m.title,
      title_vi: m.title_vi || '',
      poster_path: m.poster_path || '',
      media_type: m.media_type || 'movie' as const,
      release_date: m.release_date || '',
      rating: m.rating || 0
    }));
};
```

- [ ] **Step 3: Cập nhật `firestore.rules`**

Thêm sau block `// Albums`, trước `// Users`:

```
    // Public shares - read public if enabled, write only owner
    match /public_shares/{userId} {
      allow read: if resource.data.isEnabled == true;
      allow create, update: if isSignedIn() && isOwner(userId);
      allow delete: if isSignedIn() && isOwner(userId);
    }
```

Giữ nguyên toàn bộ rule `movies`, `albums`, `users` hiện tại.

- [ ] **Step 4: Kiểm tra types**

Run: `npx tsc --noEmit`
Expected: PASS, không có lỗi mới.

- [ ] **Step 5: Commit**

```bash
git add src/types/movie.ts src/features/share/services/shareService.ts firestore.rules
git commit -m "feat: add public share types service and rules"
```

### Task 2: Hook + Dashboard Share UI

**Files:**
- Create: `src/features/share/hooks/useShare.ts`
- Modify: `src/features/dashboard/components/DashboardActions.tsx`

**Interfaces:**
- Consumes: `getPublicShare`, `upsertPublicShare`, `setShareEnabled`, `buildShareMovies` từ Task 1; `useMovieStore` movies; `useAuth` user; `useToastStore` showToast.
- Produces: `useShare()` trả về `{ isEnabled: boolean; loading: boolean; syncing: boolean; shareUrl: string; lastUpdated: Date | null; toggleShare: () => Promise<void>; refreshSnapshot: () => Promise<void>; copyLink: () => Promise<void> }`.

- [ ] **Step 1: Tạo `src/features/share/hooks/useShare.ts`**

```typescript
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import useMovieStore from '@/features/movies/stores/movieStore';
import useToastStore from '@/shared/stores/toastStore';
import {
  buildShareMovies,
  getPublicShare,
  setShareEnabled,
  upsertPublicShare
} from '../services/shareService';

export const useShare = () => {
  const { user } = useAuth();
  const { movies } = useMovieStore();
  const { showToast } = useToastStore();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const uid = user?.uid || '';
  const shareUrl = uid ? `${window.location.origin}/share/${uid}` : '';

  useEffect(() => {
    const load = async () => {
      if (!uid) {
        setLoading(false);
        return;
      }
      try {
        const data = await getPublicShare(uid);
        if (data) {
          setIsEnabled(data.isEnabled);
          const ts = data.updatedAt as unknown as { toDate?: () => Date };
          setLastUpdated(ts && typeof ts.toDate === 'function' ? ts.toDate() : (data.updatedAt as Date));
        }
      } catch {
        showToast('Không tải được trạng thái chia sẻ', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid, showToast]);

  const refreshSnapshot = useCallback(async () => {
    if (!user) {
      return;
    }
    setSyncing(true);
    try {
      const shareMovies = buildShareMovies(movies);
      await upsertPublicShare(user.uid, {
        displayName: user.displayName || 'CineMOB User',
        photoURL: user.photoURL || '',
        isEnabled: true,
        totalCount: shareMovies.length,
        movies: shareMovies
      });
      setIsEnabled(true);
      setLastUpdated(new Date());
      showToast('Đã cập nhật link chia sẻ', 'success');
    } catch {
      showToast('Cập nhật link thất bại', 'error');
    } finally {
      setSyncing(false);
    }
  }, [movies, showToast, user]);

  const toggleShare = useCallback(async () => {
    if (!user) {
      return;
    }
    if (!isEnabled) {
      await refreshSnapshot();
      return;
    }
    try {
      await setShareEnabled(user.uid, false);
      setIsEnabled(false);
      showToast('Đã tắt chia sẻ công khai', 'info');
    } catch {
      showToast('Đổi trạng thái chia sẻ thất bại', 'error');
    }
  }, [isEnabled, refreshSnapshot, showToast, user]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Đã copy link chia sẻ', 'success');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Đã copy link chia sẻ', 'success');
    }
  }, [shareUrl, showToast]);

  return { isEnabled, loading, syncing, shareUrl, lastUpdated, toggleShare, refreshSnapshot, copyLink };
};
```

- [ ] **Step 2: Mở rộng `DashboardActions.tsx` để có nút Share**

Thay toàn bộ file `src/features/dashboard/components/DashboardActions.tsx` bằng:

```typescript
import React from 'react';
import { Link2, Link2Off, Copy, RefreshCw, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShare } from '@/features/share/hooks/useShare';

interface DashboardActionsProps {
  onOpenAddModal: () => void;
}

const DashboardActions: React.FC<DashboardActionsProps> = ({ onOpenAddModal }) => {
  const navigate = useNavigate();
  const { isEnabled, loading, syncing, shareUrl, toggleShare, refreshSnapshot, copyLink } = useShare();

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <button
          onClick={() => navigate('/search')}
          className="w-full bg-linear-to-br from-primary/90 to-primary hover:to-primary/90 p-5 sm:p-6 rounded-3xl flex items-center justify-between group transition-colors shadow-xl shadow-primary/20 cursor-pointer border border-white/10"
        >
          <div>
            <p className="text-white/80 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2 text-left">Thêm vào bộ sưu tập</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white text-left tracking-tight">Ghi lại phim</h3>
          </div>
          <div className="bg-white/10 p-3 sm:p-3.5 rounded-2xl transition-colors duration-300 backdrop-blur-md border border-white/10">
            <Search size={24} className="text-white sm:w-7 sm:h-7" />
          </div>
        </button>

        <button
          onClick={onOpenAddModal}
          className="w-full bg-surface border border-border-default hover:border-primary/50 p-5 sm:p-6 rounded-3xl flex items-center justify-between group transition-colors shadow-premium hover:shadow-premium-hover cursor-pointer"
        >
          <div>
            <p className="text-text-muted text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2 text-left opacity-60">Không tìm thấy phim?</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-text-main text-left tracking-tight">Thêm thủ công</h3>
          </div>
          <div className="bg-black/5 dark:bg-white/5 p-3 sm:p-3.5 rounded-2xl group-hover:bg-primary/10 transition-colors duration-300 border border-border-default">
            <Plus size={24} className="text-text-main group-hover:text-primary transition-colors sm:w-7 sm:h-7" />
          </div>
        </button>
      </div>

      <div className="bg-surface border border-border-default rounded-3xl p-4 sm:p-5 shadow-premium flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
            {isEnabled ? <Link2 size={20} /> : <Link2Off size={20} />}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-text-main">Chia sẻ danh sách đã coi</p>
            <p className="text-xs text-text-muted truncate">{loading ? 'Đang tải...' : isEnabled ? shareUrl : 'Link đang tắt'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleShare}
            disabled={loading || syncing}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-primary text-white disabled:opacity-40 cursor-pointer"
          >
            {isEnabled ? 'Tắt' : syncing ? 'Đang bật...' : 'Bật + Copy'}
          </button>
          {isEnabled && (
            <>
              <button onClick={copyLink} className="p-2.5 rounded-xl border border-border-default hover:border-primary/50 cursor-pointer" title="Copy link">
                <Copy size={16} />
              </button>
              <button onClick={refreshSnapshot} disabled={syncing} className="p-2.5 rounded-xl border border-border-default hover:border-primary/50 disabled:opacity-40 cursor-pointer" title="Cập nhật">
                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardActions;
```

- [ ] **Step 3: Kiểm tra types**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/share/hooks/useShare.ts src/features/dashboard/components/DashboardActions.tsx
git commit -m "feat: add share hook and dashboard share UI"
```

### Task 3: SharePage public + App routing

**Files:**
- Create: `src/features/share/pages/SharePage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `getPublicShare` từ Task 1, `useParams` uid, `getTMDBImageUrl` từ `@/features/movies/utils/movieUtils`, `PLACEHOLDER_IMAGE` từ `@/constants`.
- Produces: Route công khai `/share/:uid` render grid read-only, không dùng `useAuth` hay `Layout` yêu cầu login.

- [ ] **Step 1: Tạo `src/features/share/pages/SharePage.tsx`**

```typescript
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Film, Star, Share2 } from 'lucide-react';
import { getPublicShare } from '../services/shareService';
import { PublicShare } from '@/types';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { getTMDBImageUrl } from '@/features/movies/utils/movieUtils';
import Loading from '@/shared/components/ui/Loading';
import EmptyState from '@/shared/components/ui/EmptyState';

const SharePage: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!uid) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const share = await getPublicShare(uid);
        if (!share || !share.isEnabled) {
          setNotFound(true);
        } else {
          setData(share);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  if (loading) {
    return <Loading fullScreen={true} />;
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background text-text-main">
        <EmptyState
          icon={Share2}
          title="Link không khả dụng"
          description="Link đã tắt hoặc không tồn tại."
          action={{ label: 'Về trang chủ', onClick: () => navigate('/') }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-main">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex items-center gap-4 bg-surface border border-border-default rounded-3xl p-4 sm:p-5 shadow-premium">
          {data.photoURL ? (
            <img src={data.photoURL} alt={data.displayName} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Film size={22} />
            </div>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">{data.displayName} — Phim đã coi</h1>
            <p className="text-xs text-text-muted">{data.totalCount} phim · CineMOB Share</p>
          </div>
        </div>

        {data.movies.length === 0 ? (
          <EmptyState icon={Film} title="Chưa có phim nào" description="Chủ link chưa chia sẻ phim nào." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {data.movies.map((m) => {
              const img = m.poster_path
                ? m.poster_path.startsWith('http')
                  ? m.poster_path
                  : getTMDBImageUrl(m.poster_path, 'w500')
                : PLACEHOLDER_IMAGE;
              return (
                <div key={`${m.id}`} className="bg-surface rounded-2xl overflow-hidden border border-border-default">
                  <div className="aspect-2/3 w-full overflow-hidden bg-black/5">
                    <img src={img} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm leading-tight line-clamp-1" title={m.title}>{m.title}</h3>
                    {m.title_vi ? <p className="text-[11px] text-text-muted truncate italic">{m.title_vi}</p> : null}
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-text-muted">
                      {m.release_date ? <span>{new Date(m.release_date).getFullYear()}</span> : null}
                      {!!m.rating && m.rating > 0 && (
                        <span className="inline-flex items-center gap-1 text-warning font-bold">
                          <Star size={11} fill="currentColor" /> {m.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePage;
```

- [ ] **Step 2: Sửa `src/App.tsx` để tách public route**

Thêm lazy import sau dòng `ReleaseCalendarPage`:

```typescript
const SharePage = lazy(() => import('@/features/share/pages/SharePage'));
```

Thay block `return (<Router>...` trong `App` thành 2-layer Routes: public trước, private sau:

```typescript
  return (
    <Router>
      <Routes>
        <Route
          path="/share/:uid"
          element={
            <Suspense fallback={<Loading fullScreen={true} />}>
              <SharePage />
            </Suspense>
          }
        />
        <Route
          path="/*"
          element={
            <>
              {shouldShowSplash && (
                <SplashScreen
                  onAnimationFinish={() => setAnimationFinished(true)}
                  showLoading={animationFinished && !appReady}
                />
              )}

              {animationFinished && (
                <AuthProvider>
                  <MainApp onReady={handleAppReady} appReady={appReady} />
                  <ToastContainer />
                  <AlertContainer />
                </AuthProvider>
              )}
            </>
          }
        />
      </Routes>
    </Router>
  );
```

Giữ nguyên `AnimatedRoutes`, `MainApp`, `Layout` cho các route private. Không bọc `SharePage` trong `AuthProvider` hay `Layout`.

- [ ] **Step 3: Kiểm tra types**

Run: `npx tsc --noEmit`
Expected: PASS. Nếu lỗi `getTMDBImageUrl` path, kiểm tra `src/features/movies/utils/movieUtils.ts` export đúng tên.

- [ ] **Step 4: Commit**

```bash
git add src/features/share/pages/SharePage.tsx src/App.tsx
git commit -m "feat: add public share page and routing"
```

### Task 4: Build + kiểm thử thủ công + deploy rules

**Files:**
- Modify: none (verify only). Nếu lỗi mới sửa file tương ứng trong task trước.

- [ ] **Step 1: Chạy build production**

Run: `npm run build`
Expected: `vite build` thành công, tạo `dist/` không lỗi.

- [ ] **Step 2: Kiểm thử thủ công Dashboard**

Mở `npm run dev`, đăng nhập, vào Dashboard, bấm `Bật + Copy`, kiểm tra toast `Đã cập nhật link chia sẻ`, bấm copy lần nữa kiểm tra clipboard có `http://localhost:3000/share/{uid}`.

- [ ] **Step 3: Kiểm thử ẩn danh SharePage**

Mở link ở cửa sổ ẩn danh không login: thấy header tên + tổng số phim + grid poster + rating. Tắt share ở tab login, reload tab ẩn danh: thấy `Link không khả dụng`. Bật lại + `Cập nhật` sau khi thêm 1 phim history: tab ẩn danh thấy phim mới.

- [ ] **Step 4: Deploy Firestore rules**

Run: `firebase deploy --only firestore:rules`
Expected: deploy thành công. Sau đó test lại link ẩn danh trên production data.

- [ ] **Step 5: Commit cuối nếu có fix**

```bash
git status --short
git diff
```

Chỉ commit file đã sửa vì fix verification, message `fix: ...`.

## Self-Review

- Spec mục 4 có `public_shares` + rule + route public: Task 1 và Task 3 phủ.
- Spec mục 5 có service/hook/SharePage/DashboardActions + snapshot manual: Task 1, 2, 3 phủ.
- Spec mục 6 có tắt link, 0 phim, sai uid, privacy 500 phim: Task 2 toggle, Task 3 notFound/EmptyState, Task 1 slice 500 phủ.
- Spec mục 7 có `tsc` + `build` + manual ẩn danh: Task 4 phủ.
- Không placeholder: mọi step có code đầy đủ, lệnh chính xác, output kỳ vọng rõ.
- Type nhất quán: `PublicShare`, `PublicShareMovie`, `getPublicShare/upsertPublicShare/setShareEnabled/buildShareMovies`, `useShare` dùng xuyên suốt các task.
