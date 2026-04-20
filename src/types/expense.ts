export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  account_type: "upi" | "cash" | "cheque";
  expense_date: string;
  reason: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  upi_balance: number;
  cash_balance: number;
  cheque_balance: number;
  currency: string;
}
