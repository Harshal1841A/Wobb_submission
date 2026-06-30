# Scout — Influencer Discovery (Wobb Vibe Coder Assignment)

**Live Demo:** [https://wobb-submission.vercel.app/](https://wobb-submission.vercel.app/)
**Repository:** [https://github.com/Harshal1841A/Wobb_submission](https://github.com/Harshal1841A/Wobb_submission)

Redesigned influencer search app. React 19 + TypeScript + Vite + Tailwind v4 + Zustand.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run lint      # eslint
npm run test      # vitest (formatters + shortlist store + api handlers)
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

- **AI Pitch Hallucination & Resiliency.** Confirmed that the LLM occasionally fabricated non-existent brand sponsorships (e.g., Clear Men, Binance) not present in source profile data. Added server-side output validation (`api/pitch.ts`) that verifies every mentioned brand against the profile's actual `brand_affinity` list, plus 3-attempt exponential backoff retries for transient rate-limit errors (`429`/`503`).
- **Broken & Out-of-Sync External Profile Images.** Several static image URLs across creator datasets returned `403 Forbidden` or `404 Not Found`, and individual creator profile dossiers (`src/assets/data/profiles/*.json`) contained stale CDN URLs that diverged from the verified search index (`src/assets/data/search/*.json`). Audited and synchronized all profile data files to working CDN URLs, and upgraded `<Avatar />` with a multi-tier fallback: direct URL → `unavatar.io` proxy → deterministic HSL initials avatar.
- **Misattributed Profile Picture Data.** Found that `src/assets/data/profiles/mrbeast.json` contained Charli D'Amelio's profile picture URL, corrupting MrBeast's avatar when viewing his detail dossier directly. Replaced with MrBeast's authentic picture URL from the verified search index.
- **Platform Parameter Routing & Fallback Failure.** Visiting `/profile/:username` directly without a `?platform=` query parameter caused `platform` to evaluate to `"unknown"`, displaying `"Unknown platform"` and silently defaulting actions (Shortlisting, AI Pitching, Similar Creators) to Instagram even for TikTok and YouTube creators. Upgraded `ProfileDetailPage` to inspect `user.type` to correctly derive the platform.
- **Route Navigation Scroll Position.** Navigating between creator profiles via the Similar Creators rail kept the viewport scrolled down. Added automatic scroll-to-top on route transition.

### State management — Zustand
There was no `Context` actually wired up in the starter code yet (the task description anticipates you'd reach for it for the shortlist feature). Built the shortlist directly in Zustand instead: `src/store/shortlistStore.ts`, with the `persist` middleware backing onto `localStorage` so the list survives a page refresh.

### "Add to List" feature
Fully implemented (`src/store/shortlistStore.ts` + `src/components/AddToListButton.tsx` + `src/components/ShortlistPanel.tsx`):
- Add/remove profiles from any card or the profile detail page
- Duplicate-proof: keyed by `platform:user_id`, so adding the same profile twice is a no-op
- A profile with the same `user_id` on two different platforms is treated as two distinct entries (deliberate — they're different accounts)
- Persistent shortlist rail (slide-over panel), opened from the header on every page, showing avatar, handle, platform, follower count, with quick remove and an external link
- Interactive sorting & filtering: filter shortlisted creators by platform or sort by follower count / recent additions
- Survives page refresh via `zustand/persist` → `localStorage`

### Redesign
Kept the visual identity intentional rather than templated:
- Dark UI (`#0b0b10` base) with a single warm-vermilion accent (`#ff5c39`) — picked specifically to avoid the two most common "AI-generated" defaults (acid-green-on-black, cream/serif)
- Sora (display) + Inter (body) + JetBrains Mono (for every number — followers, engagement, stats) so data reads as data
- Signature element: an **engagement heat bar** on every card — a thin gradient bar whose width is driven directly by `engagement_rate`, so the most decision-relevant metric for a brand manager is scannable at a glance, not just printed as text
- Resilient **Avatar System**: Built a dedicated `<Avatar />` component with `referrerPolicy="no-referrer"` for external CDNs and automatic fallback to a deterministic, name-seeded HSL gradient with creator initials when external URLs expire or fail to load.
- Responsive grid (1/2/3 columns), visible keyboard focus rings, `prefers-reduced-motion` respected, full keyboard support on cards (`role="button"`, `tabIndex`, Enter/Space handling)

### Wow Factor Features
- **Follower Growth Chart**: Interactive `recharts` line chart plotting historical follower trajectory with an average likes comparison toggle. Code-split via `React.lazy()` + `<Suspense>` to keep initial page load fast.
- **Paid-Post Performance Signal**: Visual commercial signal badge comparing paid vs. organic engagement scores.
- **Brand Affinity Chips**: Profile brand tags rendered clearly on creator detail pages.
- **Similar Creators Rail**: Horizontally scrollable mini-cards rail at the bottom of ProfileDetailPage with engagement heat bar and navigation fallback.
- **AI Creator Pitch Generator**: Serverless Vercel function proxying NVIDIA Nemotron (`nvidia/nemotron-3-ultra-550b-a55b`) LLM API (`api/pitch.ts`) with Vite dev middleware (`vite.config.ts`), local session caching, and inline error handling on `ProfileDetailPage`. Code-split via `React.lazy()` + `<Suspense>`.

### Motion Pass (Framer Motion)
Implemented restrained, purposeful UI animations gated by `useReducedMotion()` from `motion/react`:
- **Card & List Dynamics**: Subtly staggered reveal animations (`staggerChildren: 0.04s`) on the search result grid, smooth hover lift (`whileHover={{ y: -3 }}`), animated shortlist button swap icon (`AnimatePresence`), and animated engagement heat bar fill on mount (~400ms easeOut).
- **Shortlist Panel Transitions**: Slide-in/slide-out drawer animation (`initial={{ x: "100%" }}`), backdrop fade, and smooth list item enter/exit/reorder layout animations (`layout="position"`).
- **Pulse/Shimmer Skeletons**: Built a reusable `<Skeleton>` component (`src/components/Skeleton.tsx`) replacing bare spinners across `ProfileDetailPage`, `GrowthChart`, and `PitchButton` with a 1.5s infinite shimmer gradient. Added layout morphing (`layout`) for chart timeframe tabs and pitch generator expansion.
- **Route Transitions**: Wrapped main application routes in `App.tsx` with `<AnimatePresence mode="wait">` for clean cross-fade transitions (~150ms out, ~200ms in) between search and profile detail views.
- **Tasteful Polish**: Added an interactive **Copy Share Link** button on `ProfileDetailPage` with an animated morph from copy icon to checkmark on click (~150ms spring/fade), plus a subtle hover tilt/scale effect on the profile picture.

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
- **Strict Linter Audit & Effect Scheduling**: Passes `npm run lint` with 0 errors and 0 warnings. Synchronous state updates inside effect bodies (`react-hooks/set-state-in-effect`) are strictly prevented via `queueMicrotask` scheduling.

## Libraries added
- `motion` (`motion/react`) — Framer Motion for high-performance, accessible UI micro-interactions
- `zustand` — shortlist state + persistence
- `@hello-pangea/dnd` — drag-to-reorder in shortlist panel (React 19 compatible)
- `@tanstack/react-virtual` — window/container virtualization for profile grid
- `recharts` — follower growth & average likes chart visualization
- `lucide-react` — icon set (replaces a bare `✓` text glyph for the verified badge, etc.)
- `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom` (dev) — unit tests
- `@playwright/test` (dev) — headless end-to-end testing against dev/build server

## Removed
- `react-beautiful-dnd` — unused, and incompatible with React 19 (failed `npm install` outright)

## Assumptions
- "Replace Context with Zustand" is interpreted as "use Zustand for the shortlist state" — no `Context` provider existed in the starter code to literally replace.
- Shortlist persistence uses `localStorage` (via `zustand/persist`), which satisfies "persistent after page refresh." A backend wasn't in scope.
- Engagement-rate ceiling for the heat-bar visualization (8%) is a reasonable-but-arbitrary choice for typical Instagram/YouTube/TikTok engagement; not derived from the dataset.

## Trade-offs
- Drag-to-reorder in the shortlist panel is implemented using `@hello-pangea/dnd` (React 19 compatible) and lazy-loaded via `React.lazy()` (`ShortlistDragList`) so drag-and-drop code is only fetched when the shortlist panel is opened.
- Profile grid virtualization uses `@tanstack/react-virtual` when list size exceeds `VIRTUALIZE_THRESHOLD` (30). Below 30 items, standard grid rendering is preserved to avoid virtualization overhead.
- Removed a dashboard-level brand affinity filter dropdown: sample data only covers brand affinities for a handful of profiles, making a full-dataset dashboard filter confusing (most brand selections returned 1-2 results). Cut per the brief's preference for judgment over feature count. Detail-page brand affinity chips remain unaffected.
- Head-to-Head Creator Comparison (`CreatorCompareModal`): Added a 4-way side-by-side comparison modal directly accessible from the Dossier shortlist panel when 2 or more creators are selected. Automatically highlights the category winner (`BEST` tag) across followers, engagement rate, average views, and paid performance.
- Tests cover the highest-risk logic (the engagement-rate bug, shortlist dedupe/persistence behavior, AI pitch hallucination rejection, and modal comparison engine) with 100% passing unit tests (42/42 tests passing across 10 test suites) and critical user paths via Playwright E2E spec (`npm run test:e2e`).

## Remaining improvements (given more time)
- Exporting shortlisted creators to CSV / PDF brief format for client presentation
- Live social network API integration to replace static dataset snapshots

## Submission Links
- **Live Vercel Demo:** [https://wobb-submission.vercel.app/](https://wobb-submission.vercel.app/)
- **GitHub Repository:** [https://github.com/Harshal1841A/Wobb_submission](https://github.com/Harshal1841A/Wobb_submission)
