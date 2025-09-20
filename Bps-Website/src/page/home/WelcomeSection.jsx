import {
  Box,
  Typography,
  Grid,
  useMediaQuery,
  useTheme,
  Paper,
} from "@mui/material";
import { styled, keyframes } from "@mui/system";
import img from "../../assets/image1/bps.png";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlaceIcon from "@mui/icons-material/Place";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

const StyledImage = styled("img")(({ theme }) => ({
  width: "100%",
  maxWidth: "420px",
  borderRadius: "20px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
  animation: `${float} 6s ease-in-out infinite`,
}));

const StatCard = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2),
  borderRadius: "16px",
  background: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(8px)",
  color: theme.palette.text.primary,
  transition: "all 0.3s ease",
  cursor: "default",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
  },
}));

const WelcomeSection = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const headingVariant = isXs ? "h3" : isSm ? "h3" : isMd ? "h2" : "h1";

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 4, md: 5 },
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
        "&:before": {
          content: '""',
          position: "absolute",
          top: -120,
          right: -120,
          width: "450px",
          height: "450px",
          background: `radial-gradient(circle at center, ${theme.palette.primary.light} 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(120px)",
          opacity: 0.4,
        },
      }}
    >
      <Grid container spacing={6} alignItems="center">
        {/* LEFT IMAGE */}
        <Grid item xs={12} md={6} sx={{ textAlign: "center" }}>
          <StyledImage src={img} alt="Welcome" />
        </Grid>

        {/* RIGHT CONTENT */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
              justifyContent: "center",
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Typography
              variant={headingVariant}
              gutterBottom
              sx={{
                fontWeight: 800,
                lineHeight: 1.2,
                mb: 3,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: `${fadeIn} 1s ease-out`,
                textTransform: "uppercase",
              }}
            >
              Welcome to Bharat Parcel
            </Typography>

            <Typography
              variant="h6"
              paragraph
              sx={{
                mb: 3,
                fontWeight: 700,
                fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
                color: theme.palette.text.secondary,
              }}
            >
              <Box component="span" sx={{ color: "primary.main" }}>
                Delivering Trust,
              </Box>{" "}
              One Parcel at a Time!
            </Typography>

            <Typography
              variant="body1"
              paragraph
              sx={{
                mb: 4,
                fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                lineHeight: 1.8,
              }}
            >
              At <b>Bharat Parcel</b>, we make shipping simple, fast, and
              reliable. With our trusted <b>courier service in India</b> and
              secure <b>parcel delivery service in India</b>, we ensure every
              shipment—big or small—reaches safely and on time. From documents
              to business packages, we deliver with speed, care, and peace of
              mind.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <StatCard elevation={0}>
                  <CheckCircleIcon sx={{ color: "success.main", mr: 1.5 }} />
                  <Typography variant="body1" fontWeight="600">
                    99% Delivery Success Rate
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatCard elevation={0}>
                  <PlaceIcon sx={{ color: "error.main", mr: 1.5 }} />
                  <Typography variant="body1" fontWeight="600">
                    200+ Cities Covered India
                  </Typography>
                </StatCard>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WelcomeSection;
