export default function handler(_req: any, res: any) {
  res.status(200).json({
    ok: true,
    env: {
      hasDb: !!process.env.TURSO_DATABASE_URL,
      hasToken: !!process.env.TURSO_AUTH_TOKEN,
    },
    ts: new Date().toISOString(),
  });
}
