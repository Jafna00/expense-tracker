import { useEffect, useState } from "react";
import { fetchExpensePage, deleteExpense, getErrorMessage } from "../api/expenseApi";
import useCategories from "../hooks/useCategories";
import useDebounce from "../hooks/useDebounce";
import Filters from "../components/Filters";
import ExpenseTable from "../components/ExpenseTable";
import ExpenseModal from "../components/ExpenseModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatCurrency } from "../utils/format";
import Pagination from "../components/Pagination";

const EMPTY_FILTERS = { title: "", category: "", from: "", to: "" };
const PAGE_SIZE = 10;

export default function Expenses() {
  const categories = useCategories();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const debouncedTitle = useDebounce(filters.title, 400);

  const [expenses, setExpenses] = useState([]);
    const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [modal, setModal] = useState({ open: false, expense: null });
  const [toDelete, setToDelete] = useState(null);

    useEffect(() => {
    let ignore = false;
    setLoading(true);
    fetchExpensePage({
      category: filters.category,
      from: filters.from,
      to: filters.to,
      title: debouncedTitle,
      page,
      limit: PAGE_SIZE,
    })
      .then((res) => {
        if (ignore) return;
        // current page no longer exists (rows deleted) -> jump to the last page
        if (res.pagination.totalPages > 0 && page > res.pagination.totalPages) {
          setPage(res.pagination.totalPages);
          return;
        }
        setExpenses(res.data);
        setMeta({
          total: res.pagination.total,
          totalPages: Math.max(res.pagination.totalPages, 1),
          totalAmount: res.totalAmount,
        });
        setError("");
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [filters.category, filters.from, filters.to, debouncedTitle, page, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Expenses</h1>
          <p className="text-sm text-white/60">All your expenses, most recent first</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, expense: null })}>
          + Add expense
        </button>
      </div>

            <Filters
        filters={filters}
        categories={categories}
        onChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
        onClear={() => {
          setFilters(EMPTY_FILTERS);
          setPage(1);
        }}
      />

      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <section className="glass overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 px-5 py-3 text-sm">
                   <span className="text-white/70">
            {loading ? "Loading…" : `${meta.total} expense${meta.total === 1 ? "" : "s"}`}
          </span>
          <span className="font-semibold">Total: {formatCurrency(meta.totalAmount)}</span>
        </div>

        {expenses.length === 0 && !loading ? (
          <p className="px-5 py-12 text-center text-sm text-white/50">
            No expenses found. Try changing the filters or add a new expense.
          </p>
        ) : (
          <ExpenseTable
            expenses={expenses}
            onEdit={(expense) => setModal({ open: true, expense })}
            onDelete={setToDelete}
          />
          
        )}
         <Pagination
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </section>

      <ExpenseModal
        open={modal.open}
        expense={modal.expense}
        categories={categories}
        onClose={() => setModal({ open: false, expense: null })}
        onSaved={() => {
          setModal({ open: false, expense: null });
          refresh();
        }}
      />
      

      <ConfirmDialog
        open={!!toDelete}
        title="Delete expense?"
        message={`"${toDelete?.title ?? ""}" will be permanently removed. This can't be undone.`}
        onClose={() => setToDelete(null)}
              onConfirm={async () => {
          await deleteExpense(toDelete._id);
          setToDelete(null);
          if (expenses.length === 1 && page > 1) setPage((p) => p - 1);
          else refresh();
        }}
      />
    </div>
  );
}