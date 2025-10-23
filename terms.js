document.querySelectorAll('.toc a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.toc a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    const target = document.querySelector(link.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const translations = {
  en: {
    title: "Terms of Use",
    effectiveDate: "Effective from July 2025",
    sections: [
      {
        id: "overview",
        heading: "1. Overview",
        content: `These Terms of Use govern your access to and use of AurumCaptial, including our AI-powered crypto trading features.`
      },
      {
        id: "eligibility",
        heading: "2. Eligibility",
        content: `To use AurumCaptial, you must be 18 or older and comply with local financial regulations.`
      },
      {
        id: "account",
        heading: "3. Account Responsibilities",
        content: `You are responsible for keeping your account secure. Do not share your credentials.`
      },
      {
        id: "ai-trading",
        heading: "4. AI-Powered Trading",
        content: `AurumCaptial executes trades on your behalf using real-time data, strategies from expert traders, and proprietary AI models.`
      },
      {
        id: "risks",
        heading: "5. Risk Disclaimer",
        content: `Crypto trading involves risk. You acknowledge that past performance is not indicative of future results.`
      },
      {
        id: "privacy",
        heading: "6. Data Privacy",
        content: `We collect only necessary data and secure it with AES-256 encryption and blockchain-level audit logs.`
      },
      {
        id: "termination",
        heading: "7. Termination",
        content: `AurumCaptial reserves the right to suspend or terminate accounts that violate our policies or are flagged for suspicious activity.`
      },
      {
        id: "dispute",
        heading: "8. Dispute Resolution",
        content: `All disputes will be handled under Lagos State jurisdiction, using confidential mediation before court actions.`
      },
      {
        id: "modifications",
        heading: "9. Changes to Terms",
        content: `We may modify these terms with notice. Continued use implies acceptance of any updated terms.`
      },
      {
        id: "contact",
        heading: "10. Contact",
        content: `Have questions? Reach out at support@AurumCapital.com.`
      }
    ]
  },

  fr: {
    title: "Conditions d'utilisation",
    effectiveDate: "En vigueur à partir de juillet 2025",
    sections: [
      {
        id: "overview",
        heading: "1. Vue d'ensemble",
        content: `Ces conditions régissent votre utilisation de AurumCaptial, y compris ses fonctionnalités de trading crypto alimentées par l'IA.`
      },
      {
        id: "eligibility",
        heading: "2. Admissibilité",
        content: `Pour utiliser AurumCaptial, vous devez avoir 18 ans ou plus et respecter les lois locales.`
      },
      {
        id: "account",
        heading: "3. Responsabilités du compte",
        content: `Vous êtes responsable de la sécurité de votre compte. Ne partagez pas vos identifiants.`
      },
      {
        id: "ai-trading",
        heading: "4. Trading IA",
        content: `AurumCaptial effectue des transactions en votre nom à l’aide de données en temps réel et de modèles IA propriétaires.`
      },
      {
        id: "risks",
        heading: "5. Avertissement sur les risques",
        content: `Le trading crypto comporte des risques. Les performances passées ne garantissent pas les résultats futurs.`
      },
      {
        id: "privacy",
        heading: "6. Confidentialité",
        content: `Nous collectons uniquement les données nécessaires et les protégeons par cryptage AES-256.`
      },
      {
        id: "termination",
        heading: "7. Résiliation",
        content: `AurumCaptial peut suspendre ou résilier tout compte enfreignant ses règles ou suspecté d’activité frauduleuse.`
      },
      {
        id: "dispute",
        heading: "8. Résolution des litiges",
        content: `Tout litige sera traité dans le cadre de la juridiction de l'État de Lagos.`
      },
      {
        id: "modifications",
        heading: "9. Modifications",
        content: `Nous pouvons modifier ces conditions. La poursuite de l'utilisation implique votre acceptation.`
      },
      {
        id: "contact",
        heading: "10. Contact",
        content: `Des questions ? Écrivez-nous à support@AurumCaptial.com.`
      }
    ]
  }
};


// Load default language
let currentLang = "en";

function renderTerms(lang = "en") {
  const data = translations[lang];
  document.getElementById("termsTitle").textContent = data.title;
  document.getElementById("effectiveDate").textContent = data.effectiveDate;

  const list = document.getElementById("termsContent");
  list.innerHTML = "";

  data.sections.forEach(section => {
    const div = document.createElement("section");
    div.innerHTML = `
      <h2 id="${section.id}">${section.heading}</h2>
      <p>${section.content}</p>
    `;
    list.appendChild(div);
  });

  const toc = document.getElementById("tocList");
  toc.innerHTML = "";
  data.sections.forEach(sec => {
    toc.innerHTML += `<li><a href="#${sec.id}">${sec.heading}</a></li>`;
  });
}

document.getElementById("langSelect").addEventListener("change", (e) => {
  currentLang = e.target.value;
  renderTerms(currentLang);
});

renderTerms(currentLang);
