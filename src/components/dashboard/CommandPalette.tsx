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
