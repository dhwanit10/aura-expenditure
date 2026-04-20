import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Expense } from "@/types/expense";

interface Props {
  expenses: Expense[];
  balances: { upi: number; cash: number; cheque: number };
  currency: string;
}

export function SmartTips({ expenses, balances, currency }: Props) {
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTips = async () => {
    if (expenses.length === 0) {
      setTips(["Log your first expense and I'll start reading your aura ✨"]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("smart-tips", {
        body: { expenses: expenses.slice(0, 50), balances, currency },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setTips(data?.tips ?? []);
    } catch (e: any) {
      toast.error(e.message || "Couldn't fetch tips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses.length]);

  return (
    <section className="glass-card grain relative p-7 animate-fade-up" style={{ animationDelay: "0.2s" }}>
      <div aria-hidden className="absolute top-0 right-0 w-40 h-40 rounded-full bg-butter/15 blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between mb-5 relative">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-butter" />
          <p className="text-xs uppercase tracking-[0.4em] text-butter">Smart tips</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchTips}
          disabled={loading}
          className="rounded-full h-8 w-8 p-0 hover:bg-butter/10 hover:text-butter"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="relative space-y-4">
        {loading && tips.length === 0 ? (
          <>
            <div className="h-4 bg-surface-2 rounded animate-pulse" />
            <div className="h-4 bg-surface-2 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-surface-2 rounded animate-pulse w-4/6" />
          </>
        ) : (
          tips.map((tip, i) => (
            <div key={i} className="flex gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="text-butter font-display text-xl leading-none mt-0.5">·</span>
              <p className="text-sm leading-relaxed text-foreground/90 font-display italic">"{tip}"</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
