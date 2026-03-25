// Vercel serverless entry point
// Handles all /api/* routes — the Express app is shared with local dev via lib/createApp
import { createApp } from "../lib/createApp.js";

// createApp() no longer performs any I/O at module load — DB is lazy.
// All async work is deferred to the first request via the ensureDbReady() middleware.
export default createApp();
