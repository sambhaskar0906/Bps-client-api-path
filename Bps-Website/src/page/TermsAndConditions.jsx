import React from "react";
import { Box, Typography, Container } from "@mui/material";

const TermsAndConditions = () => {
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Terms & Conditions
            </Typography>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">1. Risk and Insurance</Typography>
                <Typography variant="body1">
                    All consignments are accepted for transport by air, road, rail, or water entirely at the risk of the consignor unless the consignment is expressly insured. The company does not assume responsibility for any loss, damage, delay, deterioration, or destruction of goods when insurance has not been availed by the consignor.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">2. Consignor's Responsibility</Typography>
                <Typography variant="body1">
                    The consignor is solely responsible for proper and secure packing of the goods, correct declaration of contents and value, and compliance with all applicable laws, rules, and regulations. In the event of incorrect declaration, improper packing, or violation of any law, the company shall not be liable for any consequences arising therefrom.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">3. Jurisdiction</Typography>
                <Typography variant="body1">
                    All disputes, claims, or legal proceedings arising out of or in connection with the consignment shall be subject exclusively to the jurisdiction of courts situated in Delhi and shall be governed by the laws applicable in India.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">4. Claim Period</Typography>
                <Typography variant="body1">
                    No claim for loss, damage, shortage, or delay shall be entertained unless the same is lodged in writing within a period of thirty (30) days from the date of booking of the consignment. Claims made after the said period shall be deemed time-barred and shall not be accepted.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">5. Force Majeure</Typography>
                <Typography variant="body1">
                    The company shall not be liable for any loss or damage caused due to accidents, fire, theft, natural calamities, acts of God, war, riots, strikes, government actions, or due to crashes or mishaps involving planes, trucks, trains, or steamers during transit.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">6. Prohibited Items</Typography>
                <Typography variant="body1">
                    The company shall not be responsible for any article sent by the consignor that is prohibited or restricted under the law of carriage, customs laws, or any other applicable law in force. Any such consignment, if accepted inadvertently, shall be entirely at the consignor’s risk.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">7. Foreign Goods</Typography>
                <Typography variant="body1">
                    Foreign goods are not accepted for carriage unless specifically agreed to in writing by the company and accompanied by complete and valid documentation as required under applicable laws.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">8. Liability Limit (Uninsured)</Typography>
                <Typography variant="body1">
                    In cases where the consignment is sent without insurance, the liability of the company, if any, shall be strictly limited to ₹100 (Rupees One Hundred only) per kilogram, and no claim exceeding the said amount shall be entertained under any circumstances.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">9. Insurance Clause</Typography>
                <Typography variant="body1">
                    Unless insurance charges are paid separately and expressly mentioned on the booking receipt, the consignment shall be deemed to be uninsured, and the company shall bear no liability beyond the limited amount stated above.
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography variant="h6">10. Freight and Charges</Typography>
                <Typography variant="body1">
                    Freight charges are calculated as per applicable rates and weight. All taxes, including GST, customs duty, sale tax, or any other statutory levies, shall be borne by the consignor or consignee, as applicable. All consignments are carried strictly at owner’s risk.
                </Typography>
            </Box>
        </Container>
    );
};

export default TermsAndConditions;