import React, { useRef } from 'react';
import {
    Modal, Box, Typography, Divider, Button, Table, TableHead,
    TableBody, TableRow, TableCell, Paper, Grid
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SlipModal = ({ open, handleClose, bookingData }) => {
    const printRef = useRef();

    if (!bookingData) return null;

    const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;
    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';

    const addresses = [
        { city: "H.O. DELHI", address: "332, Kucha Ghasi Ram, Chandni Chowk, Fatehpuri, Delhi -110006", phone: "011-45138699, 7779993453" },
        { city: "MUMBAI", address: "1, Malharrao Wadi, Gr. Flr., R. No. 4, D.A Lane Kalbadevi Rd., Mumbai-400002", phone: "022-49711975, 7779993454" }
    ];

    // Bilty Amount fixed 20 रुपये
    const biltyAmount = 20;

    const cgstRate = bookingData?.cgst || 0;
    const sgstRate = bookingData?.sgst || 0;
    const igstRate = bookingData?.igst || 0;

    // ✅ CORRECTED GST CALCULATION: GST billTotal पर calculate होगा
    const cgstAmount = (bookingData?.billTotal * cgstRate) / 100;
    const sgstAmount = (bookingData?.billTotal * sgstRate) / 100;
    const igstAmount = (bookingData?.billTotal * igstRate) / 100;

    // ✅ CORRECTED Grand Total calculation with ROUND OFF
    const totalBeforeRound = bookingData?.billTotal + cgstAmount + sgstAmount + igstAmount;
    const roundedGrandTotal = Math.round(totalBeforeRound); // nearest whole number
    const roundOff = (roundedGrandTotal - totalBeforeRound).toFixed(2);

    const Invoice = () => (
        <Paper elevation={0} sx={{
            border: '1px solid black',
            m: 1,
            p: 1,
            fontSize: '12px'
        }}>
            {/* Company Header */}
            <Grid container justifyContent="space-between" p={0.5} sx={{ mb: 1 }}>
                <Box textAlign="center" flex={1}>
                    <Typography variant="h6" sx={{
                        borderBottom: '2px solid #999',
                        fontSize: '16px',
                        lineHeight: 1.2
                    }}>
                        BHARAT PARCEL SERVICES PVT. LTD.
                    </Typography>
                    <Typography sx={{
                        borderBottom: '2px solid #999',
                        fontSize: '11px',
                        lineHeight: 1.2
                    }}>
                        SUBJECT TO {bookingData?.startStation?.stationName} JURISDICTION
                    </Typography>
                </Box>
                <Box textAlign="end">
                    <Typography variant="subtitle2" sx={{ fontSize: '10px', fontWeight: "bold" }}>
                        GSTIN : {bookingData?.startStation?.gst}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontSize: '10px', fontWeight: "bold" }}>
                        PAN : AAECB6506F
                    </Typography>
                </Box>
            </Grid>

            {/* Addresses */}
            <Box sx={{ mt: 0.5, mb: 1 }}>
                {addresses.map((addr) => (
                    <Grid key={addr.city} container alignItems="flex-start" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontSize: '10px', fontWeight: 600 }}>
                            {addr.city}:
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 600, ml: 0.5 }}>
                            {addr.address}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ fontSize: '9px', fontWeight: 600, ml: 0.5 }}>
                            ({addr.phone})
                        </Typography>
                    </Grid>
                ))}
            </Box>

            {/* Booking Details */}
            <Grid container justifyContent="space-between" borderTop="1px solid black" borderBottom="1px solid black" p={0.5}>
                <Typography sx={{ fontSize: '11px' }}>
                    Ref. No.: <strong>{bookingData?.items?.[0]?.refNo}</strong>
                </Typography>
                <Typography sx={{ fontSize: '11px' }}>
                    Date: <strong>{formatDate(bookingData?.bookingDate)}</strong>
                </Typography>
            </Grid>

            <Grid container justifyContent="space-between" borderBottom="1px solid black" p={0.5}>
                <Typography sx={{ fontSize: '11px' }}>
                    From (City): <strong>{bookingData?.fromCity}</strong>
                </Typography>
                <Typography sx={{ fontSize: '11px' }}>
                    To (City): <strong>{bookingData?.toCity}</strong>
                </Typography>
            </Grid>

            <Grid container justifyContent="space-between" borderBottom="1px solid black" p={0.5}>
                <Typography sx={{ fontSize: '11px' }}>
                    From: <strong>{bookingData?.senderName}</strong>
                </Typography>
                <Typography sx={{ fontSize: '11px' }}>
                    GSTIN: <strong>{bookingData?.senderGgt}</strong>
                </Typography>
            </Grid>

            <Grid container justifyContent="space-between" borderBottom="1px solid black" p={0.5}>
                <Typography sx={{ fontSize: '11px' }}>
                    To: <strong>{bookingData?.receiverName}</strong>
                </Typography>
                <Typography sx={{ fontSize: '11px' }}>
                    GSTIN: <strong>{bookingData?.receiverGgt}</strong>
                </Typography>
            </Grid>

            {/* Items Table */}
            <Table size="small" sx={{
                border: '1px solid black',
                mt: 1,
                '& .MuiTableCell-root': {
                    padding: '4px 2px',
                    fontSize: '10px',
                    lineHeight: 1.2
                }
            }}>
                <TableHead>
                    <TableRow>
                        {["No.", "Insurance", "VPP Amount", "To Pay/Paid", "Weight (Kgs)", "Amount"].map((h, i) => (
                            <TableCell key={i} align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                                {h}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {bookingData.items.map((item, idx) => (
                        <TableRow key={idx}>
                            <TableCell align="center" sx={{ border: "1px solid black" }}>{idx + 1}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid black" }}>{formatCurrency(item.insurance)}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid black" }}>{formatCurrency(item.vppAmount)}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid black" }}>{item.toPay}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid black" }}>{item.weight}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid black" }}>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                    ))}

                    {/* Summary Rows */}
                    <TableRow>
                        <TableCell colSpan={5} align="right" sx={{ border: "1px solid black" }}>
                            Items Total
                        </TableCell>
                        <TableCell align="center" sx={{ border: "1px solid black" }}>
                            {formatCurrency(bookingData.items.reduce((sum, item) => sum + Number(item.amount || 0), 0))}
                        </TableCell>
                    </TableRow>

                    {/* Bilty Amount Row */}
                    <TableRow>
                        <TableCell colSpan={5} align="right" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                            Bilty Amount
                        </TableCell>
                        <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                            {formatCurrency(biltyAmount)}
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell colSpan={5} align="right" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                            Bill Total
                        </TableCell>
                        <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                            {formatCurrency(bookingData?.billTotal)}
                        </TableCell>
                    </TableRow>

                    {cgstRate > 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="right" sx={{ border: "1px solid black" }}>
                                CGST ({cgstRate}%)
                            </TableCell>
                            <TableCell align="center" sx={{ border: "1px solid black" }}>
                                {formatCurrency(cgstAmount)}
                            </TableCell>
                        </TableRow>
                    )}
                    {sgstRate > 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="right" sx={{ border: "1px solid black" }}>
                                SGST ({sgstRate}%)
                            </TableCell>
                            <TableCell align="center" sx={{ border: "1px solid black" }}>
                                {formatCurrency(sgstAmount)}
                            </TableCell>
                        </TableRow>
                    )}
                    {igstRate > 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="right" sx={{ border: "1px solid black" }}>
                                IGST ({igstRate}%)
                            </TableCell>
                            <TableCell align="center" sx={{ border: "1px solid black" }}>
                                {formatCurrency(igstAmount)}
                            </TableCell>
                        </TableRow>
                    )}

                    {/* Round Off Row */}
                    <TableRow>
                        <TableCell colSpan={5} align="right" sx={{ border: "1px solid black" }}>
                            Round Off
                        </TableCell>
                        <TableCell align="center" sx={{ border: "1px solid black" }}>
                            {formatCurrency(roundOff)}
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell colSpan={5} align="right" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                            Grand Total
                        </TableCell>
                        <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                            {formatCurrency(roundedGrandTotal)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    );

    // ✅ DOWNLOAD AS PDF (A4 FIT - SINGLE PAGE) - MINIMAL MARGIN
    const handleDownloadPDF = async () => {
        const element = printRef.current;

        // Set optimal scale for A4 fit
        const scale = 1.8;

        const canvas = await html2canvas(element, {
            scale: scale,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // ✅ MINIMAL MARGIN - Only 2mm top and bottom
        const marginTop = 2;
        const marginBottom = 2;
        const marginLeft = 2;
        const marginRight = 2;

        const contentWidth = pageWidth - (marginLeft + marginRight);
        const contentHeight = pageHeight - (marginTop + marginBottom);

        // Calculate aspect ratio
        const imgRatio = canvas.width / canvas.height;
        const pageRatio = contentWidth / contentHeight;

        let finalWidth, finalHeight;

        if (imgRatio > pageRatio) {
            // Image is wider
            finalWidth = contentWidth;
            finalHeight = contentWidth / imgRatio;
        } else {
            // Image is taller
            finalHeight = contentHeight;
            finalWidth = contentHeight * imgRatio;
        }

        // ✅ CENTER WITH MINIMAL MARGIN
        const x = marginLeft + (contentWidth - finalWidth) / 2;
        const y = marginTop + (contentHeight - finalHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

        // Generate filename with sender name and date
        const senderName = bookingData?.senderName?.replace(/\s+/g, '_') || 'Unknown';
        const bookingDate = formatDate(bookingData?.bookingDate).replace(/\//g, '-');
        const fileName = `B_${senderName}_${bookingDate}.pdf`;

        pdf.save(fileName);
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: '#fff',
                width: '200mm',
                p: 1,
                border: '1px solid black',
                maxHeight: '90vh',
                overflowY: 'auto',
                fontSize: '12px'
            }}>
                <Box ref={printRef}>
                    <Invoice />
                    <Divider sx={{
                        borderColor: 'black',
                        borderStyle: 'dashed',
                        my: 1,
                        fontSize: '10px'
                    }} />
                    <Invoice />
                </Box>
                <Box textAlign="center" mt={1}>
                    <Button variant="contained" startIcon={<ReceiptIcon />} onClick={handleDownloadPDF}>
                        Download PDF
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default SlipModal;