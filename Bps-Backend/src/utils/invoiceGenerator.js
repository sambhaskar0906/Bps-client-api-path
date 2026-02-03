import PDFDocument from "pdfkit";

// =========================
// 🔹 Station Master (Fallback Config)
// =========================
const STATION_MASTER = {
    DELHI: {
        name: "Bharat Parcel Services Pvt. Ltd.",
        address: "332, Kucha Ghasi Ram, Chandni Chowk, Fatehpuri, Delhi - 110006",
        phone: "011-23955385, 23830010",
        gst: "07AAECB6506F1ZY",
        pan: "AAECB6506F",
        sac: "9968",
        state: "Delhi"
    },
    MUMBAI: {
        name: "Bharat Parcel Services Pvt. Ltd.",
        address: "1 Malharrao Wadi, Ground Floor, Kalbadevi Rd., Mumbai - 400002",
        phone: "022-22411975, 22422812",
        gst: "27AAECB6506F1ZY",
        pan: "AAECB6506F",
        sac: "9968",
        state: "Maharashtra"
    }
};

// =========================
// 🔹 Utils
// =========================
const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};

const convertNumberToWords = (num) => {
    if (!num) return "";
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
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
// 🔹 Station Resolver
// =========================
const resolveStationHeader = (booking) => {
    const apiStation = booking?.startStation;

    if (apiStation?.stationName && apiStation?.address && apiStation?.gst) {
        return {
            name: "Bharat Parcel Services Pvt. Ltd.",
            address: `${apiStation.address}, ${apiStation.city} - ${apiStation.pincode}`,
            phone: apiStation.contact,
            gst: apiStation.gst,
            pan: "AAECB6506F",
            sac: "9968",
            state: apiStation.state
        };
    }

    const stationName = apiStation?.stationName?.toUpperCase();
    if (stationName && STATION_MASTER[stationName]) {
        return STATION_MASTER[stationName];
    }

    return STATION_MASTER.DELHI; // default fallback
};

// =========================
// 🔹 Table Row Height Calc
// =========================
const calculateRowHeight = (doc, row, widths) => {
    let h = 26; // base height increased
    row.forEach((t, i) => {
        const ht = doc.heightOfString(String(t), {
            width: widths[i] - 10,
            lineBreak: true
        });
        h = Math.max(h, ht + 14);
    });
    return h;
};

// =========================
// 🧾 Generate Invoice PDF (Clean Black & White Design)
// =========================
export const generateInvoicePDF = async (data) => {
    const { bookings = [], invoiceNo, billDate } = data;
    const booking = bookings[0];
    const station = resolveStationHeader(booking);

    const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
            Title: `Invoice ${invoiceNo}`,
            Author: 'Bharat Parcel Services',
            Subject: 'Tax Invoice'
        }
    });
    const buffers = [];

    return new Promise((resolve) => {
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));

        let y = 40;

        // ================= HEADER =================

        y += 15;

        // Company name
        doc.font("Helvetica-Bold").fontSize(18).fillColor('black')
            .text(station.name, 40, y, { width: 520, align: "center" });
        y += 25;

        // Address details
        doc.font("Helvetica").fontSize(10).fillColor('black')
            .text(station.address, { width: 520, align: "center" });
        y += 12;
        doc.text(`Phone: ${station.phone}`, { width: 520, align: "center" });
        y += 12;

        // GST/PAN details
        doc.font("Helvetica-Bold").fontSize(10).fillColor('black')
            .text(`GSTIN: ${station.gst} | PAN: ${station.pan} | SAC: ${station.sac}`, { width: 520, align: "center" });

        y += 25;

        // INVOICE title
        doc.font("Helvetica-Bold").fontSize(22).fillColor('black')
            .text("TAX INVOICE", 40, y, { width: 520, align: "center" });
        doc.moveTo(200, y + 25).lineTo(400, y + 25).lineWidth(0.5).strokeColor('black').stroke();

        y += 40;

        const contentStartY = y;

        // ================= BILL TO & INVOICE DETAILS =================
        doc.moveTo(300, y).lineTo(300, y + 95).lineWidth(0.7).strokeColor('black').stroke();

        let leftY = y + 8;
        let rightY = y + 8;

        // ================= BILL TO =================
        doc.font("Helvetica-Bold").fontSize(10).text("BILL TO", 45, leftY);
        leftY += 16;

        // Sender Name (BOLD)
        doc.font("Helvetica-Bold").fontSize(9)
            .text(`${booking.senderName}`, 45, leftY, { width: 240 });

        leftY += doc.heightOfString(`${booking.senderName}`, { width: 240 }) + 4;
        doc.moveTo(45, leftY).lineTo(285, leftY).lineWidth(0.3).stroke();

        // Address (auto wrap safe)
        leftY += 4;
        doc.font("Helvetica").fontSize(9)
            .text(`${booking.senderLocality}`, 45, leftY, { width: 240 });

        leftY += doc.heightOfString(`${booking.senderLocality}`, { width: 240 }) + 4;
        doc.moveTo(45, leftY).lineTo(285, leftY).lineWidth(0.3).stroke();

        // GSTIN
        leftY += 4;
        doc.font("Helvetica").fontSize(9)
            .text(`GSTIN: ${booking.senderGgt || 'N/A'}`, 45, leftY, { width: 240 });

        leftY += 12;
        doc.moveTo(45, leftY).lineTo(285, leftY).lineWidth(0.3).stroke();


        // ================= INVOICE DETAILS =================
        doc.font("Helvetica-Bold").fontSize(10)
            .text("INVOICE DETAILS", 305, rightY);

        rightY += 16;

        // Invoice No (bold label + value)
        doc.font("Helvetica-Bold").fontSize(9)
            .text(`Invoice No: ${invoiceNo || "AUTO"}`, 305, rightY, { width: 240 });

        rightY += 12;
        doc.moveTo(305, rightY).lineTo(555, rightY).lineWidth(0.3).stroke();

        // Invoice Date
        rightY += 4;
        doc.font("Helvetica").fontSize(9)
            .text(`Invoice Date: ${formatDate(billDate)}`, 305, rightY, { width: 240 });

        rightY += 12;
        doc.moveTo(305, rightY).lineTo(555, rightY).lineWidth(0.3).stroke();

        // Place of Supply
        rightY += 4;
        doc.text(`Place of Supply: ${station.state}`, 305, rightY, { width: 240 });

        rightY += 12;
        doc.moveTo(305, rightY).lineTo(555, rightY).lineWidth(0.3).stroke();

        // State Code
        rightY += 4;
        doc.text(`State Code: ${station.gst?.substring(0, 2) || '07'}`, 305, rightY, { width: 240 });

        rightY += 12;
        doc.moveTo(305, rightY).lineTo(555, rightY).lineWidth(0.3).stroke();

        // Move Y after box
        y += 95;

        // ================= TABLE HEADER =================
        const headers = [
            { label: "SR", width: 22 },
            { label: "DATE", width: 45 },
            { label: "POD NO", width: 55 },
            { label: "SENDER", width: 70 },
            { label: "RECEIVER", width: 70 },
            { label: "NOS", width: 28 },
            { label: "WT", width: 32 },
            { label: "INS/VPP", width: 42 },
            { label: "AMOUNT", width: 45 },
            { label: "GST", width: 56 },
            { label: "TOTAL", width: 45 }
        ];

        // Header with borders (white background, black text)
        const tableWidth = headers.reduce((sum, h) => sum + h.width, 0);
        const pageWidth = doc.page.width;   // 595
        const startX = (pageWidth - tableWidth) / 2;  // center align
        doc.rect(startX, y, tableWidth, 30).lineWidth(1).strokeColor('black').stroke();
        let x = startX;
        doc.font("Helvetica-Bold").fontSize(9).fillColor('black');
        headers.forEach((h, i) => {
            doc.text(h.label, x + 2, y + 10, { width: h.width - 4, align: "center" });
            // Draw vertical lines between columns
            if (i < headers.length - 1) {
                doc.moveTo(x + h.width, y).lineTo(x + h.width, y + 30).lineWidth(0.5).strokeColor('black').stroke();
            }
            x += h.width;
        });

        y += 30;

        // ================= TABLE BODY =================
        let totalAmount = 0, totalIgst = 0;
        doc.font("Helvetica").fontSize(8).fillColor('black');

        bookings.forEach((b, i) => {
            const item = b.items?.[0] || {};

            const qty = Number(item.quantity || 0);
            const wt = Number(item.weight || 0);
            const insVpp = Number(item.insurance || 0) + Number(item.vppAmount || 0);

            // ✅ taxable base = freight only
            const freight = Number(b.freight || 0);

            // payment type
            const payType = item.toPay; // "toPay" | "paid"

            let gstAmount = 0;
            let gstLabel = "";

            if (payType === "toPay") {
                gstAmount = freight * 0.18;
                gstLabel = `IGST 18%: ${gstAmount.toFixed(2)}`;
            } else if (payType === "paid") {
                const cgst = freight * 0.09;
                const sgst = freight * 0.09;
                gstAmount = cgst + sgst;
                gstLabel = `CGST 9% + SGST 9%: ${gstAmount.toFixed(2)}`;
            }

            // ✅ total
            const total = freight + insVpp + gstAmount;

            const row = [
                i + 1,
                formatDate(b.bookingDate),
                item.receiptNo || b.bookingId,
                b.senderName,
                b.receiverName,
                qty,                        // NOS
                `${wt} kg`,                 // WT
                insVpp.toFixed(2),          // INS/VPP
                freight.toFixed(2),         // FREIGHT
                gstLabel,  // GST
                total.toFixed(2)            // TOTAL
            ];

            const widths = headers.map(h => h.width);
            const hgt = calculateRowHeight(doc, row, widths);

            if (y + hgt > 760) {
                doc.addPage();
                y = 60;
            }

            // Draw row border
            doc.rect(startX, y, tableWidth, hgt).lineWidth(0.5).strokeColor('black').stroke();
            // Draw cell borders and text
            let xx = startX;
            row.forEach((t, j) => {
                let align = "center";

                // Left align for text-heavy columns
                if ([3, 4].includes(j)) align = "left";     // SENDER, RECEIVER
                if (j === 9) align = "center";              // GST

                doc.text(String(t), xx + 6, y + 6, {
                    width: widths[j] - 12,
                    align,
                    lineBreak: false,   // 🔥 no wrap
                    ellipsis: true      // 🔥 cut if too long
                });
                // Draw vertical lines between columns
                if (j > 0) {
                    doc.moveTo(xx, y).lineTo(xx, y + hgt).lineWidth(0.3).strokeColor('black').stroke();
                }
                xx += widths[j];
            });

            totalAmount += freight;
            totalIgst += gstAmount;
            y += hgt;
        });

        // ================= ROUND OFF CALCULATION =================
        const gross = totalAmount + totalIgst;        // subtotal + gst
        const roundedGrand = Math.round(gross);       // nearest rupee
        const roundOff = (roundedGrand - gross).toFixed(2);  // + / - difference

        // ================= TOTAL SECTION =================
        // Total box
        doc.rect(350, y, 210, 85).lineWidth(1).strokeColor('black').stroke();

        // Vertical divider between label & amount
        doc.moveTo(465, y).lineTo(465, y + 85).lineWidth(0.5).strokeColor('black').stroke();

        doc.font("Helvetica-Bold").fontSize(10).fillColor('black');

        // Subtotal
        doc.text(`SUB TOTAL:`, 360, y + 15);
        doc.text(`${totalAmount.toFixed(2)}`, 450, y + 15, { align: "right", width: 95 });

        // GST
        doc.text(`GST:`, 360, y + 35);
        doc.text(`${totalIgst.toFixed(2)}`, 450, y + 35, { align: "right", width: 95 });

        // Round Off
        doc.text(`ROUND OFF:`, 360, y + 50);
        doc.text(`${roundOff}`, 450, y + 50, { align: "right", width: 95 });

        // Grand Total
        doc.font("Helvetica-Bold").fontSize(12);
        doc.text(`GRAND TOTAL:`, 360, y + 65);
        doc.text(`${roundedGrand.toFixed(2)}`, 450, y + 65, { align: "right", width: 95 });

        // ================= FOOTER =================
        y += 85;

        // Amount in Words section
        doc.rect(40, y, 520, 40).lineWidth(0.5).strokeColor('black').stroke();

        doc.font("Helvetica-Bold").fontSize(9).fillColor('black')
            .text("Amount in Words:", 45, y + 12);
        doc.font("Helvetica").fontSize(8).fillColor('black')
            .text(`INR ${convertNumberToWords(roundedGrand).toUpperCase()} ONLY`, 45, y + 25, { width: 500 });

        y += 45;

        // Authorized Signatory section
        y += 50;
        doc.moveTo(350, y).lineTo(550, y).lineWidth(0.5).strokeColor('black').stroke();
        doc.font("Helvetica-Bold").fontSize(9).fillColor('black')
            .text("For Bharat Parcel Services Pvt. Ltd.", 380, y + 10, { width: 170, align: "center" });

        y += 25;
        doc.moveTo(350, y).lineTo(550, y).lineWidth(0.5).strokeColor('black').stroke();
        doc.font("Helvetica-Bold").fontSize(9).fillColor('black')
            .text("AUTHORIZED SIGNATORY", 380, y + 10, { width: 170, align: "center" });

        const contentEndY = y + 25;   // 🔥 continuous border end point

        // ================= CONTINUOUS OUTER BORDER =================

        const pageBorderX = 40;      // left margin
        const pageBorderWidth = 520; // fixed content width
        doc.rect(
            pageBorderX,
            contentStartY,
            pageBorderWidth,
            contentEndY - contentStartY + 10
        ).lineWidth(1).strokeColor('black').stroke();

        // Footer line
        y += 30;

        // Page number
        doc.font("Helvetica").fontSize(7).fillColor('black')
            .text(`Invoice ${invoiceNo} | Generated on: ${formatDate(new Date())
                }`, 40, y + 10, { width: 520, align: "center" });

        doc.end();
    });
};