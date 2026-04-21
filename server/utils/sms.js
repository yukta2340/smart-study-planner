const SMS_PROVIDER = (process.env.SMS_PROVIDER || "vonage").toLowerCase();

const normalizePhoneForSms = (phone) => {
  if (!phone) return null;
  const value = String(phone).trim();
  if (!value) return null;
  return value.startsWith("+") ? value : `+91${value}`;
};

const sendWithVonage = async ({ to, text }) => {
  const apiKey = process.env.VONAGE_API_KEY;
  const apiSecret = process.env.VONAGE_API_SECRET;
  const from = process.env.VONAGE_BRAND_NAME || "StudyPlan";

  if (!apiKey || !apiSecret) {
    throw new Error("VONAGE_API_KEY/VONAGE_API_SECRET missing in .env");
  }

  const payload = new URLSearchParams({
    api_key: apiKey,
    api_secret: apiSecret,
    to,
    from,
    text,
  });

  const response = await fetch("https://rest.nexmo.com/sms/json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload,
  });

  const data = await response.json();
  const msg = data?.messages?.[0];

  if (!response.ok || !msg || msg.status !== "0") {
    throw new Error(msg?.["error-text"] || "Vonage SMS send failed");
  }

  return data;
};

const sendSMS = async ({ to, text }) => {
  if (!to || !text) {
    throw new Error("SMS requires to and text");
  }

  if (SMS_PROVIDER === "console") {
    console.log(`[SMS-CONSOLE] to=${to} text=${text}`);
    return { success: true, provider: "console" };
  }

  return sendWithVonage({ to, text });
};

module.exports = {
  sendSMS,
  normalizePhoneForSms,
  SMS_PROVIDER,
};
