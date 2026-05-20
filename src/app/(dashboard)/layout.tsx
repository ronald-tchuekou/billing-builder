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
