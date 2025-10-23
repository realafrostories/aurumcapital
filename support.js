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

const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const statusIndicator = document.getElementById("supportStatus");

// Typing indicator
const typingIndicator = document.createElement("div");
typingIndicator.className = "typing-indicator";
typingIndicator.textContent = "Support is typing...";
typingIndicator.style.display = "none";
chatWindow.appendChild(typingIndicator);

let userId = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  userId = user.uid;
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

      const avatarURL =
        msg.sender === "user"
          ? "https://img.freepik.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_hybrid&w=740" // generic user icon
          : "https://www.freeiconspng.com/uploads/displaying-14-images-for--customer-service-icon-png-23.png"; // admin/avatar icon

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

    // Re-append typing indicator
    chatWindow.appendChild(typingIndicator);
    scrollToBottom();
  });
}


sendBtn.onclick = async () => {
  const text = chatInput.value.trim();
  if (!text || !userId) return;

  const messagesRef = collection(db, "Support", userId, "messages");

  // Fetch the last message
  const recentMessages = await getDocs(query(messagesRef, orderBy("timestamp", "desc"), limit(1)));

  let shouldAutoReply = true;

  if (!recentMessages.empty) {
    const lastMsg = recentMessages.docs[0].data();
    const lastSender = lastMsg.sender;
    const lastTimestamp = lastMsg.timestamp?.toDate?.();

    if (lastSender !== "user") {
      // Last message was from admin or bot, don't show auto-reply
      shouldAutoReply = false;
    } else if (lastTimestamp) {
      const now = new Date();
      const minutesAgo = (now - lastTimestamp) / 60000;
      if (minutesAgo < 5) {
        shouldAutoReply = false;
      }
    }
  }

  // Save the user's message
  await addDoc(messagesRef, {
    sender: "user",
    text,
    timestamp: serverTimestamp()
  });

  chatInput.value = "";
  scrollToBottom();

  // Show typing + optional simulated bot reply
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


