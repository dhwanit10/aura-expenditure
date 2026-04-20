export const CATEGORIES = [
  { id: "food", label: "Food", emoji: "🍜" },
  { id: "transport", label: "Transport", emoji: "🛺" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "bills", label: "Bills", emoji: "🧾" },
  { id: "entertainment", label: "Entertainment", emoji: "🎬" },
  { id: "health", label: "Health", emoji: "🩺" },
  { id: "rent", label: "Rent", emoji: "🏠" },
  { id: "groceries", label: "Groceries", emoji: "🥬" },
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "other", label: "Other", emoji: "✨" },
] as const;

export const ACCOUNTS = [
  { id: "upi", label: "UPI", color: "butter" },
  { id: "cash", label: "Cash", color: "accent" },
  { id: "cheque", label: "Cheque", color: "secondary" },
] as const;

export type AccountType = (typeof ACCOUNTS)[number]["id"];
export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const getCategory = (id: string) =>
  CATEGORIES.find((c) => c.id === id) ?? { id, label: id, emoji: "✨" };

export const formatMoney = (n: number, currency = "₹") =>
  `${currency}${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
