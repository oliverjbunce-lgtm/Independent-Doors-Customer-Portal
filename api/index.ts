// Vercel serverless entry point
// Handles all /api/* routes — the Express app is shared with local dev via lib/createApp
import { createApp } from "../lib/createApp.js";

export default createApp();
