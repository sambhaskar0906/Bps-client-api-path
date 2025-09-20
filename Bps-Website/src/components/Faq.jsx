import React from "react";
import {
    Container,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqs = [
    {
        question: "How can I book a courier with Bharat Parcel?",
        answer:
            "You can easily book your courier online through our website by entering pickup and delivery details. Bharat Parcel’s reliable courier service in India ensures your package reaches its destination safely and on time.",
    },
    {
        question: "Does Bharat Parcel provide parcel delivery across India?",
        answer:
            "Yes! We offer parcel delivery services in India covering 200+ cities. Whether it’s a small document or bulk shipment, we provide dependable delivery solutions nationwide.",
    },
    {
        question: "How can I track my parcel?",
        answer:
            "After booking, use your Order ID to track your courier anytime. Our real-time tracking system lets you monitor the status of your parcel from pickup to delivery.",
    },
    {
        question: "What types of parcels can I send through Bharat Parcel?",
        answer:
            "We handle a variety of parcels including documents, packages, bulk shipments, and offer customized solutions for both individuals and businesses. Our services make sending parcels in India easy and secure.",
    },
    {
        question: "How long does delivery take?",
        answer:
            "Delivery time depends on the distance and service type. Standard deliveries usually take 2–5 days, while express services are faster. Bharat Parcel ensures timely courier delivery across India.",
    },
    {
        question: "Are my parcels safe with Bharat Parcel?",
        answer:
            "Absolutely! Your parcels are safe with us. We ensure secure handling, proper packaging, and timely delivery, with tracking at every step for peace of mind.",
    },
];

const Faq = () => {
    return (
        <Container maxWidth="md" sx={{ my: 5 }}>
            <Typography
                variant="h2"
                align="center"
                gutterBottom
                sx={{ fontWeight: "bold", mb: 4 }}
            >
                Frequently Asked Questions (FAQs)
            </Typography>

            {faqs.map((faq, index) => (
                <Accordion
                    key={index}
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                        boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
                        "&:before": { display: "none" },
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ fontWeight: "bold" }}
                    >
                        <Typography variant="subtitle1" fontWeight="bold">
                            {index + 1}. {faq.question}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1" color="text.secondary">
                            {faq.answer}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Container>
    );
};

export default Faq;
