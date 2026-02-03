import React from "react";
import {
  Box,
  Typography,
  Grid,
  List,
  ListItem,
  Link,
  TextField,
  Button,
  Divider,
  Stack,
  Container,
  alpha,
  Grid2
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Send as SendIcon
} from "@mui/icons-material";

const Footer = () => {
  const quickLinks = [
    { text: "About Us", href: "/about" },
    { text: "Services", href: "/services" },
    { text: "Tracking", href: "/tracking" },
    { text: "Contact", href: "/contact" },
    { text: "Order", href: "/employer" }
  ];

  const addresses = [
    {
      title: "H.O. DELHI",
      address: "332, Kucha Ghasi Ram, Chandni Chowk, Fatehpuri, Delhi -110006 (7779993453)",
      phones: ["011-45138699", "7779993453"]
    },
    {
      title: "MUMBAI OFFICE",
      address: "1, Malharrao Wadi, Gr. Flr., R. No. 4, D.A Lane Kalbadevi Rd., Mumbai-400002 (7779993454)",
      phones: ["022-49711975", "7779993454"]
    }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#0d1b2a",
        color: "#fff",
        pt: 5,
        pb: 2,
        position: "relative",
        "&:before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
        }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Column 1: Company Info */}
          <Grid item xs={12} md={3}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" sx={{
                color: "#38f9d7",
                fontWeight: 600,
                letterSpacing: "1px",
                display: "block",
              }}>
                BHARAT PARCEL SERVICE
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: "#e0e0e0",
                lineHeight: 1.7,
                mb: 3,
              }}
            >
              Your parcel's whereabouts at your fingertips, delivering peace of mind across India with secure and reliable logistics solutions.
            </Typography>

            {/* Email Information */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <EmailIcon sx={{ color: "#38f9d7" }} />
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: "#fff" }}>
                  Email Address
                </Typography>
                <Typography variant="body2" sx={{ color: "#e0e0e0" }}>
                  info@bharatparcel.org
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Column 2: Quick Links */}
          <Grid item xs={12} md={2}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                position: "relative",
                "&:after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: 0,
                  width: "40px",
                  height: "3px",
                  background: "#38f9d7",
                  borderRadius: "2px",
                },
              }}
            >
              Quick Links
            </Typography>
            <List sx={{ p: 0 }}>
              {quickLinks.map((link) => (
                <ListItem key={link.text} sx={{ p: 0, mb: 1.5 }}>
                  <Link
                    href={link.href}
                    sx={{
                      color: "#e0e0e0",
                      textDecoration: "none",
                      display: "block",
                      "&:hover": {
                        color: "#38f9d7",
                        transform: "translateX(5px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {link.text}
                  </Link>
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Column 3: Contact Information - Address List */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                position: "relative",
                "&:after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: 0,
                  width: "40px",
                  height: "3px",
                  background: "#38f9d7",
                  borderRadius: "2px",
                },
              }}
            >
              Contact Us
            </Typography>

            <List sx={{ p: 0 }}>
              {addresses.map((office, index) => (
                <ListItem
                  key={index}
                  sx={{
                    p: 0,
                    mb: 1,
                    alignItems: "flex-start"
                  }}
                >
                  <Box sx={{ width: "100%" }}>
                    {/* Office Title */}
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      fontSize={'15px'}
                      sx={{
                        color: "#fff",
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                      }}
                    >
                      <LocationIcon fontSize="small" sx={{ color: office.title.includes("DELHI") ? "#667eea" : "#764ba2" }} />
                      {office.address}
                    </Typography>

                    {/* Divider between addresses */}
                    {index < addresses.length - 1 && (
                      <Divider sx={{
                        bgcolor: alpha("#fff", 0.1),
                        mt: 3,
                        mb: 2
                      }} />
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={3}>
            {/* Newsletter */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: "#fff", mb: 1.5 }}>
                Stay Updated
              </Typography>
              <Typography variant="body2" sx={{ color: "#e0e0e0", mb: 2 }}>
                Subscribe to our newsletter for the latest updates, offers, and logistics insights.
              </Typography>
              <Box component="form" sx={{ gap: 1 }}>
                <TextField
                  type="email"
                  placeholder="Your email address"
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 2,
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  sx={{
                    bgcolor: "#38f9d7",
                    color: "#0d1b2a",
                    fontWeight: 600,
                    borderRadius: 2,
                    minWidth: "auto",
                    px: 2,
                    "&:hover": {
                      bgcolor: "#2de0c6",
                    },
                  }}
                >
                  Subscribe
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ bgcolor: alpha("#fff", 0.1), my: 4 }} />

        {/* Bottom Section */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              color: "#a0a0a0",
              mb: 2,
              fontSize: "0.875rem"
            }}
          >
            © {new Date().getFullYear()} Bharat Parcel Service. All rights reserved.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1, sm: 3 }}
            justifyContent="center"
            alignItems="center"
          >
            <Link
              href="/terms-and-conditions"
              sx={{
                color: "#e0e0e0",
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": {
                  color: "#38f9d7",
                  textDecoration: "underline",
                },
              }}
            >
              Terms & Conditions
            </Link>
            <Box sx={{ color: alpha("#fff", 0.3), display: { xs: "none", sm: "block" } }}>•</Box>
            <Link
              href="/privacy-policy"
              sx={{
                color: "#e0e0e0",
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": {
                  color: "#38f9d7",
                  textDecoration: "underline",
                },
              }}
            >
              Privacy Policy
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;