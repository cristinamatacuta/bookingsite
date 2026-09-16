// /api/bookings
// GET -> returns all booked slots
// POST -> books a slot if it's still free

import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export default async function handler(req, res) {

  if (req.method === 'GET') {
    const keys = await redis.keys('slot:*');

    const slots = keys.length
      ? await redis.mget(...keys)
      : [];

    const parsedSlots = slots
      .filter(Boolean)
      .map(slot => JSON.parse(slot));

    return res.status(200).json(parsedSlots);
  }

  if (req.method === 'POST') {

    const { day, time, name } = req.body || {};

    if (!day || !time) {
      return res.status(400).json({
        error: 'day and time are required'
      });
    }

    const key = `slot:${day}:${String(time)
      .toLowerCase()
      .replace(/[: ]/g, '-')}`;

    const value = JSON.stringify({
      day,
      time,
      name: name || ''
    });

    // Only create the booking if the slot doesn't already exist
    const wasSet = await redis.set(
      key,
      value,
      'NX'
    );

    if (wasSet !== 'OK') {
      return res.status(409).json({
        error: 'That slot was just taken. Please pick another.'
      });
    }

    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method not allowed');
}