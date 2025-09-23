import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBXpJ1dv_3SDq9TVa-_hoSoT4CFteNJsBM",
  authDomain: "hotel-buddha-avenue.firebaseapp.com",
  projectId: "hotel-buddha-avenue",
  storageBucket: "hotel-buddha-avenue.firebasestorage.app",
  messagingSenderId: "20353209537",
  appId: "1:20353209537:web:a6f748af3d97def3393040",
  measurementId: "G-7X3Z82HLB8",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
