import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
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
const auth = getAuth(app);
const db = getFirestore(app);

const scrollContainer = document.getElementById("leaderboardScroll");
scrollContainer.innerHTML += scrollContainer.innerHTML;

function loopScroll() {
  scrollContainer.scrollLeft += 1;
  if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
    scrollContainer.scrollLeft = 0;
  }
  requestAnimationFrame(loopScroll);


}
loopScroll();




// Sample simulation data
const eventSimulations = {
  ftx: {
    logs: [
      "📉 Detected FTX collapse — extreme volatility.",
      "🧠 Analyzing on-chain transactions...",
      "📊 Heavy outflows detected. Switching to defensive mode.",
      "💼 Entered short positions on SOL and FTT.",
      "✅ Exited with 18% profit in 3 days."
    ],
    stats: {
      risk: "High",
      profit: "+18%",
      duration: "3 days"
    }
  },
  bullrun: {
    logs: [
      "📈 BTC crossing $40k — bull momentum detected.",
      "📡 Monitoring whale wallets and sentiment signals...",
      "🧠 Entered strategic long positions.",
      "📍 Added ETH & BNB as confidence rose.",
      "✅ Realized 32% profit in 7 days."
    ],
    stats: {
      risk: "Medium",
      profit: "+32%",
      duration: "7 days"
    }
  },
  covid: {
    logs: [
      "⚠️ Market panic: COVID-19 crash incoming.",
      "🧠 Historical panic data model loaded.",
      "💹 Buy signal detected at 60% dip depth.",
      "🛒 Accumulated BTC + ETH at lows.",
      "✅ Rebounded with 27% profit in 14 days."
    ],
    stats: {
      risk: "Low",
      profit: "+27%",
      duration: "14 days"
    }
  },
luna: {
    logs: [
      "🧨 UST depegged detected.",
      "⚠️ Luna hyperinflation algorithm triggered.",
      "📉 Shorting LUNA with high volatility hedges...",
      "🧠 AI model predicts further devaluation.",
      "✅ Closed positions with +24% net gain in 48 hours."
    ],
    stats: {
      risk: "Very High",
      profit: "+24%",
      duration: "2 days"
    }
  },
  halving: {
    logs: [
      "🔍 Halving event detected. Block reward reduced.",
      "📈 BTC historical pattern shows post-halving rally.",
      "📊 AI strategy enters early accumulation phase.",
      "💼 Diversifying into LTC and BCH.",
      "✅ Position grew +40% in 3 weeks."
    ],
    stats: {
      risk: "Medium",
      profit: "+40%",
      duration: "21 days"
    }
  },
  ethmerge: {
    logs: [
      "🔧 Ethereum Merge detected — switch to Proof of Stake.",
      "📡 Observing validator behavior and gas patterns...",
      "🧠 AI predicts reduced sell pressure.",
      "📥 Entered ETH with high staking yield targets.",
      "✅ Realized +31% gain over 10 days."
    ],
    stats: {
      risk: "Low",
      profit: "+31%",
      duration: "10 days"
    }
  }
  
};

// Typing animation
function typeLog(logs, container, callback) {
  container.innerHTML = ""; // Clear
  let index = 0;

  const interval = setInterval(() => {
    if (index >= logs.length) {
      clearInterval(interval);
      if (callback) callback();
      return;
    }
    const p = document.createElement("p");
    p.textContent = logs[index];
    container.appendChild(p);
    container.scrollTop = container.scrollHeight;
    index++;
  }, 1000);
}

// Handle Event Click
document.querySelectorAll(".event-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const selected = btn.getAttribute("data-event");
    

    // UI state
    document.querySelectorAll(".event-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const logsBox = document.getElementById("aiLogs");
    const { logs, stats } = eventSimulations[selected];

    

    // Start typing logs
    typeLog(logs, logsBox);

    

    // Update stats
    document.getElementById("riskLevel").textContent = stats.risk;
    document.getElementById("profitResult").textContent = stats.profit;
    document.getElementById("duration").textContent = stats.duration;

    // Add animation trigger
const terminal = document.querySelector(".ai-terminal");
const statsBox = document.querySelector(".stats-box");

terminal.classList.add("ai-pulse");
statsBox.classList.add("ai-pulse");

setTimeout(() => {
  terminal.classList.remove("ai-pulse");
  statsBox.classList.remove("ai-pulse");
}, 500);

  });
});


onAuthStateChanged(auth, async (user) => {
  const btn = document.getElementById("heroActionBtn");
  const btnText = document.getElementById("heroButtonText");

  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");

  // New: avatar in header
  const navAvatarWrap = document.getElementById("navAvatarWrapper");
  const navUserAvatar = document.getElementById("navUserAvatar");
  const navVerifiedBadge = document.getElementById("navVerifiedBadge");

  if (user) {
  // HERO BUTTON UPDATE
  btnText.textContent = "Go to Your Dashboard ╰┈➤";
  btn.onclick = () => window.location.href = "dashboard.html";
  btn.style.background = "linear-gradient(135deg,rgba(230, 47, 31, 1),rgba(156, 32, 25, 1))";
  btn.style.boxShadow = "0 4px 14px rgba(101, 15, 15, 0.4)";

  // Firestore user info
  const userRef = doc(db, "Users", user.uid);
  const userSnap = await getDoc(userRef);

  let imageUrl = "";
  let isVerified = false;

  if (userSnap.exists()) {
    const data = userSnap.data();
    imageUrl = data.image || "";
    isVerified = data.verified === true;
  }

  // NAV HEADER AVATAR
  if (navAvatarWrap && navUserAvatar) {
    loginBtn.style.display = "none"; // hide login button
    navUserAvatar.src = imageUrl;
    navAvatarWrap.style.display = "inline-flex";
    navAvatarWrap.onclick = () => window.location.href = "dashboard.html";

    if (isVerified) {
      navVerifiedBadge.style.display = "flex";
      navVerifiedBadge.classList.add("animated");
    } else {
      navVerifiedBadge.style.display = "none";
    }
  }

  // ✅ REGISTER → LOGOUT
  if (registerBtn) {
    registerBtn.textContent = "Logout";
    registerBtn.href = "#";
    registerBtn.classList.remove("btn-filled");
    registerBtn.classList.add("btn-outline");
    registerBtn.onclick = async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.reload();
    };
  }
}
 else {
    // USER NOT LOGGED IN

    // Hero button
    btnText.textContent = "Get Started With Us Today";
    btn.onclick = () => window.location.href = "signup.html";
    btn.style.background = "linear-gradient(135deg, rgb(221, 176, 93), rgba(174, 138, 71, 1))";
    btn.style.boxShadow = "0 4px 14px rgba(255, 136, 0, 0.3)";

    // Header buttons
    if (loginBtn && registerBtn) {
      loginBtn.style.display = "inline-block";
      loginBtn.textContent = "Login";
      loginBtn.href = "signin.html";
      loginBtn.classList.remove("btn-filled");
      loginBtn.classList.add("btn-outline");

      registerBtn.textContent = "Get Started With Us Today";
      registerBtn.href = "signup.html";
      registerBtn.classList.remove("btn-outline");
      registerBtn.classList.add("btn-filled");
      registerBtn.onclick = null;
    }

  }
});








async function loadCryptoRates() {
  const rateContainer = document.getElementById("cryptoRates");
  const symbols = ["BTC", "ETH", "USDT", "BNB", "LTC"];

  try {
    const res = await fetch("https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,USDT,LTC,BNB&tsyms=USD");
    const data = await res.json();

    rateContainer.innerHTML = "";

    symbols.forEach(symbol => {
      const price = data[symbol]?.USD;
      if (price) {
        const item = document.createElement("div");
        item.className = "rate-item";

        const icon = document.createElement("img");
        icon.src = `https://cryptoicon-api.pages.dev/api/icon/${symbol.toLowerCase()}`;
        icon.alt = symbol;
        icon.className = "coin-icon";

        const name = document.createElement("span");
        name.textContent = `${symbol}: `;

        const priceSpan = document.createElement("span");
        priceSpan.className = "price";
        priceSpan.textContent = `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        item.appendChild(icon);
        item.appendChild(name);
        item.appendChild(priceSpan);
        rateContainer.appendChild(item);
      }
    });

  } catch (err) {
    console.error("Crypto rate fetch error:", err);
    rateContainer.innerHTML = `<div style="color:gray; font-size:14px;">⚠️ Failed to load crypto prices</div>`;
  }
}

loadCryptoRates();






// === 📈 TradingView BTC Chart Embed ===
new TradingView.widget({
  container_id: "tradingview_btc",
  width: "100%",
  height: 500,
  symbol: "COINBASE:BTCUSD",
  interval: "60",
  timezone: "Etc/UTC",
  theme: "dark",
  style: "1",
  locale: "en",
  toolbar_bg: "#1f2029",
  enable_publishing: false,
  hide_top_toolbar: true,
  save_image: false,
  studies: ["MACD@tv-basicstudies", "RSI@tv-basicstudies"],
  show_popup_button: false,
  withdateranges: true,
  details: false
});


document.querySelector(".btn.primary").addEventListener("click", () => {
  window.scrollTo({
    top: window.innerHeight,
    behavior: "smooth"
  });
});

// 🔁 Show floating crypto icons on scroll
function revealFloatingIcons() {
  const section = document.querySelector('.hero');
  const icons = document.querySelector('.floating-icons');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        icons.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });

  observer.observe(section);
}

revealFloatingIcons();


// 🌌 Simple Particle Glow Effect
const canvas = document.querySelector('.hero-particles');
const ctx = canvas.getContext('2d');
let particles = [];

function initParticles() {
  const count = 60;
  const w = canvas.width = window.innerWidth;
  const h = canvas.height = document.querySelector('.hero').offsetHeight;

  particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.8 + 0.5,
    dx: (Math.random() - 0.5) * 0.3,
    dy: (Math.random() - 0.5) * 0.3,
    opacity: Math.random() * 0.4 + 0.1
  }));
}

function drawParticles() {
  const w = canvas.width = window.innerWidth;
  const h = canvas.height = document.querySelector('.hero').offsetHeight;
  ctx.clearRect(0, 0, w, h);

  for (let p of particles) {
    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > w) p.dx *= -1;
    if (p.y < 0 || p.y > h) p.dy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 224, 224, ${p.opacity})`;
    ctx.fill();
  }

  requestAnimationFrame(drawParticles);
}

window.addEventListener("resize", initParticles);
initParticles();
drawParticles();



const canvas2 = document.getElementById("matrixCanvas");
const ctx2 = canvas2.getContext("2d");

canvas2.width = window.innerWidth;
canvas2.height = document.getElementById("aiTimeMachine").offsetHeight;

let binaryChars = "010101001110100101".split("");
let fontSize = 14;
let columns = canvas2.width / fontSize;
let drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
  // Fade the canvas slightly
  ctx2.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx2.fillRect(0, 0, canvas2.width, canvas2.height);

  // Green binary text
  ctx2.fillStyle = "#00ffcc";
  ctx2.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    let char = binaryChars[Math.floor(Math.random() * binaryChars.length)];
    ctx2.fillText(char, i * fontSize, drops[i] * fontSize);

    // Reset drop
    if (drops[i] * fontSize > canvas2.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }
}

setInterval(drawMatrix, 33);

// Resize responsiveness
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = document.getElementById("aiTimeMachine").offsetHeight;
  columns = canvas.width / fontSize;
  drops = Array(Math.floor(columns)).fill(1);
});


