import { useEffect, useState } from "react";
import Modal from "./Modal";
import ExpenseForm from "./ExpenseForm";
import { createExpense, updateExpense, getErrorMessage } from "../api/expenseApi";

// expense = null  -> add mode,  expense = {...} -> edit mode
export default function ExpenseModal({ open, expense, categories, onClose, onSaved }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setError("");
  }, [open]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      if (expense) await updateExpense(expense._id, data);
      else await createExpense(data);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={expense ? "Edit expense" : "Add expense"} onClose={onClose}>
      <ExpenseForm
        key={expense?._id || "new"}
        initial={expense}
        categories={categories}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}