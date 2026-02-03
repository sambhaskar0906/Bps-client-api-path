import React, { useEffect, useState, useMemo } from 'react';
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    Paper, Container, CircularProgress, Grid, TextField, MenuItem,
    InputAdornment, Pagination, Chip, Alert, Card, CardContent,
    TableContainer, IconButton, Tooltip, Stack
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStations } from '../features/stations/stationSlice';
import { API_BASE_URL } from "../utils/api";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PaidIcon from '@mui/icons-material/Paid';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const ViewQuotationBtDate = () => {
    const [fromCity, setFromCity] = useState('');
    const [toCity, setToCity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();
    const { fromDate, toDate } = useParams();
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const { list: stations } = useSelector((state) => state.stations);

    // Pagination state
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc"
    });

    useEffect(() => {
        dispatch(fetchStations());
    }, [dispatch]);

    const oneLineCell = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 180
    };

    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                return {
                    key,
                    direction: prev.direction === "asc" ? "desc" : "asc"
                };
            }
            return { key, direction: "asc" };
        });
    };


    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.post(
                    `${API_BASE_URL}/quotation/booking-summary-date`,
                    { fromDate, toDate },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
                );

                console.log("API Response:", res.data);
                const bookingsData = res.data.bookings || [];
                setBookings(bookingsData);
                setFilteredBookings(bookingsData);

                const summaryData = {
                    totalBookings: bookingsData.length,

                    totalItems: bookingsData.reduce(
                        (acc, b) => acc + (b.itemsCount || 0),
                        0
                    ),

                    totalInsVpp: bookingsData.reduce(
                        (acc, b) => acc + Number(b.insVppAmount || 0),
                        0
                    ),

                    totalPaid: bookingsData.reduce((acc, b) => {
                        const product = b.productDetails?.[0];
                        if (product?.topay === "paid") {
                            return acc + Number(b.grandTotal || 0);
                        }
                        return acc;
                    }, 0),

                    totalToPay: bookingsData.reduce((acc, b) => {
                        const product = b.productDetails?.[0];
                        if (product?.topay === "toPay") {
                            return acc + Number(b.grandTotal || 0);
                        }
                        return acc;
                    }, 0),

                    totalValue: bookingsData.reduce(
                        (acc, b) => acc + Number(b.grandTotal || 0),
                        0
                    ),

                    balanceDue: bookingsData.reduce((acc, b) => {
                        const product = b.productDetails?.[0];
                        if (product?.topay === "toPay") {
                            return acc + Number(b.grandTotal || 0);
                        }
                        return acc;
                    }, 0),

                    paymentBreakdown: {
                        fullyPaid: bookingsData.filter(
                            b => b.productDetails?.[0]?.topay === "paid"
                        ).length,

                        unpaid: bookingsData.filter(
                            b => b.productDetails?.[0]?.topay === "toPay"
                        ).length,

                        partiallyPaid: 0
                    }
                };

                setSummary(summaryData);

            } catch (err) {
                console.error('Error fetching bookings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [fromDate, toDate]);

    // Filter bookings based on search and city selection
    useEffect(() => {
        let filtered = bookings;

        // Filter by from city
        if (fromCity) {
            filtered = filtered.filter(booking =>
                booking.fromCity?.toLowerCase().includes(fromCity.toLowerCase())
            );
        }

        // Filter by to city
        if (toCity) {
            filtered = filtered.filter(booking =>
                booking.toCity?.toLowerCase().includes(toCity.toLowerCase())
            );
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(booking => {
                const biltyNo = booking.productDetails?.[0]?.receiptNo || "";

                return (
                    booking.bookingId?.toLowerCase().includes(term) ||
                    booking.fromCustomerName?.toLowerCase().includes(term) ||
                    booking.toCustomerName?.toLowerCase().includes(term) ||
                    booking.startStationName?.toLowerCase().includes(term) ||
                    booking.endStation?.toLowerCase().includes(term) ||
                    biltyNo.toLowerCase().includes(term)
                );
            });
        }

        setFilteredBookings(filtered);
        setPage(1); // Reset to first page when filters change
    }, [fromCity, toCity, searchTerm, bookings]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);

    const sortedBookings = useMemo(() => {
        if (!sortConfig.key) return filteredBookings;

        return [...filteredBookings].sort((a, b) => {
            let aVal = "";
            let bVal = "";

            if (sortConfig.key === "bilty") {
                aVal = a.productDetails?.[0]?.receiptNo || "";
                bVal = b.productDetails?.[0]?.receiptNo || "";
            }

            if (sortConfig.key === "sender") {
                aVal = a.fromCustomerName || "";
                bVal = b.fromCustomerName || "";
            }

            if (sortConfig.key === "receiver") {
                aVal = a.toCustomerName || "";
                bVal = b.toCustomerName || "";
            }

            if (sortConfig.direction === "asc") {
                return aVal.localeCompare(bVal);
            }
            return bVal.localeCompare(aVal);
        });
    }, [filteredBookings, sortConfig]);

    const paginatedBookings = useMemo(() => {
        const startIndex = (page - 1) * rowsPerPage;
        return sortedBookings.slice(startIndex, startIndex + rowsPerPage);
    }, [sortedBookings, page, rowsPerPage]);

    const SortArrow = ({ column }) => {
        if (sortConfig.key !== column) return "↕";
        return sortConfig.direction === "asc" ? "↑" : "↓";
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const getPaidToPayTotal = (booking) => {
        const paid = Number(booking.paidAmount || 0);
        const toPay = Number(booking.deliveryPendingAmount || 0);
        const total = Number(booking.grandTotal || 0);

        return { paid, toPay, total };
    };

    const downloadPDF = () => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        // ===== PAGE SIZE =====
        const pageWidth = doc.internal.pageSize.getWidth();

        // ===== HEADER (NO EXTRA SPACE) =====
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Quotation Report", pageWidth / 2, 12, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`From ${fromDate} to ${toDate}`, pageWidth / 2, 18, { align: "center" });

        // ===== TABLE HEADERS =====
        const head = [[
            "S.No",
            "Booking ID",
            "Booking Date",
            "Bilty No",
            "Ref No",
            "Sender",
            "Receiver",
            "Route",
            "Wt",
            "Freight",
            "INS/VPP",
            "Paid",
            "To Pay",
            "Total"
        ]];

        // ===== TABLE BODY =====
        const body = filteredBookings.map((b, index) => {
            const product = b.productDetails?.[0] || {};
            const total = b.grandTotal || 0;

            const paid =
                product.topay === "paid" ? total : "";

            const toPay =
                product.topay === "toPay" ? total : "";

            return [
                index + 1,
                b.bookingId || "-",
                b.quotationDate
                    ? new Date(b.quotationDate).toLocaleDateString("en-GB")
                    : "-",
                product.receiptNo || "-",
                product.refNo || "-",
                b.fromCustomerName || "-",
                b.toCustomerName || "-",
                `${b.startStationName} - ${b.endStation}`,
                product.weight || 0,
                b.freight || 0,
                b.insVppAmount || 0,
                paid,
                toPay,
                total
            ];

        });


        // ===== AUTOTABLE (HEIGHT & SPACING FIXED) =====
        doc.autoTable({
            head,
            body,
            startY: 22,               // 👈 header ke bilkul niche
            theme: "grid",

            styles: {
                fontSize: 7.5,        // 👈 smaller font
                cellPadding: 1.5,     // 👈 THIS FIXES HEIGHT
                valign: "middle",
                overflow: "linebreak"
            },

            headStyles: {
                fillColor: [240, 240, 240],
                textColor: 0,
                fontStyle: "bold",
                fontSize: 8,
                halign: "center"
            },

            bodyStyles: {
                halign: "left"
            },

            columnStyles: {
                0: { cellWidth: 8, halign: "center" },   // S.No
                1: { cellWidth: 32 },                    // Booking ID
                2: { cellWidth: 18 },                     // Booking Date
                3: { cellWidth: 32 },                    // Bilty
                4: { cellWidth: 12 },                    // Ref
                5: { cellWidth: 32 },                    // Sender
                6: { cellWidth: 32 },                    // Receiver
                7: { cellWidth: 28 },                    // Route
                8: { cellWidth: 12, halign: "center" },  // Weight
                9: { cellWidth: 14, halign: "right" },  // Freight
                10: { cellWidth: 16, halign: "right" },  // INS/VPP
                11: { cellWidth: 14, halign: "right" },   // Paid
                12: { cellWidth: 14, halign: "right" },   // To pay
                13: { cellWidth: 14, halign: "right" },   // Total
            }
        });

        // ===== SUMMARY SECTION =====
        const summaryStartY = doc.lastAutoTable.finalY + 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Summary", 14, summaryStartY);

        doc.autoTable({
            startY: summaryStartY + 4,
            theme: "grid",
            body: [
                ["Total Bookings", summary.totalBookings],
                ["Total Items", summary.totalItems],
                ["Total Paid Amount", summary.totalPaid],
                ["Total To Pay Amount", summary.totalToPay],
                ["Total INS / VPP", summary.totalInsVpp],
                ["Grand Total Amount", summary.totalValue],
                ["Fully Paid Count", summary.paymentBreakdown.fullyPaid],
                ["Partially Paid Count", summary.paymentBreakdown.partiallyPaid],
                ["Unpaid Count", summary.paymentBreakdown.unpaid]
            ],
            styles: {
                fontSize: 9,
                cellPadding: 2
            },
            columnStyles: {
                0: { fontStyle: "bold" },
                1: {
                    halign: "right",
                    cellHook: (cell) => {
                        if (typeof cell.raw === "number") {
                            cell.text = [`₹ ${cell.raw}`];
                        }
                    }
                }
            }
        });


        // ===== FOOTER =====
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth / 2,
                200,
                { align: "center" }
            );
        }

        doc.save(`Quotation_Report_${fromDate}_to_${toDate}.pdf`);
    };


    const downloadExcel = () => {
        const data = filteredBookings.map(b => {
            const product = b.productDetails?.[0] || {};
            const total = b.grandTotal || 0;

            const paid =
                product.topay === "paid" ? total : "";

            const toPay =
                product.topay === "toPay" ? total : "";

            return {
                "Booking ID": b.bookingId,
                "Booking Date": b.quotationDate
                    ? new Date(b.quotationDate).toLocaleDateString("en-GB")
                    : "",
                "Bilty No": product.receiptNo || "",
                "Sender": b.fromCustomerName,
                "Receiver": b.toCustomerName,
                "Route": `${b.startStationName} - ${b.endStation}`,
                "Weight": product.weight || 0,
                "Amount": b.amount || b.productTotal || 0,
                "Freight": b.freight || 0,
                "INS / VPP": b.insVppAmount || 0,
                "Paid": paid,
                "To Pay": toPay,
                "Total": total
            };

        });

        data.push({});
        data.push({ "Booking ID": "SUMMARY" });

        data.push({ "Booking ID": "Total Bookings", "Total": summary.totalBookings });
        data.push({ "Booking ID": "Total Items", "Total": summary.totalItems });
        data.push({ "Booking ID": "Total Paid Amount", "Total": Number(summary.totalPaid) });
        data.push({ "Booking ID": "Total To Pay Amount", "Total": Number(summary.totalToPay) });
        data.push({ "Booking ID": "Total INS / VPP", "Total": Number(summary.totalInsVpp) });
        data.push({ "Booking ID": "Grand Total Amount", "Total": Number(summary.totalValue) });
        data.push({ "Booking ID": "Fully Paid Count", "Total": summary.paymentBreakdown.fullyPaid });
        data.push({ "Booking ID": "Partially Paid Count", "Total": summary.paymentBreakdown.partiallyPaid });
        data.push({ "Booking ID": "Unpaid Count", "Total": summary.paymentBreakdown.unpaid });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Quotation Report");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });

        const fileData = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        saveAs(fileData, `Quotation_Report_${fromDate}_to_${toDate}.xlsx`);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header with Date Range */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h4" fontWeight={600} gutterBottom>
                    📊 Quotation Report
                </Typography>
                <Typography variant="h6">
                    📅 From: {fromDate} to {toDate}
                </Typography>
            </Paper>

            {/* Summary Cards */}
            {summary && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Total Bookings
                                </Typography>
                                <Typography variant="h4">
                                    {summary.totalBookings}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Total Value
                                </Typography>
                                <Typography variant="h4">
                                    ₹{summary.totalValue.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Amount Paid
                                </Typography>
                                <Typography variant="h4">
                                    ₹{summary.totalPaid.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Balance Due
                                </Typography>
                                <Typography variant="h4">
                                    ₹{summary.balanceDue.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6">
                                    INS / VPP Total
                                </Typography>
                                <Typography variant="h4">
                                    ₹{summary.totalInsVpp.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Filters Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>
                            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Filters & Search
                        </Typography>
                    </Grid>

                    {/* Search Bar */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            placeholder="Search by Booking ID, Name, City..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* From City Dropdown with Search */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            select
                            label="From City"
                            fullWidth
                            value={fromCity}
                            onChange={(e) => setFromCity(e.target.value)}
                            SelectProps={{
                                MenuProps: {
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">
                                <em>All Cities</em>
                            </MenuItem>
                            {stations.map((station) => (
                                <MenuItem key={station.stationId || station.sNo} value={station.stationName}>
                                    {station.stationName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* To City Dropdown with Search */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            select
                            label="To City"
                            fullWidth
                            value={toCity}
                            onChange={(e) => setToCity(e.target.value)}
                            SelectProps={{
                                MenuProps: {
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">
                                <em>All Cities</em>
                            </MenuItem>
                            {stations.map((station) => (
                                <MenuItem key={station.stationId || station.sNo} value={station.stationName}>
                                    {station.stationName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Active Filters Info */}
                    {(fromCity || toCity || searchTerm) && (
                        <Grid size={{ xs: 12 }}>
                            <Alert severity="info" sx={{ mt: 1 }}>
                                Active Filters:
                                {fromCity && ` From: ${fromCity}`}
                                {toCity && ` To: ${toCity}`}
                                {searchTerm && ` Search: "${searchTerm}"`}
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setFromCity('');
                                        setToCity('');
                                        setSearchTerm('');
                                    }}
                                    sx={{ ml: 2 }}
                                >
                                    Clear All
                                </IconButton>
                            </Alert>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {/* Bookings Table */}
            <Paper elevation={3} sx={{ p: 3 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                ) : filteredBookings.length === 0 ? (
                    <Alert severity="info">
                        No bookings found for the selected filters.
                    </Alert>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                Bookings ({filteredBookings.length} found)
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton color="error" onClick={downloadPDF}>
                                    <PictureAsPdfIcon />
                                </IconButton>
                                <IconButton color="success" onClick={downloadExcel}>
                                    <TableChartIcon />
                                </IconButton>
                            </Box>
                        </Box>


                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                                        <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>S.No</TableCell>
                                        <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Booking ID</TableCell>
                                        <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>
                                            Booking Date
                                        </TableCell>
                                        <TableCell
                                            onClick={() => handleSort("bilty")}
                                            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Bilty No <SortArrow column="bilty" />
                                        </TableCell>
                                        <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Ref No</TableCell>
                                        <TableCell
                                            onClick={() => handleSort("sender")}
                                            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Sender <SortArrow column="sender" />
                                        </TableCell>
                                        <TableCell
                                            onClick={() => handleSort("receiver")}
                                            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Receiver <SortArrow column="receiver" />
                                        </TableCell>
                                        <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Route</TableCell>
                                        <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Weight</TableCell>
                                        <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Amount Details</TableCell>
                                        <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Paid</TableCell>
                                        <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>To Pay</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedBookings.map((booking, index) => {
                                        const product = booking.productDetails?.[0] || {};
                                        const globalIndex = (page - 1) * rowsPerPage + index + 1;
                                        const productAmount = booking.amount || booking.productTotal || 0;
                                        const freightAmount = booking.freight || 0;
                                        const insVppAmount = booking.insVppAmount || 0;
                                        const totalAmount = booking.grandTotal || 0;
                                        const topayType = product.topay; // "toPay" | "paid"
                                        const paidText =
                                            topayType === "paid" ? `₹${totalAmount}` : "-";

                                        const toPayText =
                                            topayType === "toPay" ? `₹${totalAmount}` : "-";
                                        const toPayValue = product.topay === "topay" ? "To Pay" : 0;

                                        return (
                                            <TableRow
                                                key={booking._id}
                                                hover
                                                sx={{
                                                    '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                                                    '&:hover': { bgcolor: 'action.selected' }
                                                }}
                                            >
                                                {/* S.No */}
                                                <TableCell sx={oneLineCell}>
                                                    {globalIndex}
                                                </TableCell>

                                                {/* Booking ID */}
                                                <TableCell sx={oneLineCell}>
                                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                                        {booking.bookingId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={oneLineCell}>
                                                    {booking.quotationDate
                                                        ? new Date(booking.quotationDate).toLocaleDateString("en-GB")
                                                        : "-"}
                                                </TableCell>
                                                {/* Bilty No */}
                                                <TableCell sx={oneLineCell}>
                                                    {booking.productDetails?.[0]?.receiptNo || "-"}
                                                </TableCell>

                                                {/* Ref No */}
                                                <TableCell sx={oneLineCell}>
                                                    {booking.productDetails?.[0]?.refNo || "-"}
                                                </TableCell>

                                                {/* Sender */}
                                                <TableCell sx={{ ...oneLineCell, maxWidth: 220 }}>
                                                    {booking.fromCustomerName}
                                                </TableCell>

                                                {/* Receiver */}
                                                <TableCell sx={{ ...oneLineCell, maxWidth: 220 }}>
                                                    {booking.toCustomerName}
                                                </TableCell>

                                                {/* Route */}
                                                <TableCell sx={oneLineCell}>
                                                    {booking.startStationName} - {booking.endStation}
                                                </TableCell>

                                                {/* Weight */}
                                                <TableCell sx={oneLineCell}>
                                                    {product.weight} kg
                                                </TableCell>

                                                {/* Amount Details */}
                                                <TableCell>
                                                    <Stack spacing={0.5}>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Typography variant="caption" sx={{ minWidth: 80 }}>
                                                                Amount:
                                                            </Typography>
                                                            <Typography color="primary.main">
                                                                ₹{productAmount}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Typography variant="caption" sx={{ minWidth: 80 }}>
                                                                Freight:
                                                            </Typography>
                                                            <Typography color="info.main">
                                                                ₹{freightAmount}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Typography variant="caption" sx={{ minWidth: 80 }}>
                                                                INS / VPP:
                                                            </Typography>
                                                            <Typography color="warning.main">
                                                                ₹{insVppAmount}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Typography variant="caption" sx={{ minWidth: 80 }}>
                                                                Total:
                                                            </Typography>
                                                            <Typography fontWeight="bold">
                                                                ₹{totalAmount}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>

                                                {/* Paid */}
                                                <TableCell sx={oneLineCell}>
                                                    {paidText}
                                                </TableCell>

                                                {/* To Pay */}
                                                <TableCell sx={oneLineCell}>
                                                    {toPayText}
                                                </TableCell>
                                            </TableRow>

                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        )}
                    </>
                )}
            </Paper>

            {/* Detailed Summary */}
            {
                summary && filteredBookings.length > 0 && (
                    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            📋 Detailed Summary
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell><strong>Total Items</strong></TableCell>
                                            <TableCell align="right">{summary.totalItems}</TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell><strong>Paid Amount</strong></TableCell>
                                            <TableCell align="right">₹{summary.totalPaid.toLocaleString()}</TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell><strong>ToPay Amount</strong></TableCell>
                                            <TableCell align="right">₹{summary.balanceDue.toLocaleString()}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Ins / Vpp Total</strong></TableCell>
                                            <TableCell align="right">₹{summary.totalInsVpp.toLocaleString()}</TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell><strong>Total Value</strong></TableCell>
                                            <TableCell align="right">₹{summary.totalValue.toLocaleString()}</TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <Chip icon={<PaidIcon />} label="Fully Paid" color="success" size="small" />
                                            </TableCell>
                                            <TableCell align="right">{summary.paymentBreakdown.fullyPaid}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Chip icon={<PendingActionsIcon />} label="Partially Paid" color="warning" size="small" />
                                            </TableCell>
                                            <TableCell align="right">{summary.paymentBreakdown.partiallyPaid}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Chip icon={<MoneyOffIcon />} label="Unpaid" color="error" size="small" />
                                            </TableCell>
                                            <TableCell align="right">{summary.paymentBreakdown.unpaid}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Grid>
                        </Grid>
                    </Paper>
                )
            }
        </Container >
    );
};

export default ViewQuotationBtDate;