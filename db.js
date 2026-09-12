import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Correct way to load env variables

const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cleanx1234cleaning");
    console.log("Connected To MongoDB Successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectToMongo;
