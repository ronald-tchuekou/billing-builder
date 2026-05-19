# Dashboard Redesign — Design Spec
**Date:** 2026-05-19
**Scope:** Full app UI overhaul (shell + all feature pages)
**Stack:** Next.js 16, shadcn/ui (new-york), Tailwind v4, motion (framer-motion)

---

## 1. Decisions

| Decision | Choice |
|---|---|
| Aesthetic | Slate + Electric Indigo |
| Scope | Full app (shell + dashboard + clients + invoices + auth + profile/settings) |
| Sidebar | Fixed, always visible, 2 nav groups, ⌘K search, NavUser at bottom |
| Charts | Real DB data — monthly revenue, 12-month rolling window |
| Approach | dashboard-01 full adoption (shadcn block as foundation) |

---

## 2. Shell & Architecture

### shadcn installs
```
npx shadcn@latest add dashboard-01
npx shadcn@latest add sidebar chart command avatar
```

### Files modified
| File | Action |
|---|---|
| `src/components/dashboard/Sidebar.tsx` | Replace with adapted `AppSidebar` from dashboard-01 |
| `src/components/dashboard/Topbar.tsx` | Replace with header: breadcrumb + ⌘K trigger + user dropdown |
| `src/app/(dashboard)/layout.tsx` | Wrap in `SidebarProvider` + `AppSidebar` + `AnimatePresence` |
| `src/components/ui/motion.tsx` | New — reusable motion primitives |
| `src/services/invoices.ts` | Add `getMonthlyRevenue(userId, months)` |

### Sidebar structure
- **Logo area:** `public/billing-builder-icon.png` via Next.js `<Image>` (32×32) + "Billing Builder" wordmark
- **Search bar:** `⌘K` trigger → opens `Command` dialog (navigate to any page)
- **Group "Principal":** Dashboard · Factures · Clients
- **Group "Compte":** Profil · Paramètres
- **NavUser (bottom):** avatar (initials, indigo bg) · name · email · sign out

### Theme tokens (globals.css additions)
- Sidebar bg: `slate-900` (#0f172a)
- Active nav item: `indigo-600` (#4f46e5) bg, white text
- Main content bg: `slate-50`
- Primary accent: `indigo-500` (#6366f1)
- KPI highlight card: gradient `indigo-500 → violet-600`

---

## 3. Dashboard Page (`/dashboard`)

### KPI Cards (3-column row)
- **Factures totales** — large bold count + delta badge: count current month vs previous month (e.g. `+4 ce mois`)
- **Clients** — total client count + delta badge: new clients this month vs last month
- **Encours** — sum of (billed − paid) across all non-fully-paid invoices, indigo gradient card, larger font

### Revenue Chart
- Component: `ChartAreaInteractive` (from dashboard-01, adapted)
- Data: `getMonthlyRevenue(userId, 12)` — SQL `GROUP BY date_trunc('month', issue_date)`
- Chart: recharts `AreaChart` with gradient fill (indigo → transparent)
- Controls: segment 3M / 6M / 12M (client-side filter, no refetch)
- Interactive tooltip showing month + revenue total

### Recent Invoices Table
- 5 most recent, columns: `# · Client · Date · Montant · Statut`
- Status badge colors: `paid` = green · `pending` = amber · `overdue` = red
- Row hover: subtle indigo tint bg
- Invoice number = link to `/invoices/[id]`

### Animations
- KPI cards: staggered `fadeInUp` (0ms / 100ms / 200ms delays)
- Chart wrapper: `scaleY` 0.8→1 + `fadeIn` from bottom
- Table rows: staggered `fadeInLeft` (50ms between rows)
- Page title: `slideDown` + `fadeIn`

---

## 4. Feature Pages

### `/clients`
- Layout: responsive card grid (1 col mobile → 2 → 3 on xl)
- Card content: avatar initials · name · email · invoice count · total billed
- CTA: "Nouveau client" button → `Dialog` modal with existing `ClientForm`
- Card hover: `scale(1.01)` + elevated shadow (motion spring)
- Empty state: SVG illustration + animated text

### `/clients/[id]`
- Hero section: large avatar (indigo) · name · email · quick stats
- Invoices list: same table component as dashboard
- Edit: "Modifier" → inline dialog

### `/invoices`
- Full-width table — all invoices
- Columns: `# · Client · Date · Montant · Statut`
- Filter tabs: Tous · En attente · Payées · En retard (shadcn `Tabs`)
- Sort: by date or amount (toggle)
- CTA: "Nouvelle facture" (indigo button, top right)

### `/invoices/[id]`
- 2-column layout: invoice preview (left) + actions panel (right)
- Actions: Modifier · Télécharger PDF · Marquer payé
- Status badge prominent, top of actions panel

### `/invoices/new` + `/invoices/[id]/edit`
- Multi-section form: Infos générales → Lignes → Notes
- Line items: add/remove with motion `layout` animation (smooth reorder)
- Running total preview updates live

### Auth pages (`/auth/*`)
- Centered card layout
- Subtle glassmorphism card on slate gradient background
- Animate in: `fadeInUp` + blur 4px → 0

### Profile / Settings
- 2-column: secondary tab nav (left) + content (right)
- Tab switch: `crossfade` motion transition

---

## 5. Animation System

### Primitives — `src/components/ui/motion.tsx`
```tsx
<FadeInUp delay={0.1} />       // translateY 16px→0 + opacity
<FadeIn />                      // opacity only
<SlideIn direction="left" />    // translateX + opacity
<StaggerChildren stagger={0.05} /> // wraps children with stagger
<ScaleIn />                     // scale 0.95→1 + opacity
```

### Page transitions
- `AnimatePresence` on `{children}` in dashboard layout
- Key = `pathname`
- Exit: `opacity 0` + `y -8px` (100ms)
- Enter: `opacity 1` + `y 0` (200ms, ease-out)

### Micro-interactions
- All buttons: `whileHover={{ scale: 1.02 }}` + `whileTap={{ scale: 0.98 }}`
- Cards: `whileHover={{ y: -2 }}` + shadow transition
- Badge colors: CSS transition (not motion — avoids JS overhead)

### Performance rules
- `will-change: transform` only on actively animated elements
- `useReducedMotion()` check — skip all motion if user prefers reduced motion
- Hover-only states use CSS transitions, not motion
- motion used for: enter/exit, layout shifts, stagger sequences

---

## 6. Data Layer

### New query — `src/services/invoices.ts`
```ts
getMonthlyRevenue(userId: string, months: number): Promise<{ month: string; revenue: number }[]>
// SQL: SELECT date_trunc('month', issue_date) as month, SUM(amount) FROM invoices
//      JOIN invoice_items ON ... WHERE user_id = $1
//      GROUP BY 1 ORDER BY 1 DESC LIMIT $2
```

### No schema changes required
All data needed (invoices, items, payments, clients) already exists.

---

## 7. Dark Mode Toggle

- Toggle button in the topbar header (sun/moon icon)
- Uses `next-themes` (already installed) — `ThemeProvider` already in `Providers.tsx`
- `globals.css` already has `.dark` CSS vars — verify they work with Tailwind v4 `@custom-variant dark`
- Toggle persists in `localStorage` via next-themes
- Sidebar, cards, chart, badges all respect dark vars automatically via CSS custom properties

## 8. Out of Scope
- Real-time updates / websockets
- Invoice PDF template redesign
- Email template redesign
- New auth flows
