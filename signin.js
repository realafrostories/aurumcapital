import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCF4I3704KZW6jmvasHGmdsK468ssAuebA",
    authDomain: "altumfi-f39f1.firebaseapp.com",
    projectId: "altumfi-f39f1",
    storageBucket: "altumfi-f39f1.firebasestorage.app",
    messagingSenderId: "838201454123",
    appId: "1:838201454123:web:c738f1938438c7dd9b446e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elements
const loadingOverlay = document.getElementById("loadingOverlay");

// Show loading overlay
function showLoading() {
  loadingOverlay.style.display = "flex";
}

// Hide loading overlay
function hideLoading() {
  loadingOverlay.style.display = "none";
}

// Email/Password Sign-in
document.getElementById("signinForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    showLoading();
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Signed in:", result.user.email);

    // Redirect after a short delay
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1200);
  } catch (err) {
    alert("❌ Login failed!");
    hideLoading();
  }
});

// Google Sign-in
document.getElementById("googleSignIn").addEventListener("click", async () => {
  try {
    showLoading();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log("✅ Google Sign-in:", result.user.displayName);

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1200);
  } catch (err) {
    alert("❌ Google Sign-in failed: " + err.message);
    hideLoading();
  }
});

// Auto-redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});
