// renderer/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfwvUql2BCQg7e2nTvIrX5_USP1mRjPCY",
  authDomain: "cortex-a3914.firebaseapp.com",
  projectId: "cortex-a3914",
  storageBucket: "cortex-a3914.firebasestorage.app",
  messagingSenderId: "726996107640",
  appId: "1:726996107640:web:b0a16246aecb269ac7888d",
  measurementId: "G-M2N4BXWWCJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
setPersistence(auth, browserLocalPersistence);

export { auth };
