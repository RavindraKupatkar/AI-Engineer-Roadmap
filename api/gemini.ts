import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { action, data } = req.body as { action: string; data: any };
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('API key not configured');
      res.status(500).json({ error: 'API key not configured' });
      return;
    }

    // Proxy request to Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${data.model}:generateContent?key=${apiKey}`;
    
    const geminiPayload: any = {
      contents: typeof data.contents === 'string' ? [{ parts: [{ text: data.contents }] }] : data.contents,
    };

    if (data.config) {
      geminiPayload.generationConfig = data.config;
    }

    if (data.systemInstruction) {
      geminiPayload.system_instruction = { parts: [{ text: data.systemInstruction }] };
    }

    console.log('Calling Gemini API...');
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      res.status(response.status).json({ error: 'Gemini API request failed', details: errorText });
      return;
    }

    const result = await response.json();
    console.log('Gemini API Success');
    res.status(200).json(result);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}
