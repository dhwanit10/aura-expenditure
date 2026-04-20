import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BalanceHero } from "@/components/dashboard/BalanceHero";
import { AddExpenseCard } from "@/components/dashboard/AddExpenseCard";
import { ChartsPanel } from "@/components/dashboard/ChartsPanel";
import { HistoryList } from "@/components/dashboard/HistoryList";
import { SmartTips } from "@/components/dashboard/SmartTips";
import { BalanceEditDialog } from "@/components/dashboard/BalanceEditDialog";
import type { Expense, Profile } from "@/types/expense";

const Index = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Aura — Your financial aura";
  }, []);

  const loadAll = useCallback(async (uid: string) => {
    const [{ data: prof, error: pErr }, { data: exps, error: eErr }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("expenses").select("*").eq("user_id", uid).order("expense_date", { ascending: false }).order("created_at", { ascending: false }),
    ]);
    if (pErr) toast.error(pErr.message);
    if (eErr) toast.error(eErr.message);
    if (prof) setProfile(prof as Profile);
    if (exps) setExpenses(exps as Expense[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/auth", { replace: true });
        return;
      }
      setUserId(data.session.user.id);
      loadAll(data.session.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate("/auth", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, loadAll]);

  const handleAddExpense = async (data: {
    amount: number;
    category: string;
    account_type: "upi" | "cash" | "cheque";
    expense_date: string;
    reason: string | null;
  }) => {
    if (!userId || !profile) return;
    const { error } = await supabase.from("expenses").insert({ ...data, user_id: userId });
    if (error) {
      toast.error(error.message);
      return;
    }
    // Auto-deduct from balance
    const balanceField = `${data.account_type}_balance` as const;
    const newBalance = Number(profile[balanceField]) - data.amount;
    const { error: bErr } = await supabase
      .from("profiles")
      .update({ [balanceField]: newBalance })
      .eq("user_id", userId);
    if (bErr) toast.error(bErr.message);
    toast.success("Logged ✨");
    await loadAll(userId);
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    const expense = expenses.find((e) => e.id === id);
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Refund balance
    if (expense && profile) {
      const balanceField = `${expense.account_type}_balance` as const;
      await supabase
        .from("profiles")
        .update({ [balanceField]: Number(profile[balanceField]) + Number(expense.amount) })
        .eq("user_id", userId);
    }
    toast.success("Removed");
    await loadAll(userId);
  };

  const handleSaveBalances = async (vals: { upi: number; cash: number; cheque: number }) => {
    if (!userId) return;
    const { error } = await supabase
      .from("profiles")
      .update({ upi_balance: vals.upi, cash_balance: vals.cash, cheque_balance: vals.cheque })
      .eq("user_id", userId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Balances updated");
    await loadAll(userId);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-display text-3xl text-gradient-warm animate-pulse-glow">Reading your aura…</div>
      </div>
    );
  }

  const currency = profile.currency || "₹";

  return (
    <main className="min-h-screen px-4 md:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground">Aura</p>
          <h1 className="font-display text-3xl mt-1">
            Hello, <span className="text-gradient-warm">{profile.display_name || "friend"}</span>
          </h1>
        </div>
        <Button onClick={handleSignOut} variant="ghost" size="sm" className="rounded-full hover:bg-secondary/10 hover:text-secondary">
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        <div className="lg:col-span-3">
          <BalanceHero
            upi={Number(profile.upi_balance)}
            cash={Number(profile.cash_balance)}
            cheque={Number(profile.cheque_balance)}
            currency={currency}
            onEdit={() => setEditOpen(true)}
          />
        </div>
        <div className="lg:col-span-2">
          <SmartTips
            expenses={expenses}
            balances={{
              upi: Number(profile.upi_balance),
              cash: Number(profile.cash_balance),
              cheque: Number(profile.cheque_balance),
            }}
            currency={currency}
          />
        </div>
      </div>

      <div className="mb-5">
        <ChartsPanel expenses={expenses} currency={currency} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2">
          <AddExpenseCard onSubmit={handleAddExpense} />
        </div>
        <div className="lg:col-span-3">
          <HistoryList expenses={expenses} currency={currency} onDelete={handleDelete} />
        </div>
      </div>

      <footer className="mt-12 text-center text-xs text-muted-foreground/60 tracking-widest uppercase">
        Aura · An expense ledger that glows
      </footer>

      <BalanceEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        upi={Number(profile.upi_balance)}
        cash={Number(profile.cash_balance)}
        cheque={Number(profile.cheque_balance)}
        onSave={handleSaveBalances}
      />
    </main>
  );
};

export default Index;
