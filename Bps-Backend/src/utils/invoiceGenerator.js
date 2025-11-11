// ===========================================
// 📦 TAX INVOICE Generator (Exact Design as Image)
// ===========================================

import PDFDocument from "pdfkit";

// =========================
// 🔹 Utility Functions
// =========================
const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${d.getFullYear()}`;
};

const convertNumberToWords = (num) => {
    if (!num) return '';

    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const inWords = (n) => {
        if (n === 0) return "Zero";
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + inWords(n % 100) : "");
        if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
        return "Number too large";
    };

    return inWords(Math.floor(num));
};

const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length <= maxLength ? text : text.substring(0, maxLength - 3) + "...";
};

// =========================
// 🧾 Create Table Row
// =========================
function createTableRow(doc, y, headers, booking, index, callback) {
    const rowHeight = 20;
    doc.rect(40, y, 520, rowHeight).stroke("#000");

    let colX = 40;

    // Calculate GST amounts
    const amount = parseFloat(booking.amount || booking.billTotal || 0);
    const cgstAmount = amount * 0.09;
    const sgstAmount = amount * 0.09;

    const cgstText = `9% ${cgstAmount.toFixed(2)}`;
    const sgstText = `9% ${sgstAmount.toFixed(2)}`;

    // ✅ FIXED: Get refNo from items array - CORRECTED APPROACH
    let podNo = "";

    // Check if booking has items array and get refNo from first item
    if (booking.items && booking.items.length > 0) {
        podNo = booking.items[0].refNo || "";
    }

    // If still no podNo, try other fields
    if (!podNo) {
        podNo = booking.podNo || booking.bookingId || "";
    }

    const rowData = [
        (index + 1).toString(),
        formatDate(booking.date || booking.bookingDate),
        podNo, // ✅ Now this will show refNo from items
        truncateText(booking.senderParty || booking.billingName || booking.senderName || "", 15),
        truncateText(booking.receiverParty || booking.receiverName || "", 15),
        (booking.nos || (booking.items ? booking.items.length : 1)).toString(),
        (parseFloat(booking.weight) || 0).toFixed(3),
        (parseFloat(booking.insurance) || 0).toFixed(2),
        amount.toFixed(2),
        cgstText,
        sgstText
    ];

    headers.forEach((h, i) => {
        if (i > 0) doc.moveTo(colX, y).lineTo(colX, y + rowHeight).stroke("#000");
        doc.text(rowData[i], colX + 2, y + 6, {
            width: h.width - 4,
            align: "center",
            lineBreak: false
        });
        colX += h.width;
    });

    callback(amount, cgstAmount, sgstAmount);
}

// ===========================================
// 🧾 Generate Tax Invoice PDF (Exact Design)
// ===========================================
export const generateInvoicePDF = async (data) => {
    if (!data) throw new Error("No data provided for invoice generation");

    const {
        invoiceNo,
        billDate,
        billingName,
        billingGst,
        billingAddress,
        billingState,
        stateCode,
        bookings = [],
        roundOff = 0.30
    } = data;

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers = [];

    return new Promise((resolve, reject) => {
        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        let y = 40;

        // =========================
        // HEADER SECTION
        // =========================
        doc.font("Helvetica-Bold").fontSize(16).text("TAX INVOICE", { align: "center" });
        y += 25;
        doc.fontSize(14).text("Bharat Parcel Services Pvt.Ltd.", { align: "center" });
        y += 20;
        doc.font("Helvetica").fontSize(10)
            .text("332,Kucha Ghasi Ram, Chandni Chowk, Fatehpuri, Delhi -110006", { align: "center" });
        y += 15;
        doc.text("Phone No. :- 011-23955385,23830010", { align: "center" });
        y += 15;
        doc.text("GSTIN : 07AAECB6506F1ZY    PAN : AAECB6506F    SAC CODE : 9968", { align: "center" });
        y += 25;

        // =========================
        // BILLING INFO
        // =========================
        doc.rect(40, y, 520, 60).stroke("#000");
        doc.moveTo(250, y).lineTo(250, y + 60).stroke("#000");
        doc.moveTo(400, y).lineTo(400, y + 60).stroke("#000");
        doc.moveTo(40, y + 20).lineTo(560, y + 20).stroke("#000");
        doc.moveTo(40, y + 40).lineTo(560, y + 40).stroke("#000");

        doc.font("Helvetica").fontSize(9);
        doc.text(`Party Name : ${billingName || "RARO HOUSE OF FASHION PVT. LTD."}`, 45, y + 5);
        doc.text(`Date of Bill : ${formatDate(billDate)}`, 255, y + 5);
        doc.text("INVOICE NO.", 405, y + 5);
        doc.text(invoiceNo || "BPS/DL/0084", 405, y + 25, { width: 150, align: "center" });
        doc.text(`State Code : ${stateCode || "07"}, ${billingState || "Delhi"}`, 45, y + 25);
        doc.text(`GSTIN : ${billingGst || "07AAECR3140B1ZY"}`, 45, y + 45);
        doc.text(`Party Address : ${billingAddress || "Noida sector 27 Bhawani market"}`, 255, y + 45, {
            width: 145,
            lineBreak: false
        });

        y += 70;

        // =========================
        // TABLE HEADER
        // =========================
        const headers = [
            { label: "SR NO", width: 30 },
            { label: "DATE", width: 50 },
            { label: "POD NO", width: 60 },
            { label: "SENDOR PARTY", width: 70 },
            { label: "RECEIVER PARTY", width: 70 },
            { label: "NOS", width: 25 },
            { label: "WEIGHT", width: 40 },
            { label: "INS.", width: 30 },
            { label: "AMOUNT", width: 50 },
            { label: "CGST", width: 70 },
            { label: "SGST", width: 65 }
        ];

        doc.rect(40, y, 520, 20).stroke("#000");
        let x = 40;
        doc.font("Helvetica-Bold").fontSize(8);
        headers.forEach((h, i) => {
            if (i > 0) doc.moveTo(x, y).lineTo(x, y + 20).stroke("#000");
            doc.text(h.label, x + 2, y + 6, { width: h.width - 4, align: "center" });
            x += h.width;
        });

        y += 20;

        // =========================
        // TABLE BODY
        // =========================
        let totalAmount = 0, totalCgst = 0, totalSgst = 0;

        // Use actual bookings data
        const rows = bookings.length ? bookings : [
            {
                bookingDate: "2025-11-03",
                bookingId: "BHPAR9133BOOK",
                items: [
                    {
                        "receiptNo": "RCPT-UGY2RA",
                        "refNo": "12",  // ✅ YAHAN SE refNo AAYEGA
                        "insurance": 12345,
                        "vppAmount": 0,
                        "toPay": "toPay",
                        "weight": 10,
                        "amount": 10000,
                        "_id": "6909d1a6f6e66f2e69b0c22f"
                    }
                ],
                senderName: "Satyam Ray",
                receiverName: "Shubham Bhaskar",
                weight: 10,
                insurance: 12345,
                amount: 10000,
                billTotal: 10000
            }
        ];

        console.log("Processing bookings:", rows); // Debug log

        rows.forEach((booking, index) => {
            console.log(`Booking ${index}:`, booking); // Debug log
            console.log(`Booking ${index} items:`, booking.items); // Debug log

            createTableRow(doc, y, headers, booking, index, (amt, cgst, sgst) => {
                totalAmount += amt;
                totalCgst += cgst;
                totalSgst += sgst;
            });
            y += 20;
        });

        // =========================
        // TOTAL ROW
        // =========================
        const totalRowHeight = 20;
        doc.rect(40, y, 520, totalRowHeight).stroke("#000");
        let totalX = 40;
        headers.forEach((h, i) => {
            if (i > 0) doc.moveTo(totalX, y).lineTo(totalX, y + totalRowHeight).stroke("#000");
            if (i === 0) doc.text("Total", totalX + 2, y + 6, { width: h.width - 4, align: "center" });
            if (i === 8) doc.text(totalAmount.toFixed(2), totalX + 2, y + 6, { width: h.width - 4, align: "center" });
            if (i === 9) doc.text(totalCgst.toFixed(2), totalX + 2, y + 6, { width: h.width - 4, align: "center" });
            if (i === 10) doc.text(totalSgst.toFixed(2), totalX + 2, y + 6, { width: h.width - 4, align: "center" });
            totalX += h.width;
        });

        y += 30;

        // =========================
        // SUMMARY BOX
        // =========================
        const finalRoundOff = parseFloat(roundOff) || 0.3;
        const grandTotal = totalAmount + totalCgst + totalSgst + finalRoundOff;

        doc.rect(340, y - 5, 220, 80).stroke("#000");
        doc.font("Helvetica").fontSize(10);
        doc.text("AMOUNT TOTAL", 350, y);
        doc.text(totalAmount.toFixed(2), 500, y, { align: "right" });
        y += 15;
        doc.text("(+) CGST 9%", 350, y);
        doc.text(totalCgst.toFixed(2), 500, y, { align: "right" });
        y += 15;
        doc.text("(+) SGST 9%", 350, y);
        doc.text(totalSgst.toFixed(2), 500, y, { align: "right" });
        y += 15;
        doc.text("Round Off", 350, y);
        doc.text(finalRoundOff.toFixed(2), 500, y, { align: "right" });
        y += 15;
        doc.font("Helvetica-Bold");
        doc.text("GRAND TOTAL", 350, y);
        doc.text(grandTotal.toFixed(2), 500, y, { align: "right" });

        y += 30;

        // =========================
        // AMOUNT IN WORDS
        // =========================
        doc.font("Helvetica-Bold").fontSize(10)
            .text(`AMOUNT IN WORDS :- INR ${convertNumberToWords(Math.round(grandTotal))} Only.`, 50, y);

        y += 30;

        // =========================
        // FOOTER / SIGNATURE
        // =========================
        doc.text("For Bharat Parcel Services Pvt.Ltd.", 400, y);
        y += 15;
        doc.text("DIRECTOR", 400, y);

        doc.end();
    });
};