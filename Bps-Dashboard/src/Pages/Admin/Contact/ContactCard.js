import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    InputAdornment,
    IconButton,
    Pagination,
    Chip,
    Avatar,
    Card,
    CardContent,
    Tooltip,
    Fade,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
    createContact,
    getAllContact,
    updateContact,
    deleteContact,
    selectContactList
} from '../../../features/contact/contactSlice';
import { useDispatch, useSelector } from 'react-redux';

const ContactCard = () => {
    const dispatch = useDispatch();
    const theme = useTheme();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        contactNumber: '',
        email: '',
        address: '',
    });

    const contacts = useSelector(selectContactList);
    const [searchTerm, setSearchTerm] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [page, setPage] = useState(1);
    const [isViewMode, setIsViewMode] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [sortBy, setSortBy] = useState('name');
    const rowsPerPage = 5;

    // Load contacts
    useEffect(() => {
        const loadContacts = async () => {
            setLoading(true);
            await dispatch(getAllContact());
            setTimeout(() => setLoading(false), 300);
        };
        loadContacts();
    }, [dispatch]);

    // Input handler
    const handleChange = (e) => {
        if (!isViewMode) {
            setFormData(prev => ({
                ...prev,
                [e.target.name]: e.target.value,
            }));
        }
    };

    // Add/Update contact
    const handleAddOrUpdateContact = async () => {
        setLoading(true);
        if (editIndex !== null) {
            const contactToUpdate = contacts[editIndex];
            const updatedData = { ...contactToUpdate, ...formData };
            await dispatch(updateContact(updatedData));
        } else {
            await dispatch(createContact(formData));
            await dispatch(getAllContact());
        }

        setFormData({ name: '', contactNumber: '', email: '', address: '' });
        setEditIndex(null);
        setIsViewMode(false);
        setPage(1);
        setTimeout(() => setLoading(false), 300);
    };

    // Delete contact
    const handleDelete = async () => {
        if (selectedContact) {
            setLoading(true);
            await dispatch(deleteContact(selectedContact.contactNumber));
            await dispatch(getAllContact());
            setDeleteDialogOpen(false);
            setSelectedContact(null);
            setTimeout(() => setLoading(false), 300);
        }
    };

    // Open delete confirmation
    const openDeleteDialog = (contact, index) => {
        setSelectedContact({ ...contact, index });
        setDeleteDialogOpen(true);
    };

    // Edit contact
    const handleEdit = (index) => {
        setFormData(contacts[index]);
        setEditIndex(index);
        setIsViewMode(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // View contact details
    const handleView = (contact) => {
        setSelectedContact(contact);
        setViewDialogOpen(true);
    };

    // Cancel actions
    const handleCancel = () => {
        setFormData({ name: '', contactNumber: '', email: '', address: '' });
        setEditIndex(null);
        setIsViewMode(false);
    };

    // Menu handlers
    const handleMenuOpen = (event, contact, index) => {
        setAnchorEl(event.currentTarget);
        setSelectedContact({ ...contact, index });
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedContact(null);
    };

    // Sort and filter contacts
    const filteredContacts = contacts
        .filter(contact =>
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.contactNumber.includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
            return 0;
        });

    const count = Math.ceil(filteredContacts.length / rowsPerPage);
    const paginatedContacts = filteredContacts.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    // Generate avatar color based on name
    const getAvatarColor = (name) => {
        const colors = [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.error.main,
            theme.palette.warning.main,
            theme.palette.info.main,
            theme.palette.success.main,
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Loading Indicator */}
            {loading && (
                <LinearProgress
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 9999
                    }}
                />
            )}

            {/* Header */}
            <Box sx={{
                mb: 4,
                p: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                boxShadow: theme.shadows[3]
            }}>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ContactPhoneIcon fontSize="large" />
                            Contact Manager
                        </Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
                            {contacts.length} contacts in your directory
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Chip
                            label="Active"
                            color="success"
                            variant="outlined"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.1)',
                                borderColor: 'rgba(255,255,255,0.3)',
                                color: 'white'
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Contact Form Card */}
            <Card sx={{ mb: 4, boxShadow: theme.shadows[2], borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonAddIcon color="primary" />
                        {editIndex !== null ? 'Edit Contact' : 'Add New Contact'}
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                fullWidth
                                size="medium"
                                disabled={isViewMode}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Phone Number"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                fullWidth
                                size="medium"
                                disabled={isViewMode}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                fullWidth
                                size="medium"
                                disabled={isViewMode}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                fullWidth
                                size="medium"
                                disabled={isViewMode}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationOnIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleAddOrUpdateContact}
                            disabled={isViewMode || !formData.name || !formData.contactNumber}
                            startIcon={editIndex !== null ? <CheckCircleIcon /> : <PersonAddIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: theme.shadows[4],
                                },
                                transition: 'all 0.2s',
                            }}
                        >
                            {editIndex !== null ? 'Update Contact' : 'Add Contact'}
                        </Button>

                        {(isViewMode || editIndex !== null) && (
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                startIcon={<CancelIcon />}
                                sx={{ borderRadius: 2, px: 4 }}
                            >
                                Cancel
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* Search and Filter Bar */}
            <Box sx={{
                mb: 3,
                p: 2,
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                <TextField
                    placeholder="Search contacts by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                    }}
                />

                <Tooltip title="Filter contacts">
                    <IconButton
                        onClick={(e) => handleMenuOpen(e, null, null)}
                        sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 2
                        }}
                    >
                        <FilterListIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Contacts Table */}
            <Card sx={{ boxShadow: theme.shadows[3], borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{
                                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                            }}>
                                <TableCell sx={{ color: 'white', fontWeight: 600, py: 2 }}>CONTACT</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600, py: 2 }}>PHONE</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600, py: 2 }}>EMAIL</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600, py: 2 }}>ADDRESS</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600, py: 2 }} align="center">ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedContacts.map((contact, index) => (
                                <Fade in={true} timeout={300} key={contact._id || index}>
                                    <TableRow
                                        hover
                                        sx={{
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.light, 0.05),
                                                transform: 'scale(1.002)',
                                                transition: 'all 0.2s'
                                            },
                                            '&:last-child td': { borderBottom: 0 }
                                        }}
                                    >
                                        <TableCell sx={{ py: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: getAvatarColor(contact.name),
                                                        width: 40,
                                                        height: 40,
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {contact.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={500}>
                                                        {contact.name}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PhoneIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    {contact.contactNumber}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <EmailIcon fontSize="small" color="action" />
                                                <Typography variant="body2" noWrap>
                                                    {contact.email || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LocationOnIcon fontSize="small" color="action" />
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                                    {contact.address || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        onClick={() => handleView(contact)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(theme.palette.info.main, 0.1),
                                                            '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small" color="info" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Edit Contact">
                                                    <IconButton
                                                        onClick={() => handleEdit((page - 1) * rowsPerPage + index)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                                                            '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.2) }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" color="warning" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="More Options">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenuOpen(e, contact, (page - 1) * rowsPerPage + index)}
                                                        sx={{
                                                            bgcolor: alpha(theme.palette.grey[500], 0.1),
                                                            '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.2) }
                                                        }}
                                                    >
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </Fade>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Empty State */}
                {filteredContacts.length === 0 && (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                        <ContactPhoneIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No contacts found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {searchTerm ? 'Try adjusting your search terms' : 'Add your first contact to get started'}
                        </Typography>
                    </Box>
                )}
            </Card>

            {/* Pagination */}
            {filteredContacts.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, filteredContacts.length)} of {filteredContacts.length} contacts
                    </Typography>
                    <Pagination
                        count={count}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        shape="rounded"
                        size="medium"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                borderRadius: 1,
                            }
                        }}
                    />
                </Box>
            )}

            {/* View Contact Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <PersonIcon />
                    Contact Details
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedContact && (
                        <Box sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: getAvatarColor(selectedContact.name),
                                        width: 60,
                                        height: 60,
                                        fontSize: 24,
                                        fontWeight: 600
                                    }}
                                >
                                    {selectedContact.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight={600}>
                                        {selectedContact.name}
                                    </Typography>
                                    <Chip
                                        label="Active Contact"
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sx={{ mb: 2 }}>
                                    <Divider />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <PhoneIcon color="primary" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Phone Number
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedContact.contactNumber}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <EmailIcon color="primary" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Email Address
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedContact.email || 'Not provided'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Address
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedContact.address || 'Not provided'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setViewDialogOpen(false);
                            handleEdit(selectedContact?.index);
                        }}
                    >
                        Edit Contact
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle color="error">Delete Contact</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{selectedContact?.name}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        startIcon={<DeleteIcon />}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    if (selectedContact) handleView(selectedContact);
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <VisibilityIcon fontSize="small" />
                    </ListItemIcon>
                    View Details
                </MenuItem>
                <MenuItem onClick={() => {
                    if (selectedContact) handleEdit(selectedContact.index);
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    Edit Contact
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => {
                        if (selectedContact) openDeleteDialog(selectedContact, selectedContact.index);
                        handleMenuClose();
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    Delete Contact
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default ContactCard;