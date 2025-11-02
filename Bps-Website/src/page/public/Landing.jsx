import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Grid,
} from "@mui/material";
import img1 from "../../assets/image1/warehouse.jpg";

function LandingPage() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: { xs: '100vh', md: '90vh' },
        display: "flex",
        alignItems: "center",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${img1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={4}
        >
          {/* LEFT CONTENT */}
          <Grid item xs={12} md={9}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2rem", md: "3rem" },
                lineHeight: 1.2,
                mb: 2,
              }}
            >
              Bharat Parcel Services Pvt. Ltd. & Parcel Delivery in India
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                fontSize: { xs: "1rem", md: "1.2rem" },
                mb: 4,
                maxWidth: "700px",
                opacity: 0.9,
              }}
            >
              Fast, secure, and affordable shipping with Bharat Parcel – trusted nationwide.
              Your trusted partner for courier and parcel delivery in India
            </Typography>

            {/* Tracking Form */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                mb: 3,
              }}
            >
              <TextField
                placeholder="Enter Tracking ID"
                variant="outlined"
                fullWidth
                InputProps={{
                  sx: {
                    backgroundColor: "white",
                    borderRadius: "8px",
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#FFD700",
                  color: "#000",
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#e6c200" },
                }}
              >
                Track
              </Button>
            </Box>

            {/* CTA Button */}
            <Button
              variant="outlined"
              sx={{
                borderColor: "#FFD700",
                color: "#FFD700",
                px: 4,
                py: 1.2,
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "rgba(255,215,0,0.1)",
                  borderColor: "#e6c200",
                },
              }}
            >
              Book a Shipment
            </Button>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}

export default LandingPage;
