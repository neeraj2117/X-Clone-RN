import express from "express";
import cors from "cors";
import {clerkMiddleware} from "@clerk/express";

import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import notificationRoutes from "./routes/notification.route.js";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { arcjetMiddleware } from "./middlewares/arcjet.middleware.js";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.use(clerkMiddleware());
app.use(arcjetMiddleware);

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// routes
app.use("/api/users", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// error handling
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send({error: err.message || "Internal server error"});
});
 

const startServer = async () => {
  try {
    await connectDB();

    // listen for local development
    if (ENV.NODE_ENV !== "production"){
      app.listen(ENV.PORT, () => {
        console.log(`Server is running on port ${ENV.PORT}`);
      });
    }
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};
startServer();

// export for vercel
export default app;
