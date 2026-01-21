import React, { useState } from "react";
import {
    Box,
    Button,
    Paper,
    Stack,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Menu,
    MenuItem,
    Tooltip,
    Chip,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useDispatch, useSelector } from "react-redux";
import { fetchIncomingBookings } from "../../../features/booking/bookingSlice";

const BookingForm = () => {
    const dispatch = useDispatch();
    const { incomingList, loading, error } = useSelector(
        (state) => state.bookings
    );

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleSearch = () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates");
            return;
        }

        const fromDate = startDate.toISOString().split("T")[0];
        const toDate = endDate.toISOString().split("T")[0];

        dispatch(fetchIncomingBookings({ fromDate, toDate }));
    };

    const handleDownloadMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleDownloadMenuClose = () => {
        setAnchorEl(null);
    };

    // Format date to readable format
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Get receipt numbers and ref numbers
    const getReceiptRefDetails = (items) => {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return { receipts: "-", refs: "-" };
        }

        const receipts = items.map(item => item.receiptNo || "-").join(", ");
        const refs = items.map(item => item.refNo || "-").join(", ");

        return { receipts, refs };
    };

    // Get Paid and Topay status based on items array
    const getPaymentStatus = (items) => {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return { paid: "-", topay: "-" };
        }

        // Check if any item has toPay === "paid"
        const hasPaid = items.some(item => item.toPay === "paid");
        // Check if any item has toPay === "toPay"
        const hasTopay = items.some(item => item.toPay === "toPay");

        return {
            paid: hasPaid ? "Paid" : "-",
            topay: hasTopay ? "Topay" : "-"
        };
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a3',
        });

        // Title
        doc.setFontSize(16);
        doc.text("Booking Report", 14, 15);

        // Date range
        doc.setFontSize(10);
        doc.text(`Start Date: ${startDate ? formatDate(startDate) : "-"}`, 14, 22);
        doc.text(`End Date: ${endDate ? formatDate(endDate) : "-"}`, 14, 27);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

        // Prepare table data
        const tableColumn = [
            "S.No",
            "Booking ID",
            "Date",
            "Receipt No",
            "Ref No",
            "Sender Name",
            "Mobile",
            "From City",
            "Receiver Name",
            "To City",
            "Weight",
            "Amount",
            "Paid",
            "Topay"
        ];

        const tableRows = incomingList.map((row, index) => {
            const receiptRefDetails = getReceiptRefDetails(row.items);
            const paymentStatus = getPaymentStatus(row.items);
            const totalWeight = row.items?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0;

            // Truncate long text for better fit
            const senderName = (row.senderName || row.firstName + " " + (row.middleName || "") + " " + (row.lastName || "") || "-");
            const receiverName = (row.receiverName || "-");

            return [
                (index + 1).toString(),
                row.bookingId || "-",
                formatDate(row.bookingDate),
                receiptRefDetails.receipts,
                receiptRefDetails.refs,
                senderName.length > 20 ? senderName.substring(0, 20) + "..." : senderName,
                row.mobile || "-",
                row.fromCity || (row.startStation?.stationName) || "-",
                receiverName.length > 20 ? receiverName.substring(0, 20) + "..." : receiverName,
                row.toCity || (row.endStation?.stationName) || "-",
                `${totalWeight} kg`,
                `${row.grandTotal || row.billTotal || 0}`,
                paymentStatus.paid,
                paymentStatus.topay
            ];
        });

        // Calculate column widths dynamically
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const availableWidth = pageWidth - (margin * 2);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,

            tableWidth: 'auto',

            styles: {
                fontSize: 7,
                cellPadding: 1.5,
                overflow: 'linebreak',
                lineWidth: 0.1,
            },

            headStyles: {
                fillColor: [25, 118, 210],
                textColor: 255,
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'center',
            },

            margin: {
                left: 5,   // 🔥 LEFT CUT FIX
                right: 5,
                top: 35,
                bottom: 15,
            },

            pageBreak: 'auto',
            horizontalPageBreak: true,   // 🔥 KEY FIX
            horizontalPageBreakRepeat: 0,

            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 30 },
                2: { cellWidth: 22 },
                3: { cellWidth: 32 },
                4: { cellWidth: 24 },
                5: { cellWidth: 36 },
                6: { cellWidth: 26 },
                7: { cellWidth: 28 },
                8: { cellWidth: 36 },
                9: { cellWidth: 28 },
                10: { cellWidth: 18 },
                11: { cellWidth: 26 },
                12: { cellWidth: 18 },
                13: { cellWidth: 18 },
            },
        });

        doc.save(`bookings_report_${new Date().toISOString().slice(0, 10)}.pdf`);
        handleDownloadMenuClose();
    };

    const handleDownloadExcel = () => {
        // Prepare comprehensive data for Excel
        const excelData = incomingList.map((row, index) => {
            const receiptRefDetails = getReceiptRefDetails(row.items);
            const paymentStatus = getPaymentStatus(row.items);
            const totalWeight = row.items?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0;

            return {
                "S.No": index + 1,
                "Booking ID": row.bookingId || "-",
                "Booking Date": formatDate(row.bookingDate),
                "Receipt No": receiptRefDetails.receipts,
                "Ref No": receiptRefDetails.refs,
                "Sender Name": row.senderName || row.firstName + " " + (row.middleName || "") + " " + (row.lastName || "") || "-",
                "Sender Mobile": row.mobile || "-",
                "Sender Email": row.email || "-",
                "From City": row.fromCity || (row.startStation?.stationName) || "-",
                "From State": row.fromState || "-",
                "From Pincode": row.senderPincode || "-",
                "Receiver Name": row.receiverName || "-",
                "Receiver Email": row.receiverEmail || "-",
                "Receiver Contact": row.receiverContact || "-",
                "To City": row.toCity || (row.endStation?.stationName) || "-",
                "To State": row.toState || "-",
                "To Pincode": row.toPincode || "-",
                "Items Count": row.items?.length || 0,
                "Total Weight": totalWeight,
                "Freight": row.freight || 0,
                "GST": (row.cgst || 0) + (row.sgst || 0) + (row.igst || 0),
                "Bill Total": row.billTotal || 0,
                "Grand Total": row.grandTotal || 0,
                "Paid Amount": row.paidAmount || 0,
                "Paid": paymentStatus.paid,
                "Topay": paymentStatus.topay,
            };
        });

        // Create worksheet with auto column width
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Auto column width (approximate)
        const maxWidth = excelData.reduce((widths, row) => {
            Object.keys(row).forEach((key, idx) => {
                const length = String(row[key]).length;
                if (!widths[idx] || length > widths[idx]) {
                    widths[idx] = length;
                }
            });
            return widths;
        }, []);

        worksheet['!cols'] = maxWidth.map(w => ({ wch: Math.min(w + 2, 50) }));

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

        // Generate Excel file
        XLSX.writeFile(workbook, `bookings_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
        handleDownloadMenuClose();
    };

    // Get sender full name
    const getSenderFullName = (row) => {
        if (row.senderName) return row.senderName;
        const nameParts = [];
        if (row.firstName) nameParts.push(row.firstName);
        if (row.middleName) nameParts.push(row.middleName);
        if (row.lastName) nameParts.push(row.lastName);
        return nameParts.join(" ") || "-";
    };

    // Get total weight
    const getTotalWeight = (items) => {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((sum, item) => sum + (item.weight || 0), 0);
    };

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: "95%", mx: "auto", mt: 4, overflowX: 'auto' }}>
            {/* Filters */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                flexWrap="wrap"
                gap={2}
            >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            format="dd/MM/yyyy"
                            onChange={(newValue) => setStartDate(newValue)}
                            slotProps={{ textField: { size: "small", sx: { minWidth: 150 } } }}
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            format="dd/MM/yyyy"
                            onChange={(newValue) => setEndDate(newValue)}
                            slotProps={{ textField: { size: "small", sx: { minWidth: 150 } } }}
                        />
                        <Button variant="outlined" onClick={handleSearch}>
                            Search
                        </Button>
                    </Stack>
                </LocalizationProvider>

                <Button
                    variant="contained"
                    onClick={handleDownloadMenuOpen}
                    disabled={incomingList.length === 0}
                    endIcon={<ArrowDropDownIcon />}
                >
                    Download Report
                </Button>

                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleDownloadMenuClose}
                >
                    <MenuItem onClick={handleDownloadPDF}>
                        Download as PDF
                    </MenuItem>
                    <MenuItem onClick={handleDownloadExcel}>
                        Download as Excel
                    </MenuItem>
                </Menu>
            </Box>

            {/* Table */}
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {incomingList.length > 0 && (
                <Box sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 1400 }}>
                        <TableHead sx={{ backgroundColor: "#1976d2" }}>
                            <TableRow>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 60 }}>S.No</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 100 }}>Booking ID</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 90 }}>Date</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 100 }}>Receipt No</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 80 }}>Ref No</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 150 }}>Sender Details</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 100 }}>From City</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 150 }}>Receiver Details</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 100 }}>To City</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 80 }}>Weight</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 100 }}>Amount (₹)</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 80 }}>Paid</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 80 }}>Topay</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 150 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {incomingList.map((row, index) => {
                                const receiptRefDetails = getReceiptRefDetails(row.items);
                                const paymentStatus = getPaymentStatus(row.items);

                                return (
                                    <TableRow key={row._id || index} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Tooltip title={row.bookingId || "-"}>
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {row.bookingId || "-"}
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(row.bookingDate)}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={receiptRefDetails.receipts}>
                                                <span style={{ fontSize: '0.9em' }}>
                                                    {receiptRefDetails.receipts.length > 20
                                                        ? receiptRefDetails.receipts.substring(0, 20) + "..."
                                                        : receiptRefDetails.receipts}
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={receiptRefDetails.refs}>
                                                <span style={{ fontSize: '0.9em' }}>
                                                    {receiptRefDetails.refs.length > 15
                                                        ? receiptRefDetails.refs.substring(0, 15) + "..."
                                                        : receiptRefDetails.refs}
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ lineHeight: '1.4' }}>
                                                <div><strong>{getSenderFullName(row)}</strong></div>
                                                <div style={{ fontSize: '0.9em' }}>{row.mobile || "-"}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {row.fromCity || (row.startStation?.stationName) || "-"}
                                            {row.fromState && <div style={{ fontSize: '0.85em', color: '#666' }}>{row.fromState}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ lineHeight: '1.4' }}>
                                                <div><strong>{row.receiverName || "-"}</strong></div>
                                                {/* Show receiver email if available, otherwise show sender email */}
                                                {(row.receiverEmail || row.email) && (
                                                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                                                        {row.receiverEmail || row.email}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {row.toCity || (row.endStation?.stationName) || "-"}
                                            {row.toState && <div style={{ fontSize: '0.85em', color: '#666' }}>{row.toState}</div>}
                                        </TableCell>
                                        <TableCell align="center">
                                            {getTotalWeight(row.items)} kg
                                        </TableCell>
                                        <TableCell align="right">
                                            <div style={{ fontWeight: 'bold' }}>₹{row.grandTotal || row.billTotal || 0}</div>
                                            {row.paidAmount > 0 && (
                                                <div style={{ fontSize: '0.85em', color: '#666' }}>
                                                    Paid: ₹{row.paidAmount}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {paymentStatus.paid === "Paid" ? (
                                                <Chip
                                                    label="Paid"
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: '#d4edda',
                                                        color: '#155724',
                                                        fontWeight: 'bold',
                                                        minWidth: 60
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ color: '#999' }}>-</span>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {paymentStatus.topay === "Topay" ? (
                                                <Chip
                                                    label="Topay"
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: '#fff3cd',
                                                        color: '#856404',
                                                        fontWeight: 'bold',
                                                        minWidth: 60
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ color: '#999' }}>-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title="View Details">
                                                    <IconButton color="primary" size="small">
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton color="primary" size="small">
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton color="error" size="small">
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Send">
                                                    <IconButton color="primary" size="small">
                                                        <SendIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Receipt">
                                                    <IconButton color="secondary" size="small">
                                                        <ReceiptIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Box>
            )}
        </Paper>
    );
};

export default BookingForm;