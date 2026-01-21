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
    CircularProgress,
    Typography,
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
import { fetchIncomingQuotations } from "../../../features/quotation/quotationSlice";

const QBookingForm = () => {
    const dispatch = useDispatch();

    // ✅ Use the correct store key
    const { quotationsList, loading, error } = useSelector(
        (state) => state.quotations
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
        dispatch(fetchIncomingQuotations({ fromDate, toDate }));
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
    const getReceiptRefDetails = (productDetails) => {
        if (!productDetails || !Array.isArray(productDetails) || productDetails.length === 0) {
            return { receipts: "-", refs: "-" };
        }

        const receipts = productDetails.map(item => item.receiptNo || "-").join(", ");
        const refs = productDetails.map(item => item.refNo || "-").join(", ");

        return { receipts, refs };
    };

    // Get Paid and Topay status based on productDetails array
    const getPaymentStatus = (productDetails) => {
        if (!productDetails || !Array.isArray(productDetails) || productDetails.length === 0) {
            return { paid: "-", topay: "-" };
        }

        // Check if any item has toPay === "paid"
        const hasPaid = productDetails.some(item => item.topay === "paid");
        // Check if any item has toPay === "toPay"
        const hasTopay = productDetails.some(item => item.topay === "toPay");

        return {
            paid: hasPaid ? "Paid" : "-",
            topay: hasTopay ? "Topay" : "-"
        };
    };

    // Get total weight
    const getTotalWeight = (productDetails) => {
        if (!productDetails || !Array.isArray(productDetails)) return 0;
        return productDetails.reduce((sum, item) => sum + (item.weight || 0), 0);
    };

    // Get total quantity
    const getTotalQuantity = (productDetails) => {
        if (!productDetails || !Array.isArray(productDetails)) return 0;
        return productDetails.reduce((sum, item) => sum + (item.quantity || 0), 0);
    };

    // Handle PDF Download
    const handleDownloadPDF = () => {
        if (!quotationsList?.length) {
            alert("No data to download");
            return;
        }

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a3',
        });

        // Title
        doc.setFontSize(16);
        doc.text("Quotation Report", 14, 15);

        // Date range
        doc.setFontSize(10);
        doc.text(`Start Date: ${startDate ? formatDate(startDate) : "-"}`, 14, 22);
        doc.text(`End Date: ${endDate ? formatDate(endDate) : "-"}`, 14, 27);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

        // Prepare table data
        const tableColumn = [
            "S.No",
            "Booking ID",
            "Quotation Date",
            "Receipt No",
            "Ref No",
            "Sender Name",
            "From City/State",
            "Receiver Name",
            "To City/State",
            "Quantity",
            "Weight (kg)",
            "Amount (₹)",
            "Paid",
            "Topay"
        ];

        const tableRows = quotationsList.map((row, index) => {
            const receiptRefDetails = getReceiptRefDetails(row.productDetails);
            const paymentStatus = getPaymentStatus(row.productDetails);
            const totalWeight = getTotalWeight(row.productDetails);
            const totalQuantity = getTotalQuantity(row.productDetails);

            // Truncate long text for better fit
            const senderName = row.fromCustomerName ||
                (row.firstName + " " + (row.middleName || "") + " " + (row.lastName || "")) || "-";
            const receiverName = row.toCustomerName || "-";

            return [
                (index + 1).toString(),
                row.bookingId || "-",
                formatDate(row.quotationDate),
                receiptRefDetails.receipts,
                receiptRefDetails.refs,
                senderName.length > 20 ? senderName.substring(0, 20) + "..." : senderName,
                `${row.fromCity || "-"}/${row.fromState || "-"}`,
                receiverName.length > 20 ? receiverName.substring(0, 20) + "..." : receiverName,
                `${row.toCity || "-"}/${row.toState || "-"}`,
                totalQuantity.toString(),
                totalWeight.toString(),
                `${row.grandTotal || row.amount || 0}`,
                paymentStatus.paid,
                paymentStatus.topay
            ];
        });

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
                left: 5,
                right: 5,
                top: 35,
                bottom: 15,
            },
            pageBreak: 'auto',
            horizontalPageBreak: true,
            horizontalPageBreakRepeat: 0,
            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 30 },
                2: { cellWidth: 22 },
                3: { cellWidth: 32 },
                4: { cellWidth: 24 },
                5: { cellWidth: 36 },
                6: { cellWidth: 28 },
                7: { cellWidth: 36 },
                8: { cellWidth: 28 },
                9: { cellWidth: 18 },
                10: { cellWidth: 20 },
                11: { cellWidth: 22 },
                12: { cellWidth: 18 },
                13: { cellWidth: 18 },
            },
        });

        doc.save(`quotations_report_${new Date().toISOString().slice(0, 10)}.pdf`);
        handleDownloadMenuClose();
    };

    // Handle Excel Download
    const handleDownloadExcel = () => {
        if (!quotationsList?.length) {
            alert("No data to download");
            return;
        }

        // Prepare comprehensive data for Excel
        const excelData = quotationsList.map((row, index) => {
            const receiptRefDetails = getReceiptRefDetails(row.productDetails);
            const paymentStatus = getPaymentStatus(row.productDetails);
            const totalWeight = getTotalWeight(row.productDetails);
            const totalQuantity = getTotalQuantity(row.productDetails);

            return {
                "S.No": index + 1,
                "Booking ID": row.bookingId || "-",
                "Quotation Date": formatDate(row.quotationDate),
                "Receipt No": receiptRefDetails.receipts,
                "Ref No": receiptRefDetails.refs,
                "Sender Name": row.fromCustomerName ||
                    row.firstName + " " + (row.middleName || "") + " " + (row.lastName || "") || "-",
                "Sender Mobile": row.mobile || "-",
                "Sender Email": row.email || "-",
                "Sender Address": row.fromAddress || "-",
                "From City": row.fromCity || "-",
                "From State": row.fromState || "-",
                "From Pincode": row.fromPincode || "-",
                "Receiver Name": row.toCustomerName || "-",
                "Receiver Contact": row.toContactNumber || "-",
                "Receiver Address": row.toAddress || "-",
                "To City": row.toCity || "-",
                "To State": row.toState || "-",
                "To Pincode": row.toPincode || "-",
                "Total Quantity": totalQuantity,
                "Total Weight": totalWeight,
                "Amount": row.amount || 0,
                "Freight": row.freight || 0,
                "Insurance/VPP": row.insVppAmount || 0,
                "Grand Total": row.grandTotal || 0,
                "SGST": row.sgst || 0,
                "STax": row.sTax || 0,
                "Paid": paymentStatus.paid,
                "Topay": paymentStatus.topay,
                "Additional Comments": row.additionalCmt || "-",
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
        XLSX.utils.book_append_sheet(workbook, worksheet, "Quotations");

        // Generate Excel file
        XLSX.writeFile(workbook, `quotations_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
        handleDownloadMenuClose();
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
                    disabled={!quotationsList?.length}
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

            {/* Loading/Error */}
            {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
            {error && <Typography color="error" align="center">{error}</Typography>}

            {/* Table */}
            {quotationsList?.length > 0 && (
                <Box sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 1400 }}>
                        <TableHead sx={{ backgroundColor: "#1976d2" }}>
                            <TableRow>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 60 }}>S.No</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 100 }}>Booking ID</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 90 }}>Quotation Date</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 100 }}>Receipt No</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 80 }}>Ref No</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 150 }}>Sender Details</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 100 }}>From City/State</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 150 }}>Receiver Details</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 100 }}>To City/State</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 80 }}>Qty</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 80 }}>Weight</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 100 }}>Amount (₹)</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 80 }}>Paid</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 80 }}>Topay</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", minWidth: 150 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {quotationsList.map((row, index) => {
                                const receiptRefDetails = getReceiptRefDetails(row.productDetails);
                                const paymentStatus = getPaymentStatus(row.productDetails);
                                const totalWeight = getTotalWeight(row.productDetails);
                                const totalQuantity = getTotalQuantity(row.productDetails);

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
                                            {formatDate(row.quotationDate)}
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
                                                <div><strong>{row.fromCustomerName ||
                                                    (row.firstName + " " + (row.middleName || "") + " " + (row.lastName || "")) || "-"}</strong></div>
                                                <div style={{ fontSize: '0.9em' }}>{row.mobile || "-"}</div>
                                                <div style={{ fontSize: '0.85em', color: '#666' }}>
                                                    {row.email || "-"}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ lineHeight: '1.4' }}>
                                                <div>{row.fromCity || "-"}</div>
                                                <div style={{ fontSize: '0.85em', color: '#666' }}>{row.fromState || "-"}</div>
                                                <div style={{ fontSize: '0.85em', color: '#666' }}>Pincode: {row.fromPincode || "-"}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ lineHeight: '1.4' }}>
                                                <div><strong>{row.toCustomerName || "-"}</strong></div>
                                                <div style={{ fontSize: '0.9em' }}>{row.toContactNumber || "-"}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ lineHeight: '1.4' }}>
                                                <div>{row.toCity || "-"}</div>
                                                <div style={{ fontSize: '0.85em', color: '#666' }}>{row.toState || "-"}</div>
                                                <div style={{ fontSize: '0.85em', color: '#666' }}>Pincode: {row.toPincode || "-"}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell align="center">
                                            {totalQuantity}
                                        </TableCell>
                                        <TableCell align="center">
                                            {totalWeight} kg
                                        </TableCell>
                                        <TableCell align="right">
                                            <div style={{ fontWeight: 'bold' }}>₹{row.grandTotal || row.amount || 0}</div>
                                            <div style={{ fontSize: '0.85em', color: '#666' }}>
                                                Freight: ₹{row.freight || 0}
                                            </div>
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

            {/* No data message */}
            {quotationsList?.length === 0 && !loading && (
                <Typography mt={2} align="center">
                    No quotations found for selected dates.
                </Typography>
            )}
        </Paper>
    );
};

export default QBookingForm;