import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  upi: number;
  cash: number;
  cheque: number;
  onSave: (vals: { upi: number; cash: number; cheque: number }) => Promise<void>;
}

export function BalanceEditDialog({ open, onOpenChange, upi, cash, cheque, onSave }: Props) {
  const [u, setU] = useState(String(upi));
  const [c, setC] = useState(String(cash));
  const [ch, setCh] = useState(String(cheque));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setU(String(upi));
      setC(String(cash));
      setCh(String(cheque));
    }
  }, [open, upi, cash, cheque]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        upi: parseFloat(u) || 0,
        cash: parseFloat(c) || 0,
        cheque: parseFloat(ch) || 0,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { label: "UPI", value: u, setter: setU, accent: "text-butter focus-visible:ring-butter" },
    { label: "Cash", value: c, setter: setC, accent: "text-accent focus-visible:ring-accent" },
    { label: "Cheque", value: ch, setter: setCh, accent: "text-secondary focus-visible:ring-secondary" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border/40 rounded-2xl sm:rounded-3xl max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl text-gradient-warm">Adjust balances</DialogTitle>
          <DialogDescription>Set the current amount you have in each account.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {fields.map((f) => (
            <div key={f.label} className="flex flex-col gap-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">{f.label}</Label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-display text-2xl ${f.accent.split(" ")[0]}`}>₹</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={f.value}
                  onChange={(e) => f.setter(e.target.value)}
                  className={`h-14 pl-10 text-2xl font-display tabular bg-surface-glow border-border/40 rounded-xl ${f.accent}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-gradient-warm text-primary-foreground hover:opacity-90 glow-peach"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
