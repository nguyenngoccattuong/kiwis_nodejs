const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const dotenv = require('dotenv');
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Khởi tạo Firebase Web SDK
// Khởi tạo Firebase
const client = initializeApp(firebaseConfig);
const clientAuth = getAuth(client);

module.exports = { client, clientAuth };
