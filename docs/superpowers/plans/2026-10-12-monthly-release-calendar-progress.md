# Execution ledger — plan: 2026-10-12-monthly-release-calendar.md

- Baseline: npm test passed 3/3; branch codex/monthly-release-calendar.
- Ruling: Execute in the existing checkout on a separate feature branch — user selected direct execution; avoid copying dependencies to another checkout. No master changes or external publication.
- Pre-flight: Task 1 month fetch feeds Task 2 store; Task 2 month/date state feeds Task 3 page. Interfaces agree.
- Ruling: Keep progress beside the plan; adapt Bash-only workflow scripts to this Windows session. No product behavior impact.
- Tasks 1–3 implemented; 16 regression checks passed before removal of test files.
- User instruction: stop browser testing and remove newly created test files. Existing notification tests remain unchanged.
- Ruling: TMDB next_episode_to_air:null means no announced next episode, not invalid series data. Fix the existing decoder because historical/month loading includes ended series.
- Review: Today now writes an explicit month, including when a tab stays open across month boundaries.
- Review: Move month initialization into the same hook effect as fetching to avoid a parent bootstrap reset invalidating a child request.
- Ruling: Clear saved-movie readiness when switching accounts and sync calendar from the fresh movie-store snapshot; this prevents loading the previous account's movies under the new user cache key. Small necessary change to movieStore.ts beyond the original file map.
- Ruling: Remove the old calendar upcoming aggregator after all callers migrate; it became unused due to this change. Keep the TMDB upcoming reader and notification scripts.
- Final review: same inherited model; findings addressed. Direct account switches now clear movie loading readiness and the calendar checks activeUid/loading before fetching.
- Verification: npm test 3/3, npm run typecheck, npm run lint, npm run format:check, npm run build and git diff --check all passed. Impeccable detector returned no findings.
- Browser verification stopped at the user's request; full desktop/mobile smoke coverage is unverified.
- User approved committing the completed diff and merging codex/monthly-release-calendar into local master on 2026-10-12; no remote push requested.
