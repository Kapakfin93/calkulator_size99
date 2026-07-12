import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.calculator_KV_REST_API_URL || process.env.KV_REST_API_URL,
  token: process.env.calculator_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN,
});

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
