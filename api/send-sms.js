import twilio from 'twilio';

export default async function handler(req, res) {
  // Smoothly clear CORS preflight blocks
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
    return res.status(500).json({ success: false, error: 'Missing credentials in server vault' });
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
