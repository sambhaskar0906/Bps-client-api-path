import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { WHATSAPP_API } from '../../utils/api';

// Async thunk
export const sendWhatsappMessage = createAsyncThunk(
    "whatsapp/sendMessage",
    async ({ to, message }, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const token = state.users?.token || localStorage.getItem("token"); // adjust auth logic

            const res = await axios.post(
                `${WHATSAPP_API}/send`,
                { to, message },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 🔥 Booking Confirmation WhatsApp
export const sendBookingConfirmWhatsapp = createAsyncThunk(
    "whatsapp/sendBookingConfirm",
    async (bookingId, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const token = state.users?.token || localStorage.getItem("token");

            const res = await axios.post(
                `${WHATSAPP_API}/booking-confirm`,
                { bookingId },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 🔥 Send Bilty PDF on WhatsApp
export const sendWhatsappBilty = createAsyncThunk(
    "whatsapp/sendBilty",
    async ({ bookingId, biltyBlob }, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const token = state.users?.token || localStorage.getItem("token");

            const formData = new FormData();
            formData.append(
                "bilty",
                biltyBlob,
                `Bilty_${bookingId}.pdf`
            );
            formData.append("bookingId", bookingId);

            const res = await axios.post(
                `${WHATSAPP_API}/send-bilty`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 🔥 Booking WhatsApp (TEXT ONLY)
export const sendBookingWhatsappText = createAsyncThunk(
    "whatsapp/sendBookingText",
    async (bookingId, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const token =
                state.users?.token || localStorage.getItem("token");

            const res = await axios.post(
                `${WHATSAPP_API}/booking-text`,
                { bookingId },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || err.message
            );
        }
    }
);

// 🔥 Booking WhatsApp (PDF + TEMPLATE)
export const sendBookingWhatsappPdf = createAsyncThunk(
    "whatsapp/sendBookingPdf",
    async ({ bookingId, pdfBlob }, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const token =
                state.users?.token || localStorage.getItem("token");

            const formData = new FormData();
            formData.append(
                "bilty",
                pdfBlob,
                `Booking_${bookingId}.pdf`
            );
            formData.append("bookingId", bookingId);

            const res = await axios.post(
                `${WHATSAPP_API}/booking-pdf`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || err.message
            );
        }
    }
);

const whatsappSlice = createSlice({
    name: "whatsapp",
    initialState: {
        loading: false,
        success: false,
        error: null,
        response: null
    },
    reducers: {
        resetWhatsappState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
            state.response = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendWhatsappMessage.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(sendWhatsappMessage.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.response = action.payload;
            })
            .addCase(sendWhatsappMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            // 🔥 Booking Confirm
            .addCase(sendBookingConfirmWhatsapp.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(sendBookingConfirmWhatsapp.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.response = action.payload;
            })
            .addCase(sendBookingConfirmWhatsapp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            // 🔥 Send Bilty
            .addCase(sendWhatsappBilty.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(sendWhatsappBilty.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.response = action.payload;
            })
            .addCase(sendWhatsappBilty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            // 🔥 Booking TEXT
            .addCase(sendBookingWhatsappText.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(sendBookingWhatsappText.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.response = action.payload;
            })
            .addCase(sendBookingWhatsappText.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })

            // 🔥 Booking PDF
            .addCase(sendBookingWhatsappPdf.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(sendBookingWhatsappPdf.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.response = action.payload;
            })
            .addCase(sendBookingWhatsappPdf.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });

    }
});

export const { resetWhatsappState } = whatsappSlice.actions;
export default whatsappSlice.reducer;
