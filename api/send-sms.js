const twilio = require('twilio');

module.exports = async (req, res) => {
  // Handle CORS preflight requests smoothly
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
    return res.status(500).json({ success: false, error: 'Missing Twilio environment credentials in configuration vault' });
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
};
