import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CATEGORIES, ACCOUNTS, type AccountType, type CategoryId } from "@/lib/expense-data";
import { toast } from "sonner";

interface Props {
  onSubmit: (data: {
    amount: number;
    category: string;
    account_type: AccountType;
    expense_date: string;
    reason: string | null;
  }) => Promise<void>;
}

export function AddExpenseCard({ onSubmit }: Props) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryId>("food");
  const [account, setAccount] = useState<AccountType>("upi");
  const [date, setDate] = useState<Date>(new Date());
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (reason.length > 500) {
      toast.error("Reason too long");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        amount: n,
        category,
        account_type: account,
        expense_date: format(date, "yyyy-MM-dd"),
        reason: reason.trim() || null,
      });
      setAmount("");
      setReason("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="glass-card grain relative p-5 sm:p-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-muted-foreground">Log new</p>
          <h3 className="font-display text-2xl sm:text-3xl mt-1">An expense</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
        {/* Amount — hero input */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <Label className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Amount</Label>
          <div className="relative">
            <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 font-display text-2xl sm:text-3xl text-primary/60">₹</span>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="h-14 sm:h-16 pl-10 sm:pl-12 pr-4 text-2xl sm:text-3xl font-display tabular bg-surface-glow border-border/40 rounded-2xl focus-visible:ring-primary focus-visible:ring-2"
              required
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <Label className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border text-xs sm:text-sm transition-smooth flex items-center gap-1 sm:gap-2",
                  category === c.id
                    ? "bg-primary/15 border-primary/50 text-primary"
                    : "bg-surface-glow border-border/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                <span>{c.emoji}</span>
                <span className="hidden sm:inline">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Account + Date row */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <Label className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Paid via</Label>
            <div className="flex gap-2">
              {ACCOUNTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAccount(a.id)}
                  className={cn(
                    "flex-1 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-semibold uppercase tracking-wider transition-smooth",
                    account === a.id
                      ? a.id === "upi"
                        ? "bg-butter/15 border-butter/50 text-butter"
                        : a.id === "cash"
                        ? "bg-accent/15 border-accent/50 text-accent"
                        : "bg-secondary/15 border-secondary/50 text-secondary"
                      : "bg-surface-glow border-border/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:gap-2">
            <Label className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 sm:h-12 justify-start bg-surface-glow border-border/40 rounded-xl hover:bg-surface-2 hover:text-foreground text-sm"
                  type="button"
                >
                  <CalendarIcon className="mr-2 w-4 h-4 text-primary" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border/40" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  disabled={(d) => d > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Reason */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <Label className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
            Reason <span className="text-muted-foreground/60 normal-case tracking-normal">(optional)</span>
          </Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="A note to your future self…"
            rows={2}
            maxLength={500}
            className="bg-surface-glow border-border/40 rounded-xl resize-none focus-visible:ring-primary text-sm"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 sm:h-13 mt-1 sm:mt-2 rounded-2xl bg-gradient-warm text-primary-foreground font-semibold tracking-wide hover:opacity-90 glow-peach text-sm sm:text-base py-3 sm:py-4"
        >
          {submitting ? "Logging…" : "Log Expense"}
        </Button>
      </form>
    </section>
  );
}
