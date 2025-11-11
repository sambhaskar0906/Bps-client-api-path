import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import * as Yup from 'yup';
import {
  Box, Button, Grid, TextField, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton,
  Typography, MenuItem, Select, FormControl, InputLabel,
  ListItemIcon, ListItemText
} from '@mui/material';
import { Close, LocalPhone, Email, Home, LocationOn, PinDrop, Add, Delete } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStates, fetchCities, clearCities } from '../../../../features/Location/locationSlice';
import { createStation, fetchStations } from '../../../../features/stations/stationSlice';
import { addOption, getAllOptions, deleteOption } from '../../../../features/addOptionsSlice/addOptionsSlice';

const StationForm = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { states, cities } = useSelector((state) => state.location);
  const { options: cityOptions, loading: optionsLoading } = useSelector((state) => state.leadOptions);

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const [showAddCity, setShowAddCity] = useState(false);
  const [newCity, setNewCity] = useState('');

  const validationSchema = Yup.object().shape({
    stationName: Yup.string().required('Station name is required'),
    contact: Yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits').required(),
    emailId: Yup.string().email('Invalid email').required(),
    address: Yup.string().required(),
    street: Yup.string(),
    state: Yup.string().required(),
    city: Yup.string().required(),
    gst: Yup.string().required(),
    pincode: Yup.string().matches(/^\d{6}$/, 'Must be 6 digits').required(),
  });

  const formik = useFormik({
    initialValues: {
      stationName: '',
      contact: '',
      emailId: '',
      address: '',
      street: '',
      state: '',
      city: '',
      pincode: '',
      gst: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(createStation(values)).unwrap();
        await dispatch(fetchStations());
        formik.resetForm();
        onClose();
      } catch (errorPayload) {
        const message = typeof errorPayload === 'string'
          ? errorPayload
          : "Something went wrong";
        setSnackbar({
          open: true,
          message,
          severity: 'error'
        });
      }
    }
  });

  // Fetch states and city options on component mount
  useEffect(() => {
    dispatch(fetchStates());
    dispatch(getAllOptions());
  }, [dispatch]);

  // When state changes, fetch cities
  useEffect(() => {
    if (formik.values.state) {
      dispatch(fetchCities(formik.values.state));
    } else {
      dispatch(clearCities());
    }
  }, [formik.values.state, dispatch]);

  // Filter city options for current state
  const filteredCityOptions = cityOptions.filter(
    option => option.fieldName === 'city' && option.fieldState === formik.values.state
  );

  // Add new city function
  const handleAddCity = async () => {
    if (!newCity.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter city name',
        severity: 'error'
      });
      return;
    }

    if (!formik.values.state) {
      setSnackbar({
        open: true,
        message: 'Please select state first',
        severity: 'error'
      });
      return;
    }

    try {
      await dispatch(addOption({
        fieldName: 'city',
        value: newCity.trim(),
        fieldState: formik.values.state // Add state reference
      })).unwrap();

      setNewCity('');
      setShowAddCity(false);

      setSnackbar({
        open: true,
        message: 'City added successfully',
        severity: 'success'
      });

      // Refresh options
      dispatch(getAllOptions());

    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.message || 'Failed to add city',
        severity: 'error'
      });
    }
  };

  // Delete city function
  const handleDeleteCity = async (cityId, cityName) => {
    if (window.confirm(`Are you sure you want to delete ${cityName}?`)) {
      try {
        await dispatch(deleteOption(cityId)).unwrap();

        setSnackbar({
          open: true,
          message: 'City deleted successfully',
          severity: 'success'
        });

        // If deleted city was selected, clear the selection
        if (formik.values.city === cityName) {
          formik.setFieldValue('city', '');
        }

        // Refresh options
        dispatch(getAllOptions());

      } catch (error) {
        setSnackbar({
          open: true,
          message: error?.message || 'Failed to delete city',
          severity: 'error'
        });
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Add New Station</Typography>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <form onSubmit={formik.handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Station Name" name="stationName"
                value={formik.values.stationName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.stationName && Boolean(formik.errors.stationName)}
                helperText={formik.touched.stationName && formik.errors.stationName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Home color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} >
              <TextField
                fullWidth label="Contact" name="contact"
                value={formik.values.contact}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contact && Boolean(formik.errors.contact)}
                helperText={formik.touched.contact && formik.errors.contact}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalPhone color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="Email" name="emailId" type="email"
                value={formik.values.emailId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emailId && Boolean(formik.errors.emailId)}
                helperText={formik.touched.emailId && formik.errors.emailId}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="Address" name="address" multiline rows={2}
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl
                fullWidth
                error={formik.touched.state && Boolean(formik.errors.state)}
              >
                <InputLabel id="state-label">State</InputLabel>
                <Select
                  id="state"
                  name="state"
                  label="State"
                  labelId="state-label"
                  value={formik.values.state}
                  onChange={(e) => {
                    const selectedState = e.target.value;
                    formik.setFieldValue('state', selectedState);
                    formik.setFieldValue('city', '');
                    dispatch(fetchCities(selectedState));
                  }}
                  onBlur={formik.handleBlur}
                >
                  {Array.isArray(states) &&
                    states.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                </Select>
                {formik.touched.state && formik.errors.state && (
                  <Typography variant="caption" color="error">
                    {formik.errors.state}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl
                fullWidth
                error={formik.touched.city && Boolean(formik.errors.city)}
              >
                <InputLabel id="city-label">City</InputLabel>
                <Select
                  id="city"
                  name="city"
                  label="City"
                  labelId="city-label"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!formik.values.state}
                >
                  {/* API cities */}
                  {Array.isArray(cities) &&
                    cities.map((city) => (
                      <MenuItem key={`api-${city}`} value={city}>
                        {city}
                      </MenuItem>
                    ))}

                  {/* Custom added cities */}
                  {filteredCityOptions.map((option) => (
                    <MenuItem
                      key={`custom-${option._id}`}
                      value={option.value}
                      sx={{ justifyContent: 'space-between' }}
                    >
                      {option.value}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCity(option._id, option.value);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </MenuItem>
                  ))}

                  {/* Add New City Option */}
                  <MenuItem
                    onClick={() => setShowAddCity(true)}
                    sx={{
                      borderTop: '1px solid #eee',
                      backgroundColor: '#f5f5f5',
                      '&:hover': { backgroundColor: '#e0e0e0' }
                    }}
                  >
                    <ListItemIcon>
                      <Add color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Add New City" />
                  </MenuItem>
                </Select>
                {formik.touched.city && formik.errors.city && (
                  <Typography variant="caption" color="error">
                    {formik.errors.city}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Add New City Input */}
            {showAddCity && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Enter new city name"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCity()}
                    autoFocus
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleAddCity}
                    disabled={!newCity.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setShowAddCity(false);
                      setNewCity('');
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="PIN Code" name="pincode"
                value={formik.values.pincode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.pincode && Boolean(formik.errors.pincode)}
                helperText={formik.touched.pincode && formik.errors.pincode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PinDrop color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="GST Number" name="gst"
                value={formik.values.gst}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.gst && Boolean(formik.errors.gst)}
                helperText={formik.touched.gst && formik.errors.gst}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PinDrop color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          color="primary"
          variant="contained"
          onClick={formik.handleSubmit}
          disabled={!formik.isValid || formik.isSubmitting}
        >
          Save Station
        </Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Dialog>
  );
};

export default StationForm;