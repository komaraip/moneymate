import React from "react";
import { motion } from "framer-motion";

export const CARD_SHADOW =
  "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function SectionPanel({ children, className = "", delay = 0.15 }: { children: React.ReactNode; className?: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
      className={`rounded-2xl surface-card p-5 lg:p-6 ${className}`}
      style={{ boxShadow: CARD_SHADOW }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h3 className="text-sm font-bold text-main tracking-tight font-display">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted mt-0.5 font-sans">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
