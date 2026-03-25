import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    env: {
      hasDb: !!process.env.TURSO_DATABASE_URL,
      hasToken: !!process.env.TURSO_AUTH_TOKEN,
    },
    ts: new Date().toISOString(),
  });
}
