import firebase from 'firebase/app'
import "firebase/firestore";
// import 'firebase/auth' // If you need it
// import 'firebase/storage' // If you need it
// import 'firebase/analytics' // If you need it

const clientCredentials = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

if (firebase.apps.length === 0) {
  firebase.initializeApp(clientCredentials);
}

export const db = firebase.firestore();
