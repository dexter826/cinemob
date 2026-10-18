# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Commenting Rules

**Comment the "why", not the "what". Code shows what; comments explain intent.**

- Explain reasons, design decisions, and tradeoffs - not what the code literally does.
- Don't comment the obvious (e.g. `i++ // increment i`).
- Keep comments in sync with code - an outdated comment is worse than none.
- Use doc comments (JSDoc/docstring) for public APIs, classes, and modules.
- Never leave dead code as comments - use git history instead.
- Use TODO/FIXME deliberately, with context - don't overuse.
- Keep comments short, grammatical, and in Vietnamese (technical terms like hook, store, props, payload, cache stay in English).
- No internal process references: never cite specs, gates, or task numbers (`spec 2026-10-17`, `gate 7`, `Task 23`) - a comment must stand alone; `@deprecated` tags are the exception.
- No decorative design prose: don't describe how the UI looks ("warm paper", "gold ink", "editorial card") - keep only technical constraints (contrast ratios, no-shadow rules, layout contracts).
- Judge by the whole file: self-describing files (types, constant maps) should have no comments at all - a lone comment there is noise; comment density and style must stay consistent within a file and across sibling files.
- Prefer a line comment above the code at the same indent; trailing comments are rare exceptions. When you touch a file, leave it prettier-clean (`npx prettier --write`).
- DO NOT ADD ANY COMMENTS unless asked or required by the rules above.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
