import PDFDocument from 'pdfkit';

export const generateInvoicePDF = async (customer, bookings, invoiceNo) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' }); // 👈 force A4 size
    const buffers = [];

    return new Promise((resolve, reject) => {
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const lineHeight = 20;
        let y = 50;

        // === HEADER DETAILS ===
        const headerBooking = bookings?.[0] || {};
        const stationName = headerBooking?.startStation?.stationName || 'Bharat Parcel Services Pvt.Ltd.';
        const stationAddress = headerBooking?.startStation?.address || '332, Kucha Ghasi Ram, Chandni Chowk, Delhi';
        const stationGST = headerBooking?.startStation?.gst || '07AAECB6506F1ZY';
        const stationContact = headerBooking?.startStation?.contact || '7779993453';
        // const invoiceNo = headerBooking?.bookingId || 'BHPAR2564BOOK';
        // const stateCode = '07';
        const today = new Date();
        const dateOfBill = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

        // Title
        doc.fontSize(16).text('TAX INVOICE', { align: 'center' });
        y += 30;

        doc.fontSize(12).text(stationName, 50, y); y += lineHeight;
        doc.text(stationAddress, 50, y); y += lineHeight;
        doc.text(`Phone No.: ${stationContact}`, 50, y); y += lineHeight;
        doc.text(`GSTIN: ${stationGST}    PAN: AAECB6506F    SAC CODE: 9968`, 50, y); y += lineHeight + 10;

        // === PARTY DETAILS ===
        const fullName = `${customer.firstName || ''} ${customer.middleName || ''} ${customer.lastName || ''}`.trim() || 'Satyam Ray';
        const partyAddress = (customer.senderLocality || customer.address || 'Noida sector 27 Bhawani market').replace(/\r?\n/g, ', ');
        const senderState = customer.state || 'Goa';
        const senderGst = customer.gstNumber || 'satyam1234';
        const stateCode = customer.stateCode || '07';
        doc.text(`Party Name: ${fullName}`, 50, y);
        doc.text(`Date of Bill: ${dateOfBill}`, 350, y);
        y += lineHeight;

        doc.text(`State Code: ${stateCode}, ${senderState}`, 50, y);
        // doc.text(`Type of Service: `, 350, y);
        doc.text(`INVOICE NO: ${invoiceNo}`, 350, y);
        y += lineHeight;

        doc.text(`GSTIN: ${senderGst}`, 50, y);
        y += lineHeight;

        doc.text(`Party Address: ${partyAddress}`, 50, y);
        y += lineHeight + 10;

        // === TABLE HEADER ===
        doc.font('Helvetica-Bold');
        doc.lineWidth(0.5);

        const rowHeight = 30;

        // Column positions (fixed to fit A4 width 515pt)
        const colX = {
            sr: 50,
            date: 80,
            pod: 140,
            sender: 220,
            receiver: 320,
            nos: 420,
            weight: 460,
            amount: 510
        };

        // Draw header background
        doc.rect(50, y, 515, rowHeight).fill('#f0f0f0').stroke();
        doc.fillColor('black');

        const fontSize = 10;
        doc.fontSize(fontSize);

        const headerY = y + (rowHeight - fontSize) / 2;
        doc.text('SR NO', colX.sr, headerY, { width: 25, align: 'center' });
        doc.text('DATE', colX.date, headerY, { width: 50, align: 'center' });
        doc.text('POD NO', colX.pod, headerY, { width: 70, align: 'center' });
        doc.text('SENDER PARTY', colX.sender, headerY, { width: 90, align: 'center' });
        doc.text('RECEIVER PARTY', colX.receiver, headerY, { width: 90, align: 'center' });
        doc.text('NOS', colX.nos, headerY, { width: 40, align: 'center' });
        doc.text('WEIGHT', colX.weight, headerY, { width: 50, align: 'center' });
        doc.text('AMOUNT', colX.amount, headerY, { width: 60, align: 'center' });

        y += rowHeight;

        // === LOOP ROWS ===
        let totalAmount = 0, totalWeight = 0, totalNos = 0;

        bookings.forEach((b, index) => {
            const bookingDate = formatDate(b.bookingDate);
            const senderParty = truncateText(b.senderName, 15);
            const receiverParty = truncateText(b.receiverName, 15);
            const podNo = b.items?.[0]?.receiptNo || 'RCPT-0000';
            const weight = b.items?.reduce((sum, i) => sum + (Number(i.weight) || 0), 0) || 0;
            const nos = b.items?.length || 0;
            const amount = Number(b.billTotal) || 0;

            // Draw row border
            doc.rect(50, y, 515, rowHeight).stroke();

            // Add text inside row
            const textY = y + (rowHeight - fontSize) / 2;
            doc.font('Helvetica').fontSize(fontSize).fillColor('black');
            doc.text((index + 1).toString(), colX.sr, textY, { width: 25, align: 'center' });
            doc.text(bookingDate, colX.date, textY, { width: 50, align: 'center' });
            doc.text(podNo, colX.pod, textY, { width: 70, align: 'center' });
            doc.text(senderParty, colX.sender, textY, { width: 90, align: 'center' });
            doc.text(receiverParty, colX.receiver, textY, { width: 90, align: 'center' });
            doc.text(nos.toString(), colX.nos, textY, { width: 40, align: 'center' });
            doc.text(weight.toString(), colX.weight, textY, { width: 50, align: 'center' });
            doc.text(amount.toFixed(2), colX.amount, textY, { width: 60, align: 'center' });

            totalAmount += amount;
            totalWeight += weight;
            totalNos += nos;

            y += rowHeight;
        });

        // === FOOTER TOTALS ===
        doc.rect(50, y, 515, rowHeight).fill('#f9f9f9').stroke();
        doc.fillColor('black').font('Helvetica-Bold');

        const footerY = y + (rowHeight - fontSize) / 2;
        doc.text('TOTAL', colX.receiver, footerY, { width: 90, align: 'center' });
        doc.text(totalNos.toString(), colX.nos, footerY, { width: 40, align: 'center' });
        doc.text(totalWeight.toString(), colX.weight, footerY, { width: 50, align: 'center' });
        doc.text(totalAmount.toFixed(2), colX.amount, footerY, { width: 60, align: 'center' });

        y += rowHeight + 15;

        // === SUMMARY SECTION (Right side inside A4 width) ===
        const rightColX = 400; // 👈 fix starting X for right aligned section
        const valueX = 510;    // 👈 all amounts end here

        doc.font('Helvetica-Bold');
        doc.text(`AMOUNT TOTAL`, rightColX, y);
        doc.text(totalAmount.toFixed(2), valueX, y, { width: 60, align: 'right' });
        y += lineHeight;

        const gstRate = 9;
        const cgstAmount = (gstRate / 100) * totalAmount;
        const sgstAmount = (gstRate / 100) * totalAmount;

        doc.font('Helvetica');
        doc.text(`(+) CGST ${gstRate}%`, rightColX, y);
        doc.text(cgstAmount.toFixed(2), valueX, y, { width: 60, align: 'right' });
        y += lineHeight;

        doc.text(`(+) SGST ${gstRate}%`, rightColX, y);
        doc.text(sgstAmount.toFixed(2), valueX, y, { width: 60, align: 'right' });
        y += lineHeight;

        doc.text(`Round off`, rightColX, y);
        const grandTotalBeforeRound = totalAmount + cgstAmount + sgstAmount;
        const roundOff = Math.round(grandTotalBeforeRound) - grandTotalBeforeRound;
        doc.text(roundOff.toFixed(2), valueX, y, { width: 60, align: 'right' });
        y += lineHeight;

        const grandTotal = totalAmount + cgstAmount + sgstAmount + roundOff;
        doc.font('Helvetica-Bold');
        doc.text(`GRAND TOTAL`, rightColX, y);
        doc.text(grandTotal.toFixed(2), valueX, y, { width: 60, align: 'right' });
        y += lineHeight + 15;

        // Amount in words
        doc.text(`AMOUNT IN WORDS :- INR ${convertNumberToWords(grandTotal)} Only.`, 50, y);
        y += lineHeight + 40;

        // Footer
        doc.text('For Bharat Parcel Services Pvt.Ltd.', { align: 'right', });
        y += lineHeight;
        doc.text('DIRECTOR', { align: 'right' });

        doc.end();
    });
};

// --- Helper functions ---
function formatDate(date) {
    if (!date) return '15-8-2025';
    const d = new Date(date);
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
}

function convertNumberToWords(num) {
    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n) {
        if ((n = n.toString()).length > 9) return 'Overflow';
        let numStr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!numStr) return; let str = '';
        str += (numStr[1] != 0) ? (a[Number(numStr[1])] || b[numStr[1][0]] + ' ' + a[numStr[1][1]]) + ' Crore ' : '';
        str += (numStr[2] != 0) ? (a[Number(numStr[2])] || b[numStr[2][0]] + ' ' + a[numStr[2][1]]) + ' Lakh ' : '';
        str += (numStr[3] != 0) ? (a[Number(numStr[3])] || b[numStr[3][0]] + ' ' + a[numStr[3][1]]) + ' Thousand ' : '';
        str += (numStr[4] != 0) ? (a[Number(numStr[4])] || b[numStr[4][0]] + ' ' + a[numStr[4][1]]) + ' Hundred ' : '';
        str += (numStr[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(numStr[5])] || b[numStr[5][0]] + ' ' + a[numStr[5][1]]) + ' ' : '';
        return str.trim();
    }
    return inWords(Math.floor(num)) + (num % 1 ? ' and ' + Math.round((num % 1) * 100) + '/100' : '');
}
