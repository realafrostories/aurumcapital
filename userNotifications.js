// --- 1. DIRECT FIREBASE IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- 2. CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyCm7rYZgvhCjYoAr4_KzQcQovH1kClLtdI",
  authDomain: "aurumcaptial.firebaseapp.com",
  projectId: "aurumcaptial",
  storageBucket: "aurumcaptial.firebasestorage.app",
  messagingSenderId: "929610002491",
  appId: "1:929610002491:web:ec818b7da5460c828d2c1e",
  measurementId: "G-Z14JZMBJT1"
};

// --- 3. INITIALIZATION ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2353/2353-preview.mp3');
notificationSound.volume = 0.9;

// --- NEW: AUDIO UNLOCKER ---
// Browsers block audio until the user clicks something. 
// This listener runs once and "primes" the audio.
const unlockAudio = () => {
    notificationSound.play().then(() => {
        notificationSound.pause();
        notificationSound.currentTime = 0;
        console.log("🔊 [System]: Audio context unlocked.");
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    }).catch(e => console.log("🔇 Waiting for interaction..."));
};
document.addEventListener('click', unlockAudio);
document.addEventListener('touchstart', unlockAudio);

onAuthStateChanged(auth, (user) => {
  if (user) {
    const messagesRef = collection(db, "Support", user.uid, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;

      // Count ALL messages from support
      const allSupportMessages = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.sender && data.sender.toLowerCase() === "support";
      }).length;

      // Get the number of messages the user had already "cleared" from localStorage
      const seenCount = parseInt(localStorage.getItem(`seenMsgs_${user.uid}`)) || 0;
      
      // The badge should only show the NEW messages (Total minus Seen)
      const newMessagesCount = allSupportMessages - seenCount;

      const chatPane = document.getElementById("chatPane");
      const isChatActive = chatPane && chatPane.classList.contains("active") && !chatPane.classList.contains("hidden");

      if (newMessagesCount > 0 && !isChatActive) {
        updateBadgeUI('.tab-btn[data-tab="chat"]', newMessagesCount);
        updateBadgeUI('#chatSupportBtn', newMessagesCount);

        // Sound logic
    
snapshot.docChanges().forEach((change) => {
  if (change.type === "added" && !snapshot.metadata.fromCache) {
    const msgData = change.doc.data();
    
    // 1. Verify it's from support
    const isSupport = msgData.sender && msgData.sender.toLowerCase() === "support";

    // 2. RE-CHECK VISIBILITY right at the moment of the sound trigger
    const chatPane = document.getElementById("chatPane");
    const isChatActiveNow = chatPane && 
                            chatPane.classList.contains("active") && 
                            !chatPane.classList.contains("hidden");

    // 3. ONLY play sound if it's from support AND the chat is NOT open
    if (isSupport && !isChatActiveNow) {
      notificationSound.play().catch(e => console.log("🔇 Audio pending user interaction."));
    } else {
      
    }
  }
});
      } else if (isChatActive || newMessagesCount <= 0) {
        // If chat is open or no new messages, ensure badges are gone
        removeBadges();
        // If chat is active, update the seenCount to match total
        if (isChatActive) {
          localStorage.setItem(`seenMsgs_${user.uid}`, allSupportMessages);
        }
      }
    });

    // --- 4. CLEAR LOGIC (Saves progress to localStorage) ---
    document.addEventListener('click', (e) => {
      if (e.target.closest('#chatSupportBtn')) {
        // When clicking, we count how many support messages exist NOW and save that as "seen"
        const messagesRef = collection(db, "Support", user.uid, "messages");
        const q = query(messagesRef);
        
        // We do a quick check to update the seen count
        onSnapshot(q, (snap) => {
          const totalSupport = snap.docs.filter(d => d.data().sender?.toLowerCase() === "support").length;
          localStorage.setItem(`seenMsgs_${user.uid}`, totalSupport);
          removeBadges();
        }, { onlyOnce: true });
      }
    });
  }
});

function updateBadgeUI(selector, count) {
  const targetBtn = document.querySelector(selector);
  if (!targetBtn) return;
  targetBtn.style.position = "relative";
  let badge = targetBtn.querySelector(".notif-badge-user");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "notif-badge-user";
    Object.assign(badge.style, {
      position: "absolute", top: "-5px", right: "-2px", backgroundColor: "#ef4444",
      color: "white", fontSize: "10px", fontWeight: "bold", borderRadius: "50%",
      minWidth: "18px", height: "18px", display: "flex", alignItems: "center",
      justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.4)", zIndex: "50",
      border: "1.5px solid white", padding: "2px"
    });
    targetBtn.appendChild(badge);
  }
  badge.innerText = count;
}

function removeBadges() {
  document.querySelectorAll(".notif-badge-user").forEach(b => b.remove());
}