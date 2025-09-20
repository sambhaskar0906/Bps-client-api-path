import React from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useNavigate } from "react-router-dom";
import logisticsBanner from "../../assets/image1/Service.jpg";
import img1 from "../../assets/train.jpg";
import img2 from "../../assets/road.webp";
import img3 from "../../assets/air1.jpg";

// Services data with routes
const logisticsServices = [
  {
    id: 1,
    title: "Air Courier Service",
    desc: "Send parcels quickly with Bharat Parcel’s Air Courier Service – offering safe, secure, and same-day delivery across 200+ Indian cities.",
    imgpath: img3,
    route: "/services/air-courier",
  },
  {
    id: 2,
    title: "Train Courier Services",
    desc: "Choose Bharat Parcel’s Train Courier Service for affordable, reliable parcel delivery of bulk goods, documents, and e-commerce shipments nationwide.",
    imgpath: img1,
    route: "/services/train-courier",
  },
  {
    id: 3,
    title: "Road Courier Service",
    desc: "Experience hassle-free shipping with Bharat Parcel’s Road Courier Service, providing affordable door-to-door delivery and trusted last-mile connectivity across India.",
    imgpath: img2,
    route: "/services/road-courier",
  },
];

const Services = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleCardClick = React.useCallback(
    (route) => {
      navigate(route);
    },
    [navigate]
  );

  return (
    <Box sx={{ overflow: "hidden" }}>
      {/* Banner */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 250, sm: 300, md: 350, lg: 350 },
          mt: { xs: 4, sm: 5, md: 6 },
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${logisticsBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 2, sm: 4, md: 6, lg: 10 },
        }}
      >
        <Typography
          variant="h1"
          sx={{
            color: "white",
            fontWeight: 900,
            fontSize: { xs: "2.5rem", sm: "2.5rem", md: "3rem" },
            textAlign: "center",
            textShadow: "3px 3px 10px rgba(0,0,0,0.7)",
          }}
        >
          Services - Bharat Parcel
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: { xs: 2, sm: 4, md: 8, lg: 12 }, py: 6 }}>
        <Grid container spacing={4}>
          {/* Services Grid */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {logisticsServices.map((service) => (
                <Grid item xs={12} sm={6} key={service.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.02)" },
                    }}
                    onClick={() => handleCardClick(service.route)}
                  >
                    <Box
                      component="img"
                      src={service.imgpath}
                      alt={service.title}
                      sx={{ width: "100%", height: 200, objectFit: "cover" }}
                      loading="lazy"
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" color="#002b5b" gutterBottom>
                        {service.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                bgcolor: "#ffc107",
                p: 3,
                mb: 3,
                boxShadow: 1,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Need Logistics Support?
              </Typography>
              <Typography variant="body2">
                Contact our expert team for tailored logistics solutions or
                submit an inquiry today.
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#002b5b",
                    "&:hover": { bgcolor: "#001f3f" },
                  }}
                  startIcon={<PhoneIcon />}
                >
                  Get in Touch
                </Button>
              </Box>
            </Card>

            <Button
              variant="contained"
              fullWidth
              sx={{
                mb: 3,
                bgcolor: "#002b5b",
                "&:hover": { bgcolor: "#ffc107", color: "black" },
              }}
              startIcon={<LocalShippingIcon />}
            >
              Request a Quote
            </Button>

            <Card sx={{ p: 3, boxShadow: 1 }}>
              <Typography variant="body1" paragraph>
                "Their logistics expertise transformed our supply chain
                efficiency. Reliable service and great communication!"
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Services;
