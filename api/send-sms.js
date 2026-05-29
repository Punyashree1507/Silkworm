import twilio from 'twilio';

export default async function handler(req, res) {
  // CORS configuration settings mapping
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, statusType } = req.body;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNum = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioNum) {
    return res.status(500).json({ success: false, error: 'Missing Twilio environment variables in configuration vault' });
  }

  const client = twilio(accountSid, authToken);

  try {
    const messageText = statusType === 'SAFE' 
      ? `🟢 SILKWORM MONITOR ALERT: Environment parameters are currently SAFE.` 
      : `🔴 CRITICAL SILKWORM ALERT: Environment conditions are NOT SAFE! Check dashboard immediately.`;

    const message = await client.messages.create({
      body: messageText,
      from: twilioNum,
      to: phoneNumber
    });

    return res.status(200).json({ success: true, sid: message.sid });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
