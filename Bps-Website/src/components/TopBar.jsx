import React from "react";
import {
  AppBar,
  Box,
  Typography,
  Toolbar,
  useMediaQuery,
  useTheme,
  Stack,
  Divider
} from "@mui/material";
import {
  LocalPhone as PhoneIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon
} from "@mui/icons-material";
import logo from "../assets/Logo/logo2.png";

function TopBar({ scrolling }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down(400));

  if (scrolling) return null;

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#ffffff",
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
        zIndex: 1201,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 1.5, sm: 3 },
          py: { xs: 0.8, sm: 1 },
          // height: { xs: "50px", sm: "50px" },
          // minHeight: { xs: "50px !important", sm: "50px !important" },
          // '&.MuiToolbar-root': {
          //   minHeight: { xs: "50px !important", sm: "50px !important" },
          // }
        }}
      >
        {/* Logo */}
        <Box
          component="img"
          src={logo}
          alt="Company Logo"
          sx={{
            height: { xs: "30px", sm: "38px" },
            width: "auto",
            objectFit: "contain",
          }}
        />

        {/* Contact Info - Super Mobile Friendly */}
        <Stack
          direction="row"
          spacing={{ xs: 0.8, sm: 1.5 }}
          alignItems="center"
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                height: "20px",
                alignSelf: "center",
                backgroundColor: "#e0e0e0"
              }}
            />
          }
        >

          {/* Delhi - Mobile Compact */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <LocationIcon sx={{
              color: "#1565c0",
              fontSize: { xs: "13px", sm: "16px" }
            }} />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "#333",
                  fontWeight: 600,
                  fontSize: { xs: "0.68rem", sm: "0.75rem" },
                  lineHeight: 1.1,
                  display: "block",
                }}
              >
                {isSmallMobile ? "DEL" : "Delhi"} | +91-7779993453
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#1565c0",
                  fontWeight: 500,
                  fontSize: { xs: "0.6rem", sm: "0.7rem" },
                  lineHeight: 1,
                  display: "block",
                }}
              >
                {isSmallMobile ? "HQ" : "Head Quarter"}
              </Typography>
            </Box>
          </Box>

          {/* Mumbai - Mobile Compact */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <LocationIcon sx={{
              color: "#2e7d32",
              fontSize: { xs: "13px", sm: "16px" }
            }} />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "#333",
                  fontWeight: 600,
                  fontSize: { xs: "0.68rem", sm: "0.75rem" },
                  lineHeight: 1.1,
                  display: "block",
                }}
              >
                {isSmallMobile ? "MUM" : "Mumbai"} | +91-7779993454
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#2e7d32",
                  fontWeight: 500,
                  fontSize: { xs: "0.6rem", sm: "0.7rem" },
                  lineHeight: 1,
                  display: "block",
                }}
              >
                Office
              </Typography>
            </Box>
          </Box>

          {/* Email - Hide on very small mobile */}
          {!isSmallMobile && !isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <EmailIcon sx={{ color: "#d32f2f", fontSize: { xs: "13px", sm: "16px" } }} />
              <Typography
                variant="caption"
                sx={{
                  color: "#333",
                  fontWeight: 600,
                  fontSize: { xs: "0.68rem", sm: "0.75rem" },
                  whiteSpace: "nowrap",
                }}
              >
                info@bharatparcel.org
              </Typography>
            </Box>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;