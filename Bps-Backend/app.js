import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { verifyJwt } from "./src/middleware/auth.middleware.js";
import { vehicleAccessFilter } from "./src/middleware/vehicle.middleware.js"
import { roleAccessFilter } from "./src/middleware/role.middleware.js"
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json(
    {
        limit: "16kb"
    }

))
app.use(express.urlencoded(
    {
        extended: true,
        limit: "16kb"
    }
))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cookieParser());



import manageStation from "./src/router/manageStation.router.js"
app.use("/api/v2/stations", manageStation);
import driverRouter from "./src/router/driver.route.js"
app.use("/api/v2/driver", verifyJwt, roleAccessFilter, driverRouter);
import CustomerRouter from "./src/router/customer.route.js"
app.use("/api/v2/customers", verifyJwt, roleAccessFilter, CustomerRouter);
import QCustomerRouter from "./src/router/Qcustomer.router.js"
app.use("/api/v2/qcustomers", verifyJwt, roleAccessFilter, QCustomerRouter);
import userRouter from "./src/router/user.route.js"
app.use("/api/v2/users", userRouter)
import vehicleRouter from "./src/router/vehicle.router.js"
app.use("/api/v2/vehicles", verifyJwt, vehicleAccessFilter, vehicleRouter)
import customerQuotation from "./src/router/customerQuotation.router.js"
app.use("/api/v2/quotation", customerQuotation);
import contactRouter from "./src/router/contact.router.js"
app.use("/api/v2/contact", verifyJwt, roleAccessFilter, contactRouter);
import expenseRouter from "./src/router/expense.router.js"
app.use("/api/v2/expenses", verifyJwt, roleAccessFilter, expenseRouter);


import bookingRouter from "./src/router/booking.router.js"
app.use("/api/v2/bookings", bookingRouter);


import deliveryRouter from "./src/router/delivery.router.js"
app.use("/api/v2/delivery", verifyJwt, roleAccessFilter, deliveryRouter);


import trackerRouter from "./src/router/tracker.router.js"
app.use("/api/v2/tracking", trackerRouter);


import customerLedgerRouter from "./src/router/customerLedgerHistory.router.js"
app.use("/api/v2/ledger", customerLedgerRouter);

import statesAndCitiesRouter from "./src/router/stateAndCity.router.js";
app.use("/api/v2/state", statesAndCitiesRouter);

import whatsappRoutes from './src/router/whatsappRoute.js';
app.use('/api/whatsapp', whatsappRoutes);

export { app }