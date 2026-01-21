import axios from "axios";

const BASE_URL =
    "https://adminapis.backendprod.com/chat_and_campaign/whatsapp_graph/api/69297109635f919dd5aeaf91/Test/v19.0";

const PHONE_NUMBER_ID = "986328151220411";
const API_KEY = "w8bag3KDXdM9T1AYe6h07S2k";

/**
 * Send WhatsApp Template Message with PDF + dynamic params
 */
export const sendWhatsappMessage = async ({
    mobile,
    templateName,
    pdfUrl,
    bodyParams = [],
}) => {
    if (!mobile) throw new Error("Mobile number required");
    if (!pdfUrl) throw new Error("PDF URL required");

    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: mobile,
        type: "template",
        template: {
            name: templateName,
            language: { code: "en" },
            components: [
                {
                    type: "header",
                    parameters: [
                        {
                            type: "document",
                            document: {
                                link: pdfUrl, // 🔥 slip pdf
                            },
                        },
                    ],
                },
                {
                    type: "body",
                    parameters: bodyParams.map((value) => ({
                        type: "text",
                        text: String(value),
                    })),
                },
            ],
        },
    };

    const response = await axios.post(
        `${BASE_URL}/${PHONE_NUMBER_ID}/messages`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
                "api-key": API_KEY, // 🔥 MOST IMPORTANT
            },
        }
    );

    return response.data;
};
