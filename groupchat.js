const messagesContainer = document.getElementById("chatMessages");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const onlineCount = document.getElementById("onlineCount");

const usernames = ["CryptoQueen","BTC_Bro","Kofi_Investor","ZeeLambo","AltcoinSis"];
const fakeMessages = [
  "BTC is mooning again! 🚀","Mehn I dey fear ETH movement","Jambo! Hakuna matata.","Quelqu’un ici parle français?"
];

// Preload N messages (change count for thousands)
function preloadMessages(total) {
  for (let i = 0; i < total; i++) {
    const user = usernames[Math.floor(Math.random() * usernames.length)];
    addBotMessage(fakeMessages[Math.floor(Math.random() * fakeMessages.length)], user);
  }
}

// Add message bubble
const chatSound = document.getElementById("chatSound");

// Add chat bubble
function addMessage(text, username = "You", self = false) {
  const msg = document.createElement("div");
  msg.className = `message ${self ? "self" : "bot"} w${1 + Math.floor(Math.random() * 4)}`;
  msg.innerHTML = `<strong>${username}:</strong> ${text}
    <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
  messagesContainer.appendChild(msg);

  // Play sound
  chatSound.currentTime = 0;
  chatSound.play().catch(() => {}); // prevent autoplay issues

  // Scroll down to latest message
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


// Bot vs Preload
function addBotMessage(text, user){
  const msg = document.createElement("div");
  msg.className = `message bot w${1+Math.floor(Math.random()*4)}`;
  msg.innerHTML = `<strong>${user}:</strong> ${text}
    <span>${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>`;
  messagesContainer.appendChild(msg);
}

// Initialize with thousands of messages
preloadMessages(200);

// Simulate live bots
function simulateBotChat(){
  const delay = Math.random()*8000 + 2000;
  setTimeout(()=>{
    addBotMessage(
      fakeMessages[Math.floor(Math.random()*fakeMessages.length)],
      usernames[Math.floor(Math.random()*usernames.length)]
    );
    simulateBotChat();
  }, delay);
}
simulateBotChat();

// Online count animation
let peopleOnline = 800;
setInterval(()=>{
  peopleOnline += Math.floor(Math.random()*20 - 10);
  peopleOnline = Math.max(500, Math.min(1555, peopleOnline));
  onlineCount.textContent = peopleOnline;
}, 4000);

// User sending
sendBtn.onclick = () => {
  const msg = input.value.trim();
  if (!msg) return;
  addMessage(msg, "You", true);
  input.value = "";
  input.style.height = "auto";
};

input.addEventListener("input", ()=>{
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 100) + "px";
});

function sendMessage() {
  const input = document.getElementById("chatInput");
  const messageText = input.value.trim();
  if (!messageText) return;

  const msgBox = document.createElement("div");
  msgBox.classList.add("message", "user");
  msgBox.innerText = messageText;

  const messagesContainer = document.getElementById("messages");
  messagesContainer.appendChild(msgBox);

  input.value = "";
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
