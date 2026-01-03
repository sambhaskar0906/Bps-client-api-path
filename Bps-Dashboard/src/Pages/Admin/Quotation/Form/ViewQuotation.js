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
    Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
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

    // ✅ Calculate total insurance
    const totalInsurance = data.productDetails?.reduce((sum, item) =>
        sum + (Number(item.insurance) || 0), 0) || 0;

    // ✅ Bilty Amount fixed 20 रुपये
    const biltyAmount = 20;

    // ✅ Product Total (price × quantity)
    const productTotal = data.productDetails?.reduce((sum, item) =>
        sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0) || 0;

    // ✅ Bill Total = Product Total + Total Insurance + Bilty Amount
    const billTotal = productTotal + totalInsurance + biltyAmount;

    // ✅ Tax calculation on product value only (not on insurance)
    const taxAmount = (productTotal * (data.sTax || 0)) / 100;

    // ✅ Grand Total before rounding
    const grandTotalBeforeRound = billTotal + taxAmount;

    // ✅ Round off calculations
    const roundedGrandTotal = Math.round(grandTotalBeforeRound);
    const roundOff = (roundedGrandTotal - grandTotalBeforeRound).toFixed(2);

    console.log("View Quotation Data:", data);

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
                        Quotation Details - {data.bookingId}
                    </Typography>

                    {/* Booking Info */}
                    <Card sx={{ mt: 2, p: 2, bgcolor: "grey.50" }}>
                        <CardContent>
                            <SectionHeader icon={<InsertDriveFile />} title="Booking Details" />
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <StyledTextField label="Booking ID" value={data.bookingId} />
                                <StyledTextField label="Start Station" value={data.startStationName} />
                                <StyledTextField label="Destination Station" value={data.endStation} />
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Booking Date"
                                        value={new Date(data.quotationDate).toLocaleDateString('en-IN')}
                                        fullWidth
                                        InputProps={{ readOnly: true }}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Proposed Delivery Date"
                                        value={new Date(data.proposedDeliveryDate).toLocaleDateString('en-IN')}
                                        fullWidth
                                        InputProps={{ readOnly: true }}
                                        sx={{ mb: 2 }}
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
                                <StyledTextField label="Locality" value={data.locality || "-"} />
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
                                {data.toContactNumber && (
                                    <StyledTextField label="Contact Number" value={data.toContactNumber} />
                                )}
                                {data.toEmail && (
                                    <StyledTextField label="Email" value={data.toEmail} />
                                )}
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Product Details */}
                    <Card sx={{ mt: 3, p: 2, bgcolor: "grey.50" }}>
                        <CardContent>
                            <SectionHeader icon={<InsertDriveFile />} title="Product Details" />
                            <Divider sx={{ mb: 2 }} />
                            {Array.isArray(data.productDetails) && data.productDetails.map((item, index) => (
                                <React.Fragment key={index}>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: 'primary.main' }}>
                                        Product {index + 1}
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                                        <StyledTextField
                                            label="Receipt No."
                                            value={item.receiptNo || "-"}
                                        />
                                        <StyledTextField
                                            label="Ref No."
                                            value={item.refNo || "-"}
                                        />
                                        <StyledTextField label="Product Name" value={item.name} />
                                        <StyledTextField label="Quantity" value={item.quantity} />
                                        <StyledTextField label="Weight (Kgs)" value={item.weight} />
                                        <StyledTextField label="Price (₹)" value={item.price} />
                                        <StyledTextField label="Insurance (₹)" value={item.insurance || "0"} />
                                        <StyledTextField
                                            label="VPP Amount (₹)"
                                            value={item.vppAmount || "0"}
                                        />
                                        <StyledTextField label="Payment Status" value={item.topay} />
                                        <StyledTextField
                                            label="Total Value (₹)"
                                            value={(item.price * item.quantity).toFixed(2)}
                                        />
                                    </Grid>
                                </React.Fragment>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Financial Summary */}
                    <Card sx={{ mt: 3, p: 2, bgcolor: "grey.50" }}>
                        <CardContent>
                            <SectionHeader icon={<InsertDriveFile />} title="Financial Summary" />
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <StyledTextField
                                    label="Product Total (Price × Quantity)"
                                    value={productTotal.toFixed(2)}
                                />
                                <StyledTextField
                                    label="Total Insurance"
                                    value={totalInsurance.toFixed(2)}
                                />
                                <StyledTextField label="Bilty Amount" value={biltyAmount.toFixed(2)} />
                                <StyledTextField label="Bill Total" value={billTotal.toFixed(2)} />
                                <StyledTextField label="Service Tax (%)" value={data.sTax || "0"} />
                                <StyledTextField label="Tax Amount" value={taxAmount.toFixed(2)} />
                                <StyledTextField
                                    label="Tax Note"
                                    value="Tax calculated on product value only"
                                />
                                <StyledTextField
                                    label="Grand Total (Before Rounding)"
                                    value={grandTotalBeforeRound.toFixed(2)}
                                />
                                <StyledTextField label="Round Off" value={roundOff} />
                                <StyledTextField
                                    label="Final Grand Total"
                                    value={roundedGrandTotal.toFixed(2)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#e3f2fd',
                                            '& fieldset': {
                                                borderColor: '#2196f3',
                                                borderWidth: 2,
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                        </CardContent>
                    </Card>

                </Paper>
            </Box>
        </LocalizationProvider>
    );
};

export default ViewQuotation;