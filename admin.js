// ✅ 1. Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collectionGroup,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
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
const db = getFirestore(app);

// --- GLOBAL STATE ---
let currentChatUserId = "";
let unsubscribeChatListener = null;
let activeRecordListener = null;
let allRecordsCache = []; // Stores all fetched records locally
let activeChatUserId = null;
let chatUnsubscribe = null;
// 🎵 Sound effect for new messages
const msgSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');


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




window.viewMessages = async (userId) => {
  const modal = document.getElementById("adminChatModal");
  
  // ✅ Safety Check: If modal doesn't exist, stop the error
  if (!modal) {
    console.error("Critical Error: 'adminChatModal' not found in HTML.");
    alert("Chat Modal is missing from the HTML file.");
    return;
  }

  activeChatUserId = userId;
  const msgContainer = document.getElementById("adminChatMessages");
  const nameLabel = document.getElementById("chatTargetName");
  const idLabel = document.getElementById("chatTargetId");

  // Open Modal
  modal.classList.remove("hidden");
  idLabel.textContent = `UID: ${userId}`;

  // Fetch specific user data to show who you are talking to
  try {
    const userDoc = await getDoc(doc(db, "Users", userId));
    nameLabel.textContent = userDoc.exists() ? `Chat: ${userDoc.data().username}` : "Support Chat";
  } catch (e) {
    nameLabel.textContent = "Support Chat";
  }

  // Clear previous listeners
  if (chatUnsubscribe) chatUnsubscribe();

  // Load actual support messages from the specific user sub-collection
  const q = query(collection(db, "Support", userId, "messages"), orderBy("timestamp"));
  
  chatUnsubscribe = onSnapshot(q, (snapshot) => {
    msgContainer.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const isAdmin = msg.sender !== "user"; // dashboard.js treats non-"user" as support[cite: 2]
      
      const div = document.createElement("div");
      div.className = `max-w-[85%] p-3 rounded-2xl text-sm animate-slideUp ${
        isAdmin 
        ? "bg-indigo-600 text-white self-end rounded-tr-none" 
        : "bg-white text-slate-800 self-start rounded-tl-none border border-slate-200"
      }`;
      
      div.innerHTML = `<p>${msg.text}</p>`;
      msgContainer.appendChild(div);
    });
    msgContainer.scrollTo({ top: msgContainer.scrollHeight, behavior: 'smooth' });
  });
};

// ✅ Ensure the form handler is correctly stopping the refresh
const adminChatForm = document.getElementById("adminChatForm");

if (adminChatForm) {
  adminChatForm.onsubmit = async (e) => {
    // 1. STOP THE REFRESH IMMEDIATELY
    e.preventDefault(); 
    
    const input = document.getElementById("adminChatInput");
    const text = input.value.trim();

    // 2. Validate input and active user
    if (!text || !activeChatUserId) return;

    try {
      // 3. Send message to the Support sub-collection
      const messagesRef = collection(db, "Support", activeChatUserId, "messages");
      
      await addDoc(messagesRef, {
        sender: "support", // Dashboard.js recognizes this as the support agent
        text: text,
        timestamp: serverTimestamp()
      });

      // 4. Clear input and maintain focus for the next message
      input.value = "";
      input.focus(); 
      
      // The onSnapshot in viewMessages will automatically scroll the new message into view
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Message failed to send. Check your connection.");
    }
  };
}

window.closeAdminChat = () => {
  const modal = document.getElementById("adminChatModal");
  if (modal) modal.classList.add("hidden");
  if (chatUnsubscribe) chatUnsubscribe();
  activeChatUserId = null;
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



// ✅ REAL-TIME USERS LOADER
window.loadUsers = function() {
  const container = document.getElementById("usersList");
  if (!container) return;

  onSnapshot(collection(db, "Users"), (snapshot) => {
    container.innerHTML = "";
    
    const userList = [];
    snapshot.forEach(doc => userList.push({ id: doc.id, ...doc.data() }));
    
    // 1. Sort by newest registration first
    userList.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return timeB - timeA; 
    });

    // Get the timestamp of the last time the admin viewed this tab
    const lastViewed = parseInt(localStorage.getItem('admin_last_viewed_users') || 0);

    userList.forEach((userData) => {
      const userId = userData.id;
      const rawDate = userData.createdAt?.toDate?.() || new Date(userData.createdAt || Date.now());
      const regDateFormatted = formatAdminDate(userData.createdAt);
      
      // 2. Individual Card Logic: Show "NEW" badge for 24 hours
      const hoursSinceReg = (new Date() - rawDate) / (1000 * 60 * 60);
      const isNewFor24h = hoursSinceReg < 24;

      const userCard = document.createElement("div");
      userCard.className = `record-card animate-slideUp ${isNewFor24h ? 'border-l-4 border-indigo-500' : ''}`;
      
      userCard.innerHTML = `
    <div class="record-info w-full">
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-indigo-700 text-lg">${userData.username || "Unnamed"}</h3>
          ${isNewFor24h ? '<span class="badge-new">NEW</span>' : ''}
        </div>
        <span class="text-[10px] text-slate-500 font-mono font-bold">${regDateFormatted}</span>
      </div>
      
      <p class="text-sm text-slate-600 mb-3">${userData.email || "No Email"}</p>
      
      <div class="bg-slate-100 p-3 rounded-lg border border-slate-200 mb-3">
         <span class="text-[9px] uppercase text-slate-500 font-bold block mb-1">Available Balance</span>
         <span class="wallet-val text-xl font-black text-emerald-700" id="bal-${userId}">$0</span>
      </div>

      <!-- ✅ GRADIENT FINANCIAL CONTROLS -->
      <div class="flex gap-2 mb-2">
         <button onclick="adjustBalance('${userId}', 'add')" 
                 class="btn-gradient-blue flex-1 py-2.5 text-white text-[11px] font-bold rounded-md flex items-center justify-center gap-1">
           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
           ADD FUNDS
         </button>
         <button onclick="adjustBalance('${userId}', 'minus')" 
                 class="btn-gradient-blue flex-1 py-2.5 text-white text-[11px] font-bold rounded-md flex items-center justify-center gap-1">
           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
           MINUS FUNDS
         </button>
      </div>

      <!-- ✅ GRADIENT MANAGEMENT CONTROLS -->
      <div class="flex gap-2 flex-wrap">
         <button onclick="sendNotificationbox('${userId}')" class="btn-gradient-blue flex-1 py-2 text-[11px] font-bold">🔔 Notify</button>
         <button onclick="viewMessages('${userId}')" class="btn-gradient-blue flex-1 py-2 text-[11px] font-bold">📨 Chat</button>
         <button onclick="toggleBlockUser('${userId}')" class="btn-gradient-blue text-[11px] px-3 py-2 font-bold">
            ${userData.blocked ? '🔓 Unblock' : '🚫 Block'}
         </button>
      </div>
    </div>
  `;
      container.appendChild(userCard);

      onSnapshot(doc(db, "Wallet", userId), (wSnap) => {
        const balEl = document.getElementById(`bal-${userId}`);
        if (balEl) balEl.textContent = `$${wSnap.exists() ? (wSnap.data().usd || 0).toLocaleString() : 0}`;
      });
    });

    // 3. Tab Badge Logic: Pulse only for users registered AFTER the last visit[cite: 1]
    const hasUnseenUsers = userList.some(u => {
      const regTime = u.createdAt?.toDate?.()?.getTime() || new Date(u.createdAt || 0).getTime();
      return regTime > lastViewed;
    });
    
    const userTabBtn = document.getElementById("tabUsers");
    const isCurrentlyOnUserTab = userTabBtn?.classList.contains('active');

    // Only alert if there are unseen users AND the admin isn't currently looking at the list[cite: 1]
    if (hasUnseenUsers && !isCurrentlyOnUserTab) {
      userTabBtn?.classList.add("pulse-alert");
    } else {
      userTabBtn?.classList.remove("pulse-alert");
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



