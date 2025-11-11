import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';

// Async thunks - Direct API_BASE_URL use karo
export const addOption = createAsyncThunk(
    'leadOptions/addOption',
    async (optionData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/add`, optionData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getAllOptions = createAsyncThunk(
    'leadOptions/getAllOptions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/all`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getOptionsByField = createAsyncThunk(
    'leadOptions/getOptionsByField',
    async (fieldName, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/field/${fieldName}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateOption = createAsyncThunk(
    'leadOptions/updateOption',
    async ({ id, optionData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/update/${id}`, optionData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteOption = createAsyncThunk(
    'leadOptions/deleteOption',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
            return { ...response.data, deletedId: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteMultipleOptions = createAsyncThunk(
    'leadOptions/deleteMultipleOptions',
    async (ids, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/delete-multiple`, {
                data: { ids }
            });
            return { ...response.data, deletedIds: ids };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Initial state
const initialState = {
    options: [],
    loading: false,
    error: null,
    success: false,
    currentField: null,
    fieldOptions: []
};

// Slice
const leadOptionsSlice = createSlice({
    name: 'leadOptions',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        resetState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        },
        setCurrentField: (state, action) => {
            state.currentField = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Add Option
            .addCase(addOption.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(addOption.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.options.unshift(action.payload.data);
            })
            .addCase(addOption.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to add option';
            })

            // Get All Options
            .addCase(getAllOptions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllOptions.fulfilled, (state, action) => {
                state.loading = false;
                state.options = action.payload.data;
            })
            .addCase(getAllOptions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch options';
            })

            // Get Options by Field
            .addCase(getOptionsByField.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOptionsByField.fulfilled, (state, action) => {
                state.loading = false;
                state.fieldOptions = action.payload.data;
            })
            .addCase(getOptionsByField.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch field options';
            })

            // Update Option
            .addCase(updateOption.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateOption.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const updatedOption = action.payload.data;
                const index = state.options.findIndex(opt => opt._id === updatedOption._id);
                if (index !== -1) {
                    state.options[index] = updatedOption;
                }
            })
            .addCase(updateOption.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to update option';
            })

            // Delete Option
            .addCase(deleteOption.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteOption.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.options = state.options.filter(opt => opt._id !== action.payload.deletedId);
            })
            .addCase(deleteOption.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to delete option';
            })

            // Delete Multiple Options
            .addCase(deleteMultipleOptions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteMultipleOptions.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.options = state.options.filter(opt => !action.payload.deletedIds.includes(opt._id));
            })
            .addCase(deleteMultipleOptions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to delete options';
            });
    }
});

// Export actions and reducer
export const { clearError, clearSuccess, resetState, setCurrentField } = leadOptionsSlice.actions;
export default leadOptionsSlice.reducer;