import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import nodemailer from 'nodemailer';
import Quotation from "../model/customerQuotation.model.js";
import { Customer } from "../model/customer.model.js";
import manageStation from "../model/manageStation.model.js";
import { QCustomer } from "../model/Qcustomer.model.js";
import { parse } from 'date-fns';

const normalizeDate = (inputDate) => {
  if (!inputDate) return null;

  const [y, m, d] = inputDate.split("-");

  return new Date(Date.UTC(y, m - 1, d));
};

const formatDateOnly = (date) =>
  date ? new Date(date).toISOString().slice(0, 10) : null;


const formatQuotations = (quotations) => {
  return quotations.map((q, index) => ({
    "orderId": q.orderId || 'N/A',
    "S.No.": index + 1,
    "Booking ID": q.bookingId,
    "orderBy": q.createdByRole === "admin"
      ? "Admin"
      : `Supervisor ${q.startStation?.stationName || ''}`,
    "Date": formatDateOnly(q.quotationDate),
    "Name": q.customerId
      ? `${q.customerId.firstName} ${q.customerId.lastName}`
      : `${q.firstName || ""} ${q.lastName || ""}`.trim(),
    "pickup": q.startStation?.stationName || q.startStationName || 'N/A',
    "": "",
    "Name (Drop)": q.toCustomerName || "",
    "drop": q.endStation || "",
    "Contact": q.mobile || "",
    "Action": [
      { name: "View", icon: "view-icon", action: `/api/quotations/${q._id}` },
      { name: "Edit", icon: "edit-icon", action: `/api/quotations/edit/${q._id}` },
      { name: "Delete", icon: "delete-icon", action: `/api/quotations/delete/${q._id}` },
    ],
  }));
};
//base condition
const getBookingFilterByType = (type, user) => {
  let baseFilter = {};

  if (type === 'active') {
    baseFilter = { activeDelivery: true };
  } else if (type === 'cancelled') {
    baseFilter = { totalCancelled: { $gt: 0 } };
  } else {
    baseFilter = {
      activeDelivery: false,
      isDelivered: { $ne: true },
      totalCancelled: 0,
      $or: [
        { createdByRole: { $in: ['admin', 'supervisor'] } },
        { requestedByRole: 'public', isApproved: true }
      ]
    };
  }

  if (user?.role === 'supervisor') {
    return {
      $and: [
        baseFilter,
        { createdByUser: user._id }
      ]
    };
  }

  return baseFilter;
};
// Create Quotation Controller
export const createQuotation = asyncHandler(async (req, res, next) => {
  const user = req.user;
  let {
    firstName,
    lastName,
    middleName,
    startStationName,
    endStation,
    quotationDate,
    proposedDeliveryDate,
    fromCustomerName,
    fromAddress,
    fromCity,
    fromState,
    fromPincode,
    toCustomerName,
    toContactNumber,
    toAddress,
    toCity,
    toState,
    toPincode,
    additionalCmt,
    sTax,
    sgst,
    amount,
    productDetails,
    locality,
    grandTotal,
    freight,
    contactNumber,
    email
  } = req.body;

  // Auto-extract name if missing
  if ((!firstName || !lastName) && fromCustomerName) {
    const parts = fromCustomerName.trim().split(" ");
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  } else if ((!firstName || !lastName) && toCustomerName) {
    const parts = toCustomerName.trim().split(" ");
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  // Validate required fields
  if (!firstName || !lastName) {
    return next(new ApiError(400, "Customer first and last name are required"));
  }

  if (!startStationName) {
    return next(new ApiError(400, "Start station name is required"));
  }

  if (!endStation) {
    return next(new ApiError(400, "End station is required"));
  }

  // Validate dates
  if (!quotationDate || !proposedDeliveryDate) {
    return next(new ApiError(400, "Quotation date and proposed delivery date are required"));
  }

  // 1. Find or Create Customer
  let customer = await QCustomer.findOne({
    $or: [
      { contactNumber: req.body.contactNumber },
      { emailId: req.body.email },
      { firstName, lastName }
    ]
  });

  if (!customer) {
    // Create new customer if not found
    customer = new QCustomer({
      firstName,
      middleName: middleName || "",
      lastName,
      contactNumber: req.body.contactNumber || "",
      emailId: req.body.email || "",
      locality: locality || ""
    });
    await customer.save();
  }

  // 2. Find Start Station
  const station = await manageStation.findOne({ stationName: startStationName });
  if (!station) return next(new ApiError(404, "Start station not found"));

  // 3. Validate product details (including insurance)
  if (!Array.isArray(productDetails) || productDetails.length === 0) {
    return next(new ApiError(400, "At least one product must be provided"));
  }

  for (const product of productDetails) {
    if (
      !product.name ||
      typeof product.quantity !== 'number' ||
      product.quantity <= 0 ||
      typeof product.price !== 'number' ||
      product.price < 0 ||
      typeof product.weight !== 'number' ||
      product.weight < 0 ||
      !product.topay ||
      (product.insurance !== undefined && (typeof product.insurance !== 'number' || product.insurance < 0))
    ) {
      return next(new ApiError(400, "Invalid product details. Please check name, quantity, price, weight, topay, and insurance fields."));
    }
  }

  // Calculate grandTotal if not provided
  let calculatedGrandTotal = grandTotal;
  if (!calculatedGrandTotal) {
    // Calculate product total including insurance
    const productTotal = productDetails.reduce((acc, item) => {
      const itemTotal = (item.price * item.quantity);
      const itemInsurance = item.insurance || 0;
      const itemVpp = item.vppAmount || 0;
      return acc + itemTotal + itemInsurance;
    }, 0);

    // Calculate tax only on product value (excluding insurance)
    const productValueTotal = productDetails.reduce((acc, item) =>
      acc + (item.price * item.quantity), 0
    );

    const taxAmount = (productValueTotal * (Number(sTax) || 0)) / 100;
    const sgstAmount = (productValueTotal * (Number(sgst) || 0)) / 100;

    calculatedGrandTotal = productTotal + taxAmount + sgstAmount + (Number(freight) || 0) + (Number(amount) || 0);
  }

  // 4. Create and Save Quotation
  const quotation = new Quotation({
    customerId: customer._id,
    startStation: station._id,
    startStationName: station.stationName,
    endStation,
    firstName: customer.firstName,
    middleName: customer.middleName || middleName || "",
    lastName: customer.lastName,
    mobile: customer.contactNumber || req.body.contactNumber,
    email: customer.emailId || req.body.email,
    locality: locality || customer.locality || "",
    quotationDate: normalizeDate(quotationDate),
    proposedDeliveryDate: normalizeDate(proposedDeliveryDate),
    fromCustomerName: fromCustomerName || `${firstName} ${lastName}`.trim(),
    fromAddress,
    fromCity,
    fromState,
    fromPincode,
    toCustomerName: toCustomerName || fromCustomerName || `${firstName} ${lastName}`.trim(),
    toContactNumber: toContactNumber || contactNumber,
    toAddress: toAddress || fromAddress,
    toCity: toCity || fromCity,
    toState: toState || fromState,
    toPincode: toPincode || fromPincode,
    additionalCmt,
    sTax: Number(sTax) || 0,
    sgst: Number(sgst) || 0,
    amount: Number(amount) || 0,
    freight: Number(freight) || 0,
    createdByUser: user._id,
    createdByRole: user.role,
    productDetails: productDetails.map(item => ({
      ...item,
      insurance: item.insurance || 0,
      vppAmount: item.vppAmount || 0,
      receiptNo: item.receiptNo || "",
      refNo: item.refNo || ""
    })),
    grandTotal: calculatedGrandTotal,
  });

  await quotation.save();

  const formattedQuotation = {
    ...quotation.toObject(),
    quotationDate: formatDateOnly(quotation.quotationDate),
    proposedDeliveryDate: formatDateOnly(quotation.proposedDeliveryDate),
    totalInsurance: quotation.totalInsurance, // Include total insurance in response
    computedTotalRevenue: quotation.computedTotalRevenue // Include computed total
  };

  res.status(201).json(new ApiResponse(201, formattedQuotation, "Quotation created successfully"));
});

export const getBookingSummaryByDate = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    const user = req.user;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: "Both fromDate and toDate are required" });
    }

    // ✅ Parse dd-MM-yyyy format correctly
    const from = new Date(`${fromDate}T00:00:00.000Z`);
    const to = new Date(`${toDate}T23:59:59.999Z`);
    to.setHours(23, 59, 59, 999);

    // 🧠 Build query
    const query = {
      quotationDate: { $gte: from, $lte: to }
    };

    if (user.role === "supervisor") {
      query.createdByUser = user._id;
    }

    const bookings = await Quotation.find(query).sort({ bookingDate: -1 });

    const bookingSummaries = bookings.map((booking) => ({
      ...booking.toObject(),
      itemsCount: booking.items?.length || 0,
    }));

    res.status(200).json({
      message: `Bookings from ${fromDate} to ${toDate}`,
      total: bookingSummaries.length,
      bookings: bookingSummaries,
    });
  } catch (error) {
    console.error("Error fetching bookings by date:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Quotations Controller
export const getAllQuotations = asyncHandler(async (req, res) => {
  const quotations = await Quotation.find()
    .populate("startStation", "stationName")
    .populate("customerId", "firstName lastName");
  console.log(quotations)
  const formatted = formatQuotations(quotations);


  res.status(200).json(new ApiResponse(200, formatted));
});

// Get Quotation by ID Controller
export const getQuotationById = asyncHandler(async (req, res, next) => {
  const quotation = await Quotation.findById(req.params.id)
    .populate("startStation", "stationName")
    .populate("customerId", "firstName lastName");

  if (!quotation) return next(new ApiError(404, "Quotation not found"));

  // Add virtual fields to response
  const quotationWithVirtuals = {
    ...quotation.toObject(),
    toContactNumber: quotation.toContactNumber || quotation.mobile,
    totalInsurance: quotation.totalInsurance,
    totalVppAmount: quotation.totalVppAmount,
    productTotal: quotation.productTotal,
    computedTotalRevenue: quotation.computedTotalRevenue
  };

  res.status(200).json(new ApiResponse(200, quotationWithVirtuals));
});


// Update Quotation Controller
export const updateQuotation = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;
  const updatedData = req.body;

  // If productDetails is being updated, recalculate grandTotal
  if (updatedData.productDetails) {
    // Validate product details including insurance
    for (const product of updatedData.productDetails) {
      if (
        (product.insurance !== undefined && (typeof product.insurance !== 'number' || product.insurance < 0)) ||
        (product.vppAmount !== undefined && (typeof product.vppAmount !== 'number' || product.vppAmount < 0)) // ADD THIS
      ) {
        return next(new ApiError(400, "Insurance and vppAmount must be non-negative numbers"));
      }
    }
    // Get existing quotation to calculate with current tax rates
    const existingQuotation = await Quotation.findOne({ bookingId });
    if (existingQuotation) {
      // Calculate product total including insurance
      const productTotal = updatedData.productDetails.reduce((acc, item) => {
        const itemTotal = (item.price * item.quantity);
        const itemInsurance = item.insurance || 0;
        const itemVpp = item.vppAmount || 0;
        return acc + itemTotal + itemInsurance;
      }, 0);

      // Calculate tax only on product value (excluding insurance)
      const productValueTotal = updatedData.productDetails.reduce((acc, item) =>
        acc + (item.price * item.quantity), 0
      );

      const taxAmount = (productValueTotal * (existingQuotation.sTax || 0)) / 100;
      const sgstAmount = (productValueTotal * (existingQuotation.sgst || 0)) / 100;

      updatedData.grandTotal = productTotal + taxAmount + sgstAmount +
        (existingQuotation.freight || 0) +
        (existingQuotation.amount || 0);
    }
  }

  const updatedQuotation = await Quotation.findOneAndUpdate(
    { bookingId },
    updatedData,
    { new: true }
  );

  if (!updatedQuotation) return next(new ApiError(404, "Quotation not found"));

  res.status(200).json(new ApiResponse(200, updatedQuotation, "Quotation updated successfully"));
});

// Delete Quotation Controller
export const deleteQuotation = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;

  const deletedQuotation = await Quotation.findOneAndDelete({ bookingId });

  if (!deletedQuotation) {
    return next(new ApiError(404, "Quotation not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Quotation deleted successfully"));
});


// Get Total Booking Requests Controller
export const getTotalBookingRequests = asyncHandler(async (req, res) => {
  const filter = getBookingFilterByType('request', req.user); // 'request' means non-active, non-cancelled

  const total = await Quotation.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, { totalBookingRequests: total }));
});

// Get Total Active Deliveries Controller
export const getTotalActiveDeliveries = asyncHandler(async (req, res) => {
  const filter = getBookingFilterByType('active', req.user);
  const total = await Quotation.countDocuments(filter);
  res.status(200).json(new ApiResponse(200, { totalActiveDeliveries: total }));
});

// Get Total Cancelled Quotations Controller
export const getTotalCancelled = asyncHandler(async (req, res) => {
  const filter = getBookingFilterByType('request', req.user);
  const total = await Quotation.countDocuments(filter);
  res.status(200).json(new ApiResponse(200, { totalCancelled: total }));
});

export const getTotalRevenue = asyncHandler(async (req, res) => {
  const quotations = await Quotation.find();

  const totalRevenue = quotations.reduce((sum, q) => sum + (q.amount || 0), 0);

  console.log("Total Revenue:", totalRevenue);
  res.status(200).json(new ApiResponse(200, { totalRevenue }));
});

export const searchQuotationByBookingId = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    return next(new ApiError(400, "Booking ID is required"));
  }

  const quotation = await Quotation.findOne({ bookingId })
    .populate("startStation", "stationName gst address contact")
    .populate("customerId", "firstName lastName")
    .lean();

  if (!quotation) {
    return next(new ApiError(404, "Quotation not found with the provided Booking ID"));
  }

  const formatDate = (date) =>
    date ? new Date(date).toISOString().slice(0, 10) : null;


  if (quotation.quotationDate) {
    quotation.quotationDate = formatDate(quotation.quotationDate);
  }

  if (quotation.proposedDeliveryDate) {
    quotation.proposedDeliveryDate = formatDate(quotation.proposedDeliveryDate);
  }

  // Calculate insurance total for the response
  const totalInsurance = quotation.productDetails.reduce((acc, item) =>
    acc + (item.insurance || 0), 0
  );

  res.status(200).json(new ApiResponse(200, {
    ...quotation,
    toContactNumber: quotation.toContactNumber || quotation.mobile,
    totalInsurance,
    productTotal: quotation.productTotal,
    computedTotalRevenue: quotation.computedTotalRevenue
  }));
});

export const getActiveList = asyncHandler(async (req, res) => {

  const filter = getBookingFilterByType('active', req.user);

  const activeQuotations = await Quotation.find(filter)
    .populate("startStation", "stationName")
    .populate("customerId", "firstName lastName");

  const formatted = formatQuotations(activeQuotations);

  res.status(200).json(new ApiResponse(200, {
    totalActiveDeliveries: activeQuotations.length,
    deliveries: formatted
  }));
});

export const getCancelledList = asyncHandler(async (req, res) => {
  const filter = getBookingFilterByType('cancelled', req.user);
  const cancelledQuotations = await Quotation.find(filter)
    .populate("startStation", "stationName")
    .populate("customerId", "firstName lastName");

  const formatted = formatQuotations(cancelledQuotations);

  res.status(200).json(new ApiResponse(200, {
    totalCancelledDeliveries: cancelledQuotations.length,
    deliveries: formatted
  }));
});
const getRevenueBookingFilter = (type, user) => {
  const base = getBookingFilterByType(type, user);
  if (base.$and) {
    base.$and.unshift({ isDelivered: true });
    return base;
  }
  return { ...base, isDelivered: true };
};

// Controller to get revenue details from quotations
export const getRevenue = asyncHandler(async (req, res) => {
  const filter = getRevenueBookingFilter(req.query.type, req.user);
  const quotations = await Quotation.find(filter)
    .select('bookingId quotationDate startStationName endStation grandTotal computedTotalRevenue amount sTax productDetails')
    .lean();

  // Calculate revenue including insurance
  const totalRevenue = quotations.reduce((sum, q) => {
    // Calculate product value total
    const productValueTotal = q.productDetails.reduce((acc, item) =>
      acc + (item.price * item.quantity), 0
    );

    // Calculate total insurance
    const totalInsurance = q.productDetails.reduce((acc, item) =>
      acc + (item.insurance || 0), 0
    );
    const totalVppAmount = q.productDetails.reduce((acc, item) =>
      acc + (item.vppAmount || 0), 0
    );
    // Calculate tax on product value only
    const taxAmount = (productValueTotal * (q.sTax || 0)) / 100;

    // Total revenue = product value + insurance + tax
    return sum + productValueTotal + totalInsurance + totalVppAmount + taxAmount + (q.amount || 0);
  }, 0);

  console.log("Total Revenue (including insurance):", totalRevenue);

  const data = quotations.map((q, index) => {
    // Calculate for each quotation
    const productValueTotal = q.productDetails.reduce((acc, item) =>
      acc + (item.price * item.quantity), 0
    );
    const totalInsurance = q.productDetails.reduce((acc, item) =>
      acc + (item.insurance || 0), 0
    );
    const totalVppAmount = q.productDetails.reduce((acc, item) =>
      acc + (item.vppAmount || 0), 0
    );
    const taxAmount = (productValueTotal * (q.sTax || 0)) / 100;
    const revenue = productValueTotal + totalInsurance + totalVppAmount + taxAmount + (q.amount || 0);

    return {
      SNo: index + 1,
      bookingId: q.bookingId,
      date: q.quotationDate ? new Date(q.quotationDate).toISOString().slice(0, 10) : 'N/A',
      pickup: q.startStationName || 'Unknown',
      drop: q.endStation || 'Unknown',
      productValue: productValueTotal.toFixed(2),
      insurance: totalInsurance.toFixed(2),
      vppAmount: totalVppAmount.toFixed(2),
      tax: taxAmount.toFixed(2),
      revenue: revenue.toFixed(2),
    };
  });

  res.status(200).json({
    totalRevenue: totalRevenue.toFixed(2),
    count: data.length,
    data,
  });
});

// Update Quotation Status Controller (query only, no cancel reason)
export const updateQuotationStatus = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;
  const { activeDelivery } = req.query;

  if (activeDelivery !== 'true' && activeDelivery !== 'false') {
    return next(new ApiError(400, "activeDelivery must be 'true' or 'false' as a query param"));
  }

  const isActive = activeDelivery === 'true';

  const updateFields = {
    activeDelivery: isActive,
    totalCancelled: isActive ? 0 : 1,
    cancelReason: isActive ? undefined : "", // Optional: reset or blank reason
  };

  const updatedQuotation = await Quotation.findOneAndUpdate(
    { bookingId },
    { $set: updateFields },
    { new: true }
  );

  if (!updatedQuotation) {
    return next(new ApiError(404, "Quotation not found"));
  }

  const statusMsg = isActive ? "Quotation marked as active" : "Quotation cancelled";
  res.status(200).json(new ApiResponse(200, updatedQuotation, statusMsg));
});

// Get List of Booking Requests (Not active, not cancelled)
export const RequestBookingList = asyncHandler(async (req, res) => {
  const filter = getBookingFilterByType('request', req.user);
  const quotations = await Quotation.find(filter)
    .populate("startStation", "stationName")
    .populate("customerId", "firstName lastName");


  const formatted = formatQuotations(quotations);

  // Return the formatted list
  res.status(200).json(new ApiResponse(200, {
    totalNonActiveNonCancelled: quotations.length,
    deliveries: formatted
  }));
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.gmail,
    pass: process.env.app_pass
  }
});

export const sendBookingEmail = async (email, booking) => {
  const {
    firstName,
    lastName,
    fromAddress,
    fromCity,
    fromState,
    fromPincode,
    toAddress,
    toState,
    toCity,
    toPincode,
    productDetails,
    amount,
    grandTotal,
    totalInsurance
  } = booking;

  let productDetailsText = '';
  productDetails.forEach(product => {
    productDetailsText += `\nName: ${product.name}, Weight: ${product.weight}, Quantity: ${product.quantity}, Price: ${product.price}, Insurance: ₹${product.insurance || 0}`;
  });

  const mailOptions = {
    from: process.env.gmail,
    to: email,
    subject: `Quotation Details - ${booking.bookingId}`,
    html: `
        <h2><b>Quotation Details</b></h2>
        <p>Dear ${firstName} ${lastName},</p>
        <p>Your booking with Booking ID: <strong>${booking.bookingId}</strong> has been successfully created.</p>
        <p><strong>From Address:</strong> ${fromAddress}, ${fromCity}, ${fromState}, ${fromPincode}</p>
        <p><strong>To Address:</strong> ${toAddress}, ${toCity}, ${toState}, ${toPincode}</p>
        <h3>Product Details:</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
          <thead>
            <tr>
              <th>Name</th>
              <th>Weight</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Insurance</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${productDetails.map(product => `
              <tr>
                <td>${product.name}</td>
                <td>${product.weight}</td>
                <td>${product.quantity}</td>
                <td>₹${product.price}</td>
                <td>₹${product.insurance || 0}</td>
                <td>₹${(product.price * product.quantity) + (product.insurance || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${totalInsurance > 0 ? `<p><strong>Total Insurance:</strong> ₹${totalInsurance}</p>` : ''}
        <p><strong>Grand Total:</strong> ₹${grandTotal || amount}</p>
        <p>Thank you for choosing our service.</p>
        <p>Best regards,<br>BharatParcel Team</p>
      `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
};
export const sendBookingEmailById = async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Populate the 'customerId' field with email and name
    const booking = await Quotation.findOne({ bookingId }).populate('customerId', 'emailId firstName lastName');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check populated customer data
    const customer = booking.customerId;

    if (!customer?.emailId) {
      return res.status(400).json({ message: 'Customer email not available' });
    }

    // Send the email
    await sendBookingEmail(customer.emailId, {
      ...booking.toObject(),
      firstName: customer.firstName,
      lastName: customer.lastName
    });

    res.status(200).json({ message: 'Booking confirmation email sent successfully' });
  } catch (error) {
    console.error('Error sending booking email by ID:', bookingId, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getIncomingQuotations = asyncHandler(async (req, res) => {
  const user = req.user; // logged-in user
  const { fromDate, toDate } = req.body;

  if (!fromDate || !toDate) {
    return res.status(400).json({ message: "fromDate and toDate are required" });
  }

  // Parse dates
  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999);

  let quotationFilter = {
    quotationDate: { $gte: from, $lte: to },
    isDelivered: false,
    activeDelivery: false,
  };

  if (user.role === "supervisor") {
    if (!user.startStation) {
      return res.status(400).json({ message: "Supervisor must have a startStation assigned" });
    }

    const supervisorStation = await manageStation.findOne({
      stationName: user.startStation,
    });

    if (!supervisorStation) {
      return res.status(404).json({ message: "Supervisor's station not found" });
    }

    quotationFilter.endStation = supervisorStation.stationName;
  }

  // Fetch quotations
  const quotations = await Quotation.find(quotationFilter)
    .populate("startStation", "stationName")
    .populate("endStation", "stationName")
    .populate("customerId", "firstName lastName emailId")
    .lean();

  res.status(200).json({
    success: true,
    count: quotations.length,
    data: quotations,
  });
});
