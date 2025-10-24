// ✅ 1. Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collectionGroup,
  collection,
  getDocs,
  getDoc,
  addDoc,
  Timestamp,
  setDoc,
  query, orderBy, onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔧 Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCm7rYZgvhCjYoAr4_KzQcQovH1kClLtdI",
  authDomain: "aurumcaptial.firebaseapp.com",
  projectId: "aurumcaptial",
  storageBucket: "aurumcaptial.firebasestorage.app",
  messagingSenderId: "929610002491",
  appId: "1:929610002491:web:ec818b7da5460c828d2c1e",
  measurementId: "G-Z14JZMBJT1"
};

// ✅ Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentChatUserId = "";




let unsubscribeChatListener = null; // 🔁 For stopping previous listeners

window.viewMessages = function (userId) {

  
  currentChatUserId = userId;

  // Show chat popup
  document.getElementById("chatPopup").classList.remove("hidden");

  // Reset chat box
  const chatBox = document.getElementById("chatMessages");
  chatBox.innerHTML = "<p class='loading'>Loading...</p>";

  // 🛑 Unsubscribe previous listener (if exists)
  if (unsubscribeChatListener) unsubscribeChatListener();

  // Set up new listener
  const q = query(
    collection(db, `Support/${userId}/messages`),
    orderBy("timestamp", "asc")
  );

  unsubscribeChatListener = onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = ""; // Clear before rendering

    if (snapshot.empty) {
      chatBox.innerHTML = "<p class='text-gray-400 italic'>No messages yet.</p>";
    } else {
      snapshot.forEach(doc => {
        const data = doc.data();
        const isAdmin = data.sender === "admin";

        const msg = document.createElement("div");
        msg.className = `chat-bubble ${isAdmin ? "from-admin" : "from-user"}`;
        msg.textContent = `${isAdmin ? "💬 Support" : "👤 User"}: ${data.text}`;
        chatBox.appendChild(msg);
      });

      // Auto scroll to bottom
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  });
};




window.closeChat = function () {
  document.getElementById("chatPopup").classList.add("hidden");
  currentChatUserId = "";
};

window.sendChatMessage = async function () {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text || !currentChatUserId) return;

  const ref = doc(collection(db, `Support/${currentChatUserId}/messages`));
  await setDoc(ref, {
    sender: "admin",
    text,
    timestamp: new Date()
  });

  input.value = "";
  viewMessages(currentChatUserId); // Reload chat
};


// ✅ Helper
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ✅ Main Tabs: Deposits | Withdrawals
document.getElementById("tabDeposits").addEventListener("click", () => {
  switchMainTab("deposits");
});
document.getElementById("tabWithdrawals").addEventListener("click", () => {
  switchMainTab("withdrawals");
});

function switchMainTab(tab) {
  document.querySelectorAll(".tab").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(div => div.classList.remove("active"));

  document.getElementById(`tab${capitalize(tab)}`).classList.add("active");
  document.getElementById(`${tab}Content`).classList.add("active");
}

async function addFunds(userId) {
  try {
    // Check if user is blocked
    const userRef = doc(db, "Users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().blocked === true) {
      alert("❌ Cannot add funds — user is blocked.");
      return;
    }

    // Prompt for amount
    const input = prompt(`Enter amount to add to ${userId}'s wallet:`);
    if (!input) return;

    const amount = parseFloat(input);
    if (isNaN(amount) || amount <= 0) {
      alert("❌ Invalid amount.");
      return;
    }

    // Get or create wallet document
    const walletRef = doc(db, "Wallet", userId);
    const walletSnap = await getDoc(walletRef);

    let current = 0;
    if (walletSnap.exists()) {
      const data = walletSnap.data();
      current = parseFloat(data.usd) || 0;
    } else {
      // Create wallet if it doesn't exist
      await setDoc(walletRef, { usd: 0 });
      console.log(`🆕 Wallet created for user: ${userId}`);
    }

    const newBalance = current + amount;

    // Update wallet balance
    await updateDoc(walletRef, { usd: newBalance });
    alert(`✅ $${amount} added successfully. New balance: $${newBalance}`);

    // Optional: reload UI
    if (typeof loadUsers === "function") loadUsers();

  } catch (err) {
    console.error("🔥 Failed to add funds:", err);
    alert("❌ Failed to add funds.");
  }
}


// ✅ Sub-tab logic
const subTabs = [
  { btn: "depositTabPending", section: "depositPendingSection", status: "pending", type: "Deposits" },
  { btn: "depositTabApproved", section: "depositApprovedSection", status: "true", type: "Deposits" },
  { btn: "depositTabDeclined", section: "depositDeclinedSection", status: "false", type: "Deposits" },
  { btn: "withdrawTabPending", section: "withdrawPendingSection", status: "pending", type: "Withdrawals" },
  { btn: "withdrawTabApproved", section: "withdrawApprovedSection", status: "true", type: "Withdrawals" },
  { btn: "withdrawTabDeclined", section: "withdrawDeclinedSection", status: "false", type: "Withdrawals" },
];

subTabs.forEach(({ btn, section, status, type }) => {
  document.getElementById(btn).addEventListener("click", () => {
    document.querySelectorAll(`#${type.toLowerCase()}Content .sub-tab`).forEach(el => el.classList.remove("active"));
    document.querySelectorAll(`#${type.toLowerCase()}Content .sub-section`).forEach(el => el.classList.remove("active"));

    document.getElementById(btn).classList.add("active");
    document.getElementById(section).classList.add("active");

    loadRecords(type, status, document.getElementById(section).querySelector("div"));
  });
});

// ✅ Load from Firestore
async function loadRecords(type, statusFilter, container) {
  container.innerHTML = "<p>Loading...</p>";

  try {
    const snap = await getDocs(collectionGroup(db, "records"));
    let count = 0;
    let found = false;
    container.innerHTML = "";

    // We'll collect promises so we can await user + wallet fetches in parallel per doc
    const renderPromises = [];

    snap.forEach(docSnap => {
      const path = docSnap.ref.path; // e.g. "Deposits/{userId}/records/{recordId}"
      const parts = path.split("/");

      // defensive: expect at least 4 parts
      if (parts.length < 4) return;

      const parentCollection = parts[0];              // "Deposits" or "Withdrawals"
      const userId = parts[1];                        // user id
      const sub = parts[2];                           // "records"
      const recordId = parts[3];                      // record id

      const isCorrectType = parentCollection === type;
      const data = docSnap.data();
      const status = data.status?.toString();
      const isPending = !["true", "false"].includes(status);

      const shouldShow = (
        (statusFilter === "pending" && isPending) ||
        (statusFilter === status)
      );

      if (!isCorrectType || !shouldShow) return;

      found = true;
      count++;

      // Fetch user name and wallet in parallel
      renderPromises.push((async () => {
        // Fetch user doc
        let displayName = userId;
        try {
          const userRef = doc(db, "Users", userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const ud = userSnap.data();
            displayName = ud.username || ud.name || ud.email || userId;
          }
        } catch (e) {
          console.warn("Could not fetch user for", userId, e);
        }

        // Fetch wallet
        let walletValue = "N/A";
        try {
          const walletRef = doc(db, "Wallet", userId);
          const walletSnap = await getDoc(walletRef);
          if (walletSnap.exists()) {
            const w = walletSnap.data();
            walletValue = typeof w.usd !== "undefined" ? Number(w.usd) : "N/A";
          }
        } catch (e) {
          console.warn("Could not fetch wallet for", userId, e);
        }

        // Normalize date formatting
        let dateStr = "Unknown";
        const createdAt = data.createdAt ?? data.timestamp ?? null;
        if (createdAt) {
          try {
            let dateObj;
            if (typeof createdAt === "string") {
              dateObj = new Date(createdAt);
            } else if (typeof createdAt.toDate === "function") {
              // Firestore Timestamp
              dateObj = createdAt.toDate();
            } else {
              dateObj = new Date(createdAt);
            }
            if (!isNaN(dateObj)) {
              dateStr = dateObj.toLocaleString();
            }
          } catch (e) {
            console.warn("Date parse error:", e);
          }
        }

        // Grab gift card type/proof fields if present
        const cardType = data.cardType || data.type || "N/A";
        const proof = data.proof || data.code || data.proofCode || "N/A";
        const proofType = data.proofType || "N/A";
        const amount = typeof data.amount !== "undefined" ? data.amount : (data.cardValue || "N/A");
        const method = data.method || "N/A";
        const statusText = data.status || (isPending ? "pending" : "N/A");

        // Append rendered card to container
        const cardEl = renderCard({
          userId,
          displayName,
          recordId,
          amount,
          walletValue,
          method,
          dateStr,
          status: statusText,
          cardType,
          proof,
          proofType,
          rawData: data,
          type // Deposits / Withdrawals
        });

        container.appendChild(cardEl);
      })());
    });

    await Promise.all(renderPromises);

    if (!found) {
      container.innerHTML = `<p class="text-gray-500 text-sm">No ${statusFilter} ${type.toLowerCase()} found.</p>`;
    }

    // Update the tab count
    const base = type === "Deposits" ? "deposit" : "withdraw";
    const countId = `${base}Count${capitalize(statusFilter)}`;
    console.log("🔍 Count ID:", countId);

    const badge = document.getElementById(countId);
    console.log("📛 Badge found:", badge);

    if (badge) {
      badge.textContent = count;
    } else {
      console.warn(`⚠️ Could not find span with id="${countId}" in your HTML`);
    }

  } catch (err) {
    console.error(`❌ Error loading ${type}:`, err);
    container.innerHTML = `<p class="text-red-500">Error loading ${type.toLowerCase()}.</p>`;
  }
}

window.toggleBlockUser = async function toggleBlockUser(userId) {
  try {
    const userRef = doc(db, "Users", userId);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      alert("User not found.");
      return;
    }

    const currentStatus = snap.data().blocked === true;
    await updateDoc(userRef, { blocked: !currentStatus });

    alert(currentStatus ? "✅ User unblocked" : "🚫 User blocked");

    // Optional: Refresh the user list
    loadUsers(); // Ensure you have a function that loads the full user list again

  } catch (error) {
    console.error("Error toggling block:", error);
    alert("An error occurred while updating block status.");
  }
}

let currentNotifyUserId = null;

window.sendNotificationbox = function (userId) {
  currentNotifyUserId = userId;
  document.getElementById("notificationPopup").classList.remove("hidden");
  document.getElementById("notifTitle").value = "";
  document.getElementById("notifMessage").value = "";
};

window.closeNotificationBox = function () {
  currentNotifyUserId = null;
  document.getElementById("notificationPopup").classList.add("hidden");
};


window.sendNotificationMessage = async function () {
  const title = document.getElementById("notifTitle").value.trim();
  const message = document.getElementById("notifMessage").value.trim();

  if (!title || !message) return alert("⚠️ Please fill in both fields.");
  if (!currentNotifyUserId) return alert("⚠️ No user selected.");

  try {
    await addDoc(collection(db, "Notifications", currentNotifyUserId, "records"), {
      title,
      message,
      from: "admin",
      read: false,
      timestamp: Timestamp.now()
    });

    alert("✅ Notification sent!");
    window.closeNotificationBox();
  } catch (err) {
    console.error("❌ Failed to send notification:", err);
    alert("Error sending notification.");
  }
};

async function removeFunds(userId) {
  const userSnap = await getDoc(doc(db, "Users", userId));
  if (userSnap.exists() && userSnap.data().blocked === true) {
    alert("❌ Cannot remove funds — user is blocked.");
    return;
  }

  const input = prompt(`Enter amount to REMOVE from ${userId}'s wallet:`);

  if (!input) return;
  const amount = parseFloat(input);

  if (isNaN(amount) || amount <= 0) {
    alert("❌ Invalid amount.");
    return;
  }

  try {
    const walletRef = doc(db, "Wallet", userId);
    const walletSnap = await getDoc(walletRef);

    let current = 0;
    if (walletSnap.exists()) {
      const data = walletSnap.data();
      current = parseFloat(data.usd) || 0;
    }

    if (amount > current) {
      alert("❌ Cannot remove more than current balance.");
      return;
    }

    const newBalance = current - amount;

    await updateDoc(walletRef, { usd: newBalance });
    alert(`✅ $${amount} removed. New balance: $${newBalance}`);

    if (typeof loadUsers === "function") loadUsers();

  } catch (err) {
    console.error("🔥 Failed to remove funds:", err);
    alert("❌ Failed to remove funds.");
  }
}

window.removeFunds = removeFunds; // Register globally



async function loadUsers() {
  
  const container = document.getElementById("usersList");
  container.innerHTML = "<p>Loading users...</p>";

  try {
    const snap = await getDocs(collection(db, "Users"));
    container.innerHTML = "";

    for (const docSnap of snap.docs) {
      const user = docSnap.data();
      const userId = docSnap.id;

      // 🔄 Fetch wallet balance
          let balance = 0;
try {
  const walletDoc = await getDoc(doc(db, "Wallet", userId));
  if (walletDoc.exists()) {
    const walletData = walletDoc.data();
    balance = walletData.usd || 0; // ✅ the usd field is inside the Wallet/{userId} doc
  }
} catch (e) {
  console.warn(`⚠️ Error fetching wallet for ${userId}:`, e);
}

      const isBlocked = user.blocked === true;


      const card = document.createElement("div");
      card.className = "p-4 bg-white shadow rounded space-y-2";

      card.innerHTML = `
  <div class="user-card-content">
    <h3 class="username font-bold text-xl text-blue-400 tracking-wide">${user.username || "Unnamed"}</h3>
    <p><strong class="label">Email:</strong> <span class="text-slate-300">${user.email || "No email"}</span></p>
    <p><strong class="label">Wallet:</strong> <span class="wallet-balance">$${balance}</span></p>

    <div class="user-actions flex gap-2 flex-wrap mt-3">
      <button onclick="sendNotificationbox('${userId}')" class="sendBtn">🔔 Notify</button>
      <button onclick="viewMessages('${userId}')" class="replyBtn">📨 Messages</button>
      <button onclick="addFunds('${userId}')" 
        class="addFundsBtn ${isBlocked ? 'disabledBtn' : ''}" 
        ${isBlocked ? 'disabled' : ''}>
        ➕ Add Funds
      </button>
      <button onclick="removeFunds('${userId}')" 
    class="removeFundsBtn ${isBlocked ? 'disabledBtn' : ''}" 
    ${isBlocked ? 'disabled' : ''}>
    ➖ Remove Funds
  </button>
      <button onclick="toggleBlockUser('${userId}')" class="blockBtn">
      ${isBlocked ? '🔓 Unblock' : '🚫 Block'}
    </button>
    </div>
  </div>
`;


      container.appendChild(card);
    }

  } catch (err) {
    console.error("❌ Failed to load users:", err);
    container.innerHTML = `<p class="text-red-500">Failed to fetch users.</p>`;
  }
}


// ✅ Card Renderer
function renderCard(info) {
  const {
    userId, displayName, recordId, amount, walletValue,
    method, dateStr, status, cardType, proof, proofType, rawData, type
  } = info;

  const wrapper = document.createElement("div");
  wrapper.className = "p-4 bg-white border rounded shadow space-y-1 sub-record-card";

  const isPending = !["true", "false"].includes((rawData.status || "").toString());

  // 🧠 Format date nicely if valid
  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
    : "Unknown";

  // 🧩 Base HTML
  let html = `
    <p class="text-sm">
      <strong>User:</strong> ${escapeHtml(displayName)} 
      <span class="text-xs text-slate-400">(${escapeHtml(userId)})</span>
    </p>
    <p><strong>Amount:</strong> $${escapeHtml(amount)}</p>
    <p><strong>Wallet:</strong> ${walletValue === "N/A" ? "N/A" : `$${escapeHtml(walletValue)}`}</p>
    <p><strong>Method:</strong> ${escapeHtml(method)}</p>
  `;

  // 🎁 Only add GiftCard fields when method is GiftCard
  if (method === "GiftCard") {
    html += `
      <p><strong>Gift Type:</strong> ${escapeHtml(cardType || "N/A")}</p>
      <p><strong>Proof (${escapeHtml(proofType || "code")}):</strong> <code>${escapeHtml(proof || "N/A")}</code></p>
    `;
  }

  // 📅 Add date + status
  html += `
    <p><strong>Date:</strong> ${escapeHtml(formattedDate)}</p>
    <p><strong>Status:</strong> ${escapeHtml(status)}</p>
  `;

  // 🧾 Add action buttons if pending
  if (isPending) {
    html += `
      <div class="flex gap-2 mt-2">
        <button 
          class="approveBtn bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 transition"
          data-user="${userId}" 
          data-id="${recordId}" 
          data-type="${type}"
        >✅ Approve</button>
        <button 
          class="declineBtn bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition"
          data-user="${userId}" 
          data-id="${recordId}" 
          data-type="${type}"
        >❌ Decline</button>
      </div>
    `;
  }

  wrapper.innerHTML = html;

  // Attach buttons listeners for this card
  attachAdminActions(wrapper);

  return wrapper;
}


/** small HTML-escape helper to avoid accidental injection when displaying DB strings */
function escapeHtml(str) {
  if (str === null || typeof str === "undefined") return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}



// ✅ Button Actions
function attachAdminActions(container) {
  // Approve buttons
  container.querySelectorAll(".approveBtn").forEach(btn => {
    // Avoid attaching duplicate listeners
    if (btn._attached) return;
    btn._attached = true;

    btn.addEventListener("click", async () => {
      const { user, id, type } = btn.dataset;
      const recordRef = doc(db, type, user, "records", id);
      const walletRef = doc(db, "Wallet", user);

      try {
        // 1. Get transaction data
        const recordSnap = await getDoc(recordRef);
        if (!recordSnap.exists()) {
          alert("❌ Record not found");
          return;
        }

        const record = recordSnap.data();
        const amount = Number(record.amount || record.cardValue || 0);
        if (isNaN(amount)) {
          alert("❌ Invalid amount");
          return;
        }

        // 2. Get current wallet balance
        const walletSnap = await getDoc(walletRef);
        const currentBalance = walletSnap.exists()
          ? Number(walletSnap.data().usd || walletSnap.data().walletBalance || 0)
          : 0;

        // update balance
        let newBalance = currentBalance;
        if (type === "Deposits") {
          newBalance = currentBalance + amount;
        } else if (type === "Withdrawals") {
          newBalance = currentBalance - amount;
          if (newBalance < 0) {
            alert("❌ Not enough balance in wallet");
            return;
          }
        }

        // Use setDoc with merge to create wallet if missing
        await setDoc(walletRef, { usd: newBalance }, { merge: true });
        await updateDoc(recordRef, { status: "true" });

        alert("✅ Approved and wallet updated");
        // emit refresh event to parent sub-section
        btn.closest(".sub-section")?.dispatchEvent(new Event("refresh"));
      } catch (err) {
        console.error("❌ Approval error:", err);
        alert("❌ Something went wrong during approval");
      }
    });
  });

  // Decline buttons
  container.querySelectorAll(".declineBtn").forEach(btn => {
    if (btn._attached) return;
    btn._attached = true;

    btn.addEventListener("click", async () => {
      const { user, id, type } = btn.dataset;
      const ref = doc(db, type, user, "records", id);
      try {
        await updateDoc(ref, { status: "false" });
        alert("❌ Declined");
        btn.closest(".sub-section")?.dispatchEvent(new Event("refresh"));
      } catch (err) {
        console.error("❌ Decline error:", err);
        alert("❌ Could not decline the record");
      }
    });
  });
}


// ✅ Auto Refresh After Status Change
document.querySelectorAll(".sub-section").forEach(section => {
  section.addEventListener("refresh", () => {
    const tabBtn = section.id.replace("Section", "Tab");
    const tabEl = document.getElementById(tabBtn);
    if (tabEl) tabEl.click(); // simulate refresh only if element exists
  });
});

// ✅ Load Default Tab (safe check)
const depPending = document.getElementById("depositTabPending");
if (depPending) depPending.click();

// ✅ Users tab
const tabUsers = document.getElementById("tabUsers");
if (tabUsers) {
  tabUsers.addEventListener("click", () => {
    switchMainTab("users");
    loadUsers(); // 🔥 Load users when tab opens
  });
}

// ✅ Expose global functions
window.addFunds = addFunds;

// ✅ Close chat safely
const closeChatBtn = document.getElementById("closeChat");
if (closeChatBtn) {
  closeChatBtn.addEventListener("click", () => {
    if (unsubscribeChatListener) unsubscribeChatListener();
    const popup = document.getElementById("chatPopup");
    if (popup) popup.classList.add("hidden");
  });
}

