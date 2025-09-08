import React from 'react';
import {
    Modal, Box, Typography, Divider, Button, Paper,
    Grid
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: '#fff',
    boxShadow: 24,
    p: 3,
    borderRadius: 3,
    maxHeight: '90vh',
    overflowY: 'auto',
};

const labelStyle = { color: '#666', fontWeight: 500 };
const valueStyle = { color: '#222', fontWeight: 600, fontFamily: 'monospace' };
const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;
const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';

const SlipModal = ({ open, handleClose, bookingData }) => {
    if (!bookingData) return null;

    const handlePrint = () => {
        const newWin = window.open('', '', 'width=800,height=600');

        const printHTML = `
  <html>
    <head>
      <title>Print Receipt</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          font-size: 12px;
          color: #000;
        }
        .print-container {
          width: 100%;
          max-width: 750px;
          margin: auto;
        }
        .section {
          border: 1px solid #ccc;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 4px;
        }
        .row {
          display: flex;
          margin-bottom: 4px;
        }
        .col-6 {
          width: 50%;
          padding: 2px 8px;
        }
        .label { color: #666; font-weight: 500; }
        .value { color: #222; font-weight: 600; font-family: monospace; }
        .footer {
          text-align: center;
          margin-top: 12px;
          font-size: 10px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <h2 style="text-align:center; color:#1976d2;">Bharat Parcel Services</h2>
        <div style="text-align:center; font-size:11px;">
          332, Kucha Ghasiram, Chandni Chowk, Fatehpuri, Delhi-6<br/>
          Ph: 45138699, 9318407386<br/>
          GST: 07AAFCB1234R1Z1 | PAN: AAFCB1234R
        </div>

        <div class="section">
          <h4>Booking Details</h4>
          ${[
                ['Ref No', bookingData?.items?.[0]?.refNo || bookingData?.bookingId],
                ['Receipt No', bookingData?.items?.[0]?.receiptNo || 'N/A'],
                ['Date', formatDate(bookingData?.bookingDate)],
                ['From', bookingData?.fromCity],
                ['To', bookingData?.endStation?.stationName || bookingData?.toCity],
                ['Sender', bookingData?.senderName || bookingData?.firstName],
                ['Receiver', bookingData?.receiverName || bookingData?.items?.[0]?.toName || 'N/A'],
                ['Contact', bookingData?.mobile],
            ].map(([label, value]) => `
            <div class="row">
              <div class="col-6"><span class="label">${label}:</span></div>
              <div class="col-6"><span class="value">${value}</span></div>
            </div>`).join('')}
        </div>

        <div class="section">
          <h4>Payment Summary</h4>
          ${[
                ['Freight', formatCurrency(bookingData?.freight)],
                ['Insurance/VPP', formatCurrency(bookingData?.ins_vpp)],
                ['Topay', formatCurrency(bookingData?.items?.toPay)],
                ['CGST (9%)', formatCurrency(bookingData?.cgst)],
                ['SGST (9%)', formatCurrency(bookingData?.sgst)],
                ['IGST (18%)', formatCurrency(bookingData?.igst)],
                ['Total Amount', formatCurrency(bookingData?.grandTotal)],
            ].map(([label, value]) => `
            <div class="row">
              <div class="col-6"><span class="label">${label}:</span></div>
              <div class="col-6"><span class="value">${value}</span></div>
            </div>`).join('')}
        </div>

        <div class="footer">
          Thank you for choosing Bharat Parcel Services
        </div>
      </div>
    </body>
  </html>
  `;

        newWin.document.write(printHTML);
        newWin.document.close();
        newWin.onload = function () {
            newWin.focus();
            newWin.print();
            newWin.close();
        };
    };


    const {
        bookingId, bookingDate, fromCity, toCity, firstName, mobile,
        freight, ins_vpp, cgst, sgst, igst, grandTotal, items, endStation,
        senderName, receiverName, contact
    } = bookingData;

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <div id="print-section">
                    {/* Header */}
                    <Box textAlign="center" mb={2}>
                        <Typography variant="h5" fontWeight="bold" color="primary">Bharat Parcel Services</Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            {bookingData.startStation.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Ph: {bookingData.startStation.contact}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            GST: {bookingData.startStation.gst} | PAN: AAFCB1234R
                        </Typography>
                    </Box>

                    {/* Booking Details with Grid */}
                    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom color="primary" fontWeight="bold">
                            Booking Details
                        </Typography>
                        <Grid container spacing={1}>
                            {[
                                ['Ref No', items?.[0]?.refNo || bookingId],
                                ['Receipt No', items?.[0]?.receiptNo || 'N/A'],
                                ['Date', formatDate(bookingDate)],
                                ['From', fromCity],
                                ['To', endStation?.stationName || toCity],
                                ['Sender', senderName || firstName],
                                ['Receiver', receiverName || items?.[0]?.toName || 'N/A'],
                                ['Contact', mobile],
                            ].map(([label, value], i) => (
                                <React.Fragment key={i}>
                                    <Grid size={{ xs: 6 }}><Typography sx={labelStyle}>{label}:</Typography></Grid>
                                    <Grid size={{ xs: 6 }}><Typography sx={valueStyle}>{value}</Typography></Grid>
                                </React.Fragment>
                            ))}
                        </Grid>
                    </Paper>

                    {/* Payment Summary with Grid */}
                    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom color="primary" fontWeight="bold">
                            Payment Summary
                        </Typography>
                        <Grid container spacing={1}>
                            {[
                                ['Freight', formatCurrency(freight)],
                                ['Insurance/VPP', formatCurrency(ins_vpp)],
                                ['Topay', (bookingData?.items?.[0]?.toPay)],
                                ['CGST (9%)', formatCurrency(cgst)],
                                ['SGST (9%)', formatCurrency(sgst)],
                                ['IGST (18%)', formatCurrency(igst)],
                            ].map(([label, value], i) => (
                                <React.Fragment key={i}>
                                    <Grid size={{ xs: 6 }}><Typography sx={labelStyle}>{label}:</Typography></Grid>
                                    <Grid size={{ xs: 6 }}><Typography sx={valueStyle}>{value}</Typography></Grid>
                                </React.Fragment>
                            ))}
                        </Grid>

                        <Divider sx={{ my: 1.5 }} />
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1" fontWeight="bold">Total Amount:</Typography>
                            <Typography variant="body1" fontWeight="bold" color="primary">
                                {formatCurrency(grandTotal)}
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Footer */}
                    <Typography variant="caption" textAlign="center" display="block" color="text.secondary" mt={1}>
                        Thank you for choosing Bharat Parcel Services
                    </Typography>
                </div>

                {/* Print Button */}
                <Box mt={2} display="flex" justifyContent="center">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ReceiptIcon />}
                        sx={{ borderRadius: 2, px: 4, textTransform: 'none' }}
                        onClick={handlePrint}
                    >
                        Print Receipt
                    </Button>
                </Box>
            </Box>

        </Modal>
    );
};

export default SlipModal;