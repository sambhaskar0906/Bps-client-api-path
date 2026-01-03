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
} from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#1a1a1a",
        color: "#fff",
        pt: 6,
        px: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <Grid
        container
        spacing={4}
        sx={{
          pb: 4,
        }}
      >
        {/* CEO Section */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              borderBottom: "2px solid #fff",
              pb: 1,
              fontSize: { xs: "1.3rem", sm: "1.5rem" },
            }}
          >
            BPS
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textAlign: "justify",
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
            }}
          >
            Bharat Parcel Services – Your parcel's whereabouts at your
            fingertips, delivering peace of mind.
          </Typography>
        </Grid>

        {/* Quick Links */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              borderBottom: "2px solid #fff",
              pb: 1,
              fontSize: { xs: "1rem", sm: "1.2rem" },
            }}
          >
            Quick Links
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <List sx={{ p: 0 }}>
                {["About Us", "Services", "How to Track", "Testimonial"].map(
                  (text) => (
                    <ListItem key={text} sx={{ p: 0.5 }}>
                      <Link
                        href={text === "About Us" ? "/about" :
                          text === "Services" ? "/services" : "#"}
                        color="inherit"
                        underline="hover"
                        fontSize="0.9rem"
                      >
                        {text}
                      </Link>
                    </ListItem>
                  )
                )}
              </List>
            </Grid>
            <Grid item xs={6}>
              <List sx={{ p: 0 }}>
                {["Rail Shipping", "Logistic Solutions", "Cargo Shipping"].map(
                  (text) => (
                    <ListItem key={text} sx={{ p: 0.5 }}>
                      <Link
                        href="#"
                        color="inherit"
                        underline="hover"
                        fontSize="0.9rem"
                      >
                        {text}
                      </Link>
                    </ListItem>
                  )
                )}
              </List>
            </Grid>
          </Grid>
        </Grid>

        {/* Newsletter Signup */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              borderBottom: "2px solid #fff",
              pb: 1,
              fontSize: { xs: "1rem", sm: "1.2rem" },
            }}
          >
            Newsletter Signup
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 2, fontSize: { xs: "0.85rem", sm: "0.95rem" } }}
          >
            Subscribe for weekly updates about new offers and discounts.
          </Typography>
          <Box
            component="form"
            sx={{
              mt: 2,
              display: "flex",
              flexDirection: { xs: "row", sm: "column", md: "column" },
              gap: 1.5,
            }}
          >
            <TextField
              type="email"
              placeholder="Enter your email"
              variant="outlined"
              size="small"
              required
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                input: { color: "#000", fontSize: "1rem" },
                flex: 1,
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: "#f04",
                ":hover": { bgcolor: "#d03" },
                borderRadius: 2,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              Subscribe
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ bgcolor: "#fff", opacity: 0.2 }} />

      {/* Bottom Section */}
      <Box sx={{ textAlign: "center", py: 3 }}>
        <Typography
          variant="body2"
          sx={{ mb: 1, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          © {new Date().getFullYear()} All rights reserved by{" "}
          <Link
            href="https://themeforest.net/user/designthemes"
            color="inherit"
            underline="hover"
            target="_blank"
            rel="noopener"
          >
            Spirale infosoft
          </Link>
        </Typography>

        {/* Terms and Privacy Links */}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 3 }}>
          <Link
            href="/terms-and-conditions"
            color="inherit"
            underline="hover"
            sx={{ fontSize: "0.875rem" }}
          >
            Terms & Conditions
          </Link>
          <Link
            href="/privacy-policy"
            color="inherit"
            underline="hover"
            sx={{ fontSize: "0.875rem" }}
          >
            Privacy Policy
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;