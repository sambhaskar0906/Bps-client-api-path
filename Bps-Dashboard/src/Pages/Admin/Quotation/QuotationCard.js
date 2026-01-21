import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TableSortLabel,
  TablePagination,
  TextField,
  InputAdornment,
  useTheme,
  Button,
  Tooltip,
  Checkbox, // Added Checkbox
} from "@mui/material";
import {
  CancelScheduleSend as CancelScheduleSendIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Book as BookOnlineIcon,
  LocalShipping as LocalShippingIcon,
} from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchBookingRequest,
  fetchActiveBooking,
  fetchCancelledBooking,
  deleteBooking,
  sendWhatsAppMsg,
  sendBookingEmail,
  revenueList,
  viewBookingById,
  clearViewedBooking
} from "../../../features/quotation/quotationSlice";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { finalizeDelivery } from "../../../features/delivery/deliverySlice";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReceiptIcon from '@mui/icons-material/Receipt';
import QSlipModal from "../../../Components/QSlipModal";

function descendingComparator(a, b, orderBy) {
  if (orderBy === "quotationDate") {
    return new Date(b.quotationDate) - new Date(a.quotationDate); // ✅ DESC date
  }

  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilized = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order !== 0 ? order : a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      if (typeof dateString === "string" && dateString.includes("-")) {
        return dateString;
      }
      return "-";
    }

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
};


const headCells = [
  { id: "active", label: "Finalize", sortable: false, width: 80 }, // Added for checkbox
  { id: "sno", label: "S.No", sortable: false, width: 50 },
  { id: "biltyNo", label: "Bilty No", sortable: false, width: 130 },
  { id: "bookingId", label: "Order By", sortable: true, width: 120 },
  { id: "quotationDate", label: "Date", sortable: true, width: 100 },
  { id: "senderName", label: "Name", sortable: true, width: 120 },
  { id: "pickupCity", label: "Pick Up", sortable: false, width: 120 },
  { id: "receiverName", label: "Name", sortable: false, width: 120 },
  { id: "dropCity", label: "Drop", sortable: false, width: 120 },
  { id: "contact", label: "Contact", sortable: false, width: 120 },
  { id: "action", label: "Action", sortable: false, width: 250 },
];

const revenueHeadCells = [
  { id: "sno", label: "S.No", sortable: false, width: 50 },
  { id: "bookingId", label: "Booking ID", sortable: true, width: 120 },
  { id: "date", label: "Date", sortable: true, width: 100 },
  { id: "pickup", label: "Pick Up", sortable: false, width: 120 },
  { id: "drop", label: "Drop", sortable: false, width: 80 },
  { id: "revenue", label: "Revenue (in Rupees)", sortable: false, width: 120 },
  { id: "action", label: "Action", sortable: false, width: 100 },
];

const QuotationCard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openWhatsappSnackbar, setOpenWhatsappSnackbar] = useState(false);
  const [openEmailSnackbar, setOpenEmailSnackbar] = useState(false);
  const cardColor = "#0155a5";
  const cardLightColor = "#e6f0fa";
  const [localModalOpen, setLocalModalOpen] = useState(false);
  const [activeCard, setActiveCard] = useState("request");
  const [order, setOrder] = useState("desc");          // ✅ latest first
  const [orderBy, setOrderBy] = useState("quotationDate"); // ✅ date based
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedList, setSelectedList] = useState("request");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { list: bookingList = [], revenueList: revenueData = [], requestCount, activeDeliveriesCount, cancelledDeliveriesCount, totalRevenue } =
    useSelector((state) => state.quotations);

  const booking = useSelector((state) => state.quotations.viewedBooking);

  // Function to handle Checkbox toggle
  const handleActiveChange = (orderId, checked) => {
    if (!checked) {
      alert("You cannot unfinalize a delivery.");
      return;
    }

    if (window.confirm("Are you sure you want to finalize this quotation delivery?")) {
      dispatch(finalizeDelivery(orderId))
        .unwrap()
        .then(() => {
          alert("Quotation delivery finalized successfully!");
          dispatch(fetchActiveBooking()); // refresh active quotations
        })
        .catch((error) => {
          alert(`Failed to finalize quotation delivery: ${error}`);
        });
    }
  };

  useEffect(() => {
    dispatch(fetchBookingRequest());
    dispatch(fetchCancelledBooking());
    dispatch(fetchActiveBooking());
    dispatch(revenueList());
  }, [dispatch])

  useEffect(() => {
    switch (selectedList) {
      case "request":
        dispatch(fetchBookingRequest());
        break;
      case "active":
        dispatch(fetchActiveBooking());
        break;
      case "cancelled":
        dispatch(fetchCancelledBooking());
        break;
      case "revenue":
        dispatch(revenueList());
        break;
      default:
        break;
    }
  }, [selectedList, dispatch]);

  const handleAdd = () => {
    navigate("/quotationform");
  };

  const isRevenueCardActive = activeCard === "revenue";
  const displayHeadCells = isRevenueCardActive ? revenueHeadCells : headCells;

  const handleCardClick = (type, route, cardId) => {
    setActiveCard(cardId);
    setSelectedList(type);
    setActiveCard(type);
    setPage(0);
    if (route) navigate(route);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleEmailSend = (bookingId) => {
    if (!bookingId) return;

    const confirmSend = window.confirm(
      "Are you sure you want to send this quotation via Email?"
    );

    if (!confirmSend) return;

    dispatch(sendBookingEmail(bookingId))
      .unwrap()
      .then(() => {
        setOpenEmailSnackbar(true);
      })
      .catch((err) => {
        alert(err || "Failed to send Email");
      });
  };

  const handleWhatsAppSend = (bookingId) => {
    if (!bookingId) return;

    const confirmSend = window.confirm(
      "Are you sure you want to send this quotation on WhatsApp?"
    );

    if (!confirmSend) return;

    dispatch(sendWhatsAppMsg(bookingId))
      .unwrap()
      .then(() => {
        setOpenWhatsappSnackbar(true);
      })
      .catch((err) => {
        alert(err || "Failed to send WhatsApp");
      });
  };

  const handleSlipClick = (bookingId) => {
    dispatch(viewBookingById(bookingId))
      .unwrap()
      .then(() => {
        setLocalModalOpen(true);
      })
      .catch((error) => {
        console.error("Error loading booking:", error);
      });
  };

  const handleCloseSlip = () => {
    setLocalModalOpen(false);
    dispatch(clearViewedBooking());
  };

  const dataSource = selectedList === "revenue" ? revenueData : bookingList;

  const filteredRows = Array.isArray(dataSource)
    ? dataSource.filter((row) => {
      const q = searchTerm.toLowerCase();

      return (
        row?.biltyNo?.toLowerCase().includes(q) ||
        row?.senderName?.toLowerCase().includes(q) ||
        row?.receiverName?.toLowerCase().includes(q) ||
        row?.contact?.toLowerCase().includes(q) ||
        row?.bookingId?.toLowerCase().includes(q) ||
        row?.Name?.toLowerCase().includes(q) ||
        row?.["Name (Drop)"]?.toLowerCase().includes(q) ||
        row?.Contact?.toLowerCase().includes(q) ||
        row?.["Booking ID"]?.toLowerCase().includes(q) ||
        row?.Date?.toLowerCase().includes(q) ||
        row?.quotationDate?.toLowerCase().includes(q)
      );
    })
    : [];


  const emptyRows = Math.max(0, (1 + page) * rowsPerPage - filteredRows.length);

  const sortedData = stableSort(filteredRows, getComparator(order, orderBy));
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const cardData = [
    {
      id: "request",
      title: "Booking",
      value: requestCount,
      subtitle: "Requests",
      duration: "0% (30 Days)",
      icon: <BookOnlineIcon fontSize="large" />,
      type: "request",
    },
    {
      id: "active",
      title: "Active ",
      value: activeDeliveriesCount,
      subtitle: "Deliveries",
      duration: "100% (30 Days)",
      icon: <LocalShippingIcon fontSize="large" />,
      type: "active",
    },
    {
      id: "cancelled",
      title: "Total Cancelled",
      value: cancelledDeliveriesCount,
      duration: "0% (30 Days)",
      icon: <CancelScheduleSendIcon fontSize="large" />,
      type: "cancelled"
    },
    {
      id: "revenue",
      value: totalRevenue,
      subtitle: "Total Revenue",
      duration: "100% (30 Days)",
      type: "revenue",
      icon: <AccountBalanceWalletIcon fontSize="large" />,
    },
  ];

  const handleDelete = (bookingId) => {
    if (window.confirm("Are you sure you want to delete this Quotation?")) {
      dispatch(deleteBooking(bookingId));
      dispatch(fetchBookingRequest());
    }
  };

  const handleView = (bookingId) => navigate(`/viewquotation/${bookingId}`);
  const handleUpdate = (bookingId) => navigate(`/updatequotation/${bookingId}`);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Manage Quotation
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} sx={{ textTransform: "none", fontWeight: 500 }}>
          Add Quotation
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ flexWrap: "nowrap", overflowX: "auto", mb: 4 }}>
        {cardData.map((card) => (
          <Grid item key={card.id} sx={{ minWidth: 220, flex: 1, display: "flex", borderRadius: 2 }}>
            <Card
              onClick={() => handleCardClick(card.type, card.route, card.id)}
              sx={{
                flex: 1,
                cursor: "pointer",
                border: activeCard === card.id ? `2px solid ${cardColor}` : "2px solid transparent",
                backgroundColor: activeCard === card.id ? cardLightColor : "background.paper",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: theme.shadows[6],
                  backgroundColor: cardLightColor,
                  "& .icon-container": {
                    backgroundColor: cardColor,
                    color: "#fff",
                  },
                },
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  className="icon-container"
                  sx={{
                    p: 1.5,
                    borderRadius: "50%",
                    backgroundColor: activeCard === card.id ? cardColor : cardLightColor,
                    color: activeCard === card.id ? "#fff" : cardColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                  }}
                >
                  {React.cloneElement(card.icon, { color: "inherit" })}
                </Box>
                <Stack spacing={0.5}>
                  <Typography variant="h5" fontWeight="bold" color={activeCard === card.id ? "primary" : "text.primary"}>
                    {card.value}
                  </Typography>
                  <Typography variant="subtitle1" color={activeCard === card.id ? "primary" : "text.primary"}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.subtitle}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {card.duration}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto', width: "100%", }}>
          <Table
            sx={{
              width: "100%",
              tableLayout: "fixed",
              "& .MuiTableCell-root": {
                padding: "6px 8px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }
            }}
          >
            <TableHead sx={{ backgroundColor: "#1565c0" }}>
              <TableRow>
                {displayHeadCells
                  .filter((headCell) => {
                    // Finalize column only for Active list
                    if (headCell.id === "active" && selectedList !== "active") return false;
                    return true;
                  })
                  .map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      sx={{
                        fontWeight: "bold",
                        color: "#fff",
                        whiteSpace: "nowrap",
                        backgroundColor: "#1565c0",
                        minWidth: headCell.width,
                        maxWidth: headCell.width,
                        width: headCell.width
                      }}
                      sortDirection={orderBy === headCell.id ? order : false}
                    >
                      {headCell.sortable ? (
                        <TableSortLabel
                          active={orderBy === headCell.id}
                          direction={orderBy === headCell.id ? order : "asc"}
                          onClick={() => handleRequestSort(headCell.id)}
                          sx={{ color: "#fff", "&.Mui-active": { color: "#fff" } }}
                        >
                          {headCell.label}
                        </TableSortLabel>
                      ) : (
                        headCell.label
                      )}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <TableRow key={row._id || index} hover>
                    {isRevenueCardActive ? (
                      <>
                        <TableCell sx={{ whiteSpace: "nowrap", minWidth: 80 }}>
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                        <Tooltip title={row.bookingId || ""} arrow>
                          <TableCell sx={{
                            whiteSpace: "nowrap", width: 120
                          }}>
                            {row.bookingId}
                          </TableCell>
                        </Tooltip>
                        <TableCell sx={{ whiteSpace: "nowrap", minWidth: 100 }}>
                          {formatDateToDDMMYYYY(row.date)}
                        </TableCell>
                        <Tooltip title={row.pickup || ""} arrow>
                          <TableCell sx={{
                            whiteSpace: "nowrap", width: 120
                          }}>
                            {row.pickup}
                          </TableCell>
                        </Tooltip>
                        <Tooltip title={row.drop || ""} arrow>
                          <TableCell sx={{ whiteSpace: "nowrap", minWidth: 80 }}>
                            {row.drop}
                          </TableCell>
                        </Tooltip>
                        <TableCell sx={{ whiteSpace: "nowrap", minWidth: 120 }}>
                          {row.revenue ?? "-"}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", minWidth: 100 }}>
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "nowrap" }}>
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleView(row['Booking ID'] || row.bookingId)}
                              title="View"
                              sx={{ minWidth: 'auto' }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        {/* Finalize Checkbox for Active Tab */}
                        {selectedList === "active" && (
                          <TableCell>
                            <Checkbox
                              checked={row.status === "Final Delivery"}
                              disabled={row.status === "Final Delivery"}
                              color="primary"
                              onChange={(e) => handleActiveChange(row.orderId, e.target.checked)}
                            />
                          </TableCell>
                        )}

                        <TableCell sx={{ whiteSpace: "nowrap", minWidth: 80 }}>
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", width: 130 }}>
                          {row.biltyNo || "-"}
                        </TableCell>
                        <Tooltip title={row.orderBy || row.bookingId || ""} arrow>
                          <TableCell sx={{ whiteSpace: "nowrap", minWidth: 120 }}>
                            {row.orderBy || row.bookingId}
                          </TableCell>
                        </Tooltip>
                        <TableCell sx={{ whiteSpace: "nowrap", minWidth: 100 }}>
                          {formatDateToDDMMYYYY(row.Date || row.quotationDate)}
                        </TableCell>
                        <Tooltip title={row.Name || row.senderName || ""} arrow>
                          <TableCell sx={{ whiteSpace: "nowrap", minWidth: 150 }}>
                            {row.Name || row.senderName}
                          </TableCell>
                        </Tooltip>
                        <Tooltip title={row.pickup || row.pickupCity || ""} arrow>
                          <TableCell sx={{ whiteSpace: "nowrap", minWidth: 150 }}>
                            {row.pickup || row.pickupCity}
                          </TableCell>
                        </Tooltip>
                        <Tooltip title={row["Name (Drop)"] || row.receiverName || ""} arrow>
                          <TableCell sx={{ whiteSpace: "nowrap", minWidth: 150 }}>
                            {row["Name (Drop)"] || row.receiverName}
                          </TableCell>
                        </Tooltip>
                        <Tooltip title={row.drop || row.dropCity || ""} arrow>
                          <TableCell sx={{ whiteSpace: "nowrap", minWidth: 150 }}>
                            {row.drop || row.dropCity}
                          </TableCell>
                        </Tooltip>
                        <Tooltip title={row.Contact || row.contact || ""} arrow>
                          <TableCell sx={{ whiteSpace: "nowrap", minWidth: 120 }}>
                            {row.Contact || row.contact}
                          </TableCell>
                        </Tooltip>
                        <TableCell sx={{ whiteSpace: "nowrap", minWidth: 250 }}>
                          <Box sx={{
                            display: "flex",
                            gap: 0.5,
                            flexWrap: "nowrap",
                          }}>
                            <Tooltip title="View" arrow>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleView(row['Booking ID'] || row.bookingId)}
                                sx={{ minWidth: 'auto', padding: '6px' }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit" arrow>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleUpdate(row['Booking ID'] || row.bookingId)}
                                sx={{ minWidth: 'auto', padding: '6px' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel" arrow>
                              <IconButton
                                size="small"
                                color="primary"
                                sx={{ minWidth: 'auto', padding: '6px' }}
                              >
                                <CancelScheduleSendIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" arrow>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(row['Booking ID'] || row.bookingId)}
                                sx={{ minWidth: 'auto', padding: '6px' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Send Email" arrow>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  handleEmailSend(row["Booking ID"] || row.bookingId)
                                }
                                sx={{ padding: "6px" }}
                              >
                                <SendIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Send WhatsApp" arrow>
                              <IconButton
                                size="small"
                                sx={{
                                  color: "#128C7E",
                                  backgroundColor: "#E6F4EA",
                                  padding: "6px",
                                  "&:hover": {
                                    backgroundColor: "#CDEEDB",
                                    color: "#075E54",
                                  }
                                }}
                                onClick={() =>
                                  handleWhatsAppSend(row["Booking ID"] || row.bookingId)
                                }
                              >
                                <WhatsAppIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Slip" arrow>
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleSlipClick(row['Booking ID'] || row.bookingId)}
                                sx={{ minWidth: 'auto', padding: '6px' }}
                              >
                                <ReceiptIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={selectedList === "active" ? 11 : 10} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      No data found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {emptyRows > 0 && filteredRows.length > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={selectedList === "active" ? 11 : 10} />
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        <QSlipModal
          open={localModalOpen}
          handleClose={handleCloseSlip}
          bookingData={booking}
        />

        <Snackbar
          open={openEmailSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenEmailSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setOpenEmailSnackbar(false)}
            severity="info"
            variant="filled"
          >
            Email sent successfully 📧
          </Alert>
        </Snackbar>

        <Snackbar
          open={openWhatsappSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenWhatsappSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setOpenWhatsappSnackbar(false)}
            severity="success"
            variant="filled"
          >
            WhatsApp message sent successfully 📲
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default QuotationCard;