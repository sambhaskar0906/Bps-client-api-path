// src/services/whatsappServices.js
import twilio from 'twilio';
import configObj from '../config/config.js';

const { twilio: config } = configObj;
const client = twilio(config.sid, config.authToken);

export const sendWhatsAppMessage = async (to, message) => {
     if (!to) throw new Error("Missing recipient number");

  const toStr = String(to); // convert to string if not already
  const toNumber = toStr.startsWith('whatsapp:') ? toStr : `whatsapp:${toStr}`;
     if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error("Message body must be a non-empty string");
  }
  return await client.messages.create({
    body: message,
    from: config.from,
    to: toNumber,
  });
};

