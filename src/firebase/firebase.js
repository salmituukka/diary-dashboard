import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyChbT7wTHcZw_CkCK1i7iBtzYi0O9VhhBM",
    authDomain: "dashboard-1534764692814.firebaseapp.com",
    databaseURL: "https://dashboard-1534764692814.firebaseio.com",
    projectId: "dashboard-1534764692814",
    storageBucket: "dashboard-1534764692814.appspot.com",
    messagingSenderId: "608211176756"
};

if (!firebase.apps.length) {
  var fire = firebase.initializeApp(config);
}
export default fire;
