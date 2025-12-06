/**
 * Netlify Serverless Function - Health Check Endpoint
 */

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({})
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'ok',
      service: 'Gemini Chatbot API (Serverless)',
      timestamp: new Date().toISOString()
    })
  };
};
