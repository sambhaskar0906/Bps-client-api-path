import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    TextField,
    Button,
    Paper,
    CircularProgress,
    Typography
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchStaffById, updateStaff } from "../../../../features/staff/staffSlice";
import { useParams, useNavigate } from "react-router-dom";

const EditStaff = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { staffId } = useParams();

    const { current, loading } = useSelector((state) => state.staff);

    const [form, setForm] = useState({});
    const [files, setFiles] = useState({});

    useEffect(() => {
        dispatch(fetchStaffById(staffId));
    }, [dispatch, staffId]);

    // API mapping
    useEffect(() => {
        if (current) {
            setForm(current);
        }
    }, [current]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const name = e.target.name;

        if (!file) return;

        setFiles({ ...files, [name]: file });

        // 👇 runtime preview
        const previewUrl = URL.createObjectURL(file);

        if (name === "aadharCardPhoto") {
            setForm({
                ...form,
                documents: {
                    ...form.documents,
                    aadharCardPhoto: {
                        ...form.documents?.aadharCardPhoto,
                        url: previewUrl
                    }
                }
            });
        }

        if (name === "passportPhoto") {
            setForm({
                ...form,
                documents: {
                    ...form.documents,
                    passportPhoto: {
                        ...form.documents?.passportPhoto,
                        url: previewUrl
                    }
                }
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        // Basic fields
        formData.append("firstName", form.firstName || "");
        formData.append("lastName", form.lastName || "");
        formData.append("contactNumber", form.contactNumber || "");
        formData.append("email", form.email || "");
        formData.append("aadharNumber", form.aadharNumber || "");

        // Address fields
        if (form.address) {
            formData.append("addressLine", form.address.addressLine || "");
            formData.append("state", form.address.state || "");
            formData.append("city", form.address.city || "");
            formData.append("district", form.address.district || "");
            formData.append("pincode", form.address.pincode || "");
        }

        // Files
        if (files.aadharCardPhoto)
            formData.append("aadharCardPhoto", files.aadharCardPhoto);
        if (files.passportPhoto)
            formData.append("passportPhoto", files.passportPhoto);

        const res = await dispatch(updateStaff({ id: staffId, formData }));
        if (res.type.includes("fulfilled")) {
            navigate(-1);
        }
    };

    if (loading || !current) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                    Edit Staff Profile
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {/* Basic Info */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField name="firstName" label="First Name" fullWidth value={form.firstName || ""} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField name="lastName" label="Last Name" fullWidth value={form.lastName || ""} onChange={handleChange} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField name="contactNumber" label="Contact Number" fullWidth value={form.contactNumber || ""} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField name="email" label="Email" fullWidth value={form.email || ""} onChange={handleChange} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField name="aadharNumber" label="Aadhar Number" fullWidth value={form.aadharNumber || ""} onChange={handleChange} />
                        </Grid>

                        {/* Address */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Address"
                                fullWidth
                                value={form?.address?.addressLine || ""}
                                onChange={(e) =>
                                    setForm({ ...form, address: { ...form.address, addressLine: e.target.value } })
                                }
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField label="State" fullWidth value={form?.address?.state || ""}
                                onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField label="City" fullWidth value={form?.address?.city || ""}
                                onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField label="District" fullWidth value={form?.address?.district || ""}
                                onChange={(e) => setForm({ ...form, address: { ...form.address, district: e.target.value } })} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField label="Pincode" fullWidth value={form?.address?.pincode || ""}
                                onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })} />
                        </Grid>

                        {/* Aadhar */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography fontWeight="bold" mb={1}>Aadhar Card</Typography>
                            <Paper variant="outlined" sx={{ p: 1, mb: 1, textAlign: "center" }}>
                                {form?.documents?.aadharCardPhoto?.url && (
                                    <img src={form.documents.aadharCardPhoto.url} alt="Aadhar" style={{ width: "100%", maxHeight: 200, objectFit: "contain" }} />
                                )}
                            </Paper>
                            <Button variant="outlined" component="label" fullWidth>
                                Upload New Aadhar
                                <input type="file" hidden name="aadharCardPhoto" onChange={handleFileChange} />
                            </Button>
                        </Grid>

                        {/* Passport */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography fontWeight="bold" mb={1}>Passport Photo</Typography>
                            <Paper variant="outlined" sx={{ p: 1, mb: 1, textAlign: "center" }}>
                                {form?.documents?.passportPhoto?.url && (
                                    <img src={form.documents.passportPhoto.url} alt="Passport" style={{ width: "100%", maxHeight: 200, objectFit: "contain" }} />
                                )}
                            </Paper>
                            <Button variant="outlined" component="label" fullWidth>
                                Upload New Passport
                                <input type="file" hidden name="passportPhoto" onChange={handleFileChange} />
                            </Button>
                        </Grid>

                        {/* Buttons */}
                        <Grid size={{ xs: 12 }} display="flex" justifyContent="space-between">
                            <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
                            <Button type="submit" variant="contained">Update Staff</Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default EditStaff;