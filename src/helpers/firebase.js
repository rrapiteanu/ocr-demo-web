import firebase from "firebase";
import config from "../config/firebase";

firebase.initializeApp(config);

export const firebaseRef = firebase;
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const firebaseAuth = firebase.auth;
export const db = firebase.firestore();
