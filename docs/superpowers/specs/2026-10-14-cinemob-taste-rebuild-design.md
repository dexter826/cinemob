# CineMOB — Design Spec: Đập đi xây lại giao diện theo design-taste-frontend

- **Ngày:** 2026-10-14
- **Trạng thái:** Chờ user review file
- **Chuẩn:** design-taste-frontend v2 (tasteskill) — adapted core, kèm brainstorming workflow
- **Phạm vi:** Chỉ lớp trình bày. Giữ nguyên route, store, service, hook, Firebase, TMDB cache, PWA.
- **Hướng triển khai:** Approach B — rebuild JSX từng màn theo blueprint, giữ nguyên logic (đã duyệt).
- **Ghi chú lịch sử:** Spec taste-rebuild trước (cùng ngày) bị xóa là "outdated"; spec này viết lại từ đầu, tận dụng các quyết định đã qua.

## 0. Các quyết định đã chốt (brainstorming)

| Câu hỏi | Quyết định |
|---|---|
| Phạm vi | A — chỉ lớp trình bày; không đổi UX flows, IA, code structure logic |
| Brand | A — bỏ emerald/Inter/Be Vietnam Pro; deal palette + type mới hoàn toàn qua `draw.mjs`; giữ wordmark "CineMOB" dạng text |
| Chế độ sáng/tối | B — giữ cả 2 mode; dark theo sheet, light tự thiết kế palette ấm riêng theo tỷ lệ sheet (không đảo màu dark); toggle mechanism giữ nguyên |
| Triển khai | A — một nhánh, chia chặng-commit, mỗi chặng xanh mới sang chặng sau |
| Mức độ tasteskill | B — adapted core: draw → idea → tokens → house rules → gate → critique → motion; bước copy/argument/live thing đổi nghĩa cho app |
| Phương án code | B — rebuild JSX từng màn theo blueprint, import lại hooks/stores/services; form phức tạp re-skin tại chỗ |

## 1. Art direction & Tokens

### Quy trình deal direction (Chặng 1, trước khi viết token)

1. **Subject inventory** 8–12 thứ chỉ CineMOB có: thư viện phim cá nhân chung của nhóm, poster/backdrop TMDB, modal xem phim, bánh xe random picker, lịch phát hành, album xếp hạng, "vừa xem / muốn xem", splash Lottie, thành viên (member search), thống kê nhóm.
2. `node <skill>/scripts/draw.mjs --sector entertainment --brief "<one line>" --sections <vai trò theo nhóm màn>` → deal 3 directions → chọn 1 theo direction nào mang được inventory (không chọn thứ quen thuộc) → deal full sheet.
3. **Redraw** mỗi lần phải có lý do (mâu thuẫn asset không tồn tại / brand constraint) và ghi vào report.
4. Vai trò sections ứng với nhóm màn: shell, dashboard-hero, search-rails, detail-fold, management-sheet, modal.
5. **Kết quả draw (direction name + seed, palette, type system, motion, blueprint từng section) được ghi vào Appendix của spec này ngay khi chạy xong**, trước khi code token.

### Idea sentence (bắt buộc — chốt cùng lúc với direction ở Chặng 1, ghi vào Appendix trước khi code token)

> Trên trang này, **[thứ thuộc về CineMOB]** trở thành **[thiết bị mà direction yêu cầu]**.

Ứng viên dẫn thân: **poster là vật liệu chính** — phóng to/crop làm motif, khung ảnh. Competitor test: Letterboxd/IMDb không có "thư viện phim của nhóm bạn".

### Tokens

- Palette/type từ sheet đặt trong `src/index.css` (`@theme`, Tailwind v4): 1 ground, 1 ink, 1 accent, fields. Màn chỉ dùng semantic token (`bg-surface`, `text-text-primary`…), cấm hex inline (13 chỗ `style={{` hiện có sẽ chuyển dần nếu là styling).
- **Light mode:** giữ tỷ lệ của sheet, tự thiết kế palette ấm riêng theo `references/colour.md`; token light trong selector light-theme; không đảo màu dark.
- Font mới theo sheet, nạp Google Fonts trong `index.html`; **không thêm dependency**.
- Splash Lottie và confetti RandomPicker: giữ hiệu ứng, paint lại theo tokens mới.

### House rules (toàn app)

headline ≤2 dòng mọi width · không eyebrow/pill above headline · không mono ngoài tabular numbers thật · không index 01/02 · không hairline trang trí (phân cách bằng tone step/khoảng trắng) · không gradient (chỉ scrim neutral trên backdrop) · không shadow khi nghỉ (chỉ menu/dialog thật sự nổi) · không glass/backdrop-blur/pill nav · không icon-topped feature cards / hàng card trùng lặp · không emoji/decorative shapes · tối đa 2 typeface · button 1 fill, radius quyết định 1 lần (vuông hoặc tròn, không "soft" 9–16px) · không styled accent word trong headline · không tiny uppercase letter-spaced labels.

## 2. Shell + Navigation

**Desktop (≥1024px):**
- Thanh phẳng: wordmark "CineMOB" trái · links (Thư viện, Tìm phim, Album, Lịch — **đưa `/stats` vào nav**, hiện bị thiếu) · phải: theme toggle + avatar menu.
- Nền solid ground, phân cách bằng tone step; active link = accent + weight, không bounce/scale.
- Container `max-w-7xl`, gutter 16–32px; khoảng cách section ≥120px desktop, trong-tranh nhỏ hơn giữa-tranh.

**Mobile (<768px):**
- Bottom nav 5 tab phẳng (Trang chủ, Tìm kiếm, Albums, Lịch, Cá nhân), nền solid, icon Lucide + label sentence-case, target ≥44px, safe-area inset; không pill nổi, không blur.
- Navbar desktop ẩn trên mobile.

**Giữ nguyên behavior:** skip-link, ScrollToTop, ErrorBoundary, Suspense, lazy modals (`addMovieStore`, `movieDetailStore`), keyboard nav account menu, `splashPolicy.ts`, route change không animate toàn màn.

**Footer:** designed close — tên CineMOB full width + credit TMDB, không sitemap dày.

**Login & 404:** re-skin theo sheet — Login 1 form tối giản, headline ≤2 dòng.

## 3. Màn chính (Dashboard, Search, Detail)

**Dashboard (`/`)** — mỗi block 1 composition khác hàng xóm:
- Hero backdrop tràn viền 1 phim (`fetchpriority=high`), scrim neutral, headline ≤32 ký tự + 1 câu phụ + 1 nút chính.
- Rails ngang dưới hero: Đang chiếu / Thịnh hành / Sắp ra mắt + thư viện cá nhân (Vừa xem, Muốn xem). Poster `aspect-2/3`; mỗi rail geometry khác nhau tùy blueprint (1 rail tiêu chuẩn, 1 rail có số hạng, 1 rail list ngày…).
- DashboardFilters: rows phẳng, bỏ card bọc.

**Search (`/search`)** — không hero, vào thẳng ô tìm kiếm:
- Ô tìm kiếm lớn (statement size), filter rows phẳng/segmented, kết quả poster `aspect-2/3` grid, lazy below fold.
- States: idle (gợi ý/empty có minh họa chữ), loading skeleton, no-result (copy cụ thể), error + retry.

**Detail — Movie (modal) & Person (`/person/:personId`)** — photographic fold:
- Backdrop full-bleed + scrim fade; tên phim headline ≤2 dòng; metadata rows phẳng, tabular figures.
- Cast rail ngang; sections có heading riêng; actions phẳng 1 màu fill.
- Modal desktop / fullscreen sheet mobile, 1 transition duy nhất, giữ aria + focus-trap.

**Chung:** mỗi màn 1 dominant thing; chữ chạy nền full ink ≥16px; thiếu poster → placeholder vẽ theo palette (không icon chung chung).

## 4. Màn quản lý + Modals

Mỗi màn 1 geometry riêng, cấm cùng 1 card-grid:

- **Albums:** spec-sheet rows — poster nhỏ + tên + meta + số phim, heading dẫn dắt, không card-in-card.
- **AlbumDetail:** hàng phim theo thứ tự xếp hạng, số thứ tự tabular-nums, poster lớn cho phim đầu; actions phẳng.
- **Calendar:** list theo ngày (khối ngày có heading "hôm nay / tuần tới"), ngày ra mắt dạng số tabular-nums, 1 ảnh chủ đạo mở đầu; không lưới ô lịch trừ khi blueprint yêu cầu.
- **Stats:** vài con số cỡ statement làm dominant, label thường (không eyebrow); chart = 1 field màu bẹt, không gradient/grid-line; legend sentence case.
- **Profile / OwnProfileEditor:** tên thành viên full-width statement, rows phẳng; editor re-skin tại chỗ, giữ logic form.
- **Modals** (AddMovie, RandomPicker, AlbumSelector, MemberSearch, MovieDetail fallback): desktop centered dialog primitive, mobile bottom-sheet; 1 transition duy nhất; AddMovieModal (443 dòng) re-skin từng section con, không viết lại form logic.
- **RandomPicker:** bánh xe + confetti giữ, paint lại theo palette — đây là "1 live thing" đặc trưng của app.
- **DESIGN.md** được viết lại thành design system doc mới (tokens, primitives, house rules) thay guideline chung hiện tại.

## 5. Motion + States + A11y

**Motion layer:**
- Signature move từ direction sheet (ghi tên cụ thể vào Appendix khi deal xong); ứng viên dẫn thân: hero backdrop rise/parallax nhẹ khi vào trang.
- Entrance từng section: heading → text → picture, stagger 60–90ms, rise 16–32px + opacity, trigger 1 lần (framer-motion `whileInView`).
- Feedback mọi control: press/hover/focus trên button, link, card, poster, bánh xe.
- 1 moving picture: backdrop drift chậm hoặc scale nhẹ trên hero.
- Chỉ transform/opacity; cấm `transition-all`, `hover:scale-105` toàn cục, bounce. `prefers-reduced-motion` → crossfade ≤150ms; content luôn hiện đủ khi script fail.

**States — mỗi màn đủ:** initial/skeleton · empty (copy thật) · populated · no-result · error + retry · offline · auth-fail · disabled/submitting. Edge: thiếu poster TMDB, dữ liệu dị (năm 0, title 200 ký tự), ngày phát hành đã qua.

**A11y:** focus visible theo accent token · focus-trap dialog giữ · skip-link giữ · contrast ink/ground ≥4.5:1 cả 2 mode (inspect đo, FAIL sửa) · alt text poster thật · IconButton có label · touch target ≥44px · safe-area giữ.

## 6. Verify + Chặng triển khai

**Nhánh:** một nhánh `rebuild/taste-ui`, 4 chặng-commit:

1. **Tokens + shell:** chạy draw, ghi Appendix, `index.css` tokens 2 mode, font mới `index.html`, rebuild Layout/Navbar/MobileBottomNav/Footer/Login/404. Verify: `typecheck + lint + build` + `inspect.mjs` shell.
2. **Shared primitives:** 15 UI components + feedback (Toast/Alert/Splash) re-skin. Verify: như trên + `lint.mjs`.
3. **Các màn:** Dashboard → Search/Person → Detail → Albums → Calendar → Stats → Profile. Verify: `lint.mjs` + `inspect.mjs` từng màn.
4. **Modals + motion:** AddMovie/RandomPicker/MovieDetail/AlbumSelector/MemberSearch, motion layer, states còn thiếu. Verify: toàn bộ.

**Gate cuối:**
- `npm run typecheck` · `npm run lint` · `npm run format:check` · `npm run build` · `npm test` — xanh.
- `lint.mjs` 0 FAIL toàn source; `inspect.mjs` 0 FAIL tại 1440/768/390.
- Critique theo `references/critique.md`, tối đa 3 vòng, sửa top-3 mỗi vòng.
- Matrix tay: 320/375/768/1024/1440 × dark/light; flow: login → CRUD phim → random picker → albums → calendar → stats → profile.
- Report tasteskill: direction name + seed, mọi redraw + lý do, idea sentence, live thing, ảnh credits (nếu có), sample content cần đổi.

**Tiêu chí thành công:** app chạy đủ flow như trước với giao diện mới; gate tasteskill 0 FAIL; critique đạt mức self-accept; không regression logic (typecheck/lint/build/test xanh).

## Non-goals

Không đổi Firestore schema, auth, rules, stores, hooks, services, PWA/sw, push scripts. Không thêm dependency. Không đụng `dist/`/`dev-dist/`. Không đổi route/IA. Không bịa proof (quotes, stats, press, logo).

## Appendix — Direction sheet

*(Điền ngay sau khi chạy `draw.mjs` ở Chặng 1: direction name + seed, palette 2 mode, type system, blueprint từng section, signature move, mọi redraw + lý do.)*
