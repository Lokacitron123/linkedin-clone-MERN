dotenv.config();

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.connection.js";

// Routes import
import authRoutes from "./routes/auth.route.js";

// -----------------------

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // parse JSON request bodies
app.use(cookieParser());

// URL routes
app.use("/api/v1/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDB();
});
