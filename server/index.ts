import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Load environment variables
dotenv.config();

// Choose storage type: 'simple' for in-memory (no database needed) or 'mongodb' for MongoDB Atlas
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'simple';

// Debug: Log environment variables
console.log('\n📋 Environment Variables Check:');
console.log(`   STORAGE_TYPE: ${STORAGE_TYPE}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Not set'}`);
console.log(`   SESSION_SECRET: ${process.env.SESSION_SECRET ? '✅ Set' : '❌ Not set'}\n`);

const app = express();

// Ensure Express knows it's behind a proxy (Render, Vercel, etc.) so secure cookies work
// Without this, req.secure will be false and secure cookies won't be set
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // send cookie only over HTTPS in production
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to database (if using MongoDB)
  console.log(`\n🔍 Storage Type: ${STORAGE_TYPE}`);
  
  if (STORAGE_TYPE === 'mongodb') {
    console.log("📦 Loading MongoDB storage...");
    try {
      const { connectToDatabase } = await import("./mongodb");
      console.log("🔄 Connecting to MongoDB Atlas...");
      await connectToDatabase();
      console.log("✅ MongoDB storage ready!\n");
    } catch (error: any) {
      console.error("\n❌ Failed to connect to MongoDB:");
      console.error("   Error:", error.message);
      console.log("\n💡 Troubleshooting:");
      console.log("   1. Check your .env file has: STORAGE_TYPE=mongodb");
      console.log("   2. Check your .env file has: MONGODB_URI=your_connection_string");
      console.log("   3. Verify MongoDB Atlas cluster is running");
      console.log("   4. Ensure your IP is whitelisted in MongoDB Atlas");
      console.log("   5. Or set STORAGE_TYPE=simple to use in-memory storage\n");
      process.exit(1);
    }
  } else {
    console.log("📝 Using simple in-memory storage (no database required)");
    console.log("💡 To use MongoDB, set STORAGE_TYPE=mongodb in .env\n");
  }

  // Auto-create admin user if it doesn't exist (only on first run)
  try {
    const storageModule = STORAGE_TYPE === 'mongodb' 
      ? await import("./storage.mongodb")
      : await import("./storage.simple");
    const storage = storageModule.storage;
    const bcrypt = await import("bcryptjs");
    const adminUser = await storage.getUserByUsername("admin");
    if (!adminUser) {
      const hashedPassword = await bcrypt.default.hash("Atharv@1136", 10);
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
      });
      log("✅ Admin user created automatically:");
      log("   Username: admin");
      log("   Password: Atharv@1136");
      log("   ⚠️  Please change the password after first login!");
    }
  } catch (error) {
    console.warn("⚠️  Could not auto-create admin user:", error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  const host = process.platform === 'win32' ? '127.0.0.1' : '0.0.0.0';
  server.listen(port, host, () => {
    log(`serving on port ${port}`);
  });
})();
