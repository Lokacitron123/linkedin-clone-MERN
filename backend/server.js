dotenv.config();

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.connection.js";

// Routes import
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectionRoutes from "./routes/connection.route.js";

// --------- SETUP --------------

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
); // allow cookies with the response

// Without limit we get payload error "payload is too large"
app.use(express.json({ limit: "5mb" })); // parse JSON request bodies
app.use(cookieParser());

// URL routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDB();
});
