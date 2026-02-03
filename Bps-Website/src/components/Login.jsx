import React, { useState } from 'react';
import {
    Box,
    Card,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Button,
    CircularProgress,
    Alert,
    Paper,
    Fade,
    Divider,
    Stack,
    alpha,
    useMediaQuery,
    useTheme,
    Chip
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Login as LoginIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchUserProfile } from '../features/loginSlice';
import loginImage from '../assets/BoxMan.svg';
import { FRONTEND_BASE_URL } from "../utils/api";

const Login = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const dispatch = useDispatch();

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ emailId: '', password: '' });
    const [isFocused, setIsFocused] = useState({ email: false, password: false });

    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

    const handleTogglePassword = () => setShowPassword(!showPassword);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFocus = (field) => () => {
        setIsFocused({ ...isFocused, [field]: true });
    };

    const handleBlur = (field) => () => {
        setIsFocused({ ...isFocused, [field]: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const loginResponse = await dispatch(loginUser(formData)).unwrap();
            const token = loginResponse.message.token;
            localStorage.setItem("authToken", token);

            const profileResponse = await dispatch(fetchUserProfile(token)).unwrap();
            const role = profileResponse.message?.role;

            window.history.replaceState({}, document.title, "/login");

            if (role === "admin") {
                window.location.href = `${FRONTEND_BASE_URL}/admin?token=${token}&role=${role}`;
            } else if (role === "supervisor") {
                window.location.href = `${FRONTEND_BASE_URL}/supervisor?token=${token}&role=${role}`;
            } else {
                window.location.href = `${FRONTEND_BASE_URL}/?token=${token}`;
            }
        } catch (err) {
            console.error("Login failed", err);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, sm: 3 },
                position: 'relative',
                overflow: 'hidden',
                '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                }
            }}
        >
            {/* Floating Elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                    animation: 'float 6s ease-in-out infinite',
                    '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-20px)' }
                    }
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '15%',
                    right: '10%',
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    animation: 'float 8s ease-in-out infinite 1s',
                }}
            />

            <Fade in={true} timeout={800}>
                <Card
                    elevation={10}
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        width: { xs: '100%', sm: '90%', md: '900px' },
                        maxWidth: '1200px',
                        borderRadius: { xs: 3, md: 4 },
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        mt: { xs: 5, md: 5 },
                    }}
                >
                    {/* Left Side - Login Form */}
                    <Box
                        sx={{
                            width: { xs: '100%', md: '50%' },
                            p: { xs: 3, sm: 4, md: 5 },
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                    >
                        {/* Header */}
                        <Stack alignItems="center" spacing={1} mb={4}>
                            <Box
                                sx={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                                }}
                            >
                                <SecurityIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography
                                variant="h4"
                                fontWeight="800"
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    textAlign: 'center',
                                }}
                            >
                                Welcome Back
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                textAlign="center"
                                sx={{ maxWidth: '300px' }}
                            >
                                Sign in to access your BPS dashboard
                            </Typography>
                        </Stack>

                        {/* Error Alert */}
                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 3,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'error.light',
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        {/* Loading Indicator */}
                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                <CircularProgress
                                    size={40}
                                    sx={{
                                        color: '#667eea',
                                        '& .MuiCircularProgress-circle': {
                                            strokeLinecap: 'round',
                                        }
                                    }}
                                />
                            </Box>
                        )}

                        {/* Login Form */}
                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                {/* Email Field */}
                                <TextField
                                    label="Email Address"
                                    name="emailId"
                                    type="email"
                                    fullWidth
                                    value={formData.emailId}
                                    onChange={handleChange}
                                    onFocus={handleFocus('email')}
                                    onBlur={handleBlur('email')}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon
                                                    sx={{
                                                        color: isFocused.email ? '#667eea' : '#9e9e9e',
                                                        transition: 'color 0.3s'
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            transition: 'all 0.3s',
                                            '&.Mui-focused': {
                                                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)',
                                            },
                                        }
                                    }}
                                />

                                {/* Password Field */}
                                <TextField
                                    label="Password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    fullWidth
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={handleFocus('password')}
                                    onBlur={handleBlur('password')}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon
                                                    sx={{
                                                        color: isFocused.password ? '#667eea' : '#9e9e9e',
                                                        transition: 'color 0.3s'
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleTogglePassword}
                                                    edge="end"
                                                    sx={{
                                                        color: '#667eea',
                                                        '&:hover': {
                                                            backgroundColor: alpha('#667eea', 0.1)
                                                        }
                                                    }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            transition: 'all 0.3s',
                                            '&.Mui-focused': {
                                                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)',
                                            },
                                        }
                                    }}
                                />

                                {/* Login Button */}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    startIcon={<LoginIcon />}
                                    sx={{
                                        py: 1.8,
                                        borderRadius: 3,
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.6)',
                                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)',
                                        },
                                        '&.Mui-disabled': {
                                            background: '#cccccc',
                                            boxShadow: 'none',
                                        }
                                    }}
                                >
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </Stack>
                        </Box>

                        {/* Footer */}
                        <Box mt={4} pt={3} borderTop={`1px solid ${alpha('#000', 0.1)}`}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                textAlign="center"
                                display="block"
                            >
                                © 2024 Bharat Parcel Service. All rights reserved.
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                textAlign="center"
                                display="block"
                                sx={{ mt: 0.5 }}
                            >
                                Secure login powered by BPS
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right Side - Illustration */}
                    <Box
                        sx={{
                            width: { xs: '100%', md: '50%' },
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: { xs: 'none', sm: 'flex' },
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: { xs: 4, md: 5 },
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Decorative Elements */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '-50px',
                                right: '-50px',
                                width: '200px',
                                height: '200px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.1)',
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: '-30px',
                                left: '-30px',
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.05)',
                            }}
                        />

                        {/* Illustration Container */}
                        <Paper
                            elevation={0}
                            sx={{
                                width: '100%',
                                maxWidth: '400px',
                                height: '300px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'transparent',
                                mb: 4,
                            }}
                        >
                            <Box
                                component="img"
                                src={loginImage}
                                alt="Secure Login"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                                }}
                            />
                        </Paper>

                        {/* Right Side Content */}
                        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                            <Typography
                                variant="h4"
                                fontWeight="800"
                                color="white"
                                sx={{
                                    mb: 2,
                                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                }}
                            >
                                Bharat Parcel Service
                            </Typography>
                            <Typography
                                variant="body1"
                                color="rgba(255, 255, 255, 0.9)"
                                sx={{
                                    mb: 3,
                                    maxWidth: '400px',
                                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                }}
                            >
                                Delivering excellence across India with secure and reliable logistics solutions.
                            </Typography>
                        </Box>
                    </Box>
                </Card>
            </Fade>
        </Box>
    );
};

export default Login;