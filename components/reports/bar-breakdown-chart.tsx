"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency } from "@/lib/utils/format";

type ChartDatum = Record<string, number | string>;

type BarBreakdownChartProps = {
  data: ChartDatum[];
  dataKey: string;
  labelKey?: string;
  label: string;
  color: string;
  valueFormat?: "currency" | "number";
};

export function BarBreakdownChart({
  data,
  dataKey,
  labelKey = "label",
  label,
  color,
  valueFormat = "currency"
}: BarBreakdownChartProps) {
  const formatter = (value: number) => {
    if (valueFormat === "number") {
      return value.toLocaleString("en-ID");
    }

    return formatCurrency(value);
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(15, 23, 42, 0.08)" vertical={false} />
          <XAxis dataKey={labelKey} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={88} tickFormatter={(value) => formatter(Number(value))} />
          <Tooltip
            formatter={(value: number | string) => [formatter(Number(value)), label]}
            contentStyle={{
              borderRadius: 18,
              border: "1px solid rgba(148, 163, 184, 0.28)",
              background: "rgba(255,255,255,0.96)"
            }}
          />
          <Bar dataKey={dataKey} name={label} fill={color} radius={[12, 12, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
