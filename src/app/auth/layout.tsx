import Image from "next/image";
import { FadeInUp } from "@/components/ui/motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden p-4">
      <div className="absolute w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl -top-16 -left-16 pointer-events-none" />
      <div className="absolute w-72 h-72 rounded-full bg-violet-500/20 blur-3xl -bottom-16 -right-16 pointer-events-none" />

      <FadeInUp className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Image
              src="/billing-builder-icon.png"
              width={40}
              height={40}
              alt="Billing Builder"
            />
            <span className="text-xl font-semibold text-white">Billing Builder</span>
          </div>
          {children}
        </div>
      </FadeInUp>
    </div>
  );
}
