import { useEffect, useState } from "react";
import { fetchCategories } from "../api/expenseApi";
import { DEFAULT_CATEGORIES } from "../utils/format";

export default function useCategories() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    let ignore = false;
    fetchCategories()
      .then((data) => {
        if (!ignore && data?.length) setCategories(data);
      })
      .catch(() => {}); // fall back to defaults
    return () => {
      ignore = true;
    };
  }, []);

  return categories;
}