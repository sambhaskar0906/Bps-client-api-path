import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableHead,
    TableRow, TableCell, TableBody, TextField, Button, Dialog,
    DialogTitle, DialogContent, DialogActions, CircularProgress, Alert
} from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { fetchPendingCustomers, receiveCustomerPayment } from '../../../features/booking/bookingSlice';

const PanddingList = () => {
    const dispatch = useDispatch();

    // Corrected selector - access the right state structure
    const {
        customers = [],
        loading = false,
        error = null,
        summary = null
    } = useSelector((state) => state.bookings);

    useEffect(() => {
        dispatch(fetchPendingCustomers());
    }, [dispatch]);

    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    // Safe filtering
    const filteredCustomers = (customers || []).filter((cust) =>
        cust?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust?.contact?.toString().includes(searchTerm)
    );

    const handleOpenDialog = (customer) => {
        setSelectedCustomer(customer);
        setPaymentAmount('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCustomer(null);
    };

    const handleAddPayment = () => {
        if (!paymentAmount || Number(paymentAmount) <= 0) {
            alert("Enter a valid amount");
            return;
        }

        if (!selectedCustomer?.customerId) {
            alert("Invalid customer selected");
            return;
        }

        dispatch(receiveCustomerPayment({
            customerId: selectedCustomer.customerId,
            amount: Number(paymentAmount)
        }))
            .unwrap()
            .then(() => {
                handleCloseDialog();
                dispatch(fetchPendingCustomers()); // Refresh table after payment
            })
            .catch((error) => {
                console.error("Payment failed:", error);
                alert("Payment failed: " + (error.message || "Unknown error"));
            });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">Error: {error}</Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Pending Payments
            </Typography>

            {/* Summary Section */}
            {summary && (
                <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="h6" gutterBottom>
                        Summary
                    </Typography>
                    <Box display="flex" gap={3} flexWrap="wrap">
                        <Typography variant="body1">
                            <strong>Total Customers:</strong> {summary.totalCustomers}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Total Pending:</strong> ₹{summary.totalPendingAmount}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Customers with Unpaid Bookings:</strong> {summary.customersWithUnpaidBookings}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Average Pending:</strong> ₹{summary.averagePendingPerCustomer}
                        </Typography>
                    </Box>
                </Paper>
            )}

            <Box mb={2}>
                <TextField
                    label="Search by Name, Email, or Contact"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 500 }}
                />
            </Box>

            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>S.NO</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Total Bookings</TableCell>
                            <TableCell>Unpaid Bookings</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Paid</TableCell>
                            <TableCell>Pending</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((cust, index) => (
                                <TableRow key={cust.customerId || index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{cust.name || 'N/A'}</TableCell>
                                    <TableCell>{cust.email || 'N/A'}</TableCell>
                                    <TableCell>{cust.contact || 'N/A'}</TableCell>
                                    <TableCell>{cust.totalBookings || 0}</TableCell>
                                    <TableCell>{cust.unpaidBookings || 0}</TableCell>
                                    <TableCell>₹{cust.totalAmount || 0}</TableCell>
                                    <TableCell>₹{cust.totalPaid || 0}</TableCell>
                                    <TableCell>₹{cust.pendingAmount || 0}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleOpenDialog(cust)}
                                            disabled={!cust.customerId}
                                        >
                                            Add Payment
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={10} align="center">
                                    {customers.length === 0 ? "No customers with pending payments found." : "No matching customers found."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            {/* Add Payment Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Add Payment</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" mb={1}>
                        Customer: {selectedCustomer?.name}
                    </Typography>
                    <Typography variant="body2" mb={1}>
                        Pending Amount: ₹{selectedCustomer?.pendingAmount}
                    </Typography>
                    <TextField
                        label="Payment Amount"
                        type="number"
                        fullWidth
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        margin="normal"
                        inputProps={{
                            max: selectedCustomer?.pendingAmount,
                            min: 1
                        }}
                        helperText={`Max: ₹${selectedCustomer?.pendingAmount}`}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleAddPayment}
                        variant="contained"
                        disabled={!paymentAmount || Number(paymentAmount) <= 0}
                    >
                        Save Payment
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PanddingList;