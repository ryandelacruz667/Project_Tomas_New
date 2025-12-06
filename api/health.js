/**
 * Vercel Serverless Function - Health Check Endpoint
 */

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  return res.status(200).json({
    status: 'ok',
    service: 'Gemini Chatbot API (Serverless)',
    timestamp: new Date().toISOString()
  });
}
