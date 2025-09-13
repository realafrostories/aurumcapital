// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
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
const db = getFirestore(app);

// Stepper UI
let currentStep = 0;
const steps = document.querySelectorAll(".form-step");
const icons = document.querySelectorAll(".step-icon");
const fill = document.getElementById("progressFill");

function updateSteps() {
  steps.forEach((s, i) => s.classList.toggle("active", i === currentStep));
  icons.forEach((ic, i) => ic.classList.toggle("active", i === currentStep));
  fill.style.width = `${(currentStep / (steps.length - 1)) * 100}%`;
}

// Validation Helpers
function validateName(name) {
  return /^[a-zA-Z]{2,}\s[a-zA-Z]{2,}$/.test(name);
}
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{9,}$/.test(password);
}

// Step Navigation
window.nextStep = () => {
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  if (currentStep === 0) {
    if (!name.value.trim() || !validateName(name.value.trim())) {
      return window.showPopup("🛑 Invalid Name", "Please enter first and last name separated by space.");
    }
  }

  if (currentStep === 1) {
    if (!email.value.trim() || !validateEmail(email.value.trim())) {
      return window.showPopup("🛑 Invalid Email", "Enter a valid email address.");
    }
  }

  if (currentStep === 2) {
    const pwd = password.value;
    const confirm = confirmPassword.value;
    if (!pwd || !confirm || pwd !== confirm) {
      return window.showPopup("🛑 Password Mismatch", "Passwords must match.");
    }
    if (!validatePassword(pwd)) {
      return window.showPopup(
        "🛑 Weak Password",
        "Password must have at least 9 characters, upper & lowercase, number, and special character."
      );
    }
  }

  if (currentStep < steps.length - 1) {
    currentStep++;
    updateSteps();
  }
};

window.prevStep = () => {
  if (currentStep > 0) {
    currentStep--;
    updateSteps();
  }
};

// Form Submit
document.getElementById("signupForm").addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  window.showLoading();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "Users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      createdAt: new Date().toISOString()
    });

    window.hideLoading();

    window.showPopup("🎉 Account Created!", "Your AurumCapital account has been created.", () => {
      window.location.href = "dashboard.html";
    });

  } catch (err) {
    window.hideLoading();
    window.showPopup("❌ Signup Failed", err.message || "An error occurred while creating your account.");
  }
});


// Loading & Popup Functions (Global)
window.showLoading = function () {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.style.display = "flex";
};

window.hideLoading = function () {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.style.display = "none";
};

window.showPopup = function (title, message, callback = null) {
  const titleEl = document.getElementById("popupTitle");
  const textEl = document.getElementById("popupText");
  const popup = document.getElementById("popupMessage");

  if (titleEl && textEl && popup) {
    titleEl.textContent = title;
    textEl.textContent = message;
    popup.classList.remove("hidden");
    window.popupCallback = callback;
  }
};

window.closePopup = function () {
  const popup = document.getElementById("popupMessage");
  if (popup) popup.classList.add("hidden");

  if (typeof window.popupCallback === "function") {
    window.popupCallback();
  }
};

// Initialize UI State
updateSteps();
