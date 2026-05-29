import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toNumber, message } = req.body;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  const client = twilio(accountSid, authToken);

  try {
    const response = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber
    });
    return res.status(200).json({ success: true, sid: response.sid });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
