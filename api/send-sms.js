// api/send-sms.js
const twilio = require('twilio');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, statusType } = req.body;

  // Reading secret passwords from Vercel parameters vault
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNum = process.env.TWILIO_PHONE_NUMBER;

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
