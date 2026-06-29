# Scout — Influencer Discovery (Wobb Vibe Coder Assignment)

Redesigned influencer search app. React 19 + TypeScript + Vite + Tailwind v4 + Zustand.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run lint      # eslint
npm run test      # vitest (formatters + shortlist store)
```

## What changed

### Bugs fixed
- **Engagement rate inflated 100x.** `ProfileDetailPage` multiplied the engagement fraction by `10000` instead of `100` (e.g. 2.46% rendered as "246.00%"). Fixed and locked in with a regression test in `src/lib/formatters.test.ts`.
- **Case-sensitive username search.** `filterProfiles` lowercased the full-name match but not the username match, so searching `"Mr"` wouldn't match a username containing `"mr"` in a different case. Both sides now lowercase consistently.
- **Triplicated, inconsistent follower-count formatter.** The same "1.2M / 3.4K" logic was reimplemented three times (`utils/formatters.ts`, inline in `ProfileCard`, inline in `ProfileDetailPage`), with subtly different rounding. Consolidated into one `formatCount` in `src/lib/formatters.ts`.
- **Dead, unused `SearchBar.tsx`.** Never imported anywhere — `PlatformFilter` had its own inline input. Removed.
- **Stale/dead click-counter state in `SearchPage`.** Leftover `clickCount` state updated via a stale closure (`setClickCount(clickCount + 1)`) and never rendered anywhere. Removed.
- **Missing `alt` text** on every profile image (accessibility failure for screen readers). Added descriptive `alt` on all `<img>` tags.
- **`target="_blank"` without `rel="noopener noreferrer"`** on outbound profile links — a tab-nabbing security smell. Fixed on every external link.
- **Non-responsive fixed-width card** (`w-[700px]`) that broke on mobile. Replaced with a responsive grid.
- **Recomputing the full search dataset on every render** (`extractProfiles` ran on each keystroke/re-render with no memoization). Wrapped in `useMemo` via a new `useProfileSearch` hook.
- **`react-beautiful-dnd` dependency** in `package.json` was incompatible with React 19 and failed to install. It wasn't used anywhere in the app — removed.

### State management — Zustand
There was no `Context` actually wired up in the starter code yet (the task description anticipates you'd reach for it for the shortlist feature). Built the shortlist directly in Zustand instead: `src/store/shortlistStore.ts`, with the `persist` middleware backing onto `localStorage` so the list survives a page refresh.

### "Add to List" feature
Fully implemented (`src/store/shortlistStore.ts` + `src/components/AddToListButton.tsx` + `src/components/ShortlistPanel.tsx`):
- Add/remove profiles from any card or the profile detail page
- Duplicate-proof: keyed by `platform:user_id`, so adding the same profile twice is a no-op
- A profile with the same `user_id` on two different platforms is treated as two distinct entries (deliberate — they're different accounts)
- Persistent shortlist rail (slide-over panel), opened from the header on every page, showing avatar, handle, platform, follower count, with quick remove and an external link
- Survives page refresh via `zustand/persist` → `localStorage`

### Redesign
Kept the visual identity intentional rather than templated:
- Dark UI (`#0b0b10` base) with a single warm-vermilion accent (`#ff5c39`) — picked specifically to avoid the two most common "AI-generated" defaults (acid-green-on-black, cream/serif)
- Sora (display) + Inter (body) + JetBrains Mono (for every number — followers, engagement, stats) so data reads as data
- Signature element: an **engagement heat bar** on every card — a thin gradient bar whose width is driven directly by `engagement_rate`, so the most decision-relevant metric for a brand manager is scannable at a glance, not just printed as text
- Responsive grid (1/2/3 columns), visible keyboard focus rings, `prefers-reduced-motion` respected, full keyboard support on cards (`role="button"`, `tabIndex`, Enter/Space handling)

### Code quality / structure
```
src/
  components/   # presentational + interactive UI
  pages/        # route-level components
  store/        # zustand stores
  hooks/        # useProfileSearch, useDebouncedValue
  lib/          # formatters.ts — single source of truth, +tests
  utils/        # dataHelpers.ts, profileLoader.ts
  types/        # shared TS types
```
- Search input debounced (150ms) before filtering, so typing doesn't re-filter the full list on every keystroke
- `AddToListButton` is one shared component used by both the card and the detail page, instead of two separate stub implementations
- Race condition guard in `ProfileDetailPage`: if you navigate between two profiles quickly, a stale fetch response can no longer overwrite the newer one

## Libraries added
- `zustand` — shortlist state + persistence
- `lucide-react` — icon set (replaces a bare `✓` text glyph for the verified badge, etc.)
- `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom` (dev) — unit tests

## Removed
- `react-beautiful-dnd` — unused, and incompatible with React 19 (failed `npm install` outright)

## Assumptions
- "Replace Context with Zustand" is interpreted as "use Zustand for the shortlist state" — no `Context` provider existed in the starter code to literally replace.
- Shortlist persistence uses `localStorage` (via `zustand/persist`), which satisfies "persistent after page refresh." A backend wasn't in scope.
- Engagement-rate ceiling for the heat-bar visualization (8%) is a reasonable-but-arbitrary choice for typical Instagram/YouTube/TikTok engagement; not derived from the dataset.

## Trade-offs
- No drag-to-reorder in the shortlist panel — `react-beautiful-dnd` was dropped (broken on React 19) and a maintained replacement wasn't worth pulling in for a "nice to have" given the deadline.
- No virtualization on the profile grid — the sample datasets are small (10 per platform); would revisit with `@tanstack/react-virtual` if the dataset were large.
- Tests cover the highest-risk logic (the engagement-rate bug, shortlist dedupe/persistence behavior) rather than full component coverage, given time constraints.

## Remaining improvements (given more time)
- E2E test for the full add → refresh → still-there flow (Playwright)
- Sort/filter the shortlist panel (e.g. by platform, by follower count)
- Empty/error states for the rare case a profile JSON is missing (currently shown, but could offer a retry)
- Deploy to Vercel and link the live URL here
