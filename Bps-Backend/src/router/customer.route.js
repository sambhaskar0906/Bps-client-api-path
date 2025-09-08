import { Router } from 'express';
import {
  createCustomer,
  getAllCustomers,
  getTotalCustomerCount,
  getCustomerByCustomerId,
  updateCustomer,
  deleteCustomer,
  getActiveCustomerCount,
  getBlacklistedCustomerCount,
  getBlockedCustomers,
  getActiveCustomers,
  updateCustomerStatusToBlacklisted,
  updateCustomerStatusToActive,

} from '../controller/customer.controller.js';
import { parseFormData } from "../middleware/multerParser.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { multerErrorHandler } from "../utils/multerErrorHandler.js";
const router = Router();

// Create a new customer
router.route("/create").post(
  upload.fields([
    {
      name: "idProofPhoto",
      maxCount: 1
    }, {
      name: "customerProfilePhoto",
      maxCount: 1
    }
  ]), multerErrorHandler,
  createCustomer)

// Get all customers
router.get('/all', getAllCustomers);

// Get total customer count
router.get('/total-count', getTotalCustomerCount);

// Get active customer count
router.get('/active-count', getActiveCustomerCount);

// Get blacklisted customer count
router.get('/blacklisted-count', getBlacklistedCustomerCount);

// Get active customers list
router.get('/active-list', getActiveCustomers);

// Get blacklisted (blocked) customers list
router.get('/blacklisted-list', getBlockedCustomers);

// Get customer by customerId
router.get('/:customerId', getCustomerByCustomerId);

// Update customer
router.put('/update/:customerId', upload.fields([{ name: 'idProofPhoto', maxCount: 1 }, { name: 'customerProfilePhoto', maxCount: 1 }]), updateCustomer);

// Delete customer
router.delete('/delete/:customerId', deleteCustomer);

router.patch("/status/activate/:customerId", updateCustomerStatusToActive);
router.patch("/status/blacklist/:customerId", updateCustomerStatusToBlacklisted);


export default router;
