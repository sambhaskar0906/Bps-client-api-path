

import React from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Container,
} from "@mui/material";
import {
  DriveEta,
  IntegrationInstructions,
  LocalShipping,
  Star,
} from "@mui/icons-material";
import { styled } from "@mui/system";

const featureItems = [
  {
    title: "Experienced Drivers",
    Icon: DriveEta,
    description:
      "Seasoned professionals delivering reliability with every parcel",
  },
  {
    title: "Smart Integration",
    Icon: IntegrationInstructions,
    description: "Effortless connectivity with seamless system integration",
  },
  {
    title: "Fast Delivery",
    Icon: LocalShipping,
    description: "Swift dispatch ensuring prompt parcel arrival",
  },
  {
    title: "Premium Service",
    Icon: Star,
    description: "Excellence in every delivery - your parcel, our priority",
  },
];

const SectionHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.dark,
  marginBottom: theme.spacing(2),
  fontSize: "clamp(1.8rem, 5vw, 3.2rem)", // responsive size
  lineHeight: 1.2,
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2.5),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[4],
  },
}));

const FeatureIcon = styled("div")(({ theme }) => ({
  fontSize: 48,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
}));

const Portfolio = () => {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, sm: 6, md: 5 },
        px: { xs: 2, sm: 4, md: 8, lg: 16 },
        backgroundColor: "background.default",
      }}
    >
      <Grid
        container
        spacing={{ xs: 4, md: 5 }}
        alignItems="center"
        justifyContent="center"
      >
        {/* Left Content */}
        <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center" }}>
          <Box sx={{ maxWidth: 500, textAlign: { xs: "center", md: "left" } }}>
            <SectionHeading variant="h2" component="h2">
              Why Choose Bharat Parcel?
            </SectionHeading>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
              }}
            >
              When it comes to trusted{" "}
              <span style={{ fontWeight: "bold" }}>courier service in India</span> and
              secure{" "}
              <span style={{ fontWeight: "bold" }}>parcel delivery service in India</span>,
              Bharat Parcel makes shipping simple and reliable
            </Typography>
          </Box>
        </Grid>

        {/* Right Features */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            {featureItems.map(({ title, Icon, description }) => (
              <Grid item xs={12} sm={6} key={title}>
                <FeatureCard>
                  <FeatureIcon>
                    <Icon fontSize="inherit" color="inherit" />
                  </FeatureIcon>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                    }}
                  >
                    {description}
                  </Typography>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

    </Box>
  );
};

export default Portfolio;

