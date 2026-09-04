import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "pho_default_access_secret_2026",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "pho_default_refresh_secret_2026",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};
