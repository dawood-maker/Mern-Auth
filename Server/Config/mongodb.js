import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/MERN-AUTH`);

    console.log("Connected to MongoDB ✅");
  } catch (error) {
    console.error("MongoDB Connection Error ❌", error.message);
    process.exit(1);
  }
};

export default connectDB; 