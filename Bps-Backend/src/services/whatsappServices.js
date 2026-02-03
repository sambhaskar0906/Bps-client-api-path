import axios from "axios";

export const sendWhatsAppMessage = async ({ to, message }) => {
  const url = `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_VERSION}/${process.env.WHATSAPP_PHONE_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      body: message
    }
  };

  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    "Content-Type": "application/json"
  };

  const response = await axios.post(url, payload, { headers });
  return response.data;
};

export const sendWhatsAppDocument = async ({ to, documentUrl, filename, caption }) => {
  const url = `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_VERSION}/${process.env.WHATSAPP_PHONE_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "document",
    document: {
      link: documentUrl,
      filename,
      caption
    }
  };

  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    "Content-Type": "application/json"
  };

  const response = await axios.post(url, payload, { headers });
  return response.data;
};

