import React, { useEffect, useState } from 'react';
import {
    Typography,
    Card,
    CardContent,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    IconButton,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Avatar,
    LinearProgress,
    Tooltip,
    useTheme,
    alpha
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import EastIcon from '@mui/icons-material/East';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookingsByType } from '../../../features/booking/bookingSlice';
import { fetchBookingRequest as fetchQuotationRequest } from '../../../features/quotation/quotationSlice';
import { assignDeliveries, finalDeliveryList, finalDeliveryWhatsApp, finalDeliveryMail, VehicleAvailabile, driverAvailabile } from '../../../features/delivery/deliverySlice';

const DeliveryCard = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const { requestCount: bookingRequestCountValue, list: bookingList, loading: bookingLoading } = useSelector((state) => state.bookings);
    const { requestCount: quotationRequestCountValue, list: quotationList, loading: quotationLoading } = useSelector((state) => state.quotations);
    const { list: finalList } = useSelector((state) => state.deliveries);

    const [selectedCard, setSelectedCard] = useState('booking');
    const [selectedItems, setSelectedItems] = useState({ booking: [], quotation: [], final: [] });

    const [driver, setDriver] = useState('');
    const [vehicle, setVehicle] = useState('');
    const [device, setDevice] = useState('');
    const {
        driver: driverList = [],
        vehicle: vehicleList = []
    } = useSelector((state) => state.deliveries || {});

    useEffect(() => {
        dispatch(fetchBookingsByType('request'));
        dispatch(fetchQuotationRequest());
        dispatch(VehicleAvailabile('Booking'));
        dispatch(driverAvailabile('Booking'));
        dispatch(finalDeliveryList());
    }, [dispatch]);

    useEffect(() => {
        const type = selectedCard === 'quotation' ? 'Quotation' : 'Booking';
        dispatch(VehicleAvailabile(type));
        dispatch(driverAvailabile(type));
    }, [selectedCard, dispatch]);

    const handleCardClick = (type) => {
        setSelectedCard(type);
    };

    const handleSend = (orderId) => {
        dispatch(finalDeliveryWhatsApp(orderId));
        dispatch(finalDeliveryMail(orderId));
    };

    const handleCheckboxChange = (id) => {
        setSelectedItems((prev) => {
            const current = prev[selectedCard] || [];
            const isSelected = current.includes(id);
            return {
                ...prev,
                [selectedCard]: isSelected
                    ? current.filter((item) => item !== id)
                    : [...current, id]
            };
        });
    };

    const handleAssign = () => {
        const selectedVehicle = vehicleList.find((v) => v.vehicleId === vehicle);
        const payload = {
            bookingIds: selectedCard === 'booking' ? selectedItems.booking : [],
            quotationIds: selectedCard === 'quotation' ? selectedItems.quotation : [],
            driverId: driver,
            vehicleModel: selectedVehicle?.vehicleModel || '',
            device: device
        };
        console.log('Assign Payload:', payload);

        dispatch(assignDeliveries(payload)).then((res) => {
            if (res.type.includes('fulfilled')) {
                setSelectedItems({ booking: [], quotation: [], final: [] });
                setDriver('');
                setVehicle('');
                setDevice('');
                dispatch(fetchBookingsByType('request'));
                dispatch(fetchQuotationRequest());
                dispatch(finalDeliveryList()); // Refresh final list after assignment
            }
        });
    };

    const cards = [
        {
            key: 'booking',
            count: bookingRequestCountValue ?? bookingList?.length ?? 0,
            subtitle: 'Booking Delivery',
            stat: '20% (30 days)',
            icon: <LocalShippingIcon />,
            color: theme.palette.primary.main,
            bgColor: alpha(theme.palette.primary.main, 0.1)
        },
        {
            key: 'quotation',
            count: quotationRequestCountValue ?? quotationList?.length ?? 0,
            subtitle: 'Quotation Delivery',
            stat: 'NaN% (30 days)',
            icon: <DescriptionIcon />,
            color: theme.palette.secondary.main,
            bgColor: alpha(theme.palette.secondary.main, 0.1)
        },
        {
            key: 'final',
            count: finalList?.length ?? 0,
            subtitle: 'Final Delivery',
            stat: 'NaN% (30 days)',
            icon: <CheckCircleOutlineIcon />,
            color: theme.palette.success.main,
            bgColor: alpha(theme.palette.success.main, 0.1)
        }
    ];

    const currentList = selectedCard === 'quotation' ? quotationList : selectedCard === 'final' ? finalList : bookingList;
    const currentLoading = selectedCard === 'quotation' ? quotationLoading : selectedCard === 'final' ? false : bookingLoading;

    // Get "toName" from API data for booking and quotation
    const getToName = (item) => {
        if (selectedCard === 'booking' && item.data && Array.isArray(item.data)) {
            const firstItem = item.data[0];
            return firstItem?.toName || firstItem?.Name || 'N/A';
        }
        return item.toName || item.Name || 'N/A';
    };

    return (
        <Box sx={{ padding: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                    Manage Delivery
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Assign drivers and vehicles to deliveries and track their progress
                </Typography>
            </Box>

            {/* Cards Section */}
            <Box sx={{
                display: 'flex',
                gap: 3,
                flexWrap: 'wrap',
                mb: 4
            }}>
                {cards.map((card) => (
                    <Card
                        key={card.key}
                        onClick={() => handleCardClick(card.key)}
                        sx={{
                            flex: 1,
                            minWidth: 280,
                            maxWidth: 320,
                            borderRadius: 3,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: selectedCard === card.key
                                ? `2px solid ${card.color}`
                                : '2px solid transparent',
                            backgroundColor: selectedCard === card.key
                                ? card.bgColor
                                : 'background.paper',
                            boxShadow: selectedCard === card.key
                                ? `0 8px 16px ${alpha(card.color, 0.2)}`
                                : '0 4px 12px rgba(0,0,0,0.1)',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 12px 20px ${alpha(card.color, 0.15)}`
                            }
                        }}
                    >
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography
                                        variant="h6"
                                        color="text.secondary"
                                        gutterBottom
                                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                    >
                                        {card.icon}
                                        {card.subtitle}
                                    </Typography>
                                    <Typography variant="h3" fontWeight={800} color={card.color}>
                                        {card.count}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={card.stat}
                                    size="small"
                                    sx={{
                                        backgroundColor: alpha(card.color, 0.1),
                                        color: card.color
                                    }}
                                />
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={selectedCard === card.key ? 100 : 30}
                                sx={{
                                    mt: 2,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: alpha(card.color, 0.2),
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: card.color
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Assignment Panel */}
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.default
                }}
            >
                <Typography variant="h6" fontWeight={600} gutterBottom mb={3}>
                    Assignment Panel
                </Typography>

                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    alignItems: 'center',
                }}>
                    <FormControl
                        size="medium"
                        sx={{
                            minWidth: 240,
                            flex: 1
                        }}
                    >
                        <InputLabel>Driver</InputLabel>
                        <Select
                            value={driver}
                            onChange={(e) => setDriver(e.target.value)}
                            label="Driver"
                            startAdornment={<PersonIcon sx={{ mr: 1, color: 'action.active' }} />}
                        >
                            <MenuItem value="">
                                <em>Select Driver</em>
                            </MenuItem>
                            {driverList.map((d) => (
                                <MenuItem key={d.driverId} value={d.driverId}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                            {d.name?.[0] || d.driverName?.[0] || 'D'}
                                        </Avatar>
                                        <span>{d.name || d.driverName}</span>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl
                        size="medium"
                        sx={{
                            minWidth: 240,
                            flex: 1
                        }}
                    >
                        <InputLabel>Vehicle</InputLabel>
                        <Select
                            value={vehicle}
                            onChange={(e) => setVehicle(e.target.value)}
                            label="Vehicle"
                            startAdornment={<DirectionsCarIcon sx={{ mr: 1, color: 'action.active' }} />}
                        >
                            <MenuItem value="">
                                <em>Select Vehicle</em>
                            </MenuItem>
                            {vehicleList.map((v) => (
                                <MenuItem key={v._id || v.vehicleId} value={v.vehicleId}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DirectionsCarIcon fontSize="small" />
                                        <span>{v.vehicleModel}</span>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl
                        size="medium"
                        sx={{
                            minWidth: 200,
                            flex: 1
                        }}
                    >
                        <InputLabel>Device</InputLabel>
                        <Select
                            value={device}
                            onChange={(e) => setDevice(e.target.value)}
                            label="Device"
                            startAdornment={<SmartphoneIcon sx={{ mr: 1, color: 'action.active' }} />}
                        >
                            <MenuItem value="">
                                <em>Select Device</em>
                            </MenuItem>
                            <MenuItem value="Device 1">Device 1</MenuItem>
                            <MenuItem value="Device 2">Device 2</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            height: 56,
                            px: 4,
                            borderRadius: 2,
                            fontWeight: 600,
                            minWidth: 160,
                            background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)'
                        }}
                        onClick={handleAssign}
                        disabled={!driver || !vehicle || selectedItems[selectedCard].length === 0}
                        endIcon={<EastIcon />}
                    >
                        Assign Delivery
                    </Button>
                </Box>
            </Paper>

            {/* Delivery List Table */}
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{
                                backgroundColor: theme.palette.primary.main,
                                '& th': {
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.95rem'
                                }
                            }}>
                                {selectedCard !== 'final' && (
                                    <TableCell width="60px" align="center">
                                        Select
                                    </TableCell>
                                )}
                                <TableCell width="80px">S.No</TableCell>
                                <TableCell>Order ID</TableCell>
                                <TableCell>From Name</TableCell>
                                <TableCell>To Name</TableCell>
                                <TableCell>Pickup</TableCell>
                                <TableCell>Destination</TableCell>
                                {selectedCard === 'final' && (
                                    <>
                                        <TableCell>Contact</TableCell>
                                        {/* <TableCell>Driver</TableCell>
                                        <TableCell>Vehicle</TableCell> */}
                                        <TableCell align="center">Actions</TableCell>
                                    </>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentLoading ? (
                                <TableRow>
                                    <TableCell colSpan={selectedCard === 'final' ? 10 : 7} align="center" sx={{ py: 4 }}>
                                        <Box sx={{ width: '100%' }}>
                                            <LinearProgress />
                                            <Typography sx={{ mt: 2 }}>Loading deliveries...</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : currentList?.length > 0 ? (
                                currentList.map((item, idx) => {
                                    // Final Delivery Tab - Different data structure
                                    if (selectedCard === 'final') {
                                        return (
                                            <TableRow
                                                key={item.orderId || idx}
                                                hover
                                                sx={{
                                                    '&:hover': { backgroundColor: theme.palette.action.hover },
                                                    '&:last-child td': { borderBottom: 0 }
                                                }}
                                            >
                                                {/* S.No */}
                                                <TableCell>
                                                    <Chip
                                                        label={item.SNo || idx + 1}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                            color: theme.palette.primary.main,
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </TableCell>

                                                {/* Order ID */}
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {item.orderId || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                {/* From Name */}
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {item.fromName || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                {/* To Name */}
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {item.toName || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                {/* Pickup Location */}
                                                <TableCell>
                                                    <Chip
                                                        label={item.pickup || 'N/A'}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>

                                                {/* Destination (Drop) Location */}
                                                <TableCell>
                                                    <Chip
                                                        label={item.drop || 'N/A'}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                </TableCell>

                                                {/* Contact */}
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.contact || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                {/* Driver */}
                                                {/* <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                                                            {item.driverName?.[0] || 'D'}
                                                        </Avatar>
                                                        <Typography variant="body2">
                                                            {item.driverName || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell> */}

                                                {/* Vehicle */}
                                                {/* <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <DirectionsCarIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {item.vehicle?.vehicleModel || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell> */}

                                                {/* Actions */}
                                                <TableCell align="center">
                                                    <Tooltip title="Send Notification">
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleSend(item.orderId)}
                                                            sx={{
                                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
                                                            }}
                                                        >
                                                            <SendIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }
                                    // Booking and Quotation Tabs - Original logic
                                    const uniqueId = item._id || item.bookingId || item['Booking ID'] || `index-${idx}`;
                                    const fromName = item.fromName || item.Name || 'N/A';
                                    const toName = getToName(item);

                                    return (
                                        <TableRow
                                            key={uniqueId}
                                            hover
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: theme.palette.action.hover
                                                },
                                                '&:last-child td': { borderBottom: 0 }
                                            }}
                                        >
                                            <TableCell align="center">
                                                <Checkbox
                                                    checked={selectedItems[selectedCard]?.includes(uniqueId)}
                                                    onChange={() => handleCheckboxChange(uniqueId)}
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={idx + 1}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {item?.data?.orderId || item.bookingId || item['Booking ID'] || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {fromName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.contact || 'No contact'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {toName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.pickup || item['Pick up'] || 'N/A'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.drop || item.Drop || 'N/A'}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={selectedCard === 'final' ? 10 : 7} align="center" sx={{ py: 6 }}>
                                        <LocalShippingIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            No deliveries found
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedCard === 'final'
                                                ? 'No final deliveries available'
                                                : 'No bookings or quotations available for delivery'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Selection Summary */}
            {selectedItems[selectedCard]?.length > 0 && selectedCard !== 'final' && (
                <Box sx={{
                    position: 'sticky',
                    bottom: 20,
                    mt: 3,
                    p: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.95),
                    color: 'white',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: 3
                }}>
                    <Typography>
                        <strong>{selectedItems[selectedCard].length}</strong> items selected
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleAssign}
                        disabled={!driver || !vehicle}
                        sx={{
                            fontWeight: 600,
                            boxShadow: 2
                        }}
                    >
                        Assign Selected ({selectedItems[selectedCard].length})
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default DeliveryCard;