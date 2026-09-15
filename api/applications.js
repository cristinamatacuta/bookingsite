// /api/applications
// POST -> saves a full application (name, date, time, plan, pickup, flowers, phone, email)
// GET  -> returns all applications, newest first (this is your private "inbox" —
//         see the README for how to keep it just for you)

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const application = req.body || {};
    const stamp = Date.now();
    const key = `application:${stamp}`;
    await kv.set(key, { ...application, submittedAt: stamp });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'GET') {
    const key = req.query.key;
    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const keys = await kv.keys('application:*');
    const apps = keys.length ? await kv.mget(...keys) : [];
    apps.sort((a, b) => (b?.submittedAt || 0) - (a?.submittedAt || 0));
    return res.status(200).json(apps.filter(Boolean));
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method not allowed');
}
