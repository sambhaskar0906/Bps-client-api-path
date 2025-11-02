import React from "react";
import {
  AppBar,
  Box,
  IconButton,
  Typography,
  Toolbar,
  useMediaQuery,
  useTheme,
  Stack,
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
        backgroundColor: "#ffffff",
        transition: "all 0.3s ease-in-out",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
        py: 0.5,
        zIndex: 1201,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, sm: 4, md: 8 },
          minHeight: "55px",
        }}
      >
        {/* ---- Logo Section ---- */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Company Logo"
            sx={{
              height: { xs: 45, sm: 60 },
              width: "auto",
              objectFit: "contain",
              cursor: "pointer",
              filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.15))",
              transition: "transform 0.3s ease, filter 0.3s ease",
              "&:hover": {
                transform: "scale(1.07)",
                filter: "drop-shadow(0px 2px 6px rgba(0,0,0,0.2))",
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
            py: 0.6,
            borderRadius: "25px",
            boxShadow: "0 2px 6px rgba(21,101,192,0.2)",
            "&:hover": {
              backgroundColor: "#d0e4fb",
            },
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
            <Stack direction={'row'} spacing={5}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#333",
                    fontWeight: 600,
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Delhi Office (Headquarter)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#1565c0",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    ml: { xs: 0.5, sm: 0 },
                  }}
                >
                  +91-7779993453
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#333",
                    fontWeight: 600,
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Mumbai Office
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#1565c0",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    ml: { xs: 0.5, sm: 0 },
                  }}
                >
                  +91-7779993454
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
