# CineMOB Taste Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đập đi xây lại toàn bộ lớp giao diện CineMOB theo chuẩn design-taste-frontend (direction sheet + house rules + gate), giữ nguyên mọi logic/route/store/service.

**Architecture:** Một nhánh `rebuild/taste-ui`, 4 chặng (tokens+shell → primitives → màn → modals+motion). Task 1 chạy `draw.mjs` điền Appendix của spec trước — mọi task sau consume Appendix đó (palette, blueprint, signature move). Tokens giữ nguyên tên semantic key trong `src/index.css` để 208 usage hiện có không vỡ; từng màn rebuild JSX theo blueprint nhưng import lại hooks/stores nguyên vẹn.

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 (`@theme` trong CSS), framer-motion, lucide-react. Gate: `.agents/skills/design-taste-frontend/scripts/{draw,lint,inspect}.mjs` (Node ≥22 — máy hiện tại v24.19.0 ✓).

**Spec:** `docs/superpowers/specs/2026-10-14-cinemob-taste-rebuild-design.md` (đã duyệt).

## Global Constraints

- **Presentation only.** Không đổi route, store, hook, service, Firebase, TMDB cache, PWA/sw, push scripts. Không thêm dependency. Không đụng `dist/`/`dev-dist/`.
- **Semantic tokens chỉ** — cấm hex inline mới; mọi màu qua `bg-surface`, `text-text-primary`, `border-border`… (tên key giữ nguyên như hiện tại).
- **House rules (verbatim từ spec):** headline ≤2 dòng mọi width · không eyebrow/pill above headline · không mono ngoài tabular numbers thật · không index 01/02 · không hairline trang trí (phân cách bằng tone step/khoảng trắng) · không gradient (chỉ scrim neutral trên backdrop) · không shadow khi nghỉ (chỉ menu/dialog thật sự nổi) · không glass/backdrop-blur/pill nav · không icon-topped feature cards / hàng card trùng layout · không emoji/decorative shapes · tối đa 2 typeface · button 1 fill, radius 1 lần (vuông HOẶC tròn, không "soft" 9–16px) · không styled accent word trong headline · không tiny uppercase letter-spaced labels.
- **2 mode:** dark theo Appendix, light tự thiết kế theo tỷ lệ sheet (Appendix §palette-light), không đảo màu dark.
- **Giữ nguyên:** aria, focus-trap, skip-link, keyboard nav avatar menu, `splashPolicy.ts`, confetti RandomPicker, lazy modals.
- **Verify mỗi task:** `npm run typecheck && npm run lint && npm run build` (ngắn: typecheck+lint). Chặng xanh mới commit.
- **Commit prefix:** `feat(ui):` / `style(ui):` / `docs:` — Conventional Commits.
- **Skill path:** `SKILL = .agents/skills/design-taste-frontend` (chạy từ project root).
- **Banned-class clean-up:** grep các cụm bị cấm thấy là sửa luôn trong task đang mở file: `shadow-premium`, `shadow-card`, `shadow-glass`, `shadow-lg`, `hover:scale-105`, `transition-all`, `backdrop-blur`, `font-mono` (trừ `<pre>/<code>`), gradient bất kỳ ngoài scrim.

## File Structure (toàn bộ thay đổi)

```
docs/superpowers/specs/2026-10-14-cinemob-taste-rebuild-design.md  # Appendix (Task 1)
src/index.css                     # tokens 2 mode (Task 2)
index.html                        # Google Fonts (Task 2)
src/shared/config/navigation.ts   # + /stats (Task 3)
src/app/components/{Layout,Navbar}.tsx                    # Task 3
src/shared/components/layout/{MobileBottomNav,Footer}.tsx # Task 3
src/features/auth/components/Login.tsx, src/shared/pages/NotFoundPage.tsx # Task 4
src/shared/components/ui/*.tsx (15 file)                 # Tasks 5-8
src/shared/components/feedback/*.tsx (4 file)             # Task 9
src/features/movies/components/MovieCard.tsx             # Task 10
src/features/dashboard/**                                 # Task 11
src/features/search/**                                    # Task 12
src/features/albums/** (pages)                            # Task 13
src/features/calendar/**                                  # Task 14
src/features/stats/**                                     # Task 15
src/features/profile/**                                   # Task 16
src/features/movies/components/MovieDetailModal.tsx       # Task 17
src/features/movies/components/AddMovieModal.tsx + add-movie/** # Task 18
src/features/movies/components/{RandomPickerModal,random-picker/**} + MemberSearch # Task 19
src/index.css (motion tokens) + mọi component có entrance # Task 20
DESIGN.md (rewrite design system doc)                     # Task 22
```

---

# CHẶNG 1 — Tokens + Shell

### Task 1: Deal direction + điền Appendix của spec

**Files:**
- Modify: `docs/superpowers/specs/2026-10-14-cinemob-taste-rebuild-design.md` (phần `## Appendix — Direction sheet`)
- Modify: `.gitignore` (thêm `.taste-skill/` nếu chưa có)

**Interfaces:**
- Produces: Appendix với các mục cố định — `§direction` (name + seed), `§palette-dark` (bảng role/hex), `§palette-light` (bảng role/hex), `§type` (font families + scale), `§radius` (quyết định vuông/tròn + 3 bán kính), `§blueprint` (composition từng section: shell, showcase, gallery, list, stats, about, footer), `§signature-move`, `§idea-sentence`, `§redraws` (list + lý do, có thể rỗng). Mọi task sau chỉ dùng giá trị từ Appendix.

- [ ] **Step 1: Viết inventory 8–12 thứ chỉ CineMOB có** (bắt buộc trước khi draw). Ghi vào vùng nháp (không commit): thư viện phim cá nhân chung của nhóm · poster/backdrop TMDB · modal xem phim · bánh xe random picker · lịch phát hành theo ngày · album xếp hạng · "vừa xem / muốn xem" · splash Lottie · tìm kiếm thành viên (member search) · thống kê nhóm ·credits TMDB. Ít nhất 8 mục, mỗi mục 1 dòng.

- [ ] **Step 2: Deal 3 directions**

```bash
node .agents/skills/design-taste-frontend/scripts/draw.mjs --sector consumer-app \
  --brief "CineMOB shared movie library PWA for a friend group: posters, release calendar, random picker, stats" \
  --sections showcase,gallery,list,stats,about --options 3
```

Expected: in 3 direction + tóm tắt mỗi direction. Nếu `--sector consumer-app` lỗi thì chạy `--list sectors` và chọn sector gần nhất, ghi vào report.

- [ ] **Step 3: Chọn 1 direction** — hold từng direction against inventory ở Step 1: direction nào compose được thứ riêng của CineMOB (poster làm vật liệu, rail thư viện nhóm, bánh xe) thì chọn; không chọn thứ quen thuộc. Ghi 1 câu lý do.

- [ ] **Step 4: Deal full sheet** (cùng arguments, bỏ `--options`, thêm `--direction <id>`)

```bash
node .agents/skills/design-taste-frontend/scripts/draw.mjs --sector consumer-app \
  --brief "CineMOB shared movie library PWA for a friend group: posters, release calendar, random picker, stats" \
  --sections showcase,gallery,list,stats,about --direction <chosen-id>
```

Expected: direction sheet đầy đủ (palette, type, hero, section blueprints, motion). Redraw `--redraw hero|type|palette|photos|section:<role>|direction` chỉ khi mâu thuẫn asset/thương hiệu — mỗi lần ghi lý do; palette có màufight subject (poster điện ảnh) thì redraw 1 lần hoặc lấy màu từ subject giữ tỷ lệ.

- [ ] **Step 5: Điền Appendix spec** — mở spec, thay placeholder `## Appendix — Direction sheet` bằng nội dung thật:
  - `§direction`: name + seed (copy từ output `--show`).
  - `§palette-dark`: bảng `| role | hex |` với tối thiểu: ground, surface, elevated, ink (text chính), ink-secondary, accent, accent-hover, on-accent, border/tone-step, success, warning, danger, info.
  - `§palette-light`: tự thiết kế theo `references/colour.md` — GIỮ tỷ lệ (proportion) của §palette-dark, chọn sắc độ ấm riêng (ground sáng ấm, cùng accent hoặc accent điều chỉnh lightness cho contrast ≥4.5:1). Bảng cùng format.
  - `§type`: `--font-sans`, `--font-display` families (Google Fonts, tên chính xác để nối URL), scale: display size/weight/tracking/leading, body size/leading, max 2 family.
  - `§radius`: quyết định "vuông hoặc tròn 1 lần" cho button + 3 giá trị `--radius-control/card/dialog` (px).
  - `§blueprint`: tóm tắt composition mỗi section vừa deal: shell (nav), showcase (dashboard hero + rails), gallery (poster grid), list (search/albums/calendar rows), stats, about (detail fold), footer.
  - `§signature-move`: tên 1 hiệu ứng từ sheet.
  - `§idea-sentence`: hoàn thành câu `Trên trang này, [X] trở thành [Y]` (ứng viên: poster là vật liệu chính) — competitor test với Letterboxd/IMDb trước khi chốt.
  - `§redraws`: list mọi redraw + lý do (hoặc "không có").

- [ ] **Step 6: Self-check Appendix không còn ô trống**

```bash
findstr /I "TBD TODO" docs\superpowers\specs\2026-10-14-cinemob-taste-rebuild-design.md
```

Expected: không dòng nào (trừ dòng Non-goals không được chứa TBD).

- [ ] **Step 7: `.gitignore` — thêm `.taste-skill/` nếu chưa có**

```bash
findstr /C:".taste-skill" .gitignore || echo .taste-skill/ >> .gitignore
```

- [ ] **Step 8: Commit**

```bash
git add docs/superpowers/specs/2026-10-14-cinemob-taste-rebuild-design.md .gitignore
git commit -m "docs: record taste direction sheet in spec appendix"
```

---

### Task 2: Tokens 2 mode + font mới

**Files:**
- Modify: `src/index.css` (toàn bộ `@theme`, block `.dark`, block `h1/h2/h3/.font-display`, `.center-card-glow`)
- Modify: `index.html` (Google Fonts link, dòng ~43)

**Interfaces:**
- Consumes: Appendix `§palette-dark`, `§palette-light`, `§type`, `§radius`.
- Produces: giữ NGUYÊN bộ key `--color-*` hiện có (`background, surface, surface-elevated, primary, primary-hover, on-primary, secondary, text-primary, text-secondary, border, focus, success, on-success, warning, danger, on-danger, info, border-default`), `--radius-control/card/dialog`, `--font-sans/display`, các `--animate-*` + keyframes. Mọi task sau dùng đúng các key này.

- [ ] **Step 1: Viết lại `@theme` trong `src/index.css`** — giữ nguyên cấu trúc (giá trị light mặc định, `.dark` override). Thay giá trị bằng Appendix, GIỮ key:

```css
@import 'tailwindcss';

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* §type */
  --font-sans: '<font-sans family>', sans-serif;
  --font-display: '<font-display family>', sans-serif;

  /* §palette-light — light là giá trị mặc định */
  --color-background: <light ground>;
  --color-surface: <light surface>;
  --color-surface-elevated: <light elevated>;
  --color-primary: <light accent>;
  --color-primary-hover: <light accent-hover>;
  --color-on-primary: <light on-accent>;
  --color-secondary: <light ink-secondary>;
  --color-text-primary: <light ink>;
  --color-text-secondary: <light ink-secondary>;
  --color-border: <light tone-step>;
  --color-focus: <light accent>;
  --color-success: <light success>;
  --color-on-success: <light on-accent>;
  --color-warning: <light warning>;
  --color-danger: <light danger>;
  --color-on-danger: <light on-accent>;
  --color-info: <light info>;
  --color-border-default: <light tone-step ở 6% alpha>;

  /* §radius — button radius quyết định 1 lần */
  --radius-control: <?>px;
  --radius-card: <?>px;
  --radius-dialog: <?>px;

  /* Shadow GIỮ key (dùng cho dialog/menu — nơi thật sự nổi), cập nhật theo sheet */
  --shadow-card: <?>;
  --shadow-elevated: <?>;
  --shadow-premium: <?>;
  --shadow-premium-hover: <?>;
  --shadow-glass: <?>;

  /* Giữ nguyên 4 --animate-* + keyframes slide-in-right/slide-down/fade-in/zoom-in-95 hiện có */
}
```

Giá trị `<...>` lấy đúng từ Appendix; mỗi hex là số thật, không để trống. Key `--shadow-*` giữ đến Task 22 (Task 22 grep = 0 rồi gỡ key không dùng).

- [ ] **Step 2: Viết lại block `.dark`** — cùng key, giá trị từ `§palette-dark` (shadow cũng theo sheet):

```css
.dark {
  --color-background: <dark ground>;
  --color-surface: <dark surface>;
  --color-surface-elevated: <dark elevated>;
  --color-primary-hover: <dark accent-hover>;
  --color-secondary: <dark ink-secondary>;
  --color-success: <dark success>;
  --color-on-success: <dark on-accent>;
  --color-warning: <dark warning>;
  --color-danger: <dark danger>;
  --color-on-danger: <dark on-accent>;
  --color-info: <dark info>;
  --color-text-primary: <dark ink>;
  --color-text-secondary: <dark ink-secondary>;
  --color-border: <dark tone-step>;
  --color-focus: <dark accent>;
  --color-border-default: <dark tone-step 6% alpha>;
  --shadow-card: <?>;
  --shadow-elevated: <?>;
}
```

Lưu ý: `--color-background/surface/primary/text-primary` là light-vs-dark khác nhau — nếu key nào 2 mode đều phải đổi thì thêm vào `.dark` (so sánh 2 bảng Appendix, key nào giá trị khác thì thêm dòng).

- [ ] **Step 3: Sửa font-family hardcode** trong `@layer base` (dòng ~276):

```css
h1, h2, h3, .font-display { font-family: '<font-display family>', sans-serif; }
```

- [ ] **Step 4: Gỡ glow bị cấm** — tìm và xử lý:

```bash
grep -rn "center-card-glow" src/
```

Nếu có usage: xóa class `center-card-glow` khỏi markup (task sở hữu file đó sẽ xử lý màu lại — ghi chú vào notebook), xóa rule `.center-card-glow` trong `index.css`.

- [ ] **Step 5: `index.html` — thay Google Fonts** (dòng ~43): xóa link Inter + Be Vietnam Pro, thêm 1 link cho 2 family Appendix (đúng tên family, weight cần: display weight + body weight + 1-medium):

```html
<link href="https://fonts.googleapis.com/css2?family=<SansFamily>:ital,wght@0,400;0,500;0,600&family=<DisplayFamily>:wght,<display-weights>&display=swap" rel="stylesheet">
```

- [ ] **Step 6: Verify**

```bash
npm run typecheck && npm run lint && npm run build
```

Expected: 0 lỗi cả 3. Chạy tay `npm run dev`, mở `/` và login screen, toggle dark/light — 2 mode hiện 2 bảng màu Appendix, chữ dùng font mới (kiểm tra DevTools → computed font-family).

- [ ] **Step 7: Commit**

```bash
git add src/index.css index.html
git commit -m "style(ui): replace design tokens with taste direction palette and type"
```

---

### Task 3: Navigation config + Shell (Navbar, Layout, MobileBottomNav, Footer)

**Files:**
- Modify: `src/shared/config/navigation.ts`
- Modify: `src/app/components/Navbar.tsx` (278 dòng — GIỮ logic keyboard/state/lazy modals, thay render)
- Modify: `src/app/components/Layout.tsx`
- Modify: `src/shared/components/layout/MobileBottomNav.tsx`
- Modify: `src/shared/components/layout/Footer.tsx`

**Interfaces:**
- Consumes: tokens (Task 2), Appendix `§blueprint.shell`, `§blueprint.footer`.
- Produces: `NAV_ITEMS` gồm 5 item (Task nào render nav đều dùng lại); `isNavItemActive` GIỮ NGUYÊN chữ ký.

- [ ] **Step 1: Thêm `/stats` vào nav** — `navigation.ts`:

```ts
export const NAV_ITEMS: NavigationItem[] = [
  { to: '/', label: 'Thư viện', match: 'exact' },
  { to: '/search', label: 'Tìm phim', match: 'exact' },
  { to: '/albums', label: 'Album', match: 'prefix' },
  { to: '/calendar', label: 'Lịch', match: 'exact' },
  { to: '/stats', label: 'Thống kê', match: 'exact' },
];
```

`isNavItemActive` không đổi.

- [ ] **Step 2: Rebuild `Navbar.tsx` theo `§blueprint.shell`** — thay phần JSX render, GIỮ: state `open/menu`, handlers keyboard (Arrow/Escape/Home/End), lazy `RandomPickerModal`/`MemberSearchModal`, theme toggle logic, avatar menu logic. Render target (desktop ≥1024):

```tsx
<header className="sticky top-0 z-50 bg-background">
  <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
    <a href="/" className="font-display text-xl font-bold tracking-tight text-text-primary">CineMOB</a>
    <nav aria-label="Chính" className="hidden items-center gap-6 md:flex">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to}
          className={({ isActive }) => isActive
            ? 'text-sm font-semibold text-primary'
            : 'text-sm font-medium text-text-secondary hover:text-text-primary'}>
          {item.label}
        </NavLink>
      ))}
    </nav>
    <div className="ml-auto flex items-center gap-2">
      {/* theme toggle IconButton + avatar button + dropdown giữ logic cũ */}
    </div>
  </div>
</header>
```

Cấm: backdrop-blur, gradient, shadow, pill. NavLink match theo `isNavItemActive` hiện có (đổi sang `className` function nếu đang dùng attr khác — giữ helper). Dropdown account: `bg-surface-elevated border border-border rounded-card shadow-elevated` (nổi thật sự → shadow hợp lệ).

- [ ] **Step 3: `Layout.tsx`** — giữ nguyên: skip-link, `<main>`, ErrorBoundary/Suspense (ở App.tsx), ScrollToTop, điều kiện Footer, MobileBottomNav. Chỉ chỉnh wrapper: container `max-w-7xl` nhất quán, gap giữa section theo `§blueprint` (space-y lớn), không animate shell.

- [ ] **Step 4: `MobileBottomNav.tsx`** — nền `bg-background` solid (đổi từ `bg-surface-elevated`), bỏ `shadow-elevated` + `rounded-card` nổi (không pill nổi), phân cách bằng tone step 1px `border-t border-border` cho khối nav (nội bộ nav — không trang trí chung), icon Lucide + label `text-[11px]` sentence-case, mỗi tab `min-h-11`, `pb-[env(safe-area-inset-bottom)]`. 5 tab giữ: Trang chủ(/), Tìm kiếm(/search), Albums(/albums), Lịch(/calendar), Cá nhân — tab Cá nhân hành xử như hiện tại (mở menu/profile — GIỮ logic).

- [ ] **Step 5: `Footer.tsx`** — designed close theo `§blueprint.footer`: tên "CineMOB" cỡ display lớn (≤2 dòng), 1 dòng credit TMDB (link), không sitemap. Dùng `bg-background text-text-secondary`, không hairline trang trí.

- [ ] **Step 6: Lint gate trên file đã sửa**

```bash
node .agents/skills/design-taste-frontend/scripts/lint.mjs src/app/components/Navbar.tsx src/app/components/Layout.tsx src/shared/components/layout src/shared/config/navigation.ts
```

Expected: 0 FAIL. Sửa đến khi 0 FAIL.

- [ ] **Step 7: Verify + commit**

```bash
npm run typecheck && npm run lint && npm run build
git add src/shared/config/navigation.ts src/app/components src/shared/components/layout
git commit -m "feat(ui): rebuild shell navigation and footer per taste direction"
```

---

### Task 4: Login + NotFoundPage

**Files:**
- Modify: `src/features/auth/components/Login.tsx`
- Modify: `src/shared/pages/NotFoundPage.tsx`

**Interfaces:**
- Consumes: tokens, Appendix `§blueprint` (hero/intro pattern), primitives `Button` (Task 5 chưa làm — dùng class hiện có, Task 5 sẽ đồng bộ lại).

- [ ] **Step 1: Login** — re-skin tại chỗ, GIỮ logic Firebase auth + validation. Render: 1 form tối giản trên ground; headline `h1` ≤2 dòng (ví dụ "Thư viện phim của nhóm bạn" — ≤32 ký tự, không eyebrow); 1 câu phụ; input rows phẳng (`bg-surface border border-border rounded-control` — radius theo `§radius`); 1 nút primary `bg-primary text-on-primary`. Bỏ mọi gradient/shadow/card bọc. Poster/backdrop nào đang có thì giữ làm ảnh thật; không có thì nền phẳng.

- [ ] **Step 2: NotFoundPage** — `h1` ≤2 dòng, 1 câu phụ, 1 nút về trang chủ (`<Link to="/">`), không icon trang trí, không index.

- [ ] **Step 3: Lint + verify + commit**

```bash
node .agents/skills/design-taste-frontend/scripts/lint.mjs src/features/auth/components/Login.tsx src/shared/pages/NotFoundPage.tsx
npm run typecheck && npm run lint && npm run build
git add src/features/auth/components/Login.tsx src/shared/pages/NotFoundPage.tsx
git commit -m "feat(ui): restyle login and not-found screens"
```

**Stage gate 1 (sau Task 4):** `npm run typecheck && npm run lint && npm run format:check && npm run build && npm test` — 5/5 xanh; `npm run dev` mở app shell tay: nav 5 link (có Thống kê), toggle theme 2 chế độ, login → vào được trang chủ (màn chính chưa đẹp — đúng kỳ vọng). Chạy inspect nhanh shell (không cần auth):

```bash
npm run dev
node .agents/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:3000/nonexistent-route
```

Expected: NotFound render qua shell; ghi lại FAIL (màn chưa rebuild) — chỉ FAIL nào về shell/typography/contrast là sửa ngay tại Task 3/4.

---

# CHẶNG 2 — Shared Primitives

Mọi task chặng này: re-skin class theo tokens + house rules, GIỮ props/aria/logic 100%. Banned-class clean-up trong Global Constraints áp dụng. Mỗi task kết束: lint.mjs trên file + typecheck/lint/build + commit.

### Task 5: Controls — Button, IconButton, Switch, Pagination

**Files:** Modify `src/shared/components/ui/Button.tsx`, `IconButton.tsx`, `Switch.tsx`, `Pagination.tsx`

**Interfaces:** Produces: `Button` props giữ nguyên (`variant`, `size`, `disabled`… — đọc file trước khi sửa), `IconButton` (label prop giữ).

- [ ] **Step 1:** Đọc 4 file. `Button`: 1 fill `bg-primary text-on-primary hover:bg-primary-hover`, radius = `rounded-control` (đã chốt 1 lần ở `§radius`), variants phụ (outline/ghost) = nền phẳng `border border-border` / không nền, không shadow khi nghỉ. Cấm `hover:shadow-*`.
- [ ] **Step 2:** `IconButton`: same radius + tokens, `aria-label` giữ. `Switch`: track `bg-border`→`bg-primary` khi on, thumb nền `bg-surface-elevated`, không shadow. `Pagination`: **bỏ `shadow-premium` ở dòng 58/107/133** → phân cách bằng `bg-surface` + `border border-border`; nút active `bg-primary text-on-primary`; số trang dùng `tabular-nums` (font thường, không mono class).
- [ ] **Step 3:**

```bash
node .agents/skills/design-taste-frontend/scripts/lint.mjs src/shared/components/ui/Button.tsx src/shared/components/ui/IconButton.tsx src/shared/components/ui/Switch.tsx src/shared/components/ui/Pagination.tsx
npm run typecheck && npm run lint && npm run build
git add src/shared/components/ui/Button.tsx src/shared/components/ui/IconButton.tsx src/shared/components/ui/Switch.tsx src/shared/components/ui/Pagination.tsx
git commit -m "style(ui): restyle control primitives per taste tokens"
```

### Task 6: Floaters — Dialog, Dropdown, MultiSelectDropdown

**Files:** Modify `src/shared/components/ui/Dialog.tsx`, `Dropdown.tsx`, `MultiSelectDropdown.tsx`

**Interfaces:** `Dialog` props + focus-trap + aria GIỮ NGUYÊN (Task 17/18 phụ thuộc).

- [ ] **Step 1:** `Dialog`: panel `bg-surface-elevated rounded-dialog shadow-elevated` (nổi thật → shadow hợp lệ), overlay `bg-black/60` (scrim, không gradient), 1 transition (giữ `zoom-in-95` hoặc `fade-in` hiện có — chỉ 1 loại). Mobile: full/bottom-sheet theo `§blueprint` modal. Bỏ mọi `rounded` khác về `rounded-dialog`.
- [ ] **Step 2:** `Dropdown` + `MultiSelectDropdown`: menu `bg-surface-elevated border border-border rounded-card shadow-elevated z-50` (giữ); trigger bỏ ring/shadow khi chưa mở (`Dropdown.tsx:161` — bỏ `shadow-premium`); item active `bg-primary/10 text-primary`, không gradient.
- [ ] **Step 3:** lint.mjs 3 file + typecheck/lint/build + commit `style(ui): restyle dialog and dropdown primitives`.

### Task 7: Pickers — DatePicker, TimePicker

**Files:** Modify `src/shared/components/ui/DatePicker.tsx`, `TimePicker.tsx`

- [ ] **Step 1:** Panel lịch `bg-surface border border-border rounded-card shadow-elevated p-4` (DatePicker:222, TimePicker:154 — shadow nổi hợp lệ, bỏ `border-default` hairline nếu thuần phân cách → tone `border`); ngày hiện tại `bg-primary text-on-primary`; ngày được chọn `text-primary font-semibold`; tuần `tabular-nums`; header tháng không eyebrow; nút prev/next = `IconButton` style.
- [ ] **Step 2:** Input gốc: `bg-surface border border-border rounded-control`, focus theo token `--color-focus`. GIỮ onChange/value props.
- [ ] **Step 3:** lint.mjs 2 file + verify + commit `style(ui): restyle date and time pickers`.

### Task 8: Aux states — PageHeader, Loading, SkeletonCard, EmptyState, ErrorState, ScrollToTop

**Files:** Modify `src/shared/components/ui/{PageHeader,Loading,SkeletonCard,EmptyState,ErrorState,ScrollToTop}.tsx`

- [ ] **Step 1:** `PageHeader`: title là `h1` ≤2 dòng (kèm prop còn lại giữ); bỏ pill/eyebrow nếu có. `SkeletonCard`: `bg-surface animate-pulse` (bỏ gradient pulse nếu có). `EmptyState`/`ErrorState`: headline ≤2 dòng + 1 câu + nút retry/CTA; icon tối giản `text-text-secondary`, không emoji, không illustration trang trí; chữ ≥16px full ink. `Loading`: spinner `border-primary`. `ScrollToTop`: `bg-surface border border-border` nổi thật → `rounded-control shadow-elevated` ok.
- [ ] **Step 2:** lint.mjs 6 file + verify + commit `style(ui): restyle state and utility components`.

### Task 9: Feedback — ToastContainer, AlertContainer, SplashScreen, ErrorBoundary

**Files:** Modify `src/shared/components/feedback/{ToastContainer,AlertContainer,SplashScreen,ErrorBoundary}.tsx`

- [ ] **Step 1:** Toast: `bg-surface-elevated border border-border rounded-card shadow-elevated` (đã gần đúng — chỉ đổi token theo sheet); variant success/danger dùng `--color-success/danger`. Alert: nền `bg-success/10 text-success` (hoặc danger/warning/info), **không** icon emoji; radius `rounded-control`. ErrorBoundary: màn lỗi = EmptyState pattern (headline ≤2 dòng + nút reload).
- [ ] **Step 2:** `SplashScreen`: GIỮ Lottie + `splashPolicy.ts`; đổi màu background/logo theo token mới (`bg-background`, Lottie colors nếu hardcode hex trong props — sửa hex → giá trị Appendix).
- [ ] **Step 3:** lint.mjs 4 file + verify + commit `style(ui): restyle feedback and splash components`.

**Stage gate 2 (sau Task 9):** `npm run typecheck && npm run lint && npm run format:check && npm run build && npm test` xanh; `lint.mjs src/shared` 0 FAIL; tay: mở Dropdown/Dialog/DatePicker/Toast trong app — đúng tokens, không còn `shadow-premium` ở vị trí nghỉ. Commit gate nếu có fixup.

---

# CHẶNG 3 — Các màn

Pattern chung mỗi task màn: (1) đọc file + blueprint `§blueprint.<role>` tương ứng; (2) rebuild JSX theo blueprint, GIỮ import hooks/stores/services, props, data flow, aria, test ids nếu có; (3) áp house rules (headline ≤2 dòng, 1 dominant thing, không card-grid trùng lặp, full-ink text ≥16px, poster `aspect-2/3`); (4) banned-class clean-up; (5) lint.mjs file màn + typecheck/lint/build + commit.

### Task 10: MovieCard (shared media item)

**Files:** Modify `src/features/movies/components/MovieCard.tsx` (+ file phụ cùng folder đang export poster/Card dùng chung — liệt kê khi đọc folder, tối đa `src/features/movies/components/*` còn lại KHÔNG gồm modal)

**Interfaces:** Produces: MovieCard props giữ nguyên — dùng lại ở Task 11/13.

- [ ] Poster `aspect-2/3 object-cover` corners theo sheet (media square nếu blueprint nói square), thiếu poster → placeholder phẳng theo tokens (không icon chung chung); title 2 dòng clamp (`line-clamp-2`), năm `tabular-nums`; hover: feedback nhẹ (opacity/underline — KHÔNG `hover:scale-105`, không shadow khi nghỉ); bỏ `center-card-glow` nếu còn.
- [ ] lint.mjs + verify + commit `feat(ui): restyle movie card`.

### Task 11: Dashboard

**Files:** Modify `src/features/dashboard/pages/DashboardPage.tsx`, `src/features/dashboard/components/*.tsx` (DashboardFilters 355 dòng re-skin tại chỗ)

- [ ] **Hero theo `§blueprint.showcase`:** backdrop tràn viền (`w-full aspect-[16/7] md:aspect-[21/9] object-cover`, `fetchpriority="high"` giữ nếu có), scrim `bg-gradient-to-t from-background` DUY NHẤT chỗ này (scrim exception), headline `h1` ≤32 ký tự, 1 câu phụ, 1 nút `bg-primary`. Nếu code hiện fetch phim nổi bật khác → giữ logic fetch, chỉ đổi render.
- [ ] **Rails:** mỗi rail 1 geometry khác (theo blueprint): rail chuẩn (poster + title), rail có số hạng (`tabular-nums` cỡ lớn), rail "Sắp ra mắt" list ngày. Bỏ card bọc rail, heading `h2` thường (không eyebrow), horizontal scroll giữ `snap-x`.
- [ ] **DashboardFilters:** rows phẳng, input `bg-surface border border-border rounded-control` (dòng 91 bỏ `shadow-premium` + `ring-1 ring-black/5`), dropdown panel float (dòng 128) giữ shadow-elevated.
- [ ] States: skeleton rail, empty library, error retry (dùng primitives Task 8).
- [ ] lint.mjs `src/features/dashboard` + verify + commit `feat(ui): rebuild dashboard per taste blueprint`.

### Task 12: Search + Person detail

**Files:** Modify `src/features/search/pages/SearchPage.tsx`, `PersonDetailPage.tsx`, `src/features/search/components/*.tsx` (SearchFilters, person/*)

- [ ] SearchPage: không hero — ô tìm kiếm statement (`text-2xl md:text-3xl` input hoặc visually lớn) trên cùng, filter rows phẳng/segmented (`SearchFilters:97` bỏ `shadow-premium`/`ring-black/5`; panel `:107` giữ float), grid poster `aspect-2/3` + `cv-auto` cho list dài, lazy below fold giữ.
- [ ] States: idle gợi ý, skeleton, no-result copy cụ thể ("Không tìm thấy phim nào khớp…"), error+retry.
- [ ] PersonDetailPage theo `§blueprint.about`: backdrop/poster fold + scrim; tên nhân vật `h1` ≤2 dòng; metadata rows `tabular-nums`; filmography list theo năm; **dòng 71/93/101 bỏ `shadow-premium`** → tone step + khoảng trắng; skeleton (`:71`) giữ animate-pulse.
- [ ] lint.mjs `src/features/search` + verify + commit `feat(ui): rebuild search and person detail screens`.

### Task 13: Albums + AlbumDetail

**Files:** Modify `src/features/albums/pages/AlbumsPage.tsx`, `AlbumDetailPage.tsx`, components trong folder

- [ ] AlbumsPage theo `§blueprint.list`: spec-sheet rows — poster nhỏ (w-16 aspect-2/3) + tên album + meta (số phim `tabular-nums`) + chevron; heading dẫn dắt `h1`/`h2`; **dòng 74 bỏ `shadow-premium`, dòng 107 nút primary bỏ `shadow-premium hover:shadow-premium-hover`** → `hover:bg-primary-hover`; không card-in-card, không hairline giữa rows (dùng space + tone step nếu cần).
- [ ] AlbumDetailPage: hàng phim theo thứ tự với số thứ tự `tabular-nums text-2xl font-display`, phim đầu poster lớn; actions phẳng 1 fill; **dòng 71/89/140 bỏ `shadow-premium`/`shadow-lg`**.
- [ ] States: album trống, đang tải, error.
- [ ] lint.mjs `src/features/albums` + verify + commit `feat(ui): rebuild albums screens as spec sheets`.

### Task 14: Calendar

**Files:** Modify `src/features/calendar/pages/ReleaseCalendarPage.tsx`, `src/features/calendar/components/*.tsx` (CalendarGrid)

- [ ] List theo ngày: khối ngày có heading ("Hôm nay", "Tuần tới", ngày `dd/MM` `tabular-nums`), mỗi phim 1 dòng (poster nhỏ + tên + ngày `tabular-nums`); 1 ảnh chủ đạo backdrop phim gần nhất mở đầu trang (full-bleed + scrim nếu đè chữ).
- [ ] CalendarGrid (nếu trang dùng lưới tháng): ô phẳng `bg-surface`, ngày `tabular-nums`, ngày phát hành `bg-primary/10 text-primary`; **dòng 88 bỏ `shadow-premium`** → `ring-1 ring-primary` là đủ (selected state, không nghỉ).
- [ ] lint.mjs `src/features/calendar` + verify + commit `feat(ui): rebuild release calendar as day list`.

### Task 15: Stats

**Files:** Modify `src/features/stats/pages/StatsPage.tsx`, components folder

- [ ] Dominant: 2–4 con số cỡ statement (`text-5xl md:text-6xl font-display tabular-nums text-text-primary`), label `text-sm text-text-secondary` thường (không eyebrow, KHÔNG mono class); **dòng 47 bỏ `shadow-elevated` card** → tách bằng tone `bg-surface` hoặc khoảng trắng.
- [ ] Chart: 1 field màu bẹt `bg-primary/10` hoặc `bg-surface`, bars/lines `bg-primary` phẳng, KHÔNG gradient, KHÔNG grid-line (hoặc grid tối đa 2 đường tone `border-border` nếu readability bắt buộc — ghi lý do), legend sentence case. GIỮ dữ liệu/hook hiện có.
- [ ] lint.mjs `src/features/stats` + verify + commit `feat(ui): rebuild stats with statement numbers`.

### Task 16: Profile

**Files:** Modify `src/features/profile/pages/MemberProfilePage.tsx`, `src/features/profile/components/*.tsx` (OwnProfileEditor 476 dòng — RE-SKIN tại chỗ, không viết lại form logic)

- [ ] MemberProfilePage: tên thành viên `h1` full-width cỡ display (≤2 dòng), rows phẳng cho thông tin (`text-text-secondary` label + `text-text-primary` value, tabular cho số), poster phim của thành viên dạng rail.
- [ ] OwnProfileEditor: re-skin từng section — inputs `bg-surface border border-border rounded-control`, **dòng 298 bỏ `shadow-elevated`** (nút floating chọn avatar — nếu thật sự nổi khi mở thì giữ, khi nghỉ thì bỏ → chuyển thành `border border-border` phẳng), dropdown `:308` giữ `shadow-elevated` (menu thật sự nổi), preview avatar vòng `rounded-full`. GIỮ toàn bộ state/handlers.
- [ ] lint.mjs `src/features/profile` + verify + commit `feat(ui): restyle profile screens`.

**Stage gate 3 (sau Task 16):** `npm run typecheck && npm run lint && npm run format:check && npm run build && npm test` xanh; `lint.mjs src` 0 FAIL (toàn source tính đến lúc này); tay: login → đi hết 7 màn, mỗi màn 2 mode, 375px + 1440px — mỗi màn 1 dominant thing, không còn class vi phạm (grep đếm):

```bash
grep -rn "shadow-premium\|shadow-glass\|hover:scale-105\|transition-all\|backdrop-blur" src/ | grep -v "index.css"
```

Expected: 0 dòng (các chỗ float dùng `shadow-elevated` là hợp lệ). Fix hết mới qua chặng 4.

---

# CHẶNG 4 — Modals + Motion + States + Gate cuối

### Task 17: MovieDetailModal

**Files:** Modify `src/features/movies/components/MovieDetailModal.tsx` (388 dòng — re-skin render, GIỮ logic)

- [ ] Fold theo `§blueprint.about`: backdrop full-bleed + scrim fade xuống content; tên phim `h1` ≤2 dòng; metadata rows phẳng (điểm số/năm/thể loại — số `tabular-nums`); cast rail ngang (poster nhỏ `aspect-2/3`); sections có `h2`; actions 1 fill `bg-primary` + outline phụ. GIỮ focus-trap/aria/lazy loading/`movieDetailStore`.
- [ ] Mobile: bottom-sheet/fullscreen 1 transition (dùng pattern Dialog Task 6). Border/radius từ tokens.
- [ ] lint.mjs + verify + commit `feat(ui): rebuild movie detail modal fold`.

### Task 18: AddMovieModal + add-movie sections

**Files:** Modify `src/features/movies/components/AddMovieModal.tsx` (443 dòng), `src/features/movies/components/add-movie/*.tsx`

- [ ] RE-SKIN từng section con tại chỗ (PosterPreview, AlbumSection, các form row) — KHÔNG viết lại logic submit/validation/search. Thay class: inputs `bg-surface border border-border rounded-control`; **`PosterPreview.tsx:13` bỏ `shadow-card/hover:shadow-elevated`** → `border border-border` phẳng; **`AlbumSection.tsx:87` bỏ `shadow-lg shadow-primary/20 hover:shadow-premium`** → `hover:bg-primary-hover`; bỏ `center-card-glow` còn sót.
- [ ] Steps/sections của form: heading `h2` thường, không index 01/02 (nếu hiện có "Bước 1" dạng số trang trí → đổi thành mô tả thật hoặc `<ol>` thật), không eyebrow.
- [ ] Modal shell dùng Dialog primitive (Task 6) nếu đang tự render — nếu đang dùng riêng thì tối thiểu đồng bộ tokens.
- [ ] lint.mjs 2 nhóm file + verify + commit `feat(ui): restyle add movie form`.

### Task 19: RandomPicker + MemberSearch + modal còn lại

**Files:** Modify `src/features/movies/components/RandomPickerModal.tsx`, `src/features/movies/components/random-picker/*.tsx` (PickerWheel), component MemberSearch (tìm vị trí bằng grep `MemberSearch`), AlbumSelector nếu có trong `src/features/movies/components`

- [ ] RandomPicker: GIỮ bánh xe logic + confetti (canvas confetti — đổi màu theo `--color-primary/--color-danger` của Appendix nếu hardcode); paint lại theo tokens; đây là **live thing** của app — làm cho nó "chơi được": nút chính `bg-primary`, feedback spin (giữ `pulse-soft`/`card-float` keyframes đang có — 2 keyframe này là hiệu ứng chủ đích, không banned). Wheel colors: dải phẳng xen kẽ `bg-surface`/`bg-surface-elevated` + accent, không gradient.
- [ ] MemberSearch + AlbumSelector: re-skin rows (poster nhỏ + tên), input theo tokens, menu float `shadow-elevated`.
- [ ] lint.mjs + verify + commit `feat(ui): restyle random picker and member modals`.

### Task 20: Motion layer

**Files:** Modify `src/index.css` (token motion), các component có entrance (Dashboard hero/rails, Search results, Detail fold, Stats numbers)

**Interfaces:**
- Consumes: Appendix `§signature-move`.
- Produces: helper pattern entrance — dùng trực tiếp framer-motion (đã có dependency):

```tsx
// pattern cho entrance section (dùng khi build mỗi section)
<motion.section
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-10%' }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
>
  {/* heading → text → picture: stagger bằng delay 0 / 0.06 / 0.12 */}
</motion.section>
```

- [ ] **Step 1:** `§signature-move` (vd: hero backdrop rise khi vào trang) — implement 1 chỗ: Dashboard hero. Chỉ `transform`/`opacity`.
- [ ] **Step 2:** Entrance stagger 60–90ms (delay 0/0.06/0.12) cho heading/text/picture mỗi section chính (Dashboard rails, Search results, Detail fold, Stats). `once: true`. Content KHÔNG bị ẩn nếu script fail → đặt `initial` chỉ khi framer-motion render được (component `motion.*` — không CSS ẩn trước).
- [ ] **Step 3:** Feedback mọi control: `active:scale-[0.98]` cho button/nút bấm (transition transform 150ms), hover underline/opacity cho links, poster hover `brightness-105`? → dùng opacity 0.9↔1 thay scale. Cấm `transition-all`.
- [ ] **Step 4:** 1 moving picture: hero backdrop `motion.div` scale 1→1.03 slow loop hoặc parallax nhẹ `useScroll`+`useTransform` (Dashboard hero).
- [ ] **Step 5:** Reduced motion — framer-motion tự tôn trọng `prefers-reduced-motion` nếu dùng `useReducedMotion()`; thêm:

```tsx
const reduce = useReducedMotion();
// reduce === true → bỏ y/scale, chỉ opacity, duration ≤ 0.15
```

Rules toàn cục `@media (prefers-reduced-motion: reduce)` trong index.css đã có (giữ).

- [ ] **Step 6:** Verify: DevTools emulate reduced-motion → content hiện đủ, không travel. `npm run build` + commit `feat(ui): add motion layer with reduced-motion fallback`.

### Task 21: States audit

**Files:** tùy file phát hiện (sửa tại chỗ)

**Interfaces:** Consumes: primitives EmptyState/ErrorState/Loading (Tasks 8–9).

- [ ] **Step 1:** Với 9 route + 6 modal, đối chiếu checklist — mỗi màn phải có: initial/skeleton · empty (copy thật) · populated · no-result · error+retry · offline · auth-fail · disabled/submitting. Ghi bảng `màn × state` (có/ thiếu) vào report nháp.
- [ ] **Step 2:** Thiếu state nào → thêm tại chỗ bằng primitives (không viết component mới): skeleton = `SkeletonCard`/`animate-pulse`, empty = `EmptyState`, error = `ErrorState` + nút retry gọi lại fetch hiện có. Đảm bảo disabled/submitting trên mọi nút async (`disabled:opacity-40`).
- [ ] **Step 3:** Edge data: thiếu poster TMDB (placeholder phẳng), title 200 ký tự (`line-clamp`), năm 0/undefined (`—`), ngày phát hành đã qua (badge "Đã phát hành" text thường, không pill eyebrow).
- [ ] **Step 4:** verify + commit `feat(ui): complete loading empty and error states across screens`.

### Task 22: DESIGN.md + Gate cuối + Report

**Files:** Modify `DESIGN.md`, `docs/superpowers/specs/...-design.md` (Appendix kết quả cuối), report (commit message / tóm tắt cho user)

- [ ] **Step 1: Rewrite `DESIGN.md`** thành design system doc: bảng tokens (tên key + giá trị 2 mode từ Appendix), type scale, radius/spacing, danh sách primitives + quy tắc dùng, house rules, motion tokens. (Thay guideline chung hiện tại — nội dung guideline chung đó đã có trong AGENTS.md.)
- [ ] **Step 2: Gỡ key shadow không dùng** — nếu `grep -rn "shadow-card\|shadow-glass\|shadow-premium" src/ | grep -v index.css` = 0 thì xóa key corresponding trong `index.css` (giữ `--shadow-elevated` vì floaters dùng).
- [ ] **Step 3: Gate tự động**

```bash
npm run typecheck && npm run lint && npm run format:check && npm run build && npm test
node .agents/skills/design-taste-frontend/scripts/lint.mjs src
```

Expected: tất cả xanh, lint.mjs 0 FAIL.

- [ ] **Step 4: Inspect + critique** (3 viewport, 2 mode)

```bash
npm run dev
node .agents/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:3000
```

Lưu ý: app cần đăng nhập — inspect nhiều khả năng chụp màn login. **Fallback bắt buộc:** nếu inspect không đăng nhập được, chụp tay màn đã đăng nhập bằng browser ở 1440/768/390 × dark/light (ít nhất: Dashboard, Search, AlbumDetail, Stats, MovieDetail modal, Login), lưu vào `.taste-skill/inspect/`, rồi critique theo `references/critique.md`. Ghi vào report: inspect chạy được hay fallback.

- [ ] **Step 5: Critique tối đa 3 vòng** — chấm theo rubric `critique.md`, sửa top-3 vấn đề, chụp lại, lặp. Mỗi vòng ghi 1 dòng vào report.
- [ ] **Step 6: Matrix tay** — 320/375/768/1024/1440 × dark/light; flow: login → CRUD phim → random picker → albums → calendar → stats → profile. Ghi lỗi phát hiện vào report, sửa (commit fix).
- [ ] **Step 7: Report tasteskill** (trả lời user cuối plan): direction name + seed · mọi redraw + lý do · idea sentence · live thing · điểm critique vòng cuối + phần còn short · credits ảnh (nếu `assets.mjs` dùng) · sample content cần swap · inspect chạy hay fallback.
- [ ] **Step 8: Commit**

```bash
git add DESIGN.md docs/
git commit -m "docs: rewrite design system guide and record rebuild report"
```

---

## Self-Review (plan ↔ spec)

- **Spec coverage:** §1 → Task 1–2 (draw, tokens 2 mode, font, house rules global) · §2 shell → Task 3 + Task 4 · §3 màn chính → Task 10–12 (+17 detail modal) · §4 quản lý+modals → Task 13–16, 17–19, DESIGN.md → Task 22 · §5 motion/states/a11y → Task 20–21 (a11y nằm trong Global Constraints: aria/focus/skip-link giữ nguyên + contrast inspect đo) · §6 verify+chặng → stage gates 1–3 + Task 22 · non-goals → Global Constraints. Appendix placeholder → Task 1 điền trước Task 2.
- **Placeholder scan:** các `<...>` trong Task 2 là interface consume từ Appendix (Task 1 produce, có bước điền cụ thể + grep TBD) — không có "TBD/implement later/error handling" trôi nổi.
- **Type consistency:** `NAV_ITEMS` + `isNavItemActive` giữ chữ ký xuyên suốt; token keys Task 2 giống hệt key Task 3–21 dùng; MovieCard props giữ nguyên cho Task 11/13; Dialog props giữ cho Task 17/18.
