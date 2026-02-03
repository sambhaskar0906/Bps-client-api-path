import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  Button,
  Stack,
  Divider,
  alpha
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  BusinessCenter as ServicesIcon,
  ContactMail as ContactIcon,
  ShoppingCart as OrderIcon,
  Login as LoginIcon
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import logo from '../assets/Logo/logo2.png';

const navLinks = [
  { to: "/", label: "Home", icon: <HomeIcon /> },
  { to: "/about", label: "About", icon: <InfoIcon /> },
  { to: "/services", label: "Services", icon: <ServicesIcon /> },
  { to: "/contact", label: "Contact", icon: <ContactIcon /> },
  { to: "/employer", label: "Order", icon: <OrderIcon /> },
  { to: "/login", label: "Login", icon: <LoginIcon /> },
];

const PublicAppBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setScrolling(scrolled);
      setShowLogo(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate TopBar height for drawer offset
  const drawerOffset = isMobile ? 28 : 0; // Adjust based on your TopBar height

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1300,
          backgroundColor: scrolling ? "white" : "transparent",
          boxShadow: scrolling ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
          transition: "all 0.3s ease",
          borderBottom: scrolling ? "1px solid #e0e0e0" : "none",
        }}
      >
        <TopBar scrolling={scrolling} />

        <Box sx={{ position: "relative" }}>
          <Toolbar
            sx={{
              minHeight: "50px !important",
              height: "50px",
              px: { xs: 2, sm: 3, md: 4 },
              transition: "all 0.3s ease",
            }}
          >
            {/* Logo - Only shows when scrolling */}
            {showLogo && (
              <Box
                component="img"
                src={logo}
                alt="BPS Logo"
                onClick={() => navigate("/")}
                sx={{
                  height: "35px",
                  width: "auto",
                  objectFit: "contain",
                  cursor: "pointer",
                  mr: { md: 3 },
                  opacity: scrolling ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  position: "absolute",
                  left: { xs: "16px", sm: "24px", md: "32px" },
                }}
              />
            )}

            {/* Desktop Navigation - All items in BOLD */}
            {!isMobile && (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  flexGrow: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  ml: showLogo ? "100px" : 0,
                  transition: "margin-left 0.3s ease"
                }}
              >
                {navLinks.slice(0, 5).map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Button
                      key={link.label}
                      onClick={() => navigate(link.to)}
                      sx={{
                        color: scrolling ? "#333" : "white",
                        fontWeight: 700, // All items in BOLD
                        fontSize: "0.85rem",
                        textTransform: "none",
                        px: 2,
                        py: 0.6,
                        borderRadius: "4px",
                        position: "relative",
                        overflow: "hidden",
                        "&:before": {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          width: isActive ? "100%" : "0%",
                          height: "2px",
                          backgroundColor: scrolling ? "#1565c0" : "#FFD700",
                          transition: "width 0.3s ease",
                        },
                        "&:hover": {
                          backgroundColor: scrolling
                            ? alpha("#1565c0", 0.05)
                            : alpha("#ffffff", 0.1),
                          color: scrolling ? "#1565c0" : "#FFD700",
                          "&:before": {
                            width: "100%",
                          },
                        },
                      }}
                    >
                      {link.label}
                    </Button>
                  );
                })}
              </Stack>
            )}

            {/* Login Button (Desktop) - Also in BOLD */}
            {!isMobile && (
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{
                  backgroundColor: "#00c853",
                  color: "white",
                  fontWeight: 700, // BOLD
                  fontSize: "0.85rem",
                  textTransform: "none",
                  borderRadius: "4px",
                  px: 2.5,
                  py: 0.6,
                  boxShadow: "0 2px 8px rgba(0,200,83,0.3)",
                  "&:hover": {
                    backgroundColor: "#00b248",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(0,200,83,0.4)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Box sx={{
                display: "flex",
                alignItems: "center",
                ml: "auto",
                gap: 1
              }}>
                <IconButton
                  onClick={() => setDrawerOpen(true)}
                  sx={{
                    color: scrolling ? "#333" : "white",
                    backgroundColor: scrolling
                      ? alpha("#1565c0", 0.1)
                      : alpha("#ffffff", 0.1),
                    width: "36px",
                    height: "36px",
                    "&:hover": {
                      backgroundColor: scrolling
                        ? alpha("#1565c0", 0.2)
                        : alpha("#ffffff", 0.2),
                    },
                    position: "relative",
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "20px",
                      height: "3px",
                      backgroundColor: scrolling ? "#1565c0" : "#FFD700",
                      borderRadius: "3px",
                    }
                  }}
                >
                  <MenuIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </Box>
      </AppBar>

      {/* Mobile Drawer - Opens from below TopBar */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{
          BackdropProps: {
            style: {
              backgroundColor: 'rgba(0,0,0,0.5)',
            }
          }
        }}
        PaperProps={{
          sx: {
            width: "220px",
            borderLeft: "2px solid #1565c0",
            height: `calc(95% - ${drawerOffset}px)`, // Offset from top
            top: `${drawerOffset}px`, // Start below TopBar
            mt: `${drawerOffset}px`,
            borderTopLeftRadius: "12px",
            borderBottomLeftRadius: "12px",
          }
        }}
      >
        {/* Drawer Header */}
        <Box sx={{
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e0e0e0",
          background: "linear-gradient(90deg, #1565c0 0%, #2196f3 100%)",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              component="img"
              src={logo}
              alt="BPS Logo"
              sx={{
                height: "30px",
                width: "auto",
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">
                BPS
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.8)">
                Bharat Parcel Service
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation List - All items in BOLD */}
        <List sx={{ p: 0 }}>
          {navLinks.map((link, index) => {
            const isActive = location.pathname === link.to;
            return (
              <React.Fragment key={link.label}>
                <ListItem
                  onClick={() => {
                    navigate(link.to);
                    setDrawerOpen(false);
                  }}
                  sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: isActive ? "#e3f2fd" : "transparent",
                    borderLeft: isActive ? "4px solid #1565c0" : "4px solid transparent",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  <Box sx={{
                    color: isActive ? "#1565c0" : "#666",
                    mr: 2,
                    display: "flex",
                    alignItems: "center"
                  }}>
                    {link.icon}
                  </Box>
                  <ListItemText
                    primary={
                      <Typography
                        fontWeight={700} // All items in BOLD
                        color={isActive ? "#1565c0" : "#333"}
                        fontSize="0.80rem"
                      >
                        {link.label}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < navLinks.length - 1 && (
                  <Divider sx={{ my: 0.5 }} />
                )}
              </React.Fragment>
            );
          })}
        </List>

        {/* Drawer Footer */}
        <Box sx={{
          mt: 'auto',
          p: 2,
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0'
        }}>
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontSize: '0.75rem',
              display: 'block',
              textAlign: 'center'
            }}
          >
            © 2026 BPS Logistics
          </Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default PublicAppBar;