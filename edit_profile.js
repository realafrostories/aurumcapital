// Firebase Init
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateEmail,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCF4I3704KZW6jmvasHGmdsK468ssAuebA",
    authDomain: "altumfi-f39f1.firebaseapp.com",
    projectId: "altumfi-f39f1",
    storageBucket: "altumfi-f39f1.firebasestorage.app",
    messagingSenderId: "838201454123",
    appId: "1:838201454123:web:c738f1938438c7dd9b446e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const formArea = document.querySelector(".form-area");
const stepScreens = document.querySelectorAll(".step-screen");
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
const progressBar = document.querySelector(".progress-bar");

const successScreen = document.querySelector(".success-screen");
const alreadyVerifiedDiv = document.querySelector(".already-verified");
const waitScreen = document.getElementById("step5-waiting");

const passwordModal = document.getElementById("passwordModal");
const passwordInput = document.getElementById("passwordInput");
const confirmPasswordBtn = document.getElementById("confirmPasswordBtn");
const passwordError = document.getElementById("passwordError");

let currentStage = 0;
let currentUser = null;
let userRef = null;

// Country dropdown
const countrySelect = document.getElementById("country");
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus",
  "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo", "Denmark",
  "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Estonia", "Eswatini (fmr. Swaziland)", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama",
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

countries.forEach(c => {
  const opt = document.createElement("option");
  opt.value = c;
  opt.textContent = c;
  countrySelect.appendChild(opt);
});

// Step progress display
function showStep(index) {
  stepScreens.forEach((screen, i) => {
    screen.classList.toggle("hidden", i !== index);
    screen.style.display = i === index ? "flex" : "none";
  });
  progressBar.style.width = `${((index + 1) / stepScreens.length) * 100}%`;
}

// Show wait screen
function showWaitScreen() {
  console.log("✅ Showing Wait Screen...");
  formArea.style.display = "none";
  waitScreen.classList.remove("hidden");
  waitScreen.style.display = "flex";
  progressBar.style.width = "100%";
}

// Poll for verification
function pollVerification() {
  const interval = setInterval(async () => {
    try {
      await currentUser.reload(); // Refresh user info from Firebase

      // If email is verified
      if (currentUser.emailVerified) {
        clearInterval(interval);

        // Make sure userRef is defined
        const userDocRef = doc(db, "Users", currentUser.uid);

        onAuthStateChanged(auth, async (user) => {
  if (user?.emailVerified) {
    await updateDoc(doc(db, "Users", user.uid), { verified: "true" });
  }
});


        console.log("✅ Firestore updated with verified: 'true'");
        waitScreen.classList.add("hidden");
        successScreen.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Polling error:", error.message);
    }
  }, 4000); // Check every 4 seconds
}



// Save Step Data
async function saveStepData(index) {
  if (!currentUser) return alert("User not authenticated yet.");
  passwordError.classList.add("hidden");

  const docRef = doc(db, "Users", currentUser.uid);
  let updates = {};

  if (index === 0) {
    const username = document.getElementById("username").value.trim();
    if (!username) return alert("Username is required.");
    updates.username = username;
  }

  if (index === 1) {
    const dob = document.getElementById("dob").value;
    const country = document.getElementById("country").value;
    if (!dob || !country) return alert("Fill all fields.");
    updates.dob = dob;
    updates.country = country;
  }

  if (index === 2) {
    const phone = document.getElementById("phone").value.trim();
    if (!phone) return alert("Phone number is required.");
    updates.phone = phone;
  }

  if (index === 3) {
    const q = document.getElementById("security").value;
    const a = document.getElementById("answer").value.trim();
    if (!q || !a) return alert("Security question & answer are required.");
    updates.securityQuestion = q;
    updates.securityAnswer = a;
  }

  if (index === 4) {
  const newEmail = document.getElementById("newEmail").value.trim();
  const currentEmail = currentUser.email?.trim();
  updates.verified = "wait";

  if (newEmail && newEmail !== currentEmail) {
    passwordModal.classList.remove("hidden");

    return new Promise((resolve) => {
      confirmPasswordBtn.onclick = async () => {
        const password = passwordInput.value.trim();
        if (!password) {
          passwordError.textContent = "Please enter your password.";
          passwordError.classList.remove("hidden");
          return;
        }

        try {
          const cred = EmailAuthProvider.credential(currentEmail, password);
          await reauthenticateWithCredential(currentUser, cred);

          // 🔄 Instead of updateEmail, use verifyBeforeUpdateEmail
          await verifyBeforeUpdateEmail(currentUser, newEmail);
          await updateDoc(docRef, { verified: "false" });
          
          passwordModal.classList.add("hidden");
          passwordInput.value = "";
          
          showWaitScreen();
          pollVerification();
          await signInWithEmailAndPassword(auth, newEmail, password);
          resolve(false); // stop navigation
        } catch (err) {
          console.error("Reauth error:", err.code);
          passwordError.textContent = err.code === "auth/wrong-password"
            ? "Incorrect password. Try again."
            : "Reauthentication failed.";
          passwordError.classList.remove("hidden");
        }
      };
    });
  } else {
    await sendEmailVerification(currentUser);
    await updateDoc(docRef, { verified: "wait" });
    showWaitScreen();
    pollVerification();
    return false;
  }
}


  await updateDoc(docRef, { ...updates, profileStage: index + 1 });
  return true;
}

// Auth Watcher
onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "signin.html");

  try {
      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
  
        if (userData.blocked === true) {
          const overlay = document.getElementById("blockedOverlay");
          overlay.classList.remove("hidden");
  
          const supportBtn = document.getElementById("contactSupportBtn");
          supportBtn.addEventListener("click", () => {
            window.location.href = "support.html";
          });
  
          // Prevent scroll & interaction
          document.body.style.overflow = "hidden";
        }
      }
    } catch (err) {
      console.error("❌ Failed to check block status:", err);
    }
  currentUser = user;
  userRef = doc(db, "Users", user.uid);

  const snap = await getDoc(userRef);
  let userData = snap.exists() ? snap.data() : { verified: "false", profileStage: 0 };
  if (!snap.exists()) await setDoc(userRef, userData);

  const verified = userData.verified || "false";
  const stage = typeof userData.profileStage === "number" ? userData.profileStage : 0;

  document.getElementById("currentEmail").textContent = currentUser.email;

  if (verified === "true") {
    formArea.style.display = "none";
    alreadyVerifiedDiv.classList.remove("hidden");
  } else if (verified === "wait" && stage >= 4) {
    showWaitScreen();
  } else {
    currentStage = Math.max(0, Math.min(stage, stepScreens.length - 1));
    formArea.classList.remove("hidden");
    formArea.style.display = "block";
    showStep(currentStage);
  }
});

// Navigation Buttons
nextBtns.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const valid = await saveStepData(currentStage);
    if (valid && currentStage < stepScreens.length - 1) {
      currentStage++;
      showStep(currentStage);
    }
  });
});

prevBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (currentStage > 0) {
      currentStage--;
      showStep(currentStage);
    }
  });
});
