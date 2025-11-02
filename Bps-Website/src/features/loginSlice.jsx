import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { AUTH_API } from "../utils/api";

const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    role: null,
    forgot: {
        loading: false,
        error: null,
        message: null,
        step: 1,
        email: "",
        code: "",
    },
};

// ✅ LOGIN
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${AUTH_API}/login`, credentials);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Login failed" });
        }
    }
);

// ✅ FETCH USER PROFILE
export const fetchUserProfile = createAsyncThunk(
    "auth/fetchUserProfile",
    async (token, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${AUTH_API}/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Failed to fetch profile" });
        }
    }
);

// ✅ STEP 1: Send Reset Code
export const sendResetCode = createAsyncThunk(
    "auth/sendResetCode",
    async (emailId, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${AUTH_API}/send-reset-code`, { emailId });
            return { ...response.data, emailId };
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Failed to send reset code" });
        }
    }
);

// ✅ STEP 2: Verify Code (optional backend, or handled locally)
export const verifyResetCode = createAsyncThunk(
    "auth/verifyResetCode",
    async (code, { getState, rejectWithValue }) => {
        const { forgot } = getState().auth;
        if (!code || code.length < 6) {
            return rejectWithValue({ message: "Invalid code" });
        }
        // Optional: verify on backend if needed
        return { message: "Code verified", code };
    }
);

// ✅ STEP 3: Change Password
export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async ({ emailId, code, newPassword }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${AUTH_API}/changePassword`, {
                emailId,
                code,
                newPassword,
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Failed to reset password" });
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;
            state.error = null;
            state.loading = false;
        },
        resetForgotState: (state) => {
            state.forgot = { ...initialState.forgot };
        },
    },
    extraReducers: (builder) => {
        builder
            // ✅ Login Flow
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.message.token;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Login failed";
            })

            // ✅ Profile
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                const userProfile = action.payload.message;
                state.user = userProfile;
                state.role = userProfile.role;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.error = action.payload?.message || "Failed to fetch profile";
            })

            // ✅ Forgot Password: Step 1 - Send Code
            .addCase(sendResetCode.pending, (state) => {
                state.forgot.loading = true;
                state.forgot.error = null;
                state.forgot.message = null;
            })
            .addCase(sendResetCode.fulfilled, (state, action) => {
                state.forgot.loading = false;
                state.forgot.message = action.payload.message || "Verification code sent";
                state.forgot.step = 2;
                state.forgot.email = action.payload.emailId;
            })
            .addCase(sendResetCode.rejected, (state, action) => {
                state.forgot.loading = false;
                state.forgot.error = action.payload?.message || "Failed to send code";
            })

            // ✅ Forgot Password: Step 2 - Verify Code
            .addCase(verifyResetCode.fulfilled, (state, action) => {
                state.forgot.message = "Code verified";
                state.forgot.code = action.payload.code;
                state.forgot.step = 3;
            })
            .addCase(verifyResetCode.rejected, (state, action) => {
                state.forgot.error = action.payload?.message || "Invalid verification code";
            })

            // ✅ Forgot Password: Step 3 - Reset Password
            .addCase(resetPassword.pending, (state) => {
                state.forgot.loading = true;
                state.forgot.error = null;
                state.forgot.message = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.forgot.loading = false;
                state.forgot.message = action.payload.message || "Password changed successfully";
                state.forgot.step = 1; // Reset to start
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.forgot.loading = false;
                state.forgot.error = action.payload?.message || "Failed to reset password";
            });
    },
});

export const { logout, resetForgotState } = authSlice.actions;
export default authSlice.reducer;
