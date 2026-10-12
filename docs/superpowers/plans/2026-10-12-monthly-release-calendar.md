# Monthly Release Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang Lịch dùng một bố cục lưới và danh sách, hiển thị tập phim đúng tháng hoặc ngày đang chọn.

**Architecture:** Tải dữ liệu tháng từ TMDB khi mở trang hoặc chuyển tháng; cache theo người dùng, tháng và fingerprint danh sách series. Hook sở hữu tháng/ngày từ URL; store sở hữu dữ liệu và trạng thái tải, chặn response cũ ghi đè tháng mới. Giữ các hàm lấy tập sắp chiếu hiện có cho caller khác, thay luồng calendar bootstrap bằng tải theo tháng tại trang.

**Tech Stack:** React 19, TypeScript 5.8, Zustand 5, React Router 7, Vite 6; Node test runner và TypeScript đang có trong repo.

**Spec:** Thiết kế đã được người dùng xác nhận trong chat, ghi lại tại mục “Thiết kế đã chốt” của tài liệu này.

## Thiết kế đã chốt

- Bỏ tab “Danh sách” và nút chuyển chế độ; giữ lưới lịch cùng danh sách chi tiết.
- Mở trang tại tháng hiện tại, chưa lọc ngày; đánh dấu hôm nay trong lưới.
- Hiện tất cả tập có ngày phát sóng trong tháng của các series TMDB đã lưu, kể cả tập đã chiếu và series đã kết thúc hoặc bị hủy.
- Bấm ngày để lọc danh sách; nút “Xem cả tháng” bỏ bộ lọc ngày.
- Chuyển tháng tải tháng mới, bỏ ngày đã chọn, cập nhật lưới và danh sách cùng phạm vi.
- “Hôm nay” trở về tháng hiện tại và chọn hôm nay.
- Trên điện thoại, danh sách nằm dưới lưới.
- Phân biệt “Đã phát sóng”, “Hôm nay”, “Sắp phát sóng” bằng ngày, không suy ra trạng thái đã xem của người dùng.
- Khi tháng tương lai không có tập: “Chưa có lịch phát sóng được công bố cho tháng này”.

## Global Constraints

- Chỉ series TMDB đã lưu; không thêm phim lẻ, tìm series toàn TMDB hay thay đổi thông báo push.
- Giữ React 19 + TypeScript và bố cục hiện có; không thêm dependency.
- Ngày phát sóng dùng YYYY-MM-DD theo TMDB; không tự cộng ngày hoặc quy đổi giờ phát sóng.
- Cache tháng có TTL 24 giờ, namespace mới độc lập với cache upcoming v4.
- Không cache kết quả lỗi hoặc thiếu dữ liệu như một tháng trống hoàn chỉnh.
- Không sửa generated output, secrets, hoặc code ngoài phạm vi cần thiết.

Các quyết định triển khai do agent đề xuất: chỉ mùa chính 1..number_of_seasons như phạm vi hiện tại, không thêm specials; đọc các mùa để không bỏ sót lịch quá khứ, giới hạn đồng thời 2 series × 3 mùa; giữ cache tháng trong localStorage. Thống kê đổi thành “Series”, “Tập trong tháng”, “Đã phát sóng”, “Sắp phát sóng”, luôn tính cả tháng kể cả khi chọn ngày; mục sắp phát sóng gồm hôm nay. Đây là quyết định để thống kê không còn phụ thuộc cửa sổ 30/60 ngày, chưa phải yêu cầu riêng do người dùng nêu.

## Review Focus

1. Chuyển từ ngày 31 sang tháng ngắn: luôn đến đúng tháng kế tiếp, bỏ ngày cũ.
2. Đổi tháng hoặc tài khoản khi request chưa xong: chỉ response đúng người dùng và tháng hiện hành được hiển thị.
3. Lịch sử ở mùa cũ và series Ended/Canceled: vẫn hiện tập đúng tháng, không giới hạn hai mùa gần nhất.
4. TMDB lỗi ở một mùa hoặc series: hiển thị lỗi/thử lại, không hiện empty state hoặc cache thành công giả.
5. URL có tháng/ngày/view cũ và thao tác Back/Forward: giao diện, URL và dữ liệu giữ cùng phạm vi.

## Files and Responsibilities

| File                                                   | Trách nhiệm thay đổi                                                                            |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `src/features/search/services/tmdb/tvService.ts`       | Thêm hàm đọc các tập trong khoảng ngày; giữ hàm upcoming hiện tại                               |
| `src/features/calendar/services/calendarService.ts`    | Tải series cho tháng, cache tháng, phân biệt lỗi với kết quả trống                              |
| `src/features/calendar/stores/releaseCalendarStore.ts` | Dữ liệu tháng, lỗi, request identity và reset                                                   |
| `src/app/useAppInit.ts`                                | Giữ đồng bộ movies/loading; bỏ tải upcoming calendar toàn cục                                   |
| `src/features/calendar/hooks/useReleaseCalendar.ts`    | Tải theo user/tháng/movies, điều hướng và lọc ngày, bỏ viewMode                                 |
| `src/features/calendar/pages/ReleaseCalendarPage.tsx`  | Một bố cục, wiring thống kê và lỗi/thử lại                                                      |
| `src/features/calendar/components/EpisodeList.tsx`     | Tiêu đề tháng/ngày, nút bỏ lọc, trạng thái phát sóng và empty/error                             |
| `src/features/calendar/components/CalendarStats.tsx`   | Thống kê theo tháng với tên/props đúng phạm vi                                                  |
| `tests/calendar/load-ts.mjs`                           | Test helper dùng TypeScript transpileModule + vm.SourceTextModule để nạp source và mock imports |
| `tests/calendar/monthly-calendar.test.mjs`             | Regression tests cho TMDB, cache và store                                                       |

Không đổi `CalendarGrid.tsx` trừ khi wiring prop bắt buộc; điều hướng tháng sửa ở hook.

### Task 1: Tải tập theo tháng và cache có phân biệt lỗi

**Interfaces:**

- Add `getTVShowEpisodesInRange(tvId: number, startDate: string, endDate: string, signal?: AbortSignal): Promise<TMDBEpisode[]>` in `tvService.ts`; inclusive YYYY-MM-DD bounds; throw when required TMDB details/season returns null.
- Add `fetchEpisodesForMonth(userId: string, movies: Movie[], monthKey: string): Promise<UpcomingEpisode[]>` in `calendarService.ts`; monthKey is YYYY-MM. Keep existing exports until consumers migrate.
- Consume existing `tmdbFetch`, `decodeTVDetails`, `decodeTVSeasonEpisodes`, `withLimit`, `UpcomingEpisode` and `createCalendarFingerprint`.

- [ ] Create the test helper and failing tests using real source modules with mocked TMDB/localStorage. Assertions: October contains 2026-10-01 and 2026-10-31, excludes 2026-09-30/2026-11-01; historical season 1 of a five-season Ended/Canceled series is included; missing air_date is excluded; returned episodes are sorted.
- [ ] Run `node --experimental-vm-modules --test tests/calendar/monthly-calendar.test.mjs`; expect failures for missing range/month exports.
- [ ] Implement the range reader: fetch details, enumerate main seasons, use `withLimit(..., 3)`, reject null season results, map decoded episodes and filter by inclusive date strings. Do not apply upcoming status or 60-day restrictions. Leave `getTVShowUpcomingEpisodes` and notification code intact.
- [ ] Implement month aggregation with `withLimit(..., 2)`, preserved title/poster/docId mapping and deterministic ordering. Reject any required series failure; do not silently replace it with an empty array. Vietnamese title enrichment failure may fall back to saved title.
- [ ] Add cache tests: repeat user/month/fingerprint uses cache; different user/month/fingerprint and expired entry fetch again; empty successful month is cached; failed request is not cached; storage exceptions still return fetched results. Implement versioned cache keys and the existing 24-hour TTL with these assertions.
- [ ] Run focused tests; expect zero failed tests. Run `npm run typecheck` and ESLint on changed source files; expect no errors.
- [ ] Commit only task files after checks: `feat(calendar): load and cache episodes by selected month`.

### Task 2: Store and navigation share one month scope

**Interfaces:**

- Replace calendar store `upcomingEpisodes` with `monthEpisodes: UpcomingEpisode[]`, add `monthKey: string | null` and `episodesError: string | null`.
- Replace calendar fetch action with `fetchMonthEpisodes(userId: string, movies: Movie[], monthKey: string): Promise<void>`; it consumes Task 1 `fetchEpisodesForMonth`.
- Preserve `movies`, `loading`, setters and `initializeForUser(userId: string)`. Remove initial-fetch flags/setters once their app callers are removed.
- Hook returns `currentDate`, `selectedDate`, `monthEpisodes`, `displayedEpisodes`, `episodesByDate`, `episodesError`, `retryEpisodes`, existing push/detail handlers and navigation; no `viewMode` or `setViewMode`.

- [ ] Add failing store tests with deferred promises: request A completes after B and cannot overwrite B; account reset invalidates in-flight requests; new month clears stale episodes/error; failed load exposes error; retry succeeds; empty movies clears episodes without network.
- [ ] Run focused tests and confirm new store assertions fail before implementation.
- [ ] Implement store action with request identity across starts and resets; only active request updates episodes, error or loading. Store the requested month key immediately, clear old data, and retain user-facing error text for retry.
- [ ] Remove global upcoming fetching from `useAppInit.ts`; keep syncing saved movies/loading. Load calendar in the hook when auth user, month key or movies changes after movies loading finishes. Reset/invalidate on account change/unmount so departed-page requests cannot update current state.
- [ ] Make URL the source of month/day state: absent month defaults to current month; selected date must belong to it; invalid inputs are ignored. Ignore/remove legacy `view=list`; preserve unrelated params. Change months using `new Date(year, month + delta, 1)`, deleting `date`; Today sets current month and today's date; clear date returns whole month. Fetch depends on month, not selected day.
- [ ] Replace 30-day filtering with selected-day filtering of `monthEpisodes`, otherwise all `monthEpisodes`; group by date as before.
- [ ] Run focused tests, typecheck and relevant lint; expect zero errors. Manually exercise Jan 31 → February, December → January, leap February, URL reload, Back/Forward, rapid next/prev and account switch; URL/header/list must agree.
- [ ] Commit only task files: `feat(calendar): synchronize month data and date navigation`.

### Task 3: One calendar layout and matching details

**Interfaces:**

- Page consumes Task 2 hook; grid keeps its existing props.
- `EpisodeList` drops `viewMode`, receives `currentDate: Date`, `episodesError: string | null`, `retryEpisodes: () => void` and existing date/episode props.
- `CalendarStats` receives `tvSeriesCount`, `monthEpisodesCount`, `airedEpisodesCount`, `upcomingEpisodesCount`, computed from the entire loaded month; today is included in upcoming, previous dates in aired.

- [ ] Remove view-toggle buttons and conditional grid rendering from page; always render existing responsive grid and details. Keep push action and series detail click behavior.
- [ ] Fix EpisodeList to use the previous calendar-mode sizing; title is `Tháng MM/YYYY` or selected date, reset button says “Xem cả tháng”. Display per-episode “Đã phát sóng”, “Hôm nay” or “Sắp phát sóng” using date strings. Do not label episodes watched.
- [ ] Present loading, error with “Thử lại”, and successful empty states separately; error must precede empty. Selected day empty: “Không có tập phim nào trong ngày này”. Current/past month empty: “Không có tập phim phát sóng trong tháng này”. Future month empty uses the exact spec copy. Preserve the no-series prompt.
- [ ] Update stats labels to the four month-based labels documented above; avoid global today/week counts derived from incomplete month data.
- [ ] Manual smoke at desktop and phone widths with fixtures or available saved series: only one view, details below grid on mobile, month/day filters agree, empty past/future/day messages differ, loading/error/retry work, historical and future badges are correct. Verify push toggle and series detail modal still work. Record any smoke check blocked by credentials as unverified.
- [ ] Run `node --experimental-vm-modules --test tests/calendar/monthly-calendar.test.mjs`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`; require zero failed tests, no type/lint errors, format passing and build success. Format only changed files if needed; report pre-existing failures separately.
- [ ] Review diff for approved scope and capture desktop/mobile screenshots when app access allows. Commit only task files: `feat(calendar): consolidate the monthly calendar view`.

## Self-review and Handoff

- Requirements map to Tasks 1–3; data scope, navigation, historical series and single layout all have explicit checks.
- Request ordering and failures have automated regression proof; React interactions have named manual checks without adding a UI test framework.
- Date strings avoid UTC conversion; month navigation starts on day 1 to avoid rollover.
- Cost limitation: the first uncached month can require many season calls for long-running series; month caching reduces repeat work. No claim of complete schedules beyond TMDB-published dates.
- Recommended execution: native (`executing-plans`), because these three tasks share interfaces and form one small feature; one independent review after implementation.
- Product code is unchanged at this planning stage.
