const admin = require("firebase-admin");
const DeviceToken = require("../models/DeviceToken");

const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "";
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "";
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || "";
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY || "";

const ensureFirebaseAdmin = () => {
  if (admin.apps.length) return;

  let serviceAccount;

  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  } else if (SERVICE_ACCOUNT_PATH) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    serviceAccount = require(SERVICE_ACCOUNT_PATH);
  } else {
    throw new Error(
      "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env"
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

const sendFCMNotification = async ({ title, body, data = {} }) => {
  ensureFirebaseAdmin();

  // Fetch all registered device tokens from MongoDB
  const tokenDocs = await DeviceToken.find({}, "token").lean();
  const tokens = tokenDocs.map((doc) => doc.token).filter(Boolean);

  if (!tokens.length) {
    throw new Error("No device tokens registered — visit the app to register your browser.");
  }

  const payload = {
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
    tokens,
  };

  const result = await admin.messaging().sendEachForMulticast(payload);

  // Clean up stale tokens that FCM rejected
  const staleTokens = result.responses
    .map((r, idx) => (!r.success ? tokens[idx] : null))
    .filter(Boolean);

  if (staleTokens.length) {
    await DeviceToken.deleteMany({ token: { $in: staleTokens } });
    console.info(`[FCM] Removed ${staleTokens.length} stale token(s).`);
  }

  return {
    success: true,
    successCount: result.successCount,
    failureCount: result.failureCount,
    results: result.responses,
  };
};

module.exports = {
  sendFCMNotification,
};
