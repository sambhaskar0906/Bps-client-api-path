import React, { useRef } from 'react';
import {
    Modal, Box, Typography, Divider, Button, Table, TableHead,
    TableBody, TableRow, TableCell, Paper, Grid, ButtonGroup
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PrintIcon from '@mui/icons-material/Print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CompanyLogo from '../assets/logo2.png';

const SlipModal = ({ open, handleClose, bookingData }) => {
    const printRef = useRef();

    if (!bookingData) return null;

    const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";

        if (typeof dateStr === "string" && dateStr.includes("/")) {
            return dateStr;
        }

        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "N/A";

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const addresses = [
        { city: "H.O. DELHI", address: "332, Kucha Ghasi Ram, Chandni Chowk, Fatehpuri, Delhi -110006", phone: "011-45138699, 7779993453" },
        { city: "MUMBAI", address: "1, Malharrao Wadi, Gr. Flr., R. No. 4, D.A Lane Kalbadevi Rd., Mumbai-400002", phone: "022-49711975, 7779993454" }
    ];

    // Bilty Amount fixed 20 रुपये
    const biltyAmount = 20;

    // Calculate values from API data
    const cgstRate = bookingData?.cgst || 0;
    const sgstRate = bookingData?.sgst || 0;
    const igstRate = bookingData?.igst || 0;

    const cgstAmount = (bookingData?.billTotal * cgstRate) / 100;
    const sgstAmount = (bookingData?.billTotal * sgstRate) / 100;
    const igstAmount = (bookingData?.billTotal * igstRate) / 100;

    const totalBeforeRound = bookingData?.billTotal + cgstAmount + sgstAmount + igstAmount;
    const roundedGrandTotal = Math.round(totalBeforeRound);
    const roundOff = (roundedGrandTotal - totalBeforeRound).toFixed(2);

    // Calculate total quantity
    const totalQuantity = bookingData?.items?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || 1;

    // Calculate total weight
    const totalWeight = bookingData?.items?.reduce((sum, item) => sum + (Number(item.weight) || 0), 0) || 0;

    // Calculate items total
    const itemsTotal = bookingData?.items?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;

    const Invoice = ({ copyType = "Original" }) => (
        <Paper elevation={0} sx={{
            border: '2px solid #000',
            m: 1,
            p: 1,
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            background: copyType === "Duplicate" ? '#f8f8f8' : '#fff'
        }}>

            {/* Company Header */}
            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Box sx={{ width: '50px' }}>
                    <img
                        src={CompanyLogo}
                        alt="Bharat Parcel Logo"
                        style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
                <Box textAlign="center" flex={1}>
                    <Typography variant="h6" sx={{
                        fontSize: '16px',
                        lineHeight: 1.2,
                        fontWeight: 'bold',
                        fontFamily: 'Arial, sans-serif'
                    }}>
                        BHARAT PARCEL SERVICES PVT. LTD.
                    </Typography>
                    <Typography sx={{
                        fontSize: '10px',
                        lineHeight: 1.2,
                        mt: 0.5,
                        fontFamily: 'Arial, sans-serif'
                    }}>
                        SUBJECT TO {bookingData?.startStation?.stationName} JURISDICTION
                    </Typography>
                </Box>
                <Box textAlign="right">
                    <Typography sx={{
                        fontSize: '9px',
                        fontWeight: "bold",
                        fontFamily: 'Arial, sans-serif'
                    }}>
                        GSTIN : {bookingData?.startStation?.gst}
                    </Typography>
                    <Typography sx={{
                        fontSize: '9px',
                        fontWeight: "bold",
                        fontFamily: 'Arial, sans-serif'
                    }}>
                        PAN : AAECB6506F
                    </Typography>
                </Box>
            </Grid>

            {/* Addresses */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid #000',
                pb: 0.5,
                mb: 1
            }}>
                {addresses.map((addr, index) => (
                    <Box key={addr.city} sx={{ width: '48%' }}>
                        <Typography variant="subtitle2" sx={{
                            fontSize: '9px',
                            fontWeight: 600,
                            fontFamily: 'Arial, sans-serif'
                        }}>
                            {addr.city}:
                        </Typography>
                        <Typography variant="body2" sx={{
                            fontSize: '8px',
                            fontWeight: 600,
                            fontFamily: 'Arial, sans-serif'
                        }}>
                            {addr.address}
                        </Typography>
                        <Typography variant="body2" sx={{
                            fontSize: '8px',
                            fontWeight: 600,
                            fontFamily: 'Arial, sans-serif'
                        }}>
                            ({addr.phone})
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Basic Details Section */}
            <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ border: '1px solid #000', p: 0.5 }}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>
                            Booking ID:
                        </Typography>
                        <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: '#000' }}>
                            {bookingData?.bookingId}
                        </Typography>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Box sx={{ border: '1px solid #000', p: 0.5 }}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>
                            Booking Date:
                        </Typography>
                        <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: '#000' }}>
                            {formatDate(bookingData?.bookingDate)}
                        </Typography>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Box sx={{ border: '1px solid #000', p: 0.5 }}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>
                            Delivery Date:
                        </Typography>
                        <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: '#000' }}>
                            {formatDate(bookingData?.deliveryDate)}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Sender and Receiver Section */}
            <Box sx={{ border: '1px solid #000', p: 1, mb: 1 }}>
                <Grid container spacing={1}>
                    {/* Sender Details */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ borderRight: '1px solid #ccc', pr: 1 }}>
                            <Typography sx={{
                                fontSize: '11px',
                                fontWeight: 'bold',
                                textDecoration: 'underline',
                                mb: 0.5
                            }}>
                                SENDER
                            </Typography>
                            <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                                <strong>Name:</strong> {bookingData?.senderName}
                            </Typography>
                            <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                                <strong>Contact:</strong> {bookingData?.mobile || 'N/A'}
                            </Typography>
                            <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                                <strong>City:</strong> {bookingData?.fromCity}
                            </Typography>
                            <Typography sx={{ fontSize: '9px' }}>
                                <strong>GSTIN:</strong> {bookingData?.senderGgt}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Receiver Details */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box>
                            <Typography sx={{
                                fontSize: '11px',
                                fontWeight: 'bold',
                                textDecoration: 'underline',
                                mb: 0.5
                            }}>
                                RECEIVER
                            </Typography>
                            <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                                <strong>Name:</strong> {bookingData?.receiverName}
                            </Typography>
                            <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                                <strong>Contact:</strong> {bookingData?.mobile || 'N/A'}
                            </Typography>
                            <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                                <strong>City:</strong> {bookingData?.toCity}
                            </Typography>
                            <Typography sx={{ fontSize: '9px' }}>
                                <strong>GSTIN:</strong> {bookingData?.receiverGgt}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Items Table */}
            <Table size="small" sx={{
                border: '1px solid #000',
                mb: 1,
                '& .MuiTableCell-root': {
                    padding: '2px 3px',
                    fontSize: '10px',
                    lineHeight: 1,
                    fontFamily: 'Arial, sans-serif'
                }
            }}>
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>Sr.</TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>Receipt No.</TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>Ref No.</TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>Qty</TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>Weight</TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>Insurance</TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>VPP</TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>To Pay</TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {bookingData?.items?.map((item, idx) => (
                        <TableRow key={idx}>
                            <TableCell align="center" sx={{ border: "1px solid #000" }}>{idx + 1}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #000" }}>{item.receiptNo}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #000" }}>{item.refNo}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #000" }}>{item.quantity || 1}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #000" }}>{item.weight} kg</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #000" }}>{formatCurrency(item.insurance)}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #000" }}>{formatCurrency(item.vppAmount)}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #000" }}>{item.toPay}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #000" }}>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                    ))}

                    {/* Totals Row - Invoice component में */}
                    <TableRow sx={{ backgroundColor: '#f8f8f8' }}>
                        <TableCell colSpan={3} align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
                            TOTAL
                        </TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
                            {totalQuantity}
                        </TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
                            {totalWeight} kg
                        </TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
                            {formatCurrency(bookingData?.items?.reduce((sum, item) => sum + (Number(item.insurance) || 0), 0))}
                        </TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
                            {formatCurrency(bookingData?.items?.reduce((sum, item) => sum + (Number(item.vppAmount) || 0), 0))}
                        </TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
                            -
                        </TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
                            {formatCurrency(itemsTotal)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            {/* Summary Section */}
            <Box sx={{ border: '1px solid #000', p: 0.5 }}>
                <Grid container spacing={1}>
                    {/* Left Side - Items and Bilty */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Table size="small" sx={{
                            '& .MuiTableCell-root': {
                                padding: '1px 2px',
                                fontSize: '10px',
                                border: 'none'
                            }
                        }}>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Items Total:</TableCell>
                                    <TableCell align="right">{formatCurrency(itemsTotal)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Bilty Amount:</TableCell>
                                    <TableCell align="right">{formatCurrency(biltyAmount)}</TableCell>
                                </TableRow>
                                <TableRow sx={{ borderTop: '1px solid #ccc' }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Bill Total:</TableCell>
                                    <TableCell align="right">{formatCurrency(bookingData?.billTotal)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>

                    {/* Right Side - GST and Grand Total */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Table size="small" sx={{
                            '& .MuiTableCell-root': {
                                padding: '1px 2px',
                                fontSize: '10px',
                                border: 'none'
                            }
                        }}>
                            <TableBody>
                                {cgstRate > 0 && (
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>CGST ({cgstRate}%):</TableCell>
                                        <TableCell align="right">{formatCurrency(cgstAmount)}</TableCell>
                                    </TableRow>
                                )}
                                {sgstRate > 0 && (
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>SGST ({sgstRate}%):</TableCell>
                                        <TableCell align="right">{formatCurrency(sgstAmount)}</TableCell>
                                    </TableRow>
                                )}
                                {igstRate > 0 && (
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>IGST ({igstRate}%):</TableCell>
                                        <TableCell align="right">{formatCurrency(igstAmount)}</TableCell>
                                    </TableRow>
                                )}
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Round Off:</TableCell>
                                    <TableCell align="right">{formatCurrency(roundOff)}</TableCell>
                                </TableRow>
                                <TableRow sx={{ borderTop: '1px solid #000' }}>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '11px' }}>GRAND TOTAL:</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '11px', color: '#000' }}>
                                        {formatCurrency(roundedGrandTotal)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                </Grid>
            </Box>

            {/* Summary Section के बाद Signature Section add करें */}
            <Box sx={{
                mt: 2,
                pt: 1,
                borderTop: '1px dashed #000',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
            }}>
                {/* Left Signature - Customer */}
                <Box sx={{ width: '45%', textAlign: 'center' }}>
                    <Typography sx={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        borderTop: '1px solid #000',
                        paddingTop: '10px',
                        marginTop: '20px'
                    }}>
                        Customer Signature
                    </Typography>
                    <Typography sx={{
                        fontSize: '9px',
                        color: '#666',
                        marginTop: '2px'
                    }}>
                        (With Company Stamp)
                    </Typography>
                </Box>

                {/* Right Signature - Company */}
                <Box sx={{ width: '45%', textAlign: 'center' }}>
                    <Typography sx={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        borderTop: '1px solid #000',
                        paddingTop: '10px',
                        marginTop: '20px'
                    }}>
                        For BHARAT PARCEL SERVICES
                    </Typography>
                    <Typography sx={{
                        fontSize: '9px',
                        color: '#666',
                        marginTop: '2px'
                    }}>
                        Authorized Signatory
                    </Typography>
                </Box>
            </Box>

        </Paper>
    );

    // PDF Download Function
    const handleDownloadPDF = async () => {
        const element = printRef.current;
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

        const marginTop = 5;
        const marginBottom = 5;
        const marginLeft = 5;
        const marginRight = 5;

        const contentWidth = pageWidth - (marginLeft + marginRight);
        const contentHeight = pageHeight - (marginTop + marginBottom);

        const imgRatio = canvas.width / canvas.height;
        const pageRatio = contentWidth / contentHeight;

        let finalWidth, finalHeight;

        if (imgRatio > pageRatio) {
            finalWidth = contentWidth;
            finalHeight = contentWidth / imgRatio;
        } else {
            finalHeight = contentHeight;
            finalWidth = contentHeight * imgRatio;
        }

        const x = marginLeft + (contentWidth - finalWidth) / 2;
        const y = marginTop + (contentHeight - finalHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

        const fileName = `QSlip_${bookingData?.bookingId}.pdf`;
        pdf.save(fileName);
    };

    // Direct Print Function
    const handleDirectPrint = () => {
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        const printHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    @media print {
                        @page {
                            margin: 5mm !important;
                            size: A4 portrait !important;
                        }
                        
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                            font-family: Arial, sans-serif !important;
                            font-size: 12px !important;
                        }
                        
                        .qslip-container {
                            width: 190mm !important;
                            margin: 0 auto !important;
                        }
                        
                        .qslip-paper {
                            border: 2px solid #000 !important;
                            margin: 2mm 0 !important;
                            padding: 2mm !important;
                            page-break-inside: avoid !important;
                        }
                        
                        .qslip-header {
                            text-align: center !important;
                            border-bottom: 2px solid #000 !important;
                            padding-bottom: 1mm !important;
                            margin-bottom: 2mm !important;
                        }
                        
                        .qslip-title {
                            font-size: 20px !important;
                            font-weight: bold !important;
                            letter-spacing: 1px !important;
                        }
                        
                        .copy-type {
                            font-size: 10px !important;
                            font-weight: bold !important;
                            color: #666 !important;
                        }
                        
                        .company-header {
                            display: flex !important;
                            align-items: center !important;
                            justify-content: space-between !important;
                            margin-bottom: 2mm !important;
                        }
                        
                        .logo-img {
                            width: 15mm !important;
                            height: 15mm !important;
                            object-fit: contain !important;
                        }
                        
                        .company-name {
                            font-size: 16px !important;
                            font-weight: bold !important;
                            text-align: center !important;
                            flex-grow: 1 !important;
                        }
                        
                        .jurisdiction {
                            font-size: 10px !important;
                            margin-top: 0.5mm !important;
                        }
                        
                        .gst-info {
                            text-align: right !important;
                            font-size: 9px !important;
                            font-weight: bold !important;
                        }
                        
                        .addresses-section {
                            display: flex !important;
                            justify-content: space-between !important;
                            border-bottom: 1px solid #000 !important;
                            padding-bottom: 1mm !important;
                            margin-bottom: 2mm !important;
                        }
                        
                        .address-box {
                            width: 48% !important;
                        }
                        
                        .address-city {
                            font-size: 9px !important;
                            font-weight: bold !important;
                        }
                        
                        .address-line {
                            font-size: 8px !important;
                            font-weight: bold !important;
                        }
                        
                        .phone-line {
                            font-size: 8px !important;
                            font-weight: bold !important;
                        }
                        
                        .basic-details {
                            display: grid !important;
                            grid-template-columns: 2fr 1fr 1fr !important;
                            gap: 1mm !important;
                            margin-bottom: 2mm !important;
                        }
                        
                        .detail-box {
                            border: 1px solid #000 !important;
                            padding: 1mm !important;
                        }
                        
                        .sender-receiver {
                            border: 1px solid #000 !important;
                            padding: 1mm !important;
                            margin-bottom: 2mm !important;
                        }
                        
                        .sr-grid {
                            display: grid !important;
                            grid-template-columns: 1fr 1fr !important;
                            gap: 1mm !important;
                        }
                        
                        .sr-title {
                            font-size: 11px !important;
                            font-weight: bold !important;
                            text-decoration: underline !important;
                            margin-bottom: 1mm !important;
                        }
                        
                        .sr-detail {
                            font-size: 10px !important;
                            margin-bottom: 0.5mm !important;
                        }
                        
                        table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                            margin-bottom: 2mm !important;
                            font-size: 10px !important;
                        }
                        
                        th, td {
                            border: 1px solid #000 !important;
                            padding: 0.5mm 1mm !important;
                            text-align: center !important;
                        }
                        
                        th {
                            font-weight: bold !important;
                            background-color: #f0f0f0 !important;
                        }
                        
                        .summary-section {
                            border: 1px solid #000 !important;
                            padding: 1mm !important;
                            margin-bottom: 2mm !important;
                        }
                        
                        .summary-grid {
                            display: grid !important;
                            grid-template-columns: 1fr 1fr !important;
                            gap: 1mm !important;
                        }
                        
                        .summary-table {
                            border: none !important;
                        }
                        
                        .summary-table td {
                            border: none !important;
                            padding: 0.3mm 0.5mm !important;
                            text-align: left !important;
                        }
                        
                        .total-row {
                            font-weight: bold !important;
                        }
                        
                        .footer {
                            margin-top: 2mm !important;
                            padding-top: 1mm !important;
                            border-top: 1px dashed #666 !important;
                            font-size: 8px !important;
                            text-align: center !important;
                            color: #666 !important;
                        }
                        
                        .divider {
                            border-top: 1px dashed #999 !important;
                            margin: 3mm 0 !important;
                            text-align: center !important;
                            color: #999 !important;
                            font-size: 10px !important;
                        }
                        
                        .cut-line {
                            border-top: 2px dashed red !important;
                            margin: 2mm 0 !important;
                            text-align: center !important;
                            color: red !important;
                            font-size: 9px !important;
                        }
                    }
                    
                    @media screen {
                        body {
                            background: #f0f0f0 !important;
                            padding: 5mm !important;
                        }
                        
                        .qslip-container {
                            background: white !important;
                            padding: 3mm !important;
                            box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="qslip-container">
                    <!-- Original Copy -->
                    <div class="qslip-paper">
                        <div class="company-header">
                            <div>
                                <img 
                                    src="${CompanyLogo}" 
                                    alt="Logo" 
                                    class="logo-img"
                                    onerror="this.style.display='none'"
                                />
                            </div>
                            <div>
                                <div class="company-name">BHARAT PARCEL SERVICES PVT. LTD.</div>
                                <div class="jurisdiction">SUBJECT TO ${bookingData?.startStation?.stationName} JURISDICTION</div>
                            </div>
                            <div class="gst-info">
                                <div>GSTIN : ${bookingData?.startStation?.gst}</div>
                                <div>PAN : AAECB6506F</div>
                            </div>
                        </div>
                        
                        <div class="addresses-section">
                            ${addresses.map(addr => `
                                <div class="address-box">
                                    <div class="address-city">${addr.city}:</div>
                                    <div class="address-line">${addr.address}</div>
                                    <div class="phone-line">(${addr.phone})</div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="basic-details">
                            <div class="detail-box">
                                <div>Booking ID:</div>
                                <div><strong>${bookingData?.bookingId}</strong></div>
                            </div>
                            <div class="detail-box">
                                <div>Date:</div>
                                <div><strong>${formatDate(bookingData?.bookingDate)}</strong></div>
                            </div>
                            <div class="detail-box">
                                <div>Delivery Date:</div>
                                <div><strong>${formatDate(bookingData?.deliveryDate)}</strong></div>
                            </div>
                        </div>
                        
                        <div class="sender-receiver">
                            <div class="sr-grid">
                                <div>
                                    <div class="sr-title">SENDER</div>
                                    <div class="sr-detail"><strong>Name:</strong> ${bookingData?.senderName}</div>
                                    <div class="sr-detail"><strong>Contact:</strong> ${bookingData?.mobile || 'N/A'}</div>
                                    <div class="sr-detail"><strong>City:</strong> ${bookingData?.fromCity}</div>
                                    <div class="sr-detail"><strong>GSTIN:</strong> ${bookingData?.senderGgt}</div>
                                </div>
                                <div>
                                    <div class="sr-title">RECEIVER</div>
                                    <div class="sr-detail"><strong>Name:</strong> ${bookingData?.receiverName}</div>
                                    <div class="sr-detail"><strong>Contact:</strong> ${bookingData?.mobile || 'N/A'}</div>
                                    <div class="sr-detail"><strong>City:</strong> ${bookingData?.toCity}</div>
                                    <div class="sr-detail"><strong>GSTIN:</strong> ${bookingData?.receiverGgt}</div>
                                </div>
                            </div>
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Sr.</th>
                                    <th>Receipt No.</th>
                                    <th>Ref No.</th>
                                    <th>Qty</th>
                                    <th>Weight</th>
                                    <th>Insurance</th>
                                    <th>VPP</th>
                                    <th>To Pay</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bookingData?.items?.map((item, idx) => `
                                    <tr>
                                        <td>${idx + 1}</td>
                                        <td>${item.receiptNo}</td>
                                        <td>${item.refNo}</td>
                                        <td>${item.quantity || 1}</td>
                                        <td>${item.weight} kg</td>
                                        <td>${formatCurrency(item.insurance)}</td>
                                        <td>${formatCurrency(item.vppAmount)}</td>
                                        <td>${item.toPay}</td>
                                        <td>${formatCurrency(item.amount)}</td>
                                    </tr>
                                `).join('')}
                                
                               <tr style="background-color: #f8f8f8;">
    <!-- TOTAL को 3 कॉलम्स (Sr., Receipt No., Ref No.) में span करना चाहिए -->
    <td colspan="3" style="font-weight: bold; text-align: center;">TOTAL</td>
    <td style="font-weight: bold; text-align: center;">${totalQuantity}</td>
    <td style="font-weight: bold; text-align: center;">${totalWeight} kg</td>
    <td style="font-weight: bold; text-align: center;">${formatCurrency(bookingData?.items?.reduce((sum, item) => sum + (Number(item.insurance) || 0), 0))}</td>
    <td style="font-weight: bold; text-align: center;">${formatCurrency(bookingData?.items?.reduce((sum, item) => sum + (Number(item.vppAmount) || 0), 0))}</td>
    <td style="font-weight: bold; text-align: center;">-</td>
    <td style="font-weight: bold; text-align: center;">${formatCurrency(itemsTotal)}</td>
</tr>
                            </tbody>
                        </table>
                        
                        <div class="summary-section">
                            <div class="summary-grid">
                                <div>
                                    <table class="summary-table">
                                        <tr>
                                            <td>Items Total:</td>
                                            <td align="right">${formatCurrency(itemsTotal)}</td>
                                        </tr>
                                        <tr>
                                            <td>Bilty Amount:</td>
                                            <td align="right">${formatCurrency(biltyAmount)}</td>
                                        </tr>
                                        <tr style="border-top: 1px solid #ccc;">
                                            <td>Bill Total:</td>
                                            <td align="right">${formatCurrency(bookingData?.billTotal)}</td>
                                        </tr>
                                    </table>
                                </div>
                                <div>
                                    <table class="summary-table">
                                        ${cgstRate > 0 ? `
                                        <tr>
                                            <td>CGST (${cgstRate}%):</td>
                                            <td align="right">${formatCurrency(cgstAmount)}</td>
                                        </tr>
                                        ` : ''}
                                        ${sgstRate > 0 ? `
                                        <tr>
                                            <td>SGST (${sgstRate}%):</td>
                                            <td align="right">${formatCurrency(sgstAmount)}</td>
                                        </tr>
                                        ` : ''}
                                        ${igstRate > 0 ? `
                                        <tr>
                                            <td>IGST (${igstRate}%):</td>
                                            <td align="right">${formatCurrency(igstAmount)}</td>
                                        </tr>
                                        ` : ''}
                                        <tr>
                                            <td>Round Off:</td>
                                            <td align="right">${formatCurrency(roundOff)}</td>
                                        </tr>
                                        <tr style="border-top: 1px solid #000;">
                                            <td><strong>GRAND TOTAL:</strong></td>
                                            <td align="right"><strong>${formatCurrency(roundedGrandTotal)}</strong></td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top: 3mm; padding-top: 1mm; border-top: 1px dashed #000; display: flex; justify-content: space-between; align-items: flex-end;">
    <!-- Left Signature - Customer -->
    <div style="width: 45%; text-align: center;">
        <div style="font-size: 10px; font-weight: bold; border-top: 1px solid #000; padding-top: 3mm; margin-top: 5mm;">
            Customer Signature
        </div>
        <div style="font-size: 9px; color: #666; margin-top: 1mm;">
            (With Company Stamp)
        </div>
    </div>
    
    <!-- Right Signature - Company -->
    <div style="width: 45%; text-align: center;">
        <div style="font-size: 10px; font-weight: bold; border-top: 1px solid #000; padding-top: 3mm; margin-top: 5mm;">
            For BHARAT PARCEL SERVICES
        </div>
        <div style="font-size: 9px; color: #666; margin-top: 1mm;">
            Authorized Signatory
        </div>
    </div>
</div>
                    </div>
                    
                    <div class="divider">--- Duplicate Copy ---</div>
                    
                    <!-- Duplicate Copy -->
                    <div class="qslip-paper" style="background-color: #f8f8f8;">
                        
                        <div class="company-header">
                            <div>
                                <img 
                                    src="${CompanyLogo}" 
                                    alt="Logo" 
                                    class="logo-img"
                                    onerror="this.style.display='none'"
                                />
                            </div>
                            <div>
                                <div class="company-name">BHARAT PARCEL SERVICES PVT. LTD.</div>
                                <div class="jurisdiction">SUBJECT TO ${bookingData?.startStation?.stationName} JURISDICTION</div>
                            </div>
                            <div class="gst-info">
                                <div>GSTIN : ${bookingData?.startStation?.gst}</div>
                                <div>PAN : AAECB6506F</div>
                            </div>
                        </div>
                        
                        <div class="addresses-section">
                            ${addresses.map(addr => `
                                <div class="address-box">
                                    <div class="address-city">${addr.city}:</div>
                                    <div class="address-line">${addr.address}</div>
                                    <div class="phone-line">(${addr.phone})</div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="basic-details">
                            <div class="detail-box">
                                <div>Booking ID:</div>
                                <div><strong>${bookingData?.bookingId}</strong></div>
                            </div>
                            <div class="detail-box">
                                <div>Date:</div>
                                <div><strong>${formatDate(bookingData?.bookingDate)}</strong></div>
                            </div>
                             <div class="detail-box">
                                <div>Delivery Date:</div>
                                <div><strong>${formatDate(bookingData?.deliveryDate)}</strong></div>
                            </div>
                        </div>
                        
                        <div class="sender-receiver">
                            <div class="sr-grid">
                                <div>
                                    <div class="sr-title">SENDER</div>
                                    <div class="sr-detail"><strong>Name:</strong> ${bookingData?.senderName}</div>
                                    <div class="sr-detail"><strong>Contact:</strong> ${bookingData?.mobile || 'N/A'}</div>
                                    <div class="sr-detail"><strong>City:</strong> ${bookingData?.fromCity}</div>
                                    <div class="sr-detail"><strong>GSTIN:</strong> ${bookingData?.senderGgt}</div>
                                </div>
                                <div>
                                    <div class="sr-title">RECEIVER</div>
                                    <div class="sr-detail"><strong>Name:</strong> ${bookingData?.receiverName}</div>
                                    <div class="sr-detail"><strong>Contact:</strong> ${bookingData?.mobile || 'N/A'}</div>
                                    <div class="sr-detail"><strong>City:</strong> ${bookingData?.toCity}</div>
                                    <div class="sr-detail"><strong>GSTIN:</strong> ${bookingData?.receiverGgt}</div>
                                </div>
                            </div>
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Sr.</th>
                                    <th>Receipt No.</th> 
                                    <th>Ref No.</th>
                                    <th>Qty</th>
                                    <th>Weight</th>
                                    <th>Insurance</th>
                                    <th>VPP</th>
                                    <th>To Pay</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bookingData?.items?.map((item, idx) => `
                                    <tr>
                                        <td>${idx + 1}</td>
                                        <td>${item.receiptNo}</td> 
                                        <td>${item.refNo}</td>
                                        <td>${item.quantity || 1}</td>
                                        <td>${item.weight} kg</td>
                                        <td>${formatCurrency(item.insurance)}</td>
                                        <td>${formatCurrency(item.vppAmount)}</td>
                                        <td>${item.toPay}</td>
                                        <td>${formatCurrency(item.amount)}</td>
                                    </tr>
                                `).join('')}
                                
                               <tr style="background-color: #f8f8f8;">
    <td colspan="3" style="font-weight: bold;">TOTAL</td>
    <td style="font-weight: bold;">${totalQuantity}</td>
    <td style="font-weight: bold;">${totalWeight} kg</td>
    <td style="font-weight: bold;">${formatCurrency(bookingData?.items?.reduce((sum, item) => sum + (Number(item.insurance) || 0), 0))}</td>
    <td style="font-weight: bold;">${formatCurrency(bookingData?.items?.reduce((sum, item) => sum + (Number(item.vppAmount) || 0), 0))}</td>
    <td style="font-weight: bold;">-</td>
    <td style="font-weight: bold;">${formatCurrency(itemsTotal)}</td>
</tr>
                            </tbody>
                        </table>
                        
                        <div class="summary-section">
                            <div class="summary-grid">
                                <div>
                                    <table class="summary-table">
                                        <tr>
                                            <td>Items Total:</td>
                                            <td align="right">${formatCurrency(itemsTotal)}</td>
                                        </tr>
                                        <tr>
                                            <td>Bilty Amount:</td>
                                            <td align="right">${formatCurrency(biltyAmount)}</td>
                                        </tr>
                                        <tr style="border-top: 1px solid #ccc;">
                                            <td>Bill Total:</td>
                                            <td align="right">${formatCurrency(bookingData?.billTotal)}</td>
                                        </tr>
                                    </table>
                                </div>
                                <div>
                                    <table class="summary-table">
                                        ${cgstRate > 0 ? `
                                        <tr>
                                            <td>CGST (${cgstRate}%):</td>
                                            <td align="right">${formatCurrency(cgstAmount)}</td>
                                        </tr>
                                        ` : ''}
                                        ${sgstRate > 0 ? `
                                        <tr>
                                            <td>SGST (${sgstRate}%):</td>
                                            <td align="right">${formatCurrency(sgstAmount)}</td>
                                        </tr>
                                        ` : ''}
                                        ${igstRate > 0 ? `
                                        <tr>
                                            <td>IGST (${igstRate}%):</td>
                                            <td align="right">${formatCurrency(igstAmount)}</td>
                                        </tr>
                                        ` : ''}
                                        <tr>
                                            <td>Round Off:</td>
                                            <td align="right">${formatCurrency(roundOff)}</td>
                                        </tr>
                                        <tr style="border-top: 1px solid #000;">
                                            <td><strong>GRAND TOTAL:</strong></td>
                                            <td align="right"><strong>${formatCurrency(roundedGrandTotal)}</strong></td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top: 3mm; padding-top: 1mm; border-top: 1px dashed #000; display: flex; justify-content: space-between; align-items: flex-end;">
    <!-- Left Signature - Customer -->
    <div style="width: 45%; text-align: center;">
        <div style="font-size: 10px; font-weight: bold; border-top: 1px solid #000; padding-top: 3mm; margin-top: 5mm;">
            Customer Signature
        </div>
        <div style="font-size: 9px; color: #666; margin-top: 1mm;">
            (With Company Stamp)
        </div>
    </div>
    
    <!-- Right Signature - Company -->
    <div style="width: 45%; text-align: center;">
        <div style="font-size: 10px; font-weight: bold; border-top: 1px solid #000; padding-top: 3mm; margin-top: 5mm;">
            For BHARAT PARCEL SERVICES
        </div>
        <div style="font-size: 9px; color: #666; margin-top: 1mm;">
            Authorized Signatory
        </div>
    </div>
</div>
                    </div>
                </div>
                
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.onafterprint = function() {
                                window.close();
                            };
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printHtml);
        printWindow.document.close();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: '#fff',
                width: '210mm',
                p: 2,
                border: '1px solid black',
                maxHeight: '90vh',
                overflowY: 'auto',
                fontSize: '12px'
            }}>
                <Box ref={printRef}>
                    <Invoice copyType="Original" />
                    <Divider sx={{
                        borderColor: 'black',
                        borderStyle: 'dashed',
                        my: 2,
                        fontSize: '10px',
                        textAlign: 'center'
                    }}>
                        --- Duplicate Copy ---
                    </Divider>
                    <Invoice copyType="Duplicate" />
                </Box>
                <Box textAlign="center" mt={2}>
                    <ButtonGroup variant="contained" aria-label="slip actions">
                        <Button
                            startIcon={<ReceiptIcon />}
                            onClick={handleDownloadPDF}
                            sx={{
                                px: 3,
                                mr: 2
                            }}
                        >
                            Download PDF
                        </Button>
                        <Button
                            startIcon={<PrintIcon />}
                            onClick={handleDirectPrint}
                            sx={{
                                px: 3,
                                ml: 2
                            }}
                        >
                            Print
                        </Button>
                    </ButtonGroup>
                </Box>
            </Box>
        </Modal>
    );
};

export default SlipModal;