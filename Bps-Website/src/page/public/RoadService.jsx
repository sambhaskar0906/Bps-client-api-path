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
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SecurityIcon from "@mui/icons-material/Security";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import logisticsBanner from "../../assets/road.webp";

const RoadService = () => {
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
                    🚚 Road Courier Service in India | Bharat Parcel
                </Typography>
            </Box>

            {/* Intro */}
            <Box sx={{ py: 6, background: "linear-gradient(180deg, #f9f9f9, #ffffff)" }}>
                <Container>
                    <Typography variant="h2" align="center">
                        Experience hassle-free shipping with Bharat Parcel’s Road Courier Service,
                        providing affordable door-to-door delivery and trusted last-mile connectivity
                        across India.
                    </Typography>
                </Container>
            </Box>

            {/* Overview */}
            <Box sx={{ py: 6, background: "#fff" }}>
                <Container>
                    <Typography variant="h2" fontWeight="bold" gutterBottom mb={2}>
                        Road Courier Service in India – Door-to-Door Parcel Delivery Made Easy
                    </Typography>
                    <Typography variant="h4" mb={2}>
                        When it comes to door-to-door convenience and wide accessibility, nothing beats
                        Bharat Parcel’s Road Courier Service. With a strong fleet of trucks, vans, and
                        delivery partners, we connect metros, tier-2 cities, and even rural towns to
                        ensure your parcel reaches safely, no matter where the destination is.
                    </Typography>
                    <Typography variant="h4">
                        Our road courier network is designed for small parcels, bulk cargo, e-commerce
                        orders, and personal deliveries. With flexible pricing and reliable handling,
                        we make road transport the most affordable courier option for individuals and
                        businesses.
                    </Typography>
                </Container>
            </Box>

            {/* Why Choose */}
            <Box sx={{ py: 6, background: "#f5f7fb" }}>
                <Container>
                    <Typography variant="h2" fontWeight="bold" gutterBottom align="center" mb={5}>
                        Why Choose Road Courier Service?
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            "Door-to-door pickup and delivery for maximum convenience",
                            "Affordable courier charges compared to air and train",
                            "Last-mile connectivity to remote towns and villages",
                            "Flexible shipment sizes from small parcels to heavy cargo",
                            "Reliable scheduling for regular business deliveries",
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
                </Container>
            </Box>

            {/* Key Features */}
            <Box sx={{ py: 6, background: "#fff" }}>
                <Container>
                    <Typography variant="h2" fontWeight="bold" gutterBottom align="center" mb={5}>
                        Key Features of Bharat Parcel’s Road Courier Service
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            {
                                icon: <LocalShippingIcon color="primary" />,
                                text: "Pan-India Connectivity – Covering metros, tier-2 cities & rural areas",
                            },
                            {
                                icon: <DirectionsCarIcon color="primary" />,
                                text: "Doorstep Pickup & Delivery – Hassle-free courier booking",
                            },
                            {
                                icon: <SecurityIcon color="primary" />,
                                text: "Affordable Shipping – Best rates for individuals & businesses",
                            },
                            {
                                icon: <QueryBuilderIcon color="primary" />,
                                text: "Flexible Cargo Handling – From small packages to bulk consignments",
                            },
                            {
                                icon: <TrackChangesIcon color="primary" />,
                                text: "E-commerce Friendly – Perfect for order fulfillment & last-mile logistics",
                            },
                            {
                                icon: <SupportAgentIcon color="primary" />,
                                text: "Real-Time Tracking – Stay updated on your shipment status",
                            },
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
                        📦 What Can You Send via Road Courier?
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            "E-commerce Orders – COD deliveries, online store shipments",
                            "Retail Goods – Daily stock supplies for shops & wholesalers",
                            "Documents & Files – Reliable intercity delivery for corporates",
                            "Personal Parcels – Gifts, luggage, and household items",
                            "Bulk Cargo – Heavy shipments for traders & manufacturers",
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
                        Benefits of Choosing Bharat Parcel’s Road Courier Service
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            "Most Affordable Option – Perfect for regular shipments & bulk deliveries.",
                            "Door-to-Door Delivery – Save time with doorstep pickup and drop-off.",
                            "Last-Mile Connectivity – Reach even the remotest villages in India.",
                            "Flexible Shipping – From small parcels to large industrial goods.",
                            "Trusted Network – Strong road transport fleet with trained professionals.",
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
            <Box sx={{ py: 6, background: "#f5f7fb" }}>
                <Container maxWidth="md">
                    <Typography variant="h2" fontWeight="bold" gutterBottom align="center" mb={2}>
                        ❓ Frequently Asked Questions (FAQs)
                    </Typography>
                    {[
                        {
                            q: "Q1. How long does road courier delivery take?",
                            a: "Delivery depends on the distance and route, but typically 1–7 days across India.",
                        },
                        {
                            q: "Q2. Is road courier service cheaper than air or train?",
                            a: "Yes, road courier is the most cost-effective shipping option.",
                        },
                        {
                            q: "Q3. Can I send heavy or bulk shipments by road?",
                            a: "Yes, Bharat Parcel can handle bulk cargo, heavy parcels, and large consignments.",
                        },
                        {
                            q: "Q4. Do you provide doorstep pickup and delivery?",
                            a: "Yes, our road courier service is door-to-door for complete convenience.",
                        },
                        {
                            q: "Q5. Can I track my parcel online?",
                            a: "Absolutely. All road shipments include real-time tracking for peace of mind.",
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

export default RoadService;
