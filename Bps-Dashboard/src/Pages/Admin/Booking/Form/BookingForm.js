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
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from 'react-redux';
import { fetchStates, fetchCities, clearCities } from '../../../../features/Location/locationSlice';
import { fetchStations } from '../../../../features/stations/stationSlice'
import { createBooking, previewBookingReceiptNo } from '../../../../features/booking/bookingSlice';
import { addOption } from "../../../../features/addOptionsSlice/addOptionsSlice";
import { useNavigate } from "react-router-dom";
import CustomerSearch from "../../../../Components/CustomerSearch";
import { ArrowBack } from '@mui/icons-material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { useFormikContext } from "formik";

const toPay = ['toPay', 'paid', 'none'];

const ReceiptPreviewSync = ({ receiptPreview }) => {
  const { values, setFieldValue } = useFormikContext();

  useEffect(() => {
    if (!receiptPreview) return;

    values.items.forEach((item, index) => {
      if (!item.receiptNo) {
        setFieldValue(`items[${index}].receiptNo`, receiptPreview);
      }
    });
  }, [receiptPreview, values.items.length, setFieldValue]);

  return null;
};

const generateInitialValues = () => {

  return {
    startStation: "",
    endStation: "",
    bookingDate: null,
    deliveryDate: null,
    contactNumber: "",
    receiverContact: "",
    customerSearch: "",
    firstName: "",
    middleName: "",
    lastName: "",
    mobile: "",
    email: "",
    senderName: "",
    senderLocality: "",
    fromCity: "",
    senderGgt: "",
    fromState: "",
    senderPincode: "",
    receiverName: "",
    receiverLocality: "",
    receiverGgt: "",
    toState: "",
    toCity: "",
    toPincode: "",
    items: [
      {
        receiptNo: "",
        refNo: "",
        quantity: "",
        insurance: "",
        vppAmount: "",
        toPay: "",
        // toPayPaid: "",
        weight: "",
        perKg: "",
        amount: "",
      },
    ],
    addComment: "",
    freight: "",
    ins_vpp: "",
    billTotal: "",
    biltyAmount: "20",
    cgst: "",
    sgst: "",
    igst: "",
    grandTotal: "",
    roundOff: "",
  };
};
const totalFields = [
  { name: "freight", label: "FREIGHT", readOnly: true },
  { name: "ins_vpp", label: "INS/VPP", readOnly: false },
  { name: "billTotal", label: "Bill Total", readOnly: true },
  { name: "cgst", label: "CGST%", readOnly: false },
  { name: "sgst", label: "SGST%", readOnly: false },
  { name: "igst", label: "IGST%", readOnly: false },
  { name: "grandTotal", label: "Grand Total", readOnly: true },
  { name: "roundOff", label: "Round Off", readOnly: true },
  { name: "biltyAmount", label: "BILTY AMOUNT", readOnly: true },
];
const calculateTotals = (values) => {
  const items = values.items || [];

  const biltyAmount = 20;

  const itemTotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const freight = Number(values.freight || itemTotal);
  const ins_vpp = Number(values.ins_vpp || 0);
  const taxableAmount = freight + ins_vpp;
  const billTotal = taxableAmount + biltyAmount;

  const cgst = (Number(values.cgst || 0) / 100) * taxableAmount;
  const sgst = (Number(values.sgst || 0) / 100) * taxableAmount;
  const igst = (Number(values.igst || 0) / 100) * taxableAmount;

  let grandTotal = billTotal + cgst + sgst + igst;

  // --- Round Off Calculation ---
  const roundedGrandTotal = Math.round(grandTotal); // round to nearest whole number
  const roundOff = (roundedGrandTotal - grandTotal).toFixed(2);

  grandTotal = roundedGrandTotal; // update grand total to rounded value

  return {
    billTotal: billTotal.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
    computedTotalRevenue: grandTotal.toFixed(2),
    cgst: cgst.toFixed(2),
    sgst: sgst.toFixed(2),
    igst: igst.toFixed(2),
    roundOff,
    biltyAmount: biltyAmount.toFixed(2),
    autoFreight: itemTotal.toFixed(2)
  };
};


const BookingForm = () => {
  const [senderCities, setSenderCities] = React.useState([]);
  const [receiverCities, setReceiverCities] = React.useState([]);
  const [addingCity, setAddingCity] = React.useState(false);
  const [newReceiverCity, setNewReceiverCity] = React.useState("");
  const [newSenderCity, setNewSenderCity] = React.useState("");

  const dispatch = useDispatch();
  const { states, cities } = useSelector((state) => state.location);
  const { list: stations } = useSelector((state) => state.stations);
  const navigate = useNavigate();
  const { createStatus, createError, receiptPreview } = useSelector((state) => state.bookings);

  const handleAddCity = async ({ forType, stateName, cityName, resetFn, setFieldValue }) => {
    // basic validation
    if (!stateName) {
      alert("Please select a state first.");
      return;
    }
    const trimmed = cityName?.trim();
    if (!trimmed) {
      alert("Please enter a city name.");
      return;
    }

    try {
      setAddingCity(true);

      // DEBUG: show what we will send
      console.log("handleAddCity: stateName =", JSON.stringify(stateName), "cityName =", trimmed);

      const payload = { field: "city", fieldName: "city", name: trimmed, value: trimmed, state: stateName };
      console.log("handleAddCity payload:", payload);

      // call addOption
      const addRes = await dispatch(addOption(payload)).unwrap();
      console.log("addOption response:", addRes);

      // try to extract created city name from response robustly
      // your server's response earlier showed addRes.data.value === "Ghaziabad"
      const createdName =
        addRes?.data?.value ??
        addRes?.value ??
        addRes?.data ??
        (typeof addRes === "string" ? addRes : null) ??
        trimmed;

      console.log("Created city resolved as:", createdName);

      // Re-fetch cities from server for the given state (to keep canonical list)
      const fetchRes = await dispatch(fetchCities(stateName)).unwrap();
      console.log("fetchCities result:", fetchRes);

      // normalize fetch result to an array
      const fetchedCities = Array.isArray(fetchRes) ? fetchRes : (fetchRes?.data || []);
      console.log("Normalized fetchedCities:", fetchedCities);

      // update the correct local array and ensure createdName is present (case-insensitive dedupe)
      const addIfMissing = (arr, name) => {
        const found = arr.find(c => String(c).toLowerCase() === String(name).toLowerCase());
        if (found) return arr; // already present
        return [...arr, name];
      };

      if (forType === "sender") {
        const updated = addIfMissing(fetchedCities, createdName);
        setSenderCities(updated);
        setFieldValue("fromCity", createdName);
      } else {
        const updated = addIfMissing(fetchedCities, createdName);
        setReceiverCities(updated);
        setFieldValue("toCity", createdName);
      }

      resetFn && resetFn("");
      // small success message
      console.log("City added & selected:", createdName);
    } catch (err) {
      console.error("Failed to add city:", err);
      const message = err?.message || err?.data?.message || JSON.stringify(err) || "Failed to add city";
      alert(message);
    } finally {
      setAddingCity(false);
    }
  };

  useEffect(() => {
    dispatch(previewBookingReceiptNo());
  }, [dispatch]);


  useEffect(() => {
    dispatch(fetchStates());
    dispatch(fetchStations());
  }, [dispatch]);
  const getDateBeforeDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  const EffectSyncPaymentGST = ({ values, setFieldValue }) => {
    useEffect(() => {
      const payments = values.items.map(i => i.toPay);

      // if any item is toPay → treat booking as toPay
      if (payments.includes("toPay")) {
        setFieldValue("igst", "18");
        setFieldValue("cgst", "0");
        setFieldValue("sgst", "0");
        return;
      }

      // if paid (and no toPay)
      if (payments.includes("paid")) {
        setFieldValue("igst", "0");
        setFieldValue("cgst", "9");
        setFieldValue("sgst", "9");
        return;
      }

      // none or empty
      setFieldValue("igst", "0");
      setFieldValue("cgst", "0");
      setFieldValue("sgst", "0");

    }, [values.items, setFieldValue]);

    return null;
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Formik
        initialValues={generateInitialValues()}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            setSubmitting(true);

            // ✅ Clean payload (remove perKg)
            const payload = {
              ...values,
              items: values.items.map(({ perKg, ...rest }) => rest),
            };

            // ✅ API CALL (unwrap gives real success or throws)
            const res = await dispatch(createBooking(payload)).unwrap();

            // ✅ SUCCESS
            alert("✅ Booking successfully created");

            // ✅ RESET FORM FIRST
            resetForm();

            // ✅ NAVIGATE (safe micro delay)
            setTimeout(() => {
              navigate("/booking");
            }, 0);

          } catch (error) {
            console.error("Booking failed:", error);

            // ✅ unwrap() safe error handling
            alert(
              typeof error === "string"
                ? error
                : error?.message || "❌ Booking failed, please try again"
            );
          } finally {
            setSubmitting(false);
          }
        }}

      >
        {({ values, handleChange, setFieldValue, isSubmitting }) => {
          return (
            <Form>
              <ReceiptPreviewSync receiptPreview={receiptPreview} />
              <EffectSyncCities
                values={values}
                dispatch={dispatch}
                setSenderCities={setSenderCities}
                setReceiverCities={setReceiverCities}
              />
              <EffectSyncPaymentGST values={values} setFieldValue={setFieldValue} />
              <EffectSyncTotals values={values} setFieldValue={setFieldValue} />
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mr: 2 }}
              >
                Back
              </Button>
              {/* ... all your form fields go here ... */}
              <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="Start Station"
                      name="startStation"
                      value={values.startStation}
                      onChange={handleChange}
                    >
                      {stations.map((station) => (
                        <MenuItem key={station.stationId || station.sNo} value={station.stationName}>
                          {station.stationName}
                        </MenuItem>
                      ))}

                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
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

                  <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DatePicker
                        label="Booking Date"
                        value={values.bookingDate}
                        onChange={(val) => setFieldValue("bookingDate", val)}
                        minDate={getDateBeforeDays(11)}
                        format="dd/MM/yyyy"
                        renderInput={(params) => (
                          <TextField fullWidth {...params} name="bookingDate" />
                        )}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            name: "bookingDate",
                            error: false,
                            InputProps: {
                              sx: { width: 495 },
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DatePicker
                        label="Proposed Delivery Date"
                        value={values.deliveryDate}
                        onChange={(val) => setFieldValue("deliveryDate", val)}
                        minDate={values.bookingDate || getDateBeforeDays(11)}
                        format="dd/MM/yyyy"
                        renderInput={(params) => (
                          <TextField fullWidth {...params} name="deliveryDate" />
                        )}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            name: "deliveryDate",
                            error: false,
                            InputProps: {
                              sx: { width: 495 },
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
                    <CustomerSearch
                      type="sender"
                      onCustomerSelect={(customer) => {
                        if (customer) {
                          setFieldValue("senderName", customer.name || "");
                          setFieldValue("senderGgt", customer.gstNumber || "");
                          setFieldValue("senderLocality", customer.address || "");
                          setFieldValue("fromState", customer.state || "");
                          setFieldValue("fromCity", customer.city || "");
                          setFieldValue("senderPincode", customer.pincode || "");
                          setFieldValue("contactNumber", customer.contactNumber?.toString() || "");
                          setFieldValue("email", customer.emailId || "");
                        } else {
                          setFieldValue("senderName", "");
                          setFieldValue("senderGgt", "");
                          setFieldValue("senderLocality", "");
                          setFieldValue("fromState", "");
                          setFieldValue("fromCity", "");
                          setFieldValue("senderPincode", "");
                          setFieldValue("contactNumber", "");
                          setFieldValue("email", "");
                        }
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Name"
                      name="senderName"
                      value={values.senderName || ""}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="GST Number"
                      name="senderGgt"
                      value={values.senderGgt}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Locality / Street"
                      name="senderLocality"
                      value={values.senderLocality}
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

                    {/* Add new city for sender */}
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Add new city for selected state"
                        value={newSenderCity}
                        onChange={(e) => setNewSenderCity(e.target.value)}
                        disabled={addingCity}
                      />
                      <Button
                        variant="contained"
                        onClick={() => handleAddCity({
                          forType: "sender",
                          stateName: values.fromState,
                          cityName: newSenderCity,
                          resetFn: setNewSenderCity,
                          setFieldValue
                        })}
                        disabled={addingCity}
                      >
                        Add
                      </Button>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Pin Code"
                      name="senderPincode"
                      value={values.senderPincode}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Contact Number"
                      name="contactNumber"
                      value={values.contactNumber || ""}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
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
                    <CustomerSearch
                      type="receiver"
                      onCustomerSelect={(customer) => {
                        if (customer) {
                          setFieldValue("receiverName", customer.name || "");
                          setFieldValue("receiverGgt", customer.gstNumber || "");
                          setFieldValue("receiverLocality", customer.address || "");
                          setFieldValue("toState", customer.state || "");
                          setFieldValue("toCity", customer.city || "");
                          setFieldValue("toPincode", customer.pincode || "");
                          setFieldValue("receiverContact", customer.contactNumber?.toString() || "");
                          setFieldValue("receiverEmail", customer.emailId || "");
                        } else {
                          setFieldValue("receiverName", "");
                          setFieldValue("receiverGgt", "");
                          setFieldValue("receiverLocality", "");
                          setFieldValue("toState", "");
                          setFieldValue("toCity", "");
                          setFieldValue("toPincode", "");
                          setFieldValue("receiverContact", "");
                          setFieldValue("receiverEmail", "");
                        }
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="receiverName"
                      value={values.receiverName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="GST Number"
                      name="receiverGgt"
                      value={values.receiverGgt}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Locality / Street"
                      name="receiverLocality"
                      value={values.receiverLocality}
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

                    {/* Add new city for receiver */}
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Add new city for selected state"
                        value={newReceiverCity}
                        onChange={(e) => setNewReceiverCity(e.target.value)}
                        disabled={addingCity}
                      />
                      <Button
                        variant="contained"
                        onClick={() => handleAddCity({
                          forType: "receiver",
                          stateName: values.toState,
                          cityName: newReceiverCity,
                          resetFn: setNewReceiverCity,
                          setFieldValue
                        })}
                        disabled={addingCity}
                      >
                        Add
                      </Button>
                    </Box>
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
                      name="receiverContact"
                      value={values.receiverContact || ""}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Email"
                      name="receiverEmail"
                      value={values.receiverEmail || ""}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6">Product Details</Typography>
                  </Grid>
                  <FieldArray name="items">
                    {({ push, remove }) => (
                      <>
                        {values.items.map((_, index) => (
                          <Grid
                            container
                            spacing={2}
                            key={index}
                            alignItems="center"
                            sx={{ mb: 2 }}
                          >
                            <Grid size={{ xs: 0.5 }}>
                              <Typography>{index + 1}.</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Receipt No"
                                value={values.items[index].receiptNo}
                                InputProps={{ readOnly: true }}
                              />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                              <Field
                                as={TextField}
                                fullWidth
                                size="small"
                                label="Ref No"
                                name={`items[${index}].refNo`}
                              />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                              <Field
                                as={TextField}
                                fullWidth
                                size="small"
                                label="Quantity"
                                type="number"
                                name={`items[${index}].quantity`}
                              />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                              <Field
                                as={TextField}
                                fullWidth
                                size="small"
                                label="Insurance"
                                name={`items[${index}].insurance`}
                              />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                              <Field
                                as={TextField}
                                fullWidth
                                size="small"
                                label="VPP Amount"
                                name={`items[${index}].vppAmount`}
                              />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Weight"
                                type="number"
                                value={values.items[index].weight}
                                onChange={(e) => {
                                  const weight = Number(e.target.value || 0);
                                  const perKg = Number(values.items[index].perKg || 0);

                                  setFieldValue(`items[${index}].weight`, e.target.value);
                                  setFieldValue(
                                    `items[${index}].amount`,
                                    (weight * perKg).toFixed(2)
                                  );
                                }}
                              />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Per Kg"
                                type="number"
                                value={values.items[index].perKg}
                                onChange={(e) => {
                                  const perKg = Number(e.target.value || 0);
                                  const weight = Number(values.items[index].weight || 0);

                                  setFieldValue(`items[${index}].perKg`, e.target.value);
                                  setFieldValue(
                                    `items[${index}].amount`,
                                    (weight * perKg).toFixed(2)
                                  );
                                }}
                              />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Amount"
                                value={values.items[index].amount}
                                InputProps={{ readOnly: true }}
                              />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                              <TextField
                                select
                                fullWidth
                                size="small"
                                label="Payment"
                                name={`items[${index}].toPay`}
                                value={values.items[index].toPay}
                                onChange={handleChange}
                              >
                                {toPay.map((p) => (
                                  <MenuItem key={p} value={p}>
                                    {p}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3, md: 1 }}>
                              <Button
                                color="error"
                                onClick={() => remove(index)}
                                variant="outlined"
                                fullWidth
                              >
                                Remove
                              </Button>
                            </Grid>
                            {/* <Grid size={{ xs: 6, sm: 3, md: 3 }}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Total Parcels"
                              name="totalParcels"
                              value={values.totalParcels}
                              onChange={handleChange}
                              inputProps={{ min: 1 }}
                            />
                          </Grid> */}
                          </Grid>
                        ))}

                        <Grid size={{ xs: 12 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() =>
                              push({
                                receiptNo: receiptPreview || "",
                                refNo: "",
                                quantity: "",
                                insurance: "",
                                vppAmount: "",
                                toPayPaid: "",
                                weight: "",
                                perKg: "",
                                amount: "",
                              })
                            }
                          >
                            + Add Item
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                      name="addComment"
                      label="Additional addComment"
                      multiline
                      minRows={10}
                      fullWidth
                      value={values.addComment}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Grid container spacing={2}>
                      {totalFields.map(({ name, label, readOnly }) => (
                        <Grid size={{ sm: 6 }} key={name}>
                          <TextField
                            name={name}
                            label={label}
                            value={values[name]}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            InputProps={{
                              readOnly: readOnly,
                              ...(label.includes("%") && {
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }),
                            }}
                          />
                        </Grid>
                      ))}
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
            </Form>
          )
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
const EffectSyncTotals = ({ values, setFieldValue }) => {
  useEffect(() => {
    const totals = calculateTotals(values);
    const itemTotal = values.items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    if (!values.freight || values.freight === "0" || Number(values.freight) !== itemTotal) {
      setFieldValue("freight", totals.autoFreight);
    }
    setFieldValue("billTotal", totals.billTotal);
    setFieldValue("grandTotal", totals.grandTotal);
    setFieldValue("roundOff", totals.roundOff);
    setFieldValue("biltyAmount", totals.biltyAmount);
  }, [
    values.items,
    values.freight,
    values.ins_vpp,
    values.cgst,
    values.sgst,
    values.igst,
    setFieldValue
  ]);


  return null;
};



export default BookingForm;