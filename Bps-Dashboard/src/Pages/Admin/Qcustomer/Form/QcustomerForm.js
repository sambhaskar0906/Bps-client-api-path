import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Grid,
    TextField,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Card,
    CardContent,
    Divider,
    FormHelperText,
    Snackbar,
    Alert
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStates, fetchCities, clearCities } from '../../../../features/Location/locationSlice';
import { createCustomer } from '../../../../features/qcustomers/qcustomerSlice'
import { addOption } from "../../../../features/addOptionsSlice/addOptionsSlice"; // addOption import करें
import { useNavigate } from 'react-router-dom';

const QcustomerForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { states, cities } = useSelector((state) => state.location);

    // New state for city management
    const [addingCity, setAddingCity] = useState(false);
    const [newCity, setNewCity] = useState("");
    const [availableCities, setAvailableCities] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'error'
    });

    // Validation Schema
    const validationSchema = Yup.object().shape({
        firstName: Yup.string().required('First Name is required'),
        lastName: Yup.string().required('Last Name is required'),
        contactNumber: Yup.string()
            .required('Contact Number is required')
            .matches(/^[0-9]{10}$/, 'Contact Number must be 10 digits'),
        emailId: Yup.string()
            .email('Invalid email address'),
        address: Yup.string().required('Address is required'),
        state: Yup.string().required('State is required'),
        city: Yup.string().required('City is required'),
        district: Yup.string().required('District is required'),
        stateCode: Yup.string().required('StateCode is required'),
        pincode: Yup.string()
            .required('Pincode is required')
            .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
        idProof: Yup.string().required('ID Proof is required'),
        idProofPhoto: Yup.mixed().required('ID Photo is required'),
        customerProfilePhoto: Yup.mixed().required('Customer Photo is required')
    });

    // Function to handle adding new city
    const handleAddCity = async () => {
        // Basic validation
        if (!formik.values.state) {
            setSnackbar({
                open: true,
                message: "Please select a state first.",
                severity: 'warning'
            });
            return;
        }

        const trimmed = newCity?.trim();
        if (!trimmed) {
            setSnackbar({
                open: true,
                message: "Please enter a city name.",
                severity: 'warning'
            });
            return;
        }

        try {
            setAddingCity(true);

            const payload = {
                field: "city",
                fieldName: "city",
                name: trimmed,
                value: trimmed,
                state: formik.values.state
            };

            // Call addOption action
            const addRes = await dispatch(addOption(payload)).unwrap();

            // Extract created city name from response
            const createdName =
                addRes?.data?.value ??
                addRes?.value ??
                addRes?.data ??
                (typeof addRes === 'string' ? addRes : null) ??
                trimmed;

            // Re-fetch cities from server for the given state
            const fetchRes = await dispatch(fetchCities(formik.values.state)).unwrap();

            // Normalize fetch result to an array
            const fetchedCities = Array.isArray(fetchRes) ? fetchRes : (fetchRes?.data || []);

            // Ensure createdName is present (case-insensitive dedupe)
            const addIfMissing = (arr, name) => {
                const found = arr.find(c => String(c).toLowerCase() === String(name).toLowerCase());
                if (found) return arr;
                return [...arr, name];
            };

            const updated = addIfMissing(fetchedCities, createdName);
            setAvailableCities(updated);

            // Set the new city as selected
            formik.setFieldValue('city', createdName);

            // Reset input
            setNewCity("");

            // Show success message
            setSnackbar({
                open: true,
                message: `City "${createdName}" added successfully!`,
                severity: 'success'
            });

        } catch (err) {
            console.error("Failed to add city:", err);
            const message = err?.message || err?.data?.message || JSON.stringify(err) || "Failed to add city";

            setSnackbar({
                open: true,
                message: message,
                severity: 'error'
            });
        } finally {
            setAddingCity(false);
        }
    };

    // Formik setup
    const formik = useFormik({
        initialValues: {
            firstName: '',
            middleName: '',
            lastName: '',
            contactNumber: '',
            stateCode: '',
            emailId: '',
            address: '',
            state: '',
            city: '',
            district: '',
            pincode: '',
            idProof: '',
            idProofPhoto: null,
            customerProfilePhoto: null
        },
        validationSchema,
        validateOnMount: true,
        onSubmit: async (values) => {
            try {
                await dispatch(createCustomer(values)).unwrap();

                // Show success message
                setSnackbar({
                    open: true,
                    message: "Customer registered successfully!",
                    severity: 'success'
                });

                formik.resetForm();

                // Navigate after 1.5 seconds
                setTimeout(() => {
                    navigate('/qcustomer');
                }, 1500);
            }
            catch (error) {
                console.log("Error while adding customer", error);
                const errMsg = error?.message || "Something went wrong while adding the customer.";

                setSnackbar({
                    open: true,
                    message: errMsg,
                    severity: 'error'
                });
            }
        }
    });

    // Fetch states on component mount
    useEffect(() => {
        dispatch(fetchStates());
    }, []);

    // Fetch cities when state changes
    useEffect(() => {
        if (formik.values.state) {
            dispatch(fetchCities(formik.values.state))
                .unwrap()
                .then((res) => {
                    const fetchedCities = Array.isArray(res) ? res : (res?.data || []);
                    setAvailableCities(fetchedCities);
                })
                .catch(console.error);
        } else {
            dispatch(clearCities());
            setAvailableCities([]);
            formik.setFieldValue('city', '');
        }
    }, [formik.values.state, dispatch]);

    const handleFileChange = (field, file) => {
        formik.setFieldValue(field, file);
        formik.setFieldTouched(field, true, false);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: '0 auto' }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    mb: 4,
                    textAlign: 'center'
                }}>
                    Quotation Customer Registration
                </Typography>

                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Personal Information Section */}
                        <Grid size={{ xs: 12 }}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                                        Personal Information
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="First Name *"
                                                variant="outlined"
                                                name="firstName"
                                                value={formik.values.firstName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                                                helperText={formik.touched.firstName && formik.errors.firstName}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Middle Name"
                                                variant="outlined"
                                                name="middleName"
                                                value={formik.values.middleName}
                                                onChange={formik.handleChange}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Last Name *"
                                                variant="outlined"
                                                name="lastName"
                                                value={formik.values.lastName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                                helperText={formik.touched.lastName && formik.errors.lastName}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Contact Number *"
                                                variant="outlined"
                                                name="contactNumber"
                                                value={formik.values.contactNumber}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.contactNumber && Boolean(formik.errors.contactNumber)}
                                                helperText={formik.touched.contactNumber && formik.errors.contactNumber}
                                                size="small"
                                                type="tel"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Email ID"
                                                type="email"
                                                variant="outlined"
                                                name="emailId"
                                                value={formik.values.emailId}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.emailId && Boolean(formik.errors.emailId)}
                                                helperText={formik.touched.emailId && formik.errors.emailId}
                                                size="small"
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Address Section */}
                        <Grid size={{ xs: 12 }}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                                        Address Information
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                label="Address / Street *"
                                                variant="outlined"
                                                name="address"
                                                value={formik.values.address}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.address && Boolean(formik.errors.address)}
                                                helperText={formik.touched.address && formik.errors.address}
                                                size="small"
                                                multiline
                                                rows={2}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <FormControl
                                                fullWidth
                                                size="small"
                                                error={formik.touched.state && Boolean(formik.errors.state)}
                                            >
                                                <InputLabel>State *</InputLabel>
                                                <Select
                                                    name="state"
                                                    value={formik.values.state}
                                                    onChange={(e) => {
                                                        const selectedState = e.target.value;
                                                        formik.setFieldValue('state', selectedState);
                                                        formik.setFieldValue('city', '');
                                                        dispatch(fetchCities(selectedState));
                                                    }}
                                                    onBlur={formik.handleBlur}
                                                    label="State *"
                                                    sx={{ minWidth: 300 }}
                                                >
                                                    {Array.isArray(states) && states.map((state) => (
                                                        <MenuItem key={state} value={state}>{state}</MenuItem>
                                                    ))}
                                                </Select>
                                                {formik.touched.state && formik.errors.state && (
                                                    <FormHelperText>{formik.errors.state}</FormHelperText>
                                                )}
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <FormControl
                                                fullWidth
                                                size="small"
                                                error={formik.touched.city && Boolean(formik.errors.city)}
                                            >
                                                <InputLabel>City *</InputLabel>
                                                <Select
                                                    name="city"
                                                    value={formik.values.city}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    label="City *"
                                                    sx={{ minWidth: 300 }}
                                                >
                                                    {availableCities.map((city) => (
                                                        <MenuItem key={city} value={city}>{city}</MenuItem>
                                                    ))}
                                                </Select>
                                                {formik.touched.city && formik.errors.city && (
                                                    <FormHelperText>{formik.errors.city}</FormHelperText>
                                                )}
                                            </FormControl>

                                            {/* Add new city input - City dropdown के नीचे */}
                                            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    placeholder="Add new city for selected state"
                                                    value={newCity}
                                                    onChange={(e) => setNewCity(e.target.value)}
                                                    disabled={addingCity || !formik.values.state}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && formik.values.state && newCity.trim()) {
                                                            e.preventDefault();
                                                            handleAddCity();
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    onClick={handleAddCity}
                                                    disabled={addingCity || !formik.values.state || !newCity.trim()}
                                                    sx={{ minWidth: '80px' }}
                                                >
                                                    {addingCity ? 'Adding...' : 'Add'}
                                                </Button>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="District *"
                                                variant="outlined"
                                                name="district"
                                                value={formik.values.district}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.district && Boolean(formik.errors.district)}
                                                helperText={formik.touched.district && formik.errors.district}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Pincode *"
                                                variant="outlined"
                                                name="pincode"
                                                value={formik.values.pincode}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.pincode && Boolean(formik.errors.pincode)}
                                                helperText={formik.touched.pincode && formik.errors.pincode}
                                                size="small"
                                                type="number"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="StateCode *"
                                                variant="outlined"
                                                name="stateCode"
                                                value={formik.values.stateCode}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.stateCode && Boolean(formik.errors.stateCode)}
                                                helperText={formik.touched.stateCode && formik.errors.stateCode}
                                                size="small"
                                                type="String"
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Document Section */}
                        <Grid size={{ xs: 12 }}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                                        Document Verification
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <TextField
                                                fullWidth
                                                select
                                                label="ID Proof *"
                                                variant="outlined"
                                                name="idProof"
                                                value={formik.values.idProof}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.idProof && Boolean(formik.errors.idProof)}
                                                helperText={formik.touched.idProof && formik.errors.idProof}
                                                size="small"
                                            >
                                                <MenuItem value="">Select ID Proof</MenuItem>
                                                <MenuItem value="Aadhar Card">Aadhar Card</MenuItem>
                                                <MenuItem value="PAN Card">PAN Card</MenuItem>
                                                <MenuItem value="Voter ID">Voter ID</MenuItem>
                                                <MenuItem value="Driving License">Driving License</MenuItem>
                                                <MenuItem value="Passport">Passport</MenuItem>
                                            </TextField>
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                component="label"
                                                startIcon={<CloudUpload />}
                                                size="small"
                                                sx={{ height: '40px' }}
                                                color={formik.touched.idProofPhoto && formik.errors.idProofPhoto ? 'error' : 'primary'}
                                            >
                                                Upload ID Photo *
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange('idProofPhoto', e.target.files[0])}
                                                />
                                            </Button>
                                            {formik.values.idProofPhoto && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {formik.values.idProofPhoto.name}
                                                </Typography>
                                            )}
                                            {formik.touched.idProofPhoto && formik.errors.idProofPhoto && (
                                                <FormHelperText error>{formik.errors.idProofPhoto}</FormHelperText>
                                            )}
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                component="label"
                                                startIcon={<CloudUpload />}
                                                size="small"
                                                sx={{ height: '40px' }}
                                                color={formik.touched.customerProfilePhoto && formik.errors.customerProfilePhoto ? 'error' : 'primary'}
                                            >
                                                Upload Customer Photo *
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange('customerProfilePhoto', e.target.files[0])}
                                                />
                                            </Button>
                                            {formik.values.customerProfilePhoto && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {formik.values.customerProfilePhoto.name}
                                                </Typography>
                                            )}
                                            {formik.touched.customerProfilePhoto && formik.errors.customerProfilePhoto && (
                                                <FormHelperText error>{formik.errors.customerProfilePhoto}</FormHelperText>
                                            )}
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Submit Button */}
                        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                sx={{ px: 6, py: 1.5, fontSize: '1rem' }}
                                onClick={formik.handleSubmit}
                                disabled={!formik.isValid || formik.isSubmitting}
                            >
                                Submit Registration
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                    elevation={6}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default QcustomerForm;