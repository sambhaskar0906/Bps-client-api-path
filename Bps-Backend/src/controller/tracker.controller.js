import Booking from "../model/booking.model.js";
import CustomerQuotation from "../model/customerQuotation.model.js";
import Tracking from "../model/tracker.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createTracking = asyncHandler(async (req, res) => {
  const { orderType, bookingId, latitude, longitude } = req.body;

  if (!orderType || !bookingId || latitude == null || longitude == null) {
    throw new ApiError(400, "All fields (orderType, bookingId, latitude, longitude) are required.");
  }

  let orderDocument;

  if (orderType === "Booking") {
    orderDocument = await Booking.findOne({ bookingId });
    if (!orderDocument) {
      throw new ApiError(404, `Booking not found with bookingId: ${bookingId}`);
    }
  } else if (orderType === "Quotation") {
    orderDocument = await CustomerQuotation.findOne({ bookingId });
    if (!orderDocument) {
      throw new ApiError(404, `Quotation not found with bookingId: ${bookingId}`);
    }
  } else {
    throw new ApiError(400, "orderType must be either 'Booking' or 'Quotation'.");
  }

  const tracking = await Tracking.create({
    orderType,
    orderRef: orderDocument._id,  // use the real MongoDB ID
    orderTypeRef: orderType === "Booking" ? "Booking" : "CustomerQuotation",
    latitude,
    longitude
  });

  res.status(201).json(new ApiResponse(201, tracking, "Tracking data created successfully."));
});


export const getTrackingLocation = asyncHandler(async (req, res) => {
    const { orderId } = req.params; // Get the orderId from the URL
  
    if (!orderId) {
      throw new ApiError(400, "orderId is required.");
    }
  
    let orderDocument;
  
    // Check if the orderId belongs to a Booking
    orderDocument = await Booking.findOne({ bookingId: orderId });
    
    if (!orderDocument) {
      // If not found in Booking, check in Quotation
      orderDocument = await CustomerQuotation.findOne({ bookingId: orderId });
  
      if (!orderDocument) {
        throw new ApiError(404, `No Booking or Quotation found with orderId: ${orderId}`);
      }
    }
  
    // Fetch the tracking data associated with the found order (either Booking or Quotation)
    const trackingData = await Tracking.find({ orderRef: orderDocument._id })
      .sort({ createdAt: 1 }); // Sorting by timestamp in ascending order (oldest first)
  
    if (!trackingData.length) {
      throw new ApiError(404, "No tracking data found for this orderId.");
    }
  
    res.status(200).json(new ApiResponse(200, trackingData, "Tracking data fetched successfully."));
  });


  export const updateTrackingLocation = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { latitude, longitude } = req.body;
  
    
    if (!bookingId || latitude == null || longitude == null) {
      throw new ApiError(400, "bookingId (in URL), latitude and longitude (in body) are all required.");
    }
  
    
    let order       = await Booking.findOne({ bookingId });
    let orderType   = "Booking";
    let refModel    = "Booking";
  
    if (!order) {
      order       = await CustomerQuotation.findOne({ bookingId });
      orderType   = "Quotation";
      refModel    = "CustomerQuotation";
    }
  
    if (!order) {
      throw new ApiError(404, `No Booking or Quotation found with bookingId: ${bookingId}`);
    }
  
    
    let tracking = await Tracking.findOne({ orderRef: order._id });
  
    if (tracking) {
      tracking.latitude   = latitude;
      tracking.longitude  = longitude;
      tracking.updatedAt  = Date.now();
      await tracking.save();
    } else {
      tracking = await Tracking.create({
        orderType,
        orderRef:      order._id,
        orderTypeRef:  refModel,
        latitude,
        longitude
      });
    }
  
    // 4) Return response
    res.status(200).json(
      new ApiResponse(200, tracking, "Location updated successfully.")
    );
  });