import React from "react";
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FlightIcon from "@mui/icons-material/Flight";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SecurityIcon from "@mui/icons-material/Security";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import logisticsBanner from "../../assets/air1.jpg";

const AirService = () => {
    return (
        <>
            {/* Banner */}
            <Box
                sx={{
                    position: "relative",
                    height: { xs: 220, sm: 300, md: 400 },
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${logisticsBanner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    px: 2,
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
                        textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
                    }}
                >
                    ✈️ Express Air Courier Service in India | Bharat Parcel
                </Typography>
            </Box>

            {/* Intro */}
            <Box sx={{ py: 6, background: "linear-gradient(180deg, #f9f9f9, #ffffff)" }}>
                <Container>
                    <Typography variant="h2" align="center">
                        Send parcels quickly with Bharat Parcel’s Air Courier Service – offering safe,
                        secure, and same-day delivery across 200+ Indian cities.
                    </Typography>
                </Container>
            </Box>

            {/* Overview */}
            <Box sx={{ py: 6, background: "#fff" }}>
                <Container>
                    <Typography variant="h2" fontWeight="bold" gutterBottom mb={2}>
                        Air Courier Service in India – Fastest Parcel Delivery with Bharat Parcel
                    </Typography>
                    <Typography variant="h4" mb={2}>
                        Air Courier Service is the fastest and most reliable way to send shipments
                        across India. At Bharat Parcel, we provide express air cargo and courier
                        solutions designed for urgent documents, parcels, and high-value consignments.
                        With a wide air network covering 200+ cities, our service ensures your packages
                        reach their destination safely and on time.
                    </Typography>
                    <Typography variant="h4">
                        Whether you’re a business requiring time-sensitive deliveries or an individual
                        sending personal parcels, our air courier service offers the speed, security,
                        and reliability you need.
                    </Typography>
                </Container>
            </Box>

            {/* Why Choose */}
            <Box sx={{ py: 6, background: "#f5f7fb" }}>
                <Container>
                    <Typography variant="h2" fontWeight="bold" gutterBottom align="center" mb={5}>
                        Why Choose Air Courier Service?
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            "Same-day or next-day delivery across major Indian cities",
                            "Faster intercity shipments for urgent business needs",
                            "Secure handling of fragile, confidential, or high-value parcels",
                            "Reliable service with minimal risk of delays",
                        ].map((point, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                    <CardContent>
                                        <Typography variant="h4">{point}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    <Typography variant="h4" paragraph sx={{ mt: 3 }}>
                        At Bharat Parcel, our air delivery network connects metros, tier-2 cities,
                        and even remote regions, ensuring seamless parcel delivery nationwide.
                    </Typography>
                </Container>
            </Box>

            {/* Key Features */}
            <Box sx={{ py: 6, background: "#fff" }}>
                <Container>
                    <Typography variant="h2" fontWeight="bold" gutterBottom align="center" mb={5}>
                        Key Features of Bharat Parcel’s Air Courier Service
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            { icon: <QueryBuilderIcon color="primary" />, text: "Fastest Delivery – Same-day or next-day shipping across India" },
                            { icon: <FlightIcon color="primary" />, text: "Nationwide Reach – Air cargo network spanning 200+ cities" },
                            { icon: <TrackChangesIcon color="primary" />, text: "Real-Time Tracking – Monitor your parcel online anytime" },
                            { icon: <SecurityIcon color="primary" />, text: "Safe Handling – Special care for fragile and valuable shipments" },
                            { icon: <LocalShippingIcon color="primary" />, text: "Business-Friendly – Ideal for e-commerce, corporate & exporters" },
                            { icon: <SupportAgentIcon color="primary" />, text: "Doorstep Pickup – Hassle-free parcel booking from your location" },
                        ].map((f, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
                                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        {f.icon}
                                        <Typography variant="h4">{f.text}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* What Can You Send */}
            <Box sx={{ py: 6, background: "#f5f7fb" }}>
                <Container>
                    <Typography variant="h2" fontWeight="bold" gutterBottom align="center" mb={5}>
                        📦 What Can You Send via Air Courier?
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            "Documents & Legal Papers – Urgent contracts, invoices, tenders",
                            "E-commerce Orders – Fast shipping for online businesses",
                            "Medical Supplies – Critical medicines & health essentials",
                            "Electronics & Gadgets – Secure handling of high-value items",
                            "Personal Parcels – Gifts, packages, and personal items",
                            "Bulk Cargo – Lightweight or urgent goods for manufacturers & traders",
                        ].map((item, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                    <CardContent>
                                        <Typography variant="h4">{item}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Benefits */}
            <Box sx={{ py: 6, background: "#fff" }}>
                <Container>
                    <Typography variant="h2" fontWeight="bold" gutterBottom align="center" mb={5}>
                        Benefits of Choosing Bharat Parcel’s Air Courier Service
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            "Speed & Efficiency – Get your parcels delivered faster than any other mode.",
                            "24/7 Availability – Book shipments anytime, anywhere.",
                            "Cost-Effective Express Solutions – Affordable rates for urgent deliveries.",
                            "Tracking & Transparency – Stay updated with live parcel status.",
                            "Dedicated Support – Customer care available for assistance at every step.",
                        ].map((item, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                    <CardContent>
                                        <Typography variant="h4">{item}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Industries */}
            <Box sx={{ py: 6, background: "#f5f7fb" }}>
                <Container>
                    <Typography variant="h2" fontWeight="bold" gutterBottom align="center" mb={5}>
                        Industries We Serve
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            "E-commerce & Online Stores – for express shipping",
                            "Corporate Companies – for confidential documents",
                            "Healthcare & Pharma – for urgent medicine delivery",
                            "Exporters & Importers – for lightweight cargo shipments",
                            "Individuals & Students – for personal parcel needs",
                        ].map((item, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                    <CardContent>
                                        <Typography variant="h4">{item}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* FAQs */}
            <Box sx={{ py: 6, background: "#fff" }}>
                <Container maxWidth="md">
                    <Typography variant="h2" fontWeight="bold" gutterBottom align="center" mb={2}>
                        ❓ Frequently Asked Questions (FAQs)
                    </Typography>
                    {[
                        {
                            q: "Q1. How fast is Bharat Parcel’s Air Courier Service?",
                            a: "Most air courier shipments are delivered same-day or next-day across major cities.",
                        },
                        {
                            q: "Q2. Can I track my parcel online?",
                            a: "Yes, every air shipment comes with real-time tracking for complete transparency.",
                        },
                        {
                            q: "Q3. What items are allowed for air courier delivery?",
                            a: "You can send documents, parcels, electronics, gifts, medicines, and bulk lightweight cargo (except restricted items).",
                        },
                        {
                            q: "Q4. Is air courier service expensive?",
                            a: "While air courier is costlier than train or road, it’s the best option for urgent deliveries.",
                        },
                        {
                            q: "Q5. Do you provide pickup from home or office?",
                            a: "Yes, Bharat Parcel offers doorstep pickup and delivery for air courier shipments.",
                        },
                    ].map((faq, i) => (
                        <Accordion key={i} sx={{ mb: 2, borderRadius: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight="bold">{faq.q}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>{faq.a}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Container>
            </Box>
        </>
    );
};

export default AirService;
