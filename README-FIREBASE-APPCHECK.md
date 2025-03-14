# Securing Google Maps API with Firebase App Check

This guide explains how to set up Firebase App Check to secure your Google Maps API key in the Liv's List application.

## Overview

Firebase App Check helps protect your backend resources from abuse, such as billing fraud or phishing. When you enable App Check, devices running your app will need to pass an attestation test to prove that your app is authentic and hasn't been tampered with.

In this implementation, we're using App Check to secure the Google Maps API key, ensuring that only your legitimate app can use the API key, even if it's somehow extracted from your code.

## Firebase Configuration

The Firebase configuration has been set up with the following details:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDjHP_7bpE68_fzhoVuL0JDVZTW_-VKZ7o",
  authDomain: "livslist-fdf38.firebaseapp.com",
  projectId: "livslist-fdf38",
  storageBucket: "livslist-fdf38.firebasestorage.app",
  messagingSenderId: "623729668062",
  appId: "1:623729668062:web:6649e91a81d02b0e65f74f",
  measurementId: "G-D65PMLFSPD"
};
```

Firebase is initialized in the `src/index.js` file, which calls the initialization functions from `src/firebase/firebase.js`. The following Firebase services are currently set up:

- **Firebase Core**: Basic Firebase functionality
- **Firebase App Check**: For securing API keys and resources
- **Firebase Analytics**: For tracking user interactions and app usage

## Setup Instructions

### 1. Firebase Project (Already Completed)

The Firebase project has been created with the project ID: `livslist-fdf38`

### 2. App Registration (Already Completed)

The web app has been registered with Firebase.

### 3. Enable App Check

1. In the Firebase Console, navigate to "App Check" in the left sidebar
2. Click "Get started"
3. Under "Web apps", select your registered app
4. Choose "reCAPTCHA v3" as the provider
5. Click "Create new site key"
6. Enter your domain (e.g., "livslist.com") and click "Create"
7. Copy the reCAPTCHA site key - you'll need this later
8. Click "Save"

### 4. Update Your Firebase Configuration (Partially Completed)

1. The Firebase configuration has been updated in `src/firebase/firebase.js` with your actual Firebase details
2. You still need to replace the placeholder reCAPTCHA site key with your actual key:

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