// controller/expense.controller.js
import { Expense } from "../model/expense.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs/promises";
const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0]; 
  };

export const createExpense = asyncHandler(async (req, res) => {
  const { title, date, invoiceNo, details, amount, taxAmount, totalAmount} = req.body;

 
  if ([title, date, invoiceNo, details, amount, taxAmount, totalAmount].some(field => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const document = req.files?.document?.[0]?.path || null;
  
  const existingExpense = await Expense.findOne({ invoiceNo });
  if (existingExpense) {
    throw new ApiError(409, "Expense with this invoice number already exists");
  }

  
  const expense = await Expense.create({ title, date, invoiceNo, details, amount, taxAmount, totalAmount ,document,createdBy: req.user._id,});

  return res.status(201).json(new ApiResponse(201, "Expense created successfully", expense));
});


export const getAllExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find(req.roleQueryFilter).sort({ createdAt: -1 });

  const expenseList = expenses.map((expense, index) => ({
    sNo: index + 1,
    invoiceNo: expense.invoiceNo,
    date: formatDate(expense.date),
    name: expense.title,
    taxableAmount: expense.amount,
    receiving:expense.document,
    total: expense.totalAmount,

    action: [
      { type: "view", invoiceNo: expense.invoiceNo },
      { type: "update", invoiceNo: expense.invoiceNo },
      { type: "delete", invoiceNo: expense.invoiceNo },
    ]
  }));

  return res.status(200).json(new ApiResponse(200, "All expenses fetched", expenseList));
});


export const getExpenseByNo = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ invoiceNo: req.params.invoiceNo });
  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }
  return res.status(200).json(new ApiResponse(200, "Expense found", expense));
});


export const updateExpenseByNo = asyncHandler(async (req, res) => {
  console.log("Req files",req.files);
  const document = req.files?.document?.[0]?.path || null;

  
  if (document) {
    req.body.document = document;
  }

  const updated = await Expense.findOneAndUpdate(
    { invoiceNo: req.params.invoiceNo },
    req.body,
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new ApiError(404, "Expense not found");
  }

  return res.status(200).json(new ApiResponse(200, "Expense updated successfully", updated));
});



export const deleteExpenseByNo = asyncHandler(async (req, res) => {
  const deleted = await Expense.findOneAndDelete({ invoiceNo: req.params.invoiceNo });

  if (!deleted) {
    throw new ApiError(404, "Expense not found");
  }

  return res.status(200).json(new ApiResponse(200, "Expense deleted successfully"));
});
