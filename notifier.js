require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function notifyViaWhatsApp(userPhoneNumber, amount, level, fromUserId) {
  try {
    await client.messages.create({
      body: `🎉 You've earned ₹${amount} from a level ${level} referral (User ID: ${fromUserId})!`,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${userPhoneNumber}`
    });
    console.log(`WhatsApp notification sent to ${userPhoneNumber}`);
  } catch (err) {
    console.error(`Failed to send WhatsApp message to ${userPhoneNumber}`, err);
  }
}

module.exports = { notifyViaWhatsApp };
