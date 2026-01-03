// ===========================================
// 📦 TAX INVOICE Generator (FINAL - NO OVERLAP)
// ===========================================

import PDFDocument from "pdfkit";

// =========================
// 🔹 Utility Functions
// =========================
const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};

const convertNumberToWords = (num) => {
    if (!num) return "";
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
        "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const inWords = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + inWords(n % 100) : "");
        if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
        return "";
    };

    return inWords(Math.floor(num));
};

// =========================
// 🔹 Calculate Dynamic Row Height
// =========================
const calculateRowHeight = (doc, rowData, widths) => {
    let height = 20;
    rowData.forEach((t, i) => {
        const h = doc.heightOfString(String(t), { width: widths[i] - 6 });
        height = Math.max(height, h + 10);
    });
    return height;
};

// =========================
// 🧾 Create Table Row
// =========================
function createTableRow(doc, y, headers, booking, index, cb) {
    const amount = Number(booking.amount || booking.billTotal || 0);
    const cgst = amount * 0.09;
    const sgst = amount * 0.09;

    const rowData = [
        index + 1,
        formatDate(booking.bookingDate),
        booking.items?.[0]?.refNo || booking.bookingId || "",
        booking.senderName || "",
        booking.receiverName || "",
        1,
        (booking.weight || 0).toFixed(3),
        (booking.insurance || 0).toFixed(2),
        amount.toFixed(2),
        cgst.toFixed(2),
        sgst.toFixed(2)
    ];

    const widths = headers.map(h => h.width);
    const rowHeight = calculateRowHeight(doc, rowData, widths);

    // Page break
    if (y + rowHeight > 760) {
        doc.addPage();
        y = 60;
    }

    doc.rect(40, y, 520, rowHeight).stroke();

    let x = 40;
    rowData.forEach((t, i) => {
        if (i > 0) doc.moveTo(x, y).lineTo(x, y + rowHeight).stroke();
        doc.text(String(t), x + 3, y + 5, {
            width: headers[i].width - 6,
            align: "center"
        });
        x += headers[i].width;
    });

    cb(amount, cgst, sgst);
    return rowHeight;
}

// ===========================================
// 🧾 Generate Invoice PDF
// ===========================================
export const generateInvoicePDF = async (data) => {
    const {
        invoiceNo,
        billDate,
        billingName,
        billingGst,
        billingAddress,
        billingState,
        stateCode,
        bookings = [],
        roundOff = 0.3
    } = data;

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const buffers = [];

    return new Promise((resolve) => {
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));

        let y = 40;

        // ================= HEADER =================
        doc.font("Helvetica-Bold").fontSize(16).text("TAX INVOICE", 40, y, { width: 520, align: "center" });
        y += 25;

        doc.fontSize(14).text("Bharat Parcel Services Pvt. Ltd.", { align: "center" });
        y += 18;

        doc.font("Helvetica").fontSize(9)
            .text("332, Kucha Ghasi Ram, Chandni Chowk, Fatehpuri, Delhi - 110006", { align: "center" });
        y += 12;

        doc.text("Phone: 011-23955385, 23830010", { align: "center" });
        y += 12;

        doc.text("GSTIN: 07AAECB6506F1ZY | PAN: AAECB6506F | SAC: 9968", { align: "center" });
        y += 20;

        // ================= BILLING =================
        doc.rect(40, y, 520, 75).stroke();
        doc.moveTo(260, y).lineTo(260, y + 75).stroke();
        doc.moveTo(400, y).lineTo(400, y + 75).stroke();

        doc.fontSize(9);
        doc.text(`Party Name: ${billingName}`, 45, y + 6, { width: 200 });
        doc.text(`Date: ${formatDate(billDate)}`, 265, y + 6);
        doc.text("Invoice No:", 405, y + 6);
        doc.font("Helvetica-Bold").text(invoiceNo, 405, y + 20);

        doc.font("Helvetica");
        doc.text(`State Code: ${stateCode}, ${billingState}`, 45, y + 26);
        doc.text(`GSTIN: ${billingGst}`, 45, y + 46);
        doc.text(`Party Address:\n${billingAddress}`, 265, y + 26, { width: 130 });

        y += 90;

        // ================= TABLE HEADER =================
        const headers = [
            { label: "SR", width: 25 },
            { label: "DATE", width: 50 },
            { label: "POD NO", width: 55 },
            { label: "SENDER", width: 65 },
            { label: "RECEIVER", width: 65 },
            { label: "NOS", width: 25 },
            { label: "WT", width: 35 },
            { label: "INS", width: 30 },
            { label: "AMOUNT", width: 55 },
            { label: "CGST", width: 55 },
            { label: "SGST", width: 60 }
        ];

        doc.rect(40, y, 520, 20).stroke();
        let x = 40;
        doc.font("Helvetica-Bold").fontSize(8);
        headers.forEach(h => {
            doc.text(h.label, x + 2, y + 6, { width: h.width - 4, align: "center" });
            x += h.width;
        });
        y += 20;

        // ================= TABLE BODY =================
        let totalAmount = 0, totalCgst = 0, totalSgst = 0;

        bookings.forEach((b, i) => {
            const h = createTableRow(doc, y, headers, b, i, (a, c, s) => {
                totalAmount += a;
                totalCgst += c;
                totalSgst += s;
            });
            y += h;
        });

        // ================= TOTAL =================
        y += 15;
        const grandTotal = totalAmount + totalCgst + totalSgst + roundOff;

        doc.font("Helvetica-Bold").fontSize(10);
        doc.text(`GRAND TOTAL : ₹ ${grandTotal.toFixed(2)}`, 350, y);

        y += 25;
        doc.text(`AMOUNT IN WORDS : INR ${convertNumberToWords(grandTotal)} Only`, 40, y);

        y += 30;
        doc.text("For Bharat Parcel Services Pvt. Ltd.", 380, y);
        y += 15;
        doc.text("DIRECTOR", 430, y);

        doc.end();
    });
};
