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

## Setup Instructions (Completed)

### 1. Firebase Project (Completed)

The Firebase project has been created with the project ID: `livslist-fdf38`

### 2. App Registration (Completed)

The web app has been registered with Firebase.

### 3. Enable App Check (Completed)

App Check has been enabled with reCAPTCHA v3 as the provider.

### 4. Update Firebase Configuration (Completed)

The Firebase configuration has been updated in `src/firebase/firebase.js` with your actual Firebase details and reCAPTCHA site key.

### 5. Set Up Google Maps API with App Check (Completed)

The Google Maps API key has been configured with the following settings:
- Application restrictions: HTTP referrers (websites)
- Allowed domains: Added your domains including localhost for development
- API restrictions: Restricted to specific Google Maps APIs (Maps JavaScript API, Places API, Geocoding API)

### 6. Enable Billing for Google Maps API (Completed)

Billing has been enabled for the Google Cloud project, which activates the Google Maps API key.

### 7. Test Your Implementation (Completed)

The App Check integration has been tested with:
- The test HTML file (`public/app-check-test.html`)
- The full application running on the development server

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