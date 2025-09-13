import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Firebase config
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
const storage = getStorage(app);

// Global state
let currentUserId = null;
let currentDepositAmount = 0;
let selectedCrypto = null;
let currentDepositRef = null;

// DOM Elements
const amountInput = document.getElementById("usdAmount");
const cryptoButtons = document.querySelectorAll(".crypto-btn");
const paymentSection = document.getElementById("paymentDetails");
const rateEl = document.getElementById("cryptoRate");
const qrEl = document.getElementById("qrCode");
const addressEl = document.getElementById("cryptoAddress");
const confirmBtn = document.getElementById("confirmDepositBtn");
const popup = document.getElementById("depositPopup");
const successPopup = document.getElementById("successPopup");
const successAmountEl = document.getElementById("successAmount");
const minimized = document.getElementById("minimizedNotice");
const minimizeBtn = document.getElementById("minimizePopup");
const goDashboardBtn = document.getElementById("goDashboardBtn");
const newDepositBtn = document.getElementById("newDepositBtn");
const giftCardForm = document.getElementById("giftCardForm");

// New: Deposit Failed Popup Elements
const failedPopup = document.createElement("div");
failedPopup.id = "failedPopup";
failedPopup.className = "popup hidden";
failedPopup.innerHTML = `
  <div class="popup-content">
    <h3>❌ Deposit Unsuccessful</h3>
    <p>Your deposit was not approved. Please try again later.</p>
    <button id="tryAgainBtn">Try Again Later</button>
  </div>
`;
document.body.appendChild(failedPopup);
const tryAgainBtn = failedPopup.querySelector("#tryAgainBtn");

// Static Crypto Info
const cryptoInfo = {
  BTC: {
    address: "bc1qk5snaj8x42a4mmtnymqgefl5p9ygfku0f2syut",
    rate: 65000,
    qr: "https://api.qrserver.com/v1/create-qr-code/?data=bc1qk5snaj8x42a4mmtnymqgefl5p9ygfku0f2syut&size=150x150"
  },
  USDT: {
    address: "0xB2b9B91E21303f2D6Dcf9099Ea6c4dfAEF49F65C",
    rate: 1,
    qr: "https://api.qrserver.com/v1/create-qr-code/?data=0xB2b9B91E21303f2D6Dcf9099Ea6c4dfAEF49F65C&size=150x150"
  },
  ETH: {
    address: "0xB2b9B91E21303f2D6Dcf9099Ea6c4dfAEF49F65C",
    rate: 3200,
    qr: "https://api.qrserver.com/v1/create-qr-code/?data=0xB2b9B91E21303f2D6Dcf9099Ea6c4dfAEF49F65C&size=150x150"
  },
  GiftCard: {
    address: "support@AurumCapital.com",
    rate: 1,
    qr: "" // QR code is not needed for GiftCard
  }
};

// Auth state
onAuthStateChanged(auth, user => {
  if (!user) return window.location.href = "signin.html";
  
  currentUserId = user.uid;
});

// Handle crypto selection
cryptoButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedCrypto = button.dataset.crypto;
    const info = cryptoInfo[selectedCrypto];

    if (selectedCrypto === "GiftCard") {
      // Show gift card form, hide payment section
      giftCardForm?.classList.remove("hidden");
      paymentSection.classList.add("hidden");
      return;
    }

    const usdAmount = `${parseFloat(amountInput.value)}`;
    if (isNaN(usdAmount) || usdAmount < 100) {
      alert("Minimum deposit is $100.");
      return;
    }

    currentDepositAmount = usdAmount;

    // Show crypto payment details
    giftCardForm?.classList.add("hidden");
    rateEl.textContent = `Send ${(usdAmount / info.rate).toFixed(6)} ${selectedCrypto}`;
    qrEl.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(info.address)}&size=150x150`;
    addressEl.textContent = info.address;
    paymentSection.classList.remove("hidden");
  });
});



// Confirm deposit
confirmBtn.addEventListener("click", async () => {
  if (!currentUserId || currentDepositAmount < 100 || !selectedCrypto) return;

  const depositId = crypto.randomUUID();
  currentDepositRef = doc(db, "Deposits", currentUserId, "records", depositId);

  await setDoc(currentDepositRef, {
    amount: currentDepositAmount,
    method: selectedCrypto,
    status: "pending",
    createdAt: new Date().toISOString()
  });

  showDepositPopup();
  listenForConfirmation();
});

const giftCardSubmitBtn = document.getElementById("submitGiftCardBtn");

giftCardSubmitBtn?.addEventListener("click", async () => {
  const cardType = document.getElementById("cardType")?.value;
  const cardValue = parseFloat(document.getElementById("cardValue")?.value);
  const claimedValue = parseFloat(document.getElementById("claimedValue")?.value);
  const giftCardCode = document.getElementById("giftCardCode")?.value;

  if (!currentUserId || !cardType || !cardValue || !claimedValue || claimedValue < 1) {
    return alert("Please fill in all required gift card fields.");
  }

  currentDepositAmount = claimedValue; // ✅ set amount here too

  const depositId = crypto.randomUUID();
  currentDepositRef = doc(db, "Deposits", currentUserId, "records", depositId);

  let cardProof = "";
  if (!giftCardCode || giftCardCode.length < 4) return alert("Please enter a valid code.");
  cardProof = giftCardCode.trim();

  await setDoc(currentDepositRef, {
    amount: currentDepositAmount, // ✅ fixed
    method: "GiftCard",
    cardType,
    cardValue,
    claimedValue,
    proofType: "code",
    proof: cardProof,
    status: "pending",
    createdAt: new Date().toISOString()
  });

  showDepositPopup();
  listenForConfirmation();
});


// Show popup
function showDepositPopup() {
  popup.classList.remove("hidden");
  minimized.classList.add("hidden");
}

// Listen for Firestore confirmation
function listenForConfirmation() {
  onSnapshot(currentDepositRef, async snapshot => {
    if (!snapshot.exists()) return;

    const status = snapshot.data().status;

    if (status === "true") {
  popup.classList.add("hidden");
  minimized.classList.add("hidden");
  successPopup.classList.remove("hidden");

  successAmountEl.textContent = `🎉 You successfully deposited $${parseFloat(currentDepositAmount).toFixed(2)}!`;

  const walletRef = doc(db, "Wallet", currentUserId);

  try {
    const walletSnap = await getDoc(walletRef);
    const prevAmount = walletSnap.exists() && walletSnap.data().usd
      ? parseFloat(walletSnap.data().usd)
      : 0;

    const updatedAmount = prevAmount + parseFloat(currentDepositAmount);

    if (walletSnap.exists()) {
      await updateDoc(walletRef, { usd: updatedAmount });
    } else {
      await setDoc(walletRef, { usd: updatedAmount });
    }

    console.log("✅ Wallet updated:", updatedAmount);
  } catch (e) {
    console.error("❌ Wallet update error:", e);
  }
}

    // else status is pending or something else — keep popup open
  });
}

// Minimize deposit popup
minimizeBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
  minimized.classList.remove("hidden");
});

// Success buttons
goDashboardBtn?.addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

newDepositBtn?.addEventListener("click", () => {
  successPopup.classList.add("hidden");
  amountInput.value = "";
  paymentSection.classList.add("hidden");
  giftCardForm?.classList.add("hidden");
  currentDepositAmount = 0;
  selectedCrypto = null;
});

// Failed deposit "Try Again Later" button logic
tryAgainBtn.addEventListener("click", () => {
  failedPopup.classList.add("hidden");
  amountInput.value = "";
  paymentSection.classList.add("hidden");
  giftCardForm?.classList.add("hidden");
  currentDepositAmount = 0;
  selectedCrypto = null;
});


// --- Added toggle logic for GiftCard image/code input --- //

window.addEventListener("DOMContentLoaded", () => {
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
  
  });

  
});