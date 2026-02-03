import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { STAFF_API } from '../../utils/api';

// =========================
// Async Thunks
// =========================

// Create Staff
export const createStaff = createAsyncThunk(
    "staff/create",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(STAFF_API, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// Get All Staff
export const fetchStaff = createAsyncThunk(
    "staff/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const res = await axios.get(STAFF_API, {
                params,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// Get Staff By ID
export const fetchStaffById = createAsyncThunk(
    "staff/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${STAFF_API}/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// Update Staff
export const updateStaff = createAsyncThunk(
    "staff/update",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const res = await axios.put(`${STAFF_API}/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// Update Status
export const updateStaffStatus = createAsyncThunk(
    "staff/updateStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(
                `${STAFF_API}/${id}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// Delete Staff
export const deleteStaff = createAsyncThunk(
    "staff/delete",
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${STAFF_API}/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            return { id, data: res.data };
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// =========================
// Slice
// =========================

const staffSlice = createSlice({
    name: "staff",
    initialState: {
        list: [],
        current: null,
        loading: false,
        error: null,
        meta: null
    },
    reducers: {
        clearStaffError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder

            // CREATE
            .addCase(createStaff.pending, (state) => {
                state.loading = true;
            })
            .addCase(createStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.list.unshift(action.payload.data);
            })
            .addCase(createStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH ALL
            .addCase(fetchStaff.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(fetchStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH BY ID
            .addCase(fetchStaffById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStaffById.fulfilled, (state, action) => {
                state.loading = false;
                state.current = action.payload.data;
            })
            .addCase(fetchStaffById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE
            .addCase(updateStaff.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.list = state.list.map(s =>
                    s._id === action.payload.data._id ? action.payload.data : s
                );
            })
            .addCase(updateStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // STATUS UPDATE
            .addCase(updateStaffStatus.fulfilled, (state, action) => {
                state.list = state.list.map(s =>
                    s._id === action.payload.data._id ? action.payload.data : s
                );
            })

            // DELETE
            .addCase(deleteStaff.fulfilled, (state, action) => {
                state.list = state.list.filter(s => s._id !== action.payload.id);
            });
    }
});

export const { clearStaffError } = staffSlice.actions;
export default staffSlice.reducer;
