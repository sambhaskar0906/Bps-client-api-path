import React, { useEffect } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { ArrowBack } from '@mui/icons-material';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from 'react-redux';
import { fetchStates, fetchCities, clearCities } from '../../../../features/Location/locationSlice';
import { createBooking } from "../../../../features/quotation/quotationSlice";
import { fetchStations } from '../../../../features/stations/stationSlice'
import { useNavigate } from "react-router-dom";
import CheckCircle from '@mui/icons-material/CheckCircle';
import QcustomerSearch from "../../../../Components/QcustomerSearch";

const toPay = ['pay', 'paid', 'none'];

const initialValues = {
  customerSearch: "",
  firstName: "",
  middleName: "",
  lastName: "",
  contactNumber: "",
  email: "",
  startStationName: null,
  endStation: null,
  locality: "",
  quotationDate: null,
  proposedDeliveryDate: null,
  fromCustomerName: "",
  fromAddress: "",
  fromState: "",
  fromCity: "",
  fromPincode: "",
  toCustomerName: "",
  toContactNumber: "",
  toAddress: "",
  toState: "",
  toCity: "",
  toPincode: "",
  amount: "",
  sgst: "",
  additionalCmt: "",
  productDetails: [
    {
      name: "",
      quantity: "",
      weight: "",
      price: "",
      insurance: "",
      vppAmount: "",
      topay: "none",
      receiptNo: "",
      refNo: "",
    },
  ],

  addComment: "",

  // Bilty Amount field add किया
  biltyAmount: "20",

  billTotal: "",

  manualInsurance: "",
  manualVpp: "",
  sTax: "",

  grandTotal: "",
  roundOff: "",
  finalTotal: "",
};

const QuotationForm = () => {
  const [senderCities, setSenderCities] = React.useState([]);
  const [receiverCities, setReceiverCities] = React.useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { states, cities } = useSelector((state) => state.location);
  const { list: stations } = useSelector((state) => state.stations);
  useEffect(() => {
    dispatch(fetchStates());
    dispatch(fetchStations());
  }, [dispatch]);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getDateBeforeDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  const toDateString = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const toLocalDateString = (date) => {
    if (!date) return null;

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`; // no timezone shift
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            setSubmitting(true);

            // Format product details
            const formattedProductDetails = values.productDetails.map(item => ({
              name: item.name,
              quantity: parseFloat(item.quantity) || 0,
              weight: parseFloat(item.weight) || 0,
              price: parseFloat(item.price) || 0,
              insurance: parseFloat(item.insurance) || 0,
              vppAmount: parseFloat(item.vppAmount) || 0,
              topay: item.topay,
              receiptNo: item.receiptNo || "",
              refNo: item.refNo || "",
            }));

            // Calculate ONLY product value (price × quantity) - NO insurance or VPP
            const totalProductValue = formattedProductDetails.reduce(
              (sum, item) => sum + item.price,
              0
            );

            // Calculate insurance and VPP separately
            const totalInsurance = formattedProductDetails.reduce((sum, item) =>
              sum + item.insurance, 0
            );
            const totalVppAmount = formattedProductDetails.reduce((sum, item) =>
              sum + item.vppAmount, 0
            );

            const biltyAmount = 20;

            // Bill Total = Product Value + Insurance + VPP + Bilty
            const billTotal = totalProductValue + totalInsurance + totalVppAmount + biltyAmount;

            // Tax calculation on product value only (not on insurance or VPP)
            const taxAmount = totalProductValue * ((parseFloat(values.sTax) || 0) / 100);
            const grandTotal = billTotal + taxAmount;

            const payload = {
              ...values,
              productDetails: formattedProductDetails,
              freight: biltyAmount,
              sTax: parseFloat(values.sTax) || 0,
              quotationDate: toLocalDateString(values.quotationDate),
              proposedDeliveryDate: toLocalDateString(values.proposedDeliveryDate),
              contactNumber: values.contactNumber,
              email: values.email,
              toContactNumber: values.toContactNumber || values.contactNumber,
            };

            await dispatch(createBooking(payload)).unwrap();
            resetForm();
            navigate('/quotation')
          } catch (error) {
            console.log("Error while adding booking", error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, handleChange, setFieldValue, isSubmitting }) => {
          const handleUpdate = (index) => {
            const item = values.productDetails[index];

            if (!item.No.OfParcel || !item.weightKgs || !item.amount) {
              setSnackbar({
                open: true,
                message: "Please fill all required fields for this item",
                severity: "error",
              });
              return;
            }
            setSnackbar({
              open: true,
              message: `Item ${index + 1} updated successfully!`,
              severity: "success",
            });
          };

          return (
            <Form>
              <EffectSyncCities values={values} dispatch={dispatch} setSenderCities={setSenderCities}
                setReceiverCities={setReceiverCities} />
              <EffectSyncTotal values={values} setFieldValue={setFieldValue} />
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mr: 2 }}
              >
                Back
              </Button>
              <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Edit Customer Quotation
                  </Typography>
                </Grid>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="Start Station"
                      name="startStationName"
                      value={values.startStationName}
                      onChange={handleChange}
                    >
                      {stations.map((station) => (
                        <MenuItem key={station.stationId || station.sNo} value={station.stationName}>
                          {station.stationName}

                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="Destination Station"
                      name="endStation"
                      value={values.endStation}
                      onChange={handleChange}
                    >
                      {stations.map((station) => (
                        <MenuItem key={station.stationId || station.sNo} value={station.stationName}>
                          {station.stationName}

                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid container columnSpacing={2} rowSpacing={2}>
                    <Grid xs={12} sm={6}>
                      <DatePicker
                        label="Booking Date"
                        value={values.quotationDate}
                        onChange={(val) => setFieldValue("quotationDate", val)}
                        minDate={getDateBeforeDays(7)}
                        format="dd/MM/yyyy"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            name: "quotationDate",
                            error: false,
                            InputProps: {
                              sx: { width: 490 }, // Increase height here
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <DatePicker
                        label="Proposed Delivery Date"
                        value={values.proposedDeliveryDate}
                        onChange={(val) =>
                          setFieldValue("proposedDeliveryDate", val)
                        }
                        minDate={values.quotationDate || getDateBeforeDays(7)}
                        format="dd/MM/yyyy"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            name: "proposedDeliveryDate",
                            error: false,
                            InputProps: {
                              sx: { width: 490 },
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6">From (Address)</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <QcustomerSearch
                      onCustomerSelect={(customer) => {
                        console.log("Quotation customer data", customer);
                        if (customer) {
                          setFieldValue("fromCustomerName", customer.name || "");
                          setFieldValue("fromAddress", customer.address || "");
                          setFieldValue("fromState", customer.state || "");
                          setFieldValue("fromCity", customer.city || "");
                          setFieldValue("fromPincode", customer.pincode || "");
                          setFieldValue("contactNumber", customer.contactNumber?.toString() || "");
                          setFieldValue("email", customer.emailId || "");
                        } else {
                          setFieldValue("fromCustomerName", "");
                          setFieldValue("fromAddress", "");
                          setFieldValue("fromState", "");
                          setFieldValue("fromCity", "");
                          setFieldValue("fromPincode", "");
                          setFieldValue("contactNumber", "");
                          setFieldValue("email", "");
                        }
                      }}
                    />
                  </Grid>


                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="fromCustomerName"
                      value={values.fromCustomerName}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Locality / Street"
                      name="fromAddress"
                      value={values.fromAddress}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="State"
                      name="fromState"
                      value={values.fromState}
                      onChange={handleChange}
                    >
                      {states.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="City"
                      name="fromCity"
                      value={values.fromCity}
                      onChange={handleChange}
                    >
                      {senderCities.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Pin Code"
                      name="fromPincode"
                      value={values.fromPincode}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Contact Number"
                      name="contactNumber"
                      value={values.contactNumber}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6">To (Address)</Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <QcustomerSearch
                      type="receiver"
                      onCustomerSelect={(customer) => {
                        console.log("Selected To Customer:", customer);
                        if (customer) {
                          setFieldValue("toCustomerName", customer.name || "");
                          setFieldValue("toAddress", customer.address || "");
                          setFieldValue("toState", customer.state || "");
                          setFieldValue("toCity", customer.city || "");
                          setFieldValue("toPincode", customer.pincode || "");
                          setFieldValue("toContactNumber", customer.contactNumber?.toString() || "");
                          setFieldValue("toEmail", customer.emailId || "");
                        } else {
                          setFieldValue("toCustomerName", "");
                          setFieldValue("toAddress", "");
                          setFieldValue("toState", "");
                          setFieldValue("toCity", "");
                          setFieldValue("toPincode", "");
                          setFieldValue("toContactNumber", "");
                          setFieldValue("toEmail", "");
                        }
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="toCustomerName"
                      value={values.toCustomerName}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Locality / Street"
                      name="toAddress"
                      value={values.toAddress}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="State"
                      name="toState"
                      value={values.toState}
                      onChange={handleChange}
                    >
                      {states.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="City"
                      name="toCity"
                      value={values.toCity}
                      onChange={handleChange}
                    >
                      {receiverCities.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Pin Code"
                      name="toPincode"
                      value={values.toPincode}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Contact Number"
                      name="toContactNumber"
                      value={values.toContactNumber || ""}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Email"
                      name="toEmail"
                      value={values.toEmail || ""}
                      onChange={handleChange}
                    />
                  </Grid>


                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6">Product Details</Typography>
                  </Grid>

                  <FieldArray name="productDetails">
                    {({ push, remove, form }) => (
                      <>
                        {form.values.productDetails.map((item, index) => (
                          <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                            {/* Receipt No */}
                            <Grid size={{ xs: 12, md: 2 }}>
                              <Field
                                name={`productDetails[${index}].receiptNo`}
                                as={TextField}
                                label="Receipt No."
                                fullWidth
                                size="small"
                              />
                            </Grid>

                            {/* Ref No */}
                            <Grid size={{ xs: 12, md: 2 }}>
                              <Field
                                name={`productDetails[${index}].refNo`}
                                as={TextField}
                                label="Ref No."
                                fullWidth
                                size="small"
                              />
                            </Grid>

                            {/* Product Name */}
                            <Grid size={{ xs: 12, md: 3 }}>
                              <Field
                                name={`productDetails[${index}].name`}
                                as={TextField}
                                label="Product Name"
                                fullWidth
                                size="small"
                              />
                            </Grid>

                            {/* Quantity */}
                            <Grid size={{ xs: 12, md: 1.5 }}>
                              <Field
                                name={`productDetails[${index}].quantity`}
                                as={TextField}
                                label="Quantity"
                                type="number"
                                fullWidth
                                size="small"
                              />
                            </Grid>

                            {/* Weight (kg) */}
                            <Grid size={{ xs: 12, md: 1.5 }}>
                              <Field
                                name={`productDetails[${index}].weight`}
                                as={TextField}
                                label="Weight (kg)"
                                type="number"
                                fullWidth
                                size="small"
                              />
                            </Grid>

                            {/* Insurance */}
                            <Grid size={{ xs: 12, md: 1.5 }}>
                              <Field
                                name={`productDetails[${index}].insurance`}
                                as={TextField}
                                label="Insurance"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                              />
                            </Grid>

                            {/* VPP Amount */}
                            <Grid size={{ xs: 12, md: 1.5 }}>
                              <Field
                                name={`productDetails[${index}].vppAmount`}
                                as={TextField}
                                label="VPP Amount"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                              />
                            </Grid>

                            {/* Price */}
                            <Grid size={{ xs: 12, md: 1.5 }}>
                              <Field
                                name={`productDetails[${index}].price`}
                                as={TextField}
                                label="Price"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                              />
                            </Grid>

                            {/* Payment Status */}
                            <Grid size={{ xs: 12, md: 2 }}>
                              <Field
                                name={`productDetails[${index}].topay`}
                                as={TextField}
                                select
                                label="Payment"
                                fullWidth
                                size="small"
                              >
                                <MenuItem value="paid">Paid</MenuItem>
                                <MenuItem value="toPay">To Pay</MenuItem>
                                <MenuItem value="none">None</MenuItem>
                              </Field>
                            </Grid>

                            {/* Remove Button */}
                            <Grid size={{ xs: 12, md: 1 }}>
                              <IconButton
                                onClick={() => remove(index)}
                                fullWidth
                                color="error"
                                size="small"
                                sx={{ border: '1px solid', borderColor: 'error.main' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Grid>

                            {/* Add Button (only for first row) */}
                            {index === 0 && (
                              <Grid item xs={12}>
                                <Button
                                  type="button"
                                  onClick={() =>
                                    push({
                                      receiptNo: "",
                                      refNo: "",
                                      name: "",
                                      quantity: "",
                                      weight: "",
                                      insurance: "",
                                      vppAmount: "",
                                      price: "",
                                      topay: "none",
                                    })
                                  }
                                  startIcon={<AddIcon />}
                                  variant="outlined"
                                  fullWidth
                                  sx={{ mt: 1 }}
                                >
                                  Add Item
                                </Button>
                              </Grid>
                            )}
                          </Grid>
                        ))}

                        {/* Add Item button for when there are no items */}
                        {form.values.productDetails.length === 0 && (
                          <Grid item xs={12}>
                            <Button
                              type="button"
                              onClick={() =>
                                push({
                                  receiptNo: "",
                                  refNo: "",
                                  name: "",
                                  quantity: "",
                                  weight: "",
                                  insurance: "",
                                  vppAmount: "",
                                  price: "",
                                  topay: "none",
                                })
                              }
                              startIcon={<AddIcon />}
                              variant="outlined"
                              fullWidth
                            >
                              Add Item
                            </Button>
                          </Grid>
                        )}
                      </>
                    )}
                  </FieldArray>

                  <Grid size={{ xs: 12, md: 12 }}>
                    <TextField
                      name="comments"
                      label="Additional Comments"
                      multiline
                      minRows={10}
                      fullWidth
                      value={values.comments}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>

                  {/* Totals Section */}
                  <Grid container spacing={2}>
                    {/* Product Value (Only price × quantity) */}

                    <Grid size={{ xs: 12, md: 2 }}>
                      <TextField
                        name="manualInsurance"
                        label="Insurance"
                        value={values.manualInsurance || ""}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                      <TextField
                        name="manualVpp"
                        label="VPP Amount"
                        value={values.manualVpp || ""}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        fullWidth
                      />
                    </Grid>

                    {/* Bilty Amount */}
                    <Grid size={{ xs: 12, md: 2 }}>
                      <TextField
                        name="biltyAmount"
                        label="Bilty Amount"
                        value="20"
                        InputProps={{
                          readOnly: true,
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        fullWidth
                      />
                    </Grid>

                    {/* Bill Total (Product Value + Insurance + VPP + Bilty) */}
                    <Grid size={{ xs: 12, md: 2 }}>
                      <TextField
                        name="billTotal"
                        label="Bill Total"
                        value={values.billTotal}
                        InputProps={{
                          readOnly: true,
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        fullWidth
                      />
                    </Grid>

                    {/* Tax % */}
                    <Grid size={{ xs: 12, md: 2 }}>
                      <TextField
                        name="sTax"
                        label="Tax %"
                        value={values.sTax}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setFieldValue("sTax", isNaN(value) ? 0 : value);
                        }}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                      <TextField
                        name="roundOff"
                        label="Round Off"
                        value={values.roundOff}
                        InputProps={{
                          readOnly: true,
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                      <TextField
                        name="finalTotal"
                        label="Final Total"
                        value={values.finalTotal}
                        InputProps={{
                          readOnly: true,
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      sx={{
                        height: 50,
                        position: 'relative',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'primary.main',
                          opacity: 0.9,
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                        >
                          {[0, 1, 2].map((i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: 'common.white',
                                animation: 'pulse 1.4s infinite ease-in-out',
                                animationDelay: `${i * 0.16}s`,
                                '@keyframes pulse': {
                                  '0%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                                  '50%': { opacity: 1, transform: 'scale(1.2)' },
                                }
                              }}
                            />
                          ))}
                          <Typography
                            component="span"
                            sx={{
                              ml: 1.5,
                              color: 'common.white',
                              opacity: 0.9
                            }}
                          >
                            Processing...
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircle sx={{ mr: 1, fontSize: '1.2rem' }} />
                          Submit Booking
                        </Box>
                      )}
                    </Button>

                  </Grid>
                </Grid>
              </Box>

              <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
              >
                <Alert
                  onClose={handleCloseSnackbar}
                  severity={snackbar.severity}
                  sx={{ width: "100%" }}
                >
                  {snackbar.message}
                </Alert>
              </Snackbar>
            </Form>
          );
        }}
      </Formik>
    </LocalizationProvider>
  );
};

const EffectSyncCities = ({ values, dispatch, setSenderCities, setReceiverCities }) => {
  useEffect(() => {
    if (values.fromState) {
      dispatch(fetchCities(values.fromState))
        .unwrap()
        .then((res) => setSenderCities(res))
        .catch(console.error);
    } else {
      setSenderCities([]);
    }
  }, [values.fromState, dispatch]);

  useEffect(() => {
    if (values.toState) {
      dispatch(fetchCities(values.toState))
        .unwrap()
        .then((res) => setReceiverCities(res))
        .catch(console.error);
    } else {
      setReceiverCities([]);
    }
  }, [values.toState, dispatch]);

  return null;
};

const EffectSyncTotal = ({ values, setFieldValue }) => {
  useEffect(() => {
    const biltyAmount = 20;

    // ✅ 1. Product price ka total (sirf price)
    const productTotal = values.productDetails.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0),
      0
    );

    // ✅ 2. Bottom se insurance / vpp (optional)
    const manualInsurance = parseFloat(values.manualInsurance) || 0;
    const manualVpp = parseFloat(values.manualVpp) || 0;

    // ✅ 3. Bill Total
    const billTotal =
      productTotal + manualInsurance + manualVpp + biltyAmount;

    // ✅ 4. Tax sirf product value par
    const taxPercent = parseFloat(values.sTax) || 0;
    const taxAmount = (productTotal * taxPercent) / 100;

    // ✅ 5. Final total
    const finalTotal = billTotal + taxAmount;

    setFieldValue("biltyAmount", biltyAmount.toFixed(2));
    setFieldValue("billTotal", billTotal.toFixed(2));
    setFieldValue("grandTotal", finalTotal.toFixed(2));
    setFieldValue("roundOff", "0.00");
    setFieldValue("finalTotal", finalTotal.toFixed(2));
    setFieldValue("amount", productTotal.toFixed(2)); // optional
  }, [
    values.productDetails,
    values.manualInsurance,
    values.manualVpp,
    values.sTax,
    setFieldValue,
  ]);
};



export default QuotationForm;