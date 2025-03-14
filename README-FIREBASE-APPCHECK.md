# Securing Google Maps API with Firebase App Check

This guide explains how to set up Firebase App Check to secure your Google Maps API key in the Liv's List application.

## Overview

Firebase App Check helps protect your backend resources from abuse, such as billing fraud or phishing. When you enable App Check, devices running your app will need to pass an attestation test to prove that your app is authentic and hasn't been tampered with.

In this implementation, we're using App Check to secure the Google Maps API key, ensuring that only your legitimate app can use the API key, even if it's somehow extracted from your code.

## Setup Instructions

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps to create a new project
3. Once your project is created, click "Continue"

### 2. Register Your Web App

1. In the Firebase Console, click the web icon (</>) to add a web app
2. Enter a nickname for your app (e.g., "Liv's List Web")
3. Check the "Also set up Firebase Hosting" option if you plan to use Firebase Hosting
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need this later

### 3. Enable App Check

1. In the Firebase Console, navigate to "App Check" in the left sidebar
2. Click "Get started"
3. Under "Web apps", select your registered app
4. Choose "reCAPTCHA v3" as the provider
5. Click "Create new site key"
6. Enter your domain (e.g., "livslist.com") and click "Create"
7. Copy the reCAPTCHA site key - you'll need this later
8. Click "Save"

### 4. Update Your Firebase Configuration

1. Open the `src/firebase/firebase.js` file in your project
2. Replace the placeholder values in the `firebaseConfig` object with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};
```

3. Replace the placeholder reCAPTCHA site key with your actual key:

```javascript
appCheck = initAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});
```

### 5. Set Up Google Maps API with App Check

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project that contains the Google Maps API key
3. Go to "APIs & Services" > "Credentials"
4. Find your Google Maps API key and click "Edit"
5. Under "Application restrictions", select "HTTP referrers (websites)"
6. Add your domain(s) to the list of allowed referrers
7. Under "API restrictions", select "Restrict key"
8. Select the Google Maps APIs you're using (e.g., Maps JavaScript API, Places API)
9. Click "Save"

### 6. Test Your Implementation

1. Open the `public/app-check-test.html` file in your browser
2. Check that Firebase initializes successfully
3. Verify that App Check obtains a token
4. Confirm that Google Maps loads correctly
5. Use the "Refresh App Check Token" button to test token renewal

## Debugging

### Debug Mode

During development, App Check is configured to use debug tokens. This is enabled by the following line in `firebase.js`:

```javascript
window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
```

**Important:** Remove this line or set it to `false` before deploying to production.

### Common Issues

1. **Google Maps fails to load**: Check that your API key is correctly configured and that billing is enabled for your Google Cloud project.

2. **App Check token not obtained**: Verify that your reCAPTCHA site key is correct and that your domain is properly configured.

3. **"Oops! Something went wrong"**: This error from Google Maps often indicates an API key restriction issue. Make sure your domain is in the allowed referrers list.

## Production Considerations

1. **Remove Debug Mode**: Before deploying to production, remove the debug token line from your code.

2. **Environment Variables**: Consider using environment variables for sensitive values like API keys.

3. **Error Handling**: Implement robust error handling for cases where App Check or Google Maps fails to initialize.

4. **Monitoring**: Set up monitoring in Firebase to track App Check usage and potential abuse attempts.

## Resources

- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript/overview)
- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3) 