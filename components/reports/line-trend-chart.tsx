"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency } from "@/lib/utils/format";

type ChartDatum = Record<string, number | string>;

type LineTrendChartProps = {
  data: ChartDatum[];
  series: Array<{
    dataKey: string;
    label: string;
    color: string;
  }>;
  valueFormat?: "currency" | "number";
};

export function LineTrendChart({ data, series, valueFormat = "currency" }: LineTrendChartProps) {
  const formatter = (value: number) => {
    if (valueFormat === "number") {
      return value.toLocaleString("en-ID");
    }

    return formatCurrency(value);
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            {series.map((entry) => (
              <linearGradient key={entry.dataKey} id={`gradient-${entry.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={entry.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={entry.color} stopOpacity={0.04} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="rgba(15, 23, 42, 0.08)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={88} tickFormatter={(value) => formatter(Number(value))} />
          <Tooltip
            formatter={(value: number | string, name: string | number) => [formatter(Number(value)), `${name}`]}
            contentStyle={{
              borderRadius: 18,
              border: "1px solid rgba(148, 163, 184, 0.28)",
              background: "rgba(255,255,255,0.96)"
            }}
          />
          {series.map((entry) => (
            <Area
              key={entry.dataKey}
              type="monotone"
              dataKey={entry.dataKey}
              name={entry.label}
              stroke={entry.color}
              fill={`url(#gradient-${entry.dataKey})`}
              strokeWidth={2.5}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
