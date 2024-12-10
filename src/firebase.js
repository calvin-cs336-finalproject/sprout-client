import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// import dotenv from 'dotenv';
// dotenv.config();

// const firebaseConfig = {
//     apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//     authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//     // databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
//     projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.REACT_APP_FIREBASE_APP_ID,
// };

const firebaseConfig = {
    apiKey: "AIzaSyBNKgD1v-61xgXexOPEAVzrucHO16AZxJE",
    authDomain: "cs336-stock-market-project.firebaseapp.com",
    // databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: "cs336-stock-market-project",
    storageBucket: "cs336-stock-market-project.firebasestorage.app",
    messagingSenderId: "1054566863429",
    appId: "1:1054566863429:web:0a081af1f2d51b685a092c"
};



const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export { app, db };