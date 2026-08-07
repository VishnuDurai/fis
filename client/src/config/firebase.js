import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Official SREC FIS Firebase App Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "srec-fis.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "srec-fis",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "srec-fis.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Initializes invisible reCAPTCHA verifier safely for Phone Auth
 * @param {string} containerId Element ID where reCAPTCHA container is rendered
 */
export function setupRecaptcha(containerId = 'recaptcha-container') {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {}
    window.recaptchaVerifier = null;
  }

  let el = document.getElementById(containerId);
  if (!el) {
    el = document.createElement('div');
    el.id = containerId;
    document.body.appendChild(el);
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    'size': 'invisible',
    'callback': () => {},
    'expired-callback': () => {}
  });

  return window.recaptchaVerifier;
}

/**
 * Sends SMS OTP code to given phone number via Firebase Auth
 * @param {string} phoneNumber Format +91XXXXXXXXXX
 * @param {string} containerId recaptcha container element ID
 */
export async function sendFirebaseMobileOtp(phoneNumber, containerId = 'recaptcha-container') {
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase API Key is missing. Please configure VITE_FIREBASE_API_KEY in client/.env file.");
  }

  // Format phone number to E.164 standard (e.g. +91XXXXXXXXXX)
  let cleanNumber = String(phoneNumber || '').trim().replace(/[^\d+]/g, '');
  if (!cleanNumber.startsWith('+')) {
    if (cleanNumber.length === 10) {
      cleanNumber = `+91${cleanNumber}`;
    } else {
      cleanNumber = `+${cleanNumber}`;
    }
  }

  try {
    const verifier = setupRecaptcha(containerId);
    const confirmationResult = await signInWithPhoneNumber(auth, cleanNumber, verifier);
    window.confirmationResult = confirmationResult;
    return { success: true, confirmationResult, formattedNumber: cleanNumber };
  } catch (error) {
    console.error("Firebase Phone Auth error:", error);
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }

    let userMsg = error.message;
    if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key') {
      userMsg = `Firebase API Key is invalid or not activated. Please verify VITE_FIREBASE_API_KEY in client/.env file.`;
    } else if (error.code === 'auth/argument-error') {
      userMsg = `Invalid phone number format (${cleanNumber}) or reCAPTCHA initialization error.`;
    } else if (error.code === 'auth/unauthorized-domain') {
      userMsg = `Domain is not authorized for Firebase Phone Auth. Please add srec-fis.duckdns.org to Authorized Domains in Firebase Console.`;
    }
    throw new Error(userMsg);
  }
}

/**
 * Verifies 6-digit OTP code entered by user
 * @param {string} otpCode 6-digit SMS OTP
 */
export async function verifyFirebaseMobileOtp(otpCode) {
  if (!window.confirmationResult) {
    throw new Error("No active OTP verification session found. Please click Send OTP again.");
  }
  const result = await window.confirmationResult.confirm(otpCode);
  return result.user;
}
