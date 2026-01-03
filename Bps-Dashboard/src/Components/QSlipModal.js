import React, { useRef } from 'react';
import {
  Modal, Box, Typography, Divider, Button, Paper, Grid, Table, TableHead,
  TableBody, TableRow, TableCell, ButtonGroup, Chip
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PrintIcon from '@mui/icons-material/Print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BlockIcon from '@mui/icons-material/Block';

// Import your logo image
import companyLogo from '../assets/logo2.png';

const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';

  if (typeof dateStr === "string" && dateStr.includes("/")) {
    return dateStr;
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getTopayBadge = (topay) => {
  switch (topay) {
    case 'paid':
      return {
        label: 'Paid',
        color: 'success',
        icon: <CheckCircleOutlineIcon sx={{ fontSize: '12px', mr: 0.5 }} />
      };
    case 'toPay':
      return {
        label: 'To Pay',
        color: 'warning',
        icon: <PendingActionsIcon sx={{ fontSize: '12px', mr: 0.5 }} />
      };
    case 'none':
      return {
        label: 'None',
        color: 'default',
        icon: <BlockIcon sx={{ fontSize: '12px', mr: 0.5 }} />
      };
    default:
      return {
        label: 'N/A',
        color: 'default',
        icon: null
      };
  }
};

const QSlipModal = ({ open, handleClose, bookingData }) => {
  const printRef = useRef();

  if (!bookingData) return null;

  // API data से contact numbers निकालें
  const senderContact = bookingData?.mobile || 'N/A';
  const receiverContact = bookingData?.toContactNumber || 'N/A';

  // delivery date - API में proposedDeliveryDate है
  const deliveryDate = bookingData?.proposedDeliveryDate || bookingData?.deliveryDate;

  // booking date - API में quotationDate है
  const bookingDate = bookingData?.quotationDate || bookingData?.bookingDate;

  const addresses = [
    {
      city: "H.O. DELHI",
      address: "332, Kucha Ghasi Ram, Chandni Chowk, Fatehpuri, Delhi -110006",
      phone: "011-45138699, 7779993453"
    },
    {
      city: "MUMBAI",
      address: "1, Malharrao Wadi, Gr. Fir. R. No. 4, D.A Lane Kalabadevi Rd. Mumbai-400002",
      phone: "022-49711975, 7779993454"
    },
  ];

  // Bilty Amount fixed 20 रुपये
  const biltyAmount = 20;

  // Calculate total product value (price × quantity)
  const productTotal = bookingData?.productDetails?.reduce((sum, item) =>
    sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0) || 0;

  // Calculate total insurance
  const totalInsurance = bookingData?.totalInsurance || bookingData?.productDetails?.reduce((sum, item) =>
    sum + (Number(item.insurance) || 0), 0) || 0;

  // Calculate total VPP amount
  const totalVppAmount = bookingData?.productDetails?.reduce((sum, item) =>
    sum + (Number(item.vppAmount) || 0), 0) || 0;

  // Use either amount from API or calculate from products
  const baseAmount = bookingData?.amount || productTotal;

  // Bill Total = Base Amount + Total Insurance + Total VPP Amount + Bilty Amount
  const billTotal = baseAmount + totalInsurance + totalVppAmount + biltyAmount;

  // Tax rates
  const sTaxRate = bookingData?.sTax || 0;
  const sgstRate = bookingData?.sgst || 0;

  // Tax calculation on product value only (not on insurance or VPP)
  const sTaxAmount = (baseAmount * sTaxRate) / 100;
  const sgstAmount = (baseAmount * sgstRate) / 100;

  // Grand Total before rounding
  const grandTotalBeforeRound = billTotal + sTaxAmount + sgstAmount;

  // Round Off Calculation
  const roundedGrandTotal = Math.round(grandTotalBeforeRound);
  const roundOff = (roundedGrandTotal - grandTotalBeforeRound).toFixed(2);

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
            src={companyLogo}
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
            SUBJECT TO {bookingData?.startStation?.stationName || bookingData?.startStationName || 'DELHI'} JURISDICTION
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
        {addresses.map((addr) => (
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

      {/* Basic Details Section with Booking and Delivery Dates */}
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
              {formatDate(bookingDate)}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ border: '1px solid #000', p: 0.5 }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>
              Delivery Date:
            </Typography>
            <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: '#000' }}>
              {formatDate(deliveryDate)}
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
                <strong>Name:</strong> <strong>{bookingData?.fromCustomerName || bookingData?.senderName}</strong>
              </Typography>
              <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                <strong>Contact:</strong> <strong>{senderContact}</strong>
              </Typography>
              <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                <strong>City:</strong> <strong>{bookingData?.fromCity || bookingData?.startStationName}</strong>
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
                <strong>Name:</strong> <strong>{bookingData?.toCustomerName || bookingData?.receiverName}</strong>
              </Typography>
              <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                <strong>Contact:</strong> <strong>{receiverContact}</strong>
              </Typography>
              <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                <strong>City:</strong> <strong>{bookingData?.toCity || bookingData?.endStation}</strong>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Product Details Table with VPP Amount */}
      <Table size="small" sx={{
        border: '1px solid #000',
        mb: 1,
        '& .MuiTableCell-root': {
          padding: '2px 3px',
          fontSize: '9px',
          lineHeight: 1,
          fontFamily: 'Arial, sans-serif'
        }
      }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
            {["Sr.", "Receipt No", "Ref No", "Description", "Qty", "Weight", "Insurance", "VPP Amount", "Amount", "Payment"].map((h, i) => (
              <TableCell key={i} align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {bookingData?.productDetails?.map((item, idx) => {
            const badge = getTopayBadge(item.topay);
            return (
              <TableRow key={idx}>
                <TableCell align="center" sx={{ border: "1px solid #000" }}>{idx + 1}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #000", fontSize: '8px' }}>
                  {item.receiptNo || '-'}
                </TableCell>
                <TableCell align="center" sx={{ border: "1px solid #000", fontSize: '8px' }}>
                  {item.refNo || '-'}
                </TableCell>
                <TableCell align="center" sx={{ border: "1px solid #000" }}>{item.name}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #000" }}>{item.quantity}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #000" }}>{item.weight} kg</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #000" }}>{formatCurrency(item.insurance || 0)}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #000" }}>
                  {formatCurrency(item.vppAmount || 0)}
                </TableCell>
                <TableCell align="center" sx={{ border: "1px solid #000" }}>
                  {formatCurrency(item.price * item.quantity)}
                </TableCell>
                <TableCell align="center" sx={{ border: "1px solid #000" }}>
                  <Chip
                    size="small"
                    label={badge.label}
                    color={badge.color}
                    icon={badge.icon}
                    sx={{
                      height: '18px',
                      fontSize: '8px',
                      '& .MuiChip-icon': { fontSize: '10px' }
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}

          {/* Totals Row */}
          <TableRow sx={{ backgroundColor: '#f8f8f8' }}>
            <TableCell colSpan={3} align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
              TOTAL
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
              -
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
              {bookingData?.productDetails?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0}
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
              {bookingData?.productDetails?.reduce((sum, item) => sum + (Number(item.weight) || 0), 0) || 0} kg
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
              {formatCurrency(totalInsurance)}
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
              {formatCurrency(totalVppAmount)}
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
              {formatCurrency(baseAmount)}
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #000", fontWeight: "bold" }}>
              -
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
                  <TableCell align="right">{formatCurrency(baseAmount)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Insurance:</TableCell>
                  <TableCell align="right">{formatCurrency(totalInsurance)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total VPP Amount:</TableCell>
                  <TableCell align="right">{formatCurrency(totalVppAmount)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Bilty Amount:</TableCell>
                  <TableCell align="right">{formatCurrency(biltyAmount)}</TableCell>
                </TableRow>
                <TableRow sx={{ borderTop: '1px solid #ccc' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Bill Total:</TableCell>
                  <TableCell align="right">{formatCurrency(billTotal)}</TableCell>
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
                {sTaxRate > 0 && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Service Tax ({sTaxRate}%):</TableCell>
                    <TableCell align="right">{formatCurrency(sTaxAmount)}</TableCell>
                  </TableRow>
                )}
                {sgstRate > 0 && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>SGST ({sgstRate}%):</TableCell>
                    <TableCell align="right">{formatCurrency(sgstAmount)}</TableCell>
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

      {/* Additional Comments */}
      {bookingData?.additionalCmt && (
        <Box sx={{ mt: 1, border: '1px solid #ccc', p: 0.5, borderRadius: '3px' }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>
            Additional Comments:
          </Typography>
          <Typography sx={{ fontSize: '9px' }}>
            {bookingData.additionalCmt}
          </Typography>
        </Box>
      )}

      {/* Signature Section */}
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

  // ✅ DOWNLOAD AS PDF
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

    const fileName = `Quotation_${bookingData?.bookingId}.pdf`;
    pdf.save(fileName);
  };

  // ✅ DIRECT PRINT FUNCTION
  const handleDirectPrint = () => {
    const getLogoBase64 = () => {
      try {
        const img = document.querySelector('img[alt="Bharat Parcel Logo"]');
        if (img) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const maxWidth = 40;
          const maxHeight = 40;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          return canvas.toDataURL('image/png');
        }
      } catch (error) {
        console.error('Error getting logo:', error);
      }
      return null;
    };

    const logoData = getLogoBase64();

    const invoiceContent = (copyNumber = 1) => `
      <div style="border: 2px solid #000; margin: 2mm; padding: 2mm; font-family: Arial, sans-serif; font-size: 12px; background-color: ${copyNumber === 2 ? '#f8f8f8' : '#fff'};">
        <!-- Company Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2mm;">
          <div style="width: 50px;">
            ${logoData ? `<img src="${logoData}" alt="Logo" style="width: 50px; height: 50px; object-fit: contain;" />` : ''}
          </div>
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 16px; font-weight: bold; line-height: 1.2;">
              BHARAT PARCEL SERVICES PVT. LTD.
            </div>
            <div style="font-size: 10px; line-height: 1.2; margin-top: 0.5mm;">
              SUBJECT TO ${bookingData?.startStation?.stationName || bookingData?.startStationName || 'DELHI'} JURISDICTION
            </div>
          </div>
        </div>

        <!-- Addresses -->
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 0.5mm; margin-bottom: 1mm;">
          ${addresses.map(addr => `
            <div style="width: 48%;">
              <div style="font-size: 9px; font-weight: 600;">${addr.city}:</div>
              <div style="font-size: 8px; font-weight: 600;">${addr.address}</div>
              <div style="font-size: 8px; font-weight: 600;">(${addr.phone})</div>
            </div>
          `).join('')}
        </div>

        <!-- Basic Details -->
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1mm; margin-bottom: 1mm;">
          <div style="border: 1px solid #000; padding: 0.5mm;">
            <div style="font-size: 10px; font-weight: bold;">Booking ID:</div>
            <div style="font-size: 11px; font-weight: bold; color: #000;">${bookingData?.bookingId}</div>
          </div>
          <div style="border: 1px solid #000; padding: 0.5mm;">
            <div style="font-size: 10px; font-weight: bold;">Booking Date:</div>
            <div style="font-size: 11px; font-weight: bold; color: #000;">${formatDate(bookingDate)}</div>
          </div>
          <div style="border: 1px solid #000; padding: 0.5mm;">
            <div style="font-size: 10px; font-weight: bold;">Delivery Date:</div>
            <div style="font-size: 11px; font-weight: bold; color: #000;">${formatDate(deliveryDate)}</div>
          </div>
        </div>

        <!-- Sender and Receiver -->
        <div style="border: 1px solid #000; padding: 1mm; margin-bottom: 1mm;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1mm;">
            <div style="border-right: 1px solid #ccc; padding-right: 1mm;">
              <div style="font-size: 11px; font-weight: bold; text-decoration: underline; margin-bottom: 0.5mm;">SENDER</div>
              <div style="font-size: 10px; margin-bottom: 0.5mm;"><strong>Name:</strong> <strong>${bookingData?.fromCustomerName || bookingData?.senderName}</strong></div>
              <div style="font-size: 10px; margin-bottom: 0.5mm;"><strong>Contact:</strong> <strong>${senderContact}</strong></div>
              <div style="font-size: 10px; margin-bottom: 0.5mm;"><strong>City:</strong> <strong>${bookingData?.fromCity || bookingData?.startStationName}</strong></div>
            </div>
            <div>
              <div style="font-size: 11px; font-weight: bold; text-decoration: underline; margin-bottom: 0.5mm;">RECEIVER</div>
              <div style="font-size: 10px; margin-bottom: 0.5mm;"><strong>Name:</strong> <strong>${bookingData?.toCustomerName || bookingData?.receiverName}</strong></div>
              <div style="font-size: 10px; margin-bottom: 0.5mm;"><strong>Contact:</strong> <strong>${receiverContact}</strong></div>
              <div style="font-size: 10px; margin-bottom: 0.5mm;"><strong>City:</strong> <strong>${bookingData?.toCity || bookingData?.endStation}</strong></div>
            </div>
          </div>
        </div>

        <!-- Product Table with Receipt No, Ref No, and VPP Amount -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 1mm; font-size: 9px;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #000; padding: 0.5mm; text-align: center; font-weight: bold;">Sr.</th>
              <th style="border: 1px solid #000; padding: 0.5mm; text-align: center; font-weight: bold;">Receipt No</th>
              <th style="border: 1px solid #000; padding: 0.5mm; text-align: center; font-weight: bold;">Ref No</th>
              <th style="border: 1px solid #000; padding: 0.5mm; text-align: center; font-weight: bold;">Description</th>
              <th style="border: 1px solid #000; padding: 0.5mm; text-align: center; font-weight: bold;">Qty</th>
              <th style="border: 1px solid #000; padding: 0.5mm; text-align: center; font-weight: bold;">Weight</th>
              <th style="border: 1px solid #000; padding: 0.5mm; text-align: center; font-weight: bold;">Insurance</th>
              <th style="border: 1px solid #000; padding: 0.5mm; text-align: center; font-weight: bold;">VPP Amount</th>
              <th style="border: 1px solid #000; padding: 0.5mm; text-align: center; font-weight: bold;">Amount</th>
              <th style="border: 1px solid #000; padding: 0.5mm; text-align: center; font-weight: bold;">Payment</th>
            </tr>
          </thead>
          <tbody>
            ${bookingData?.productDetails?.map((item, idx) => {
      const badge = getTopayBadge(item.topay);
      const badgeColor = badge.color === 'success' ? 'green' :
        badge.color === 'warning' ? 'orange' : 'gray';
      return `
                <tr>
                  <td style="border: 1px solid #000; padding: 0.3mm; text-align: center;">${idx + 1}</td>
                  <td style="border: 1px solid #000; padding: 0.3mm; text-align: center; font-size: 8px;">${item.receiptNo || '-'}</td>
                  <td style="border: 1px solid #000; padding: 0.3mm; text-align: center; font-size: 8px;">${item.refNo || '-'}</td>
                  <td style="border: 1px solid #000; padding: 0.3mm; text-align: center;">${item.name}</td>
                  <td style="border: 1px solid #000; padding: 0.3mm; text-align: center;">${item.quantity}</td>
                  <td style="border: 1px solid #000; padding: 0.3mm; text-align: center;">${item.weight} kg</td>
                  <td style="border: 1px solid #000; padding: 0.3mm; text-align: center;">${formatCurrency(item.insurance || 0)}</td>
                  <td style="border: 1px solid #000; padding: 0.3mm; text-align: center;">${formatCurrency(item.vppAmount || 0)}</td>
                  <td style="border: 1px solid #000; padding: 0.3mm; text-align: center;">${formatCurrency(item.price * item.quantity)}</td>
                  <td style="border: 1px solid #000; padding: 0.3mm; text-align: center;">
                    <span style="font-size: 7px; padding: 0.2mm 1mm; border-radius: 10px; background-color: ${badgeColor === 'green' ? '#d4edda' : badgeColor === 'orange' ? '#fff3cd' : '#e2e3e5'}; color: ${badgeColor === 'green' ? '#155724' : badgeColor === 'orange' ? '#856404' : '#383d41'};">${badge.label}</span>
                  </td>
                </tr>
              `;
    }).join('')}
            
            <!-- Totals Row -->
            <tr style="background-color: #f8f8f8;">
              <td colspan="3" style="border: 1px solid #000; padding: 0.3mm; text-align: center; font-weight: bold;">TOTAL</td>
              <td style="border: 1px solid #000; padding: 0.3mm; text-align: center; font-weight: bold;">-</td>
              <td style="border: 1px solid #000; padding: 0.3mm; text-align: center; font-weight: bold;">${bookingData?.productDetails?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0}</td>
              <td style="border: 1px solid #000; padding: 0.3mm; text-align: center; font-weight: bold;">${bookingData?.productDetails?.reduce((sum, item) => sum + (Number(item.weight) || 0), 0) || 0} kg</td>
              <td style="border: 1px solid #000; padding: 0.3mm; text-align: center; font-weight: bold;">${formatCurrency(totalInsurance)}</td>
              <td style="border: 1px solid #000; padding: 0.3mm; text-align: center; font-weight: bold;">${formatCurrency(totalVppAmount)}</td>
              <td style="border: 1px solid #000; padding: 0.3mm; text-align: center; font-weight: bold;">${formatCurrency(baseAmount)}</td>
              <td style="border: 1px solid #000; padding: 0.3mm; text-align: center; font-weight: bold;">-</td>
            </tr>
          </tbody>
        </table>

        <!-- Summary Section -->
        <div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1mm;">
            <div>
              <table style="width: 100%; border: none; font-size: 10px;">
                <tr>
                  <td style="font-weight: bold;">Items Total:</td>
                  <td align="right">${formatCurrency(baseAmount)}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Total Insurance:</td>
                  <td align="right">${formatCurrency(totalInsurance)}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Total VPP Amount:</td>
                  <td align="right">${formatCurrency(totalVppAmount)}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Bilty Amount:</td>
                  <td align="right">${formatCurrency(biltyAmount)}</td>
                </tr>
                <tr style="border-top: 1px solid #ccc;">
                  <td style="font-weight: bold;">Bill Total:</td>
                  <td align="right">${formatCurrency(billTotal)}</td>
                </tr>
              </table>
            </div>
            <div>
              <table style="width: 100%; border: none; font-size: 10px;">
                ${sTaxRate > 0 ? `
                <tr>
                  <td style="font-weight: bold;">Service Tax (${sTaxRate}%):</td>
                  <td align="right">${formatCurrency(sTaxAmount)}</td>
                </tr>
                ` : ''}
                ${sgstRate > 0 ? `
                <tr>
                  <td style="font-weight: bold;">SGST (${sgstRate}%):</td>
                  <td align="right">${formatCurrency(sgstAmount)}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="font-weight: bold;">Round Off:</td>
                  <td align="right">${formatCurrency(roundOff)}</td>
                </tr>
                <tr style="border-top: 1px solid #000;">
                  <td style="font-weight: bold; font-size: 11px;">GRAND TOTAL:</td>
                  <td align="right" style="font-weight: bold; font-size: 11px; color: #000;">${formatCurrency(roundedGrandTotal)}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        ${bookingData?.additionalCmt ? `
          <div style="margin-top: 1mm; border: 1px solid #ccc; padding: 0.5mm; border-radius: 3px;">
            <div style="font-size: 10px; font-weight: bold;">Additional Comments:</div>
            <div style="font-size: 9px;">${bookingData.additionalCmt}</div>
          </div>
        ` : ''}

        <!-- Signature Section -->
        <div style="margin-top: 2mm; padding-top: 1mm; border-top: 1px dashed #000; display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="width: 45%; text-align: center;">
            <div style="font-size: 10px; font-weight: bold; border-top: 1px solid #000; padding-top: 3mm; margin-top: 5mm;">
              Customer Signature
            </div>
            <div style="font-size: 9px; color: #666; margin-top: 1mm;">
              (With Company Stamp)
            </div>
          </div>
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
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation - ${bookingData?.bookingId}</title>
        <style>
          @media print {
            @page {
              margin: 5mm 10mm;
              size: A4 portrait;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.1;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9px;
            }
            th, td {
              border: 1px solid black;
              padding: 2px 1px;
              text-align: center;
            }
            .divider {
              border-top: 1px dashed #999;
              margin: 10px 0;
              text-align: center;
              color: #999;
              font-size: 10px;
            }
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.1;
            margin: 10px;
          }
        </style>
      </head>
      <body>
        <!-- Original Copy -->
        ${invoiceContent(1)}
        
        <div class="divider">--- Duplicate Copy ---</div>
        
        <!-- Duplicate Copy -->
        ${invoiceContent(2)}
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() {
                setTimeout(function() {
                  window.close();
                }, 500);
              };
            }, 500);
          };
        </script>
      </body>
      </html>
    `);

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
              sx={{ px: 3, mr: 2 }}
            >
              Download PDF
            </Button>
            <Button
              startIcon={<PrintIcon />}
              onClick={handleDirectPrint}
              sx={{ px: 3, ml: 2 }}
            >
              Print Directly
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </Modal>
  );
};

export default QSlipModal;