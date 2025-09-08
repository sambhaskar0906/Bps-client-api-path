
import express from "express";
import { createExpense, getAllExpenses, getExpenseByNo, updateExpenseByNo, deleteExpenseByNo } from "../controller/expense.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { multerErrorHandler } from "../utils/multerErrorHandler.js";
const router = express.Router();


router.route("/createExpenses").post(upload.fields([
      {
          name:"document",
          maxCount :1
      }]),multerErrorHandler,createExpense);


router.get("/getExpenses", getAllExpenses);


router.get("/expense/:invoiceNo", getExpenseByNo);


router.route("/expense/:invoiceNo").put(upload.fields([
    {
        name:"document",
        maxCount :1
    }]),multerErrorHandler,updateExpenseByNo);


router.delete("/expense/:invoiceNo", deleteExpenseByNo);

export default router;
