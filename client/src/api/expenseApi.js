import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const getErrorMessage = (err) =>
  err.response?.data?.message || err.message || "Something went wrong";

const clean = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));

export const fetchExpenses = (params = {}) =>
  api.get("/expenses", { params: clean(params) }).then((r) => r.data.data);

// Paginated list: returns { data, pagination, totalAmount }
export const fetchExpensePage = (params = {}) =>
  api.get("/expenses", { params: clean(params) }).then((r) => r.data);

export const fetchSummary = (month) =>
  api.get("/expenses/summary", { params: { month } }).then((r) => r.data.data);

export const fetchCategories = () =>
  api.get("/expenses/categories").then((r) => r.data.data);

export const createExpense = (data) =>
  api.post("/expenses", data).then((r) => r.data.data);

export const updateExpense = (id, data) =>
  api.put(`/expenses/${id}`, data).then((r) => r.data.data);

export const deleteExpense = (id) =>
  api.delete(`/expenses/${id}`).then((r) => r.data);