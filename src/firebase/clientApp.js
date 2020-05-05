import firebase from 'firebase/app'
import "firebase/firestore";
// import 'firebase/auth' // If you need it
// import 'firebase/storage' // If you need it
// import 'firebase/analytics' // If you need it

const clientCredentials = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
}

console.log("About to initialize firebase app")

if (firebase.apps.length === 0) {
  firebase.initializeApp(clientCredentials);
}

// Check that `window` is in scope for the analytics module!
if (typeof window !== 'undefined' && !firebase.apps.length) {
  // firebase.initializeApp(clientCredentials)
  // To enable analytics. https://firebase.google.com/docs/analytics/get-started
  // if ('measurementId' in clientCredentials) firebase.analytics()
}

console.log("Initialized firebase app")

export const db = firebase.firestore();
