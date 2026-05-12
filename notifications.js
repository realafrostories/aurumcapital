// notifications.js
import { db } from "./admin.js"; 
import { 
  collectionGroup, 
  onSnapshot, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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


export function initNotificationSystem() {
  // Querying ALL 'messages' sub-collections where sender is 'user'
  const q = query(
  collectionGroup(db, "messages"), 
  where("sender", "==", "user") 
);

  let initialLoad = true;

  onSnapshot(q, (snapshot) => {
    // Skip the first run so we don't alert for every old message in the DB
    if (initialLoad) {
      initialLoad = false;
      return; 
    }

    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const msg = change.doc.data();
        const userId = change.doc.ref.parent.parent.id; // Extracts the User ID from the path

        // Only alert if we aren't currently chatting with this specific person
        if (window.activeChatUserId !== userId) {
          playNotification();
          showBadgeOnUser(userId);
        }
      }
    });
  }, (error) => {
    console.error("Notification Sync Error:", error);
  });
}

function playNotification() {
  notificationSound.play().catch(() => {
    console.warn("Sound blocked: Browser requires one user click on the page first.");
  });
}

// Inside notifications.js

function showBadgeOnUser(userId) {
  const userCard = document.querySelector(`[data-user-id="${userId}"]`);
  
  if (userCard) {
    const badge = userCard.querySelector(".notif-badge");
    if (badge) {
      // 1. Unhide the badge
      badge.classList.remove("hidden");

      // 2. Get the current number. If it's "!" or empty, start at 0.
      let currentCount = parseInt(badge.innerText);
      if (isNaN(currentCount)) {
        currentCount = 0;
      }

      // 3. Increment and display
      badge.innerText = currentCount + 1;
    }

    // Optional: Add a little "pulse" effect so the admin sees the number change
    badge.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.4)' },
      { transform: 'scale(1)' }
    ], { duration: 300 });
  }
}

initNotificationSystem();