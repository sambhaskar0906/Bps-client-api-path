import React from "react";
import { Box, Typography, Container } from "@mui/material";

const PrivacyPolicy = () => {
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Privacy Policy
            </Typography>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">1. Information Collection</Typography>
                <Typography variant="body1">
                    We may collect personal information such as name, mobile number, email address, pickup and delivery addresses, shipment details, tracking information, and communication records solely for the purpose of providing our services efficiently.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">2. Use of Information</Typography>
                <Typography variant="body1">
                    The information collected is used for booking consignments, processing deliveries, providing shipment tracking and updates, customer support, service-related communication, and for compliance with legal and regulatory obligations.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">3. WhatsApp Communication</Typography>
                <Typography variant="body1">
                    By providing your mobile number, you consent to receive shipment updates, delivery notifications, and service-related messages through WhatsApp Business API. We do not send unsolicited promotional or spam messages without explicit consent.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">4. Sharing of Information</Typography>
                <Typography variant="body1">
                    We do not sell, rent, or trade personal information to third parties. Information may be shared only with delivery partners, technology service providers for tracking and messaging services, or government authorities where disclosure is required by law.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">5. Data Security</Typography>
                <Typography variant="body1">
                    Reasonable technical and organizational measures are taken to safeguard personal data against unauthorized access, misuse, alteration, or disclosure. However, no method of transmission over the internet is completely secure, and absolute security cannot be guaranteed.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">6. Data Retention</Typography>
                <Typography variant="body1">
                    Personal data is retained only for such duration as is necessary to fulfill operational, legal, or regulatory requirements and is thereafter securely deleted or anonymized.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">7. User Rights</Typography>
                <Typography variant="body1">
                    Users may request access to their personal data, correction of inaccuracies, or deletion of data, subject to applicable legal and regulatory obligations.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="body1" fontStyle="italic">
                    This Privacy Policy may be updated from time to time. Continued use of our services shall be deemed acceptance of the revised policy. For any queries or concerns, users may contact the company through the official contact details.
                </Typography>
            </Box>
        </Container>
    );
};

export default PrivacyPolicy;