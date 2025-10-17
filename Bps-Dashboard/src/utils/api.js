// Global API Base URL
export const API_BASE_URL = 'http://localhost:8000/api/v2';    //https://api.bharatparcel.org/api/v2

//upload image url
export const FILES_BASE_URL = 'http://localhost:8000';         //https://api.bharatparcel.org/

export const WHATSAPP_API = 'http://localhost:8000/api/whatsapp';   //https://api.bharatparcel.org/api/whatsapp

export const FRONTEND_BASE_URL = 'http://localhost:5173';     //https://bharatparcel.org


// Specific modules ke liye alag BASE_URL banake export kar do
export const BOOKINGS_API = `${API_BASE_URL}/bookings`;
export const CONTACT_API = `${API_BASE_URL}/contact`;
export const ledgerSlice_API = `${API_BASE_URL}/ledger`;
export const CUSTOMERS_API = `${API_BASE_URL}/customers`;
export const DELIVERY_API = `${API_BASE_URL}/delivery`;
export const DRIVER_API = `${API_BASE_URL}/driver`;
export const EXPENSES_API = `${API_BASE_URL}/expenses`;
export const QCUSTOMERS_API = `${API_BASE_URL}/qcustomers`;
export const QUOTATION_API = `${API_BASE_URL}/quotation`;
export const USERS_API = `${API_BASE_URL}/users`;
export const VEHICLES_API = `${API_BASE_URL}/vehicles`;
export const STATIONS_API = `${API_BASE_URL}/stations`;
export const AUTH_API = `${API_BASE_URL}/users`;