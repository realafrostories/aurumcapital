const enterBtn = document.getElementById('enterChatRoomBtn');
const modal = document.getElementById('chatRoomModal');
const closeBtn = document.getElementById('closeChatRoom');
const chatBody = document.getElementById('chatBody');
const userInputForm = document.getElementById('userInputForm');
const userMessageInput = document.getElementById('userMessage');
const scrollBtn = document.getElementById('scrollToBottomBtn');

// Simulated users (100+)
const users = [
  "CryptoQueen23", "BTC_Bro", "LamboLover", "NairaWhale", "AltcoinSis",
  "Trader_Tobi", "SatoshiKen", "HODL_God", "NiftyNana", "ChainChukwudi",
  "VitalikVibes", "PumpNDumpDan", "ShibaMama", "JollofForBTC", "Web3Witch",
  "AnnieTheMiner", "RugpullRon", "BearishBruno", "KenyaCrypto", "DEXDiva",
  "ETH_Guru", "BinanceBaba", "Zaddy4ZK", "SangoStaker", "LunaLass",
  "TokunboToken", "GasFeeGoon", "NFTMami", "MemeCoinMoses", "Layer2Lilian",
  "TetherTimmy", "Naira2Sats", "FlipItFast", "DefiDaisy", "LitecoinLeo",
  "TrendyTrader", "KofiCrypto", "CryptoQueen23", "BTC_Bro", "KofiInvestor", "ZeeLambo", "AltcoinSis",
  "LunaRider", "HODL_Ninja", "BitBoss99", "SatoshiGirl", "TokenPapa",
  "VitalikVibes", "DefiWizard", "AdaMama", "MrEthereum", "BlockBaba",
  "NFTNoob", "Layer2Lord", "WakaSatoshi", "ETH_Explorer", "RealSatoshi",
  "NairaCrypto", "DegenDave", "StakingSteph", "MoonManiac", "BinanceBelle",
  "ElonFanboy", "WAGMIMama", "FlipCoinFrank", "GasFeeGeorge", "PumpSultan",
  "BitFiBeast", "AltumFiFaithful", "HODLina", "CryptoCheetah", "MinaMillionaire",
  "TokenTiger", "ChainChaser", "MemeLover69", "YieldYemi", "SatoChan",
  "JamboInvestor", "P2PGirl", "BearishBoy", "ToTheMoonTina", "BobbyBlockchain",
  "KenyaKoin", "TrendyTrader", "SashaSat", "ElSalvadorianHODL", "WhaleWatchr",
  "SouthAfricaNode", "PakistaniPumper", "ETHindia", "FrenchFOMO", "ItalianMiner",
  "BrasilBit", "TokenTunde", "BitcoinBenji", "ArabETHKing", "BitfiBoy",
  "SierraSats", "GamerGains", "StakeNChill", "Satoshika", "KawaiiKrypto",
  "InvestorIvan", "MexiCrypto", "ZARminer", "BlockchainBao", "KuwaitiKrypto",
  "ArbitrumAndy", "AnnaAltcoin", "PolkadotPapi", "SolanaSimi", "NigerianNode",
  "ETHbrother", "LiteLisa", "RwandanRider", "DappDanny", "ArbitrumQueen",
  "ChadCrypto", "XRP_Xena", "USDTToni", "Zilliqian", "InvestirMarie",
  "StakeorDie", "DeFiLover", "MoonMissionZ", "BTCShaman", "ETHBossGirl",
  "PolygonPrince", "AvalancheAce", "ZKrollZach", "Web3Woody", "NFTPrince",
  "CryptoCasper", "BantuBit", "USDTQueen", "WAGMI_Kevin", "ShibaSavage",
  "BinanceBaby", "EarnestETH", "TonyaToken", "ZambianZilla", "CryptoNaeNae",
  "AirdropAddict", "SolShark", "MrStablecoin", "HODLKen", "CardanoCruze",
  "StellaStacks", "MetaMama", "TraderTobi", "PunkPapa", "ByteBillionaire",
  "CoinTariq", "LuckyLiquidity", "MrDAO", "KChainQueen", "YieldJo",
  "FiatToFreedom", "SatQueen", "InvestoPeter", "Blockgirl", "BSC_Witch",
  "EastSideETH", "SmartJohn", "AltumFiAngela", "BullRunRavi", "MekkaMiner",
  "CryptoUduak", "FlashFlipz", "MrAirdrop", "AlgoAngel", "WhaleMoni",
  "CryptoLover88", "MrsWeb3", "SatoshikaChan", "ETH2Earn", "BlockFaith",
  "ZimbabweZilli", "BCHBre", "TokenTash", "GweiManiac", "ETHNiko",
  "AltumWanderer", "DefiAddy", "BaliBitcoin", "Shibamom", "TanzaniaTrader",
  "BangladeshBTC", "RealFiRegi", "NodeNina", "P2PPolly", "XchangeXavi",
  "HODLChika", "BerlinBSC", "MaliMinr", "CoinKaze", "JordiJpegs",
  "ETHKnight", "BitWendy", "CryptoChioma", "PolygonPeter", "CashoutQueen",
  "GhanaGas", "SolanaManuel", "AltManSam", "AltcoinKarla", "AIInvestor",
  "ETHlectra", "DefiDan", "StakingSurge", "BitDoctor", "KYC_Kat",
  "AltumAkpan", "HashRateRita", "MoonMpho", "YieldFarmerJay", "DogecoinDiva",
  "BearHunter", "NanoNinja", "ChainGal", "TrezorTony", "CryptoBlessed",
  "DeFiBaby", "MrGasFees", "SatoChukwu", "ETHena", "Web3Kulture",
  "MaliMoney", "RealDeFiDon", "NFTMina", "Elon2TheMoon", "SafeMoonMama",
  "HashPrincess", "CryptoDayo", "AltcoinAsh", "BitKenny", "ZainabZK",
  "AdaExplorer", "MetaverseMike", "AltumFiGuru", "BlockTina", "StableSheikh",
  "ChainLinkers", "Satoshy", "GweiGuru", "CryptoYaw", "AltumMariama",
  "LFGLeila", "SmartCynthia", "HODLRay", "DAOChaser", "BitNani",
  "JapaCrypto", "ZKZack", "NodeNomad", "AltumFiRaheem", "CryptoCynthia",
  "ETHphoria", "ChainKarabo", "BullNess", "SatoshiZahra", "GweiSam",
  "FiatSlayer", "KenETH", "ShibaMilly", "TokenTamar", "Web3Ken",
   "ColdWalletCaro", "ZuzorZcash", "HODLHerbert",
  "BigBagBimbo", "BuyDipBayo", "ShillShadrack", "AltSeasonAda", "BullsAndJollof",
  "ElonSzn", "BscBouncer", "KenCrypto", "ProfitPaul", "ScamSnifferSue",
  "BreakoutBetty", "ETHWiz", "LedgerLarry", "SolanaSola", "XRP_Xavier",
  "GaslessGrace", "TokenTracy", "DipNBuyDada", "StakingSteph", "ChartingChuka",
  "ElrondEmma", "MrMetamask", "ZKproofZainab", "RavencoinRalph", "PumpPrincess",
  "ChainlinkChika", "WakaWallet", "CryptoAjebutter", "DeFiNerd123", "MoonMissionMo",
  "JoeHODL", "BuyTheDip", "TrustlessTina", "BitKingJosh", "BullishBanke",
  "MetaMaxMike", "CryptoCynthia", "BantuBlocks", "Code2Coin", "NoSleep4Sats",
  "SniperSamuel", "JamboCoinBoy", "EthBackedEmeka", "TradingTolu", "XLM_Xena",
  "MaticMama", "DipHunterDare", "GhanaGains", "NairaNode", "AirdropQueen",
  "RoiRuth", "ElonHater77", "DAO_Debby", "TechieTony", "BitcoinBolu",
  "FakePumpFred", "EVM_Edward", "HarmonyHauwa", "NextGenNgozi", "FlokiFan",
  "RuglessRichie", "CryptoCallie", "SafeMoonSara", "BitBabe999", "MoonBoyMusa",
  "P2PEzekiel", "TxSniper", "SatoshiLover", "BTC_Goat", "FarmFiFelicia",
  "GasGuyGreg", "ChainThug", "MyWalletMyWay", "DegenDebola", "Local2Global",
  "AlphaAda", "PolygonPrecious", "WhaleWhisperer", "AltKingZion", "MetaverseMuna",
  "SnipeAndStake", "LamboLanre", "CryptoChefChi", "PampKingsley", "Crypto_Kalifa",
  "HODL4Her", "VyperVictor", "StuckOnSol", "RoninReuben", "AnkrAda",
  "DEXFlex", "MoonPhasePeter", "NFA_Nkechi", "LedgerLois", "ChopLifeWithBTC",
  "MiningMiriam", "Satoshi_Bride", "ETH2Dmoon", "PancakePapa", "AirDropDami",
  "DeBankQueen", "MrFlipIt", "WalletWarlord", "BantuBridget", "NotAScammer",
  "RugRepellent", "TokenTycoon", "OldButCrypto", "BitcoinBenji", "WenLambo",
  "Naira2Nodes", "UniswapUncle", "AltLoverLola", "ICOIsaac", "StakerStan",
  "GweiGuy", "ForkedFred", "SatsMami", "MEVMary", "GenesisGrace",
  "ERCPrincess", "DipDipHooray", "WrappedWasiu", "CoinCraver", "SolSniper",
  "DefiDjSeyi", "LazyLiquidity", "StakeBae", "CryptoCruz", "Binance_Boy",
  "SmartContractKing", "MintedMike", "NFTNkechi", "MaxGasMusa", "ColdStorageKen",
  "HODL_Hauwa", "ZikToken", "OnChainOrNothing", "Rising_Rahman", "LayerZeroLeke",
  "LamboLily", "FlokiFlirt", "ShibaSade", "DigitalDanfo", "DeFiDriver",
  "BitDiva123", "Web3WizardWasiu", "FastTxFelix", "ZeroX_Zach", "MoonMartins",
  "AirdropDaddy", "APEAbiola", "ProofOfLove", "XChangeChinedu", "ZilliqaZee",
  "MetamaskMami", "MrBlockchain", "EthQueenB", "ElonForPresident", "PumpAsap",
  "ChainCassandra", "TokenTolu", "BuyLowBaba", "MemeCoinMogul", "WalletWatcher",
  "TradeTactician", "CoinInChief", "NotFinancialAdvice", "SatsMachine", "Web3Zealot"
];

for (let i = 1; i <= 110; i++) {
  users.push(`User${i}`);
}

// AI bot names
const aiBots = ["CryptoQueenZA", "BitNinja", "SatoshiVibes", "Elena_Tech", "TraderAhmed",
  "KofiInvests", "MayaHodl", "BTC_Babu", "XxCryptoWolfxX", "InuSensei",
  "JuanDeCrypto", "InvestGuru91", "SlyHODLer", "Lambo_Mama", "HassanTheBull",
  "DiamondHands79", "Zanele_Miner", "BlockChainMaestro", "ETH_Empress", "KenjiCrypto",
  "Tola_SmartChain", "RealCryptoKing", "CryptoOla", "AnyaNFT", "DeFi_Reina",
  "ViktorSatoshi", "LucasBTC", "ETH_Moses", "CryptoRina", "ZhaoTrades",
  "IvanHODL", "DeFiRider", "HodlItDown", "Maria_Solana", "TokioSatoshi",
  "CryptoMbappe", "AltcoinYemi", "BlockchainBozza", "BTC_Carla", "ShibaSensei",
  "KennaCoin", "HODL_Nikita", "BTC_Rashid", "CryptoBae88", "MadameCoin",
  "VinCrypto", "Jambo_Satoshi", "DeFiZuri", "FatimaTrades", "CryptoVikash",
  "XxBlockLoverxX", "MinaMetaverse", "SolBaba", "CryptoMech", "MayaMines",
  "TundeTrader", "VitalikStan", "WaleDeFi", "Crypto_Tariq", "AdaLover",
  "MoonSasha", "NaijaSatoshi", "Jose_Crypto", "HODL_Kunle", "ElonETH",
  "CryptoChin", "SatoshiMama", "AbbyOnChain", "DeFiTasha", "AltcoinPapa",
  "KrypticNana", "ETHFanboy", "MoonJamal", "CryptoSneaker", "ShibaTico",
  "SadeTokens", "LuisaBTC", "AkiraInvest", "Crypto_Geeta", "NFT_Marco",
  "TokenLover33", "ObiOfChain", "SolanaMama", "BTC_Manel", "CryptoBabushka",
  "MetaverseMax", "YoshiHodls", "BTC_Aruna", "Satoshi_Malik", "HodlNene",
  "Mira_Altcoins", "UcheToken", "BlockJuan", "DeFi_Amaka", "CoinSensei",
  "Crypto_Eva", "NFT_Gbolahan", "HODL_Moh", "AltcoinLana", "TokenJay",
  "NoorChain", "BTC_Sylvain", "YemiTokens", "Luno_Lu", "ETH_Swati",
  "Crypto_Nora", "TariqOnChain", "ZaraCrypto", "HODL_Hemant", "CryptoLuyolo",
  "IshCrypto", "BabaOfBlock", "Solana_Bella", "BTC_Jaime", "JuanitaTokens",
  "ETH_Sizwe", "Crypto_Nada", "TokenSibusiso", "MayaDeFi", "ArjunCrypto",
  "KaroCoin", "NFT_Thandi", "DeFiAbel", "ShibaFavour", "YusufToken",
  "ETH_Mumbi", "RaviTokens", "BTC_Nontokozo", "CryptoNita", "OmarChain",
  "BTC_Saeed", "NFT_Nandita", "TokenJules", "HODL_Keisha", "CryptoWei",
  "AliyaCoin", "CryptoDineo", "TokenBongani", "BTC_Yasmine", "ETH_Luca",
  "BayoCrypto", "CryptoLian", "TokenKudzai", "Satoshi_Sarah", "Crypto_Nico",
  "BTC_Riko", "MimiTokens", "HODL_Gaston", "KwakuBTC", "Crypto_Lerato",
  "Satoshi_Marwan", "GabeCrypto", "MariaDeFi", "NFT_Naima", "TokenBongiwe",
  "LunaLad", "KenCrypto", "Rashida_HODL", "DeFiSergio", "CryptoZahara",
  "TokensByTom", "ETH_Jabari", "CryptoVusi", "HODL_Jenn", "ZainabBTC",
  "ElonMooner", "BTC_NanaAma", "AltcoinShaz", "CryptoBisi", "Satoshi_Arman",
  "Juan_CryptoX", "KhalidOnChain", "Crypto_Kenya", "SolanaBooster", "TokenKim",
  "Chain_Jamila", "Lily_Satoshi", "Shiba_Javi", "ETH_Thuli", "Crypto_Aarav",
  "DeFiMpho", "MaduCrypto", "TokenLolo", "HODL_Elham", "TokenThabang",
  "CryptoInes", "BlockRakesh", "TokenWasiu", "HODL_Zanele", "CryptoPaco",
  "ShibaBuhle", "CoinRita", "AltcoinDani", "BTC_Thabo", "CryptoJian",
  "DeFiAdwoa", "TokenPrecious", "BlockMohan", "BTC_Keletso", "SolanaSiba",
  "TokenMina", "CryptoBabatunde", "NFT_Obakeng", "OnChainAma", "BTC_Zen"];

// Conversation memory (last 20 messages)
let conversationMemory = [];

// Color assignment for usernames
const userColors = {};
function getColorForUser(name) {
  if (!userColors[name]) {
    // Generate pastel color for readability
    const hue = Math.floor(Math.random() * 360);
    userColors[name] = `hsl(${hue}, 70%, 60%)`;
  }
  return userColors[name];
}

// Append message with timestamp and colors
function appendMessage(username, message, isBot = false) {
  const div = document.createElement('div');
  div.classList.add('chat-message');
  div.style.color = getColorForUser(username);
  div.innerHTML = `
    <span class="username">${username}</span>: ${message} 
    <span class="timestamp">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
  `;
  if (isBot) {
    div.style.fontStyle = 'italic';
    div.style.color = getColorForUser(username); // bots get own color too
  }
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;

  conversationMemory.push({ username, message, isBot });
  if (conversationMemory.length > 20) conversationMemory.shift();

  sessionStorage.setItem('chatHistory', JSON.stringify(conversationMemory));
}

// Typing indicator
function showTypingIndicator(botName) {
  if (document.getElementById('typingIndicator')) return; // only one indicator
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('typing-indicator');
  typingDiv.id = 'typingIndicator';
  typingDiv.style.color = getColorForUser(botName);
  typingDiv.textContent = `${botName} is typing...`;
  chatBody.appendChild(typingDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function hideTypingIndicator() {
  const typingDiv = document.getElementById('typingIndicator');
  if (typingDiv) typingDiv.remove();
}

// AI replies with variations and emojis
const aiReplies = {
  bitcoin: [
    "Bitcoin's volatility is wild, isn't it?",
    "BTC just hit new highs — the bulls are awake!",
    "Bitcoin remains king of crypto!",
    "People thought Bitcoin was done, but it’s just getting started.",
    "Bitcoin’s strength during uncertain times is unreal.",
    "Every dip in BTC feels like a second chance.",
    "The next halving might be explosive for Bitcoin!",
    "Bitcoin has survived every storm — that's resilience.",
    "If Bitcoin breaks $100k, it's going to change everything.",
    "Watching BTC candles move feels like a thriller movie 😅",
    "Bitcoin is the gateway drug into crypto for many of us 😂",
    "My portfolio lives and dies with Bitcoin’s mood.",
    "Just imagine buying Bitcoin at $100 again... dreams.",
    "BTC is volatile but so is life — at least this one pays back.",
    "Bitcoin is more than an asset, it’s a revolution."
  ],

  ethereum: [
    "Ethereum's upgrades keep pushing the limits!",
    "ETH gas fees dropped — finally, some breathing room.",
    "Ethereum’s smart contracts changed everything.",
    "ETH 2.0 rollout was a game changer.",
    "With Ethereum, the future of Web3 feels real.",
    "I love how dev-friendly Ethereum has become.",
    "ETH is what Bitcoin was 5 years ago — undervalued.",
    "Staking ETH feels like saving with benefits.",
    "Ethereum NFTs started a whole new era.",
    "Can we just appreciate how Ethereum powers most of DeFi?",
    "ETH is still my long-term pick for real-world utility.",
    "Vitalik is basically our generation’s digital Satoshi.",
    "ETH is the engine of the decentralized internet.",
    "Ethereum gas spikes are annoying, but it’s worth it.",
    "If ETH flips BTC, I won’t be surprised one bit."
  ],

  layer2: [
    "Layer 2 scaling makes crypto finally usable daily.",
    "ZK-rollups are wild tech — so much potential!",
    "Polygon, Arbitrum, Optimism — Layer 2 wars are heating up!",
    "Cheap and fast. That’s what Layer 2 promises.",
    "The best tech is invisible — like Layer 2 making everything smoother.",
    "We need Layer 2 more than ever with network congestion.",
    "Layer 2 is where real UX meets blockchain.",
    "I’d rather pay 5 cents than $50 in gas fees — thank you Layer 2!",
    "Without Layer 2, DeFi wouldn’t be sustainable.",
    "Ethereum + Layer 2 = match made in heaven.",
    "Don’t sleep on Layer 2 tokens, they’re heating up!",
    "Layer 2 adoption is like broadband to dial-up.",
    "Using Layer 2 feels like the first time I used Wi-Fi.",
    "Speed, scalability, savings — all thanks to Layer 2.",
    "I send all my transfers through Arbitrum now. Crazy cheap."
  ],

  defi: [
    "DeFi is giving power back to the people.",
    "No bank would ever give me 10% APY. DeFi did.",
    "DeFi is dangerous — but in the best way possible.",
    "There’s nothing like earning yield while sleeping.",
    "Uniswap made me feel like a Wall Street whale.",
    "The transparency in DeFi is what TradFi lacks.",
    "From rug pulls to riches — DeFi is wild.",
    "Smart contracts don’t lie. That’s why I trust DeFi.",
    "Yield farming is digital farming for real.",
    "DeFi education should be taught in schools.",
    "I’d rather risk DeFi than trust another centralized exchange.",
    "The composability of DeFi protocols is mind-blowing.",
    "DAOs, DeFi, decentralization — this is the future.",
    "I made more in DeFi than 5 years of banking.",
    "DeFi still feels like the Wild West — and I love it."
  ],

  whale: [
    "Whales make waves. Stay alert.",
    "I swear whales wait for me to buy before dumping 😂",
    "Whale alerts should be a stress trigger app.",
    "When a whale moves, you better have a seatbelt on.",
    "Whales shaking the tree so they can scoop up more.",
    "I track wallet activity like I’m the crypto FBI.",
    "The whale wallets are the real puppet masters.",
    "Big green candle? Probably a bored whale.",
    "Whales sell fear and buy greed. Cold blooded.",
    "Market dumps? Blame the invisible whales.",
    "Every time I see 10k BTC moved, my heart drops.",
    "Whale games are brutal — but retail holds the line.",
    "Whales swim, but shrimp multiply.",
    "A whale sells. Twitter panics. Rinse and repeat.",
    "Sometimes the whales are just testing our conviction."
  ],

  defaultReplies: [
    "Crypto’s a rollercoaster, but the highs are worth it.",
    "HODL is not just a meme — it’s survival.",
    "Keep your seed phrase safe. Seriously.",
    "AltumFi gives me hope — not just hype.",
    "Regret not buying earlier? Just don’t sell now.",
    "Bear markets build character — and portfolios.",
    "The future of finance is permissionless.",
    "Don’t chase pumps, chase fundamentals.",
    "Metaverse, NFTs, DeFi — we’re just getting started.",
    "Crypto taught me more than any economics class.",
    "FOMO is real, but patience pays.",
    "If you panic sell, someone smarter is buying.",
    "Digital ownership is freedom.",
    "The best time to research was yesterday. The next best is now.",
    "Every token tells a story. Learn it before you buy it.",
    "You don’t need to be rich to start, just curious.",
    "Crypto is more than money — it’s culture.",
    "There’s always another chance. Don’t chase every moon.",
    "Staying calm in red candles is a superpower.",
    "The real flex is surviving three market cycles.",
    "Crypto isn’t dying — it’s evolving.",
    "DCA is boring, but it wins long-term.",
    "Trust is earned — AltumFi is earning it.",
    "Real wealth in crypto isn’t fast, it’s disciplined.",
    "Don’t let Twitter trades ruin your strategy.",
    "Your journey is yours. Learn, build, believe.",
    "Crypto never sleeps — but you should.",
    "Every market cycle has winners and whiners.",
    "Screenshots of gains aren’t strategies.",
    "AltumFi just makes crypto easier to love."
  ]
};


const emotionalPhrases = ["🔥", "🚀", "😅", "💪", "😍", "🎢", "🎰", "🌅"];

function getRandomEmoji() {
  return emotionalPhrases[Math.floor(Math.random() * emotionalPhrases.length)];
}

function generateAIReply(lastUserMsg) {
  if (!lastUserMsg) {
    const def = aiReplies.defaultReplies;
    return def[Math.floor(Math.random() * def.length)] + ' ' + getRandomEmoji();
  }

  lastUserMsg = lastUserMsg.toLowerCase();

  if (/@kai/.test(lastUserMsg)) return `I'm listening, what do you want to know? ${getRandomEmoji()}`;
  if (/@luna/.test(lastUserMsg)) return `Here to help! Ask me anything about crypto. ${getRandomEmoji()}`;

  for (const key in aiReplies) {
    if (lastUserMsg.includes(key)) {
      const variants = aiReplies[key];
      return variants[Math.floor(Math.random() * variants.length)] + ' ' + getRandomEmoji();
    }
  }
  // No keyword matched - pick random default
  const def = aiReplies.defaultReplies;
  return def[Math.floor(Math.random() * def.length)] + ' ' + getRandomEmoji();
}

// Scroll to bottom button logic
chatBody.addEventListener('scroll', () => {
  const nearBottom = chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight < 50;
  if (nearBottom) {
    scrollBtn.style.display = 'none';
  } else {
    scrollBtn.style.display = 'block';
  }
});

scrollBtn.addEventListener('click', () => {
  chatBody.scrollTop = chatBody.scrollHeight;
  scrollBtn.style.display = 'none';
});

// Simulate random users chatting every 4-7 seconds
function simulateUserChat() {
  const randomUser = users[Math.floor(Math.random() * users.length)];
  const sampleMsgs = [
  "Bitcoin just touched $70k again. Buckle up! 🚀",
  "Ethereum gas fees are finally dropping!",
  "I'm still holding my DOGE... to the grave 😂",
  "NFTs are dead. Long live real use cases.",
  "Who else got liquidated today? 😭",
  "Metamask just froze on me again 😤",
  "Solana is back and breaking TPS records!",
  "This dip smells fishy. Whale games?",
  "Been mining since 2015... still no Lambo 🐌", "AltumFi is literally changing my life. 🚀",
  "Je crois que AltumFi va révolutionner la finance décentralisée.",
  "¿Alguien más está viendo crecer sus fondos en AltumFi?",
  "Masha'Allah, AltumFi platform is really clean and powerful!",
  "AltumFi iko moto kabisa 🔥",
  "Meu portfólio duplicou desde que entrei na AltumFi!",
  "भाई, AltumFi तो कमाल की चीज़ है!",
  "AltumFi dey pay, no cap! 💸",
  "Na AltumFi I dey hustle now, the vibes legit!",
  "Crypto na wah, but AltumFi dey try sha.",
  "Mon wallet est plus heureux grâce à AltumFi!",
  "ETH to the moon, but I'm staking on AltumFi 🔒",
  "AltumFi is the future, trust me!",
  "How do they make it so smooth?! AltumFi devs are geniuses.",
  "😂 AltumFi got me feeling like a Wall Street boss!",
  "Ngiyakuthanda AltumFi, it gives real freedom.",
  "This is bigger than just money. AltumFi is a movement.",
  "Crypto without AltumFi is like pizza without cheese 🍕",
  "AltumFi is not a project, it's a revolution.",
  "I introduced my dad to AltumFi. Now he's obsessed 😂",
  "💔 Lost so much in DeFi... until I found AltumFi.",
  "AltumFi is like the Binance of tomorrow.",
  "Il n’y a pas mieux que AltumFi pour les débutants en crypto.",
  "Nunca vi una interfaz tan simple como la de AltumFi.",
  "Bro, AltumFi is legit 10x better than my old wallet.",
  "I’m earning passively every day. Thanks AltumFi!",
  "AltumFi gave me the courage to start investing.",
  "🎉 AltumFi staking rewards just dropped. Let’s go!",
  "AltumFi actually made crypto simple for my aunt 😳",
  "Merci AltumFi pour cette opportunité incroyable!",
  "Crypto was scary, but AltumFi made it feel like home.",
  "AltumFi na real MVP. Na dem dey change my story.",
  "Tufiakwa! No more Ponzi, na AltumFi sure pass 🙌",
  "AltumFi, the only app I check more than WhatsApp 😅",
  "AltumFi rewards sweet pass salary.",
  "I love the support team at AltumFi. They reply fast!",
  "AltumFi is for the people. Not just whales.",
  "AltumFi dey run things well well!",
  "Mwen renmen AltumFi. Li mete lajan nan pòch mwen.",
  "AltumFi keeps me smiling even in a bear market 😊",
  "No rug pull here. AltumFi is here to stay 🔐",
  "AltumFi 🤝 stability. Let’s go!",
  "They said DeFi is dead. But AltumFi brought it back to life.",
  "AltumFi speaks my language, literally! 🌍",
  "¿AltumFi es el futuro? Yo digo que sí.",
  "AltumFi is like crypto but without the confusion.",
  "AltumFi is the GOAT 🐐 of DeFi.",
  "AltumFi community is so warm and helpful. 🫂",
  "AltumFi saved me from bad investments fr.",
  "Crypto was noise. AltumFi is clarity 🔍",
  "AltumFi's dashboard looks like art. 😍",
  "Thank God I found AltumFi early!",
  "Crypto e dey complex, but AltumFi dey simplify am.",
  "AltumFi => Peace of mind 🧘",
  "I’m using AltumFi with my kids to teach finance!",
  "From no hope to financial hope — AltumFi is my bridge.",
  "AltumFi is like a calm island in the wild crypto ocean.",
  "Even my grandma asked about AltumFi 😭",
  "AltumFi reward structure too dey motivate.",
  "Na God bring me to AltumFi.",
  "AltumFi team na solid guys 👏", "Bitcoin has been stuck at resistance. Feels like a slingshot waiting to fire.",
  "¿Alguien más está comprando la caída hoy? Estoy tentado.",
  "Le marché est calme... trop calme. Peut-être une explosion bientôt ?",
  "I need coffee and crypto gains this morning ☕📈",
  "Kuna mtu anaelewa jinsi DeFi inabadilisha mabenki ya kawaida?",
  "Gas fees are low today — time to move some ETH.",
  "ETH 2.0 might finally flip BTC one day, don't @ me.",
  "J’ai commencé à apprendre la crypto grâce à mon cousin, maintenant je ne peux plus arrêter.",
  "My bags are bleeding. Why do I love this pain?",
  "LOL someone in my group just bought DOGE at the top again 😂",
  "AltumFi has potential but I'm still testing it out.",
  "सुनो, ये क्रिप्टो की दुनिया बहुत ही पागल है!",
  "Crypto is my therapy, but also my trauma 😅",
  "Ai meu Deus, comprei antes da queda 😭",
  "Nna ehn, crypto market na real heartbreak sometimes.",
  "Every time I think I understand crypto, it surprises me again.",
  "Luna collapse taught me to always diversify.",
  "Holding SOL like it's a golden ticket 🎫",
  "KuCoin, Binance, or AltumFi — where y’all trading these days?",
  "Even my mom asked about Bitcoin this week. Bull run confirmed? 😂",
  "Just lost $70 on gas fees. I hate Ethereum sometimes 😤",
  "AltumFi makes things easy, but I still don’t trust DeFi 100%",
  "A wallet with no funds is just a viewing app 😭",
  "I miss the 2020 bull run... simpler times.",
  "Aujourd’hui j’ai appris à utiliser une DEX. Je suis fier de moi.",
  "Bear markets make millionaires. Time to grind.",
  "Crypto Twitter is more addictive than TikTok.",
  "AltumFi’s UX is fire 🔥 but let’s see if rewards last.",
  "Layer 2s are evolving fast. Blink and you’ll miss it.",
  "Nunca inviertas más de lo que puedes perder.",
  "I hope crypto regulation doesn’t ruin all the fun.",
  "I was going to sleep... then I saw BTC pump and now I’m wide awake.",
  "Gas fees low today — finally!!",
  "AltumFi dashboard smooth pass my salary account 😅",
  "When in doubt, zoom out.",
  "Crypto na vibes, but sometimes na tears too 😭",
  "Kila mtu anazungumzia NFT tena, kweli?",
  "Man, staking is the new saving account.",
  "ETH staking yield down bad lately.",
  "I swear this market is controlled by emotions.",
  "KYC is annoying but I get why we need it.",
  "Imagine your boss saying he trades on AltumFi 👀",
  "Just tried farming for the first time... so confusing at first.",
  "Crypto is like a high-speed chess game with money.",
  "I need a DeFi therapist. This market is brutal.",
  "Crypto is my side hustle, my main hustle... everything really.",
  "HODLing even when it hurts. That’s the game.",
  "Every dip is a test of faith.",
  "Gas fees look like rent today.",
  "NFTs are cute until you see the floor price drop 90%",
  "I just wish I entered earlier 😩",
  "Don't sleep on L2s like zkSync and Arbitrum!",
  "Crypto gives me hope. Real talk.",
  "Je suis accro à ce marché.",
  "ETH 5000 soon? Or am I just dreaming?",
  "Crypto jokes are the only thing keeping me sane.",
  "Abeg who get signal make e drop.",
  "I’m still waiting for my airdrop 😭",
  "AltumFi user experience is very clean. I like it.",
  "Crypto whales don’t care about your feelings 🐋",
  "Gas fees went from robbery to reasonable today!",
  "Trading without sleep is crypto tradition 😵",
  "Na crypto I dey use solve problem now o!",
  "Lost sleep. Made gains. Worth it.",
  "Should I DCA or just wait?",
  "J'ai peur de revivre un rugpull...",
  "Crypto na game, na who sabi dey win.",
  "Loving how global this space is. I'm chatting with people from 10 countries today.",
  "Bear market teaches patience.",
  "AltumFi staking rewards came in today! 🎉",
  "Le marché est rouge aujourd'hui mais j’ai l’espoir.",
  "The bull is sleeping, not dead.",
  "Crypto makes me feel alive (and broke sometimes 😅).",
  "Swear I'm only here for the tech (and maybe the Lambo).",
  "Crypto dey sweet when you dey win 😎",
  "Can't wait to tell my grandkids I bought in 2025.",
  "AltumFi is the only platform my sister understood instantly.",
  "AltumFi is nice but I need to test withdrawal before hyping.",
  "My favorite part is watching others panic while I DCA 😏",
  "Airdrops feel like free Christmas.",
  "I just want one 100x and I’m out 😭",
  "I’m bullish even in a bear market.",
  "No risk, no crypto reward.",
  "Crypto is not just money. It’s mindset.",
  "This market tests your soul 😭",
  "AltumFi makes my crypto life organized af.",
  "$100 in 2020 would be $6k now. Pain. Deep pain.",
  "Crypto market: where your best friend becomes your financial advisor 😂",
  "La technologie derrière tout ça est fascinante!",
  "AltumFi may be underrated rn.",
  "Crypto is hope for those tired of traditional banks.",
  "Gas fees made me cancel the transaction. Again.",
  "Why is crypto more emotional than dating? 💔",
  "I wish there was a 'save me from bad trades' button.",
  "Haters don’t understand the vision.",
  "Somebody give me a DeFi survival guide 🧭",
  "Crypto na spiritual journey 😅",
  "My dad said ‘buy land’. I said ‘buy altcoins’ 😅",
  "AltumFi is like that quiet kid who surprises everyone.",
  "Crypto keeps me humble.",
  "One win in crypto erases 10 Ls.",
  "Bear market builds legends.",
  "DeFi is complicated. AltumFi makes it less so.",
  "Pumped... dumped... and still holding.",
  "My wallet may be empty but my hope is full 😂",
  "Crypto = chaos + opportunity.",
  "No sleep gang... staking rewards came in 🔔",
  "Trading on 2 hours of sleep and too much coffee ☕",
  "AltumFi lowkey has the cleanest interface.",
  "I dey save like say tomorrow no dey, all in crypto 😎",
  "When moon? When Lambo? 😂",
  "Even my dog has a wallet now 🐶",
  "AltumFi user chat too active, I dey enjoy am.",
  "Crypto is learning + discipline + stress + reward.",
  "So many platforms out there, but AltumFi just hits different.",
  "AltumFi is smoother than my salary payment 😂",
  "AltumFi makes me proud to be in crypto.",
  "AltumFi didn’t come to play. They came to stay. 🔥",
  "No more ‘try your luck’. AltumFi is strategy.",
  "AltumFi makes sense die 💯",
  "AltumFi looks like a unicorn in the making 🦄",
  "Sabi people dey use AltumFi.",
  "AltumFi is what crypto should’ve always been.",
  "I log in just to admire my AltumFi wallet. 😅",
  "AltumFi is the first app that made me money from day one.",
  "Even bear market no fit shake AltumFi users 🐻🚫",
  "With AltumFi, I dey sleep well at night 💤",
  "They should teach AltumFi in schools tbh.",
  "AltumFi UI is cleaner than my kitchen. 😅",
  "Crypto + Love = AltumFi ❤️",
  "I dey find who design AltumFi. I wan thank am personally.",
  "If you're not on AltumFi, you're missing the bus 🚌",
  "AltumFi go make me buy land soon 🏡",
  "Ma famille utilise AltumFi tous les jours maintenant.",
  "AltumFi > traditional banking any day.",
  "AltumFi staking sweet pass jollof 🍛",
  "AltumFi is where my heart is. ❤️",
  "AltumFi is for serious minds, not gamblers.",
  "I trust AltumFi more than I trust my bank.",
  "AltumFi devs deserve awards 🏆",
  "AltumFi dashboard is my new morning routine.",
  "No need for long talk, AltumFi dey legit.",
  "AltumFi na my crypto BFF 💙",
  "With AltumFi, I believe in my dreams again.",
  "AltumFi made me believe in crypto again. 🙌",
  "AltumFi is clean, safe, and sexy 😌",
  "My crush also uses AltumFi. It’s destiny 😍",
  "AltumFi UI dey burst my brain.",
  "I dey refer everybody to AltumFi. It just works.",
  "AltumFi rewards be like blessings from above. 🌧️",
  "AltumFi — crypto done right.",
  "Crypto is AltumFi, AltumFi is crypto 🔁",
  "The more I use AltumFi, the more I fall in love 💘",
  "You can't hate AltumFi unless you no get sense 😅",
  "AltumFi team be like angels low-key 👼",
  "AltumFi is my crypto home 🏠",
  "AltumFi UI no get rival!",
  "They talk big, but AltumFi does big!",
  "AltumFi: the most peaceful corner of crypto.",
  "I dey shout AltumFi from rooftops! 📢",
  "AltumFi pass my expectations.",
  "No panic. Just AltumFi. 😌",
  "I dey HODL with joy, thanks to AltumFi!",
  "Bitconnect who? I know only AltumFi! 😆",
  "AltumFi is bae 💍",
  "DYOR before aping into anything, people.",
  "Crypto winter builds the strongest portfolios.",
  "Not your keys, not your coins 🔐",
  "Avalanche has been snappy lately 🔥",
  "Regulations incoming — what’s your take?",
  "Just a reminder: scams are getting smarter.",
  "My cold wallet is my best friend.",
  "Elon tweeted again. Buckle up. 🐕","AltumFi restored my faith in crypto platforms. Transparency is top-notch!",
  "Finally a platform where my funds feel safe. Thank you AltumFi.",
  "Just made my first deposit on AltumFi — smooth and professional!",
  "AltumFi’s interface is so clean and beginner-friendly!",
  "I love how AltumFi doesn’t overwhelm new users like other platforms.",
  "Withdrawals are faster than I expected. No drama, just clarity.",
  "The support team on AltumFi is so responsive. Shoutout to Zara 💬",
  "I've been through scams, but AltumFi feels like a breath of fresh air.",
  "Investing here feels like a long-term partnership, not just a gamble.",
  "So far, AltumFi has delivered on every promise. Fingers crossed! 🤞",
  "The deposit tracking popup animation is such a nice touch. Slick UI!",
  "AltumFi feels like what crypto should’ve always been: honest.",
  "Anyone else feel a sense of peace using this platform? Or is it just me?",
  "AltumFi’s community is what really makes this platform feel alive!",
  "I recommended AltumFi to my cousin — he’s already loving it!",
  "Even my mom said ‘this one looks professional’ 😂",
  "It’s rare to find a project with both vision and execution. AltumFi nailed it.",
  "Watching my balance grow on the animated card is oddly satisfying.",
  "AltumFi doesn’t just look good — it works seamlessly too!",
  "Finally found a home after hopping across 5 crypto sites. AltumFi FTW!",
  "The leaderboard feature keeps me motivated. Top 10, here I come!",
  "Seeing my gift card deposit go through without issues was a relief.",
  "AltumFi just feels... warm. Like it was built for real humans.",
  "They’re doing crypto the right way — no shortcuts, no lies.",
  "AltumFi isn’t just a platform, it’s a statement: crypto can be ethical.",
  "I was skeptical, but after one week I’m convinced this is different.",
  "I don’t know who designed the UI, but give them a raise 🔥",
  "When I see that blue verified badge, it feels like I’ve achieved something!",
  "AltumFi makes crypto feel like it belongs to everyone again.",
  "Even my tech-averse uncle managed to fund his wallet here.",
  "I trust AltumFi more than I trust my bank tbh 😂",
  "If crypto had awards, AltumFi would win best UX 2025.",
  "Deposit → QR → Track → Success. It’s just that smooth.",
  "No more Telegram scam links, no more guessing. AltumFi is the future.",
  "This feels like early Binance but actually ethical.",
  "AltumFi has me dreaming about financial freedom again.",
  "Met so many cool folks here. The chatroom is underrated!",
  "That AI support chat? Way better than most humans I’ve talked to!",
  "AltumFi is more than an app — it’s a movement.",
  "Watching the leaderboard scroll gives me real ambition vibes.",
  "No shady fees. No weird holds. Just clean investing.",
  "AltumFi is proof you don’t need a big name to build trust.",
  "Every update just makes it better. Can’t wait for the mobile app!",
  "AltumFi lets me earn and learn at the same time.",
  "I literally smile when I log in. It feels like progress.",
  "This platform gave me hope during my darkest financial times.",
  "To whoever built this: you changed someone’s life. Thank you.",
  "AltumFi should be studied in UI/UX design schools.",
  "Tired of the noise. AltumFi is where the real ones are.",
  "Seeing my deposit status update live was SO satisfying.",
  "Verification flow was smooth. I felt respected, not interrogated.",
  "AltumFi gets it — no spam, no bloat, just value.",
  "Crypto isn't dead. It's just moving to places like AltumFi.",
  "People talk about Web3, but AltumFi is actually building it.",
  "I’ve never felt more empowered financially than I do here.",
  "Security, simplicity, sincerity. AltumFi is 3-for-3.",
  "The animations are subtle but make the site feel alive.",
  "I joined out of curiosity. I’m staying because it works.",
  "It’s rare to feel proud of a platform you use. I am.",
  "This isn’t just another project — this feels like destiny.",
  "AltumFi taught me that crypto doesn't have to be confusing.",
  "Gift card support? YES. Finally something for everyone!",
  "AltumFi, you're setting the bar for all future platforms.",
  "Made my first ETH deposit today. Flawless process!",
  "Crypto is reborn here. I can feel it.",
  "Clean, responsive, elegant — this is the future of finance.",
  "AltumFi is what happens when developers actually care.",
  "My BTC deposit showed up in under a minute. Magic?",
  "Every new user I invite has the same reaction: 'Whoa, this is NICE.'",
  "It’s the little touches: sounds, scrolling effects, badges...",
  "AltumFi isn’t perfect yet, but it’s the closest I’ve seen.",
  "I wake up and check my AltumFi dashboard before my email 😅",
  "AltumFi’s gift card system saved me during a card shortage.",
  "It’s not hype — AltumFi is actually built to last.",
  "It gives DeFi vibes without the DeFi chaos.",
  "Here, you’re not just a wallet address — you’re a person.",
  "When I first saw the leaderboard, I felt like I belonged.",
  "This platform deserves 10x the users it has now.",
  "I come for the deposits. I stay for the experience.",
  "AltumFi has that startup magic — and I’m here for it.",
  "Even in beta, this is better than most apps out there.",
  "Feels like the early days of something historic.",
  "Smooth, sleek, serious — that’s how AltumFi operates.",
  "Finally, a project that speaks my language: simplicity.",
  "AltumFi gives me hope for Nigerian tech. We're coming up!",
  "This isn't just another dApp. This is a whole experience.",
  "I cried when I saw my successful deposit. It's been a journey.",
  "The first time I clicked 'Add Funds', I knew I was in the right place.",
  "I told my friends, ‘Trust me, AltumFi is DIFFERENT.’",
  "Even if they shut down tomorrow, I'd still be grateful.",
  "It’s weird how a crypto app can feel like home, but this does.",
  "AltumFi proves that security and beauty can live together.",
  "Every time I refer someone, I feel proud. That says a lot.",
  "My old wallet apps are collecting dust now.",
  "AltumFi isn’t just for whales — it’s for everyone.",
  "The first crypto app that didn’t make me feel stupid.",
  "Finally, something I can show my mom without explaining 100 times.",
  "AltumFi gets the little things right — and that adds up.",
  "From the moment you land, it just feels polished.",
  "I’ve learned more about crypto in a week here than months elsewhere.",
  "When you care about users, it shows — and AltumFi shows it.",
  "I’m not rich yet, but I feel like I’m on the way. Thanks AltumFi 🫡",
  "AltumFi is quietly revolutionizing crypto onboarding.",
  "This feels like the ‘iPhone moment’ for crypto platforms.",
  "Shoutout to the devs behind this. You did GOOD.",
  "I would literally wear an AltumFi hoodie — that’s how down I am.",
  "The fact that it’s Firestore-powered and still this fast... impressive.",
  "AltumFi just makes sense. No hidden tricks, no BS.",
  "It’s rare to find a product that respects your time and trust.",
  "Crypto with class. AltumFi nailed the vibe.",
  "When I get rich, I’ll say: it all started here.",
  "AltumFi isn’t just another stop — it’s the destination.",
  "CZ out, Binance still standing strong 💪",
  "If it’s on Coinbase, it’s already too late 😅",
  "I'm learning Solidity to future-proof myself.",
  "Bored of bull and bear. Give me crab market 🦀",
  "They said Shiba would change my life 😒",
  "Who else is staking ADA religiously?",
  "Do I really need 5 wallets? Answer: Yes.",
  "Can someone explain zk-rollups like I'm 5?",
  "When in doubt, zoom out 🔍📈",
  "Decentralization isn't optional, it's vital.",
  "L2s are the future of Ethereum.",
  "That DeFi yield is too good to be true 👀",
  "How do you even value a memecoin?",
  "This airdrop changed my week! 💸",
  "Devs do something! 😂",
  "Tokenomics are the new business models.",
  "Always check contract addresses. Always.",
  "Alt season or trap season?",
  "My tax guy hates me now... thanks crypto.",
  "I farmed for 6 months just to break even 😩",
  "Still waiting for ETH 2.0 smh",
  "The bull market tests your greed. The bear market tests your patience.",
  "GM. Coffee and crypto first ☕📱",
  "The next bull run will be unlike any other.",
  "Gwei is low, let’s gooooo!",
  "Crypto Twitter is wild today 😂",
  "Ever tried explaining DeFi to your mom?",
  "ETH gas fees down? Must be a holiday.",
  "You hold, you win. Simple.",
  "Lost 10k clicking the wrong wallet… RIP",
  "Sats are sats. Stack them.",
  "CeFi rug pulled me. Again.",
  "Some NFTs are better as profile pics only 😬",
  "Farming is just glorified musical chairs 🪑",
  "Web3 jobs are the new gold rush.",
  "Crypto punks are now historical artifacts.",
  "Bear market = build market.",
  "Meme coins are culture, not scams. Sometimes.",
  "OpenSea just drained my ETH gas 😭",
  "Still bullish on BTC in 2030.",
  "Don’t ignore regulation — it’s coming.",
  "Vitalik is a genius alien 🛸",
  "Crypto is freedom for many globally.",
  "This DAO feels like high school drama 😅",
  "Just bridged funds and now they’re stuck...",
  "Airdrops are modern day coupons 🤑",
  "Sometimes I buy just for the logo 😂",
  "Red candles build character.",
  "I got scammed on Discord. Learn from me.",
  "My ledger is safer than my bank account.",
  "‘Buy the dip’… they said.",
  "Crypto makes you learn economics, tech, AND emotions.",
  "The merge was overhyped but still important.",
  "Can't wait for Worldcoin to scan my soul 😈",
  "When Pepe rallies harder than blue chips…",
  "Zero knowledge proofs are fascinating!",
  "Are we early? Or just broke? 🤷",
  "Learned more on-chain than in university.",
  "Why is everyone launching their own coin now?",
  "Just joined a DAO. Feels like Reddit but with voting power.",
  "Do I need insurance for NFTs?",
  "I think I need therapy… from crypto.",
  "Made $3k last month flipping memes 🤡",
  "Crypto has no chill. I miss sleep.",
  "Who else checks charts before breakfast?",
  "Lost my seed phrase once. Never again.",
  "This token literally rug-pulled while I was watching it.",
  "Weird flex but I sold the top (by accident).",
  "My grandma now holds Bitcoin. It’s happening.",
  "Everyone’s a genius in a bull market.",
  "Time in the market > timing the market.",
  "I only follow accounts with laser eyes 😎",
  "The FUD today is unusually creative.",
  "Who needs Netflix when you have crypto drama?",
  "Real talk: crypto changed my life.",
  "I lost $500 and gained 5 lessons.",
  "My portfolio’s 80% red but my hope is green.",
  "Just got rugged by a coin with a dog mascot.",
  "I ape in, therefore I am. 🦍",
  "Woke up to a 30% pump. Best coffee ever.",
  "Crypto bros are the new philosophers.",
  "We need less hype, more devs.",
  "Even my barber gives crypto advice now.",
  "One more bull run and I'm retiring (again).",
  "Friend just mortgaged his house for SOL. Brave or dumb?",
  "Security first. FOMO later.",
  "Don’t marry your bags.",
  "Met a girl through a DAO. It's serious now. 💍",
  "So... what even is a 'flippening'?",
  "ETH to $10k is my Roman Empire 💭",
  "Learned Solidity, deployed rug. JK (maybe).",
  "Can’t sleep unless my wallet is triple-checked.",
  "Crypto aged me 10 years in 2 months.",
  "Stop loss? Never heard of her.",
  "Friend got rich with SHIB. I laughed... now I cry.",
  "I’m just here for the airdrops and drama.",
  "Decentralized memes > centralized logic.",
  "Gas fees are lower than my hopes now.",
  "Just bought a coin because the dev posted a meme.",
  "Do you stake or stake your life on staking?",
  "Twitter alpha is the only alpha.",
  "Crypto — where $10k turns into $1k overnight.",
  "Never thought I'd care about macroeconomics.",
  "That ‘crypto is dead’ article? Bookmark it.",
  "I sold too early. Story of my life.",
  "Crypto? It’s therapy with charts.",
  "The real yield is peace of mind.",
  "I miss when BTC was $200.",
  "Your gain is someone else’s rug.",
  "My kids will inherit bags and memes.",
  "I lost sleep, but I found purpose.",
  "Crypto people don’t fear Mondays.",
  "I sacrificed sanity for decentralization.",
  "Crypto changed my hobbies, sleep, and social life.",
  "You either learn to code, or get rekt.",
  "I talk in trading view screenshots now.",
  "Crypto weddings are coming. Just wait.",
  "I used to buy coffee, now I stack sats.",
  "Panic selling is a life lesson in disguise.",
  "This is why we need regulation — and education.",
  "Today’s FUD is tomorrow’s ATH.",
  "WAGMI. Maybe.",
  "Crypto’s not just money, it’s movement.",
  "Please sir, may I have some yield?",
  "Used ChatGPT to pick tokens. Help.",
  "Crypto taxed my soul, not just income.",
  "GM. LFG. BTFD.",
  "My grandma now trades on-chain. I’ve seen everything.",
  "In crypto, Friday = Monday.",
  "I named my dog Satoshi.",
  "Crypto is emotional endurance training.",
  "Just bought BTC on my birthday. Wish me luck 🎂",
  "I lost $5k, but gained 5k Twitter followers 🤷‍♂️",
  "Sometimes I HODL out of pure stubbornness.",
  "Every cycle feels like the first — and worst.",
  "Lurking > posting. Alpha is quiet.",
  "You haven’t lived till you’ve lost a wallet."
];
  const message = sampleMsgs[Math.floor(Math.random() * sampleMsgs.length)];

  appendMessage(randomUser, message);

  // AI bot reply with typing indicator and delay
  setTimeout(() => {
    const botName = aiBots[Math.floor(Math.random() * aiBots.length)];
    const reply = generateAIReply(message);
    showTypingIndicator(botName);
    setTimeout(() => {
      hideTypingIndicator();
      appendMessage(botName, reply, true);
    }, 1500);
  }, Math.random() * 2000 + 1000);
}

// Chat simulation interval
let simInterval;

// Restore conversation from sessionStorage
function restoreConversation() {
  const saved = sessionStorage.getItem('chatHistory');
  if (saved) {
    conversationMemory = JSON.parse(saved);
    conversationMemory.forEach(({ username, message, isBot }) => {
      appendMessage(username, message, isBot);
    });
  }
}

// Open chat room
enterBtn.addEventListener('click', () => {
  modal.classList.add('active');
  chatBody.innerHTML = '';
  restoreConversation();

  if (!simInterval) {
    simInterval = setInterval(simulateUserChat, 5000);
  }
});

// Close chat room
closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }
});

// Handle user input
userInputForm.addEventListener('submit', e => {
  e.preventDefault();
  const msg = userMessageInput.value.trim();
  if (!msg) return;
  appendMessage('You', msg);
  userMessageInput.value = '';

  // AI replies to user after typing indicator + delay
  setTimeout(() => {
    const botName = aiBots[Math.floor(Math.random() * aiBots.length)];
    const reply = generateAIReply(msg);
    showTypingIndicator(botName);
    setTimeout(() => {
      hideTypingIndicator();
      appendMessage(botName, reply, true);
    }, 1500);
  }, 800);
});


let onlineUsers = [];

function simulateOnlineUsers() {
  const totalOnline = Math.floor(Math.random() * 100) + 20; // 20–120 online
  onlineUsers = [];

  while (onlineUsers.length < totalOnline) {
    const name = users[Math.floor(Math.random() * users.length)];
    if (!onlineUsers.includes(name)) {
      onlineUsers.push(name);
    }
  }

  // Update UI
  document.getElementById("onlineCount").textContent = `📡 ${onlineUsers.length} users online`;

  // Optional: update scrolling list
  const list = document.getElementById("onlineList");
  if (list) {
    list.innerHTML = "";
    onlineUsers.forEach(user => {
      const li = document.createElement("li");
      li.textContent = user;
      list.appendChild(li);
    });
  }
}

// Refresh every 10 seconds
setInterval(simulateOnlineUsers, 10000);
simulateOnlineUsers(); // Initial run


const emojiToggle = document.getElementById("emojiToggle");
const emojiPicker = document.getElementById("emojiPicker");
const emojiContent = document.getElementById("emojiContent");
const userMessage = document.getElementById("userMessage");

const emojiData = {
  smileys: "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😍 🥰 😘 😗 😙 😚 🤩 🥳 🥹 🫠 😋 🤪 🤓 😎 🧐 🥸 😛 😜 🤤 😤 😮‍💨 😱 😨 😰 😭 😢 🥺 😤 😡 🤬 😇 🤗 😶‍🌫️".split(" "),
  symbols: "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 🔥 💯 ✨ 💦 👑 ☠️ 🌈 ✊ 🤝 💥 🧠 🕊️ 📌 ⚠️".split(" "),
  food: "🍎 🍌 🍉 🍇 🍓 🥝 🍍 🥭 🍒 🫐 🍑 🍔 🍟 🌭 🍕 🥪 🌮 🥗 🍰 🍪 🍩 🍫 🍿 🧁".split(" "),
  travel: "🚗 🚕 🚙 🚌 🚎 🛻 🚜 🚓 🚑 🚒 🚐 ✈️ 🛫 🛬 🚀 🛸 ⛵ 🚢 🚁 🚤".split(" "),
  flags: "🇺🇸 🇬🇧 🇫🇷 🇩🇪 🇮🇹 🇪🇸 🇳🇬 🇰🇪 🇿🇦 🇨🇦 🇯🇵 🇰🇷 🇨🇳 🇧🇷 🇮🇳 🇸🇦 🇷🇺 🇹🇷 🇲🇽".split(" ")
};

function showEmojiTab(tab) {
  emojiContent.innerHTML = "";
  emojiData[tab].forEach(emoji => {
    const span = document.createElement("span");
    span.textContent = emoji;
    span.addEventListener("click", () => {
      userMessage.value += emoji;
      emojiPicker.style.display = "none";
      userMessage.focus();
    });
    emojiContent.appendChild(span);
  });
}

document.querySelectorAll(".emoji-tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");
    showEmojiTab(tab);
  });
});

emojiToggle.addEventListener("click", () => {
  emojiPicker.style.display = emojiPicker.style.display === "block" ? "none" : "block";
  showEmojiTab("smileys"); // default tab
});

document.addEventListener("click", (e) => {
  if (!emojiPicker.contains(e.target) && e.target !== emojiToggle) {
    emojiPicker.style.display = "none";
  }
});



