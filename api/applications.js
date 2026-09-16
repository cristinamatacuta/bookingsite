// /api/applications
// POST -> saves a full application
// GET -> returns all applications, newest first

import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export default async function handler(req, res) {

  if (req.method === 'POST') {
    const application = req.body || {};
    const stamp = Date.now();

    const key = `application:${stamp}`;

    await redis.set(
      key,
      JSON.stringify({
        ...application,
        submittedAt: stamp
      })
    );

    return res.status(200).json({ ok: true });
  }

  if (req.method === 'GET') {

    const key = req.query.key;

    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const keys = await redis.keys('application:*');

    const values = keys.length
      ? await redis.mget(...keys)
      : [];

    const apps = values
      .filter(Boolean)
      .map(value => JSON.parse(value));

    apps.sort(
      (a, b) => (b?.submittedAt || 0) - (a?.submittedAt || 0)
    );

    return res.status(200).json(apps);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method not allowed');
}