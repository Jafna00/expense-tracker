import { useState } from "react";
import { toInputDate } from "../utils/format";

export default function ExpenseForm({ initial, categories, submitting, error, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    title: initial?.title ?? "",
    amount: initial?.amount ?? "",
    category: initial?.category ?? "",
    date: toInputDate(initial?.date), // defaults to today when adding
    note: initial?.note ?? "",
  }));
  const [localError, setLocalError] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(form.amount);

    if (!form.title.trim()) return setLocalError("Title is required");
    if (!amount || amount <= 0) return setLocalError("Enter an amount greater than 0");
    if (!form.category) return setLocalError("Please select a category");
    if (!form.date) return setLocalError("Date is required");

    setLocalError("");
    onSubmit({
      title: form.title.trim(),
      amount,
      category: form.category,
      date: form.date,
      note: form.note.trim(),
    });
  };

  const shownError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-white/70">Title *</label>
        <input
          className="glass-input"
          placeholder="e.g. Lunch with team"
          maxLength={100}
          value={form.title}
          onChange={update("title")}
          autoFocus
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70">Amount (₹) *</label>
          <input
            className="glass-input"
            type="number"
            step="0.01"
            min="0.01"
            inputMode="decimal"
            placeholder="0.00"
            value={form.amount}
            onChange={update("amount")}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70">Date *</label>
          <input className="glass-input" type="date" value={form.date} onChange={update("date")} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-white/70">Category *</label>
        <select className="glass-input" value={form.category} onChange={update("category")}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-white/70">Note (optional)</label>
        <textarea
          className="glass-input resize-none"
          rows={3}
          maxLength={500}
          placeholder="Anything worth remembering…"
          value={form.note}
          onChange={update("note")}
        />
      </div>

      {shownError && (
        <p className="rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-2 text-sm text-red-200">
          {shownError}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save changes" : "Add expense"}
        </button>
      </div>
    </form>
  );
}