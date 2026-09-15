// /api/bookings
// GET  -> returns all booked slots, e.g. [{ day: 16, time: "6:00 PM", name: "Alex" }]
// POST -> books a slot if it's still free. Body: { day, time, name }
//         Returns 409 if that day+time was already taken by someone else.

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const keys = await kv.keys('slot:*');
    const slots = keys.length ? await kv.mget(...keys) : [];
    return res.status(200).json(slots.filter(Boolean));
  }

  if (req.method === 'POST') {
    const { day, time, name } = req.body || {};
    if (!day || !time) {
      return res.status(400).json({ error: 'day and time are required' });
    }

    const key = `slot:${day}:${String(time).toLowerCase().replace(/[: ]/g, '-')}`;

    // Atomic-ish check: only set if the key doesn't already exist.
    const wasSet = await kv.set(key, { day, time, name: name || '' }, { nx: true });

    if (!wasSet) {
      return res.status(409).json({ error: 'That slot was just taken. Please pick another.' });
    }

    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method not allowed');
}
