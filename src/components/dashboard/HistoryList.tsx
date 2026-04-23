import { useMemo, useState } from "react";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { Trash2 } from "lucide-react";
import type { Expense } from "@/types/expense";
import { CATEGORIES, ACCOUNTS, getCategory, formatMoney } from "@/lib/expense-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  expenses: Expense[];
  currency: string;
  onDelete: (id: string) => void;
}

type FilterAccount = "all" | "upi" | "cash" | "cheque";
type FilterRange = "month" | "week" | "all";

export function HistoryList({ expenses, currency, onDelete }: Props) {
  const [accountFilter, setAccountFilter] = useState<FilterAccount>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [rangeFilter, setRangeFilter] = useState<FilterRange>("month");

  const filtered = useMemo(() => {
    const now = new Date();
    return expenses.filter((e) => {
      if (accountFilter !== "all" && e.account_type !== accountFilter) return false;
      if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
      const d = parseISO(e.expense_date);
      if (rangeFilter === "month") {
        if (!isWithinInterval(d, { start: startOfMonth(now), end: endOfMonth(now) })) return false;
      } else if (rangeFilter === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        if (d < weekAgo) return false;
      }
      return true;
    });
  }, [expenses, accountFilter, categoryFilter, rangeFilter]);

  const totalFiltered = filtered.reduce((s, e) => s + Number(e.amount), 0);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>();
    filtered.forEach((e) => {
      const arr = map.get(e.expense_date) ?? [];
      arr.push(e);
      map.set(e.expense_date, arr);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const accountAccent = (a: Expense["account_type"]) =>
    a === "upi" ? "text-butter bg-butter/10" : a === "cash" ? "text-accent bg-accent/10" : "text-secondary bg-secondary/10";

  return (
    <section className="glass-card grain relative p-5 sm:p-7 animate-fade-up" style={{ animationDelay: "0.25s" }}>
      <div className="flex items-baseline justify-between mb-4 sm:mb-6 flex-wrap gap-2">
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-muted-foreground">History</p>
          <h3 className="font-display text-2xl sm:text-3xl mt-1">Where it went</h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">Filtered total</p>
          <p className="font-display text-lg sm:text-2xl text-secondary tabular">{formatMoney(totalFiltered, currency)}</p>
        </div>
      </div>

      {/* Filters — stacked on mobile */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4 sm:mb-6">
        {/* Range */}
        <div className="flex gap-1 p-1 rounded-full bg-surface-glow border border-border/30 self-start">
          {(["week", "month", "all"] as FilterRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRangeFilter(r)}
              className={cn(
                "px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs uppercase tracking-wider transition-smooth",
                rangeFilter === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Account */}
        <div className="flex gap-1 p-1 rounded-full bg-surface-glow border border-border/30 self-start overflow-x-auto">
          {(["all", ...ACCOUNTS.map((a) => a.id)] as FilterAccount[]).map((a) => (
            <button
              key={a}
              onClick={() => setAccountFilter(a)}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs uppercase tracking-wider transition-smooth whitespace-nowrap",
                accountFilter === a ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-surface-glow border border-border/30 rounded-full px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs uppercase tracking-wider text-foreground hover:border-primary/40 transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/40 self-start"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="space-y-5 sm:space-y-6 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
        {grouped.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 italic font-display">No entries here yet.</p>
        ) : (
          grouped.map(([date, items]) => {
            const dayTotal = items.reduce((s, e) => s + Number(e.amount), 0);
            return (
              <div key={date}>
                <div className="flex items-baseline justify-between mb-2 sticky top-0 bg-surface/80 backdrop-blur-md py-1 -mx-1 px-1 rounded">
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
                    {format(parseISO(date), "EEE, d MMM")}
                  </p>
                  <p className="text-[10px] sm:text-xs tabular text-muted-foreground">{formatMoney(dayTotal, currency)}</p>
                </div>
                <ul className="space-y-1.5">
                  {items.map((e) => {
                    const cat = getCategory(e.category);
                    return (
                      <li
                        key={e.id}
                        className="group flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-surface-glow/50 hover:bg-surface-2 transition-smooth"
                      >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-2 flex items-center justify-center text-lg sm:text-xl shrink-0">
                          {cat.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <p className="font-medium text-sm sm:text-base text-foreground truncate">{cat.label}</p>
                            <span className={cn("text-[9px] sm:text-[10px] uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full shrink-0", accountAccent(e.account_type))}>
                              {e.account_type}
                            </span>
                          </div>
                          {e.reason && (
                            <p className="text-[11px] sm:text-xs text-muted-foreground truncate italic font-display">"{e.reason}"</p>
                          )}
                        </div>
                        <p className="font-display text-sm sm:text-lg tabular text-foreground shrink-0">
                          {formatMoney(Number(e.amount), currency)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(e.id)}
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity w-7 h-7 sm:w-8 sm:h-8 p-0 hover:bg-destructive/15 hover:text-destructive shrink-0"
                        >
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
