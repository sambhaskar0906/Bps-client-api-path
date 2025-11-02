import React, { useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    Card,
    CardContent,
    TextField,
    Avatar,
    Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { viewBookingById } from "../../../../features/quotation/quotationSlice";
import { CircularProgress } from "@mui/material";
import { Home, LocalShipping, InsertDriveFile } from "@mui/icons-material";
import { ArrowBack } from '@mui/icons-material';

const StyledTextField = ({ label, value }) => (
    <Grid size={{ xs: 12, md: 4 }}>
        <TextField
            label={label}
            value={value || "-"}
            fullWidth
            variant="outlined"
            InputProps={{
                readOnly: true,
                style: {
                    borderRadius: 12,
                    backgroundColor: "#fff",
                },
            }}
            InputLabelProps={{
                style: {
                    fontWeight: 600,
                },
            }}
            sx={{
                "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                        borderColor: "#1976d2",
                    },
                    "&.Mui-focused fieldset": {
                        borderColor: "#1976d2",
                        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                    },
                },
                mb: 2,
            }}
        />
    </Grid>
);

const SectionHeader = ({ icon, title }) => (
    <Box
        sx={{
            bgcolor: "primary.light",
            px: 2,
            py: 1,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            mb: 2,
        }}
    >
        {icon}
        <Typography variant="h6" fontWeight={600} ml={1}>
            {title}
        </Typography>
    </Box>
);

const ViewQuotation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const { viewedBooking, loading } = useSelector((state) => state.quotations);

    useEffect(() => {
        if (bookingId) dispatch(viewBookingById(bookingId));
    }, [bookingId, dispatch]);

    if (loading || !viewedBooking) {
        return (
            <Box p={3}>
                <CircularProgress />
            </Box>
        );
    }

    const data = viewedBooking;

    // ✅ Bilty Amount fixed 20 रुपये
    const biltyAmount = 20;

    // ✅ CORRECTED Calculations
    const billTotal = (data.amount || 0) + biltyAmount;
    const taxAmount = (billTotal * (data.sTax || 0)) / 100;
    const grandTotalBeforeRound = billTotal + taxAmount;
    const roundedGrandTotal = Math.round(grandTotalBeforeRound);
    const roundOff = (roundedGrandTotal - grandTotalBeforeRound).toFixed(2);

    console.log("viewedBooking", data);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mr: 2 }}
            >
                Back
            </Button>
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h4" fontWeight={600} mb={2}>
                        Quotation Details
                    </Typography>

                    {/* Booking Info */}
                    <Card sx={{ mt: 2, p: 2, bgcolor: "grey.50" }}>
                        <CardContent>
                            <SectionHeader icon={<InsertDriveFile />} title="Booking Details" />
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <StyledTextField label="Start Station" value={data.startStationName} />
                                <StyledTextField label="Destination Station" value={data.endStation} />
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <StyledTextField
                                        label="Booking Date"
                                        value={data.quotationDate}
                                        readOnly
                                        renderInput={(params) => (
                                            <TextField {...params} fullWidth InputProps={{ readOnly: true }} />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <StyledTextField
                                        label="Proposed Delivery Date"
                                        value={data.proposedDeliveryDate}
                                        readOnly
                                        renderInput={(params) => (
                                            <TextField {...params} fullWidth InputProps={{ readOnly: true }} />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card sx={{ mt: 3, p: 2, bgcolor: "grey.50" }}>
                        <CardContent>
                            <SectionHeader icon={<InsertDriveFile />} title="Customer Information" />
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <StyledTextField label="First Name" value={data.firstName} />
                                <StyledTextField label="Middle Name" value={data.middleName} />
                                <StyledTextField label="Last Name" value={data.lastName} />
                                <StyledTextField label="Contact Number" value={data.mobile} />
                                <StyledTextField label="Email" value={data.email} />
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* From Address */}
                    <Card sx={{ mt: 3, p: 2, bgcolor: "grey.50" }}>
                        <CardContent>
                            <SectionHeader icon={<Home />} title="From Address" />
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <StyledTextField label="Name" value={data.fromCustomerName} />
                                <StyledTextField label="Locality / Street" value={data.fromAddress} />
                                <StyledTextField label="State" value={data.fromState} />
                                <StyledTextField label="City" value={data.fromCity} />
                                <StyledTextField label="Pin Code" value={data.fromPincode} />
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* To Address */}
                    <Card sx={{ mt: 3, p: 2, bgcolor: "grey.50" }}>
                        <CardContent>
                            <SectionHeader icon={<LocalShipping />} title="To Address" />
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <StyledTextField label="Name" value={data.toCustomerName} />
                                <StyledTextField label="Locality / Street" value={data.toAddress} />
                                <StyledTextField label="State" value={data.toState} />
                                <StyledTextField label="City" value={data.toCity} />
                                <StyledTextField label="Pin Code" value={data.toPincode} />
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Product Details */}
                    <Card sx={{ mt: 3, p: 2, bgcolor: "grey.50" }}>
                        <CardContent>
                            <SectionHeader icon={<InsertDriveFile />} title="Product Details" />
                            <Divider sx={{ mb: 2 }} />
                            {Array.isArray(data.productDetails) && data.productDetails.map((item, index) => (
                                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                    <StyledTextField label="Product Name" value={item.name} />
                                    <StyledTextField label="Quantity" value={item.quantity} />
                                    <StyledTextField label="Weight (Kgs)" value={item.weight} />
                                    <StyledTextField label="Price" value={item.price} />
                                    <StyledTextField label="To Pay / Paid" value={item.topay} />
                                </Grid>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Financial Summary */}
                    <Card sx={{ mt: 3, p: 2, bgcolor: "grey.50" }}>
                        <CardContent>
                            <SectionHeader icon={<InsertDriveFile />} title="Financial Summary" />
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <StyledTextField label="Sub Total" value={data.amount} />
                                <StyledTextField label="Bilty Amount" value={biltyAmount} />
                                <StyledTextField label="Bill Total" value={billTotal.toFixed(2)} />
                                <StyledTextField label="Service Tax (%)" value={data.sTax} />
                                <StyledTextField label="Tax Amount" value={taxAmount.toFixed(2)} />
                                <StyledTextField label="Grand Total (Before Rounding)" value={grandTotalBeforeRound.toFixed(2)} />
                                <StyledTextField label="Round Off" value={roundOff} />
                                <StyledTextField label="Final Grand Total" value={roundedGrandTotal} />
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Comments and Additional Info */}
                    <Card sx={{ mt: 3, p: 2, bgcolor: "grey.50" }}>
                        <CardContent>
                            <SectionHeader icon={<InsertDriveFile />} title="Additional Info" />
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Additional Comments"
                                        value={data.additionalCmt || "No additional comments"}
                                        fullWidth
                                        multiline
                                        minRows={4}
                                        InputProps={{ readOnly: true }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Paper>
            </Box>
        </LocalizationProvider>
    );
};

export default ViewQuotation;