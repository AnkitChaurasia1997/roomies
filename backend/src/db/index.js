import mongoose from "mongoose";
import { DB_NAME } from "../constant";


const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI+'/'+DB_NAME)
        console.log("mongoDB connected !! DB HOST: "+ connectionInstance.connection.host);
    } catch (error) {
        console.log(error);
    }
}

export default connectDB;