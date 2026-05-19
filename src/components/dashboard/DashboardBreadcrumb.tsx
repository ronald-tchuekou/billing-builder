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

  const section = segments[0];
  crumbs.push({ label: labels[section] ?? section, href: `/${section}` });

  if (segments[1] === "new") {
    crumbs.push({ label: "Nouvelle facture" });
  } else if (segments.length >= 2) {
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
