# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full UI overhaul of billing-builder — Slate + Electric Indigo theme, shadcn dashboard-01 shell, fixed sidebar with groups + ⌘K search, real revenue chart, dark mode toggle, motion animations across all pages.

**Architecture:** Replace existing `Sidebar.tsx` and `Topbar.tsx` with dashboard-01-based `AppSidebar` + `Header` wrapped in `SidebarProvider`. All pages animate in via shared motion primitives. Revenue chart queries DB directly in the server component.

**Tech Stack:** Next.js 16 (App Router), shadcn/ui new-york, Tailwind v4, motion (framer-motion), Drizzle ORM, next-themes (already installed), recharts (via shadcn chart).

**Spec:** `docs/superpowers/specs/2026-05-19-dashboard-redesign-design.md`

---

## File Map

| File | Action |
|---|---|
| `src/app/globals.css` | Modify — add Slate/Indigo theme tokens, sidebar CSS vars |
| `src/components/ui/motion.tsx` | **Create** — reusable motion primitives |
| `src/components/dashboard/AppSidebar.tsx` | **Create** — replaces `Sidebar.tsx` |
| `src/components/dashboard/NavUser.tsx` | **Create** — user dropdown at sidebar bottom |
| `src/components/dashboard/DashboardBreadcrumb.tsx` | **Create** — pathname-based breadcrumb |
| `src/components/dashboard/CommandPalette.tsx` | **Create** — ⌘K command dialog for navigation |
| `src/components/dashboard/Header.tsx` | **Create** — replaces `Topbar.tsx` |
| `src/components/dashboard/RevenueChart.tsx` | **Create** — recharts area chart |
| `src/components/dashboard/Sidebar.tsx` | **Delete** — replaced by AppSidebar |
| `src/components/dashboard/Topbar.tsx` | **Delete** — replaced by Header |
| `src/app/(dashboard)/layout.tsx` | Modify — SidebarProvider + AnimatePresence |
| `src/lib/db/queries.ts` | **Create** — server-side DB query helpers (getMonthlyRevenue, getDashboardStats) |
| `src/app/(dashboard)/dashboard/page.tsx` | Modify — KPI cards + chart + animated table |
| `src/app/(dashboard)/clients/page.tsx` | Modify — card grid with animations |
| `src/app/(dashboard)/clients/[id]/page.tsx` | Modify — hero + invoice list |
| `src/app/(dashboard)/invoices/page.tsx` | Modify — table + filter tabs |
| `src/app/(dashboard)/invoices/[id]/page.tsx` | Modify — 2-col layout + actions |
| `src/app/(dashboard)/invoices/new/page.tsx` | Modify — motion form |
| `src/app/(dashboard)/invoices/[id]/edit/page.tsx` | Modify — motion form |
| `src/app/(dashboard)/profile/page.tsx` | Modify — 2-col tab layout |
| `src/app/(dashboard)/settings/page.tsx` | Modify — 2-col tab layout |
| `src/app/auth/layout.tsx` | Modify — centered glass card layout |

---

## Task 1: Install shadcn components

**Files:** `package.json`, `src/components/ui/` (many new files)

- [ ] **Step 1: Install dashboard-01 block**

```bash
pnpm dlx shadcn@latest add dashboard-01 --overwrite
```

Expected: Creates `src/components/ui/sidebar.tsx` plus a demo page/components. Note which files were created — we will replace the opinionated demo components with billing-builder-specific ones.

- [ ] **Step 2: Install remaining components**

```bash
pnpm dlx shadcn@latest add sidebar chart command avatar breadcrumb tabs skeleton --overwrite
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: No errors (or only pre-existing errors unrelated to new installs).

- [ ] **Step 4: Remove dashboard-01 demo files**

Delete any generated demo pages or components that dashboard-01 created outside of `src/components/ui/`. Keep only the `ui/` primitives. Typical generated files to delete:
- Any `app/dashboard-01/` directory
- Any `components/app-sidebar.tsx`, `components/nav-*.tsx`, `components/team-switcher.tsx` generated at the `components/` root (we recreate these ourselves in `components/dashboard/`)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: install shadcn dashboard-01, sidebar, chart, command, avatar, breadcrumb, tabs, skeleton"
```

---

## Task 2: Theme tokens in globals.css

**Files:** `src/app/globals.css`

- [ ] **Step 1: Replace globals.css content**

Replace the entire file with:

```css
@import 'tailwindcss';

@custom-variant dark (&:is(.dark *));

@utility container {
  margin-inline: auto;
  padding-inline: 2rem;
  @media (width >= --theme(--breakpoint-sm)) {
    max-width: none;
  }
  @media (width >= 1400px) {
    max-width: 1400px;
  }
}

@theme {
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));

  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));

  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));

  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));

  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));

  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));

  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));

  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));

  --color-sidebar-background: hsl(var(--sidebar-background));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-sidebar-primary: hsl(var(--sidebar-primary));
  --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
  --color-sidebar-accent: hsl(var(--sidebar-accent));
  --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
  --color-sidebar-border: hsl(var(--sidebar-border));
  --color-sidebar-ring: hsl(var(--sidebar-ring));

  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}

@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentcolor);
  }
}

@layer base {
  :root {
    /* Main palette — light */
    --background: 210 40% 98%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;
    --secondary: 214 32% 91%;
    --secondary-foreground: 222 47% 11%;
    --muted: 214 32% 91%;
    --muted-foreground: 215 20% 45%;
    --accent: 214 32% 91%;
    --accent-foreground: 222 47% 11%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 239 84% 67%;
    --radius: 0.5rem;

    /* Sidebar — always dark regardless of theme */
    --sidebar-background: 222 47% 7%;
    --sidebar-foreground: 214 32% 91%;
    --sidebar-primary: 239 84% 67%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 222 47% 13%;
    --sidebar-accent-foreground: 214 32% 91%;
    --sidebar-border: 222 47% 13%;
    --sidebar-ring: 239 84% 67%;
  }

  .dark {
    --background: 222 47% 7%;
    --foreground: 214 32% 91%;
    --card: 222 47% 10%;
    --card-foreground: 214 32% 91%;
    --popover: 222 47% 10%;
    --popover-foreground: 214 32% 91%;
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;
    --secondary: 222 47% 14%;
    --secondary-foreground: 214 32% 91%;
    --muted: 222 47% 14%;
    --muted-foreground: 215 20% 55%;
    --accent: 222 47% 14%;
    --accent-foreground: 214 32% 91%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 0 0% 98%;
    --border: 222 47% 14%;
    --input: 222 47% 14%;
    --ring: 239 84% 67%;

    /* Sidebar dark — same dark palette */
    --sidebar-background: 222 47% 5%;
    --sidebar-foreground: 214 32% 85%;
    --sidebar-primary: 239 84% 67%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 222 47% 10%;
    --sidebar-accent-foreground: 214 32% 85%;
    --sidebar-border: 222 47% 10%;
    --sidebar-ring: 239 84% 67%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build 2>&1 | tail -20
```

Expected: Successful build.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: Slate + Electric Indigo theme tokens with sidebar dark vars"
```

---

## Task 3: Motion primitives

**Files:** Create `src/components/ui/motion.tsx`

- [ ] **Step 1: Create motion primitives file**

```tsx
"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import React from "react";

const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

interface MotionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeInUp({ children, delay = 0, duration = 0.4, className }: MotionProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, delay = 0, duration = 0.3, className }: MotionProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideInLeft({ children, delay = 0, duration = 0.35, className }: MotionProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      variants={slideInLeftVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0, duration = 0.3, className }: MotionProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerChildrenProps {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}

export function StaggerChildren({ children, stagger = 0.05, className }: StaggerChildrenProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={fadeInUpVariants} transition={{ duration: 0.35, ease: "easeOut" }}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export const MotionButton = motion.button;
export const MotionDiv = motion.div;
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | grep "motion.tsx"
```

Expected: No output (no errors in this file).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/motion.tsx
git commit -m "feat: add reusable motion animation primitives"
```

---

## Task 4: AppSidebar + NavUser components

**Files:**
- Create: `src/components/dashboard/AppSidebar.tsx`
- Create: `src/components/dashboard/NavUser.tsx`

- [ ] **Step 1: Create NavUser component**

```tsx
// src/components/dashboard/NavUser.tsx
"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, User, Settings } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function NavUser() {
  const router = useRouter();
  const { data } = useSession();
  const name = data?.user?.name ?? "Utilisateur";
  const email = data?.user?.email ?? "";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    await signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{name}</span>
                <span className="truncate text-xs opacity-60">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side="top"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-xs text-muted-foreground">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
```

- [ ] **Step 2: Create AppSidebar component**

```tsx
// src/components/dashboard/AppSidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, User, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/dashboard/NavUser";

const NAV_MAIN = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
] as const;

const NAV_ACCOUNT = [
  { href: "/profile", label: "Profil", icon: User },
  { href: "/settings", label: "Paramètres", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <Sidebar variant="sidebar" collapsible="none">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                  <Image
                    src="/billing-builder-icon.png"
                    alt="Billing Builder"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-sm">Billing Builder</span>
                  <span className="text-xs opacity-50">Gestion de factures</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_MAIN.map(({ href, label, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton asChild isActive={isActive(href)}>
                  <Link href={href}>
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Compte</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ACCOUNT.map(({ href, label, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton asChild isActive={pathname === href}>
                  <Link href={href}>
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
pnpm tsc --noEmit 2>&1 | grep -E "AppSidebar|NavUser"
```

Expected: No output.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/AppSidebar.tsx src/components/dashboard/NavUser.tsx
git commit -m "feat: AppSidebar with nav groups and NavUser dropdown"
```

---

## Task 5: DashboardBreadcrumb + Header with dark mode toggle

**Files:**
- Create: `src/components/dashboard/DashboardBreadcrumb.tsx`
- Create: `src/components/dashboard/CommandPalette.tsx`
- Create: `src/components/dashboard/Header.tsx`

- [ ] **Step 1: Create DashboardBreadcrumb**

```tsx
// src/components/dashboard/DashboardBreadcrumb.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type BreadcrumbEntry = { label: string; href?: string };

function getBreadcrumbs(pathname: string): BreadcrumbEntry[] {
  const segments = pathname.split("/").filter(Boolean);

  const labels: Record<string, string> = {
    dashboard: "Tableau de bord",
    clients: "Clients",
    invoices: "Factures",
    profile: "Profil",
    settings: "Paramètres",
    new: "Nouvelle facture",
    edit: "Modifier",
  };

  if (segments.length === 0) return [{ label: "Tableau de bord" }];
  if (segments.length === 1) return [{ label: labels[segments[0]] ?? segments[0] }];

  const crumbs: BreadcrumbEntry[] = [];

  // First segment (clients, invoices, etc.)
  const section = segments[0];
  crumbs.push({ label: labels[section] ?? section, href: `/${section}` });

  // Second segment (id, new)
  if (segments[1] === "new") {
    crumbs.push({ label: "Nouvelle facture" });
  } else if (segments.length >= 2) {
    // [id] or [id]/edit
    const action = segments[2];
    if (action === "edit") {
      crumbs.push({ label: "Détail", href: `/${section}/${segments[1]}` });
      crumbs.push({ label: "Modifier" });
    } else {
      crumbs.push({ label: "Détail" });
    }
  }

  return crumbs;
}

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

- [ ] **Step 2: Create Header with dark mode toggle + ⌘K command palette**

Also create `src/components/dashboard/CommandPalette.tsx`:

```tsx
// src/components/dashboard/CommandPalette.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, FileText, Users, User, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const PAGES = [
  { href: "/dashboard",    label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/invoices",     label: "Factures",         icon: FileText },
  { href: "/invoices/new", label: "Nouvelle facture", icon: Plus },
  { href: "/clients",      label: "Clients",          icon: Users },
  { href: "/profile",      label: "Profil",           icon: User },
  { href: "/settings",     label: "Paramètres",       icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 px-3 text-xs text-muted-foreground w-36 justify-between"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-1.5">
          <Search className="h-3 w-3" />
          Rechercher...
        </span>
        <kbd className="pointer-events-none hidden select-none items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] opacity-60 sm:flex">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher une page..." />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {PAGES.map(({ href, label, icon: Icon }) => (
              <CommandItem key={href} onSelect={() => navigate(href)}>
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

Then create `src/components/dashboard/Header.tsx`:

```tsx
// src/components/dashboard/Header.tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardBreadcrumb } from "@/components/dashboard/DashboardBreadcrumb";
import { CommandPalette } from "@/components/dashboard/CommandPalette";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <DashboardBreadcrumb />
      <div className="ml-auto flex items-center gap-2">
        <CommandPalette />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Basculer le thème"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
pnpm tsc --noEmit 2>&1 | grep -E "Breadcrumb|Header"
```

Expected: No output.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/DashboardBreadcrumb.tsx src/components/dashboard/CommandPalette.tsx src/components/dashboard/Header.tsx
git commit -m "feat: DashboardBreadcrumb, CommandPalette (⌘K), and Header with dark mode toggle"
```

---

## Task 6: Update dashboard layout + delete old components

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`
- Delete: `src/components/dashboard/Sidebar.tsx`
- Delete: `src/components/dashboard/Topbar.tsx`

- [ ] **Step 1: Rewrite dashboard layout**

```tsx
// src/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Header } from "@/components/dashboard/Header";
import { getServerSession } from "@/lib/helpers/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/login");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

- [ ] **Step 2: Delete old components**

```bash
rm /Users/roncoder/Projects/billing-builder/src/components/dashboard/Sidebar.tsx
rm /Users/roncoder/Projects/billing-builder/src/components/dashboard/Topbar.tsx
```

- [ ] **Step 3: Build to verify no broken imports**

```bash
pnpm build 2>&1 | tail -30
```

Expected: Successful build. If errors, they'll reference the deleted files — search the codebase for any remaining imports.

```bash
grep -r "from.*Sidebar\|from.*Topbar" src/ --include="*.tsx" --include="*.ts"
```

Fix any remaining references before proceeding.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: replace Sidebar/Topbar with SidebarProvider + AppSidebar + Header"
```

---

## Task 7: Monthly revenue DB query

**Files:** Create `src/lib/db/queries.ts`

- [ ] **Step 1: Create server-side query helpers**

```ts
// src/lib/db/queries.ts
import { db } from "@/lib/db";
import { invoices, invoiceItems, clients } from "@/lib/db/schema";
import { eq, sql, desc, and, gte } from "drizzle-orm";

export type MonthlyRevenue = { month: string; revenue: number };

export async function getMonthlyRevenue(
  userId: string,
  months = 12
): Promise<MonthlyRevenue[]> {
  const rows = await db.execute(sql`
    SELECT
      to_char(date_trunc('month', i.issue_date), 'YYYY-MM') AS month,
      COALESCE(SUM(ii.amount::numeric), 0)::float AS revenue
    FROM invoices i
    LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
    WHERE
      i.user_id = ${userId}
      AND i.issue_date >= date_trunc('month', now()) - (${months - 1} || ' months')::interval
    GROUP BY date_trunc('month', i.issue_date)
    ORDER BY date_trunc('month', i.issue_date) ASC
  `);
  return rows.rows as MonthlyRevenue[];
}

export type DashboardStats = {
  invoicesTotal: number;
  invoicesThisMonth: number;
  invoicesPrevMonth: number;
  clientsTotal: number;
  clientsThisMonth: number;
  clientsPrevMonth: number;
  outstanding: number;
};

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Separate queries — avoids cross-table join complexity with Drizzle
  const [invTotal] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(eq(invoices.userId, userId));

  const [invThisMonth] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(and(eq(invoices.userId, userId), gte(invoices.createdAt, startOfMonth)));

  const [invPrevMonth] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(
      and(
        eq(invoices.userId, userId),
        gte(invoices.createdAt, startOfPrevMonth),
        sql`${invoices.createdAt} < ${startOfMonth.toISOString()}`
      )
    );

  const [cliTotal] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clients)
    .where(eq(clients.userId, userId));

  const [cliThisMonth] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clients)
    .where(and(eq(clients.userId, userId), gte(clients.createdAt, startOfMonth)));

  const [cliPrevMonth] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clients)
    .where(
      and(
        eq(clients.userId, userId),
        gte(clients.createdAt, startOfPrevMonth),
        sql`${clients.createdAt} < ${startOfMonth.toISOString()}`
      )
    );

  // Outstanding: sum of (items - payments) across all invoices
  const allInvs = await db.query.invoices.findMany({
    where: (i, { eq }) => eq(i.userId, userId),
    with: { items: true, payments: true },
  });
  const outstanding = allInvs.reduce((sum, inv) => {
    const billed = inv.items.reduce((s, it) => s + Number(it.amount), 0);
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    return sum + Math.max(0, billed - paid);
  }, 0);

  return {
    invoicesTotal: invTotal?.count ?? 0,
    invoicesThisMonth: invThisMonth?.count ?? 0,
    invoicesPrevMonth: invPrevMonth?.count ?? 0,
    clientsTotal: cliTotal?.count ?? 0,
    clientsThisMonth: cliThisMonth?.count ?? 0,
    clientsPrevMonth: cliPrevMonth?.count ?? 0,
    outstanding,
  };
}
```

- [ ] **Step 2: TypeScript check**

```bash
pnpm tsc --noEmit 2>&1 | grep "queries.ts"
```

Expected: No output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/db/queries.ts
git commit -m "feat: add getDashboardStats and getMonthlyRevenue DB queries"
```

---

## Task 8: RevenueChart component

**Files:** Create `src/components/dashboard/RevenueChart.tsx`

- [ ] **Step 1: Create RevenueChart**

```tsx
// src/components/dashboard/RevenueChart.tsx
"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { MonthlyRevenue } from "@/lib/db/queries";
import { ScaleIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";

const chartConfig = {
  revenue: {
    label: "Revenus",
    color: "hsl(239 84% 67%)",
  },
} satisfies ChartConfig;

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Fév", "03": "Mar", "04": "Avr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Aoû",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Déc",
};

function formatMonth(ym: string) {
  const [, m] = ym.split("-");
  return MONTH_LABELS[m] ?? ym;
}

type Period = 3 | 6 | 12;

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [period, setPeriod] = useState<Period>(12);

  const filtered = data.slice(-period).map((d) => ({
    month: formatMonth(d.month),
    revenue: d.revenue,
  }));

  return (
    <ScaleIn delay={0.2}>
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Revenus mensuels</h3>
            <p className="text-sm text-muted-foreground">12 derniers mois</p>
          </div>
          <div className="flex gap-1">
            {([3, 6, 12] as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setPeriod(p)}
              >
                {p}M
              </Button>
            ))}
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <AreaChart data={filtered} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}€`}
              className="text-xs text-muted-foreground"
              width={48}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }).format(Number(value))
                  }
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              fill="url(#revenueGradient)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </ScaleIn>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
pnpm tsc --noEmit 2>&1 | grep "RevenueChart"
```

Expected: No output.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/RevenueChart.tsx
git commit -m "feat: RevenueChart area chart with 3M/6M/12M period selector"
```

---

## Task 9: Redesign dashboard page

**Files:** Modify `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Rewrite dashboard page**

```tsx
// src/app/(dashboard)/dashboard/page.tsx
import Link from "next/link";
import { desc } from "drizzle-orm";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/helpers/session";
import { getDashboardStats, getMonthlyRevenue } from "@/lib/db/queries";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { FadeInUp, StaggerChildren } from "@/components/ui/motion";
import type { InvoiceStatus } from "@/types";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<InvoiceStatus, { label: string; className: string }> = {
  draft:      { label: "Brouillon", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  sent:       { label: "Envoyée",   className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  partial:    { label: "Partielle", className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  paid:       { label: "Payée",     className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  overdue:    { label: "En retard", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  cancelled:  { label: "Annulée",   className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
};

function Delta({ current, prev }: { current: number; prev: number }) {
  const diff = current - prev;
  if (diff === 0) return <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><Minus className="h-3 w-3" />0 ce mois</span>;
  const positive = diff > 0;
  return (
    <span className={cn("flex items-center gap-0.5 text-xs font-medium", positive ? "text-emerald-600" : "text-red-500")}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? "+" : ""}{diff} ce mois
    </span>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession();
  const userId = session!.user.id;

  const [stats, monthlyRevenue, recent] = await Promise.all([
    getDashboardStats(userId),
    getMonthlyRevenue(userId, 12),
    db.query.invoices.findMany({
      where: (i, { eq }) => eq(i.userId, userId),
      orderBy: (i) => [desc(i.createdAt)],
      limit: 5,
      with: { client: true, items: true, payments: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeInUp className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>
        <Button asChild size="sm">
          <Link href="/invoices/new">+ Nouvelle facture</Link>
        </Button>
      </FadeInUp>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <FadeInUp delay={0.05}>
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">Factures</p>
            <p className="mt-1 text-3xl font-bold">{stats.invoicesTotal}</p>
            <div className="mt-2">
              <Delta current={stats.invoicesThisMonth} prev={stats.invoicesPrevMonth} />
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">Clients</p>
            <p className="mt-1 text-3xl font-bold">{stats.clientsTotal}</p>
            <div className="mt-2">
              <Delta current={stats.clientsThisMonth} prev={stats.clientsPrevMonth} />
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.15}>
          <div className="rounded-xl border bg-gradient-to-br from-primary to-violet-600 p-6 text-primary-foreground">
            <p className="text-sm font-medium opacity-80">Encours</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(stats.outstanding)}</p>
            <p className="mt-2 text-xs opacity-70">À percevoir</p>
          </div>
        </FadeInUp>
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={monthlyRevenue} />

      {/* Recent Invoices */}
      <FadeInUp delay={0.25}>
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h3 className="font-semibold">Factures récentes</h3>
              <p className="text-sm text-muted-foreground">Les 5 dernières factures émises</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/invoices">Voir tout →</Link>
            </Button>
          </div>
          {recent.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              Aucune facture pour le moment.{" "}
              <Link href="/invoices/new" className="text-primary underline-offset-4 hover:underline">
                Créer votre première facture
              </Link>
            </div>
          ) : (
            <StaggerChildren stagger={0.04} className="divide-y">
              {recent.map((inv) => {
                const billed = inv.items.reduce((s, it) => s + Number(it.amount), 0);
                const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
                const remaining = Math.max(0, billed - paid);
                const badge = STATUS_BADGE[inv.status as InvoiceStatus];
                return (
                  <div key={inv.id} className="flex items-center justify-between px-6 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-sm hover:text-primary transition-colors"
                      >
                        {inv.number}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {inv.client?.name} · {formatDate(inv.issueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", badge.className)}>
                        {badge.label}
                      </span>
                      <div className="text-right text-sm">
                        <div className="font-medium">{formatCurrency(billed)}</div>
                        {remaining > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Reste {formatCurrency(remaining)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </StaggerChildren>
          )}
        </div>
      </FadeInUp>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
pnpm build 2>&1 | tail -20
```

Expected: Successful build.

- [ ] **Step 3: Commit**

```bash
git add src/app/(dashboard)/dashboard/page.tsx
git commit -m "feat: redesign dashboard page with KPI cards, revenue chart, animated invoice list"
```

---

## Task 10: Redesign clients list page

**Files:** Modify `src/app/(dashboard)/clients/page.tsx`

The clients page is a client component that uses `useClients` hook from `src/features/clients/hooks.ts`.

- [ ] **Step 1: Rewrite clients page**

```tsx
// src/app/(dashboard)/clients/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Users, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientForm } from "@/features/clients/ClientForm";
import { useClients } from "@/features/clients/hooks";
import { FadeInUp, StaggerChildren } from "@/components/ui/motion";
import type { Client } from "@/types";

function ClientCard({ client }: { client: Client }) {
  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/clients/${client.id}`} className="block group">
      <div className="rounded-xl border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate group-hover:text-primary transition-colors">{client.name}</p>
            {client.email && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground truncate">
                <Mail className="h-3 w-3 shrink-0" />
                {client.email}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ClientCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const { data: clients, isLoading } = useClients();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <FadeInUp className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            {clients ? `${clients.length} client${clients.length !== 1 ? "s" : ""}` : "Chargement..."}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
            </DialogHeader>
            <ClientForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </FadeInUp>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ClientCardSkeleton key={i} />
          ))}
        </div>
      ) : !clients || clients.length === 0 ? (
        <FadeInUp delay={0.1}>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
            <Users className="mb-4 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium">Aucun client pour le moment</p>
            <p className="mt-1 text-xs text-muted-foreground">Créez votre premier client pour commencer</p>
            <Button size="sm" className="mt-4" onClick={() => setOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Nouveau client
            </Button>
          </div>
        </FadeInUp>
      ) : (
        <StaggerChildren stagger={0.04} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
pnpm build 2>&1 | tail -15
```

Expected: Successful.

- [ ] **Step 3: Commit**

```bash
git add src/app/(dashboard)/clients/page.tsx
git commit -m "feat: redesign clients page with card grid and animated layout"
```

---

## Task 11: Redesign invoices list page

**Files:** Modify `src/app/(dashboard)/invoices/page.tsx`

- [ ] **Step 1: Rewrite invoices page**

```tsx
// src/app/(dashboard)/invoices/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoices } from "@/features/invoices/hooks";
import { FadeInUp, StaggerChildren } from "@/components/ui/motion";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { InvoiceStatus, InvoiceWithRelations } from "@/types";

const STATUS_BADGE: Record<InvoiceStatus, { label: string; className: string }> = {
  draft:      { label: "Brouillon", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  sent:       { label: "Envoyée",   className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  partial:    { label: "Partielle", className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  paid:       { label: "Payée",     className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  overdue:    { label: "En retard", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  cancelled:  { label: "Annulée",   className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
};

type FilterTab = "all" | InvoiceStatus;

const TABS: { value: FilterTab; label: string }[] = [
  { value: "all",     label: "Toutes" },
  { value: "sent",    label: "Envoyées" },
  { value: "partial", label: "Partielles" },
  { value: "paid",    label: "Payées" },
  { value: "overdue", label: "En retard" },
  { value: "draft",   label: "Brouillons" },
];

function InvoiceRow({ inv }: { inv: InvoiceWithRelations }) {
  const billed = inv.items.reduce((s, it) => s + Number(it.amount), 0);
  const badge = STATUS_BADGE[inv.status as InvoiceStatus];
  return (
    <Link
      href={`/invoices/${inv.id}`}
      className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors rounded-lg"
    >
      <div className="min-w-0">
        <p className="font-medium text-sm">{inv.number}</p>
        <p className="text-xs text-muted-foreground truncate">{inv.client?.name}</p>
      </div>
      <p className="text-sm text-muted-foreground hidden sm:block">{formatDate(inv.issueDate)}</p>
      <p className="text-sm font-medium tabular-nums">{formatCurrency(billed)}</p>
      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", badge.className)}>
        {badge.label}
      </span>
    </Link>
  );
}

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useInvoices();
  const [filter, setFilter] = useState<FilterTab>("all");

  const filtered = filter === "all"
    ? (invoices ?? [])
    : (invoices ?? []).filter((inv) => inv.status === filter);

  return (
    <div className="space-y-6">
      <FadeInUp className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Factures</h1>
          <p className="text-sm text-muted-foreground">
            {invoices ? `${invoices.length} facture${invoices.length !== 1 ? "s" : ""}` : "Chargement..."}
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/invoices/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Nouvelle facture
          </Link>
        </Button>
      </FadeInUp>

      <FadeInUp delay={0.05}>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList className="h-9">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-3">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <div className="rounded-xl border bg-card">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b px-4 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">Facture</p>
            <p className="text-xs font-medium text-muted-foreground hidden sm:block">Date</p>
            <p className="text-xs font-medium text-muted-foreground">Montant</p>
            <p className="text-xs font-medium text-muted-foreground">Statut</p>
          </div>

          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-4 w-16 hidden sm:block" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">Aucune facture</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {filter === "all" ? "Créez votre première facture" : "Aucune facture dans ce statut"}
              </p>
            </div>
          ) : (
            <StaggerChildren stagger={0.03} className="divide-y">
              {filtered.map((inv) => (
                <InvoiceRow key={inv.id} inv={inv} />
              ))}
            </StaggerChildren>
          )}
        </div>
      </FadeInUp>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
pnpm build 2>&1 | tail -15
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(dashboard)/invoices/page.tsx
git commit -m "feat: redesign invoices page with filter tabs and animated rows"
```

---

## Task 12: Redesign auth layout

**Files:** Modify `src/app/auth/layout.tsx`

- [ ] **Step 1: Rewrite auth layout**

```tsx
// src/app/auth/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/billing-builder-icon.png" alt="Billing Builder" className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold">Billing Builder</span>
        </div>
        {/* Card */}
        <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-8 shadow-xl shadow-black/5">
          {children}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
pnpm build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/layout.tsx
git commit -m "feat: redesign auth layout with glass card and ambient background"
```

---

## Task 13: Redesign profile + settings pages

**Files:**
- Modify `src/app/(dashboard)/profile/page.tsx`
- Modify `src/app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: Read current profile page structure**

```bash
cat src/app/(dashboard)/profile/page.tsx
cat src/app/(dashboard)/settings/page.tsx
```

Note: These pages likely use forms from `src/features/profile/`. Keep the form logic, only update the layout wrapper.

- [ ] **Step 2: Wrap profile page content in consistent layout**

Replace the outer wrapper in both pages with:

```tsx
// Pattern to apply to both profile/page.tsx and settings/page.tsx
// Keep all existing form logic — only replace the outer container:

<div className="space-y-6">
  <FadeInUp>
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Profil</h1>  {/* or Paramètres */}
      <p className="text-sm text-muted-foreground">Gérez vos informations personnelles</p>
    </div>
  </FadeInUp>
  <FadeInUp delay={0.05}>
    <div className="rounded-xl border bg-card p-6">
      {/* existing form content unchanged */}
    </div>
  </FadeInUp>
</div>
```

Add `import { FadeInUp } from "@/components/ui/motion";` at the top of each file.

- [ ] **Step 3: Build check**

```bash
pnpm build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/profile/page.tsx src/app/(dashboard)/settings/page.tsx
git commit -m "feat: wrap profile and settings pages with consistent animated layout"
```

---

## Task 14: Page transitions via AnimatePresence

**Files:** Modify `src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Add AnimatePresence for page transitions**

The `main` wrapper needs the current `pathname` as a key so motion can animate between route changes. Since `layout.tsx` is a server component, create a thin client wrapper for the animated content area.

Create `src/components/dashboard/AnimatedMain.tsx`:

```tsx
// src/components/dashboard/AnimatedMain.tsx
"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "motion/react";

export function AnimatedMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) return <main className="flex-1 overflow-y-auto p-6">{children}</main>;

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname}
        className="flex-1 overflow-y-auto p-6"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Update layout.tsx to use AnimatedMain**

```tsx
// src/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Header } from "@/components/dashboard/Header";
import { AnimatedMain } from "@/components/dashboard/AnimatedMain";
import { getServerSession } from "@/lib/helpers/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/login");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <AnimatedMain>{children}</AnimatedMain>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

- [ ] **Step 3: Final build check**

```bash
pnpm build 2>&1 | tail -20
```

Expected: Successful build, all 21 routes generated.

- [ ] **Step 4: Final commit**

```bash
git add src/components/dashboard/AnimatedMain.tsx src/app/(dashboard)/layout.tsx
git commit -m "feat: add page transition animations via AnimatePresence"
```

---

## Task 15: Smoke test + cleanup

- [ ] **Step 1: Start dev server and verify each route visually**

```bash
pnpm dev
```

Check each route loads without console errors:
- `/dashboard` — KPI cards, chart, recent invoices
- `/clients` — card grid
- `/invoices` — table with filter tabs
- `/auth/login` — glass card layout
- `/profile`, `/settings` — consistent layout
- Dark mode toggle works (sun/moon icon in header)
- Sidebar: logo image loads, nav groups visible, NavUser shows initials

- [ ] **Step 2: TypeScript final check**

```bash
pnpm tsc --noEmit 2>&1
```

Expected: 0 errors. Fix any that appear.

- [ ] **Step 3: Add .superpowers to .gitignore if not present**

```bash
grep -q ".superpowers" .gitignore || echo ".superpowers/" >> .gitignore
git add .gitignore
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: smoke test passed, add .superpowers to .gitignore"
```

---

## Notes for the implementer

- **Invoice + client detail pages** (`/clients/[id]` and `/invoices/[id]`, `/invoices/new`, `/invoices/[id]/edit`) — read the existing page files first. Apply the same layout pattern as Task 10/11 (FadeInUp header + FadeInUp delay content). Keep all existing form logic and data fetching untouched. Only the visual container changes.
- **`useClients` and `useInvoices` hooks** are in `src/features/clients/hooks.ts` and `src/features/invoices/hooks.ts` — do not modify these.
- **`cn()` utility** is in `src/lib/utils.ts` — use it for conditional class merging.
- **The sidebar is always dark** — this is enforced by the `--sidebar-*` CSS variables set in `:root` (not `.dark`). This is intentional per the design.
- **`motion/react`** is the import path for the motion library (already installed as `motion` package).
