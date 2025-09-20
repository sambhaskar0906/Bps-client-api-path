import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    CircularProgress,
    Stack,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { BOOKINGS_API } from '../../../utils/api'

const TrackerCard = () => {
    const [customerName, setCustomerName] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleGenerateInvoice = async () => {
        if (!customerName || !fromDate || !toDate) {
            setErrorMsg("Please fill in all fields");
            return;
        }
        setErrorMsg("");
        setLoading(true);

        try {
            const response = await fetch(`${BOOKINGS_API}/invoice`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerName,
                    fromDate: fromDate.toISOString().split("T")[0],
                    toDate: toDate.toISOString().split("T")[0],
                }),
            });

            if (response.ok && response.headers.get("content-type").includes("pdf")) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${customerName}_Invoice.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const data = await response.json();
                setErrorMsg(data.message || "Failed to generate invoice");
            }
        } catch (error) {
            setErrorMsg(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper
            elevation={6}
            sx={{
                p: 4,
                maxWidth: 500,
                mx: "auto",
                mt: 6,
                borderRadius: 4,
                background: "linear-gradient(145deg, #f9f9f9, #e6e9f0)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
        >
            {/* Header */}
            <Typography
                variant="h5"
                gutterBottom
                sx={{
                    fontWeight: 700,
                    textAlign: "center",
                    color: "#333",
                    mb: 3,
                }}
            >
                📄 Generate Customer Invoice
            </Typography>

            {/* Form */}
            <Stack spacing={2}>
                <TextField
                    fullWidth
                    label="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    variant="outlined"
                />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="From Date"
                        value={fromDate}
                        onChange={setFromDate}
                        slotProps={{
                            textField: { fullWidth: true, variant: "outlined" },
                        }}
                    />
                    <DatePicker
                        label="To Date"
                        value={toDate}
                        onChange={setToDate}
                        slotProps={{
                            textField: { fullWidth: true, variant: "outlined" },
                        }}
                    />
                </LocalizationProvider>

                {errorMsg && (
                    <Typography color="error" variant="body2">
                        {errorMsg}
                    </Typography>
                )}

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleGenerateInvoice}
                    disabled={loading}
                    sx={{
                        background: "linear-gradient(90deg, #4facfe, #00f2fe)",
                        fontWeight: 600,
                        fontSize: "1rem",
                        borderRadius: 3,
                        boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                        ":hover": {
                            background: "linear-gradient(90deg, #3b8ef3, #00d4ff)",
                        },
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Invoice"}
                </Button>
            </Stack>
        </Paper>
    );
};

export default TrackerCard;
