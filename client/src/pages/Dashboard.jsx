import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchExpenses, fetchSummary, getErrorMessage } from "../api/expenseApi";
import useCategories from "../hooks/useCategories";
import ExpenseModal from "../components/ExpenseModal";
import CategoryBadge from "../components/CategoryBadge";
import {
  currentMonth,
  formatCurrency,
  formatDate,
  formatMonth,
  getCategoryStyle,
  shiftMonth,
} from "../utils/format";

function StatCard({ label, value, hint }) {
  return (
    <div className="glass p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-white/60">{label}</p>
      <p className="mt-2 text-2xl font-bold sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-white/50">{hint}</p>
    </div>
  );
}

export default function Dashboard() {
  const categories = useCategories();
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  // Monthly summary
  useEffect(() => {
    let ignore = false;
    setLoadingSummary(true);
    fetchSummary(month)
      .then((data) => {
        if (ignore) return;
        setSummary(data);
        setError("");
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoadingSummary(false));
    return () => {
      ignore = true;
    };
  }, [month, refreshKey]);

  // Recent 5 expenses
  useEffect(() => {
    let ignore = false;
    setLoadingRecent(true);
    fetchExpenses({ limit: 5 })
      .then((data) => !ignore && setRecent(data))
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoadingRecent(false));
    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const top = summary?.byCategory?.[0];
  const isCurrentMonth = month >= currentMonth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-white/60">Your spending at a glance</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="glass flex items-center gap-1 px-2 py-1.5">
            <button
              className="rounded-lg px-2.5 py-1 text-lg hover:bg-white/10"
              onClick={() => setMonth((m) => shiftMonth(m, -1))}
              aria-label="Previous month"
            >
              ‹
            </button>
            <input
              type="month"
              value={month}
              max={currentMonth()}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              className="bg-transparent px-1 text-sm font-medium text-white outline-none"
            />
            <button
              className="rounded-lg px-2.5 py-1 text-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
              onClick={() => setMonth((m) => shiftMonth(m, 1))}
              disabled={isCurrentMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + Add expense
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {/* Stat cards */}
      <div className={`grid gap-4 sm:grid-cols-3 ${loadingSummary ? "animate-pulse" : ""}`}>
        <StatCard
          label="Total spent"
          value={formatCurrency(summary?.total)}
          hint={formatMonth(month)}
        />
        <StatCard label="Transactions" value={summary?.count ?? 0} hint="in this month" />
        <StatCard
          label="Top category"
          value={top ? top.category : "—"}
          hint={top ? `${formatCurrency(top.total)} · ${top.percentage}%` : "No data yet"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Category breakdown */}
        <section className="glass p-5 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Spending by category</h2>
          {!summary || summary.byCategory.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/50">
              {loadingSummary ? "Loading…" : "No expenses in this month."}
            </p>
          ) : (
            <ul className="space-y-4">
              {summary.byCategory.map((c) => (
                <li key={c.category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{c.category}</span>
                    <span className="text-white/80">
                      {formatCurrency(c.total)}{" "}
                      <span className="text-white/50">· {c.percentage}%</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${getCategoryStyle(c.category).bar}`}
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent expenses */}
        <section className="glass p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent expenses</h2>
            <div className="flex items-center gap-2">
              <Link to="/expenses" className="text-sm text-violet-200 hover:text-white">
                View all
              </Link>
              <button className="btn btn-ghost" onClick={() => setModalOpen(true)}>
                + Add
              </button>
            </div>
          </div>

          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/50">
              {loadingRecent ? "Loading…" : "No expenses yet. Add your first one!"}
            </p>
          ) : (
            <ul className="space-y-2">
              {recent.map((e) => (
                <li key={e._id} className="glass-soft flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.title}</p>
                    <p className="text-xs text-white/50">{formatDate(e.date)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <CategoryBadge category={e.category} />
                    <span className="w-24 text-right font-semibold">{formatCurrency(e.amount)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ExpenseModal
        open={modalOpen}
        expense={null}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}