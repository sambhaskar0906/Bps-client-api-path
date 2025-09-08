import Booking from '../model/booking.model.js';
import { sendWhatsAppMessage } from '../services/whatsappServices.js';
import {Customer} from '../model/customer.model.js'
import Quotation from "../model/customerQuotation.model.js";
import Delivery from "../model/delivery.model.js"
export const sendMessage = async (req, res) => {
    try {
        const { message, to } = req.body;
        await sendWhatsAppMessage(to, message);
        res.status(200).json({ success: true, message: "Message sent successfully" });
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
};

const generateBookingMessage = (customer, booking) => {
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

  return `*📦 Booking Confirmation*

Dear *${customer.firstName} ${customer.lastName}*,

Your booking with *Booking ID: ${booking.bookingId}* has been successfully created.

*From Address:*
${senderLocality}, ${fromCity}, ${fromState}, ${senderPincode}

*To Address:*
${receiverLocality}, ${toCity}, ${toState}, ${toPincode}

*Product Details:*
• Weight: ${totalWeight} kg
• Amount: ₹${grandTotal}

Thank you for choosing our service.

_BharatParcel Team_`;
};

// Express route handler
export const sendBookingConfirmation = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId }).populate('customerId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const customer = booking.customerId;
    if (!booking || !booking.customerId) {
      return res.status(404).json({ success: false, message: 'Customer details incomplete' });
    }

    const message = generateBookingMessage(customer, booking);
    const contact = String(customer.contactNumber); 
    const formattedNumber = contact.startsWith('+') ? contact : `+91${contact}`;
    await sendWhatsAppMessage(formattedNumber, message);

    res.status(200).json({ success: true, message: 'Booking confirmation sent successfully' });
  } catch (error) {
    console.error('Error in sendBookingConfirmation:', error);
    res.status(500).json({ success: false, message: 'Failed to send booking confirmation' });
  }
};
const generateQuotationMessage = (customer, quotation) => {
  const {
    fromAddress,
    fromCity,
    fromState,
    fromPincode,
    toAddress,
    toCity,
    toState,
    toPincode,
    grandTotal,
    productDetails = []
  } = quotation;

  const totalWeight = productDetails.reduce((sum, item) => sum + (item.weight || 0), 0);

  return `*📋 Quotation Confirmation*

Dear *${customer.firstName} ${customer.lastName}*,

Your quotation with *Quotation ID: ${quotation.bookingId}* has been successfully created.

*From Address:*
${fromAddress}, ${fromCity}, ${fromState}, ${fromPincode}

*To Address:*
${toAddress}, ${toCity}, ${toState}, ${toPincode}

*Product Details:*
• Total Weight: ${totalWeight} kg
• Estimated Amount: ₹${grandTotal}

Thank you for considering our service.

_BharatParcel Team_`;
};

export const sendQuotationConfirmation = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const quotation = await Quotation.findOne({bookingId}).populate('customerId');
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const customer = quotation.customerId;
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer details incomplete' });
    }

    const message = generateQuotationMessage(customer, quotation);
    const contact = String(customer.contactNumber);
    const formattedNumber = contact.startsWith('+') ? contact : `+91${contact}`;
    console.log("f",formattedNumber);
    await sendWhatsAppMessage(formattedNumber, message);

    res.status(200).json({ success: true, message: 'Quotation confirmation sent successfully' });
  } catch (error) {
    console.error('Error in sendQuotationConfirmation:', error);
    res.status(500).json({ success: false, message: 'Failed to send quotation confirmation' });
  }
};
const generateDeliverySuccessMessage = (customer, booking) => {
  const {
    bookingId,
    items = []
  } = booking;

  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
  const itemCount = items.length;

  return `*📦 Delivery Confirmation*

Dear *${customer.firstName} ${customer.lastName}*,

Your parcel with *Booking ID: ${bookingId}* has been successfully delivered.



Thank you for choosing *BharatParcel*. We look forward to serving you again.

_BharatParcel Team_`;
};
export const sendDeliverySuccessWhatsApp = async (req, res) => {
  const { orderId } = req.params;

  try {
    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found for this orderId' });
    }

    let customer, messageSourceData;

    if (delivery.deliveryType === 'Booking') {
      const booking = await Booking.findOne({ bookingId: delivery.bookingId }).populate('customerId');
      if (booking) {
        customer = booking.customerId;
        messageSourceData = {
          ...booking.toObject(),
          firstName: customer?.firstName,
          lastName: customer?.lastName
        };
      }
    }

    if (!messageSourceData && delivery.deliveryType === 'Quotation') {
      const quotation = await Quotation.findOne({ bookingId: delivery.quotationId }).populate('customerId');
      if (quotation) {
        customer = quotation.customerId;
        messageSourceData = {
          ...quotation.toObject(),
          firstName: customer?.firstName,
          lastName: customer?.lastName
        };
      }
    }

    if (!messageSourceData || !customer?.contactNumber) {
      return res.status(404).json({ message: 'Booking/Quotation or customer contact not found' });
    }

    const contact = String(customer.contactNumber);
    const formattedNumber = contact.startsWith('+') ? contact : `+91${contact}`;
    console.log("f",formattedNumber);
    const message = generateDeliverySuccessMessage(customer, messageSourceData);

    await sendWhatsAppMessage(formattedNumber, message);

    res.status(200).json({ message: 'Delivery confirmation WhatsApp message sent successfully' });
  } catch (error) {
    console.error('Error in sendDeliverySuccessWhatsApp:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

