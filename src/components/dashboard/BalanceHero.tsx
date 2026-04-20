import { formatMoney } from "@/lib/expense-data";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface Props {
  upi: number;
  cash: number;
  cheque: number;
  currency: string;
  onEdit: () => void;
}

const accounts = [
  { key: "upi", label: "UPI", colorClass: "text-butter", bgClass: "bg-butter/10", borderClass: "border-butter/30" },
  { key: "cash", label: "Cash", colorClass: "text-accent", bgClass: "bg-accent/10", borderClass: "border-accent/30" },
  { key: "cheque", label: "Cheque", colorClass: "text-secondary", bgClass: "bg-secondary/10", borderClass: "border-secondary/30" },
] as const;

export function BalanceHero({ upi, cash, cheque, currency, onEdit }: Props) {
  const total = upi + cash + cheque;
  const values: Record<string, number> = { upi, cash, cheque };

  return (
    <section className="glass-card grain relative p-8 md:p-10 overflow-hidden animate-fade-up">
      <div aria-hidden className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />

      <div className="relative flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-2">Your aura</p>
          <h2 className="font-display text-6xl md:text-7xl text-gradient-warm tabular leading-none">
            {currency}{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </h2>
          <p className="text-muted-foreground mt-2">across all accounts</p>
        </div>
        <Button
          onClick={onEdit}
          variant="ghost"
          size="sm"
          className="rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <Pencil className="w-4 h-4 mr-2" /> Adjust
        </Button>
      </div>

      <div className="relative grid grid-cols-3 gap-3 md:gap-4">
        {accounts.map((a) => (
          <div
            key={a.key}
            className={`rounded-2xl border ${a.borderClass} ${a.bgClass} p-4 md:p-5 transition-smooth hover:scale-[1.02]`}
          >
            <p className={`text-xs uppercase tracking-widest ${a.colorClass} font-semibold`}>{a.label}</p>
            <p className="font-display text-2xl md:text-3xl mt-2 tabular text-foreground">
              {formatMoney(values[a.key], currency)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
