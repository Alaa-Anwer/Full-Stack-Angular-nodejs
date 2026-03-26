import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoDB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27018/ecommerce";

    await mongoose.connect(mongoDB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};
export default connectDB;
