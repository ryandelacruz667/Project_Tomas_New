/**
 * Vercel Serverless Function - Health Check Endpoint
 */

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  return res.status(200).json({
    status: 'ok',
    service: 'Gemini Chatbot API (Serverless)',
    timestamp: new Date().toISOString()
  });
};
