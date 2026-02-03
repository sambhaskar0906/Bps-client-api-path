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
import companySignature from '../assets/digital.jpeg';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BlockIcon from '@mui/icons-material/Block';
import Chip from '@mui/material/Chip';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { sendWhatsappBilty } from "../features/whatsapp/whatsappSlice";
import { PDFDocument } from "pdf-lib";

const QSlipModal = ({ open, handleClose, bookingData }) => {
  const printRef = useRef();
  const originalRef = useRef();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.whatsapp);

  const loadImageAsBase64 = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });

  if (!bookingData) return null;

  const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";

    if (typeof dateStr === "string" && /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(dateStr)) {
      return dateStr.replace(/\//g, "-");
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";

    const istTime = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));

    const day = String(istTime.getUTCDate()).padStart(2, "0");
    const month = String(istTime.getUTCMonth() + 1).padStart(2, "0");
    const year = istTime.getUTCFullYear();

    return `${day}-${month}-${year}`;
  };

  // API data से contact numbers
  const senderContact = bookingData?.mobile || 'N/A';
  const receiverContact = bookingData?.toContactNumber || 'N/A';
  const deliveryDate = bookingData?.proposedDeliveryDate || bookingData?.deliveryDate;
  const bookingDate = bookingData?.quotationDate || bookingData?.bookingDate;

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

  const addresses = [
    { city: "H.O. DELHI", address: "332, Kucha Ghasi Ram, Chandni Chowk, Fatehpuri, Delhi -110006", phone: "011-45138699, 7779993453" },
    { city: "MUMBAI", address: "1, Malharrao Wadi, Gr. Flr., R. No. 4, D.A Lane Kalbadevi Rd., Mumbai-400002", phone: "022-49711975, 7779993454" },
    { city: "KOLKATA", address: "33, Shiv Thakur Lane, Ground Floor, Behind Hari Ram Goenka Street, Kolkata-700007", phone: "9163318515" },
    { city: "AHMEDABAD", address: "1312/13/3,Sahyaba Chambers, Nr. Sharmlani Pole, Manek Complex Pedak Road Rajkot", phone: "7802873827" },
    { city: "JAIPUR", address: "House No. 875, Pink House, Ganga Mata Ki Gali, Gopal Ji Ka Rasta, Jaipur", phone: "09672101700, 9672078005" },
    { city: "AGRA", address: "Shop No. 3, Shriji Plaza, Sainik Place, Kinari Bazar, Agra", phone: "8448554369" }
  ];

  const topAddresses = addresses.slice(0, 2); // Delhi & Mumbai
  const bottomAddresses = addresses.slice(2); // Kolkata, Ahmedabad, Jaipur, Agra

  // API से सीधे डेटा लें
  const amount = bookingData?.amount || 0; // यह आपके API में 300 है
  const freight = bookingData?.freight || 0; // यह आपके API में 20 है
  const insVppAmount = bookingData?.insVppAmount || 0; // यह आपके API में 900 है
  const grandTotal = bookingData?.grandTotal || 0; // यह आपके API में 1220 है
  const sTax = bookingData?.sTax || 0;
  const sgst = bookingData?.sgst || 0;

  // Calculate total quantity
  const totalQuantity = bookingData?.productDetails?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || 1;

  // Calculate total weight
  const totalWeight = bookingData?.productDetails?.reduce((sum, item) => sum + (Number(item.weight) || 0), 0) || 0;

  // Calculate total insurance from product details
  const totalInsurance = bookingData?.productDetails?.reduce((sum, item) =>
    sum + (Number(item.insurance) || 0), 0) || 0;

  // Calculate total VPP amount from product details
  const totalVppAmount = bookingData?.productDetails?.reduce((sum, item) =>
    sum + (Number(item.vppAmount) || 0), 0) || 0;

  // बिल टोटल = amount + freight + insVppAmount
  const billTotal = amount + freight + insVppAmount;

  // Calculate tax amounts based on API rates
  const sTaxAmount = (amount * sTax) / 100;
  const sgstAmount = (amount * sgst) / 100;

  // Calculate round off
  const grandTotalBeforeRound = billTotal + sTaxAmount + sgstAmount;
  const roundedGrandTotal = grandTotal; // API से ही grandTotal लें
  const roundOff = (roundedGrandTotal - grandTotalBeforeRound).toFixed(2);

  const Invoice = ({ copyType = "Original" }) => (
    <Paper elevation={0} sx={{
      border: '2px solid #000',
      m: 1,
      p: 1.5,
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      background: copyType === "Duplicate" ? '#f9f9f9' : '#fff',
      height: '100%'
    }}>
      {/* Company Header with Colors */}
      <Grid container alignItems="center" justifyContent="space-between" sx={{
        mb: 1.5,
        pb: 1,
        borderBottom: '2px solid #1a237e'
      }}>
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
            fontFamily: 'Arial, sans-serif',
            color: '#1a237e',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            BHARAT PARCEL SERVICES PVT. LTD.
          </Typography>
          <Typography sx={{
            fontSize: '10px',
            lineHeight: 1.2,
            mt: 0.5,
            fontFamily: 'Arial, sans-serif',
            color: '#d32f2f',
            fontWeight: 'bold'
          }}>
            SUBJECT TO {bookingData?.startStation?.stationName || bookingData?.startStationName || 'DELHI'} JURISDICTION
          </Typography>
        </Box>
        <Box textAlign="right" sx={{
          backgroundColor: '#f5f5f5',
          p: 0.5,
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}>
        </Box>
      </Grid>

      {/* Top Addresses (Delhi & Mumbai) */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px dashed #ccc',
        pb: 1,
        mb: 1.5
      }}>
        {topAddresses.map((addr, index) => (
          <Box key={addr.city} sx={{
            width: '48%',
            p: 0.5,
            backgroundColor: index === 0 ? '#e8f5e9' : '#e3f2fd',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <Typography variant="subtitle2" sx={{
              fontSize: '9px',
              fontWeight: 600,
              fontFamily: 'Arial, sans-serif',
              color: index === 0 ? '#2e7d32' : '#1565c0'
            }}>
              {addr.city}:
            </Typography>
            <Typography variant="body2" sx={{
              fontSize: '8px',
              fontWeight: 500,
              fontFamily: 'Arial, sans-serif',
              lineHeight: 1.2,
              mt: 0.5
            }}>
              {addr.address}
            </Typography>
            <Typography variant="body2" sx={{
              fontSize: '8px',
              fontWeight: 600,
              fontFamily: 'Arial, sans-serif',
              color: index === 0 ? '#388e3c' : '#1976d2',
              mt: 0.5
            }}>
              📞 {addr.phone}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Main Content Grid - Left and Right Sections */}
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        {/* Left Column - Booking Details, Route, Sender/Receiver */}
        <Grid size={{ xs: 12, md: 7 }}>
          {/* Booking ID and Dates Row - Compact Design */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.5,
            p: 1,
            backgroundColor: '#f5f5f5',
            borderRadius: '6px',
            border: '2px solid #1a237e'
          }}>
            <Box>
              <Typography sx={{
                fontSize: '10px',
                color: '#666',
                fontWeight: 'bold',
                mb: 0.5
              }}>
                BOOKING ID
              </Typography>
              <Typography sx={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#1a237e',
                letterSpacing: '1px'
              }}>
                {bookingData?.bookingId}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{
                fontSize: '10px',
                color: '#666',
                fontWeight: 'bold',
                textAlign: 'right',
                mb: 0.5
              }}>
                BOOKING DATE
              </Typography>
              <Typography sx={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#d32f2f',
                textAlign: 'right'
              }}>
                {formatDate(bookingDate)}
              </Typography>
            </Box>
          </Box>

          {/* Route Section - Colorful Design */}
          <Box sx={{
            px: 2,
            py: 1,
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            background: 'linear-gradient(45deg, #1a237e 0%, #283593 100%)',
            color: 'white',
            borderRadius: '6px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>
              ROUTE :
            </Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>
              {bookingData?.startStation?.stationName || bookingData?.startStationName}
            </Typography>
            <Typography sx={{ fontSize: '16px', color: '#ffeb3b' }}>
              ➝
            </Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>
              {bookingData?.endStation?.stationName || bookingData?.endStation}
            </Typography>
          </Box>

          {/* Sender and Receiver Section - Modern Design */}
          <Box sx={{
            borderRadius: '6px',
            backgroundColor: '#fff',
          }}>
            <Grid container spacing={0}>
              {/* Sender Details - Blue Theme */}
              <Grid size={{ xs: 6 }} sx={{
                borderRight: '2px dashed #ccc',
                pr: 1.5
              }}>
                <Box sx={{
                  p: 1,
                  backgroundColor: '#e3f2fd',
                  borderRadius: '4px',
                  border: '1px solid #bbdefb'
                }}>
                  <Typography sx={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#1976d2',
                    mb: 1,
                    textAlign: 'center'
                  }}>
                    SENDER
                  </Typography>
                  <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                    <strong>Name:</strong> {bookingData?.fromCustomerName || bookingData?.senderName}
                  </Typography>
                  <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                    <strong>Contact:</strong> {senderContact}
                  </Typography>
                  <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                    <strong>City:</strong> {bookingData?.fromCity || bookingData?.startStationName}
                  </Typography>
                </Box>
              </Grid>

              {/* Receiver Details - Green Theme */}
              <Grid size={{ xs: 6 }} sx={{ pl: 1.5 }}>
                <Box sx={{
                  p: 1,
                  backgroundColor: '#e8f5e9',
                  borderRadius: '4px',
                  border: '1px solid #c8e6c9'
                }}>
                  <Typography sx={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#388e3c',
                    mb: 1,
                    textAlign: 'center'
                  }}>
                    RECEIVER
                  </Typography>
                  <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                    <strong>Name:</strong> {bookingData?.toCustomerName || bookingData?.receiverName}
                  </Typography>
                  <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                    <strong>Contact:</strong> {receiverContact}
                  </Typography>
                  <Typography sx={{ fontSize: '10px', mb: 0.5 }}>
                    <strong>City:</strong> {bookingData?.toCity || bookingData?.endStation}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Right Column - 4 Addresses (Kolkata, Ahmedabad, Jaipur, Agra) */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{
            border: '2px solid #5d4037',
            p: 1,
            borderRadius: '6px',
            backgroundColor: '#efebe9',
            height: '90%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Grid container spacing={0.8}>
              {bottomAddresses.map((addr, index) => (
                <Grid key={index} size={{ xs: 6 }}>
                  <Box sx={{
                    border: '1px solid #d7ccc8',
                    p: 0.8,
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    height: '100%',
                    minHeight: '75px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <Typography sx={{
                      fontSize: '9px',
                      fontWeight: 'bold',
                      color: '#d84315',
                      mb: 0.3
                    }}>
                      {addr.city}
                    </Typography>
                    <Typography sx={{
                      fontSize: '8px',
                      lineHeight: 1.2,
                      color: '#424242'
                    }}>
                      {addr.address}
                    </Typography>
                    <Typography sx={{
                      fontSize: '8px',
                      fontWeight: 600,
                      color: '#1565c0',
                      mt: 0.3
                    }}>
                      📞 {addr.phone}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* Items Table with Colorful Header */}
      <Table size="small" sx={{
        border: '2px solid #1a237e',
        mb: 1.5,
        '& .MuiTableCell-root': {
          padding: '3px 4px',
          fontSize: '10px',
          lineHeight: 1,
          fontFamily: 'Arial, sans-serif'
        }
      }}>
        <TableHead>
          <TableRow sx={{
            background: 'linear-gradient(45deg, #1a237e 0%, #283593 100%)'
          }}>
            <TableCell align="center" sx={{ border: "1px solid #fff", fontWeight: "bold", color: 'white' }}>Sr.</TableCell>
            <TableCell align="center" sx={{ border: "1px solid #fff", fontWeight: "bold", color: 'white' }}>Receipt No.</TableCell>
            <TableCell align="center" sx={{ border: "1px solid #fff", fontWeight: "bold", color: 'white' }}>Ref No.</TableCell>
            <TableCell align="center" sx={{ border: "1px solid #fff", fontWeight: "bold", color: 'white' }}>Description</TableCell>
            <TableCell align="center" sx={{ border: "1px solid #fff", fontWeight: "bold", color: 'white' }}>Qty</TableCell>
            <TableCell align="center" sx={{ border: "1px solid #fff", fontWeight: "bold", color: 'white' }}>Weight</TableCell>
            <TableCell align="center" sx={{ border: "1px solid #fff", fontWeight: "bold", color: 'white' }}>Insurance</TableCell>
            <TableCell align="center" sx={{ border: "1px solid #fff", fontWeight: "bold", color: 'white' }}>VPP Amount</TableCell>
            <TableCell align="center" sx={{ border: "1px solid #fff", fontWeight: "bold", color: 'white' }}>Amount</TableCell>
            <TableCell align="center" sx={{ border: "1px solid #fff", fontWeight: "bold", color: 'white' }}>Payment</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookingData?.productDetails?.map((item, idx) => {
            const badge = getTopayBadge(item.topay);
            return (
              <TableRow key={idx} sx={{
                backgroundColor: idx % 2 === 0 ? '#f5f5f5' : '#fff',
                '&:hover': { backgroundColor: '#e3f2fd' }
              }}>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{idx + 1}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{item.receiptNo || '-'}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{item.refNo || '-'}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{item.name}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{item.quantity || 1}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{item.weight} kg</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{formatCurrency(item.insurance)}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{formatCurrency(item.vppAmount)}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{formatCurrency(item.price)}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
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
          <TableRow sx={{
            backgroundColor: '#e8eaf6',
            borderTop: '2px solid #1a237e'
          }}>
            <TableCell colSpan={3} align="center" sx={{ border: "1px solid #ddd", fontWeight: "bold", fontSize: '11px', color: '#1a237e' }}>
              TOTAL
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #ddd", fontWeight: "bold", fontSize: '11px', color: '#1a237e' }}>
              -
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #ddd", fontWeight: "bold", fontSize: '11px', color: '#1a237e' }}>
              {totalQuantity}
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #ddd", fontWeight: "bold", fontSize: '11px', color: '#1a237e' }}>
              {totalWeight} kg
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #ddd", fontWeight: "bold", fontSize: '11px', color: '#1a237e' }}>
              {formatCurrency(totalInsurance)}
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #ddd", fontWeight: "bold", fontSize: '11px', color: '#1a237e' }}>
              {formatCurrency(totalVppAmount)}
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #ddd", fontWeight: "bold", fontSize: '11px', color: '#1a237e' }}>
              {formatCurrency(amount)}
            </TableCell>
            <TableCell align="center" sx={{ border: "1px solid #ddd", fontWeight: "bold", fontSize: '11px', color: '#1a237e' }}>
              -
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Summary Section with Colorful Design */}
      <Box sx={{
        border: '2px solid #1a237e',
        p: 1.2,
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        mb: 1.5
      }}>
        <Grid container spacing={1.5}>
          {/* Left Side - Items and Bilty */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{
              p: 1,
              backgroundColor: '#fff',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <Table size="small" sx={{
                '& .MuiTableCell-root': {
                  padding: '1px 2px',
                  fontSize: '10px',
                  border: 'none'
                }
              }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Items Total:</TableCell>
                    <TableCell align="right">{formatCurrency(amount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Ins/Vpp Amount:</TableCell>
                    <TableCell align="right">{formatCurrency(insVppAmount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Bilty Amount:</TableCell>
                    <TableCell align="right">{formatCurrency(freight)}</TableCell>
                  </TableRow>
                  <TableRow sx={{
                    borderTop: '2px solid #ccc',
                    borderBottom: '2px solid #ccc',
                    backgroundColor: '#f5f5f5'
                  }}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', color: '#000' }}>Bill Total:</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '11px', color: '#000' }}>
                      {formatCurrency(billTotal)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Grid>

          {/* Right Side - GST and Grand Total */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{
              p: 1,
              backgroundColor: '#fff',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <Table size="small" sx={{
                '& .MuiTableCell-root': {
                  padding: '1px 2px',
                  fontSize: '10px',
                  border: 'none'
                }
              }}>
                <TableBody>
                  {sTax > 0 && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Service Tax ({sTax}%):</TableCell>
                      <TableCell align="right">{formatCurrency(sTaxAmount)}</TableCell>
                    </TableRow>
                  )}
                  {sgst > 0 && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>SGST ({sgst}%):</TableCell>
                      <TableCell align="right">{formatCurrency(sgstAmount)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Round Off:</TableCell>
                    <TableCell align="right">{formatCurrency(roundOff)}</TableCell>
                  </TableRow>
                  <TableRow sx={{
                    borderTop: '2px solid #d32f2f',
                    backgroundColor: '#ffebee'
                  }}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', color: '#d32f2f' }}>GRAND TOTAL:</TableCell>
                    <TableCell align="right" sx={{
                      fontWeight: 'bold',
                      fontSize: '12px',
                      color: '#d32f2f'
                    }}>
                      {formatCurrency(grandTotal)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Additional Comments */}
      {bookingData?.additionalCmt && (
        <Box sx={{
          mt: 1,
          mb: 1.5,
          border: '1px solid #ccc',
          p: 1,
          borderRadius: '4px',
          backgroundColor: '#fffde7'
        }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5d4037' }}>
            Additional Comments:
          </Typography>
          <Typography sx={{ fontSize: '10px', mt: 0.5 }}>
            {bookingData.additionalCmt}
          </Typography>
        </Box>
      )}

      {/* Signature Section with Modern Design */}
      <Box sx={{
        mt: 2,
        pt: 1.5,
        borderTop: '2px dashed #5d4037',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
      }}>
        {/* Left Signature - Customer */}
        <Box sx={{ width: '45%', textAlign: 'center' }}>
          <Typography sx={{
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#5d4037',
            borderTop: '2px solid #5d4037',
            paddingTop: '10px',
            marginTop: '20px',
            backgroundColor: '#f5f5f5',
            p: 0.5,
            borderRadius: '4px'
          }}>
            CUSTOMER SIGNATURE
          </Typography>
          <Typography sx={{
            fontSize: '9px',
            color: '#666',
            marginTop: '3px'
          }}>
            (With Company Stamp)
          </Typography>
        </Box>

        {/* Right Signature - Company */}
        <Box sx={{ width: '45%', textAlign: 'center' }}>
          <Box sx={{
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            p: 0.5
          }}>
            <img
              src={companySignature}
              alt="Authorized Signature"
              style={{
                maxHeight: '40px',
                maxWidth: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>

          <Typography sx={{
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#1a237e',
            borderTop: '2px solid #1a237e',
            paddingTop: '8px',
            backgroundColor: '#f5f5f5',
            p: 0.5,
            borderRadius: '4px'
          }}>
            FOR BHARAT PARCEL SERVICES PVT. LTD.
          </Typography>

          <Typography sx={{
            fontSize: '9px',
            color: '#666',
            marginTop: '3px'
          }}>
            Authorized Signatory
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  const generateBiltyPdfBlob = async () => {
    const original = originalRef.current;

    // 🔥 TEMP WRAPPER (ONLY FOR WHATSAPP)
    const wrapper = document.createElement("div");
    wrapper.style.width = "210mm";
    wrapper.style.height = "297mm"; // A4 height
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";      // ✅ vertical center
    wrapper.style.justifyContent = "center";  // ✅ horizontal center
    wrapper.style.background = "#ffffff";
    wrapper.style.padding = "10mm";

    // Clone original content
    const clone = original.cloneNode(true);
    clone.style.margin = "0";
    clone.style.width = "100%";

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const canvas = await html2canvas(wrapper, {
      scale: 1.6,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    document.body.removeChild(wrapper); // 🧹 cleanup

    const imgData = canvas.toDataURL("image/jpeg", 0.7);

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // ✅ Center image vertically on PDF page
    const yOffset = (pageHeight - imgHeight) / 2;

    pdf.addImage(imgData, "JPEG", 0, yOffset, imgWidth, imgHeight);

    return pdf.output("blob");
  };

  const handleSendWhatsAppBilty = async () => {
    try {
      const pdfBlob = await generateBiltyPdfBlob();

      await dispatch(
        sendWhatsappBilty({
          bookingId: bookingData.bookingId,
          biltyBlob: pdfBlob
        })
      ).unwrap();

      alert("✅ Original Bilty successfully sent on WhatsApp");
    } catch (error) {
      alert(
        error?.message ||
        "❌ Failed to send Bilty. File size too large or server error."
      );
    }
  };

  const handleDownloadPDF = async () => {
    await loadImageAsBase64(companySignature);

    const element = printRef.current;
    const scale = 1.8;

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      height: element.scrollHeight,
      width: element.scrollWidth
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate dimensions to fit on one page
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    const imgX = (pageWidth - imgWidth * ratio) / 2;
    const imgY = (pageHeight - imgHeight * ratio) / 2;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`Quotation_${bookingData?.bookingId}.pdf`);
  };

  // Direct Print Function - Single Page
  const handleDirectPrint = async () => {
    const signatureData = await loadImageAsBase64(companySignature);
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    const printHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    @media print {
                        * {
                            color: #000 !important;
                            font-weight: bold !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        
                        @page {
                            margin: 5mm !important;
                            size: A4 portrait !important;
                        }
                        
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                            font-family: Arial, sans-serif !important;
                            font-size: 12px !important;
                            zoom: 0.82;
                        }
                        
                        .slip-container {
                            width: 100% !important;
                            max-width: 100% !important;
                            margin: 0 auto !important;
                            padding: 2mm !important;
                            box-sizing: border-box !important;
                        }
                        
                        .slip-paper {
                            width: 100% !important;
                            box-sizing: border-box !important;
                            border: 2px solid #000 !important;
                            padding: 3mm !important;
                            padding-bottom: 8mm !important;
                            height: 148mm !important;
                            overflow: hidden !important;
                            background: #fff !important;
                        }
                        
                        .duplicate-slip {
                            background-color: #f9f9f9 !important;
                        }
                        
                        /* Company Header */
                       .company-header {
    display: grid !important;
    grid-template-columns: 15mm 1fr 15mm !important;
    align-items: center !important;
    margin-bottom: 2mm !important;
    padding-bottom: 1mm !important;
    border-bottom: 2px solid #000 !important;
}
                        
                        .logo-img {
                            width: 15mm !important;
                            height: 15mm !important;
                            object-fit: contain !important;
                        }
                        
                        .company-name {
    font-size: 15px !important;
    font-weight: bold !important;
    text-align: center !important;
    width: 100% !important;
    margin: 0 auto !important;
}
                        
                        .jurisdiction {
    font-size: 9px !important;
    text-align: center !important;
    width: 100% !important;
    margin: 0 auto !important;
    font-weight: bold !important;
}
                        
                        .gst-info {
                            text-align: right !important;
                            font-size: 8px !important;
                            font-weight: bold !important;
                            color: #000 !important;
                            background-color: #f5f5f5 !important;
                            padding: 1mm !important;
                            border-radius: 2mm !important;
                            border: 1px solid #ddd !important;
                        }
                        
                        /* Top Addresses */
                        .top-addresses {
                            display: flex !important;
                            justify-content: space-between !important;
                            border-bottom: 1px dashed #ccc !important;
                            padding-bottom: 1mm !important;
                            margin-bottom: 2mm !important;
                        }
                        
                        .top-address-box {
                            width: 48% !important;
                            padding: 1mm !important;
                            border-radius: 2mm !important;
                            border: 1px solid #ddd !important;
                        }
                        
                        .address-1 {
                            background-color: #e8f5e9 !important;
                        }
                        
                        .address-2 {
                            background-color: #e3f2fd !important;
                        }
                        
                        .address-city {
                            font-size: 10px !important;
                            font-weight: bold !important;
                            color: #000 !important;
                        }
                        
                        .address-text {
                            font-size: 10px !important;
                            font-weight: bold !important;
                            line-height: 1.3 !important;
                            color: #000 !important;
                        }
                        
                        .address-phone {
                            font-size: 10px !important;
                            font-weight: bold !important;
                            color: #000 !important;
                        }
                        
                        /* Main Grid Layout */
                        .main-grid {
                            display: grid !important;
                            grid-template-columns: 1.4fr 1fr !important;
                            gap: 2mm !important;
                            margin-bottom: 2mm !important;
                        }
                        
                        .left-column {
                            display: flex !important;
                            flex-direction: column !important;
                            gap: 1.5mm !important;
                        }
                        
                        .right-column {
                            display: flex !important;
                            flex-direction: column !important;
                            gap: 1.5mm !important;
                        }
                        
                        /* Booking Info */
                        .booking-info {
                            display: flex !important;
                            justify-content: space-between !important;
                            align-items: center !important;
                            padding: 1.5mm !important;
                            background-color: #f5f5f5 !important;
                            border-radius: 2mm !important;
                            border: 2px solid #1a237e !important;
                        }
                        
                        .booking-id {
                            font-size: 13px !important;
                            font-weight: bold !important;
                            color: #000 !important;
                        }
                        
                        .booking-date {
                            font-size: 11px !important;
                            font-weight: bold !important;
                            color: #000 !important;
                        }
                        
                        .delivery-date {
                            font-size: 11px !important;
                            font-weight: bold !important;
                            color: #000 !important;
                        }
                        
                        /* Route Section */
                        .route-section {
                            padding: 1.5mm !important;
                            background: linear-gradient(45deg, #1a237e 0%, #283593 100%) !important;
                            color: white !important;
                            text-align: center !important;
                            border-radius: 2mm !important;
                            font-weight: bold !important;
                        }
                        
                        .sender-receiver-grid {
                            display: grid !important;
                            grid-template-columns: 1fr 1fr !important;
                            gap: 1.5mm !important;
                        }
                        
                        .sender-box {
                            padding: 1mm !important;
                            background-color: #e3f2fd !important;
                            border-radius: 2mm !important;
                            border: 1px solid #bbdefb !important;
                        }
                        
                        .receiver-box {
                            padding: 1mm !important;
                            background-color: #e8f5e9 !important;
                            border-radius: 2mm !important;
                            border: 1px solid #c8e6c9 !important;
                        }
                        
                        .sender-title {
                            font-size: 10px !important;
                            font-weight: bold !important;
                            color: #1976d2 !important;
                            text-align: center !important;
                            margin-bottom: 0.5mm !important;
                        }
                        
                        .receiver-title {
                            font-size: 10px !important;
                            font-weight: bold !important;
                            color: #388e3c !important;
                            text-align: center !important;
                            margin-bottom: 0.5mm !important;
                        }
                        
                        .detail-line {
                            font-size: 9px !important;
                            margin-bottom: 0.3mm !important;
                        }
                        
                        .branch-grid {
                            display: grid !important;
                            grid-template-columns: 1fr 1fr !important;
                            gap: 1mm !important;
                        }
                        
                        .branch-box {
                            border: 1px solid #d7ccc8 !important;
                            padding: 1mm !important;
                            background-color: #fff !important;
                            border-radius: 2mm !important;
                            min-height: 15mm !important;
                        }
                        
                        .branch-city {
                            font-size: 10px !important;
                            font-weight: bold !important;
                            color: #000 !important;
                        }
                        
                        .branch-text {
                            font-size: 10px !important;
                            font-weight: bold !important;
                            line-height: 1.3 !important;
                            color: #000 !important;
                        }
                        
                        .branch-phone {
                            font-size: 10px !important;
                            font-weight: bold !important;
                            color: #000 !important;
                        }
                        
                        /* Items Table */
                        table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                            margin: 2mm 0 !important;
                            font-size: 9px !important;
                            table-layout: fixed !important;
                        }
                        
                        table, th, td {
                            color: #000 !important;
                            font-weight: bold !important;
                        }
                        
                        h1, h2, h3, h4, h5, h6,
                        .company-name,
                        .jurisdiction,
                        .booking-id,
                        .booking-date,
                        .delivery-date,
                        .sender-title,
                        .receiver-title,
                        .address-city,
                        .address-text,
                        .address-phone,
                        .branch-city,
                        .branch-text,
                        .branch-phone,
                        .customer-signature,
                        .company-signature,
                        .signature-note,
                        .copy-label {
                            color: #000 !important;
                            font-weight: bold !important;
                        }
                        
                        th, td {
                            border: 1px solid #ddd !important;
                            padding: 0.5mm 0.8mm !important;
                            text-align: center !important;
                        }
                        
                        th {
                            font-weight: bold !important;
                            background: background: #fff !important;
                            color: #000 !important;
                            border: 1px solid #fff !important;
                        }
                        
                        thead th {
                            color: #000 !important;
                            font-weight: bold !important;
                        }
                        
                        .total-row {
                            background-color: #e8eaf6 !important;
                            font-weight: bold !important;
                            color: #1a237e !important;
                            border-top: 2px solid #1a237e !important;
                        }
                        
                        .chip {
                            font-size: 7px !important;
                            font-weight: bold !important;
                            padding: 0.2mm 1mm !important;
                            border-radius: 10px !important;
                            display: inline-block !important;
                            color: #000 !important
                        }
                        
                        .chip-success {
                            background-color: #d4edda !important;
                            color: #155724 !important;
                        }
                        
                        .chip-warning {
                            background-color: #fff3cd !important;
                            color: #856404 !important;
                        }
                        
                        .chip-default {
                            background-color: #e2e3e5 !important;
                            color: #383d41 !important;
                        }
                        
                        /* Summary Section */
                        .summary-section {
                            padding: 1.5mm !important;
                            background-color: #f8f9fa !important;
                            border-radius: 2mm !important;
                            margin: 1mm 0 !important;
                        }
                        
                        .summary-grid {
                            display: grid !important;
                            grid-template-columns: 1fr 1fr !important;
                            gap: 1.5mm !important;
                        }
                        
                        .summary-box {
                            background-color: #fff !important;
                            padding: 1mm !important;
                            border-radius: 2mm !important;
                            border: 1px solid #e0e0e0 !important;
                        }
                        
                        .summary-table {
                            width: 80% !important;
                            border: none !important;
                        }
                        
                        .summary-table td {
                            border: none !important;
                            padding: 0.3mm 0.5mm !important;
                            font-size: 9px !important;
                        }
                        
                        .bill-total-row {
                            border-top: 2px solid #ccc !important;
                            border-bottom: 2px solid #ccc !important;
                            background-color: #f5f5f5 !important;
                            font-weight: bold !important;
                            color: #000 !important;
                        }
                        
                        .grand-total-row {
                            border-top: 2px solid #d32f2f !important;
                            background-color: #ffebee !important;
                            font-weight: bold !important;
                            color: #d32f2f !important;
                        }
                        
                        /* Additional Comments */
                        .comments-box {
                            margin-top: 1mm !important;
                            margin-bottom: 1.5mm !important;
                            border: 1px solid #ccc !important;
                            padding: 1mm !important;
                            border-radius: 2mm !important;
                            background-color: #fffde7 !important;
                        }
                        
                        /* Signature Section */
                        .signature-section {
                            margin-top: 1.5mm !important;
                            padding-top: 1mm !important;
                            border-top: 1px dashed #5d4037 !important;
                            display: flex !important;
                            justify-content: space-between !important;
                        }
                        
                        .signature-box {
                            width: 45% !important;
                            text-align: center !important;
                            padding-top: 4mm !important;
                            page-break-inside: avoid !important;
                        }
                        
                        .customer-signature {
                            border-top: 2px solid #5d4037 !important;
                            padding-top: 0.8mm !important;
                            margin-top: 11mm !important;
                            min-height: 15mm !important;
                            font-size: 9px !important;
                            font-weight: bold !important;
                            color: #5d4037 !important;
                            background-color: #f5f5f5 !important;
                            padding: 0.8mm !important;
                            border-radius: 2mm !important;
                        }
                        
                        .company-signature {
                            border-top: 2px solid #1a237e !important;
                            padding-top: 0.8mm !important;
                            font-size: 9px !important;
                            font-weight: bold !important;
                            color: #1a237e !important;
                            background-color: #f5f5f5 !important;
                            padding: 0.8mm !important;
                            border-radius: 2mm !important;
                        }
                        
                        .signature-note {
                            font-size: 8px !important;
                            color: #666 !important;
                            margin-top: 0.5mm !important;
                        }
                        
                        .signature-image {
                            max-height: 10mm !important;
                            margin-bottom: 0.5mm !important;
                            background-color: #f5f5f5 !important;
                            padding: 1mm !important;
                            border-radius: 2mm !important;
                        }
                        
                        .copy-label {
                            text-align: center !important;
                            font-size: 11px !important;
                            font-weight: bold !important;
                            color: #666 !important;
                            margin: 1mm 0 !important;
                            padding: 0.5mm !important;
                            background: #f5f5f5 !important;
                            border-radius: 2mm !important;
                        }
                    }
                    
                    @media screen {
                        body {
                            background: #f0f0f0 !important;
                            padding: 5mm !important;
                        }
                        
                        .slip-container {
                            background: white !important;
                            box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="slip-container">
                    <!-- Original Copy -->
                    <div class="slip-paper">
                        <div class="company-header">
                            <div>
                                <img 
                                    src="${CompanyLogo}" 
                                    alt="Logo" 
                                    class="logo-img"
                                    onerror="this.style.display='none'"
                                />
                            </div>
                            <div class="company-center">
                                <div class="company-name">BHARAT PARCEL SERVICES PVT. LTD.</div>
                                <div class="jurisdiction">SUBJECT TO ${bookingData?.startStation?.stationName || bookingData?.startStationName || 'DELHI'} JURISDICTION</div>
                            </div>
                        </div>
                        
                        <div class="top-addresses">
                            ${topAddresses.map((addr, index) => `
                                <div class="top-address-box address-${index + 1}">
                                    <div class="address-city">${addr.city}:</div>
                                    <div class="address-text">${addr.address}</div>
                                    <div class="address-phone">📞 ${addr.phone}</div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="main-grid">
                            <div class="left-column">
                                <div class="booking-info">
                                    <div>
                                        <div style="font-size:9px;color:#666;font-weight:bold;">BOOKING ID</div>
                                        <div class="booking-id">${bookingData?.bookingId}</div>
                                    </div>
                                    <div>
                                        <div style="font-size:9px;color:#666;font-weight:bold;">BOOKING DATE</div>
                                        <div class="booking-date">${formatDate(bookingDate)}</div>
                                    </div>
                                </div>
                                
                                <div class="route-section">
                                    ROUTE : ${bookingData?.startStation?.stationName || bookingData?.startStationName} → ${bookingData?.endStation?.stationName || bookingData?.endStation}
                                </div>
                                
                                <div class="sender-receiver-grid">
                                    <div class="sender-box">
                                        <div class="sender-title">SENDER</div>
                                        <div class="detail-line"><strong>Name:</strong> ${bookingData?.fromCustomerName || bookingData?.senderName}</div>
                                        <div class="detail-line"><strong>Contact:</strong> ${senderContact}</div>
                                        <div class="detail-line"><strong>City:</strong> ${bookingData?.fromCity || bookingData?.startStationName}</div>
                                    </div>
                                    <div class="receiver-box">
                                        <div class="receiver-title">RECEIVER</div>
                                        <div class="detail-line"><strong>Name:</strong> ${bookingData?.toCustomerName || bookingData?.receiverName}</div>
                                        <div class="detail-line"><strong>Contact:</strong> ${receiverContact}</div>
                                        <div class="detail-line"><strong>City:</strong> ${bookingData?.toCity || bookingData?.endStation}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="right-column">
                                <div class="branch-grid">
                                    ${bottomAddresses.map((addr) => `
                                        <div class="branch-box">
                                            <div class="branch-city">${addr.city}</div>
                                            <div class="branch-text">${addr.address}</div>
                                            <div class="branch-phone">📞 ${addr.phone}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Sr.</th>
                                    <th>Receipt No.</th>
                                    <th>Ref No.</th>
                                    <th>Description</th>
                                    <th>Qty</th>
                                    <th>Weight</th>
                                    <th>Insurance</th>
                                    <th>VPP Amount</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bookingData?.productDetails?.map((item, idx) => {
      const badge = getTopayBadge(item.topay);
      const chipClass = badge.color === 'success' ? 'chip-success' :
        badge.color === 'warning' ? 'chip-warning' : 'chip-default';
      return `
                                        <tr style="background-color: ${idx % 2 === 0 ? '#f5f5f5' : 'white'} !important;">
                                            <td>${idx + 1}</td>
                                            <td>${item.receiptNo || '-'}</td>
                                            <td>${item.refNo || '-'}</td>
                                            <td>${item.name}</td>
                                            <td>${item.quantity || 1}</td>
                                            <td>${item.weight} kg</td>
                                            <td>${formatCurrency(item.insurance || 0)}</td>
                                            <td>${formatCurrency(item.vppAmount || 0)}</td>
                                            <td>${formatCurrency(item.price)}</td>
                                            <td>
                                                <span class="chip ${chipClass}">${badge.label}</span>
                                            </td>
                                        </tr>
                                    `;
    }).join('')}
                                
                                <tr class="total-row">
                                    <td colspan="3" style="font-weight:bold;text-align:center;">TOTAL</td>
                                    <td style="font-weight:bold;text-align:center;">-</td>
                                    <td style="font-weight:bold;text-align:center;">${totalQuantity}</td>
                                    <td style="font-weight:bold;text-align:center;">${totalWeight} kg</td>
                                    <td style="font-weight:bold;text-align:center;">${formatCurrency(totalInsurance)}</td>
                                    <td style="font-weight:bold;text-align:center;">${formatCurrency(totalVppAmount)}</td>
                                    <td style="font-weight:bold;text-align:center;">${formatCurrency(amount)}</td>
                                    <td style="font-weight:bold;text-align:center;">-</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div class="summary-section">
                            <div class="summary-grid">
                                <div class="summary-box">
                                    <table class="summary-table">
                                        <tr>
                                            <td>Items Total:</td>
                                            <td align="right">${formatCurrency(amount)}</td>
                                        </tr>
                                        <tr>
                                            <td>Ins/Vpp Amount:</td>
                                            <td align="right">${formatCurrency(insVppAmount)}</td>
                                        </tr>
                                        <tr>
                                            <td>Bilty Amount:</td>
                                            <td align="right">${formatCurrency(freight)}</td>
                                        </tr>
                                        <tr class="bill-total-row">
                                            <td><strong>Bill Total:</strong></td>
                                            <td align="right"><strong>${formatCurrency(billTotal)}</strong></td>
                                        </tr>
                                    </table>
                                </div>
                                <div class="summary-box">
                                    <table class="summary-table">
                                        ${sTax > 0 ? `
                                        <tr>
                                            <td>Service Tax (${sTax}%):</td>
                                            <td align="right">${formatCurrency(sTaxAmount)}</td>
                                        </tr>
                                        ` : ''}
                                        ${sgst > 0 ? `
                                        <tr>
                                            <td>SGST (${sgst}%):</td>
                                            <td align="right">${formatCurrency(sgstAmount)}</td>
                                        </tr>
                                        ` : ''}
                                        <tr>
                                            <td>Round Off:</td>
                                            <td align="right">${formatCurrency(roundOff)}</td>
                                        </tr>
                                        <tr class="grand-total-row">
                                            <td><strong>GRAND TOTAL:</strong></td>
                                            <td align="right"><strong>${formatCurrency(grandTotal)}</strong></td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        ${bookingData?.additionalCmt ? `
                            <div class="comments-box">
                                <div style="font-size:10px;font-weight:bold;color:#5d4037;">Additional Comments:</div>
                                <div style="font-size:10px;margin-top:0.5mm;">${bookingData.additionalCmt}</div>
                            </div>
                        ` : ''}
                        
                        <div class="signature-section">
                            <div class="signature-box">
                                <div class="customer-signature">
                                    CUSTOMER SIGNATURE
                                </div>
                                <div class="signature-note">
                                    (With Company Stamp)
                                </div>
                            </div>
                            
                            <div class="signature-box">
                                ${signatureData ? `
                                    <div class="signature-image">
                                        <img src="${signatureData}" style="max-height:10mm;" />
                                    </div>
                                ` : ''}
                                <div class="company-signature">
                                    FOR BHARAT PARCEL SERVICES PVT. LTD.
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Duplicate Copy -->
                    <div class="copy-label">DUPLICATE COPY</div>
                    <div class="slip-paper duplicate-slip">
                        <div class="company-header">
                            <div>
                                <img 
                                    src="${CompanyLogo}" 
                                    alt="Logo" 
                                    class="logo-img"
                                    onerror="this.style.display='none'"
                                />
                            </div>
                          <div class="company-center">
                                <div class="company-name">BHARAT PARCEL SERVICES PVT. LTD.</div>
                                <div class="jurisdiction">SUBJECT TO ${bookingData?.startStation?.stationName || bookingData?.startStationName || 'DELHI'} JURISDICTION</div>
                            </div>
                        </div>
                        
                        <div class="top-addresses">
                            ${topAddresses.map((addr, index) => `
                                <div class="top-address-box address-${index + 1}">
                                    <div class="address-city">${addr.city}:</div>
                                    <div class="address-text">${addr.address}</div>
                                    <div class="address-phone">📞 ${addr.phone}</div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="main-grid">
                            <div class="left-column">
                                <div class="booking-info">
                                    <div>
                                        <div style="font-size:9px;color:#666;font-weight:bold;">BOOKING ID</div>
                                        <div class="booking-id">${bookingData?.bookingId}</div>
                                    </div>
                                    <div>
                                        <div style="font-size:9px;color:#666;font-weight:bold;">BOOKING DATE</div>
                                        <div class="booking-date">${formatDate(bookingDate)}</div>
                                    </div>
                                </div>
                                
                                <div class="route-section">
                                    ROUTE : ${bookingData?.startStation?.stationName || bookingData?.startStationName} → ${bookingData?.endStation?.stationName || bookingData?.endStation}
                                </div>
                                
                                <div class="sender-receiver-grid">
                                    <div class="sender-box">
                                        <div class="sender-title">SENDER</div>
                                        <div class="detail-line"><strong>Name:</strong> ${bookingData?.fromCustomerName || bookingData?.senderName}</div>
                                        <div class="detail-line"><strong>Contact:</strong> ${senderContact}</div>
                                        <div class="detail-line"><strong>City:</strong> ${bookingData?.fromCity || bookingData?.startStationName}</div>
                                    </div>
                                    <div class="receiver-box">
                                        <div class="receiver-title">RECEIVER</div>
                                        <div class="detail-line"><strong>Name:</strong> ${bookingData?.toCustomerName || bookingData?.receiverName}</div>
                                        <div class="detail-line"><strong>Contact:</strong> ${receiverContact}</div>
                                        <div class="detail-line"><strong>City:</strong> ${bookingData?.toCity || bookingData?.endStation}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="right-column">
                                <div class="branch-grid">
                                    ${bottomAddresses.map((addr) => `
                                        <div class="branch-box">
                                            <div class="branch-city">${addr.city}</div>
                                            <div class="branch-text">${addr.address}</div>
                                            <div class="branch-phone">📞 ${addr.phone}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Sr.</th>
                                    <th>Receipt No.</th>
                                    <th>Ref No.</th>
                                    <th>Description</th>
                                    <th>Qty</th>
                                    <th>Weight</th>
                                    <th>Insurance</th>
                                    <th>VPP Amount</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bookingData?.productDetails?.map((item, idx) => {
      const badge = getTopayBadge(item.topay);
      const chipClass = badge.color === 'success' ? 'chip-success' :
        badge.color === 'warning' ? 'chip-warning' : 'chip-default';
      return `
                                        <tr style="background-color: ${idx % 2 === 0 ? '#f5f5f5' : 'white'} !important;">
                                            <td>${idx + 1}</td>
                                            <td>${item.receiptNo || '-'}</td>
                                            <td>${item.refNo || '-'}</td>
                                            <td>${item.name}</td>
                                            <td>${item.quantity || 1}</td>
                                            <td>${item.weight} kg</td>
                                            <td>${formatCurrency(item.insurance || 0)}</td>
                                            <td>${formatCurrency(item.vppAmount || 0)}</td>
                                            <td>${formatCurrency(item.price)}</td>
                                            <td>
                                                <span class="chip ${chipClass}">${badge.label}</span>
                                            </td>
                                        </tr>
                                    `;
    }).join('')}
                                
                                <tr class="total-row">
                                    <td colspan="3" style="font-weight:bold;text-align:center;">TOTAL</td>
                                    <td style="font-weight:bold;text-align:center;">-</td>
                                    <td style="font-weight:bold;text-align:center;">${totalQuantity}</td>
                                    <td style="font-weight:bold;text-align:center;">${totalWeight} kg</td>
                                    <td style="font-weight:bold;text-align:center;">${formatCurrency(totalInsurance)}</td>
                                    <td style="font-weight:bold;text-align:center;">${formatCurrency(totalVppAmount)}</td>
                                    <td style="font-weight:bold;text-align:center;">${formatCurrency(amount)}</td>
                                    <td style="font-weight:bold;text-align:center;">-</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div class="summary-section">
                            <div class="summary-grid">
                                <div class="summary-box">
                                    <table class="summary-table">
                                        <tr>
                                            <td>Items Total:</td>
                                            <td align="right">${formatCurrency(amount)}</td>
                                        </tr>
                                        <tr>
                                            <td>Ins/Vpp Amount:</td>
                                            <td align="right">${formatCurrency(insVppAmount)}</td>
                                        </tr> 
                                        <tr>
                                            <td>Bilty Amount:</td>
                                            <td align="right">${formatCurrency(freight)}</td>
                                        </tr>
                                        <tr class="bill-total-row">
                                            <td><strong>Bill Total:</strong></td>
                                            <td align="right"><strong>${formatCurrency(billTotal)}</strong></td>
                                        </tr>
                                    </table>
                                </div>
                                <div class="summary-box">
                                    <table class="summary-table">
                                        ${sTax > 0 ? `
                                        <tr>
                                            <td>Service Tax (${sTax}%):</td>
                                            <td align="right">${formatCurrency(sTaxAmount)}</td>
                                        </tr>
                                        ` : ''}
                                        ${sgst > 0 ? `
                                        <tr>
                                            <td>SGST (${sgst}%):</td>
                                            <td align="right">${formatCurrency(sgstAmount)}</td>
                                        </tr>
                                        ` : ''}
                                        <tr>
                                            <td>Round Off:</td>
                                            <td align="right">${formatCurrency(roundOff)}</td>
                                        </tr>
                                        <tr class="grand-total-row">
                                            <td><strong>GRAND TOTAL:</strong></td>
                                            <td align="right"><strong>${formatCurrency(grandTotal)}</strong></td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        ${bookingData?.additionalCmt ? `
                            <div class="comments-box">
                                <div style="font-size:10px;font-weight:bold;color:#5d4037;">Additional Comments:</div>
                                <div style="font-size:10px;margin-top:0.5mm;">${bookingData.additionalCmt}</div>
                            </div>
                        ` : ''}
                        
                        <div class="signature-section">
                            <div class="signature-box">
                                <div class="customer-signature">
                                    CUSTOMER SIGNATURE
                                </div>
                                <div class="signature-note">
                                    (With Company Stamp)
                                </div>
                            </div>
                            
                            <div class="signature-box">
                                ${signatureData ? `
                                    <div class="signature-image">
                                        <img src="${signatureData}" style="max-height:10mm;" />
                                    </div>
                                ` : ''}
                                <div class="company-signature">
                                    FOR BHARAT PARCEL SERVICES PVT. LTD.
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
        <Box>
          {/* ✅ ORIGINAL ONLY (WhatsApp ke liye) */}
          <Box ref={originalRef}>
            <Invoice copyType="Original" />
          </Box>

          {/* ❌ DUPLICATE (sirf UI / print ke liye) */}
          <Divider
            sx={{
              borderColor: 'black',
              borderStyle: 'dashed',
              my: 2,
              fontSize: '12px',
              textAlign: 'center',
              fontWeight: 'bold',
              py: 1,
              backgroundColor: '#f5f5f5'
            }}
          >
            --- DUPLICATE COPY ---
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
                mr: 2,
                backgroundColor: '#1a237e',
                '&:hover': { backgroundColor: '#283593' }
              }}
            >
              Download PDF
            </Button>
            <Button
              startIcon={<PrintIcon />}
              onClick={handleDirectPrint}
              sx={{
                px: 3,
                ml: 2,
                backgroundColor: '#388e3c',
                '&:hover': { backgroundColor: '#2e7d32' }
              }}
            >
              Print
            </Button>
            <Button
              startIcon={<WhatsAppIcon />}
              onClick={handleSendWhatsAppBilty}
              disabled={loading}
              sx={{
                px: 3,
                ml: 2,
                backgroundColor: '#25D366',
                '&:hover': { backgroundColor: '#1ebe5d' }
              }}
            >
              {loading ? "Sending Bilty..." : "Generate WhatsApp Bilty"}
            </Button>

          </ButtonGroup>
        </Box>
      </Box>
    </Modal>
  );
};

export default QSlipModal;