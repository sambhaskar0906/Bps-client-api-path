import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import nodemailer from 'nodemailer';
import Quotation from "../model/customerQuotation.model.js";
import { Customer } from "../model/customer.model.js";
import manageStation from "../model/manageStation.model.js";
import { QCustomer } from "../model/Qcustomer.model.js";
import { parse } from 'date-fns';
const formatQuotations = (quotations) => {
  return quotations.map((q, index) => ({
    "orderId": q.orderId || 'N/A',
    "S.No.": index + 1,
    "Booking ID": q.bookingId,
    "orderBy": q.createdByRole === "admin"
      ? "Admin"
      : `Supervisor ${q.startStation?.stationName || ''}`,
    "Date": q.quotationDate.toLocaleDateString('en-CA'),
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
    middleName, // in case user sends it
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
    toAddress,
    toCity,
    toState,
    toPincode,
    additionalCmt,
    sTax,
    amount,
    productDetails,
    locality,
    grandTotal
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

  // Now validate
  if (!firstName || !lastName) {
    return next(new ApiError(400, "Customer first and last name are required"));
  }

  if (!startStationName) {
    return next(new ApiError(400, "Start station name is required"));
  }

  if (!endStation) {
    return next(new ApiError(400, "End station is required"));
  }

  // 1. Find Customer
  const customer = await QCustomer.findOne({ firstName, lastName });
  if (!customer) return next(new ApiError(404, "Customer not found"));

  // 2. Find Start Station
  const station = await manageStation.findOne({ stationName: startStationName });
  if (!station) return next(new ApiError(404, "Start station not found"));

  // 3. Validate product details
  if (!Array.isArray(productDetails) || productDetails.length === 0) {
    return next(new ApiError(400, "At least one product must be provided"));
  }

  for (const product of productDetails) {
    if (
      !product.name ||
      typeof product.quantity !== "number" ||
      typeof product.price !== "number" ||
      typeof product.weight !== "number"
    ) {
      return next(new ApiError(400, "Invalid product details"));
    }
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
    mobile: customer.contactNumber,
    email: customer.emailId,
    locality: locality || customer.locality || "",
    quotationDate,
    proposedDeliveryDate,
    fromCustomerName,
    fromAddress,
    fromCity,
    fromState,
    fromPincode,
    toCustomerName,
    toAddress,
    toCity,
    toState,
    toPincode,
    additionalCmt,
    sTax: Number(sTax),
    amount: Number(amount),
    createdByUser: user._id,
    createdByRole: user.role,
    productDetails,
    grandTotal,
  });

  const formattedQuotation = {
    ...quotation.toObject(),
    quotationDate: new Date(quotation.quotationDate).toLocaleDateString("en-IN"),
    proposedDeliveryDate: new Date(quotation.proposedDeliveryDate).toLocaleDateString("en-IN"),
  };

  await quotation.save();
  await sendBookingEmail(customer.emailId, quotation);

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
    const from = parse(fromDate, 'dd-MM-yyyy', new Date());
    const to = parse(toDate, 'dd-MM-yyyy', new Date());
    to.setHours(23, 59, 59, 999); // Include entire 'toDate' day

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

  res.status(200).json(new ApiResponse(200, quotation));
});

// Update Quotation Controller
export const updateQuotation = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;
  const updatedData = req.body;

  const updatedQuotation = await Quotation.findOneAndUpdate({ bookingId }, updatedData, { new: true });

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
  const { bookingId } = req.params;  // Get the bookingId from the route parameter

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
    new Date(date).toLocaleDateString("en-CA");

  if (quotation.quotationDate) {
    quotation.quotationDate = formatDate(quotation.quotationDate);
  }

  if (quotation.proposedDeliveryDate) {
    quotation.proposedDeliveryDate = formatDate(quotation.proposedDeliveryDate);
  }
  res.status(200).json(new ApiResponse(200, quotation));
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
// Controller to get total revenue from quotations
export const getRevenue = asyncHandler(async (req, res) => {
  const filter = getRevenueBookingFilter(req.query.type, req.user);
  const quotations = await Quotation.find(filter)
    .select('bookingId quotationDate startStationName endStation grandTotal computedTotalRevenue amount sTax')
    .lean();

  // Calculate grandTotal = amount + sTax (use this instead of grandTotal field)
  const totalRevenue = quotations.reduce(
    (sum, q) => sum + ((q.amount || 0) + (q.sTax || 0)),
    0
  );

  console.log("Total Revenue:", totalRevenue);

  const data = quotations.map((q, index) => {
    const grandTotal = (q.amount || 0) + (q.sTax || 0);
    return {
      SNo: index + 1,
      bookingId: q.bookingId,
      date: q.quotationDate ? new Date(q.quotationDate).toISOString().slice(0, 10) : 'N/A',
      pickup: q.startStationName || 'Unknown',
      drop: q.endStation || 'Unknown',
      revenue: grandTotal.toFixed(2),
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
    amount
  } = booking;

  let productDetailsText = '';
  productDetails.forEach(product => {
    productDetailsText += `\nName: ${product.name}, Weight: ${product.weight}, Quantity: ${product.quantity}, Price: ${product.price}`;
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
        <ul>
          ${productDetails.map(product => `
            <li><strong>Name:</strong> ${product.name}, <strong>Weight:</strong> ${product.weight}, <strong>Quantity:</strong> ${product.quantity}, <strong>Price:</strong> ${product.price}</li>
          `).join('')}
        </ul>
        <p><strong>Grand Total:</strong> ${amount}</p>
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
