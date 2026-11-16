import express from "express";
import validateId from "../middleware/validateId.js";
import {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
  getCategories,
} from "../controllers/expenseController.js";

const router = express.Router();


router.get("/summary", getMonthlySummary);
router.get("/categories", getCategories);

router.route("/").get(getExpenses).post(createExpense);

router
  .route("/:id")
  .get(validateId, getExpense)
  .put(validateId, updateExpense)
  .delete(validateId, deleteExpense);

export default router;