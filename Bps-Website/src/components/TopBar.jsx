import React from "react";
import {
  AppBar,
  Box,
  IconButton,
  Typography,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import logo from "../assets/Logo/logo2.png";

function TopBar({ scrolling }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (scrolling) return null; // Hide on scroll

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#f9fafc",
        transition: "all 0.3s ease-in-out",
        boxShadow: "0px 1px 4px rgba(0,0,0,0.1)",
        py: 0.3,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, sm: 4, md: 8 },
          minHeight: "50px",
        }}
      >
        {/* ---- Logo Section ---- */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Company Logo"
            sx={{
              height: { xs: 45, sm: 55 },
              width: "auto",
              objectFit: "contain",
              cursor: "pointer",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        </Box>

        {/* ---- Phone Info ---- */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "#e3f2fd",
            px: 2,
            py: 0.5,
            borderRadius: "20px",
            boxShadow: "0 0 5px rgba(0,0,0,0.1)",
          }}
        >
          <IconButton sx={{ color: "#1565c0", p: 0.5 }}>
            <LocalPhoneIcon fontSize="small" />
          </IconButton>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", sm: "column" },
              lineHeight: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#333",
                fontWeight: 600,
                display: { xs: "none", sm: "block" },
              }}
            >
              CALL US NOW
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#1565c0",
                fontWeight: 700,
                fontSize: "0.8rem",
                ml: { xs: 0.5, sm: 0 },
              }}
            >
              +91-6386963004
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
