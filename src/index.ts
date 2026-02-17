import expressMongoSanitize from "@exortek/express-mongo-sanitize";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./db/db.connect"; // 1. Updated DB Import
import authRoutes from "./routes/route"; // 2. New Route Import

// import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";
import { globalErrorHandler } from "./middlewares/global-error-handler.middleware";
import { globalRateLimiter } from "./middlewares/limiter.middleware";
import taskRoutes from './routes/taskRoute';

// dotenv.config();

const bootstrap = async () => {
  const app = express();
  const PORT = process.env.PORT || 5000;

  // --- MIDDLEWARE ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
  // 1. CORS Configuration
  // I simplified this to ensure your Frontend (localhost:5173) can connect immediately.
  // The previous strict version would block you if .env wasn't perfect.
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
      ],
      credentials: true, // Allow cookies/headers
    }),
  );

  // 2. Security Headers
  app.use(helmet());

  // 3. Rate Limiting
  app.use(globalRateLimiter);

  // 4. Logger
  app.use(morgan("dev"));

  // 5. Body Parsers
  app.use(express.json()); // Allows JSON
  app.use(cookieParser()); // Allows Cookies

  // 6. Security: Prevent NoSQL Injection
  app.use(expressMongoSanitize());

  // --- ROUTES ---

  // Test Route
  app.get("/api/test", (req, res) => {
    res.status(200).send("Api is running");
  });

  // ★ AUTH ROUTES (Connected here) ★
  // This maps http://localhost:5000/api/auth/signup -> to your signup logic
  app.use("/api/auth", authRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/users", authRoutes);

  // Global Error Handler (Must be last)
  app.use(globalErrorHandler);

  // --- SERVER STARTUP ---
  const server = http.createServer(app);
  server.setTimeout(300000);

  // Connect to DB *before* accepting traffic
  await connectDB();

  server.listen(PORT, () => {
    console.log(`🚀 Server Running on port ${PORT}`);
  });
};

bootstrap().catch((e) => {
  console.error("Fatal boot error:", e);
  process.exit(1);
});
