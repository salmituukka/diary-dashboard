import firebase from 'firebase/app';
import 'firebase/auth';
import'firebase/database';

const config = {
    apiKey: "AIzaSyChbT7wTHcZw_CkCK1i7iBtzYi0O9VhhBM",
    authDomain: "dashboard-1534764692814.firebaseapp.com",
    databaseURL: "https://dashboard-1534764692814.firebaseio.com",
    projectId: "dashboard-1534764692814",
    storageBucket: "dashboard-1534764692814.appspot.com",
    messagingSenderId: "608211176756"
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const auth = firebase.auth();
const db = firebase.database();

export {
  auth,
  db
};