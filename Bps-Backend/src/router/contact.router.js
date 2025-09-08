import express from "express";
import {
  createContact,
  getAllContacts,
  getContactByNumber,
  updateContactByNumber,
  deleteContactByNumber,
} from "../controller/contact.controller.js";
import { parseFormData } from "../middleware/multerParser.middleware.js";
const router = express.Router();

router.route("/create").post(parseFormData,createContact)
router.route("/").get(getAllContacts);

router.route("/:contactNumber")
  .get(getContactByNumber)
  .put(updateContactByNumber)
  .delete(deleteContactByNumber);

export default router;
