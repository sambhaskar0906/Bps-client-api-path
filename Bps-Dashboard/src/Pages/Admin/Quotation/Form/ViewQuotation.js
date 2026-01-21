import React, { useEffect } from "react";
import {
    Box,
    Grid,
    Typography,
    TextField,
    MenuItem,
    Button,
    CircularProgress,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { viewBookingById } from "../../../../features/quotation/quotationSlice";

/* ---------- Date Formatter (DD-MM-YYYY) ---------- */
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
};

const ViewQuotation = () => {
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const dispatch = useDispatch();

    const { viewedBooking, loading } = useSelector(
        (state) => state.quotations
    );

    useEffect(() => {
        if (bookingId) {
            dispatch(viewBookingById(bookingId));
        }
    }, [bookingId, dispatch]);

    if (loading || !viewedBooking) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    const q = viewedBooking;

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                Back
            </Button>

            <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
                <Grid container spacing={2}>

                    {/* ---------- Booking Details ---------- */}

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Start Station"
                            value={q.startStationName}
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Destination Station"
                            value={q.endStation}
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Booking Date"
                            value={formatDate(q.quotationDate)}
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Proposed Delivery Date"
                            value={formatDate(q.proposedDeliveryDate)}
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>

                    {/* ---------- Customer Info ---------- */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6">Customer Information</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="First Name" value={q.firstName} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="Middle Name" value={q.middleName} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="Last Name" value={q.lastName} InputProps={{ readOnly: true }} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Mobile" value={q.mobile} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Email" value={q.email} InputProps={{ readOnly: true }} />
                    </Grid>

                    {/* ---------- From Address ---------- */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6">From (Address)</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Name" value={q.fromCustomerName} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Contact Number" value={q.mobile} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Address" value={q.fromAddress} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="City" value={q.fromCity} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="State" value={q.fromState} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Pincode" value={q.fromPincode} InputProps={{ readOnly: true }} />
                    </Grid>

                    {/* ---------- To Address ---------- */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6">To (Address)</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Name" value={q.toCustomerName} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Contact Number" value={q.toContactNumber} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Address" value={q.toAddress} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="City" value={q.toCity} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="State" value={q.toState} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Pincode" value={q.toPincode} InputProps={{ readOnly: true }} />
                    </Grid>

                    {/* ---------- Product Details ---------- */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6">Product Details</Typography>
                    </Grid>

                    {q.productDetails.map((item, index) => (
                        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 12, sm: 2 }}>
                                <TextField fullWidth label="Receipt No" value={item.receiptNo} InputProps={{ readOnly: true }} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 2 }}>
                                <TextField fullWidth label="Ref No" value={item.refNo} InputProps={{ readOnly: true }} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 2 }}>
                                <TextField fullWidth label="Name" value={item.name} InputProps={{ readOnly: true }} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 1 }}>
                                <TextField fullWidth label="Qty" value={item.quantity} InputProps={{ readOnly: true }} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 1 }}>
                                <TextField fullWidth label="Weight" value={item.weight} InputProps={{ readOnly: true }} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 2 }}>
                                <TextField fullWidth label="Price" value={item.price} InputProps={{ readOnly: true }} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 2 }}>
                                <TextField fullWidth label="Payment Status" value={item.topay} InputProps={{ readOnly: true }} />
                            </Grid>
                        </Grid>
                    ))}

                    {/* ---------- Financial Summary ---------- */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6">Financial Summary</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="Freight" value={q.freight} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="Amount" value={q.amount} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="Total Insurance" value={q.totalInsurance} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="Service Tax %" value={q.sTax} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="SGST %" value={q.sgst} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="Grand Total" value={q.grandTotal} InputProps={{ readOnly: true }} />
                    </Grid>

                </Grid>
            </Box>
        </>
    );
};

export default ViewQuotation;
