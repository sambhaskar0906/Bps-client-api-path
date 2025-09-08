// src/config/config.js
import dotenv from 'dotenv';
dotenv.config();

const configObj = {
    port: process.env.PORT || 5001,
    mongoURI: process.env.MONGODB_URL,
    twilio: {
        sid: process.env.TWILIO_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
    },
    email: {
        user: process.env.gmail,
        pass: process.env.app_pass,
    },
};

export default configObj;
