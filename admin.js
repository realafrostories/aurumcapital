// ✅ 1. Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collectionGroup,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,getDocs,
  addDoc,
  query,
  orderBy, where,
  onSnapshot,limit,
  Timestamp,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCm7rYZgvhCjYoAr4_KzQcQovH1kClLtdI",
  authDomain: "aurumcaptial.firebaseapp.com",
  projectId: "aurumcaptial",
  storageBucket: "aurumcaptial.firebasestorage.app",
  messagingSenderId: "929610002491",
  appId: "1:929610002491:web:ec818b7da5460c828d2c1e",
  measurementId: "G-Z14JZMBJT1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- GLOBAL STATE ---
let currentChatUserId = "";
let unsubscribeChatListener = null;
let activeRecordListener = null;
let allRecordsCache = []; // Stores all fetched records locally
let activeChatUserId = null;
let chatUnsubscribe = null;
// 🎵 Sound effect for new messages
const msgSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');


// ✅ 1. Safe Date Helper (Prevents toDate() crash)
const getSafeDate = (d) => {
  if (d && typeof d.toDate === 'function') return d.toDate();
  return d instanceof Date ? d : new Date(d || Date.now());
};


// ✅ UNIVERSAL DATE FORMATTER: "23 Feb. 2006"
window.formatAdminDate = (dateSource) => {
  if (!dateSource) return "---";
  
  // Handle Firebase Timestamps or Date strings
  const date = dateSource.toDate ? dateSource.toDate() : new Date(dateSource);
  
  const options = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  };
  
  // Customizing to lowercase and adding the dot after the month
  const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(date);
  const day = parts.find(p => p.type === 'day').value;
  const month = parts.find(p => p.type === 'month').value.toLowerCase();
  const year = parts.find(p => p.type === 'year').value;
  
  return `${day} ${month}. ${year}`;
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  startGlobalRecordListener();
  setupRealTimeBadges();
  setupTabListeners();
  // Default Load: Deposits Tab -> which triggers the Pending sub-tab
  switchMainTab("deposits");
});

// ✅ FIX 1: IMPROVED REAL-TIME BADGE COUNTERS
function setupRealTimeBadges() {
  onSnapshot(collectionGroup(db, "records"), (snapshot) => {
    const counts = {
      depositPending: 0, depositTrue: 0, depositFalse: 0,
      withdrawPending: 0, withdrawTrue: 0, withdrawFalse: 0
    };

    snapshot.forEach(docSnap => {
      const path = docSnap.ref.path;
      const data = docSnap.data();
      
      // Strict path validation
      const isDeposit = path.toLowerCase().startsWith("deposits");
      const isWithdraw = path.toLowerCase().startsWith("withdrawals");
      if (!isDeposit && !isWithdraw) return;

      const type = isDeposit ? "deposit" : "withdraw";
      const status = (data.status || "pending").toString().toLowerCase();

      if (status === "true") counts[`${type}True`]++;
      else if (status === "false") counts[`${type}False`]++;
      else counts[`${type}Pending`]++;
    });

    // 1. Update Sub-tab Badge Numbers
    Object.keys(counts).forEach(key => {
      const id = key.replace("deposit", "depositCount").replace("withdraw", "withdrawCount");
      const badge = document.getElementById(id);
      if (badge) badge.textContent = counts[key];
    });

    // 2. Trigger Main Tab Pulsing Alerts
    const depositBtn = document.getElementById("tabDeposits");
    const withdrawBtn = document.getElementById("tabWithdrawals");

    // If there are pending deposits, add the pulse class
    if (counts.depositPending > 0) {
      depositBtn?.classList.add("pulse-alert");
    } else {
      depositBtn?.classList.remove("pulse-alert");
    }

    // If there are pending withdrawals, add the pulse class
    if (counts.withdrawPending > 0) {
      withdrawBtn?.classList.add("pulse-alert");
    } else {
      withdrawBtn?.classList.remove("pulse-alert");
    }
  });
}


/**
 * Opens the admin chat modal for a specific user
 * and listens for real-time messages.
 */
window.viewMessages = async (userId) => {
  const modal = document.getElementById("adminChatModal");
  
  // 1. Safety Check: Verify modal exists
  if (!modal) {
    console.error("Critical Error: 'adminChatModal' not found in HTML.");
    return;
  }

  activeChatUserId = userId;
  const msgContainer = document.getElementById("adminChatMessages");
  const nameLabel = document.getElementById("chatTargetName");
  const idLabel = document.getElementById("chatTargetId");

  // 2. Open Modal & Update UI Labels
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open"); // Prevents background scrolling
  idLabel.textContent = `UID: ${userId.slice(0, 12)}...`;

  const userCard = document.querySelector(`[data-user-id="${userId}"]`);
  if (userCard) {
    const badge = userCard.querySelector(".notif-badge");
    if (badge) {
      badge.classList.add("hidden");
      badge.innerText = ""; // Reset the counter
    }
  }

  // 3. Reset User's Unread Count in Firestore
  try {
    const userRef = doc(db, "Users", userId);
    await updateDoc(userRef, { unreadCount: 0 });
    
    // Fetch username for the header
    const userDoc = await getDoc(userRef);
    nameLabel.textContent = userDoc.exists() ? `Chat: ${userDoc.data().username}` : "Support Chat";
  } catch (e) {
    console.warn("Could not update unread count or fetch username:", e);
    nameLabel.textContent = "Support Chat";
  }

  // 4. Clear previous listeners to avoid memory leaks
  if (chatUnsubscribe) chatUnsubscribe();

  // 5. Load real-time messages from sub-collection
  const q = query(collection(db, "Support", userId, "messages"), orderBy("timestamp"));
  
  chatUnsubscribe = onSnapshot(q, (snapshot) => {
    msgContainer.innerHTML = "";
    
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const isAdmin = msg.sender !== "user"; // support/admin sender
      
      const div = document.createElement("div");
      // Applying the 'msg-bubble' and side-specific classes from our Pro CSS
      div.className = `msg-bubble animate-slideUp ${
        isAdmin ? "msg-admin" : "msg-user"
      }`;
      
      // Formatting timestamp if it exists
      const timeStr = msg.timestamp 
        ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : "...";

      div.innerHTML = `
        <p>${msg.text}</p>
        <span class="msg-time">${timeStr}</span>
      `;
      
      msgContainer.appendChild(div);
    });

    // 6. Smooth Scroll to Bottom
    setTimeout(() => {
      msgContainer.scrollTo({ top: msgContainer.scrollHeight, behavior: 'smooth' });
    }, 100);
  });
};

/**
 * Handle Sending Messages
 */
const adminChatForm = document.getElementById("adminChatForm");
if (adminChatForm) {
  adminChatForm.onsubmit = async (e) => {
    e.preventDefault(); // STOP THE PAGE REFRESH
    
    const input = document.getElementById("adminChatInput");
    const text = input.value.trim();

    // Validate input and active user context
    if (!text || !activeChatUserId) return;

    try {
      const messagesRef = collection(db, "Support", activeChatUserId, "messages");
      
      await addDoc(messagesRef, {
        sender: "support",
        text: text,
        timestamp: serverTimestamp()
      });

      // Clear input and keep focus for rapid chatting
      input.value = "";
      input.focus(); 
      
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Message failed to send. Please try again.");
    }
  };
}

// --- Close Modal Logic ---
window.closeAdminChat = () => {
  const modal = document.getElementById("adminChatModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open"); // Re-enable background scrolling
  }
  
  // Stop listening for new messages to save resources
  if (chatUnsubscribe) {
    chatUnsubscribe();
    chatUnsubscribe = null;
  }
  activeChatUserId = null;
};

// --- Detect Clicks Outside the Modal ---
window.onclick = function(event) {
  const modal = document.getElementById("adminChatModal");
  // If the user clicks the modal background (the dark overlay)
  if (event.target === modal) {
    closeAdminChat();
  }
};


// ✅ CENTRALIZED MAIN TAB SWITCHER
function switchMainTab(tabName) {
  // 1. Handle Main Tab Buttons
  document.querySelectorAll(".tab").forEach(btn => {
    btn.classList.remove("active", "border-blue-600"); // Remove active styles
  });
  
  const tabBtn = document.getElementById(`tab${capitalize(tabName)}`);
  if (tabBtn) {
    tabBtn.classList.add("active", "border-blue-600"); // Add active styles
    
    // ✅ NEW: If clicking the Users tab, clear the pulse and save the timestamp
    if (tabName.toLowerCase() === "users") {
      localStorage.setItem('admin_last_viewed_users', Date.now());
      tabBtn.classList.remove("pulse-alert");
    }
  }

  // 2. Toggle Main Tab Contents using Tailwind 'hidden'
  document.querySelectorAll(".tab-content").forEach(content => {
    content.classList.add("hidden"); 
    content.classList.remove("active");
  });

  const activeContent = document.getElementById(`${tabName}Content`);
  if (activeContent) {
    activeContent.classList.remove("hidden");
    activeContent.classList.add("active");
  }

  // 3. Sub-Tab Logic
  if (tabName === "users") {
    loadUsers(); // This will now run with the updated lastViewed timestamp
  } else {
    // Force reset: Hide ALL sub-sections inside this tab first to prevent overlap
    if (activeContent) {
      activeContent.querySelectorAll(".sub-section").forEach(sec => sec.classList.add("hidden"));
    }

    // Default to "Pending" sub-tab
    const subTabId = tabName === "deposits" ? "depositTabPending" : "withdrawTabPending";
    const btn = document.getElementById(subTabId);
    
    if (btn) {
      // Small delay ensures the DOM is ready for the click event
      setTimeout(() => btn.click(), 10);
    }
  }
}

// ✅ REAL-TIME SUB-TAB LOADER
function startGlobalRecordListener() {
  const q = query(collectionGroup(db, "records"));
  
  onSnapshot(q, (snapshot) => {
    // 1. Sync the cache immediately
    allRecordsCache = snapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      data: doc.data()
    }));
    
    // 2. Reactive Update: Refresh the visible list automatically
    const activeSubTab = document.querySelector('.sub-tab.active');
    if (activeSubTab) {
      // Re-trigger the click logic to populate the list with new cache data
      activeSubTab.click(); 
    }
    
    console.log("Vault Synced: " + allRecordsCache.length + " records loaded.");
  }, (error) => {
    console.error("Global Listener Error:", error);
  });
}




// ✅ UPDATED: Now performs instant filtering from cache
async function loadRecords(type, statusFilter, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // 1. Check if we are still in the "Initial Sync" phase
  // If the cache is empty, we MUST show the loader and wait
  if (allRecordsCache.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center p-12 space-y-4 animate-pulse">
        <div class="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p class="text-indigo-600 font-semibold tracking-wide">Fetching ${statusFilter} ${type}...</p>
      </div>
    `;
    return; // Stop here and wait for the Global Listener to trigger the refresh
  }

  const fragment = document.createDocumentFragment();
  let found = false;

  // 2. Filter from the now-populated cache
  const filteredRecords = allRecordsCache.filter(item => {
    const fullPath = item.path.toLowerCase();
    const typeMatch = fullPath.startsWith(type.toLowerCase());
    if (!typeMatch) return false;

    const status = (item.data.status || "pending").toString().toLowerCase();
    const isPending = !["true", "false"].includes(status);
    return (statusFilter === "pending" && isPending) || (statusFilter === status);
  });

  // 3. Render the list
  if (filteredRecords.length > 0) {
    for (const item of filteredRecords) {
      found = true;
      const parts = item.path.split("/");
      const userId = parts[1];
      const card = await renderRecordCard(userId, item.id, item.data, type);
      fragment.appendChild(card);
    }
    container.innerHTML = ""; 
    container.appendChild(fragment);
  } else {
    // 4. Only show "No records found" if we are 100% sure the cache is loaded and empty[cite: 1]
    const label = statusFilter === "true" ? "approved" : statusFilter === "false" ? "declined" : "pending";
    container.innerHTML = `
      <div class="p-12 text-center text-slate-400 italic border-2 border-dashed border-slate-200 rounded-2xl">
        No ${label} ${type.toLowerCase()} found in database.
      </div>`;
  }
}




// ✅ USERS CARD RENDERER
// ✅ USERS CARD RENDERER WITH WALLET & COPY FUNCTION
async function renderRecordCard(userId, recordId, data, type) {
  const wrapper = document.createElement("div");
  wrapper.className = "record-card animate-slideUp";
  
  const userSnap = await getDoc(doc(db, "Users", userId));
  const username = userSnap.exists() ? (userSnap.data().username || "User") : userId;

  const date = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.createdAt || Date.now());
  const formattedDate = formatAdminDate(data.timestamp || data.createdAt);

  // Check if wallet exists and create the Full Wallet UI
  const walletHtml = data.wallet 
    ? `<div class="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-700">
        <span class="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-2">Destination Wallet</span>
        <div class="flex items-center justify-between gap-3">
          <code id="wallet-${recordId}" class="text-xs text-emerald-400 font-mono break-all leading-relaxed">${data.wallet}</code>
          <button onclick="copyToClipboard('${data.wallet}', 'btn-copy-${recordId}')" 
                  id="btn-copy-${recordId}"
                  class="flex-shrink-0 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors border border-slate-600"
                  title="Copy Address">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>
       </div>` 
    : "";

  wrapper.innerHTML = `
    <div class="record-info w-full">
      <div class="flex justify-between items-start mb-2">
        <div>
          <span class="font-bold text-indigo-600 text-base">${username}</span>
          <p class="user-id">UID: ${userId}</p>
        </div>
        <span class="text-[11px] text-slate-400 font-medium">${formattedDate}</span>
      </div>
      
      <div class="flex items-center gap-3 mb-1">
        <span class="amount text-emerald-600 text-xl font-bold">$${data.amount || data.cardValue || 0}</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded uppercase font-bold tracking-tighter border border-slate-200">
          ${data.method || "Transfer"}
        </span>
      </div>

      ${walletHtml}
      
      ${data.method === "GiftCard" ? `<p class="text-xs bg-amber-50 text-amber-700 p-2 rounded mt-2 border border-amber-100 font-medium">Code: ${data.proof || data.code}</p>` : ""}

      <div class="mt-4 flex gap-3">
        ${!["true", "false"].includes(data.status?.toString().toLowerCase()) ? `
          <button onclick="processAction('${type}', '${userId}', '${recordId}', 'approve')" class="btn-approve flex-1">Approve Request</button>
          <button onclick="processAction('${type}', '${userId}', '${recordId}', 'decline')" class="btn-decline">Decline</button>
        ` : `
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${data.status === 'true' ? 'text-emerald-500' : 'text-rose-500'}">
            ${data.status === 'true' ? '<span>✅ Transaction Confirmed</span>' : '<span>❌ Request Rejected</span>'}
          </div>
        `}
      </div>
    </div>
  `;
  return wrapper;
}

// ✅ GLOBAL COPY FUNCTION
window.copyToClipboard = (text, btnId) => {
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(btnId);
    const originalContent = btn.innerHTML;
    
    // Visual Feedback
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    btn.classList.add('border-emerald-500');
    
    setTimeout(() => {
      btn.innerHTML = originalContent;
      btn.classList.remove('border-emerald-500');
    }, 2000);
  });
};



window.sendNotificationbox = async (userId) => {
  const message = prompt("Enter the notification message for this user:");
  
  if (!message || message.trim() === "") {
    return; // Cancel if empty
  }

  try {
    // Reference: Notifications -> {userId} -> records
    const notifRef = collection(db, "Notifications", userId, "records");
    
    await addDoc(notifRef, {
      message: message,
      type: "admin_alert", // Optional: for different styling on dashboard
      read: false,         // Required: triggers the 'count > 0' logic
      timestamp: serverTimestamp(),
      sender: "Starjay Admin"
    });

    alert("Notification sent successfully!");
  } catch (error) {
    console.error("Error sending notification:", error);
    alert("Failed to send notification. Check console.");
  }
};



// ✅ Optimized Global Chat Listener for the Main Tab Badge
function listenForGlobalUnread() {
  const q = query(collectionGroup(db, "messages"), 
            where("sender", "==", "user"), 
            where("read", "==", false));

  onSnapshot(q, (snapshot) => {
    const unreadCount = snapshot.size;
    const badge = document.getElementById("chatBadge");
    const userTabBtn = document.getElementById("tabUsers");
    
    if (unreadCount > 0) {
      if (badge) {
        badge.textContent = unreadCount;
        badge.classList.remove("hidden");
      }
      userTabBtn?.classList.add("pulse-alert");
      // Only play sound if the snapshot change is a new added document
      if (!snapshot.metadata.hasPendingWrites) {
         msgSound.play().catch(() => console.log("Interaction needed for audio"));
      }
    } else {
      badge?.classList.add("hidden");
      userTabBtn?.classList.remove("pulse-alert");
    }
  });
}

// ✅ 2. FULL UPDATED loadUsers (Instant Real-time & Badges)
// ✅ Helper to prevent "toDate" crashes


window.loadUsers = function() {
  const container = document.getElementById("usersList");
  const loader = document.getElementById("usersLoading");
  if (!container) return;

  let isInitialLoad = true;

  // Real-time listener for the Users collection
  onSnapshot(collection(db, "Users"), async (snapshot) => {
    let userRegistry = [];

    // Map through users and fetch their specific chat stats
    const userPromises = snapshot.docs.map(async (userDoc) => {
      const userId = userDoc.id;
      const userData = userDoc.data();

      // Queries for notifications/activity
      const unreadQuery = query(
        collection(db, "Support", userId, "messages"),
        where("sender", "==", "user"),
        where("read", "==", false)
      );
      
      const latestMsgQuery = query(
        collection(db, "Support", userId, "messages"),
        orderBy("timestamp", "desc"),
        limit(1)
      );

      const [unreadSnap, latestSnap] = await Promise.all([
        getDocs(unreadQuery),
        getDocs(latestMsgQuery)
      ]);

      // Handle date safety (uses helper from admin.js or local fallback)
      const getSafeDate = (ts) => (ts instanceof Timestamp ? ts.toDate() : new Date(ts || 0));

      let lastActive = getSafeDate(userData.createdAt);
      if (!latestSnap.empty) {
        lastActive = getSafeDate(latestSnap.docs[0].data().timestamp);
      }

      return {
        ...userData,
        id: userId,
        unreadCount: unreadSnap.size,
        lastActivity: lastActive
      };
    });

    // Wait for all data to process to stop UI jitter
    userRegistry = await Promise.all(userPromises);

    // Sort: Unread messages first, then by most recent activity
    userRegistry.sort((a, b) => b.unreadCount - a.unreadCount || b.lastActivity - a.lastActivity);

    // Render using DocumentFragment for high performance
    const fragment = document.createDocumentFragment();
    
    userRegistry.forEach(user => {
      const card = document.createElement("div");
      const hasUnread = user.unreadCount > 0;
      const isBlocked = user.blocked === true;

      // ✅ CRITICAL: Added 'data-user-id' so notifications.js can find this card
      card.setAttribute('data-user-id', user.id);
      
      // Applying your pro styles and pulse alert if unread
      card.className = `record-card p-5 relative animate-slideUp ${
        hasUnread ? 'border-indigo-500 shadow-lg' : 'border-gray-200'
      }`;

      card.innerHTML = `
${hasUnread ? `
  <div class="absolute -top-3 -right-3 z-30">
    <div class="bg-red-600 text-white text-[11px] font-black h-8 w-8 flex items-center justify-center rounded-full shadow-lg ring-4 ring-white animate-bounce notif-badge">
      ${user.unreadCount}
    </div>
  </div>
` : `
  <div class="absolute -top-3 -right-3 z-30">
    <div class="notif-badge hidden bg-red-600 text-white text-[11px] font-black h-8 w-8 flex items-center justify-center rounded-full shadow-lg ring-4 ring-white animate-bounce">
      0
    </div>
  </div>
`}

        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-gray-900 font-extrabold text-lg tracking-tight">${user.username || 'User'}</h3>
            <p class="text font-small text-black">${user.email}</p>
          </div>
          <div class="text-right">
            <p class="text-[9px] font-bold text-gray-400 uppercase">
              ${user.createdAt 
                ? (typeof user.createdAt.toDate === 'function' 
                    ? user.createdAt.toDate().toLocaleDateString() 
                    : new Date(user.createdAt).toLocaleDateString())
                : 'N/A'}
            </p>
          </div>
        </div>
        
        <div class="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
          <div class="flex justify-between items-center">
            <span class="text-[6px] font-bold text-gray-400 uppercase" id="amttxt">Usd Balance:</span>
            <span class="text-[10px] font-bold text-green "  id="bal-${user.id}">$0.00</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 mb-2">
          <button onclick="adjustBalance('${user.id}', 'add')" id="adbtn" class="bg-gray-100 hover:bg-emerald-50 text-emerald-700 text-[10px] font-bold py-2 rounded-lg transition-colors">
            + ADD FUNDS
          </button>
          <button onclick="adjustBalance('${user.id}', 'minus')" id="rmbtn" class="bg-gray-100 hover:bg-red-50 text-red-700 text-[10px] font-bold py-2 rounded-lg transition-colors">
            - MINUS FUNDS
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2 mb-3">
          <button onclick="toggleBlockUser('${user.id}')" class="bg-gray-100 hover:bg-gray-800 hover:text-white text-gray-700 text-[10px] font-bold py-2 rounded-lg transition-all">
            ${isBlocked ? '🔓 UNBLOCK' : '🚫 BLOCK'}
          </button>
          <button onclick="sendNotificationbox('${user.id}')" class="bg-gray-100 hover:bg-indigo-600 hover:text-white text-gray-700 text-[10px] font-bold py-2 rounded-lg transition-all">
            🔔 NOTIFY
          </button>
        </div>

        <button onclick="viewMessages('${user.id}')" id="chatbtn" class="btn-gradient-blue w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95">
          📨 CHAT SUPPORT 
          ${hasUnread ? `<span class="bg-white text-indigo-600 px-2 py-0.5 rounded-full text-[10px] ml-1">${user.unreadCount}</span>` : ''}
        </button>
      `;

      fragment.appendChild(card);
      
      // Real-time balance listener for this specific card
      onSnapshot(doc(db, "Wallet", user.id), (wSnap) => {
        const bEl = document.getElementById(`bal-${user.id}`);
        if (bEl) {
          const balance = wSnap.data()?.usd || 0;
          bEl.textContent = `$${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        }
      });
    });

    container.innerHTML = "";
    container.appendChild(fragment);

    // Initial Load UI Logic
    if (isInitialLoad) {
      if (loader) loader.classList.add("hidden");
      container.classList.remove("opacity-0");
      isInitialLoad = false;
    }
  });
};





window.adjustBalance = async (userId, action) => {
  const amountStr = prompt(`Enter amount to ${action === 'add' ? 'add to' : 'deduct from'} user balance:`);
  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid positive number.");
    return;
  }

  const walletRef = doc(db, "Wallet", userId);

  try {
    const wSnap = await getDoc(walletRef);
    const currentBalance = wSnap.exists() ? (wSnap.data().usd || 0) : 0;
    
    let newBalance;
    if (action === 'add') {
      newBalance = currentBalance + amount;
    } else {
      if (currentBalance < amount) {
        if (!confirm("User has insufficient funds. Proceed with negative balance?")) return;
      }
      newBalance = currentBalance - amount;
    }

    await setDoc(walletRef, { usd: newBalance }, { merge: true });
    
    // UI updates automatically because of the onSnapshot listener in loadUsers
    console.log(`Successfully ${action === 'add' ? 'added' : 'deducted'} $${amount}`);
  } catch (error) {
    console.error("Balance update failed:", error);
    alert("Failed to update balance. Check console for details.");
  }
};

// ✅ ACTIONS
window.processAction = async (type, userId, recordId, action) => {
  // 1. Identify the card in the DOM immediately
  // We look for the card that contains this specific recordId
  const recordCards = document.querySelectorAll('.record-card, .animate-slideUp');
  let targetCard = null;
  
  recordCards.forEach(card => {
    // Check if the buttons inside this card belong to this record
    if (card.innerHTML.includes(`'${recordId}'`)) {
      targetCard = card;
    }
  });

  // 2. Optimistic UI Update: Hide the card immediately with a fade-out
  if (targetCard) {
    targetCard.style.transition = "all 0.3s ease";
    targetCard.style.opacity = "0";
    targetCard.style.transform = "translateX(20px)";
    
    // Remove from DOM after animation
    setTimeout(() => {
      targetCard.remove();
      
      // If the container is now empty, show the "No pending" message
      const container = targetCard.parentElement;
      if (container && container.children.length === 0) {
        container.innerHTML = `<div class="p-10 text-center text-gray-400 italic">No pending ${type.toLowerCase()} found.</div>`;
      }
    }, 300);
  }

  // 3. Database Operations (Running in the background)
  const recordRef = doc(db, type, userId, "records", recordId);
  const walletRef = doc(db, "Wallet", userId);

  try {
    if (action === "approve") {
      const snap = await getDoc(recordRef);
      if (!snap.exists()) return;
      
      const amount = Number(snap.data().amount || snap.data().cardValue || 0);
      const wSnap = await getDoc(walletRef);
      const current = Number(wSnap.exists() ? (wSnap.data().usd || 0) : 0);

      // Update Wallet balance
      await setDoc(walletRef, { 
        usd: type === "Deposits" ? current + amount : current - amount 
      }, { merge: true });
      
      // Mark as approved
      await updateDoc(recordRef, { status: "true" });
    } else {
      // Mark as declined
      await updateDoc(recordRef, { status: "false" });
    }
    
    console.log(`${type} ${action}d successfully`);
  } catch (e) {
    console.error("Action failed:", e);
    // Optional: Restore the card if the database update fails
    alert("Error processing action. Please refresh.");
  }
};

// ✅ TAB LISTENERS
function setupTabListeners() {
  document.getElementById("tabDeposits").onclick = () => switchMainTab("deposits");
  document.getElementById("tabWithdrawals").onclick = () => switchMainTab("withdrawals");
  document.getElementById("tabUsers").onclick = () => switchMainTab("users");

  const subMapping = [
    { id: "depositTabPending", type: "Deposits", status: "pending", list: "depositPendingList" },
    { id: "depositTabApproved", type: "Deposits", status: "true", list: "depositApprovedList" },
    { id: "depositTabDeclined", type: "Deposits", status: "false", list: "depositDeclinedList" },
    { id: "withdrawTabPending", type: "Withdrawals", status: "pending", list: "withdrawPendingList" },
    { id: "withdrawTabApproved", type: "Withdrawals", status: "true", list: "withdrawApprovedList" },
    { id: "withdrawTabDeclined", type: "Withdrawals", status: "false", list: "withdrawDeclinedList" }
  ];

  subMapping.forEach(m => {
  const btn = document.getElementById(m.id);
  if (btn) {
    btn.onclick = () => {
      const parent = btn.parentElement;
      if (!parent) return;

      // 1. Update Sub-Tab Button UI
      parent.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active', 'bg-blue-100'));
      btn.classList.add('active', 'bg-blue-100');

      // 2. Resolve Section ID (Handles 'PendingSection' or 'SectionPending')
      const pattern1 = m.id.replace('Tab', 'Section'); // e.g., depositSectionPending
      const pattern2 = m.id.replace('Tab', '') + 'Section'; // e.g., depositPendingSection
      
      const targetSection = document.getElementById(pattern1) || document.getElementById(pattern2);
      
      if (targetSection) {
        // Hide all sibling sections in the main tab content
        const mainContent = btn.closest('.tab-content');
        mainContent.querySelectorAll('.sub-section').forEach(s => {
          s.classList.add('hidden');
          s.classList.remove('active');
        });

        // Show the correct one
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
      } else {
        console.error(`Could not find section for ${m.id}. tried: ${pattern1}, ${pattern2}`);
      }

      // 3. Load the data
      loadRecords(m.type, m.status, m.list);
    };
  }
});
}

// ✅ HELPERS
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }



window.toggleBlockUser = async (userId) => {
  const ref = doc(db, "Users", userId);
  const snap = await getDoc(ref);
  await updateDoc(ref, { blocked: !snap.data().blocked });
};

window.sendNotificationbox = (userId) => {
  window.currentNotifyUserId = userId;
  document.getElementById("notificationPopup").classList.remove("hidden");
};

window.closeNotificationBox = () => document.getElementById("notificationPopup").classList.add("hidden");

window.sendNotificationMessage = async () => {
  const title = document.getElementById("notifTitle").value;
  const msg = document.getElementById("notifMessage").value;
  await addDoc(collection(db, "Notifications", window.currentNotifyUserId, "records"), {
    title, message: msg, from: "admin", read: false, timestamp: Timestamp.now()
  });
  alert("Notification Sent");
  closeNotificationBox();
};



