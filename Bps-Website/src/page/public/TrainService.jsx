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
import TrainIcon from "@mui/icons-material/Train";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SecurityIcon from "@mui/icons-material/Security";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import logisticsBanner from "../../assets/train.jpg";

const TrainService = () => {
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
                    🚆 Train Courier Service in India | Bharat Parcel
                </Typography>
            </Box>

            {/* Intro */}
            <Box sx={{ py: 6, background: "linear-gradient(180deg, #f9f9f9, #ffffff)" }}>
                <Container>
                    <Typography variant="h2" align="center">
                        Choose Bharat Parcel’s Train Courier Service for affordable, reliable parcel
                        delivery of bulk goods, documents, and e-commerce shipments nationwide.
                    </Typography>
                </Container>
            </Box>

            {/* Overview */}
            <Box sx={{ py: 6, background: "#fff" }}>
                <Container>
                    <Typography variant="h2" fontWeight="bold" gutterBottom mb={2}>
                        Train Courier Service in India – Affordable & Reliable Parcel Delivery
                    </Typography>
                    <Typography variant="h4" mb={2}>
                        When you want the perfect balance of speed and affordability, Bharat Parcel’s
                        Train Courier Service is the ideal choice. Leveraging the vast Indian Railways
                        network, we ensure safe, reliable, and cost-effective parcel delivery across
                        cities and states in India.
                    </Typography>
                    <Typography variant="h4">
                        Our train courier solutions are designed for businesses, retailers, e-commerce
                        platforms, and individuals who require bulk shipments or medium-sized parcels
                        to be delivered on time without overspending.
                    </Typography>
                </Container>
            </Box>

            {/* Why Choose */}
            <Box sx={{ py: 6, background: "#f5f7fb" }}>
                <Container>
                    <Typography variant="h2" fontWeight="bold" gutterBottom align="center" mb={5}>
                        Why Choose Train Courier Service?
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            "Affordable delivery charges compared to air freight",
                            "Faster shipping than traditional road transport for long distances",
                            "On-time delivery with fixed train schedules",
                            "Safe & secure handling of goods in bulk",
                            "Wide connectivity across metro cities, tier-2 towns & rural areas",
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
                        Key Features of Bharat Parcel’s Train Courier Service
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            {
                                icon: <TrainIcon color="primary" />,
                                text: "Nationwide Connectivity – Express & superfast trains covering major routes",
                            },
                            {
                                icon: <LocalShippingIcon color="primary" />,
                                text: "Cost-Effective Shipping – Competitive rates for parcels & bulk goods",
                            },
                            {
                                icon: <SecurityIcon color="primary" />,
                                text: "Bulk Transport Capability – Ideal for wholesalers, retailers & manufacturers",
                            },
                            {
                                icon: <QueryBuilderIcon color="primary" />,
                                text: "Faster Than Road – Quicker long-distance deliveries than truck transport",
                            },
                            {
                                icon: <TrackChangesIcon color="primary" />,
                                text: "Real-Time Tracking – Monitor your shipment anytime online",
                            },
                            {
                                icon: <SupportAgentIcon color="primary" />,
                                text: "Secure Handling – Careful loading & unloading to protect your goods",
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
                        📦 What Can You Send via Train Courier?
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            "Business Consignments – Wholesale goods, retail stock & supplies",
                            "E-commerce Parcels – Faster bulk deliveries to multiple cities",
                            "Documents & Files – Secure intercity delivery for corporates",
                            "Personal Shipments – Luggage, household items & packages",
                            "Light Industrial Goods – Medium-scale cargo & products",
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
                        Benefits of Choosing Bharat Parcel’s Train Courier Service
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            "Affordable for Bulk Goods – Save more on large consignments.",
                            "Faster Than Road Transport – Reach destinations sooner via express trains.",
                            "Reliable Schedules – Consistent train timetables ensure timely delivery.",
                            "Pan-India Coverage – Door-to-door services connected with the railway network.",
                            "Eco-Friendly Shipping – Reduced carbon footprint compared to road transport.",
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
                            q: "Q1. How long does train courier delivery take?",
                            a: "Delivery depends on the train route, but it is generally faster than road courier for long distances.",
                        },
                        {
                            q: "Q2. Is train courier service cheaper than air courier?",
                            a: "Yes, train couriers are much more affordable while still offering speed and reliability.",
                        },
                        {
                            q: "Q3. Can I track my parcel sent via train?",
                            a: "Yes, Bharat Parcel provides real-time tracking for all shipments.",
                        },
                        {
                            q: "Q4. What type of parcels can I send by train?",
                            a: "You can send documents, personal items, bulk goods, e-commerce parcels & business consignments.",
                        },
                        {
                            q: "Q5. Do you provide door-to-door delivery with train courier service?",
                            a: "Yes, Bharat Parcel offers doorstep pickup and delivery, integrated with the railway network.",
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

export default TrainService;
