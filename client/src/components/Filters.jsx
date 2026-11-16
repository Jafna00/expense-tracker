import { useEffect, useState } from "react";

const MIN_DATE = "2000-01-01";
const MAX_DATE = "2099-12-31";

// A real calendar date inside the allowed range (rejects 2026-02-31, year 0002, etc.)
const isValidDate = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  if (s < MIN_DATE || s > MAX_DATE) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-white/70">{label}</label>
      {children}
    </div>
  );
}

// Keeps what the user is typing locally; only complete, valid dates reach the filters
function DateField({ label, value, onCommit }) {
  const [draft, setDraft] = useState(value);

  // Keep in sync when the filter changes from outside (Clear filters, range auto-adjust)
  useEffect(() => setDraft(value), [value]);

  const handleChange = (e) => {
    const v = e.target.value;
    setDraft(v);
    if (v === "") onCommit(""); // field cleared
    else if (isValidDate(v)) onCommit(v); // incomplete/impossible values are ignored
  };

  return (
    <Field label={label}>
      <input
        className="glass-input"
        type="date"
        value={draft}
        min={MIN_DATE}
        max={MAX_DATE}
        onChange={handleChange}
        onBlur={() => setDraft(value)} // drop anything that was never accepted
      />
    </Field>
  );
}

export default function Filters({ filters, categories, onChange, onClear }) {
  const hasFilters = Object.values(filters).some(Boolean);

  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  // If the new date would invert the range, move the OTHER end to match
  const commitDate = (key) => (value) => {
    const next = { ...filters, [key]: value };
    if (value && next.from && next.to && next.from > next.to) {
      if (key === "from") next.to = value;
      else next.from = value;
    }
    onChange(next);
  };

  return (
    <div className="glass p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Search title">
          <input
            className="glass-input"
            placeholder="Search…"
            value={filters.title}
            onChange={set("title")}
          />
        </Field>

        <Field label="Category">
          <select className="glass-input" value={filters.category} onChange={set("category")}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <DateField label="From" value={filters.from} onCommit={commitDate("from")} />
        <DateField label="To" value={filters.to} onCommit={commitDate("to")} />
      </div>

      {hasFilters && (
        <div className="mt-3 flex justify-end">
          <button className="btn btn-ghost" onClick={onClear}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}