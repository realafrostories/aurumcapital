// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, getDoc, updateDoc, increment 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCm7rYZgvhCjYoAr4_KzQcQovH1kClLtdI",
  authDomain: "aurumcaptial.firebaseapp.com",
  projectId: "aurumcaptial",
  storageBucket: "aurumcaptial.firebasestorage.app",
  messagingSenderId: "929610002491",
  appId: "1:929610002491:web:ec818b7da5460c828d2c1e",
  measurementId: "G-Z14JZMBJT1"
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

// ✅ Get Referral Code from URL
function getReferralCode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("ref") || null;
}




// 🟡 Form Submit
document.getElementById("signupForm").addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const referrerId = getReferralCode();

  window.showLoading();

  try {
    // ✅ Create new user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Create new user record
    await setDoc(doc(db, "Users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      referredBy: referrerId || null,
      totalBonus: 0,
      referrals: 0, // new users start with 0 referrals
      createdAt: new Date().toISOString()
    });

    // 🟢 If referral code exists, reward referrer
    if (referrerId) {
      const referrerRef = doc(db, "Users", referrerId);
      const referrerSnap = await getDoc(referrerRef);

      if (referrerSnap.exists()) {
        // ✅ Update totalBonus (+$50) and referrals count (+1)
        await updateDoc(referrerRef, {
          totalBonus: increment(50),
          referrals: increment(1)
        });

        // ✅ Optional: log the referral transaction
        const rewardRef = doc(db, "ReferralRewards", `${referrerId}_${user.uid}`);
        await setDoc(rewardRef, {
          referrer: referrerId,
          referredUser: user.uid,
          amount: 50,
          timestamp: new Date().toISOString()
        });
      } else {
        console.warn("Referrer not found:", referrerId);
      }
    }

    window.hideLoading();

    // 🎉 Show success message
    window.showPopup("🎉 Account Created!", "Your AurumCaptial account has been created.", () => {
      window.location.href = "dashboard.html?welcome=true";
    });

  } catch (err) {
    console.error("Signup error:", err);
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
