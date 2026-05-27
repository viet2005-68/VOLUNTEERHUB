# Frontend Codebase Notes

## App entry and providers
- `src/main.jsx` mounts the React app into `#root`.
- `src/App.jsx` wraps the app with TanStack Query, React Router, `NavbarProvider`, and `react-hot-toast`, then delegates route rendering to `src/routes/AppRouter.jsx`.

## Routing and access control
- `src/routes/AppRouter.jsx` owns the route tree.
- Public routes include landing `/`, signup, OAuth callbacks, unauthorized/banned states, complete profile, and settings.
- Protected routes are nested under `src/Layout/MainLayout.jsx` and guarded by `src/components/Protected/RequireRole.jsx`.
- Dashboard routes are role-specific inside `src/pages/DashBoard/DashboardShell.jsx`:
  - shared/user routes: overview, opportunities, badges, notifications, event manager.
  - manager routes: approve registration, mark completion, manager analytics, event manager detail tabs.
  - admin routes: event admin manager, user manager, export/report, admin analytics.

## Layout and navigation
- `src/Layout/MainLayout.jsx` is the authenticated shell. It handles ban/profile checks, fixed desktop header, mobile bottom nav, profile completion banner, notification permission prompt, and scroll-to-top.
- `src/components/Sidebar/NavBar.jsx` is the desktop/tablet navigation and account dropdown.
- `src/components/Sidebar/BottomNav.jsx` is the mobile navigation and manager create-event action.
- `src/pages/DashBoard/DashboardShell.jsx` wraps dashboard header/tabs and nested dashboard content.
- `src/pages/DashBoard/DashboardLayout.jsx` computes dashboard tabs from the authenticated user role.
- `src/components/Tabs.jsx/Tabs.jsx` is the shared tab renderer used for dashboard navigation.

## Styling architecture
- `src/index.css` is the app-wide style foundation and imports Tailwind plus Leaflet CSS.
- `src/pages/Landing/styles/agenceFoudre.css` contains the existing Agence Foudre landing visual system: Beni/Clash typography, fixed header/menu, animated hero, section/card primitives, and pink/green branding.
- Most application pages use Tailwind utility classes directly.
- Some areas use MUI components (`Pagination`, `Skeleton`, and occasional `sx`) and should be tokenized instead of replaced unless needed.

## Visual refactor source of truth
Use `docs/design.md` as the visual source of truth:
- Pale Canvas `#fff8f6` for page backgrounds.
- Deep Forest `#00522d` for primary text and grounded UI.
- Foudre Pink `#db3c8a` for strong accents, badges, headings, and selected states.
- Bubblegum Blush `#f29ebd` for softer CTA and decorative surfaces.
- Ash Whisper `#fce5df` for subtle panels/badges.
- Beni for large branded display headings.
- Clash Grotesk for body copy, forms, navigation, tabs, and UI details.

## Migration targets
Remove or replace these legacy visual patterns during refactor:
- Purple/blue gradients and animated gradient text.
- Gray/white default card systems when they should be Pale Canvas/Ash Whisper/Foudre blocks.
- Shadow-heavy elevation in cards, nav, modals, and dropdowns.
- Blue focus rings and selected states.
- Red/black CTAs that are not semantic errors.
- Lobster/Jost headline branding in favor of Beni/Clash Grotesk.

## High-traffic page clusters
Refactor and verify in this order:
1. Global foundation, landing CSS, shell, nav, tabs.
2. Dashboard pages and dashboard components.
3. Opportunities discovery and event cards/filters.
4. Manager event management and event detail management tabs.
5. Admin event/user/report surfaces.
6. Shared modals, forms, dropdowns, registration, banners.
7. Secondary pages: settings, profile, notifications, analysis, trending, event detail.

## Component styling cookbook
- Buttons: 10px radius, Clash Grotesk, strong color-block states; primary uses Bubblegum/Foudre Pink with Pale Canvas or Deep Forest text depending contrast.
- Circular actions: 50% radius, Bubblegum or Pale Canvas background, Deep Forest icon/text.
- Cards: 20px radius, no shadow, tokenized border/color blocks; highlighted content cards may use 25px radius and Foudre Pink or Deep Forest backgrounds.
- Badges: 10px radius, Foudre Pink/Pale Canvas for strong labels or Ash Whisper/Foudre Pink for subtle labels.
- Tabs/nav: pill-like tokenized surfaces, no shadow, selected state via Foudre Pink/Bubblegum contrast.
- Forms: Pale Canvas/Ash Whisper surfaces, Deep Forest labels/text, Foudre Pink focus ring/border.

## QA matrix
- `/` landing page: hero/menu/scroll animations, responsive layout, font loading.
- `/dashboard`: role-aware tabs, overview content, desktop/mobile shell.
- `/dashboard/opportunities` and `/opportunities`: filters, cards, pagination, loading/error states.
- `/dashboard/eventmanager`: manager search/filter/create/edit flow surfaces.
- `/dashboard/eventmanager/:id/...`: manager detail tabs and content panels.
- Admin dashboard routes: event manager, user manager, reports/export, analytics.
- Shared UI: modals, dropdowns, banners, notification prompt, bottom nav.
