// ═══════════════════════════════════════════════════════════
//  I-BLITZ FIREBASE CONFIG
//  Follow these steps to connect real-time booking sync:
//
//  1. Go to https://console.firebase.google.com
//  2. Click "Add project" → name it "iblitz-fitness"
//  3. Disable Google Analytics → Create project
//  4. Click </> (Web) → Register app as "iblitz-web"
//  5. Copy the firebaseConfig object below
//  6. Left menu → Build → Realtime Database
//  7. Click "Create Database" → Start in TEST mode → Done
//  8. Paste your config values below
// ═══════════════════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey:            "PASTE_YOUR_API_KEY_HERE",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// Auto-detects whether Firebase is configured
const FB_READY = FIREBASE_CONFIG.apiKey !== "PASTE_YOUR_API_KEY_HERE";
