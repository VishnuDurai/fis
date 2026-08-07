import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Official SREC FIS Firebase App Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "srec-fis.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "srec-fis",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "srec-fis.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Initializes invisible or button reCAPTCHA verifier for Phone Auth
 * @param {string} containerId Element ID where reCAPTCHA container is rendered
 */
export function setupRecaptcha(containerId) {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved - allow signInWithPhoneNumber
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
      }
    });
  }
  return window.recaptchaVerifier;
}

/**
 * Sends SMS OTP code to given phone number via Firebase Auth
 * @param {string} phoneNumber Format +91XXXXXXXXXX
 * @param {string} containerId recaptcha container element ID
 */
export async function sendFirebaseMobileOtp(phoneNumber, containerId = 'recaptcha-container') {
  try {
    const verifier = setupRecaptcha(containerId);
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    window.confirmationResult = confirmationResult;
    return { success: true, confirmationResult };
  } catch (error) {
    console.error("Firebase Phone Auth error:", error);
    // Reset recaptcha verifier on error
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      } catch (e) {}
    }
    throw error;
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
