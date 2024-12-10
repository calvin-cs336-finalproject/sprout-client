import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBNKgD1v-61xgXexOPEAVzrucHO16AZxJE",
    authDomain: "cs336-stock-market-project.firebaseapp.com",
    projectId: "cs336-stock-market-project",
    storageBucket: "cs336-stock-market-project.firebasestorage.app",
    messagingSenderId: "1054566863429",
    appId: "1:1054566863429:web:0a081af1f2d51b685a092c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export { app, db };