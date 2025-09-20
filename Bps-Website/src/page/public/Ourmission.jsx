import React from "react";
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SecurityIcon from "@mui/icons-material/Security";
import PublicIcon from "@mui/icons-material/Public";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const Ourmission = () => {
    return (
        <Box sx={{ py: 6, background: "linear-gradient(135deg, #f9f9f9, #eef3f8)" }}>
            <Container maxWidth="lg">
                {/* Who We Are */}
                <Typography
                    variant="h2"
                    align="center"
                    gutterBottom
                    sx={{ fontWeight: "bold", mb: 3, fontSize: "32px" }}
                >
                    Who We Are
                </Typography>
                <Typography
                    variant="body1"
                    align="center"
                    color="text.secondary"
                    sx={{ maxWidth: "800px", mx: "auto", mb: 5 }}
                >
                    Bharat Parcel is one of India’s trusted names in courier and parcel
                    delivery services, offering fast, reliable, and affordable solutions
                    across the country. With a strong logistics network and experienced
                    professionals, we specialize in Air, Train, and Road courier services,
                    making sure your shipment reaches its destination safely and on time.
                    <br />
                    <br />
                    We are committed to simplifying courier services for businesses,
                    e-commerce platforms, and individuals with technology-driven solutions
                    like real-time tracking, doorstep pickup, and transparent pricing.
                </Typography>

                {/* Mission & Vision */}
                <Grid container spacing={4} sx={{ mb: 6 }}>
                    <Grid item xs={12} md={6}>
                        <Card elevation={4} sx={{ borderRadius: 3, p: 2 }}>
                            <CardContent>
                                <Typography
                                    variant="h5"
                                    gutterBottom
                                    sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
                                >
                                    <VerifiedIcon sx={{ mr: 1, color: "primary.main" }} />
                                    Our Mission
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    To provide hassle-free, secure, and timely courier services
                                    that connect businesses and people across India, ensuring trust
                                    and convenience with every delivery.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={4} sx={{ borderRadius: 3, p: 2 }}>
                            <CardContent>
                                <Typography
                                    variant="h5"
                                    gutterBottom
                                    sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
                                >
                                    <FlightTakeoffIcon sx={{ mr: 1, color: "secondary.main" }} />
                                    Our Vision
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    To be recognized as India’s most reliable courier company,
                                    delivering not just parcels but also value, speed, and
                                    satisfaction to our customers nationwide.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Why Choose Bharat Parcel */}
                <Typography
                    variant="h2"
                    align="center"
                    gutterBottom
                    sx={{ fontWeight: "bold", mb: 4, fontSize: "32px" }}
                >
                    Why Choose Bharat Parcel?
                </Typography>
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {[
                        { text: "Nationwide Coverage – 200+ cities across India", icon: <PublicIcon color="primary" /> },
                        { text: "Multiple Courier Options – Air, Train & Road services", icon: <FlightTakeoffIcon color="secondary" /> },
                        { text: "Door-to-Door Convenience – Easy pickup & delivery", icon: <LocalShippingIcon color="success" /> },
                        { text: "Safe & Secure Handling – Special care for fragile & valuable parcels", icon: <SecurityIcon color="error" /> },
                        { text: "On-Time Delivery – Commitment to punctual service", icon: <AccessTimeIcon color="warning" /> },
                        { text: "Customer Support – 24/7 assistance for all courier needs", icon: <SupportAgentIcon color="info" /> },
                    ].map((item, i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <Card elevation={3} sx={{ borderRadius: 3, p: 2, height: "100%" }}>
                                <CardContent sx={{ textAlign: "center" }}>
                                    {item.icon}
                                    <Typography
                                        variant="body1"
                                        sx={{ mt: 1, fontWeight: 500 }}
                                        color="text.primary"
                                    >
                                        {item.text}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* What We Deliver */}
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{ fontWeight: "bold", mb: 3, fontSize: "32px" }}
                >
                    What We Deliver
                </Typography>

                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 3, p: 2 }}>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <BusinessCenterIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary="Documents & Legal Papers" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <LocalShippingIcon color="secondary" />
                                    </ListItemIcon>
                                    <ListItemText primary="E-commerce Orders & Retail Goods" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <WorkIcon color="success" />
                                    </ListItemIcon>
                                    <ListItemText primary="Bulk Cargo & Business Consignments" />
                                </ListItem>
                            </List>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 3, p: 2 }}>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <HealthAndSafetyIcon color="error" />
                                    </ListItemIcon>
                                    <ListItemText primary="Medical Supplies & Essentials" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <LocalShippingIcon color="info" />
                                    </ListItemIcon>
                                    <ListItemText primary="Personal Parcels, Gifts & Luggage" />
                                </ListItem>
                            </List>
                        </Card>
                    </Grid>
                </Grid>

                {/* Our Values */}
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{ fontWeight: "bold", mb: 4, fontSize: "32px" }}
                >
                    Our Values
                </Typography>
                <Grid container spacing={3}>
                    {[
                        { text: "Reliability – Delivering on time, every time", icon: <AccessTimeIcon color="success" /> },
                        { text: "Transparency – Clear pricing & real-time parcel tracking", icon: <ReceiptLongIcon color="primary" /> },
                        { text: "Customer First – Solutions tailored to your needs", icon: <PeopleIcon color="secondary" /> },
                        { text: "Innovation – Technology-driven logistics for faster service", icon: <EmojiObjectsIcon color="warning" /> },
                    ].map((item, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Card elevation={3} sx={{ borderRadius: 3, p: 2, height: "100%" }}>
                                <CardContent sx={{ textAlign: "center" }}>
                                    {item.icon}
                                    <Typography
                                        variant="body1"
                                        sx={{ mt: 1, fontWeight: 500 }}
                                        color="text.primary"
                                    >
                                        {item.text}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Ourmission;
