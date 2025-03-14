import { initializeApp } from 'firebase/app';
import { initializeAppCheck as initAppCheck, ReCaptchaV3Provider, getToken } from 'firebase/app-check';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjHP_7bpE68_fzhoVuL0JDVZTW_-VKZ7o",
  authDomain: "livslist-fdf38.firebaseapp.com",
  projectId: "livslist-fdf38",
  storageBucket: "livslist-fdf38.firebasestorage.app",
  messagingSenderId: "623729668062",
  appId: "1:623729668062:web:6649e91a81d02b0e65f74f",
  measurementId: "G-D65PMLFSPD"
};

let app;
let appCheck;
let analytics;

/**
 * Initialize Firebase
 */
export const initializeFirebase = () => {
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      analytics = getAnalytics(app);
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

export { app, appCheck, analytics }; 