import CategoryBadge from "./CategoryBadge";
import { formatCurrency, formatDate } from "../utils/format";

export default function ExpenseTable({ expenses, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/15 text-xs uppercase tracking-wide text-white/60">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Note</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e._id} className="border-b border-white/10 transition hover:bg-white/5">
              <td className="whitespace-nowrap px-4 py-3 text-white/80">{formatDate(e.date)}</td>
              <td className="px-4 py-3 font-medium">{e.title}</td>
              <td className="px-4 py-3">
                <CategoryBadge category={e.category} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                {formatCurrency(e.amount)}
              </td>
              <td className="max-w-[220px] truncate px-4 py-3 text-white/60" title={e.note}>
                {e.note || "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(e)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-400/15"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(e)}
                  className="ml-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-400/15"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}