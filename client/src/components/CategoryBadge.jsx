import { getCategoryStyle } from "../utils/format";

export default function CategoryBadge({ category }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        getCategoryStyle(category).badge
      }`}
    >
      {category}
    </span>
  );
}