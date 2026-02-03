// ================= FULL UPDATED SUPERVISOR LIST COMPONENT =================
// Includes:
// Dashboard Cards
// Profile Image
// Email Column
// Start Station Column
// Modern UI
// Search + Sort + Pagination
// Status Menu

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Grid, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, TextField,
  InputAdornment, Menu, MenuItem, ListItemIcon, ListItemText,
  TablePagination, Button, Avatar, TableSortLabel, Chip
} from "@mui/material";
import {
  Search as SearchIcon, MoreVert as MoreVertIcon, Delete as DeleteIcon,
  Edit as EditIcon, Visibility as VisibilityIcon, CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon, Block as BlockIcon, PeopleAlt as PeopleAltIcon,
  PersonOff as PersonOffIcon, AdminPanelSettings as AdminPanelSettingsIcon,
  Email as EmailIcon, LocationOn as LocationOnIcon
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUser, updateStatus, activeList, activeSupervisorCount,
  deactivatedCount, blacklistedCount, adminCount,
  deactivatedList, blacklistedList, adminList,
} from "../../../features/user/userSlice";

// ---------------- Sorting Utils ----------------
function descendingComparator(a, b, orderBy) {
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

// ---------------- Table Headers ----------------
const headCells = [
  { id: "sno", label: "S.No", sortable: false },
  { id: "profile", label: "Profile", sortable: false },
  { id: "adminId", label: "Admin ID", sortable: true },
  { id: "name", label: "Name", sortable: true },
  { id: "email", label: "Email", sortable: true },
  { id: "contact", label: "Contact", sortable: true },
  { id: "startStation", label: "Start Station", sortable: true },
  { id: "action", label: "Action", sortable: false },
];

export default function SupervisorList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: userList = [], blackCount, deactivatedcount, admincount, activeCounts } = useSelector((state) => state.users);
  const normalizedUsers = Array.isArray(userList) ? userList : userList ? [userList] : [];

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [selectedList, setSelectedList] = useState("active");

  const open = Boolean(anchorEl);

  // ---------------- Dashboard Data ----------------
  const cardData = [
    { id: 1, title: "Supervisors", type: 'active', value: activeCounts, subtitle: "Active supervisors", icon: <PeopleAltIcon fontSize="large" />, bgColor: "#e0f7fa" },
    { id: 2, title: "Inactive", type: 'deactivated', value: deactivatedcount, subtitle: "Deactivated supervisors", icon: <PersonOffIcon fontSize="large" />, bgColor: "#fff3e0" },
    { id: 3, title: "Blacklisted", type: 'blacklisted', value: blackCount, subtitle: "Blacklisted supervisors", icon: <BlockIcon fontSize="large" />, bgColor: "#ffebee" },
    { id: 4, title: "Admins", type: 'admin', value: admincount, subtitle: "System administrators", icon: <AdminPanelSettingsIcon fontSize="large" />, bgColor: "#ede7f6" },
  ];

  // ---------------- Fetch Data ----------------
  const refreshAllData = async () => {
    setLoading(true);
    await Promise.all([
      dispatch(activeList()),
      dispatch(activeSupervisorCount()),
      dispatch(deactivatedCount()),
      dispatch(blacklistedCount()),
      dispatch(adminCount()),
    ]);
    setLoading(false);
  };

  useEffect(() => { refreshAllData(); }, [dispatch]);

  useEffect(() => {
    switch (selectedList) {
      case "active": dispatch(activeList()); break;
      case "deactivated": dispatch(deactivatedList()); break;
      case "blacklisted": dispatch(blacklistedList()); break;
      case "admin": dispatch(adminList()); break;
      default: break;
    }
  }, [selectedList, dispatch]);

  // ---------------- Alerts ----------------
  const showSuccess = (msg) => Swal.fire({ icon: "success", title: "Success", text: msg, timer: 1400, showConfirmButton: false });
  const showError = (msg) => Swal.fire({ icon: "error", title: "Error", text: msg });

  // ---------------- Handlers ----------------
  const handleAdd = () => navigate("/userform");
  const handleEdit = (adminId) => navigate(`/edituser/${adminId}`);
  const handleView = (adminId) => navigate(`/viewuser/${adminId}`);

  const handleMenuClick = (event, user) => { setAnchorEl(event.currentTarget); setSelectedUser(user); };
  const handleMenuClose = () => { setAnchorEl(null); setSelectedUser(null); };

  const handleDelete = async (adminId) => {
    const res = await dispatch(deleteUser(adminId));
    if (res.meta.requestStatus === "fulfilled") { showSuccess("Deleted Successfully"); refreshAllData(); }
    else showError("Delete Failed");
  };

  const handleStatusChange = async (adminId, action) => {
    const res = await dispatch(updateStatus({ adminId, action }));
    if (res.meta.requestStatus === "fulfilled") { showSuccess("Status Updated"); refreshAllData(); }
    else showError("Update Failed");
  };

  // ---------------- Filter ----------------
  const filteredUsers = normalizedUsers.filter((user) => {
    const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.toLowerCase();
    const adminId = user?.adminId?.toLowerCase() || "";
    const phone = user?.contactNumber?.toLowerCase() || "";
    const email = user?.emailId?.toLowerCase() || "";
    const station = user?.startStation?.toLowerCase() || "";
    const q = search.toLowerCase();

    return (
      fullName.includes(q) ||
      adminId.includes(q) ||
      phone.includes(q) ||
      email.includes(q) ||
      station.includes(q)
    );
  });


  return (
    <Box sx={{ p: 3 }}>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Admin Management</Typography>
        <Button variant="contained" onClick={handleAdd}>Add Admin</Button>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={2} mb={3}>
        {cardData.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.id}>
            <Card
              sx={{
                background: card.bgColor,
                boxShadow: 3,
                cursor: "pointer",
                border: selectedList === card.type ? `3px solid #1565c0` : "none",
                transition: "all 0.3s",
                '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 }
              }}
              onClick={() => setSelectedList(card.type)}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: "50%", background: "white" }}>{card.icon}</Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">{card.value || 0}</Typography>
                    <Typography fontWeight="600">{card.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{card.subtitle}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search */}
      <Card sx={{ p: 2, mb: 2 }}>
        <TextField
          placeholder="Search by name, email, station, ID"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          sx={{ width: 350 }}
        />
      </Card>

      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ background: "#1565c0" }}>
                <TableRow>
                  {headCells.map((headCell) => (
                    <TableCell key={headCell.id} sx={{ color: "white", fontWeight: "bold" }}>
                      {headCell.sortable ? (
                        <TableSortLabel
                          active={orderBy === headCell.id}
                          direction={orderBy === headCell.id ? order : 'asc'}
                          onClick={() => setOrderBy(headCell.id)}
                          sx={{ color: 'white' }}
                        >{headCell.label}</TableSortLabel>
                      ) : headCell.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {stableSort(filteredUsers, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user, index) => (
                    <TableRow key={user.adminId} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                      <TableCell>
                        <Avatar src={
                          user.adminProfilePhoto ||
                          user.profileImage ||
                          ""
                        } />
                      </TableCell>

                      <TableCell>{user.adminId}</TableCell>

                      <TableCell>
                        <Typography fontWeight="600">
                          {user.firstName || user.name || user.fullName || "N/A"} {user.lastName || ""}
                        </Typography>
                        <Chip size="small" label={user.role || "Supervisor"} />
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EmailIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {user.emailId || user.email || "N/A"}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>{user.contactNumber || user.phone || user.mobile || "N/A"}</TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOnIcon fontSize="small" color="error" />
                          <Typography variant="body2">
                            {user.startStation || user.station || "Not Assigned"}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" color="info" onClick={() => handleView(user.adminId)}><VisibilityIcon /></IconButton>
                          <IconButton size="small" color="primary" onClick={() => handleEdit(user.adminId)}><EditIcon /></IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(user.adminId)}><DeleteIcon /></IconButton>
                          <IconButton size="small" onClick={(e) => handleMenuClick(e, user)}><MoreVertIcon /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleStatusChange(selectedUser?.adminId, 'available')}>
          <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
          <ListItemText primary="Active" />
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedUser?.adminId, 'deactivated')}>
          <ListItemIcon><CancelIcon color="warning" /></ListItemIcon>
          <ListItemText primary="Inactive" />
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedUser?.adminId, 'blacklisted')}>
          <ListItemIcon><BlockIcon color="error" /></ListItemIcon>
          <ListItemText primary="Blacklisted" />
        </MenuItem>
      </Menu>

    </Box>
  );
}
