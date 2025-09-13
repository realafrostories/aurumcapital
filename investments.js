import { getFirestore, collection, getDocs, onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { app } from './firebaseConfig.js'; // Adjust this if your Firebase config is in another file

const db = getFirestore(app);
const auth = getAuth();

onAuthStateChanged(auth, async user => {
  if (!user) return;

  const userInvestmentsRef = collection(db, `Investments/${user.uid}/records`);
  const snapshot = await getDocs(userInvestmentsRef);

  const investmentCards = document.getElementById("investmentCards");
  const noInvestments = document.getElementById("noInvestments");

  if (snapshot.empty) {
    noInvestments.classList.remove("hidden");
    investmentCards.innerHTML = '';
    return;
  }

  investmentCards.innerHTML = '';
  noInvestments.classList.add("hidden");

  snapshot.forEach(doc => {
    const data = doc.data();
    const card = document.createElement("div");
    card.className = "investment-card";

    const btc = parseFloat(data.btc || 0).toFixed(6);
    const usd = parseFloat(data.usdRate || 0).toLocaleString();

    card.innerHTML = `
      <div class="btc-amount">💰 ${btc} BTC</div>
      <div class="usd-rate">≈ $${usd}</div>
      <div class="timestamp">⏰ ${new Date(data.timestamp).toLocaleString()}</div>
    `;

    investmentCards.appendChild(card);
  });
});
