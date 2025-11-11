import Booking from '../model/booking.model.js';
import Station from '../model/manageStation.model.js';
import { Customer } from '../model/customer.model.js';
import nodemailer from 'nodemailer';
import { User } from '../model/user.model.js'
import { sendBookingConfirmation } from './whatsappController.js'
import { sendWhatsAppMessage } from '../services/whatsappServices.js'
import { ApiResponse } from "../utils/ApiResponse.js"
import { generateInvoiceNumber } from "../utils/invoiceNumber.js";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose"
async function resolveStation(name) {
  const station = await Station.findOne({ stationName: new RegExp(`^${name}$`, 'i') });
  if (!station) throw new Error(`Station "${name}" not found`);
  return station._id;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.gmail,
    pass: process.env.app_pass
  }
});
//base condition
const getBookingFilterByType = (type, user) => {
  let baseFilter = { isDeleted: false }; // Always include isDeleted: false

  if (type === 'active') {
    baseFilter.activeDelivery = true;
  } else if (type === 'cancelled') {
    baseFilter.totalCancelled = { $gt: 0 };
  } else {
    // For 'request' type - bookings that are not active, not cancelled, and pending approval
    baseFilter.$and = [
      {
        $or: [
          { activeDelivery: false },
          { activeDelivery: { $exists: false } } // Handle cases where field might not exist
        ]
      },
      {
        $or: [
          { totalCancelled: 0 },
          { totalCancelled: { $exists: false } } // Handle cases where field might not exist
        ]
      },
      {
        $or: [
          // Admin/supervisor created bookings
          { createdByRole: { $in: ['admin', 'supervisor'] } },
          // Public requests that are approved OR pending approval
          {
            $or: [
              { requestedByRole: 'public', isApproved: true },
              { requestedByRole: 'public', isApproved: false } // Include pending approvals too
            ]
          },
          // Fallback for any other cases
          {
            $and: [
              { activeDelivery: false },
              { totalCancelled: 0 }
            ]
          }
        ]
      }
    ];
  }

  // Add user-specific filtering for supervisors
  if (user?.role === 'supervisor') {
    if (baseFilter.$and) {
      // If we already have $and, add the user filter to it
      baseFilter.$and.push({ createdByUser: user._id });
    } else {
      // Otherwise create a new $and condition
      baseFilter = {
        $and: [
          baseFilter,
          { createdByUser: user._id }
        ]
      };
    }
  }

  console.log(`Filter for type "${type}":`, JSON.stringify(baseFilter, null, 2));
  return baseFilter;
};


export const viewBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({
      $or: [{ bookingId: id }]
    })
      .populate('startStation', 'stationName gst address contact')
      .populate('endStation', 'stationName')
      .lean();

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Extract only the necessary fields
    const simplifiedResponse = {
      bookingId: booking.bookingId,
      firstName: booking.firstName,
      lastName: booking.lastName,
      mobile: booking.mobile,
      email: booking.email,
      bookingDate: booking.bookingDate
        ? new Date(booking.bookingDate).toLocaleDateString('en-CA')
        : null,
      deliveryDate: booking.deliveryDate
        ? new Date(booking.deliveryDate).toLocaleDateString('en-CA')
        : null,
      senderName: booking.senderName,
      senderGgt: booking.senderGgt,
      fromState: booking.fromState,
      fromCity: booking.fromCity,
      senderPincode: booking.senderPincode,
      receiverName: booking.receiverName,
      receiverGgt: booking.receiverGgt,
      toState: booking.toState,
      toCity: booking.toCity,
      toPincode: booking.toPincode,
      items: booking.items,
      freight: booking.freight,
      ins_vpp: booking.ins_vpp,
      cgst: booking.cgst,
      sgst: booking.sgst,
      igst: booking.igst,
      billTotal: booking.billTotal,
      grandTotal: booking.grandTotal,
      startStation: {
        stationName: booking.startStation?.stationName,
        gst: booking.startStation?.gst,
        address: booking.startStation?.address,
        contact: booking.startStation?.contact
      },
      endStation: {
        stationName: booking.endStation?.stationName
      }
    };

    res.json(simplifiedResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const createBooking = async (req, res) => {

  try {
    const user = req.user;
    const {
      startStation: startName,
      endStation: endName,
      email,
      bookingDate,
      deliveryDate,
      senderName,
      senderGgt,
      senderLocality,
      fromState,
      fromCity,
      senderPincode,
      receiverName,
      receiverGgt,
      receiverLocality,
      toState,
      toCity,
      toPincode,
      items,
      addComment,
      freight,
      ins_vpp,
      cgst,
      sgst,
      igst,
      billTotal,
      grandTotal

    } = req.body;

    if (!email || !startName || !endName || !bookingDate || !deliveryDate || !items) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find customer by email
    const customer = await Customer.findOne({ emailId: email });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found with provided email" });
    }

    // Resolve stations
    const startStation = await resolveStation(startName);
    const endStation = await resolveStation(endName);

    // Ensure resolved stations exist
    if (!startStation || !endStation) {
      return res.status(400).json({ message: "Invalid station names provided" });
    }

    // Create the booking object
    const booking = new Booking({
      customerId: customer._id,
      startStation,
      endStation,
      firstName: customer.firstName,
      middleName: customer.middleName || '',
      lastName: customer.lastName,
      mobile: customer.contactNumber,
      email: customer.emailId,
      bookingDate,
      deliveryDate,
      senderName,
      senderGgt,
      senderLocality,
      fromState,
      fromCity,
      senderPincode,
      receiverName,
      receiverGgt,
      receiverLocality,
      toState,
      toCity,
      toPincode,
      items,  // Array of items passed in request body
      addComment,
      freight,
      ins_vpp,
      cgst,
      sgst,
      igst,
      billTotal,
      grandTotal,
      createdByUser: user._id,
      createdByRole: user.role,
      requestedByRole: user.role
    });

    // Save the booking
    await booking.save();

    // Send booking confirmation email to customer
    // await sendBookingEmail(customer.emailId, booking);
    // Send success response
    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server Error" });
  }
};
export const createPublicBooking = async (req, res) => {
  try {
    const {
      email,
      firstName,
      middleName,
      lastName,
      mobile,
      startStation: startName,
      endStation: endName,
      bookingDate,
      deliveryDate,
      senderName,
      senderGgt,
      senderLocality,
      fromState,
      fromCity,
      senderPincode,
      receiverName,
      receiverGgt,
      receiverLocality,
      toState,
      toCity,
      toPincode,
      items,
      addComment,
      freight,
      ins_vpp,
      cgst,
      sgst,
      igst,
      billTotal,
      grandTotal,
    } = req.body;

    if (!email || !startName || !endName || !bookingDate || !deliveryDate || !items) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Resolve stations
    const startStation = await resolveStation(startName);
    const endStation = await resolveStation(endName);
    if (!startStation || !endStation) {
      return res.status(400).json({ message: "Invalid station names" });
    }

    // Create booking without customerId
    const booking = new Booking({
      firstName,
      middleName,
      lastName,
      mobile,
      startStation,
      endStation,
      bookingDate,
      deliveryDate,
      senderName,
      senderGgt,
      senderLocality,
      fromState,
      fromCity,
      senderPincode,
      receiverName,
      receiverGgt,
      receiverLocality,
      toState,
      toCity,
      toPincode,
      items,
      addComment,
      freight,
      ins_vpp,
      cgst,
      sgst,
      igst,
      billTotal,
      grandTotal,
      mobile,
      email, // store for reference
      isApproved: false, // pending approval
      requestedByRole: "public"
    });

    await booking.save();
    await sendBookingAcknowledgementEmail(email, booking);
    res.status(201).json({ message: "Booking request submitted. Awaiting admin approval.", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const sendBookingAcknowledgementEmail = async (email, booking) => {
  const {
    senderLocality,
    fromCity,
    fromState,
    senderPincode,
    receiverLocality,
    toCity,
    toState,
    toPincode,
    grandTotal,
    items = []
  } = booking;

  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: `Booking Request Received for-${booking.bookingId}  Pending Confirmation`,
    html: `
      <h2>Booking Request Received</h2>

      <p>Dear Customer,</p>

      <p>Thank you for submitting your parcel booking request with us.</p>
      
      <p>Your request has been received and is currently <strong>awaiting admin approval</strong>.</p>

      <h3>Pickup Address:</h3>
      <p>${senderLocality}, ${fromCity}, ${fromState}, ${senderPincode}</p>

      <h3>Delivery Address:</h3>
      <p>${receiverLocality}, ${toCity}, ${toState}, ${toPincode}</p>

      <h3>Booking Summary:</h3>
      <p>Total Weight: ${totalWeight} kg</p>
      <p>Estimated Amount: ₹${grandTotal}</p>

      <p>You will receive another email with confirmation and tracking ID once your request is approved.</p>

      <p>Best regards, <br /> BharatParcel Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error('Error sending acknowledgement email:', error);
  }
};

export const sendBookingEmail = async (email, booking) => {
  const {
    firstName,
    lastName,
    senderLocality,
    fromCity,
    fromState,
    senderPincode,
    receiverLocality,
    toState,
    toCity,
    toPincode,
    grandTotal,
    items = []
  } = booking;

  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: `Booking Confirmation - ${booking.bookingId}`,
    html: `
      <h2>Booking Confirmation</h2>

      <p>Dear <strong>${firstName} ${lastName}</strong>,</p>

      <p>Your booking with <strong>Booking ID: ${booking.bookingId}</strong> has been successfully created.</p>

      <h3>From Address:</h3>
      <p>${senderLocality}, ${fromCity}, ${fromState}, ${senderPincode}</p>

      <h3>To Address:</h3>
      <p>${receiverLocality}, ${toCity}, ${toState}, ${toPincode}</p>

      <h3>Product Details:</h3>
      <p>Weight: ${totalWeight} kg</p>
      <p>Amount: ₹${grandTotal}</p>

      <p>Thank you for choosing our service.</p>

      <p>Best regards, <br /> BharatParcel Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
};

export const sendBookingEmailById = async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Populate the 'customerId' field with email and name
    const booking = await Booking.findOne({ bookingId }).populate('customerId', 'emailId firstName lastName');

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
    console.error('Error sending booking email by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBooking = async (req, res) => {

  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.startStation) {
      updates.startStation = await resolveStation(updates.startStation);
    }
    if (updates.endStation) {
      updates.endStation = await resolveStation(updates.endStation);
    }

    const booking = await Booking.findOneAndUpdate(
      { bookingId: id },
      updates,
      { new: true }
    ).populate('startStation endStation', 'stationName');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};
// backend controller
export const deleteBooking = async (req, res) => {
  try {
    let booking;

    // Check if the ID is a MongoDB ObjectId (24 character hex string)
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(req.params.id);
    } else {
      // If not ObjectId, search by bookingId
      booking = await Booking.findOne({ bookingId: req.params.id });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Only soft delete
    booking.isDeleted = true;
    booking.deletedAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: "Booking moved to recycle bin (can be restored later)",
      data: booking
    });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
export const listDeletedBookings = async (req, res) => {
  try {
    const deletedBookings = await Booking.find({ isDeleted: true });
    res.status(200).json({ count: deletedBookings.length, bookings: deletedBookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getDeletedBookings = async (req, res) => {
  try {
    const deletedBookings = await Booking.find({ isDeleted: true });
    res.json({
      success: true,
      message: "Deleted bookings fetched successfully",
      data: deletedBookings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const restoreBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking || !booking.isDeleted) {
      return res.status(404).json({ success: false, message: "Booking not found in recycle bin" });
    }

    booking.isDeleted = false;
    booking.deletedAt = null;
    await booking.save();

    res.json({
      success: true,
      message: "Booking restored successfully",
      data: booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBookingStatusList = async (req, res) => {
  try {
    const { type } = req.query;
    let filter;
    const user = req.user;

    // Always include isDeleted: false in all filters
    if (type === 'active') {
      filter = {
        activeDelivery: true,
        isDeleted: false
      };
    } else if (type === 'cancelled') {
      filter = {
        totalCancelled: { $gt: 0 },
        isDeleted: false
      };
    } else {
      // For request bookings
      filter = {
        activeDelivery: false,
        isDelivered: { $ne: true },
        totalCancelled: 0,
        isDeleted: false, // Added isDeleted: false here
        $or: [
          { createdByRole: { $in: ['admin', 'supervisor'] } },
          { requestedByRole: 'public', isApproved: true }
        ]
      };
    }

    // Add supervisor filter if applicable
    if (user.role === 'supervisor') {
      filter = {
        $and: [
          filter,
          { createdByUser: user._id }
        ]
      };
    }

    console.log('Booking filter:', JSON.stringify(filter, null, 2)); // Debug log

    const bookings = await Booking.find(filter)
      .select('bookingId orderId firstName lastName senderName receiverName bookingDate mobile startStation endStation requestedByRole createdByRole isDeleted') // Added isDeleted to select
      .populate('startStation endStation', 'stationName')
      .populate('createdByRole', 'role')
      .lean();

    // Debug: Check if any bookings have isDeleted: true
    const deletedBookings = bookings.filter(b => b.isDeleted === true);
    if (deletedBookings.length > 0) {
      console.warn(`Found ${deletedBookings.length} deleted bookings in results:`);
      console.warn(deletedBookings.map(b => ({
        bookingId: b.bookingId,
        isDeleted: b.isDeleted
      })));
    }

    // Filter out bookings with missing station references AND ensure they're not deleted
    const validBookings = bookings.filter(b =>
      b.startStation &&
      b.endStation &&
      b.isDeleted === false // Double check isDeleted
    );

    console.log(`Total bookings found: ${bookings.length}`);
    console.log(`Valid bookings after filtering: ${validBookings.length}`);

    const data = validBookings.map((b, i) => ({
      SNo: i + 1,
      orderId: b.orderId || 'N/A',
      orderBy:
        b.requestedByRole === 'public'
          ? 'Third Party'
          : b.createdByRole === 'admin'
            ? 'Admin'
            : b.createdByRole === 'supervisor'
              ? `Supervisor (${b.startStation?.stationName || 'N/A'})`
              : `${b.createdByRole} ${b.startStation?.stationName || ''}`.trim() || 'N/A',
      date: b.bookingDate ? new Date(b.bookingDate).toLocaleDateString('en-CA') : 'N/A',
      fromName: b.senderName || 'N/A',
      pickup: b.startStation?.stationName || 'N/A',
      toName: b.receiverName || 'N/A',
      drop: b.endStation?.stationName || 'N/A',
      contact: b.mobile || 'N/A',
      bookingId: b.bookingId,
      action: {
        view: `/bookings/${b.bookingId}`,
        edit: `/bookings/edit/${b.bookingId}`,
        delete: `/bookings/delete/${b.bookingId}`
      }
    }));

    res.json({
      success: true,
      count: data.length,
      data,
      debug: {
        totalFound: bookings.length,
        validAfterFilter: validBookings.length,
        hasDeletedBookings: deletedBookings.length > 0
      }
    });
  } catch (err) {
    console.error('Error in getBookingStatusList:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getPendingThirdPartyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      requestedByRole: "public",
      isApproved: false,
    })
      .populate('startStation endStation', 'stationName')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
export const approveThirdPartyBookingRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user = req.user;

    if (!["admin", "supervisor"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.isApproved) {
      return res.status(400).json({ message: "Booking already approved" });
    }

    booking.isApproved = true;
    booking.approvedBy = user.adminId;
    booking.approvedAt = new Date();

    await booking.save();
    await sendBookingEmail(booking.email, booking);
    res.status(200).json({ message: "Booking approved successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const rejectThirdPartyBookingRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user = req.user;
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.isApproved) {
      return res.status(400).json({ message: "Booking already approved, cannot reject" });
    }
    await Booking.deleteOne({ bookingId });
    res.status(200).json({ message: "Booking rejected successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// PATCH /api/v2/bookings/:bookingId/cancel
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOneAndUpdate(
      { bookingId },
      { $inc: { totalCancelled: 1 }, activeDelivery: false },
      { new: true }
    ).populate('startStation endStation', 'stationName');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const getRevenueBookingFilter = (type, user) => {
  const base = getBookingFilterByType(type, user);
  if (base.$and) {
    base.$and.unshift({ isDelivered: true });
    return base;
  }
  return { ...base, isDelivered: true };
};

export const getBookingRevenueList = async (req, res) => {
  try {
    const user = req.user;

    const filter = getRevenueBookingFilter(req.query.type, req.user);


    const bookings = await Booking.find(filter)
      .select('bookingId bookingDate startStation endStation grandTotal')
      .populate('startStation endStation', 'stationName')
      .lean();

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);

    const data = bookings
      .filter(b => b.startStation && b.endStation) // Filter out bookings with missing stations
      .map((b, i) => ({
        SNo: i + 1,
        bookingId: b.bookingId,
        date: b.bookingDate?.toISOString().slice(0, 10) || 'N/A',
        pickup: b.startStation?.stationName || 'Unknown',
        drop: b.endStation?.stationName || 'Unknown',
        revenue: b.grandTotal?.toFixed(2) || '0.00',
        action: {
          view: `/bookings/${b.bookingId}`,
          edit: `/bookings/edit/${b.bookingId}`,
          delete: `/bookings/delete/${b.bookingId}`
        }
      }));
    res.json({
      totalRevenue: totalRevenue.toFixed(2),
      count: data.length,
      data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/v2/bookings/count/requests
export const getBookingRequestsCount = async (req, res) => {
  try {
    const user = req.user;
    const filter = getBookingFilterByType('request', user);
    const count = await Booking.countDocuments(filter);
    res.json({ bookingRequests: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/v2/bookings/count/active
export const getActiveDeliveriesCount = async (req, res) => {
  try {
    const user = req.user;
    const filter = getBookingFilterByType('active', user);
    const count = await Booking.countDocuments(filter);
    res.json({ activeDeliveries: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/v2/bookings/count/cancelled
export const getCancelledBookingsCount = async (req, res) => {
  try {
    const user = req.user;
    const filter = getBookingFilterByType('cancelled', user);
    const count = await Booking.countDocuments(filter);
    res.json({ cancelledCount: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/v2/bookings/revenue/total
export const getTotalRevenue = async (req, res) => {
  try {
    const user = req.user;
    const filter = getBookingFilterByType('request', user); // request = non-active, non-cancelled
    const bookings = await Booking.find(filter).select('grandTotal').lean();

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
    res.json({ totalRevenue: totalRevenue.toFixed(2) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/v2/bookings/:id/activate
export const activateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOneAndUpdate(
      { bookingId: id },
      { activeDelivery: true },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking marked as active delivery', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
export const customerWiseData = async (req, res) => {
  const { fromDate, endDate } = req.body;
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const summary = await Booking.aggregate([
    {
      $match: {
        bookingDate: {
          $gte: start,
          $lte: end,
        }
      }
    },
    {
      $group: {
        _id: "$customerId",
        totalBookings: { $sum: 1 },
        billTotal: { $sum: "$billTotal" }
      }
    },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "customerDetails"
      }
    },
    {
      $unwind: {
        path: "$customerDetails",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        taxAmount: {
          $multiply: ["$billTotal", 0.18]
        }
      }
    },
    {
      $project: {
        customerName: {
          $concat: [
            "$customerDetails.firstName", " ",
            { $ifNull: ["$customerDetails.middleName", ""] }, " ",
            "$customerDetails.lastName"
          ]
        },
        totalBookings: 1,
        billTotal: 1,
        taxAmount: 1
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, summary, "Customer booking successfully fetched")
  );
};
export const overallBookingSummary = async (req, res) => {
  try {
    const { fromDate, endDate } = req.body;
    console.log("FILTER DATES:", fromDate, endDate);

    const summary = await Booking.aggregate([
      {
        $match: {

          bookingDate: {
            $gte: new Date(fromDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          billTotal: { $sum: "$billTotal" }
        }
      },
      {
        $addFields: {
          taxAmount: { $multiply: ["$billTotal", 0.18] }
        }
      },
      {
        $project: {
          _id: 0,
          totalBookings: 1,
          billTotal: 1,
          taxAmount: 1
        }
      }
    ]);
    res.status(200).json(
      new ApiResponse(200, summary[0] || {}, "Overall booking summary fetched successfully")
    );
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, "Error fetching overall booking summary"));
  }
};

export const getBookingSummaryByDate = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    const user = req.user;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: "Both fromDate and toDate are required" });
    }

    // Fixed date parsing with proper timezone handling
    const parseDateString = (str) => {
      const [day, month, year] = str.split("-");
      // Create date in local timezone at start of day (00:00:00)
      const date = new Date(year, month - 1, day);
      return date;
    };

    const from = parseDateString(fromDate);
    const to = parseDateString(toDate);

    // Set to date to end of day (23:59:59.999)
    to.setHours(23, 59, 59, 999);

    // Validate dates
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    console.log('Searching bookings between:', from.toISOString(), 'and', to.toISOString());

    const query = {
      bookingDate: {
        $gte: from,
        $lte: to
      }
    };

    if (user.role === "supervisor") {
      query.createdByUser = user._id;
    }

    const bookings = await Booking.find(query).sort({ bookingDate: -1 });

    // Debug: Check what dates we found
    console.log(`Found ${bookings.length} bookings:`);
    bookings.forEach(booking => {
      console.log(`- ${booking.bookingId}: ${booking.bookingDate}`);
    });

    const transformedBookings = bookings.map((booking) => {
      const grandTotal = booking.grandTotal || 0;

      // Calculate payment based on items' toPay status
      let paidAmount = 0;
      let totalPayableAmount = 0;
      let paidItemsAmount = 0;

      if (booking.items && Array.isArray(booking.items)) {
        booking.items.forEach(item => {
          const itemAmount = Number(item.amount) || 0;
          totalPayableAmount += itemAmount;

          if (item.toPay === "paid") {
            paidItemsAmount += itemAmount;
          }
        });
      }

      // Calculate paid amount based on items payment status
      if (paidItemsAmount > 0) {
        if (paidItemsAmount >= totalPayableAmount) {
          // All items are fully paid
          paidAmount = grandTotal;
        } else {
          // Some items are paid - calculate proportional amount
          const paidRatio = totalPayableAmount > 0 ? paidItemsAmount / totalPayableAmount : 0;
          paidAmount = Math.round(grandTotal * paidRatio);
        }
      } else {
        // No items are marked as paid, use booking-level paidAmount
        paidAmount = booking.paidAmount || 0;
      }

      const toPayAmount = Math.max(grandTotal - paidAmount, 0);

      // Determine payment status
      let paymentStatus = "Unpaid";
      if (paidAmount >= grandTotal && grandTotal > 0) {
        paymentStatus = "Paid";
      } else if (paidAmount > 0 && paidAmount < grandTotal) {
        paymentStatus = "Partial";
      }

      return {
        ...booking.toObject(),
        grandTotal,
        paid: paidAmount,
        toPay: toPayAmount,
        itemsCount: booking.items?.length || 0,
        paymentStatus: paymentStatus
      };
    });

    // Calculate summary totals
    const totalPaid = transformedBookings.reduce((sum, b) => sum + b.paid, 0);
    const totalToPay = transformedBookings.reduce((sum, b) => sum + b.toPay, 0);
    const paidBookings = transformedBookings.filter(b => b.paymentStatus === "Paid").length;
    const unpaidBookings = transformedBookings.filter(b => b.paymentStatus === "Unpaid").length;
    const partialBookings = transformedBookings.filter(b => b.paymentStatus === "Partial").length;

    const summary = {
      totalPaid,
      totalToPay,
      totalBookings: transformedBookings.length,
      paidBookings,
      unpaidBookings,
      partialBookings,
      grandTotal: totalPaid + totalToPay,
      paymentBreakdown: {
        fullyPaid: paidBookings,
        partiallyPaid: partialBookings,
        unpaid: unpaidBookings
      }
    };

    // Format dates for response message
    const formatDateForMessage = (dateStr) => {
      const [day, month, year] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    };

    res.status(200).json({
      message: `Bookings from ${formatDateForMessage(fromDate)} to ${formatDateForMessage(toDate)}`,
      summary,
      bookings: transformedBookings
    });
  } catch (error) {
    console.error("Error fetching bookings by date:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

function getEmptyTotals() {
  return {
    particulars: "Total",
    gst: "",
    startStation: "",
    endStation: "",
    voucherCount: 0,
    taxableValue: 0,
    integratedTax: 0,
    centralTax: 0,
    stateTax: 0,
    cessAmount: 0,
    invoiceAmount: 0,
    billtyAmount: 20,
  };
}

export const getCADetailsSummary = async (req, res) => {
  try {
    const { pickup, drop, fromDate, toDate } = req.body;

    if (!pickup && !drop && !fromDate && !toDate) {
      return res.status(400).json({
        message: "At least one filter (pickup, drop, or date range) is required"
      });
    }

    const baseQuery = { isDelivered: true };

    // Resolve pickup (startStation)
    if (pickup) {
      const startStationDoc = await Station.findOne({
        stationName: new RegExp(`^${pickup}$`, 'i')
      });
      if (!startStationDoc) {
        return res.status(404).json({ message: `Pickup station '${pickup}' not found` });
      }
      baseQuery.startStation = startStationDoc._id;
    }

    // Resolve drop (endStation)
    if (drop) {
      const endStationDoc = await Station.findOne({
        stationName: new RegExp(`^${drop}$`, 'i')
      });
      if (!endStationDoc) {
        return res.status(404).json({ message: `Drop station '${drop}' not found` });
      }
      baseQuery.endStation = endStationDoc._id;
    }

    // FIXED: Handle both "YYYY-MM-DD" and "DD-MM-YYYY" formats
    const dateFilter = {};
    if (fromDate) {
      let from;

      // Check if date is in "YYYY-MM-DD" format (like "2025-10-30")
      if (fromDate.includes('-') && fromDate.split('-')[0].length === 4) {
        // Parse as "YYYY-MM-DD"
        const [year, month, day] = fromDate.split('-');
        from = new Date(year, month - 1, day, 0, 0, 0, 0);
      } else {
        // Parse as "DD-MM-YYYY" 
        const [day, month, year] = fromDate.split('-');
        from = new Date(year, month - 1, day, 0, 0, 0, 0);
      }

      if (isNaN(from.getTime())) {
        return res.status(400).json({
          message: `Invalid fromDate format: ${fromDate}. Use YYYY-MM-DD or DD-MM-YYYY format.`,
          receivedFormat: fromDate
        });
      }
      dateFilter.$gte = from;
      console.log(`📅 From Date: ${fromDate} -> ${from} (UTC: ${from.toISOString()})`);
    }

    if (toDate) {
      let toD;

      // Check if date is in "YYYY-MM-DD" format (like "2025-11-01")
      if (toDate.includes('-') && toDate.split('-')[0].length === 4) {
        // Parse as "YYYY-MM-DD"
        const [year, month, day] = toDate.split('-');
        toD = new Date(year, month - 1, day, 23, 59, 59, 999);
      } else {
        // Parse as "DD-MM-YYYY"
        const [day, month, year] = toDate.split('-');
        toD = new Date(year, month - 1, day, 23, 59, 59, 999);
      }

      if (isNaN(toD.getTime())) {
        return res.status(400).json({
          message: `Invalid toDate format: ${toDate}. Use YYYY-MM-DD or DD-MM-YYYY format.`,
          receivedFormat: toDate
        });
      }
      dateFilter.$lte = toD;
      console.log(`📅 To Date: ${toDate} -> ${toD} (UTC: ${toD.toISOString()})`);
    }

    if (Object.keys(dateFilter).length > 0) {
      baseQuery.bookingDate = dateFilter;
    }

    console.log("👉 Final baseQuery:", JSON.stringify(baseQuery, null, 2));

    // Debug: Check what dates exist in database for the search range
    const dateDebug = await Booking.find({
      isDelivered: true,
      bookingDate: dateFilter
    }).limit(5).select('bookingDate bookingId startStation endStation').lean();

    console.log("🔍 Deliveries in search range:", dateDebug.map(b => ({
      bookingId: b.bookingId,
      bookingDate: b.bookingDate,
      iso: b.bookingDate?.toISOString(),
      startStation: b.startStation,
      endStation: b.endStation
    })));

    // First check if any matching delivered bookings exist
    const anyDeliveries = await Booking.find(baseQuery).limit(1);
    if (anyDeliveries.length === 0) {
      // Check if there are any deliveries in the date range (ignoring station filters)
      const deliveriesInDateRange = await Booking.find({
        isDelivered: true,
        bookingDate: dateFilter
      }).limit(5).select('bookingId startStation endStation').populate('startStation endStation');

      return res.status(200).json(
        new ApiResponse(200, {
          summary: [],
          totals: getEmptyTotals(),
          filters: { pickup, drop, fromDate, toDate },
          diagnostics: {
            message: "No delivered bookings found matching pickup/drop/date criteria",
            queryUsed: baseQuery,
            dateRange: dateFilter,
            deliveriesInDateRange: deliveriesInDateRange.map(d => ({
              bookingId: d.bookingId,
              startStation: d.startStation?.stationName || d.startStation,
              endStation: d.endStation?.stationName || d.endStation
            })),
            potentialIssues: [
              "Station names may not match exactly",
              "Bookings may not be marked as delivered",
              "Date range might not include any delivered bookings"
            ]
          }
        }, "No matching deliveries found")
      );
    }

    // Add tax condition
    const taxQuery = {
      ...baseQuery,
      $or: [
        { cgst: { $gt: 0 } },
        { sgst: { $gt: 0 } },
        { igst: { $gt: 0 } }
      ]
    };

    const taxEligible = await Booking.find(taxQuery).limit(1);
    if (taxEligible.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, {
          summary: [],
          totals: getEmptyTotals(),
          filters: { pickup, drop, fromDate, toDate },
          diagnostics: {
            message: "Deliveries found but no tax data present",
            foundDeliveries: anyDeliveries.length,
            suggestion: "Check if CGST/SGST/IGST values are being recorded properly"
          }
        }, "No tax-eligible deliveries found")
      );
    }

    // Aggregation with proper station lookups
    const summary = await Booking.aggregate([
      { $match: taxQuery },
      {
        $lookup: {
          from: "stations",
          localField: "startStation",
          foreignField: "_id",
          as: "startStationInfo"
        }
      },
      {
        $lookup: {
          from: "stations",
          localField: "endStation",
          foreignField: "_id",
          as: "endStationInfo"
        }
      },
      {
        $addFields: {
          startStationName: { $arrayElemAt: ["$startStationInfo.stationName", 0] },
          endStationName: { $arrayElemAt: ["$endStationInfo.stationName", 0] }
        }
      },
      {
        $group: {
          _id: null,
          voucherCount: { $sum: 1 },
          taxableValue: { $sum: "$billTotal" },
          totalCgstPercent: { $sum: "$cgst" },
          totalSgstPercent: { $sum: "$sgst" },
          totalIgstPercent: { $sum: "$igst" },
          senderNames: { $addToSet: "$senderName" },
          senderGst: { $addToSet: "$senderGgt" },
          customerNames: {
            $addToSet: {
              $concat: [
                "$firstName",
                { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ["$middleName", ""] } }, 0] }, { $concat: [" ", "$middleName"] }, ""] },
                " ",
                "$lastName"
              ]
            }
          },
          startStations: { $addToSet: "$startStationName" },
          endStations: { $addToSet: "$endStationName" }
        }
      },
      {
        $addFields: {
          centralTax: {
            $round: [{ $divide: [{ $multiply: ["$taxableValue", "$totalCgstPercent"] }, 100] }, 2]
          },
          stateTax: {
            $round: [{ $divide: [{ $multiply: ["$taxableValue", "$totalSgstPercent"] }, 100] }, 2]
          },
          integratedTax: {
            $round: [{ $divide: [{ $multiply: ["$taxableValue", "$totalIgstPercent"] }, 100] }, 2]
          }
        }
      },
      {
        $addFields: {
          invoiceAmount: {
            $add: ["$taxableValue", "$centralTax", "$stateTax", "$integratedTax"]
          },
          cessAmount: { $literal: 0 }
        }
      },
      {
        $project: {
          _id: 1,
          voucherCount: 1,
          taxableValue: 1,
          centralTax: 1,
          stateTax: 1,
          integratedTax: 1,
          invoiceAmount: 1,
          senderNames: 1,
          senderGst: 1,
          customerNames: 1,
          startStations: 1,
          endStations: 1,
          particulars: { $literal: "Total" },
          gst: { $literal: "" },
          startStation: { $literal: pickup || "" },
          endStation: { $literal: drop || "" },
          cessAmount: 1
        }
      }
    ]);

    const result = {
      summary,
      totals: summary[0] || getEmptyTotals(),
      filters: { pickup, drop, fromDate, toDate },
      diagnostics: {
        totalMatchingRecords: anyDeliveries.length,
        dateRange: dateFilter
      }
    };

    res.status(200).json(new ApiResponse(200, result, "CA Details summary fetched successfully"));
  } catch (error) {
    console.error("❌ Error in getCADetailsSummary:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Server error while generating summary")
    );
  }
};

export const generateInvoiceByCustomer = async (req, res) => {
  try {
    const { customerName, fromDate, toDate } = req.body;

    if (!customerName || !fromDate || !toDate) {
      return res.status(400).json({
        message: "customerName, fromDate, and toDate are required",
      });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    // ✅ Fetch all delivered bookings (either sender or receiver)
    const bookings = await Booking.find({
      $or: [
        { receiverName: { $regex: customerName, $options: "i" } },
        { senderName: { $regex: customerName, $options: "i" } },
      ],
      bookingDate: { $gte: from, $lte: to },
      isDelivered: true,
    })
      .populate("startStation")
      .populate("customerId")
      .sort({ bookingDate: 1 });

    if (!bookings.length) {
      return res.status(404).json({
        message: "No delivered bookings found for this party in the given date range",
        searchedName: customerName,
      });
    }

    // ✅ Step 1: Determine billing for each booking
    const filteredBookings = bookings.map((booking) => {
      const hasToPayItem = booking.items.some((i) => i.toPay === "toPay");
      const hasPaidItem = booking.items.some((i) => i.toPay === "paid");

      let billingName = booking.receiverName;
      let billingGst = booking.receiverGgt;
      let billingAddress = booking.receiverLocality;
      let billingType = "receiver (toPay)";

      if (hasPaidItem && !hasToPayItem) {
        billingName = booking.senderName;
        billingGst = booking.senderGgt;
        billingAddress = booking.senderLocality;
        billingType = "sender (paid)";
      }

      return {
        ...booking.toObject(),
        billingName,
        billingGst,
        billingAddress,
        billingType,
      };
    });

    // ✅ Step 2: Filter to only include bookings where customer is the billing party
    const customerBookings = filteredBookings.filter(
      (b) => b.billingName.toLowerCase() === customerName.toLowerCase()
    );

    if (!customerBookings.length) {
      return res.status(404).json({
        message: "No bookings found where this party is the billing party",
        searchedName: customerName,
        availableBillingParties: [...new Set(filteredBookings.map(b => b.billingName))]
      });
    }

    // ✅ Step 3: Debug log
    console.log("Final billing information for PDF:");
    customerBookings.forEach((b) => {
      console.log(`Booking ${b.bookingId}:`);
      console.log(`  - Billing Name: ${b.billingName}`);
      console.log(`  - Billing Type: ${b.billingType}`);
      console.log(`  - Sender: ${b.senderName}`);
      console.log(`  - Receiver: ${b.receiverName}`);
    });

    // ✅ Step 4: Pick reference booking for header details
    const headerBooking = customerBookings[0];

    // ✅ Step 5: Define header details
    const billingName = headerBooking.billingName;
    const billingGst = headerBooking.billingGst;
    const billingAddress = headerBooking.billingAddress;
    const billingState = headerBooking.toState || headerBooking.fromState || "N/A";

    console.log("📦 INVOICE HEADER:");
    console.log({
      billingName,
      billingGst,
      billingAddress,
      billingState,
    });

    // ✅ Step 6: Generate invoice number & update bookings
    const invoiceNo = await generateInvoiceNumber(
      headerBooking?.startStation?.stationName || "DEL"
    );
    const billDate = new Date();

    await Booking.updateMany(
      { _id: { $in: customerBookings.map((b) => b._id) } },
      { $set: { invoiceNo, billDate } }
    );

    // ✅ Step 7: Generate PDF
    const pdfBuffer = await generateInvoicePDF({
      bookings: customerBookings,
      invoiceNo,
      billDate,
      billingName,
      billingGst,
      billingAddress,
      billingState,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${customerName}_Invoice.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ Error generating invoice:", err);
    res.status(500).json({ message: err.message || "Server Error" });
  }
};



export const getAllCustomersPendingAmounts = async (req, res) => {
  try {
    // Get all bookings with customer data
    const bookings = await Booking.find({ isDeleted: { $ne: true } })
      .populate('customerId')
      .lean();

    // Process bookings to calculate payments based on items
    const customerMap = new Map();

    bookings.forEach(booking => {
      const customerId = booking.customerId?._id || booking.customerId;
      if (!customerId) return; // Skip if no customer ID

      if (!customerMap.has(customerId)) {
        const customer = booking.customerId || {};
        customerMap.set(customerId, {
          customerId,
          name: `${customer.firstName || ''} ${customer.middleName || ''} ${customer.lastName || ''}`.trim() || 'Unknown Customer',
          email: customer.emailId || 'N/A',
          contact: customer.contactNumber || 'N/A',
          totalBookings: 0,
          unpaidBookings: 0,
          fullyPaidBookings: 0,
          partiallyPaidBookings: 0,
          totalAmount: 0,
          totalPaid: 0,
          pendingAmount: 0,
          bookings: [] // Store individual bookings for debugging
        });
      }

      const customerData = customerMap.get(customerId);
      const grandTotal = booking.grandTotal || 0;

      // Calculate paid amount based on items' toPay status
      let paidAmount = 0;
      let paymentStatus = "Unpaid";

      if (booking.items && Array.isArray(booking.items)) {
        const totalItemsAmount = booking.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const paidItemsAmount = booking.items.reduce((sum, item) =>
          item.toPay === 'paid' ? sum + (Number(item.amount) || 0) : sum, 0);

        if (paidItemsAmount > 0) {
          if (paidItemsAmount >= totalItemsAmount && totalItemsAmount > 0) {
            // All items are paid
            paidAmount = grandTotal;
            paymentStatus = "Paid";
          } else {
            // Some items are paid - calculate proportional amount
            const paidRatio = totalItemsAmount > 0 ? paidItemsAmount / totalItemsAmount : 0;
            paidAmount = Math.round(grandTotal * paidRatio);
            paymentStatus = "Partial";
          }
        } else {
          // No items are paid, use booking-level payment
          paidAmount = booking.paidAmount || 0;
          paymentStatus = paidAmount > 0 ? "Partial" : "Unpaid";
        }
      } else {
        // No items array, use booking-level payment
        paidAmount = booking.paidAmount || 0;
        paymentStatus = paidAmount >= grandTotal ? "Paid" :
          paidAmount > 0 ? "Partial" : "Unpaid";
      }

      const pendingForBooking = Math.max(grandTotal - paidAmount, 0);

      // Update customer totals
      customerData.totalBookings++;
      customerData.totalAmount += grandTotal;
      customerData.totalPaid += paidAmount;
      customerData.pendingAmount += pendingForBooking;

      // Update booking counts based on payment status
      if (paymentStatus === "Paid") {
        customerData.fullyPaidBookings++;
      } else if (paymentStatus === "Partial") {
        customerData.partiallyPaidBookings++;
        customerData.unpaidBookings++; // Partially paid still has unpaid amount
      } else {
        customerData.unpaidBookings++;
      }

      // Store booking details for debugging
      customerData.bookings.push({
        bookingId: booking.bookingId,
        grandTotal,
        paidAmount,
        pendingAmount: pendingForBooking,
        paymentStatus,
        items: booking.items?.map(item => ({
          receiptNo: item.receiptNo,
          amount: item.amount,
          toPay: item.toPay
        }))
      });
    });

    // Convert map to array and filter customers with pending amounts
    const customerPayments = Array.from(customerMap.values())
      .filter(customer => customer.pendingAmount > 0)
      .sort((a, b) => b.pendingAmount - a.pendingAmount);

    // Calculate summary
    const totalPendingAmount = customerPayments.reduce((sum, c) => sum + c.pendingAmount, 0);
    const customersWithUnpaidBookings = customerPayments.filter(c => c.unpaidBookings > 0).length;
    const totalUnpaidBookings = customerPayments.reduce((sum, c) => sum + c.unpaidBookings, 0);
    const totalFullyPaidBookings = customerPayments.reduce((sum, c) => sum + c.fullyPaidBookings, 0);
    const totalPartiallyPaidBookings = customerPayments.reduce((sum, c) => sum + c.partiallyPaidBookings, 0);

    const summary = {
      totalCustomers: customerPayments.length,
      totalPendingAmount: Math.round(totalPendingAmount * 100) / 100,
      customersWithUnpaidBookings,
      totalUnpaidBookings,
      totalFullyPaidBookings,
      totalPartiallyPaidBookings,
      averagePendingPerCustomer: customerPayments.length > 0
        ? Math.round((totalPendingAmount / customerPayments.length) * 100) / 100
        : 0,
      totalBookings: customerPayments.reduce((sum, c) => sum + c.totalBookings, 0),
      totalAmount: customerPayments.reduce((sum, c) => sum + c.totalAmount, 0),
      totalPaid: customerPayments.reduce((sum, c) => sum + c.totalPaid, 0)
    };

    // Remove bookings array from response to keep it clean
    const cleanCustomerPayments = customerPayments.map(customer => {
      const { bookings, ...cleanCustomer } = customer;
      return cleanCustomer;
    });

    res.status(200).json({
      success: true,
      summary,
      customers: cleanCustomerPayments,
      message: `Found ${customerPayments.length} customers with pending payments totaling ₹${summary.totalPendingAmount}`
    });

  } catch (err) {
    console.error('Error fetching customer pending amounts:', err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending amounts",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


export const receiveCustomerPayment = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  let { amount } = req.body;

  if (!amount || amount <= 0) {
    throw new ApiError(400, "Payment amount must be greater than 0");
  }

  // Find all bookings with pending amount (delivered OR not)
  const bookings = await Booking.find({
    customerId,
    $expr: { $lt: [{ $ifNull: ["$paidAmount", 0] }, "$grandTotal"] }
  }).sort({ bookingDate: 1 });

  if (!bookings.length) {
    throw new ApiError(404, "No pending bookings found for this customer");
  }

  let remainingPayment = amount;

  for (let booking of bookings) {
    const pendingForBooking = booking.grandTotal - (booking.paidAmount || 0);

    if (remainingPayment <= 0) break;

    if (remainingPayment >= pendingForBooking) {
      booking.paidAmount = booking.grandTotal;
      booking.paymentStatus = "Paid";
      remainingPayment -= pendingForBooking;
    } else {
      booking.paidAmount = (booking.paidAmount || 0) + remainingPayment;
      booking.paymentStatus = "Partial";
      remainingPayment = 0;
    }

    await booking.save();
  }

  const updatedStats = await Booking.aggregate([
    { $match: { customerId: bookings[0].customerId } },
    {
      $group: {
        _id: "$customerId",
        totalGrandTotal: { $sum: "$grandTotal" },
        totalAmountPaid: { $sum: { $ifNull: ["$paidAmount", 0] } },
        unpaidBookings: {
          $sum: { $cond: [{ $ne: ["$paymentStatus", "Paid"] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalAmount: "$totalGrandTotal",
        totalPaid: "$totalAmountPaid",
        pendingAmount: { $subtract: ["$totalGrandTotal", "$totalAmountPaid"] },
        unpaidBookings: 1
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        amountReceived: amount - remainingPayment,
        remainingPaymentNotUsed: remainingPayment,
        updatedStats: updatedStats[0] || {}
      },
      "Payment recorded successfully"
    )
  );
});

export const getInvoicesByFilter = async (req, res) => {
  try {
    const { fromDate, toDate, startStation } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: "fromDate and toDate are required" });
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    // base match
    const matchStage = { bookingDate: { $gte: from, $lte: to } };

    let stationDoc = null;
    if (startStation) {
      // try to resolve station by name (case-insensitive)
      stationDoc = await Station.findOne({ stationName: new RegExp(`^${startStation}$`, "i") });
      if (stationDoc) {
        matchStage.startStation = stationDoc._id;
      } else {
        return res.status(404).json({ message: `Station '${startStation}' not found` });
      }
    }

    const invoices = await Booking.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $unwind: "$customer" },
      {
        $lookup: {
          from: "stations",
          localField: "startStation",
          foreignField: "_id",
          as: "station"
        }
      },
      { $unwind: { path: "$station", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          grandTotal: { $ifNull: ["$grandTotal", 0] },
          paidAmount: {
            $ifNull: [
              { $cond: [{ $gt: ["$totalPaidAmount", 0] }, "$totalPaidAmount", "$paidAmount"] },
              {
                $reduce: {
                  input: { $ifNull: ["$payments", []] },
                  initialValue: 0,
                  in: { $add: ["$$value", { $ifNull: ["$$this.amount", 0] }] }
                }
              }
            ]
          }
        }
      },
      {
        $addFields: {
          toPayAmount: {
            $cond: [
              { $gt: [{ $subtract: ["$grandTotal", "$paidAmount"] }, 0] },
              { $subtract: ["$grandTotal", "$paidAmount"] },
              0
            ]
          },
          debit: {
            $cond: [
              { $gt: [{ $subtract: ["$grandTotal", "$paidAmount"] }, 0] },
              { $subtract: ["$grandTotal", "$paidAmount"] },
              0
            ]
          },
          credit: "$paidAmount",
          vchType: "GST Service Invoice",
        }
      },
      {
        $group: {
          _id: { customerId: "$customer._id", stationId: "$station._id" },
          customerName: { $first: { $concat: ["$customer.firstName", " ", "$customer.lastName"] } },
          gstNumber: { $first: "$customer.gstNumber" },
          stationName: { $first: "$station.stationName" },
          invoices: {
            $push: {
              bookingId: "$_id",
              bookingDate: "$bookingDate",
              invoiceNo: "$invoiceNo",
              billDate: "$billDate",
              vchType: "$vchType",
              billTotal: "$billTotal",
              debit: "$debit",
              credit: "$credit"
            }
          },
          totalDebit: { $sum: "$debit" },
          totalCredit: { $sum: "$credit" }
        }
      },
      { $sort: { "invoices.bookingDate": 1 } }
    ]);

    if (!invoices.length) {
      return res.status(404).json({
        message: "No invoices found in given filter",
        fromDate,
        toDate,
        startStation,
      });
    }
    res.json({
      message: "Invoices fetched successfully",
      count: invoices.length,
      data: invoices
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server Error", error: true });
  }
};
export const getIncomingBookings = async (req, res) => {
  try {
    const user = req.user; // logged-in user
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: "fromDate and toDate are required" });
    }

    const dateFilter = {
      deliveryDate: { $gte: new Date(fromDate), $lte: new Date(toDate) }
    };

    // let bookingFilter = { ...dateFilter };
    let bookingFilter = {
      ...dateFilter,

    };

    if (user.role === "supervisor") {
      if (!user.startStation) {
        return res.status(400).json({ message: "Supervisor must have a startStation assigned" });
      }

      // Find the supervisor's station document
      const station = await Station.findOne({ stationName: user.startStation });
      if (!station) {
        return res.status(404).json({ message: "Supervisor's station not found" });
      }

      // Show all bookings where endStation equals supervisor's startStation
      bookingFilter.endStation = station._id;
    }
    // Admin: no endStation filter, they see all

    const incomingBookings = await Booking.find(bookingFilter)
      .populate("startStation", "stationName")
      .populate("endStation", "stationName")
      .lean();

    res.status(200).json({
      success: true,
      count: incomingBookings.length,
      data: incomingBookings
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

