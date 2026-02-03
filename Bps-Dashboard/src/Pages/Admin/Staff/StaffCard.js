import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, TablePagination, TextField, InputAdornment,
    useTheme, Button, ListItemText, MenuItem, ListItemIcon, Menu,
    CircularProgress, Chip, Avatar, Tooltip, Badge, alpha,
    LinearProgress
} from '@mui/material';
import {
    People as PeopleIcon,
    AddModerator as AddModeratorIcon,
    Block as BlockIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    VerifiedUser as VerifiedIcon,
    PersonAdd as PersonAddIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStaff, updateStaffStatus, deleteStaff } from "../../../features/staff/staffSlice";

const StaffCard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { list: staffList = [], loading } = useSelector(state => state.staff);

    const [activeCard, setActiveCard] = useState('total');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [selectedStaffId, setSelectedStaffId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    const cardColors = {
        active: { main: '#00c853', light: '#e8f5e9' },
        total: { main: '#0155a5', light: '#e6f0fa' },
        blocked: { main: '#f44336', light: '#ffebee' },
        inactive: { main: '#ff9800', light: '#fff3e0' }
    };

    // ================= FETCH STAFF =================
    useEffect(() => {
        dispatch(fetchStaff());
    }, [dispatch]);

    // ================= STATUS STATS =================
    const stats = useMemo(() => {
        const total = staffList.length;
        const active = staffList.filter(s => s.status === "active").length;
        const inactive = staffList.filter(s => s.status === "inactive").length;
        const blocked = staffList.filter(s => s.status === "blocked").length;
        return { total, active, inactive, blocked };
    }, [staffList]);

    // ================= CARD DATA =================
    const cardData = [
        {
            id: 1,
            type: 'active',
            title: 'Active Staff',
            value: stats.active,
            subtitle: 'Currently working',
            icon: <PeopleIcon fontSize="large" />,
            color: cardColors.active,
            progress: stats.total ? (stats.active / stats.total) * 100 : 0
        },
        {
            id: 2,
            type: 'total',
            title: 'Total Staff',
            value: stats.total,
            subtitle: 'All registered staff',
            icon: <PersonAddIcon fontSize="large" />,
            color: cardColors.total,
            progress: 100
        },
        {
            id: 3,
            type: 'blocked',
            title: 'Blocked',
            value: stats.blocked,
            subtitle: 'Removed from system',
            icon: <BlockIcon fontSize="large" />,
            color: cardColors.blocked,
            progress: stats.total ? (stats.blocked / stats.total) * 100 : 0
        },
        {
            id: 4,
            type: 'inactive',
            title: 'Inactive',
            value: stats.inactive,
            subtitle: 'Not currently working',
            icon: <AdminPanelSettingsIcon fontSize="large" />,
            color: cardColors.inactive,
            progress: stats.total ? (stats.inactive / stats.total) * 100 : 0
        },
    ];

    // ================= FILTER + SEARCH =================
    const filteredRows = useMemo(() => {
        let filtered = staffList.filter((s) => {
            const text = searchTerm.toLowerCase();
            return (
                s.firstName?.toLowerCase().includes(text) ||
                s.lastName?.toLowerCase().includes(text) ||
                s.contactNumber?.includes(text) ||
                s.email?.toLowerCase().includes(text) ||
                s.staffId?.toLowerCase().includes(text)
            );
        });

        if (statusFilter !== 'all') {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        return filtered;
    }, [staffList, searchTerm, statusFilter]);

    // ================= MENU =================
    const handleMenuOpen = (e, staffId) => {
        setMenuAnchorEl(e.currentTarget);
        setSelectedStaffId(staffId);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedStaffId(null);
    };

    const handleStatusChange = (status) => {
        dispatch(updateStaffStatus({ id: selectedStaffId, status }));
        handleMenuClose();
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this staff?")) {
            dispatch(deleteStaff(id));
        }
    };

    const handleStaffClick = () => {
        navigate("/staffform");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'warning';
            case 'blocked': return 'error';
            default: return 'default';
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                    Staff Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage all staff members, their status and information
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {cardData.map((card) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.id}>
                        <Card
                            onClick={() => setActiveCard(card.type)}
                            sx={{
                                cursor: 'pointer',
                                border: activeCard === card.type ? `2px solid ${card.color.main}` : 'none',
                                backgroundColor: 'white',
                                boxShadow: activeCard === card.type ? theme.shadows[8] : theme.shadows[2],
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[10],
                                }
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: '12px',
                                        backgroundColor: alpha(card.color.main, 0.1),
                                        color: card.color.main,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {card.icon}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                                            {card.value}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {card.title}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Box sx={{ mt: 2 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={card.progress}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: alpha(card.color.main, 0.2),
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: card.color.main,
                                            }
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {card.progress.toFixed(1)}% of total
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                                    {card.subtitle}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Action Bar */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[1] }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder="Search by name, email, phone or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2 }
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                select
                                size="small"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FilterIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2 }
                                }}
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                                <MenuItem value="blocked">Blocked</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<PersonAddIcon />}
                                onClick={handleStaffClick}
                                sx={{ borderRadius: 2, py: 1 }}
                            >
                                Add Staff
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Staff Table */}
            <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[1] }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                            <TableRow>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>STAFF</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>CONTACT INFO</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ADDRESS</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>STATUS</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                        <CircularProgress />
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                            Loading staff data...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No staff members found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredRows
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((staff) => (
                                    <TableRow
                                        key={staff._id}
                                        hover
                                        sx={{
                                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) },
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    badgeContent={
                                                        staff.isVerified ? (
                                                            <Tooltip title="Verified">
                                                                <VerifiedIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                                            </Tooltip>
                                                        ) : null
                                                    }
                                                >
                                                    <Avatar
                                                        src={staff.documents?.passportPhoto?.url}
                                                        sx={{
                                                            width: 48,
                                                            height: 48,
                                                            bgcolor: theme.palette.primary.main,
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {getInitials(staff.firstName, staff.lastName)}
                                                    </Avatar>
                                                </Badge>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {staff.firstName} {staff.lastName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        ID: {staff.staffId}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.disabled">
                                                        Joined: {new Date(staff.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>

                                        <TableCell>
                                            <Stack spacing={0.5}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <EmailIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">{staff.email}</Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <PhoneIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">{staff.contactNumber}</Typography>
                                                </Stack>
                                                <Chip
                                                    label={`Aadhar: ${staff.aadharNumber}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ width: 'fit-content' }}
                                                />
                                            </Stack>
                                        </TableCell>

                                        <TableCell>
                                            <Stack spacing={0.5}>
                                                <Typography variant="body2">
                                                    {staff.address?.addressLine}
                                                </Typography>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <LocationIcon fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {staff.address?.city}, {staff.address?.state}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="caption" color="text.disabled">
                                                    Pincode: {staff.address?.pincode}
                                                </Typography>
                                            </Stack>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={staff.status.toUpperCase()}
                                                color={getStatusColor(staff.status)}
                                                variant="filled"
                                                size="small"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    borderRadius: 1,
                                                    px: 1
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        color="info"
                                                        onClick={() => navigate(`/staffview/${staff._id}`)}
                                                        sx={{
                                                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                                                            '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.2) }
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Edit Staff">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => navigate(`/editstaff/${staff._id}`)}
                                                        sx={{
                                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Change Status">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenuOpen(e, staff._id)}
                                                        sx={{
                                                            backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                                            '&:hover': { backgroundColor: alpha(theme.palette.warning.main, 0.2) }
                                                        }}
                                                    >
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Delete Staff">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDelete(staff._id)}
                                                        sx={{
                                                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                            '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.2) }
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    sx={{
                        borderTop: `1px solid ${theme.palette.divider}`,
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontWeight: 500
                        }
                    }}
                />
            </Card>

            {/* Status Menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        mt: 1,
                        boxShadow: theme.shadows[3],
                        borderRadius: 2,
                        minWidth: 180
                    }
                }}
            >
                <MenuItem onClick={() => handleStatusChange("active")} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <CheckCircleIcon sx={{ color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText primary="Active" secondary="Set as active staff" />
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange("inactive")} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <CancelIcon sx={{ color: 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText primary="Inactive" secondary="Set as inactive" />
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange("blocked")} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <BlockIcon sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    <ListItemText primary="Blocked" secondary="Block from system" />
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default StaffCard;