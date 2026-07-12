import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const setups = await kv.get('trade_setups') || [];
    return res.status(200).json(setups);
  } catch (error) {
    console.error('Error fetching setups:', error);
    return res.status(500).json({ error: 'Failed to fetch setups' });
  }
}
