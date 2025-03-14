import { initializeApp } from 'firebase/app';
import { initializeAppCheck as initAppCheck, ReCaptchaV3Provider, getToken } from 'firebase/app-check';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // TODO: Replace with your actual Firebase configuration
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
  measurementId: "YOUR_FIREBASE_MEASUREMENT_ID"
};

let app;
let appCheck;

/**
 * Initialize Firebase
 */
export const initializeFirebase = () => {
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
      return app;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }
  return app;
};

/**
 * Initialize Firebase App Check
 */
export const initializeAppCheck = () => {
  if (!appCheck && app) {
    try {
      // Enable debug mode for development
      // Remove this in production
      window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

      // Initialize App Check with reCAPTCHA v3
      // TODO: Replace with your actual reCAPTCHA site key
      appCheck = initAppCheck(app, {
        provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
        isTokenAutoRefreshEnabled: true
      });

      console.log('App Check initialized successfully');
      return appCheck;
    } catch (error) {
      console.error('Error initializing App Check:', error);
      throw error;
    }
  }
  return appCheck;
};

/**
 * Get App Check token
 * @returns {Promise<string>} The App Check token
 */
export const getAppCheckToken = async () => {
  if (!appCheck) {
    try {
      initializeFirebase();
      initializeAppCheck();
    } catch (error) {
      console.error('Failed to initialize App Check:', error);
      throw error;
    }
  }

  try {
    const tokenResult = await getToken(appCheck, /* forceRefresh */ false);
    return tokenResult.token;
  } catch (error) {
    console.error('Error getting App Check token:', error);
    throw error;
  }
};

export { app, appCheck }; 