import Expense, { CATEGORIES } from "../models/Expense.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Only these fields can be set by the client
const pickFields = (body) => {
  const { title, amount, category, date, note } = body;
  const data = { title, amount, category, note };
  if (date) data.date = date; // omitted -> model defaults to today
  return data;
};

// POST /api/expenses
export const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create(pickFields(req.body));
  res.status(201).json({ success: true, data: expense });
});

// GET /api/expenses?category=Food&from=2026-11-01&to=2026-11-30&title=lunch
export const getExpenses = asyncHandler(async (req, res) => {
  const { category, from, to, title } = req.query;
  const filter = {};

  if (category) filter.category = category;

  if (title) filter.title = { $regex: escapeRegex(title.trim()), $options: "i" };

  if (from || to) {
    filter.date = {};
    if (from) {
      const start = new Date(from);
      if (isNaN(start)) {
        res.status(400);
        throw new Error("Invalid 'from' date");
      }
      filter.date.$gte = start;
    }
    if (to) {
      const end = new Date(to);
      if (isNaN(end)) {
        res.status(400);
        throw new Error("Invalid 'to' date");
      }
      end.setUTCHours(23, 59, 59, 999); // include the whole 'to' day
      filter.date.$lte = end;
    }
  }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

  const [expenses, total, sums] = await Promise.all([
    Expense.find(filter)
      .sort({ date: -1, createdAt: -1, _id: -1 }) // _id = tiebreaker so pages never overlap
      .skip((page - 1) * limit)
      .limit(limit),
    Expense.countDocuments(filter),
    Expense.aggregate([{ $match: filter }, { $group: { _id: null, totalAmount: { $sum: "$amount" } } }]),
  ]);

  res.json({
    success: true,
    count: expenses.length,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    totalAmount: Math.round((sums[0]?.totalAmount || 0) * 100) / 100, // across ALL matching rows, not just this page
    data: expenses,
  });
});

// GET /api/expenses/:id
export const getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  res.json({ success: true, data: expense });
});

// PUT /api/expenses/:id
export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, pickFields(req.body), {
    new: true,
    runValidators: true,
  });
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  res.json({ success: true, data: expense });
});

// DELETE /api/expenses/:id
export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  res.json({ success: true, message: "Expense deleted", data: { _id: expense._id } });
});

// GET /api/expenses/summary?month=2026-11   (defaults to current month)
export const getMonthlySummary = asyncHandler(async (req, res) => {
  let year, month;
  if (req.query.month) {
    const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(req.query.month);
    if (!match) {
      res.status(400);
      throw new Error("month must be in YYYY-MM format");
    }
    year = Number(match[1]);
    month = Number(match[2]);
  } else {
    const now = new Date();
    year = now.getUTCFullYear();
    month = now.getUTCMonth() + 1;
  }

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1)); // exclusive

  const grouped = await Expense.aggregate([
    { $match: { date: { $gte: start, $lt: end } } },
    { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  const total = grouped.reduce((sum, g) => sum + g.total, 0);
  const count = grouped.reduce((sum, g) => sum + g.count, 0);

  const byCategory = grouped.map((g) => ({
    category: g._id,
    total: Math.round(g.total * 100) / 100,
    count: g.count,
    percentage: total ? Math.round((g.total / total) * 1000) / 10 : 0,
  }));

  res.json({
    success: true,
    data: {
      month: `${year}-${String(month).padStart(2, "0")}`,
      total: Math.round(total * 100) / 100,
      count,
      byCategory,
    },
  });
});


export const getCategories = (req, res) => {
  res.json({ success: true, data: CATEGORIES });
};