export const bookingConfirmationTemplate = (booking) => {
    const product = booking.productDetails?.[0] || {};

    return `
📦 *Bharat Parcel Services*
━━━━━━━━━━━━━━━━━━━━━━
✅ *Booking Confirmed*

🧾 Booking ID: *${booking.bookingId || "-"}*
📄 Receipt No: *${product.receiptNo || "-"}*

👤 Sender: *${booking.fromCustomerName || `${booking.firstName || ""} ${booking.lastName || ""}`.trim()}*
📞 Mobile: *${booking.mobile || "-"}*

👥 Receiver: *${booking.toCustomerName || "-"}*
📞 Receiver No: *${booking.toContactNumber || "-"}*

📍 From: *${booking.startStationName || booking.fromCity || "-"}*
📍 To: *${booking.endStation || booking.toCity || "-"}*

📅 Booking Date: *${booking.quotationDate?.toISOString().split("T")[0] || "-"}*

📦 Parcel Details:
   • Item: ${product.name || "Parcel"}
   • Qty: ${product.quantity || 0}
   • Weight: ${product.weight || 0} Kg
   • Price: ₹${product.price || 0}

💰 Total Amount: *₹${booking.grandTotal || 0}*

━━━━━━━━━━━━━━━━━━━━━━
🌐 https://bharatparcel.org/
`;
};

export const bookingConfirmationTemplateForBooking = (booking) => {
    const item = booking.items?.[0] || {};

    let gstLines = "";

    if (booking.igst && booking.igst > 0) {
        gstLines = `• IGST: ${booking.igst}%`;
    } else {
        if (booking.cgst && booking.cgst > 0) {
            gstLines += `• CGST: ${booking.cgst}%\n`;
        }
        if (booking.sgst && booking.sgst > 0) {
            gstLines += `• SGST: ${booking.sgst}%`;
        }
    }

    return `
📦 *Bharat Parcel Services*
━━━━━━━━━━━━━━━━━━━━━━
✅ *Booking Confirmed*

🧾 Booking ID: *${booking.bookingId || "-"}*
📄 Receipt No: *${item.receiptNo || "-"}*

👤 Sender: *${booking.senderName || "-"}*
📞 Mobile: *${booking.mobile || "-"}*

👥 Receiver: *${booking.receiverName || "-"}*
📞 Receiver No: *${booking.receiverContact || "-"}*

📍 From: *${booking.fromCity || "-"}*
📍 To: *${booking.toCity || "-"}*

📅 Booking Date: *${booking.bookingDate?.toISOString?.().split("T")[0] || booking.bookingDate || "-"}*

📦 Parcel Details:
• Qty: ${item.quantity || 0}
• Weight: ${item.weight || 0} Kg

💵 Charges:
• Amount: ₹${booking.freight || 0}
${gstLines}

💰 *Grand Total: ₹${booking.grandTotal || 0}*

━━━━━━━━━━━━━━━━━━━━━━
🌐 https://bharatparcel.org/
`;
};

