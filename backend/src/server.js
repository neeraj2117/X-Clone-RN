import express from "express";
import cors from "cors";
import {clerkMiddleware} from "@clerk/express";

import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// routes
app.use("/api/users", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comments", commentRoutes);

// error handling
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send({error: err.message || "Internal server error"});
});
 

const startServer = async () => {
  try {
    await connectDB();

    app.listen(ENV.PORT, () => {
      console.log(`Server is running on port ${ENV.PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};
startServer();

export default app;
