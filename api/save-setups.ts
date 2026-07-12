import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { setups } = req.body;
    await kv.set('trade_setups', setups);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving setups:', error);
    return res.status(500).json({ error: 'Failed to save setups' });
  }
}
