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
