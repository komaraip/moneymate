import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import React from "react";
import { CARD_SHADOW, EASE_OUT } from "./SectionPanel";

export function KpiCard({
  label,
  value,
  change,
  prefix = "",
  suffix = "",
  delay = 0,
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  icon?: React.ElementType;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT }}
      className="relative overflow-hidden rounded-2xl surface-card p-4 lg:p-5 group hover:scale-[1.01] transition-transform duration-300"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] pointer-events-none">
        {Icon && <Icon className="size-24 -translate-y-4 translate-x-4" />}
      </div>
      <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted mb-2.5 font-sans">
        {label}
      </p>
      <p className="text-2xl lg:text-3xl font-bold text-main font-mono tracking-tighter leading-none">
        {prefix}
        {value}
        {suffix}
      </p>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          <div
            className={`flex items-center gap-0.5 text-xs font-semibold font-mono px-1.5 py-0.5 rounded-md ${
              isPositive ? "bg-fin-gain/10 text-fin-gain" : "bg-fin-loss/10 text-fin-loss"
            }`}
          >
            {isPositive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {isPositive ? "+" : ""}
            {change}%
          </div>
          <span className="text-[10px] text-muted/70 font-sans">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
