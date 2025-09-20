import dotenv from "dotenv"
import connectDB from "./src/DB/index.js"
import { app } from "./app.js"
dotenv.config({
    path: './env'
})

app.get('/', (req, res) => {
    res.send('Welcome to the Bharat Parcel Api LIve!');
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`server is running  on ${process.env.PORT}`)
        })
    })
    .catch(() => {
        console.log("Server failed");
    })