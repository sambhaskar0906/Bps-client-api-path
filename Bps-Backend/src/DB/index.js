import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
//isme async use krna hai
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    console.log(`DB IS CONNECTED ${connectionInstance.connection.host}`);
  }
  catch (error) {
    console.log('DB connection failed ', error.message);
    process.exit(1);
  }
}
export default connectDB;