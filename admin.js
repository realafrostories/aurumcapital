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
  apiKey: "AIzaSyCF4I3704KZW6jmvasHGmdsK468ssAuebA",
  authDomain: "altumfi-f39f1.firebaseapp.com",
  projectId: "altumfi-f39f1",
  storageBucket: "altumfi-f39f1.appspot.com",
  messagingSenderId: "838201454123",
  appId: "1:838201454123:web:c738f1938438c7dd9b446e"
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
  const userSnap = await getDoc(doc(db, "Users", userId));
  if (userSnap.exists() && userSnap.data().blocked === true) {
    alert("❌ Cannot add funds — user is blocked.");
    return;
  }

  const input = prompt(`Enter amount to add to ${userId}'s wallet:`);

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

    const newBalance = current + amount;

    await updateDoc(walletRef, { usd: newBalance });
    alert(`✅ $${amount} added. New balance: $${newBalance}`);

    // Optional: reload users if you're showing balances live
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

    snap.forEach(docSnap => {
      const path = docSnap.ref.path; // ✅ Only inside forEach
      const [parentCollection, userId, sub, recordId] = path.split("/");

      const isCorrectType = parentCollection === type; // "Deposits" or "Withdrawals"
      const data = docSnap.data();
      const status = data.status?.toString();
      const isPending = !["true", "false"].includes(status);

      const shouldShow = (
        (statusFilter === "pending" && isPending) ||
        (statusFilter === status)
      );

      if (isCorrectType && shouldShow) {
        found = true;
        count++;

        container.appendChild(renderCard(userId, docSnap.id, data, type));
      }
    });

    if (!found) {
      container.innerHTML = `<p class="text-gray-500 text-sm">No ${statusFilter} ${type.toLowerCase()} found.</p>`;
    }

    // ✅ Update the tab count
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
function renderCard(userId, recordId, data, type) {
  const wrapper = document.createElement("div");
  wrapper.className = "p-4 bg-white border rounded shadow space-y-1";

  const isPending = !["true", "false"].includes(data.status?.toString());

  wrapper.innerHTML = `
    <p class="text-sm"><strong>User:</strong> ${userId}</p>
    <p><strong>Amount:</strong> $${data.amount}</p>
    <p><strong>Wallet:</strong> ${data.wallet || 'N/A'}</p>
    <p><strong>Method:</strong> ${data.method || 'Crypto'}</p>
    <p><strong>Date:</strong> ${data.timestamp?.toDate().toLocaleString() || 'Unknown'}</p>
    <p><strong>Status:</strong> ${data.status || 'pending'}</p>
    ${isPending ? `
      <div class="flex gap-2 mt-2">
        <button class="approveBtn bg-green-500 text-white px-2 py-1 rounded text-sm" data-user="${userId}" data-id="${recordId}" data-type="${type}">✅ Approve</button>
        <button class="declineBtn bg-red-500 text-white px-2 py-1 rounded text-sm" data-user="${userId}" data-id="${recordId}" data-type="${type}">❌ Decline</button>
      </div>` : ""
    }
  `;

  // Add listeners after render
  setTimeout(() => attachAdminActions(wrapper), 0);
  return wrapper;
}

// ✅ Button Actions
function attachAdminActions(container) {
  container.querySelectorAll(".approveBtn").forEach(btn => {
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
        const amount = Number(record.amount);
        if (isNaN(amount)) {
          alert("❌ Invalid amount");
          return;
        }

        // 2. Get current wallet balance
        const walletSnap = await getDoc(walletRef);
        const currentBalance = walletSnap.exists()
          ? Number(walletSnap.data().usd || 0)
          : 0;

        // ✅ If this is a deposit → add to balance
        // ✅ If this is a withdrawal → subtract from balance
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

        // 3. Update wallet and mark record as approved
        await updateDoc(walletRef, { usd: newBalance });
        await updateDoc(recordRef, { status: "true" });

        alert("✅ Approved and wallet updated");
        btn.closest(".sub-section")?.dispatchEvent(new Event("refresh"));
      } catch (err) {
        console.error("❌ Approval error:", err);
        alert("❌ Something went wrong during approval");
      }
    });
  });

  container.querySelectorAll(".declineBtn").forEach(btn => {
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
    document.getElementById(tabBtn).click(); // simulate refresh
  });
});

// ✅ Load Default Tab
document.getElementById("depositTabPending").click();
document.getElementById("tabUsers").addEventListener("click", () => {
  switchMainTab("users");
  loadUsers(); // 🔥 Load users when tab opens
});
window.addFunds = addFunds;

document.getElementById("closeChat").addEventListener("click", () => {
  if (unsubscribeChatListener) unsubscribeChatListener();
  document.getElementById("chatPopup").classList.add("hidden");
});



