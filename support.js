import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  doc,
  getDocs,
  limit,
  getDoc,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Selectors
const chatWindow = document.getElementById("chatMessages"); 
const chatInput = document.getElementById("chatInput"); 
const chatForm = document.getElementById("chatForm"); 
const chatSupportBtn = document.getElementById('chatSupportBtn'); 
const supportModal = document.getElementById('supportModal');
const closeSupportModal = document.getElementById('closeSupportModal');
const blockedopenSupportbtn = document.getElementById('openSupportBtn');

// Typing indicator
const typingIndicator = document.createElement("div");
typingIndicator.className = "typing-indicator";
typingIndicator.textContent = "Support is typing...";
typingIndicator.style.display = "none";
chatWindow.appendChild(typingIndicator);

let userId = null;
// ✅ Default fallback image if the user hasn't set one yet
let userProfilePic = "https://img.freepik.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_hybrid&w=740"; 

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  userId = user.uid;

  // ✅ Fetch user profile image from Firestore
  try {
    const userRef = doc(db, "Users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.image) {
        userProfilePic = userData.image; // Use the image from the Users collection[cite: 4]
      }
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }

  loadMessages();
});

function loadMessages() {
  const q = query(
    collection(db, "Support", userId, "messages"),
    orderBy("timestamp")
  );

  onSnapshot(q, (snapshot) => {
    chatWindow.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.className = `message ${msg.sender === "user" ? "user" : "bot"}`;

      const timestamp = msg.timestamp?.toDate?.();
      const timeString = timestamp
        ? new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }).format(timestamp)
        : "";

      // ✅ Use the dynamically fetched profile pic for the user
      const avatarURL =
        msg.sender === "user"
          ? userProfilePic 
          : "https://www.freeiconspng.com/uploads/displaying-14-images-for--customer-service-icon-png-23.png"; 

      div.innerHTML = `
        <div class="avatar">
          <img src="${avatarURL}" alt="avatar" />
        </div>
        <div class="message-content">
          <span>${msg.text}</span>
          <div class="timestamp">${timeString}</div>
        </div>
      `;

      chatWindow.appendChild(div);
    });

    chatWindow.appendChild(typingIndicator);
    scrollToBottom();
  });
}

chatForm.onsubmit = async (e) => {
  e.preventDefault(); 
  
  const text = chatInput.value.trim();
  if (!text || !userId) return;

  const messagesRef = collection(db, "Support", userId, "messages");
  const recentMessages = await getDocs(query(messagesRef, orderBy("timestamp", "desc"), limit(1)));

  let shouldAutoReply = true;

  if (!recentMessages.empty) {
    const lastMsg = recentMessages.docs[0].data();
    const lastSender = lastMsg.sender;
    const lastTimestamp = lastMsg.timestamp?.toDate?.();

    if (lastSender !== "user") {
      shouldAutoReply = false;
    } else if (lastTimestamp) {
      const now = new Date();
      const minutesAgo = (now - lastTimestamp) / 60000;
      if (minutesAgo < 5) {
        shouldAutoReply = false;
      }
    }
  }

  await addDoc(messagesRef, {
    sender: "user",
    text,
    timestamp: serverTimestamp()
  });

  chatInput.value = "";
  scrollToBottom();

  if (shouldAutoReply) {
    showTyping();
    setTimeout(async () => {
      await addDoc(messagesRef, {
        sender: "bot",
        text: "Thanks for reaching out. Our team will respond shortly.",
        timestamp: serverTimestamp()
      });
      hideTyping();
      scrollToBottom();
    }, 1500);
  }
};

function scrollToBottom() {
  setTimeout(() => {
    chatWindow.scrollTo({
      top: chatWindow.scrollHeight,
      behavior: "smooth"
    });
  }, 50);
}

function showTyping() {
  typingIndicator.style.display = "block";
  scrollToBottom();
}

function hideTyping() {
  typingIndicator.style.display = "none";
}

window.openSupport = () => {
  if (supportModal) {
    supportModal.style.display = 'flex';
    scrollToBottom();
  }
};

if (closeSupportModal) {
  closeSupportModal.onclick = () => {
    supportModal.style.display = 'none';
  };
}

if (chatSupportBtn) {
  chatSupportBtn.onclick = () => {
    window.openSupport();
  };
}

if (blockedopenSupportbtn) {
  blockedopenSupportbtn.onclick = () => {
    window.openSupport();
  };
}