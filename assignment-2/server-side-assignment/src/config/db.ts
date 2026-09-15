import { connect } from "mongoose";
import { MONGO_URI } from "./env.js"

export const connectDB = async () => {
    try {
        await connect(MONGO_URI,{
            serverSelectionTimeoutMS:5000,
            socketTimeoutMS:45000
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};
