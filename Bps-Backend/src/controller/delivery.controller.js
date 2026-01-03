
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


const generateOrderId = () => {
  const prefix = "BHA";
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  const suffix = "DELIVERY";
  return `${prefix}${randomNumber}${suffix}`;
};
const formatVehicleDetails = (vehicles) => {
  return vehicles.map((vehicle, index) => ({
    sNo: index + 1,
    vehicleId: vehicle.vehicleId,
    location: vehicle.currentLocation,
    ownedBy: vehicle.ownedBy,
    vehicleModel: vehicle.vehicleModel,
  }));
};
const formatDriverList = (drivers) => {

  return drivers.map((driver, index) => ({
    sNo: index + 1,
    driverId: driver.driverId,
    name: `${driver.firstName} ${driver.middleName ? driver.middleName + ' ' : ''}${driver.lastName}`,
    contactNumber: driver.contactNumber,
    actions: [
      { name: "View", icon: "view-icon", action: `/api/drivers/${driver.driverId}` },
      { name: "Edit", icon: "edit-icon", action: `/api/drivers/edit/${driver.driverId}` },
      { name: "Delete", icon: "delete-icon", action: `/api/drivers/delete/${driver.driverId}` }
    ]
  }));
};
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.gmail,
    pass: process.env.app_pass
  }
});



export const getAvailableDrivers = asyncHandler(async (req, res) => {
  let deliveryType = req.query.type; // "Booking" or "Quotation"

  const allDrivers = await Driver.find({
    ...req.roleQueryFilter,
    isBlacklisted: false,
  });

  const activeDeliveries = await Delivery.find({
    deliveryType,
    status: { $nin: ["Completed", "Final Delivery"] },
  }).select("driverId");

  const activeDriverIds = new Set(activeDeliveries.map(d => d.driverId));
  const recentDelivery = await Delivery.findOne().sort({ createdAt: -1 }).lean();
  console.log("Recent Delivery:", recentDelivery);

  console.log("Active driver IDs:", activeDriverIds);
  console.log("All driver IDs:", allDrivers.map(d => d.driverId));
  console.log("Delivery type received:", deliveryType);

  const filteredDrivers = allDrivers.filter(driver =>
    !activeDriverIds.has(driver.driverId)
  );

  const driverList = formatDriverList(filteredDrivers);

  return res
    .status(200)
    .json(new ApiResponse(200, "Available drivers fetched successfully", driverList));
});



export const getAvailableVehicles = asyncHandler(async (req, res) => {
  let deliveryType = req.query.type;
  deliveryType = deliveryType === "Quotation" ? "Quotation" : "Booking";

  const allVehicles = await Vehicle.find({
    ...req.vehicleQueryFilter,
    isActive: true,
    isBlacklisted: false,
  })
    .select('_id vehicleId currentLocation ownedBy vehicleModel')
    .lean();

  const activeDeliveries = await Delivery.find({
    deliveryType,
    status: { $nin: ["Completed", "Final Delivery"] },
  }).select('vehicleModel');

  const activeVehicleIds = activeDeliveries.map(d => d.vehicleModel.toString());

  console.log("Active vehicle IDs:", activeVehicleIds);
  console.log("All vehicles:", allVehicles.map(v => v._id.toString()));

  const filteredVehicles = allVehicles.filter(vehicle => {
    return !activeVehicleIds.includes(vehicle._id.toString()); // match by _id
  });

  const result = formatVehicleDetails(filteredVehicles);

  return res
    .status(200)
    .json(new ApiResponse(200, "Available vehicles fetched successfully", { availableVehicles: result }));
});




export const assignDelivery = asyncHandler(async (req, res) => {
  console.log("Req", req.body);
  const { bookingIds = [], quotationIds = [], driverId, vehicleModel } = req.body;

  if ((!bookingIds.length && !quotationIds.length) || !driverId || !vehicleModel) {
    throw new ApiError(400, "Booking or Quotation IDs, Driver ID, and Vehicle Model are required.");
  }

  const vehicle = await Vehicle.findOne({ vehicleModel });
  if (!vehicle) throw new ApiError(404, "Vehicle not found with this model.");

  const vehicleId = vehicle._id;
  const driver = await Driver.findOne({ driverId });
  if (!driver) throw new ApiError(404, "Driver not found.");

  let existingDriverDelivery = null;
  let existingVehicleDelivery = null;

  if (bookingIds.length) {
    existingDriverDelivery = await Delivery.findOne({
      driverId,
      deliveryType: "Booking",
      status: { $nin: ["Completed", "Final Delivery"] },
    });

    existingVehicleDelivery = await Delivery.findOne({
      vehicleModel: vehicleId,
      deliveryType: "Booking",
      status: { $nin: ["Completed", "Final Delivery"] },
    });
  }

  if (quotationIds.length) {
    existingDriverDelivery = await Delivery.findOne({
      driverId,
      deliveryType: "Quotation",
      status: { $nin: ["Completed", "Final Delivery"] },
    });

    existingVehicleDelivery = await Delivery.findOne({
      vehicleModel: vehicleId,
      deliveryType: "Quotation",
      status: { $nin: ["Completed", "Final Delivery"] },
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
      driverId, // ✅ updated
      vehicleModel: vehicleId,
      status: "Pending",
      fromName: booking.senderName || 'N/A',
      pickup: booking.startStation?.stationName || 'N/A',
      toName: booking.receiverName || 'N/A',
      drop: booking.endStation?.stationName || 'N/A',
      contact: booking.mobile || 'N/A',
    };

    await Booking.updateOne(
      { bookingId },
      { activeDelivery: true, orderId: deliveryObj.orderId }
    );
    deliveries.push(deliveryObj);

    responseData.push({
      ...deliveryObj,
      sno: responseData.length + 1,
      orderBy: booking.createdByRole || 'N/A',
      date: booking.bookingDate?.toISOString().slice(0, 10) || 'N/A',
    });
  }

  for (const quotationId of quotationIds) {
    const quotation = await Quotation.findOne({ bookingId: quotationId });
    if (!quotation) continue;

    const alreadyAssigned = await Delivery.findOne({ quotationId });
    if (alreadyAssigned) continue;

    await Quotation.updateOne({ bookingId: quotationId }, { activeDelivery: true });

    const deliveryObj = {
      orderId: generateOrderId(),
      quotationId,
      deliveryType: "Quotation",
      driverId, // ✅ updated
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

    // ✅ Update quotation here
    await Quotation.updateOne(
      { bookingId: quotationId },
      { activeDelivery: true, orderId: deliveryObj.orderId }
    );
  }



  // Handle quotationIds similarly if needed...

  if (!deliveries.length) throw new ApiError(400, "No valid unassigned bookings or quotations found.");

  await Delivery.insertMany(deliveries);

  res.status(201).json(
    new ApiResponse(201, responseData, "Deliveries assigned successfully with booking details.")
  );
});


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

export const finalizeDelivery = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const delivery = await Delivery.findOne({ orderId });

  if (!delivery) {
    throw new ApiError(404, "Delivery not found with this Order ID.");
  }

  if (delivery.status === "Final Delivery") {
    throw new ApiError(400, "Delivery is already finalized.");
  }

  // Step 1: Mark as final
  delivery.status = "Final Delivery";
  await delivery.save();

  // Step 2: Mark Booking or Quotation as completed
  if (delivery.deliveryType === "Booking" && delivery.bookingId) {
    await Booking.updateOne(
      { bookingId: delivery.bookingId },
      { activeDelivery: false, isDelivered: true }
    );
  }

  if (delivery.deliveryType === "Quotation" && delivery.quotationId) {
    await Quotation.updateOne(
      { bookingId: delivery.quotationId },
      { activeDelivery: false, isDelivered: true }
    );
  }

  // Step 3: Check for other active deliveries for the same driver/vehicle
  const activeDeliveries = await Delivery.find({
    status: { $nin: ["Completed", "Final Delivery"] },
    $or: [
      { driverId: delivery.driverId },
      { vehicleModel: delivery.vehicleModel },
    ]
  });

  // Step 4: If no active deliveries left for driver or vehicle, mark them as available
  const hasDriverActive = activeDeliveries.some(
    d => d.driverId === delivery.driverId
  );
  const hasVehicleActive = activeDeliveries.some(
    d => d.vehicleModel?.toString() === delivery.vehicleModel?.toString()
  );

  if (!hasDriverActive && delivery.driverId) {
    await Driver.updateOne(
      { driverId: delivery.driverId },
      { isAvailable: true }
    );
  }

  if (!hasVehicleActive && delivery.vehicleModel) {
    await Vehicle.updateOne(
      { _id: delivery.vehicleModel },
      { isAvailable: true }
    );
  }

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
    fromName: delivery.fromName || "N/A",
    toName: delivery.toName || "N/A",
    pickup: delivery.pickup,  // Renamed from startStation
    drop: delivery.drop || "N/A",     // Renamed from endStation
    contact: delivery.contact || "N/A",
    driverName: delivery.driverName || "N/A",
    vehicle: delivery.vehicleModel
      ? {
        _id: delivery.vehicleModel._id,
        vehicleModel: delivery.vehicleModel.vehicleModel,
      }
      : "N/A",
  }));

  res.status(200).json(new ApiResponse(200, data, "Final delivery list fetched successfully."));
});