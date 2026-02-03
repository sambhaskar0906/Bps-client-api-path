import React, { useEffect } from "react";
import {
    Box,
    Grid,
    Typography,
    Paper,
    Button,
    CircularProgress,
    TextField,
    Avatar,
    Divider
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchStaffById } from "../../../../features/staff/staffSlice";
import { useParams, useNavigate } from "react-router-dom";

const StaffView = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { staffId } = useParams();

    const { current, loading } = useSelector((state) => state.staff);

    useEffect(() => {
        dispatch(fetchStaffById(staffId));
    }, [dispatch, staffId]);

    if (loading || !current) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    const staff = current?.data?.[0] || current; // API safe handling

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                Staff Profile
            </Typography>

            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4 }}>
                {/* Header */}
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar
                        src={staff?.documents?.passportPhoto?.url}
                        sx={{ width: 80, height: 80 }}
                    />
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {staff.firstName} {staff.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Staff ID : {staff.staffId}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="First Name" value={staff.firstName} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Last Name" value={staff.lastName} InputProps={{ readOnly: true }} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Contact Number" value={staff.contactNumber} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Email" value={staff.email} InputProps={{ readOnly: true }} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Aadhar Number" value={staff.aadharNumber} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Status" value={staff.status} InputProps={{ readOnly: true }} />
                    </Grid>

                    {/* Address */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Address"
                            value={staff.address?.addressLine}
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth label="State" value={staff.address?.state} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth label="City" value={staff.address?.city} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth label="District" value={staff.address?.district} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth label="Pincode" value={staff.address?.pincode} InputProps={{ readOnly: true }} />
                    </Grid>

                    {/* Images */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography fontWeight="bold" mb={1}>Aadhar Card</Typography>
                        <Paper variant="outlined" sx={{ p: 1, textAlign: "center" }}>
                            <img
                                src={staff?.documents?.aadharCardPhoto?.url}
                                alt="Aadhar"
                                style={{ width: "100%", maxHeight: 250, objectFit: "contain" }}
                            />
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography fontWeight="bold" mb={1}>Passport Photo</Typography>
                        <Paper variant="outlined" sx={{ p: 1, textAlign: "center" }}>
                            <img
                                src={staff?.documents?.passportPhoto?.url}
                                alt="Passport"
                                style={{ width: "100%", maxHeight: 250, objectFit: "contain" }}
                            />
                        </Paper>
                    </Grid>
                </Grid>

                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default StaffView;