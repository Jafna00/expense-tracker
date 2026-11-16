export const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Other",
];

// Full class names so Tailwind can detect them
const CATEGORY_STYLES = {
  Food: { badge: "bg-orange-400/20 text-orange-200 border-orange-300/30", bar: "bg-orange-400" },
  Transport: { badge: "bg-sky-400/20 text-sky-200 border-sky-300/30", bar: "bg-sky-400" },
  Shopping: { badge: "bg-pink-400/20 text-pink-200 border-pink-300/30", bar: "bg-pink-400" },
  Bills: { badge: "bg-amber-400/20 text-amber-200 border-amber-300/30", bar: "bg-amber-400" },
  Entertainment: { badge: "bg-violet-400/20 text-violet-200 border-violet-300/30", bar: "bg-violet-400" },
  Health: { badge: "bg-emerald-400/20 text-emerald-200 border-emerald-300/30", bar: "bg-emerald-400" },
  Other: { badge: "bg-slate-400/20 text-slate-200 border-slate-300/30", bar: "bg-slate-400" },
};

export const getCategoryStyle = (category) => CATEGORY_STYLES[category] || CATEGORY_STYLES.Other;

export const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n || 0);

// Dates are stored as UTC midnight, so always display in UTC to avoid day shifts
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

// Today's date in the user's LOCAL timezone as YYYY-MM-DD
export const todayStr = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const toInputDate = (iso) => (iso ? iso.slice(0, 10) : todayStr());

export const currentMonth = () => todayStr().slice(0, 7);

export const formatMonth = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

export const shiftMonth = (ym, delta) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};