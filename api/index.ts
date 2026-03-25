// Vercel serverless entry point — dynamic import for error resilience

let _handler: any = null;
let _initError: string | null = null;

async function init() {
  if (_handler !== null || _initError !== null) return;
  try {
    const { createApp } = await import("../lib/createApp.js");
    _handler = createApp();
  } catch (err: any) {
    console.error('[api/index] Module load failed:', err?.message, err?.stack);
    _initError = err?.message || String(err);
  }
}

// Pre-warm at module load (best-effort, errors caught)
const _warmup = init();

export default async function handler(req: any, res: any) {
  await _warmup;
  if (!_handler) {
    await init(); // retry once in case warmup raced
  }
  if (_handler) {
    return _handler(req, res);
  }
  res.status(500).json({
    error: 'Server failed to initialise',
    detail: _initError,
  });
}
