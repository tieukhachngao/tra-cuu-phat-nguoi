import dotenv from "dotenv";

dotenv.config();

export const apiConfig = {
  baseUrl: process.env.API_BASE_URL || "https://api.phatnguoi.vn",
  lookupPath: process.env.API_LOOKUP_PATH || "/web/tra-cuu",
  maxRetries: Number(process.env.API_MAX_RETRIES) || 5,
  vehicleType: process.env.API_VEHICLE_TYPE || "1",
  headers: {
    "User-Agent": process.env.API_USER_AGENT ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Referer: process.env.API_REFERER || "https://phatnguoi.vn/",
    Origin: process.env.API_ORIGIN || "https://phatnguoi.vn",
  },
};
