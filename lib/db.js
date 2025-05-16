import mongoose from "mongoose";

export const dbConnect = () => {
  try {
    mongoose.connect(process.env.MONGODB_URI, {
      dbName: "myUser",
    });
    console.log("db connected successfully");
  } catch (error) {
    console.log("Error connecting to MongoDB", error.message);
  }
};
