import React, { useState, useEffect } from "react";
import {
    Box, Grid, TextField, Button, Typography, Paper,
    Stack, Alert, CircularProgress
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { createStaff, clearStaffError } from "../../../../features/staff/staffSlice";
import { useNavigate } from "react-router-dom";

const StaffForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error } = useSelector(state => state.staff); // 👈 redux state

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        contactNumber: "",
        email: "",
        aadharNumber: "",
        addressLine: "",
        state: "",
        city: "",
        district: "",
        pincode: ""
    });

    const [files, setFiles] = useState({
        aadharCardPhoto: null,
        passportPhoto: null
    });

    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        // cleanup error when unmount
        return () => {
            dispatch(clearStaffError());
        };
    }, [dispatch]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        Object.keys(form).forEach((key) => {
            formData.append(key, form[key]);
        });

        if (files.aadharCardPhoto)
            formData.append("aadharCardPhoto", files.aadharCardPhoto);

        if (files.passportPhoto)
            formData.append("passportPhoto", files.passportPhoto);

        const res = await dispatch(createStaff(formData));

        if (res.type.includes("fulfilled")) {
            setSuccessMsg("Staff created successfully 🎉");

            setTimeout(() => {
                navigate("/staff");
            }, 1200);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                Create Staff
            </Typography>

            {/* Alerts */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error?.message || "Something went wrong"}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>

                        {/* Basic Info */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField label="First Name" name="firstName" fullWidth required onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField label="Last Name" name="lastName" fullWidth required onChange={handleChange} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField label="Contact Number" name="contactNumber" fullWidth required onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField label="Email" name="email" fullWidth required onChange={handleChange} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField label="Aadhar Number" name="aadharNumber" fullWidth required onChange={handleChange} />
                        </Grid>

                        {/* Address */}
                        <Grid size={{ xs: 12 }}>
                            <TextField label="Address Line" name="addressLine" fullWidth required onChange={handleChange} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField label="State" name="state" fullWidth required onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField label="City" name="city" fullWidth required onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField label="District" name="district" fullWidth required onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField label="Pincode" name="pincode" fullWidth required onChange={handleChange} />
                        </Grid>

                        {/* Documents */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2">Aadhar Card Photo</Typography>
                            <input type="file" name="aadharCardPhoto" onChange={handleFileChange} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2">Passport Size Photo</Typography>
                            <input type="file" name="passportPhoto" onChange={handleFileChange} />
                        </Grid>

                        {/* Buttons */}
                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button variant="outlined" onClick={() => navigate("/staff")} disabled={loading}>
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}   // 👈 disable while API running
                                    startIcon={loading ? <CircularProgress size={18} /> : null}
                                >
                                    {loading ? "Creating..." : "Create Staff"}
                                </Button>
                            </Stack>
                        </Grid>

                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default StaffForm;
