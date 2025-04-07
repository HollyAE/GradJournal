// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence  } from "firebase/auth";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyAexVMhT3MMMPqLIhZYunb2ZgTkFaVobJY",
  authDomain: "individual-project-36729.firebaseapp.com",
  projectId: "individual-project-36729",
  storageBucket: "individual-project-36729.appspot.com",
  messagingSenderId: "584781215572",
  appId: "1:584781215572:web:2a1903d3b0794165affac1",
  measurementId: "G-NTHGEN2ZWG",
  databaseURL: "https://individual-project-36729.firebaseio.com"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore()
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const storage = getStorage();
