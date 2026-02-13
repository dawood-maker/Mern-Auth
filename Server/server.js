import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./Config/mongodb.js";
import authRoutes from "./routes/Auth-Routes.js";
import UserRouter from "./routes/UserRoutes.js";


const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

app.get("/", (req, res) => {
  res.send("API Working 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", UserRouter)

app.listen(port, () => console.log(`Server Started on PORT:${port}`));