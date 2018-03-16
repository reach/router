import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";

const config = {
  apiKey: "AIzaSyD5bc8Cu4rwVbbipQh0wVRaY4Kc9oL2kYc",
  authDomain: "router-demo.firebaseapp.com",
  databaseURL: "https://router-demo.firebaseio.com",
  projectId: "router-demo",
  storageBucket: "router-demo.appspot.com",
  messagingSenderId: "951645449415"
};

firebase.initializeApp(config);

let provider = new firebase.auth.GoogleAuthProvider();
let db = firebase.firestore();

function logout() {
  return firebase.auth().signOut();
}

export { provider, db, firebase, logout };
