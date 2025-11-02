// ==============================
// 📦 INVOICE GENERATION MODULE
// ==============================

import PDFDocument from 'pdfkit';
import Booking from '../model/booking.model.js';
import { generateInvoiceNumber } from '../utils/invoiceNumber.js';

// ------------------------------
// 🧩 Helper Functions
// ------------------------------

const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
};

const truncateText = (text, length) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length - 3) + '...' : text;
};

const convertNumberToWords = (num) => {
    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
        if (n < 1000)
            return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + inWords(n % 100) : '');
        if (n < 100000)
            return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
        if (n < 10000000)
            return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
        return 'Number too large';
    };

    return inWords(Math.floor(num));
};

// ------------------------------
// 🧾 PDF GENERATOR
// ------------------------------

export const generateInvoicePDF = async (data) => {
    const { bookings, invoiceNo, billDate, billingName, billingGst, billingAddress, billingState } = data;

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];

    return new Promise((resolve, reject) => {
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const lineHeight = 20;
        let y = 50;

        // === HEADER ===
        const headerBooking = bookings?.[0] || {};
        const stationName = headerBooking?.startStation?.stationName || 'Bharat Parcel Services Pvt.Ltd.';
        const stationAddress = headerBooking?.startStation?.address || '332, Kucha Ghasi Ram, Chandni Chowk, Delhi';
        const stationContact = headerBooking?.startStation?.contact || '7779993453';
        const stateCode = '07';

        const today = billDate ? new Date(billDate) : new Date();
        const dateOfBill = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

        doc.fontSize(16).font('Helvetica-Bold').text('BHARAT PARCEL SERVICES PVT. LTD.', { align: 'center' });
        y += 30;

        doc.font('Helvetica').fontSize(12);
        doc.text(stationName, 50, y); y += lineHeight;
        doc.text(stationAddress, 50, y); y += lineHeight;
        doc.text(`Phone Number: ${stationContact}`, 50, y); y += lineHeight;
        doc.text(`GSTIN: 07AAECB6506F1ZY    PAN: AAECB6506F    SAC CODE: 9968`, 50, y);
        y += lineHeight + 10;

        // === PARTY DETAILS ===
        doc.text(`Party Name: ${billingName || 'N/A'}`, 50, y);
        doc.text(`Date of Bill: ${dateOfBill}`, 350, y);
        y += lineHeight;

        doc.text(`State Code: ${stateCode}, ${billingState || 'N/A'}`, 50, y);
        doc.text(`INVOICE NO: ${invoiceNo}`, 350, y);
        y += lineHeight;

        doc.text(`GSTIN: ${billingGst || 'N/A'}`, 50, y);
        y += lineHeight;

        doc.text(`Party Address: ${billingAddress || 'N/A'}`, 50, y, { width: 500 });
        y += lineHeight + 10;

        console.log('✅ PDF HEADER BILLING INFO:', { billingName, billingGst, billingAddress, billingState });

        // === TABLE HEADER ===
        doc.font('Helvetica-Bold');
        doc.lineWidth(0.5);

        const rowHeight = 30;
        const colX = {
            sr: 50,
            date: 80,
            pod: 140,
            billing: 220,
            receiver: 320,
            nos: 420,
            weight: 460,
            amount: 510
        };

        doc.rect(50, y, 515, rowHeight).fill('#f0f0f0').stroke();
        doc.fillColor('black');
        const fontSize = 10;
        const headerY = y + (rowHeight - fontSize) / 2;

        doc.text('SR NO', colX.sr, headerY, { width: 25, align: 'center' });
        doc.text('DATE', colX.date, headerY, { width: 50, align: 'center' });
        doc.text('POD NO', colX.pod, headerY, { width: 70, align: 'center' });
        doc.text('BILLING PARTY', colX.billing, headerY, { width: 90, align: 'center' });
        doc.text('RECEIVER PARTY', colX.receiver, headerY, { width: 90, align: 'center' });
        doc.text('NOS', colX.nos, headerY, { width: 40, align: 'center' });
        doc.text('WEIGHT', colX.weight, headerY, { width: 50, align: 'center' });
        doc.text('AMOUNT', colX.amount, headerY, { width: 60, align: 'center' });

        y += rowHeight;

        // === TABLE BODY ===
        let totalAmount = 0, totalWeight = 0, totalNos = 0;

        if (!bookings || !Array.isArray(bookings)) {
            doc.text('No booking data available', 50, y);
            doc.end();
            return;
        }

        bookings.forEach((b, index) => {
            const bookingDate = formatDate(b.bookingDate);
            const billingParty = truncateText(b.billingName || b.senderName, 15);
            const receiverParty = truncateText(b.receiverName, 15);
            const podNo = b.items?.[0]?.receiptNo || 'RCPT-0000';
            const weight = b.items?.reduce((sum, i) => sum + (Number(i.weight) || 0), 0) || 0;
            const nos = b.items?.length || 0;
            const amount = Number(b.billTotal) || 0;

            doc.rect(50, y, 515, rowHeight).stroke();
            const textY = y + (rowHeight - fontSize) / 2;
            doc.font('Helvetica').fontSize(fontSize).fillColor('black');
            doc.text((index + 1).toString(), colX.sr, textY, { width: 25, align: 'center' });
            doc.text(bookingDate, colX.date, textY, { width: 50, align: 'center' });
            doc.text(podNo, colX.pod, textY, { width: 70, align: 'center' });
            doc.text(billingParty, colX.billing, textY, { width: 90, align: 'center' });
            doc.text(receiverParty, colX.receiver, textY, { width: 90, align: 'center' });
            doc.text(nos.toString(), colX.nos, textY, { width: 40, align: 'center' });
            doc.text(weight.toString(), colX.weight, textY, { width: 50, align: 'center' });
            doc.text(amount.toFixed(2), colX.amount, textY, { width: 60, align: 'center' });

            totalAmount += amount;
            totalWeight += weight;
            totalNos += nos;
            y += rowHeight;
        });

        // === FOOTER TOTAL ===
        doc.rect(50, y, 515, rowHeight).fill('#f9f9f9').stroke();
        doc.fillColor('black').font('Helvetica-Bold');

        const footerY = y + (rowHeight - fontSize) / 2;
        doc.text('TOTAL', colX.pod, footerY, { width: 100, align: 'center' });
        doc.text(totalNos.toString(), colX.nos, footerY, { width: 40, align: 'center' });
        doc.text(totalWeight.toString(), colX.weight, footerY, { width: 50, align: 'center' });
        doc.text(totalAmount.toFixed(2), colX.amount, footerY, { width: 60, align: 'center' });

        y += rowHeight + 15;

        // === SUMMARY ===
        const rightColX = 380;
        const valueX = 520;
        const gstRate = 9;
        const cgstAmount = (gstRate / 100) * totalAmount;
        const sgstAmount = (gstRate / 100) * totalAmount;
        const grandTotalBeforeRound = totalAmount + cgstAmount + sgstAmount;
        const roundOff = Math.round(grandTotalBeforeRound) - grandTotalBeforeRound;
        const grandTotal = totalAmount + cgstAmount + sgstAmount + roundOff;

        doc.font('Helvetica-Bold');
        doc.text(`AMOUNT TOTAL`, rightColX, y);
        doc.text(totalAmount.toFixed(2), valueX, y, { width: 60, align: 'right' });
        y += lineHeight;

        doc.font('Helvetica');
        doc.text(`(+) CGST ${gstRate}%`, rightColX, y);
        doc.text(cgstAmount.toFixed(2), valueX, y, { width: 60, align: 'right' });
        y += lineHeight;

        doc.text(`(+) SGST ${gstRate}%`, rightColX, y);
        doc.text(sgstAmount.toFixed(2), valueX, y, { width: 60, align: 'right' });
        y += lineHeight;

        doc.text(`Round off`, rightColX, y);
        doc.text(roundOff.toFixed(2), valueX, y, { width: 60, align: 'right' });
        y += lineHeight;

        doc.font('Helvetica-Bold');
        doc.text(`GRAND TOTAL`, rightColX, y);
        doc.text(grandTotal.toFixed(2), valueX, y, { width: 60, align: 'right' });
        y += lineHeight + 15;

        // === AMOUNT IN WORDS ===
        doc.text(`AMOUNT IN WORDS :- INR ${convertNumberToWords(grandTotal)} Only.`, 50, y);
        y += rowHeight + 60;

        // === FOOTER ===
        doc.text('For Bharat Parcel Services Pvt.Ltd.', { align: 'right' });
        y += lineHeight;
        doc.text('DIRECTOR', { align: 'right' });

        doc.end();
    });
};