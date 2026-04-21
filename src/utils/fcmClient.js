import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import API from "../services/api";

// ─────────────────────────────────────────────────────────
// Firebase web app config
// Get these from: Firebase Console → Project Settings →
//   General → Your Apps → Add app (Web) → App config
// Then paste the values into client/.env as VITE_FIREBASE_*
// ─────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ─────────────────────────────────────────────────────────
// VAPID key
// Get from: Firebase Console → Project Settings →
//   Cloud Messaging → Web Push Certificates → Generate key pair
// Paste as VITE_FIREBASE_VAPID_KEY in client/.env
// ─────────────────────────────────────────────────────────
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let messagingInstance = null;

function getFirebaseMessaging() {
  if (messagingInstance) return messagingInstance;

  // Only initialise once – reuse existing app if present
  const app = getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig);

  messagingInstance = getMessaging(app);
  return messagingInstance;
}

/**
 * Requests notification permission, retrieves the FCM device token,
 * sends it to the backend so it can be stored in MongoDB, and returns
 * the token string (or null on failure).
 */
export async function registerDeviceToken() {
  try {
    const apiUrlConfigured = Boolean(import.meta.env.VITE_API_URL?.trim());
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      console.warn("[FCM] Browser does not support notifications or service workers.");
      return null;
    }

    // Ask for permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[FCM] Notification permission denied.");
      return null;
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );

    const messaging = getFirebaseMessaging();

    // Get the FCM registration token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn("[FCM] getToken returned empty. Check VAPID key and service worker.");
      return null;
    }

    if (apiUrlConfigured) {
      // Persist to backend (upsert — safe to call repeatedly)
      await API.post("/register-device-token", { token });
      console.info("[FCM] Device token registered:", token.slice(0, 20) + "...");
    } else {
      console.info("[FCM] Token acquired (frontend-only mode):", token.slice(0, 20) + "...");
    }
    return token;
  } catch (err) {
    console.error("[FCM] Device token registration failed:", err.message);
    return null;
  }
}

/**
 * Listen for foreground FCM messages.
 * Pass a callback that receives the payload.
 */
export function onForegroundMessage(callback) {
  try {
    const messaging = getFirebaseMessaging();
    return onMessage(messaging, callback);
  } catch {
    return () => {};
  }
}
