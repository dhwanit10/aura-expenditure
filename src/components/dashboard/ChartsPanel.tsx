import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import type { Expense } from "@/types/expense";
import { CATEGORIES, getCategory } from "@/lib/expense-data";
import { format, eachDayOfInterval, subDays, parseISO } from "date-fns";

interface Props {
  expenses: Expense[];
  currency: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  food: "hsl(19 100% 76%)",
  transport: "hsl(0 100% 71%)",
  shopping: "hsl(47 87% 67%)",
  bills: "hsl(137 36% 75%)",
  entertainment: "hsl(330 70% 75%)",
  health: "hsl(170 50% 70%)",
  rent: "hsl(280 40% 75%)",
  groceries: "hsl(100 40% 70%)",
  travel: "hsl(40 80% 70%)",
  other: "hsl(220 20% 70%)",
};

export function ChartsPanel({ expenses, currency }: Props) {
  // Last 14 days bar chart
  const dailyData = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 13);
    const days = eachDayOfInterval({ start, end });
    return days.map((d) => {
      const key = format(d, "yyyy-MM-dd");
      const total = expenses
        .filter((e) => e.expense_date === key)
        .reduce((s, e) => s + Number(e.amount), 0);
      return { date: format(d, "d"), dateFull: format(d, "d MMM"), total };
    });
  }, [expenses]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(totals)
      .map(([id, value]) => ({
        name: getCategory(id).label,
        id,
        value,
        color: CATEGORY_COLORS[id] || "hsl(220 20% 70%)",
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 animate-fade-up" style={{ animationDelay: "0.15s" }}>
      <div className="lg:col-span-3 glass-card grain relative p-5 sm:p-7">
        <div className="flex items-baseline justify-between mb-4 sm:mb-6">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-muted-foreground">Last 14 days</p>
            <h3 className="font-display text-xl sm:text-2xl mt-1">Daily flow</h3>
          </div>
        </div>
        <div className="h-44 sm:h-56 w-full -ml-2 sm:ml-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(19 100% 76%)" />
                  <stop offset="100%" stopColor="hsl(0 100% 71%)" />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval={0} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={35} />
              <Tooltip
                cursor={{ fill: "hsl(var(--surface-2) / 0.5)" }}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelFormatter={(_, payload) => {
                  if (payload?.[0]?.payload?.dateFull) return payload[0].payload.dateFull;
                  return _;
                }}
                formatter={(v: any) => [`${currency}${Number(v).toLocaleString("en-IN")}`, "Spent"]}
              />
              <Bar dataKey="total" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-2 glass-card grain relative p-5 sm:p-7">
        <div className="mb-4">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-muted-foreground">Breakdown</p>
          <h3 className="font-display text-xl sm:text-2xl mt-1">By category</h3>
        </div>
        {categoryData.length === 0 ? (
          <p className="text-muted-foreground text-sm py-12 text-center">No expenses yet</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 sm:w-32 sm:h-32 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={52}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((d) => (
                      <Cell key={d.id} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {categoryData.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="flex-1 text-muted-foreground truncate">{d.name}</span>
                  <span className="tabular text-foreground text-[11px]">{currency}{Math.round(d.value).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
