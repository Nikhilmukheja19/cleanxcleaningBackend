import mongoose from "mongoose";

const connectToMongo = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/canexcleaning");
    console.log("Connected To MongoDB Successfully");
  } catch (error) {
    console.log(error);
  }
};
export default connectToMongo;
