"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "motion/react";

export function AnimatedMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) {
    return <main className="flex-1 overflow-y-auto p-6">{children}</main>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname}
        className="flex-1 overflow-y-auto p-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
