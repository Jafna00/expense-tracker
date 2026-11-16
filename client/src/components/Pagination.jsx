const getPages = (page, totalPages) => {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...wanted].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
};

export default function Pagination({ page, totalPages, total, pageSize, onChange }) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 px-5 py-3 text-sm">
      <span className="text-white/60">
        Showing {from}–{to} of {total}
      </span>

      <div className="flex items-center gap-1">
        <button className="btn btn-ghost !px-3 !py-1.5" disabled={page === 1} onClick={() => onChange(page - 1)}>
          Prev
        </button>

        {getPages(page, totalPages).map((p) =>
          typeof p === "string" ? (
            <span key={p} className="px-1 text-white/40">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`min-w-[2.25rem] rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
                p === page ? "bg-white/25 text-white" : "text-white/70 hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          className="btn btn-ghost !px-3 !py-1.5"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}