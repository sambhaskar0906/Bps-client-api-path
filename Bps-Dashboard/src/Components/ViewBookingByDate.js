import React, { useEffect, useState, useMemo } from 'react';
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    Paper, Container, CircularProgress, Grid, TextField,
    InputAdornment, Chip, Alert, Card, CardContent,
    TableContainer, IconButton, Tooltip, Stack, TablePagination
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStations } from '../features/stations/stationSlice';
import { BOOKINGS_API } from "../utils/api";
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PaidIcon from '@mui/icons-material/Paid';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ScaleIcon from '@mui/icons-material/Scale';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ClearIcon from '@mui/icons-material/Clear';
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";



const ViewBookingByDate = () => {
    const [fromCity, setFromCity] = useState('');
    const [toCity, setToCity] = useState('');
    const [searchText, setSearchText] = useState('');
    const dispatch = useDispatch();
    const { fromDate, toDate } = useParams();
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);
    const [bookings, setBookings] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({
        key: null,   // "bilty" | "sender" | "receiver"
        direction: "asc"
    });

    const { list: stations } = useSelector((state) => state.stations);

    useEffect(() => {
        dispatch(fetchStations());
    }, [dispatch]);

    const oneLineCell = {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
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
                    `${BOOKINGS_API}/booking-summary`,
                    { fromDate, toDate },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        },
                    }
                );
                const bookingsData = res.data.bookings || [];
                setBookings(bookingsData);

                // Calculate enhanced summary
                const calculatedSummary = {
                    totalBookings: bookingsData.length,

                    grandTotal: bookingsData.reduce(
                        (sum, b) => sum + (b.grandTotal || 0),
                        0
                    ),

                    totalPaid: bookingsData.reduce((sum, b) => {
                        const item = b.items?.[0];
                        return item?.toPay === "paid"
                            ? sum + Number(b.grandTotal || 0)
                            : sum;
                    }, 0),

                    totalToPay: bookingsData.reduce((sum, b) => {
                        const item = b.items?.[0];
                        return item?.toPay === "toPay"
                            ? sum + Number(b.grandTotal || 0)
                            : sum;
                    }, 0),

                    totalInsVpp: bookingsData.reduce(
                        (sum, b) => sum + Number(b.ins_vpp || 0),
                        0
                    ),

                    paymentBreakdown: {
                        fullyPaid: bookingsData.filter(
                            b => b.items?.[0]?.toPay === "paid"
                        ).length,

                        unpaid: bookingsData.filter(
                            b => b.items?.[0]?.toPay === "toPay"
                        ).length,

                        partiallyPaid: 0
                    }
                };
                setSummary(calculatedSummary);
            } catch (err) {
                console.error('Error fetching bookings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [fromDate, toDate]);

    /* 🔍 SEARCH + FILTER LOGIC */
    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const text = searchText.toLowerCase();
            const item = booking.items?.[0] || {};

            const matchesSearch =
                booking.bookingId?.toLowerCase().includes(text) ||
                booking.senderName?.toLowerCase().includes(text) ||
                booking.receiverName?.toLowerCase().includes(text) ||
                booking.fromCity?.toLowerCase().includes(text) ||
                booking.toCity?.toLowerCase().includes(text) ||
                item.receiptNo?.toLowerCase().includes(text);

            const matchesFromCity = fromCity
                ? booking.fromCity?.toLowerCase().includes(fromCity.toLowerCase())
                : true;

            const matchesToCity = toCity
                ? booking.toCity?.toLowerCase().includes(toCity.toLowerCase())
                : true;

            return matchesSearch && matchesFromCity && matchesToCity;
        });
    }, [bookings, searchText, fromCity, toCity]);

    const getInsVppAmount = (booking) => {
        return Number(booking.ins_vpp || 0);
    };

    const sortedBookings = useMemo(() => {
        if (!sortConfig.key) return filteredBookings;

        return [...filteredBookings].sort((a, b) => {
            let aVal = "";
            let bVal = "";

            if (sortConfig.key === "bilty") {
                aVal = a.items?.[0]?.receiptNo || "";
                bVal = b.items?.[0]?.receiptNo || "";
            }

            if (sortConfig.key === "sender") {
                aVal = a.senderName || "";
                bVal = b.senderName || "";
            }

            if (sortConfig.key === "receiver") {
                aVal = a.receiverName || "";
                bVal = b.receiverName || "";
            }

            return sortConfig.direction === "asc"
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        });
    }, [filteredBookings, sortConfig]);

    const paginatedBookings = useMemo(() => {
        return sortedBookings.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [sortedBookings, page, rowsPerPage]);

    const getPayLabels = (booking) => {
        const item = booking.items?.[0] || {};
        const payType = (item.toPay || "").toLowerCase();

        return {
            paid: payType === "paid" ? "Paid" : "-",
            toPay: payType === "topay" ? "To Pay" : "-"
        };
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const downloadBookingPDF = () => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        const pageWidth = doc.internal.pageSize.getWidth();

        // ===== HEADER =====
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Booking Report", pageWidth / 2, 12, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`From ${fromDate} to ${toDate}`, pageWidth / 2, 18, { align: "center" });

        // ===== TABLE HEAD =====
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
            "INS/VPP",
            "Bilty",
            "GST",
            "Paid",
            "To Pay",
            "Total"
        ]];

        // ===== TABLE BODY =====
        const body = filteredBookings.map((b, index) => {
            const item = b.items?.[0] || {};
            const payType = item.toPay;
            const totalAmount = b.grandTotal || 0;
            const paidAmount = payType === "paid" ? totalAmount : "";
            const toPayAmount = payType === "toPay" ? totalAmount : "";
            const insVpp = getInsVppAmount(b);
            const gst =
                (b.cgst || 0) +
                (b.sgst || 0) +
                (b.igst || 0);

            const bilty = 20;

            return [
                index + 1,
                b.bookingId || "-",
                new Date(b.bookingDate).toLocaleDateString("en-GB"),
                item.receiptNo || "-",
                item.refNo || "-",
                b.senderName || "-",
                b.receiverName || "-",
                `${b.startStationName} - ${b.endStationName}`,
                item.weight || 0,
                insVpp,
                bilty,
                `${gst}%`,
                paidAmount,
                toPayAmount,
                totalAmount
            ];

        });

        doc.autoTable({
            head,
            body,
            startY: 22,
            theme: "grid",

            styles: {
                fontSize: 7.5,
                cellPadding: 1.5,
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
                0: { cellWidth: 8, halign: "center" },
                1: { cellWidth: 30 },
                2: { cellWidth: 18 },
                3: { cellWidth: 22 },
                4: { cellWidth: 16 },
                5: { cellWidth: 32 },
                6: { cellWidth: 32 },
                7: { cellWidth: 28 },
                8: { cellWidth: 12, halign: "center" },
                9: { cellWidth: 14, halign: "right" }, // INS/VPP
                10: { cellWidth: 14, halign: "right" },
                11: { cellWidth: 14, halign: "right" },
                12: { cellWidth: 14, halign: "right" },
                13: { cellWidth: 14, halign: "right" },
                14: { cellWidth: 14 }
            }
        });

        // ===== SUMMARY SECTION (PDF) =====
        const summaryStartY = doc.lastAutoTable.finalY + 8;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Summary", 14, summaryStartY);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        const summaryData = [
            ["Total Bookings", summary.totalBookings],
            ["Total Paid Amount", summary.totalPaid],
            ["Total To Pay Amount", summary.totalToPay],
            ["Total INS / VPP", summary.totalInsVpp],
            ["Grand Total", summary.grandTotal],
            ["Fully Paid Count", summary.paymentBreakdown.fullyPaid],
            ["Partially Paid Count", summary.paymentBreakdown.partiallyPaid],
            ["Unpaid Count", summary.paymentBreakdown.unpaid],
        ];

        doc.autoTable({
            startY: summaryStartY + 4,
            body: summaryData,
            theme: "grid",
            styles: {
                fontSize: 9,
                cellPadding: 2
            },
            columnStyles: {
                0: { fontStyle: "bold" },
                1: {
                    halign: "right",
                    cellHook: function (cell) {
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
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 200, { align: "center" });
        }

        doc.save(`Booking_Report_${fromDate}_to_${toDate}.pdf`);
    };

    const downloadBookingExcel = () => {
        const data = filteredBookings.map((b, index) => {
            const item = b.items?.[0] || {};
            const payType = item.toPay;
            const totalAmount = b.grandTotal || 0;
            const paidAmount = payType === "paid" ? totalAmount : "";
            const toPayAmount = payType === "toPay" ? totalAmount : "";
            const insVpp = getInsVppAmount(b);
            const gst =
                (b.cgst || 0) +
                (b.sgst || 0) +
                (b.igst || 0);

            const bilty = 20;

            return {
                "S.No": index + 1,
                "Booking ID": b.bookingId,
                "Booking Date": new Date(b.bookingDate).toLocaleDateString("en-GB"),
                "Bilty No": item.receiptNo || "",
                "Ref No": item.refNo || "",
                "Sender": b.senderName,
                "Receiver": b.receiverName,
                "Route": `${b.startStationName} - ${b.endStationName}`,
                "Weight": item.weight || 0,
                "INS / VPP": insVpp,
                "Bilty": bilty,
                "GST (%)": gst,
                "Paid": paidAmount,
                "To Pay": toPayAmount,
                "Total": totalAmount
            };

        });
        // ===== SUMMARY ROWS (EXCEL) =====
        data.push({});
        data.push({ "Booking ID": "SUMMARY" });

        data.push({ "Booking ID": "Total Bookings", "Total": summary.totalBookings });
        data.push({ "Booking ID": "Total Paid Amount", "Total": Number(summary.totalPaid) });
        data.push({ "Booking ID": "Total To Pay Amount", "Total": Number(summary.totalToPay) });
        data.push({ "Booking ID": "Total INS / VPP", "Total": Number(summary.totalInsVpp) });
        data.push({ "Booking ID": "Grand Total", "Total": Number(summary.grandTotal) });
        data.push({ "Booking ID": "Fully Paid Count", "Total": summary.paymentBreakdown.fullyPaid });
        data.push({ "Booking ID": "Partially Paid Count", "Total": summary.paymentBreakdown.partiallyPaid });
        data.push({ "Booking ID": "Unpaid Count", "Total": summary.paymentBreakdown.unpaid });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Booking Report");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const fileData = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        saveAs(fileData, `Booking_Report_${fromDate}_to_${toDate}.xlsx`);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header with Date Range */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h4" fontWeight={600} gutterBottom>
                    📋 Booking Report
                </Typography>
                <Typography variant="h6">
                    📅 From: {fromDate} to {toDate}
                </Typography>
            </Paper>

            {/* Summary Cards */}
            {summary && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box>
                                    <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Total Bookings
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {summary.totalBookings}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box>
                                    <AccountBalanceWalletIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Grand Total
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        ₹{summary.grandTotal.toLocaleString()}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box>
                                    <PaidIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Amount Paid
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        ₹{summary.totalPaid.toLocaleString()}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box>
                                    <PendingActionsIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Balance Due
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        ₹{summary.totalToPay.toLocaleString()}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Filters Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Filters & Search
                        </Typography>
                    </Grid>

                    {/* Search Bar */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            placeholder="Search Booking ID, Name, City..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="primary" />
                                    </InputAdornment>
                                ),
                                endAdornment: searchText && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchText('')}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* From City Dropdown */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Autocomplete
                            options={stations.map((s) => s.stationName)}
                            value={fromCity}
                            onChange={(e, value) => setFromCity(value || '')}
                            renderInput={(params) => (
                                <TextField {...params} label="From City" />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Typography variant="body2">{option}</Typography>
                                </li>
                            )}
                        />
                    </Grid>

                    {/* To City Dropdown */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Autocomplete
                            options={stations.map((s) => s.stationName)}
                            value={toCity}
                            onChange={(e, value) => setToCity(value || '')}
                            renderInput={(params) => (
                                <TextField {...params} label="To City" />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Typography variant="body2">{option}</Typography>
                                </li>
                            )}
                        />
                    </Grid>

                    {/* Active Filters Info */}
                    {(fromCity || toCity || searchText) && (
                        <Grid size={{ xs: 12 }}>
                            <Alert
                                severity="info"
                                sx={{ mt: 1 }}
                                action={
                                    <IconButton
                                        aria-label="clear"
                                        color="inherit"
                                        size="small"
                                        onClick={() => {
                                            setFromCity('');
                                            setToCity('');
                                            setSearchText('');
                                        }}
                                    >
                                        <ClearIcon fontSize="inherit" />
                                    </IconButton>
                                }
                            >
                                Active Filters:
                                {fromCity && ` From: ${fromCity}`}
                                {toCity && ` To: ${toCity}`}
                                {searchText && ` Search: "${searchText}"`}
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
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <IconButton color="error" onClick={downloadBookingPDF}>
                                    <PictureAsPdfIcon />
                                </IconButton>
                                <IconButton color="success" onClick={downloadBookingExcel}>
                                    <TableChartIcon />
                                </IconButton>
                            </Box>
                        </Box>

                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "primary.main" }}>
                                        <TableCell sx={oneLineCell}>S.No</TableCell>
                                        <TableCell sx={oneLineCell}>Booking ID</TableCell>
                                        <TableCell sx={oneLineCell}>Booking Date</TableCell>
                                        <TableCell
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => handleSort("bilty")}
                                        >
                                            Receipt No {sortConfig.key === "bilty" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}
                                        </TableCell>
                                        <TableCell sx={oneLineCell}>Ref No</TableCell>
                                        <TableCell
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => handleSort("sender")}
                                        >
                                            Sender {sortConfig.key === "sender" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}
                                        </TableCell>
                                        <TableCell
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => handleSort("receiver")}
                                        >
                                            Receiver {sortConfig.key === "receiver" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}
                                        </TableCell>
                                        <TableCell sx={oneLineCell}>Route</TableCell>
                                        <TableCell sx={oneLineCell}>Weight</TableCell>
                                        <TableCell>Amount Details</TableCell>
                                        <TableCell sx={oneLineCell}>Paid</TableCell>
                                        <TableCell sx={oneLineCell}>To Pay</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {paginatedBookings.map((booking, index) => {
                                        const item = booking.items?.[0] || {};
                                        const payType = (item.toPay || "").toLowerCase();
                                        const grandTotal = booking.grandTotal || 0;
                                        const paidValue = payType === "paid" ? grandTotal : "-";
                                        const toPayValue = payType === "topay" ? grandTotal : "-";
                                        const amount = item.amount || 0;
                                        const insVpp = getInsVppAmount(booking);
                                        const bilty = 20;
                                        const gst =
                                            (booking.cgst || 0) +
                                            (booking.sgst || 0) +
                                            (booking.igst || 0);

                                        return (
                                            <TableRow
                                                key={booking._id}
                                                hover
                                                sx={{
                                                    "&:nth-of-type(odd)": { bgcolor: "action.hover" },
                                                    "&:hover": { bgcolor: "action.selected" }
                                                }}
                                            >
                                                {/* S.No */}
                                                <TableCell sx={oneLineCell}>
                                                    {page * rowsPerPage + index + 1}
                                                </TableCell>

                                                {/* Booking ID */}
                                                <TableCell sx={oneLineCell}>
                                                    <Typography fontWeight="bold" color="primary">
                                                        {booking.bookingId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={oneLineCell}>
                                                    {new Date(booking.bookingDate).toLocaleDateString("en-GB")}
                                                </TableCell>

                                                {/* Receipt No */}
                                                <TableCell sx={oneLineCell}>
                                                    {booking.items?.[0]?.receiptNo || "-"}
                                                </TableCell>

                                                {/* Ref No */}
                                                <TableCell sx={oneLineCell}>
                                                    {booking.items?.[0]?.refNo || "-"}
                                                </TableCell>

                                                {/* Sender */}
                                                <TableCell sx={{ ...oneLineCell, maxWidth: 220 }}>
                                                    {booking.senderName}
                                                </TableCell>

                                                {/* Receiver */}
                                                <TableCell sx={{ ...oneLineCell, maxWidth: 220 }}>
                                                    {booking.receiverName}
                                                </TableCell>

                                                {/* Route */}
                                                <TableCell sx={oneLineCell}>
                                                    {booking.startStationName} - {booking.endStationName}
                                                </TableCell>

                                                {/* Weight */}
                                                <TableCell sx={oneLineCell}>
                                                    {booking.items?.[0]?.weight || 0} kg
                                                </TableCell>

                                                {/* Amount (ONLY MULTI-LINE COLUMN) */}
                                                <TableCell>
                                                    <Stack spacing={0.5}>
                                                        <Box sx={{ display: "flex", gap: 1 }}>
                                                            <Typography variant="caption">Amount:</Typography>
                                                            <Typography color="success.main">
                                                                ₹{amount}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", gap: 1 }}>
                                                            <Typography variant="caption">INS / VPP:</Typography>
                                                            <Typography color="info.main">
                                                                ₹{insVpp}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", gap: 1 }}>
                                                            <Typography variant="caption">Bilty:</Typography>
                                                            <Typography color="error.main">
                                                                ₹{bilty}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", gap: 1 }}>
                                                            <Typography variant="caption">GST:</Typography>
                                                            <Typography color="warning.main">{gst}%</Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", gap: 1 }}>
                                                            <Typography variant="caption">Total:</Typography>
                                                            <Typography color="error.main">₹{grandTotal}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell sx={oneLineCell}>
                                                    {paidValue === "-" ? "-" : `₹${paidValue}`}
                                                </TableCell>

                                                <TableCell sx={oneLineCell}>
                                                    {toPayValue === "-" ? "-" : `₹${toPayValue}`}
                                                </TableCell>

                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <TablePagination
                            component="div"
                            count={filteredBookings.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            rowsPerPageOptions={[10]}
                            showFirstButton
                            showLastButton
                            sx={{
                                borderTop: '1px solid #e0e0e0',
                                mt: 2,
                                '.MuiTablePagination-toolbar': {
                                    justifyContent: 'flex-end',
                                    minHeight: '52px'
                                }
                            }}
                        />
                    </>
                )}
            </Paper>

            {/* Detailed Summary */}
            {summary && filteredBookings.length > 0 && (
                <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        📊 Booking Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell><strong>Total Bookings</strong></TableCell>
                                        <TableCell align="right">{summary.totalBookings}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>Paid Amount</strong></TableCell>
                                        <TableCell align="right">₹{summary.totalPaid.toLocaleString()}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>ToPay Amount</strong></TableCell>
                                        <TableCell align="right">₹{summary.totalToPay.toLocaleString()}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>Total INS / VPP</strong></TableCell>
                                        <TableCell align="right">
                                            ₹{summary.totalInsVpp.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>Grand Total</strong></TableCell>
                                        <TableCell align="right">₹{summary.grandTotal.toLocaleString()}</TableCell>
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
            )}
        </Container>
    );
};

export default ViewBookingByDate;