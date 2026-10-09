const firebaseConfig = {
  apiKey: "AIzaSyBWzz6D5-CCw1iFNY9Kj92gaYxdLsfcK3g",
  authDomain: "herencia-a1ca2.firebaseapp.com",
  projectId: "herencia-a1ca2",
  storageBucket: "herencia-a1ca2.firebasestorage.app",
  messagingSenderId: "885586235583",
  appId: "1:885586235583:web:e128fdccfd7a5d6922360a"
};

window.firebaseApp = firebase.initializeApp(firebaseConfig);
window.firebaseAuth = firebase.auth();
