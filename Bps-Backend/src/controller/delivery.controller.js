
import { asyncHandler } from "../utils/asyncHandler.js";
import Booking from "../model/booking.model.js";
import Quotation from "../model/customerQuotation.model.js";
import Delivery from "../model/delivery.model.js";
import { Vehicle } from "../model/vehicle.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Customer } from '../model/customer.model.js';
import { Driver } from "../model/driver.model.js";
import nodemailer from 'nodemailer';

// Helper function to generate Order ID
const generateOrderId = () => {
  const prefix = "BHA";
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // Random 4 digit number
  const suffix = "DELIVERY";
  return `${prefix}${randomNumber}${suffix}`;
};
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.gmail,
    pass: process.env.app_pass
  }
});
// Refactored Helper function to populate vehicle and booking info
const populateVehicleAndBooking = (query) => {
  return query.populate({
    path: "bookingId",
    select: "senderName receiverName startStation endStation",
    populate: {
      path: "startStation endStation",
      select: "stationName",
    },
  }).populate("vehicleId", "vehicleName"); // Populate Vehicle information with vehicleName
};
export const updateDriverAndVehicleAvailability = async (driverName, vehicleId) => {
  const activeDriverDeliveries = await Delivery.find({
    driverName,
    status: { $ne: "Completed" },
  });

  const activeVehicleDeliveries = await Delivery.find({
    vehicleModel: vehicleId, // vehicleModel actually stores vehicle ID
    status: { $ne: "Completed" },
  });

  if (activeDriverDeliveries.length === 0) {
    await Driver.updateOne({ firstName: driverName }, { isAvailable: true });
  }

  if (activeVehicleDeliveries.length === 0) {
    await Vehicle.updateOne({ _id: vehicleId }, { isAvailable: true });
  }
};

// Assign a delivery to a booking
// Assign a delivery to a booking or quotation
export const assignDelivery = asyncHandler(async (req, res) => {
  console.log("req", req.body);
  const { bookingIds = [], quotationIds = [], driverName, vehicleModel } = req.body;

  if ((!bookingIds.length && !quotationIds.length) || !driverName || !vehicleModel) {
    throw new ApiError(400, "Booking or Quotation IDs, Driver Name, and Vehicle Model are required.");
  }

  const vehicle = await Vehicle.findOne({ vehicleModel });
  if (!vehicle) throw new ApiError(404, "Vehicle not found with this model.");
  const vehicleId = vehicle._id;

  let existingDriverDelivery = null;
  let existingVehicleDelivery = null;

  if (bookingIds.length) {
    existingDriverDelivery = await Delivery.findOne({
      driverName, deliveryType: "Booking", status: { $nin: ["Completed", "Final Delivery"] },
    });
    existingVehicleDelivery = await Delivery.findOne({
      vehicleModel: vehicleId, deliveryType: "Booking", status: { $nin: ["Completed", "Final Delivery"] },
    });
  }

  if (quotationIds.length) {
    existingDriverDelivery = await Delivery.findOne({
      driverName, deliveryType: "Quotation", status: { $nin: ["Completed", "Final Delivery"] },
    });
    existingVehicleDelivery = await Delivery.findOne({
      vehicleModel: vehicleId, deliveryType: "Quotation", status: { $nin: ["Completed", "Final Delivery"] },
    });
  }

  if (existingDriverDelivery) throw new ApiError(400, "Driver already has active delivery.");
  if (existingVehicleDelivery) throw new ApiError(400, "Vehicle already in active delivery.");

  const deliveries = [];
  const responseData = [];

  for (const bookingId of bookingIds) {
    const booking = await Booking.findOne({ bookingId })
      .populate('startStation endStation', 'stationName')
      .lean();
    if (!booking) continue;

    const alreadyAssigned = await Delivery.findOne({ bookingId });
    if (alreadyAssigned) continue;

    await Booking.updateOne({ bookingId }, { activeDelivery: true });

    const deliveryObj = {
      orderId: generateOrderId(),
      bookingId,
      deliveryType: "Booking",
      driverName,
      vehicleModel: vehicleId,
      status: "Pending",
      fromName: booking.senderName || 'N/A',
      pickup: booking.startStation?.stationName || 'N/A',
      toName: booking.receiverName || 'N/A',
      drop: booking.endStation?.stationName || 'N/A',
      contact: booking.mobile || 'N/A',
    };


    deliveries.push(deliveryObj);

    responseData.push({
      ...deliveryObj,
      sno: responseData.length + 1,
      orderBy: booking.createdByRole || 'N/A',
      date: booking.bookingDate?.toISOString().slice(0, 10) || 'N/A',
      fromName: booking.senderName || 'N/A',
      pickup: booking.startStation?.stationName || 'N/A',
      toName: booking.receiverName || 'N/A',
      drop: booking.endStation?.stationName || 'N/A',
      contact: booking.mobile || 'N/A',
    });
  }
  for (const quotationId of quotationIds) {
    const quotation = await Quotation.findOne({ bookingId: quotationId })

    if (!quotation) continue;

    const alreadyAssigned = await Delivery.findOne({ quotationId });
    if (alreadyAssigned) continue;

    await Quotation.updateOne({ bookingId: quotationId }, { activeDelivery: true });

    const deliveryObj = {
      orderId: generateOrderId(),
      quotationId,
      deliveryType: "Quotation",
      driverName,
      vehicleModel: vehicleId,
      status: "Pending",
      fromName: quotation.senderName || 'N/A',
      pickup: quotation.startStation?.stationName || quotation.startStationName || 'N/A',
      toName: quotation.receiverName || 'N/A',
      drop: quotation.endStation || 'N/A',
      contact: quotation.mobile || 'N/A',
    };

    deliveries.push(deliveryObj);
    responseData.push({
      ...deliveryObj,
      sno: responseData.length + 1,
      orderBy: quotation.createdByRole || 'N/A',
      date: quotation.quotationDate?.toISOString().slice(0, 10) || 'N/A',
    });
  }


  // Handle quotationIds similarly if needed...

  if (!deliveries.length) throw new ApiError(400, "No valid unassigned bookings or quotations found.");

  await Delivery.insertMany(deliveries);

  res.status(201).json(
    new ApiResponse(201, responseData, "Deliveries assigned successfully with booking details.")
  );
});








// List all Booking Deliveries
export const listBookingDeliveries = asyncHandler(async (req, res) => {
  const deliveries = await Delivery.find({ deliveryType: "Booking", status: { $ne: "Final Delivery" } })
    .populate([
      { path: "vehicleModel", select: "vehicleModel" },
      {
        path: "bookingId", populate: [
          { path: "startStation", select: "stationName" },
          { path: "endStation", select: "stationName" }
        ]
      }
    ]);


  const data = deliveries.map((delivery, i) => ({
    SNo: i + 1,
    orderId: delivery.orderId,
    senderName: delivery.bookingId?.senderName || "N/A",
    receiverName: delivery.bookingId?.receiverName || "N/A",
    startStation: delivery.bookingId?.startStation?.stationName || "N/A",
    endStation: delivery.bookingId?.endStation?.stationName || "N/A",
    status: delivery.status || "Pending",
    driverName: delivery.driverName || "N/A",
    vehicleName: delivery.vehicleId?.vehicleModel || "N/A",
  }));

  res.status(200).json(new ApiResponse(200, data, "Booking deliveries fetched successfully."));
});

// List all Quotation Deliveries
export const listQuotationDeliveries = asyncHandler(async (req, res) => {
  const deliveries = await Delivery.find({
    deliveryType: "Quotation",
    status: { $ne: "Final Delivery" }
  })
    .populate({
      path: "quotationId",
      select: "fromCustomerName toCustomerName startStation endStation quotationDate",
      populate: {
        path: "startStation",
        select: "stationName"
      }
    })

    .lean();

  const data = deliveries.map((delivery, i) => ({
    SNo: i + 1,
    orderId: delivery.orderId,
    senderName: delivery.quotationId?.fromCustomerName || "N/A",
    receiverName: delivery.quotationId?.toCustomerName || "N/A",
    startStation: delivery.quotationId?.startStation?.stationName || "N/A",
    endStation: delivery.quotationId?.endStation || "N/A", // Corrected here
    status: delivery.status || "Pending",
    driverName: delivery.driverName || "N/A",
    vehicleName: delivery.vehicleModel || "N/A",
  }));

  res.status(200).json(new ApiResponse(200, data, "Quotation deliveries fetched successfully."));
});




// Finalize Delivery
export const finalizeDelivery = asyncHandler(async (req, res) => {
  const { orderId } = req.params; // Getting orderId from params

  const delivery = await Delivery.findOne({ orderId });

  if (!delivery) {
    throw new ApiError(404, "Delivery not found with this Order ID.");
  }

  if (delivery.status === "Final Delivery") {
    throw new ApiError(400, "Delivery is already finalized.");
  }

  // Mark as "Final Delivery"
  delivery.status = "Final Delivery";
  await delivery.save();

  // Set activeDelivery to false for both Booking and Quotation types
  if (delivery.deliveryType === "Booking" && delivery.bookingId) {
    await Booking.updateOne({ bookingId: delivery.bookingId }, { activeDelivery: false, isDelivered: true });
  }

  if (delivery.deliveryType === "Quotation" && delivery.quotationId) {
    await Quotation.updateOne({ bookingId: delivery.quotationId }, { activeDelivery: false, isDelivered: true });
  }

  // Update availability
  await updateDriverAndVehicleAvailability(delivery.driverName, delivery.vehicleModel);

  res.status(200).json(
    new ApiResponse(200, {
      orderId: delivery.orderId,
      status: "Final Delivery",
    }, "Delivery marked as final.")
  );
});

export const sendDeliverySuccessEmail = async (email, booking) => {
  const {
    firstName,
    lastName,
    bookingId,

    items = []
  } = booking;


  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: `Delivery Confirmation - Order ${bookingId}`,
    html: `
      <h2>Delivery Confirmation</h2>

      <p>Dear <strong>${firstName} ${lastName}</strong>,</p>

      <p>Your order with <strong>Booking ID: ${bookingId}</strong> has been successfully delivered.</p>

      

      <p>Thank you for choosing BharatParcel. We hope to serve you again.</p>

      <p>Best regards,<br/> BharatParcel Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Delivery confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending delivery confirmation email:', error);
  }
};
export const sendDeliverySuccessByOrderId = async (req, res) => {
  const { orderId } = req.params;

  try {
    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found for this orderId' });
    }

    let customer, emailSourceData;

    // CASE 1: If deliveryType is Booking
    if (delivery.deliveryType === 'Booking') {
      const booking = await Booking.findOne({ bookingId: delivery.bookingId }).populate('customerId', 'emailId firstName lastName');
      if (booking) {
        customer = booking.customerId;
        emailSourceData = {
          ...booking.toObject(),
          firstName: customer?.firstName,
          lastName: customer?.lastName
        };
      }
    }

    // CASE 2: If deliveryType is Quotation
    if (!emailSourceData && delivery.deliveryType === 'Quotation') {
      const quotation = await Quotation.findOne({ bookingId: delivery.quotationId }).populate('customerId', 'emailId firstName lastName');
      if (quotation) {
        customer = quotation.customerId;
        emailSourceData = {
          ...quotation.toObject(),
          firstName: customer?.firstName,
          lastName: customer?.lastName
        };
      }
    }

    if (!emailSourceData || !customer?.emailId) {
      return res.status(404).json({ message: 'Neither Booking nor Quotation found for this order, or customer email missing' });
    }

    // Send email
    await sendDeliverySuccessEmail(customer.emailId, emailSourceData);

    res.status(200).json({ message: 'Delivery success email sent successfully' });
  } catch (error) {
    console.error('Error in sendDeliverySuccessByOrderId:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Count Deliveries
export const countBookingDeliveries = asyncHandler(async (req, res) => {
  const count = await Delivery.countDocuments({ deliveryType: "Booking", status: { $ne: "Final Delivery" } });

  res.status(200).json(new ApiResponse(200, { count }, "Booking deliveries count fetched successfully."));
});

export const countQuotationDeliveries = asyncHandler(async (req, res) => {
  const count = await Delivery.countDocuments({ deliveryType: "Quotation", status: { $ne: "Final Delivery" } });

  res.status(200).json(new ApiResponse(200, { count }, "Quotation deliveries count fetched successfully."));
});
export const countFinalDeliveries = asyncHandler(async (req, res) => {
  const count = await Delivery.countDocuments({ status: "Final Delivery" });

  res.status(200).json(new ApiResponse(200, { finalDeliveries: count }, "Final deliveries counted successfully."));
});

export const listFinalDeliveries = asyncHandler(async (req, res) => {
  const deliveries = await Delivery.find({ status: "Final Delivery" }).populate([
    { path: "vehicleModel", select: "vehicleModel" },
  ])
  console.log("d", deliveries);

  const data = deliveries.map((delivery, i) => ({
    SNo: i + 1,
    orderId: delivery.orderId,
    pickup: delivery.pickup,  // Renamed from startStation
    drop: delivery.drop || "N/A",     // Renamed from endStation
    driverName: delivery.driverName || "N/A",
    vehicle: delivery.vehicleModel || "N/A",              // vehicleId → vehicleName
  }));

  res.status(200).json(new ApiResponse(200, data, "Final delivery list fetched successfully."));
});

