import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BOOKINGS_API, WHATSAPP_API } from '../../utils/api';

const BASE_URL = BOOKINGS_API

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const createBooking = createAsyncThunk(

  'bookings/createBooking', async (data, { rejectWithValue }) => {
    console.log('Data being sent to create booking:', data);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(`${BASE_URL}`, data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      return res.data.booking
    }
    catch (err) {
      console.log('Error creating booking:', err.response?.data?.message || err.message);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
)
export const deleteBooking = createAsyncThunk(
  '/booking/deleteBooking', async (bookingId, thunkApi) => {
    try {
      const res = await axios.delete(`${BASE_URL}/${bookingId}`)
      return bookingId;
    }
    catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to delete the booking");
    }
  }
)
export const bookingRequestCount = createAsyncThunk(
  'booking/bookingRequestCount', async (_, thunkApi) => {
    try {
      const res = await axios.get(`${BASE_URL}/booking-list?type='request`)
      return { requestCount: res.data.count }
    }
    catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed To fetch Booking request count");
    }
  }
)
export const activeBookingCount = createAsyncThunk(
  'booking/activeCount', async (_, thunkApi) => {
    try {
      const res = await axios.get(`${BASE_URL}/bookings/count/active`)
      return { activeDeliveries: res.data.activeDeliveries }
    }
    catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed To Active Deliveries count");
    }
  }
)
export const cancelledBookingCount = createAsyncThunk(
  'booking.cancelledCount', async (_, thunkApi) => {
    try {
      const res = await axios.get(`${BASE_URL}/bookings/count/cancelled`)
      return { cancelledCount: res.data.cancelledCount }
    }
    catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed To Cancelled Booking  count");
    }
  }
)
export const fetchBookingsByType = createAsyncThunk(
  'bookings/fetchByType',
  async (type, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/booking-list?type=${type}`);
      return { type, data: response.data.data };
    } catch (err) {
      return rejectWithValue({ type, error: err.response?.data?.message || err.message });
    }
  }
);
export const viewBookingById = createAsyncThunk(
  '/booking/viewBookingById', async (bookingId, thunkApi) => {
    try {
      console.log("booking", bookingId);
      const res = await axios.get(`${BASE_URL}/${bookingId}`)
      console.log("booking", res)
      return res.data;
    }
    catch (err) {
      return thunkApi.rejectWithValue(err.response?.data?.message || 'f');
    }

  }
)
export const updateBookingById = createAsyncThunk(
  'booking/update', async ({ bookingId, data }, thunkApi) => {
    try {

      const res = await axios.put(`${BASE_URL}/${bookingId}`, data)
      return res.data;
    }
    catch (err) {
      return thunkApi.rejectWithValue(err.response?.data?.message || 'failed to update booking')
    }
  }
)
export const revenueList = createAsyncThunk(
  'revenueList/booking', async (_, thunkApi) => {
    try {
      const res = await axios.get(`${BASE_URL}/revenue-list`);
      return {
        totalRevenue: res.data.totalRevenue,
        revenueList: res.data.data
      }
    }
    catch (err) {
      return thunkApi.rejectWithValue(err.response?.data?.message || 'failed to view totalReveunue')
    }
  }

)
export const cancelBooking = createAsyncThunk(
  'cancel/booking', async (bookingId, thunkApi) => {
    try {
      const res = await axios.patch(`${BASE_URL}/${bookingId}/cancel`)
      return res.data.booking;

    }
    catch (err) {
      return thunkApi.rejectWithValue(err.response?.data?.message);
    }
  }
)
export const sendWhatsAppMsg = createAsyncThunk(
  'sendMsg/sendWhatsApp', async (bookingId, thunkApi) => {
    try {
      const res = await axios.post(`${WHATSAPP_API}/send-booking/${bookingId}`);
      return res.data;
    }
    catch (err) {
      return thunkApi.rejectWithValue(err.response?.data?.message);
    }
  }
)
export const sendEmail = createAsyncThunk(
  'sendEmail/booking', async (bookingId, thunkApi) => {
    try {
      const res = await axios.post(`${BASE_URL}/send-booking-email/${bookingId}`)
      return res.data;
    }
    catch (err) {
      return thunkApi.rejectWithValue(err.response?.data?.message);
    }
  }
)
export const pendingList = createAsyncThunk(
  'thirdParty/booking', async (_, thunkApi) => {
    try {
      const res = await axios.get(`${BASE_URL}/pending`);
      return res.data.bookings;
    }
    catch (err) {
      return thunkApi.rejectWithValue(err.response?.data?.message);
    }
  }
)
export const approveList = createAsyncThunk(
  'aproveThirdParty/booking', async (bookingId, thunkApi) => {
    try {
      const res = await axios.patch(`${BASE_URL}/${bookingId}/approve`);
      return res.data.booking
    }
    catch (err) {
      return thunkApi.rejectWithValue(err.response?.data?.message);
    }
  }
)
export const rejectThridParty = createAsyncThunk(
  'rejectThridParty/thirdParty', async (bookingId, thunkApi) => {
    try {
      const res = await axios.patch(`${BASE_URL}/reject/${bookingId}`)
      return bookingId;
    }
    catch (err) {
      return thunkApi.rejectWithValue(err.response?.data?.message);
    }
  }
)
export const fetchOverallBookingSummary = createAsyncThunk(
  'booking/fetchOverallBookingSummary',
  async ({ fromDate, endDate }, { rejectWithValue }) => {
    try {
      const response =
        await axios.post(`${BASE_URL}/overallBookingSummary`, {
          fromDate, endDate
        });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch overall booking summary'
      );
    }
  }
);

export const getBookingSummaryByDate = createAsyncThunk(
  'booking/getBookingSummary',
  async ({ fromDate, toDate }, thunkApi) => {
    try {
      const res = await axios.post(`${BASE_URL}/booking-summary`, {
        fromDate, toDate
      });
      return res.data.bookings;
    } catch (err) {
      return thunkApi.rejectWithValue(err.response?.data?.message || 'Failed to fetch data');
    }
  }
);
export const caReport = createAsyncThunk(
  'booking/caReport', async ({ pickup, drop, fromDate, toDate }, thunkApi) => {
    try {
      const response = await axios.post(`${BASE_URL}/ca-report`, { pickup, drop, fromDate, toDate });
      return response.data.data;
    }
    catch (err) {
      return thunkApi.rejectWithValue(err.response?.data?.message || 'Failed to fetch Ca Report');
    }
  }
)

export const fetchPendingCustomers = createAsyncThunk(
  "pendingCustomers/fetchPendingCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/pending-amount`);
      // Adjust URL to match your backend route
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch pending customers");
    }
  }
);
export const receiveCustomerPayment = createAsyncThunk(
  "bookings/receiveCustomerPayment",
  async ({ customerId, amount }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/payment/${customerId}`, { amount });
      return {
        customerId,
        paymentData: res.data.data   // ✅ only the "data" object
      };
    } catch (err) {
      console.error("Payment failed:", err);
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);
export const fetchInvoicesByFilter = createAsyncThunk(
  "invoices/fetchByFilter",
  async ({ fromDate, toDate, startStation }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/invoice-list`, {
        fromDate,
        toDate,
        startStation
      });
      return response.data; // { message, count, data }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  }
);
export const fetchIncomingBookings = createAsyncThunk(
  'bookings/fetchIncomingBookings',
  async ({ fromDate, toDate }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(
        `${BASE_URL}/incoming`,
        { fromDate, toDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.data; // backend sends { success, count, data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch incoming bookings');
    }
  }
);
export const restoreBooking = createAsyncThunk(
  "bin/restoreBooking",
  async (bookingId, thunkApi) => {
    try {
      const res = await axios.patch(`${BASE_URL}/${bookingId}/restore`);
      return res.data.booking; // full booking object
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data?.message || "Failed to restore booking"
      );
    }
  }
);
export const listDeletedBookings = createAsyncThunk(
  "bin/listDeletedBookings",
  async (_, thunkApi) => {
    try {
      const res = await axios.get(`${BASE_URL}/bin/list`);
      return res.data.bookings; // array of bookings
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data?.message || "Failed to fetch deleted bookings"
      );
    }
  }
);
export const previewBookingReceiptNo = createAsyncThunk(
  "booking/previewReceipt",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/preview-receipt`);
      return res.data.receiptNo;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to preview receipt number"
      );
    }
  }
);

// 🔥 Upload Booking PDF
export const uploadBookingPdf = createAsyncThunk(
  "booking/uploadPdf",
  async ({ bookingId, file }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        `${BASE_URL}/${bookingId}/upload-pdf`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        bookingId,
        pdfUrl: res.data.data.pdfUrl,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "PDF upload failed"
      );
    }
  }
);

const initialState = {
  list: [],
  list2: [],
  list3: [],
  list4: [],
  list5: [],
  incomingList: [],
  requestCount: 0,
  activeDeliveriesCount: 0,
  cancelledDeliveriesCount: 0,
  totalRevenue: 0,
  uploadStatus: "idle",      // idle | loading | succeeded | failed
  uploadError: null,
  previewPdfUrl: null,
  previewOpen: false,
  data: [],
  count: 0,
  loading: false,
  error: null,
  totalDebit: 0,
  totalCredit: 0,
  customers: [],
  summary: null,
  form: {
    startStation: "",
    endStation: "",
    bookingDate: null,
    deliveryDate: null,
    customerSearch: "",
    firstName: "",
    middleName: "",
    lastName: "",
    contactNumber: "",
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
        insurance: "",
        vppAmount: "",
        toPay: "",
        weight: "",
        amount: "",
      },
    ],
    addComment: "",
    freight: "",
    ins_vpp: "",
    billTotal: "",
    cgst: "",
    sgst: "",
    igst: "",
    grandTotal: "",
  },
  status: 'idle',
  viewedbooking: null,
  createStatus: 'idle',
  createError: null,
  receiptPreview: "",
  receiptPreviewStatus: "idle",
  receiptPreviewError: null,


};
const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setFormField: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    resetForm: (state) => {
      state.form = initialState.form;
    },
    addBooking: (state, action) => {
      if (Array.isArray(state.list)) {
        state.list = [...state.list, action.payload];
      } else {
        state.list = [action.payload];
      }
    },
    setBooking: (state, action) => {
      state.list = Array.isArray(action.payload)
        ? action.payload
        : [];
    },
    clearViewedBooking: (state) => {
      state.viewedBooking = null;
    },
    setPreviewPdf: (state, action) => {
      state.previewPdfUrl = action.payload;
      state.previewOpen = true;
    },
    closePreviewPdf: (state) => {
      state.previewPdfUrl = null;
      state.previewOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      //for booking.

      .addCase(createBooking.pending, (state) => {
        state.createStatus = 'loading'; // Change this
        state.createError = null;
        state.loading = true; // Keep this for backward compatibility
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.status = 'succeeded';
        state.error = null;
        state.loading = false;

        // ✅ SAFE GUARDED UPDATE
        const safeList = Array.isArray(state.list) ? state.list : [];
        state.list = [...safeList, action.payload];

        state.receiptPreview = "";
        state.receiptPreviewStatus = "idle";
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.createStatus = 'failed'; // Change this
        state.loading = false;
        state.createError = action.payload; // Change this
        state.error = action.payload; // Keep existing
      })


      //for deleting
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from all lists
        state.list = state.list.filter(booking => booking.bookingId !== action.payload && booking._id !== action.payload);
        // Show success message
        state.message = "Booking moved to recycle bin successfully";
      })
      //fetching list 
      .addCase(fetchBookingsByType.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBookingsByType.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
      })
      .addCase(fetchBookingsByType.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error;
      })

      .addCase(bookingRequestCount.fulfilled, (state, action) => {
        state.requestCount = action.payload.requestCount;
      })
      .addCase(activeBookingCount.fulfilled, (state, action) => {
        state.activeDeliveriesCount = action.payload.activeDeliveries;
      })
      .addCase(cancelledBookingCount.fulfilled, (state, action) => {
        state.cancelledDeliveriesCount = action.payload.cancelledCount;
      })
      //view booking
      .addCase(viewBookingById.pending, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(viewBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.viewedBooking = action.payload;
        state.form = {
          ...initialState.form,
          ...action.payload,
          items: Array.isArray(action.payload.items)
            ? action.payload.items
            : initialState.form.items
        };
      })
      .addCase(viewBookingById.rejected, (state) => {
        state.loading = false;
        state.error = null
      })
      .addCase(updateBookingById.pending, (state) => {
        state.loading = true;
        state.error = null
      })
      .addCase(updateBookingById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.error = null
        const updatedBooking = action.payload
        if (Array.isArray(state.list)) {
          const index = state.list.findIndex(
            booking => booking.bookingId === updatedBooking.bookingId
          );
          if (index !== -1) {
            state.list[index] = updatedBooking;
          }
        }
        state.form = initialState.form
      })
      //totalReveune
      .addCase(revenueList.pending, (state) => {
        state.loading = true;
        state.error = null
      })
      .addCase(revenueList.fulfilled, (state, action) => {
        state.loading = false;
        state.totalRevenue = action.payload.totalRevenue;
        state.revenueList = action.payload.revenueList;
      })
      .addCase(revenueList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(
          booking => booking._id !== action.payload._id
        );
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
      })
      .addCase(sendWhatsAppMsg.pending, (state) => {
        state.loading = true;
        state.error = null
      })
      .addCase(sendWhatsAppMsg.fulfilled, (state) => {
        state.loading = false;
        state.error = null
      })
      .addCase(sendWhatsAppMsg.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendEmail.pending, (state) => {
        state.loading = true;
        state.error = null
      })
      .addCase(sendEmail.fulfilled, (state) => {
        state.loading = false;
        state.error = null
      })
      .addCase(sendEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(pendingList.pending, (state) => {
        state.loading = true;
        state.error = null
      })
      .addCase(pendingList.fulfilled, (state, action) => {
        state.loading = false;
        state.list2 = action.payload
      })
      .addCase(pendingList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveList.pending, (state) => {
        state.loading = true;
        state.error = null
      })
      .addCase(approveList.fulfilled, (state) => {
        state.loading = false;
        state.error = null
      })
      .addCase(approveList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
      })
      .addCase(rejectThridParty.pending, (state) => {
        state.loading = false;
        state.error = null
      })
      .addCase(rejectThridParty.fulfilled, (state, action) => {
        state.loading = false;
        state.list2 = state.list2.filter(booking => booking.bookingId !== action.payload);
      })
      .addCase(fetchOverallBookingSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverallBookingSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.list3 = action.payload;
      })
      .addCase(fetchOverallBookingSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getBookingSummaryByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.list4 = action.payload;
      })
      .addCase(caReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(caReport.fulfilled, (state, action) => {
        state.loading = false;
        state.list5 = action.payload;
      })
      .addCase(caReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPendingCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.customers || [];
        state.summary = action.payload.summary || null;
        state.error = null;
      })
      .addCase(fetchPendingCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      .addCase(receiveCustomerPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receiveCustomerPayment.fulfilled, (state, action) => {
        state.loading = false;
        const { customerId, paymentData } = action.payload; // ✅ Correct destructuring

        // Update local state instantly
        const updatedStats = paymentData?.updatedStats; // ✅ Use paymentData
        const customerIndex = state.customers.findIndex(
          (c) => c.customerId === customerId
        );

        if (customerIndex !== -1 && updatedStats) {
          state.customers[customerIndex] = {
            ...state.customers[customerIndex],
            unpaidBookings: updatedStats.unpaidBookings,
            totalAmount: updatedStats.totalAmount,
            totalPaid: updatedStats.totalPaid,
            pendingAmount: updatedStats.pendingAmount
          };
        }
      })
      .addCase(receiveCustomerPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInvoicesByFilter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoicesByFilter.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.count = action.payload.count;
        state.totalDebit = action.payload.totalDebit || 0;
        state.totalCredit = action.payload.totalCredit || 0;
      })

      .addCase(fetchInvoicesByFilter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchIncomingBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncomingBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.incomingList = action.payload;
      })
      .addCase(fetchIncomingBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(restoreBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedBookings = state.deletedBookings.filter(
          (b) => b._id !== action.payload._id
        );
        state.message = "Booking restored successfully!";
      })
      .addCase(restoreBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(listDeletedBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listDeletedBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedBookings = action.payload;
      })
      .addCase(listDeletedBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(previewBookingReceiptNo.pending, (state) => {
        state.receiptPreviewStatus = "loading";
        state.receiptPreviewError = null;
      })
      .addCase(previewBookingReceiptNo.fulfilled, (state, action) => {
        state.receiptPreviewStatus = "succeeded";
        state.receiptPreview = action.payload;

        if (state.createStatus !== "succeeded") {
          state.form.items = state.form.items.map(item => ({
            ...item,
            receiptNo: action.payload
          }));
        }
      })
      .addCase(previewBookingReceiptNo.rejected, (state, action) => {
        state.receiptPreviewStatus = "failed";
        state.receiptPreviewError = action.payload;
      })
      // ==========================
      // 📤 Upload Booking PDF
      // ==========================
      .addCase(uploadBookingPdf.pending, (state) => {
        state.uploadStatus = "loading";
        state.uploadError = null;
      })

      .addCase(uploadBookingPdf.fulfilled, (state, action) => {
        state.uploadStatus = "succeeded";

        const { bookingId, pdfUrl } = action.payload;

        // 🔄 update list
        if (Array.isArray(state.list)) {
          const index = state.list.findIndex(
            (b) => b.bookingId === bookingId
          );
          if (index !== -1) {
            state.list[index].quotationPdf = pdfUrl; // 🔥 booking pdf
          }
        }

        // 🔄 update viewed booking
        if (
          state.viewedBooking &&
          state.viewedBooking.bookingId === bookingId
        ) {
          state.viewedBooking.quotationPdf = pdfUrl;
        }
      })

      .addCase(uploadBookingPdf.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.uploadError = action.payload;
      });

  }
});

export const { setFormField, resetForm, addBooking, setBooking, clearViewedBooking, setPreviewPdf, closePreviewPdf } = bookingSlice.actions;
export default bookingSlice.reducer;