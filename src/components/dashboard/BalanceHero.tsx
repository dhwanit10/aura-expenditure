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
    <section className="glass-card grain relative p-5 sm:p-8 md:p-10 overflow-hidden animate-fade-up">
      <div aria-hidden className="absolute -top-20 -right-20 w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-20 -left-20 w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />

      <div className="relative flex items-start justify-between mb-5 sm:mb-8">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-muted-foreground mb-1 sm:mb-2">Your aura</p>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl text-gradient-warm tabular leading-none break-all">
            {currency}{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </h2>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-base">across all accounts</p>
        </div>
        <Button
          onClick={onEdit}
          variant="ghost"
          size="sm"
          className="rounded-full hover:bg-primary/10 hover:text-primary shrink-0 ml-2 h-8 w-8 sm:h-auto sm:w-auto p-0 sm:px-3 sm:py-1.5"
        >
          <Pencil className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Adjust</span>
        </Button>
      </div>

      <div className="relative grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {accounts.map((a) => (
          <div
            key={a.key}
            className={`rounded-xl sm:rounded-2xl border ${a.borderClass} ${a.bgClass} p-3 sm:p-4 md:p-5 transition-smooth hover:scale-[1.02]`}
          >
            <p className={`text-[10px] sm:text-xs uppercase tracking-widest ${a.colorClass} font-semibold`}>{a.label}</p>
            <p className="font-display text-base sm:text-2xl md:text-3xl mt-1 sm:mt-2 tabular text-foreground">
              {formatMoney(values[a.key], currency)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
