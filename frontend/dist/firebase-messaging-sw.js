// ============================================================
// Firebase Cloud Messaging - Background Service Worker
// ============================================================
// This file must live in /public so it is served from the root.
// Fill in the firebaseConfig values from:
//   Firebase Console → Project Settings → General → Your Apps → Web app config
// ============================================================

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// ⚠️ Replace the PLACEHOLDER_ values with your actual Firebase web app config
const firebaseConfig = {
  apiKey: self.__FIREBASE_API_KEY__ || "PLACEHOLDER_API_KEY",
  authDomain: self.__FIREBASE_AUTH_DOMAIN__ || "studyplanner-13eb2.firebaseapp.com",
  projectId: self.__FIREBASE_PROJECT_ID__ || "studyplanner-13eb2",
  storageBucket: self.__FIREBASE_STORAGE_BUCKET__ || "studyplanner-13eb2.appspot.com",
  messagingSenderId: self.__FIREBASE_MESSAGING_SENDER_ID__ || "PLACEHOLDER_SENDER_ID",
  appId: self.__FIREBASE_APP_ID__ || "PLACEHOLDER_APP_ID",
};

// Allow main thread to pass config at runtime (optional future enhancement)
self.addEventListener("message", (event) => {
  if (event.data?.type === "FIREBASE_CONFIG") {
    Object.assign(firebaseConfig, event.data.config);
  }
});

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background push messages
messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "Study Planner";
  const body = payload?.notification?.body || "You have a task reminder.";
  const icon = "/favicon.ico";

  self.registration.showNotification(title, {
    body,
    icon,
    badge: icon,
    data: payload.data || {},
  });
});
