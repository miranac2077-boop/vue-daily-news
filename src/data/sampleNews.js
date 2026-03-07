// Sample news data grouped by days ago (0 = today, 1 = yesterday, etc.)
// In production, replace with a real NewsAPI key in .env as VITE_NEWS_API_KEY

const now = new Date()

function daysAgo(n) {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  d.setHours(Math.floor(Math.random() * 12) + 6, Math.floor(Math.random() * 59))
  return d.toISOString()
}

export const sampleArticles = [
  // Today - Technology
  {
    id: 1,
    title: "Apple Unveils M4 Ultra Chip with Record-Breaking Performance Benchmarks",
    description: "Apple's latest silicon breakthrough delivers up to 3x faster neural engine processing, reshaping expectations for desktop computing and AI workloads across its Mac lineup.",
    source: { name: "The Verge" },
    publishedAt: daysAgo(0),
    url: "https://www.theverge.com",
    urlToImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    category: "technology",
  },
  {
    id: 2,
    title: "OpenAI Launches GPT-5 with Advanced Reasoning and Real-Time Web Access",
    description: "The next generation model sets new benchmarks on complex reasoning tasks, coding challenges, and scientific problem-solving, while integrating seamless live web browsing capabilities.",
    source: { name: "TechCrunch" },
    publishedAt: daysAgo(0),
    url: "https://techcrunch.com",
    urlToImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    category: "technology",
  },
  {
    id: 3,
    title: "Google DeepMind's AlphaFold 3 Solves Previously Unsolvable Protein Structures",
    description: "Researchers report a major leap in predicting complex multi-protein interactions, opening new doors for drug discovery and personalized medicine applications globally.",
    source: { name: "Nature" },
    publishedAt: daysAgo(0),
    url: "https://www.nature.com",
    urlToImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80",
    category: "technology",
  },
  // Today - Business
  {
    id: 4,
    title: "Federal Reserve Signals Potential Rate Cut as Inflation Nears 2% Target",
    description: "Fed Chair Jerome Powell's latest remarks suggest the central bank may begin easing monetary policy in the coming quarter, boosting market confidence and sending equities higher.",
    source: { name: "Financial Times" },
    publishedAt: daysAgo(0),
    url: "https://www.ft.com",
    urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    category: "business",
  },
  {
    id: 5,
    title: "Nvidia Surpasses $3 Trillion Market Cap Amid AI Infrastructure Boom",
    description: "The chipmaker's dominant position in AI accelerator hardware continues to drive unprecedented revenue growth, with data center revenues up 220% year-over-year.",
    source: { name: "Bloomberg" },
    publishedAt: daysAgo(0),
    url: "https://www.bloomberg.com",
    urlToImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    category: "business",
  },
  // Today - General
  {
    id: 6,
    title: "Scientists Discover Ancient Roman Villa Preserved Beneath Naples Street",
    description: "Archaeologists uncovering a new metro line unearthed a remarkably intact 1st-century villa complete with frescoes, mosaics, and household artifacts that offer a vivid window into Roman daily life.",
    source: { name: "BBC News" },
    publishedAt: daysAgo(0),
    url: "https://www.bbc.com",
    urlToImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    category: "general",
  },
  // Yesterday - Technology
  {
    id: 7,
    title: "Meta Introduces Next-Gen AR Glasses with All-Day Battery and Prescription Lenses",
    description: "The new Orion glasses feature a 70-degree field of view, seamless smartphone integration, and support for prescription lenses — a major step toward mainstream augmented reality adoption.",
    source: { name: "Wired" },
    publishedAt: daysAgo(1),
    url: "https://www.wired.com",
    urlToImage: "https://images.unsplash.com/photo-1527636078534-92bfdd295987?w=800&q=80",
    category: "technology",
  },
  {
    id: 8,
    title: "SpaceX Starship Completes First Fully Successful Orbital Test Flight",
    description: "The towering megarocket achieved orbit, completed a controlled re-entry, and successfully landed both the Super Heavy booster and Starship upper stage in their respective recovery zones.",
    source: { name: "Ars Technica" },
    publishedAt: daysAgo(1),
    url: "https://arstechnica.com",
    urlToImage: "https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=800&q=80",
    category: "technology",
  },
  // Yesterday - Sports
  {
    id: 9,
    title: "Manchester City Claims Champions League Title in Dramatic Penalty Shootout",
    description: "An enthralling final at Wembley saw both teams level 2-2 after extra time before City goalkeeper Ederson saved two penalties to clinch a historic fourth European crown.",
    source: { name: "ESPN" },
    publishedAt: daysAgo(1),
    url: "https://www.espn.com",
    urlToImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    category: "sports",
  },
  {
    id: 10,
    title: "Serena Williams Returns to Tennis at 44, Shocks World No. 3 at Miami Open",
    description: "In a stunning comeback, the 23-time Grand Slam champion showed flashes of her legendary brilliance to upset the third seed in straight sets, igniting global excitement about her return.",
    source: { name: "Sports Illustrated" },
    publishedAt: daysAgo(1),
    url: "https://www.si.com",
    urlToImage: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80",
    category: "sports",
  },
  // Yesterday - Business
  {
    id: 11,
    title: "Amazon Acquires Robotics Startup for $4.2 Billion to Accelerate Warehouse Automation",
    description: "The deal brings proprietary autonomous mobile robot technology that could slash fulfillment costs by 40%, potentially reshaping the economics of e-commerce logistics at scale.",
    source: { name: "Reuters" },
    publishedAt: daysAgo(1),
    url: "https://www.reuters.com",
    urlToImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    category: "business",
  },
  // 2 Days Ago - Technology
  {
    id: 12,
    title: "Microsoft Integrates Copilot AI Directly into Windows 12 Kernel",
    description: "The deep OS-level integration enables AI assistance across all applications without a separate process, reducing latency and enabling new categories of context-aware system features.",
    source: { name: "ZDNet" },
    publishedAt: daysAgo(2),
    url: "https://www.zdnet.com",
    urlToImage: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800&q=80",
    category: "technology",
  },
  {
    id: 13,
    title: "Breakthrough Battery Technology Promises 1,000-Mile EV Range on Single Charge",
    description: "A team at MIT has developed a solid-state lithium-sulfur battery achieving 4x the energy density of current lithium-ion cells, with promising results in temperature stability tests.",
    source: { name: "MIT Technology Review" },
    publishedAt: daysAgo(2),
    url: "https://www.technologyreview.com",
    urlToImage: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
    category: "technology",
  },
  // 2 Days Ago - General
  {
    id: 14,
    title: "UN Climate Report Warns of Accelerating Ice Sheet Collapse in West Antarctica",
    description: "New satellite data reveals the Thwaites Glacier is retreating 30% faster than previous models predicted, raising projections for sea-level rise by 2100 to potentially 1.5 meters.",
    source: { name: "The Guardian" },
    publishedAt: daysAgo(2),
    url: "https://www.theguardian.com",
    urlToImage: "https://images.unsplash.com/photo-1563974318767-a4de939d4c52?w=800&q=80",
    category: "general",
  },
  {
    id: 15,
    title: "Nobel Prize in Medicine Awarded for Revolutionary CRISPR Gene Therapy Cancer Treatment",
    description: "Researchers who developed a personalized CRISPR-based treatment achieving complete remission in 94% of advanced leukemia patients receive the prestigious award in Stockholm.",
    source: { name: "AP News" },
    publishedAt: daysAgo(2),
    url: "https://apnews.com",
    urlToImage: "https://images.unsplash.com/photo-1631563019676-dade0dbdb8d6?w=800&q=80",
    category: "general",
  },
  // 2 Days Ago - Sports
  {
    id: 16,
    title: "Golden State Warriors Win NBA Championship in Game 7 Thriller",
    description: "Stephen Curry's 51-point masterclass in a winner-take-all game seven clinched the Warriors' sixth title, cementing the dynasty's legacy as one of basketball's all-time great eras.",
    source: { name: "NBA.com" },
    publishedAt: daysAgo(2),
    url: "https://www.nba.com",
    urlToImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
    category: "sports",
  },
  // 3 Days Ago - Business
  {
    id: 17,
    title: "Electric Vehicle Sales Surpass Gasoline Cars in Europe for First Time Ever",
    description: "EVs accounted for 52% of all new car registrations across the EU last month, driven by expanded charging networks, falling prices, and tightened emissions regulations.",
    source: { name: "The Economist" },
    publishedAt: daysAgo(3),
    url: "https://www.economist.com",
    urlToImage: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
    category: "business",
  },
  {
    id: 18,
    title: "JPMorgan Chase Posts Record Quarterly Profit as Investment Banking Surges",
    description: "The bank reported $18.4 billion in net income, driven by a resurgent IPO market, record M&A advisory revenues, and strong performance in its consumer banking division.",
    source: { name: "Wall Street Journal" },
    publishedAt: daysAgo(3),
    url: "https://www.wsj.com",
    urlToImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
    category: "business",
  },
  // 3 Days Ago - Technology
  {
    id: 19,
    title: "Quantum Computer Achieves 'Quantum Advantage' on Real-World Chemistry Problem",
    description: "IBM's 1,000-qubit processor solved a molecular simulation task that would take classical supercomputers 10,000 years, marking the first commercially relevant quantum advantage milestone.",
    source: { name: "Scientific American" },
    publishedAt: daysAgo(3),
    url: "https://www.scientificamerican.com",
    urlToImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    category: "technology",
  },
  // 3 Days Ago - Sports
  {
    id: 20,
    title: "Tour de France Newcomer Breaks 33-Year-Old Stage Record in Alpine Ascent",
    description: "The 22-year-old Colombian climber shattered the legendary Alpe d'Huez stage record by nearly two minutes, drawing comparisons to the sport's greatest climbers of all time.",
    source: { name: "Cycling Weekly" },
    publishedAt: daysAgo(3),
    url: "https://www.cyclingweekly.com",
    urlToImage: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80",
    category: "sports",
  },
  // 3 Days Ago - General
  {
    id: 21,
    title: "WHO Declares End to Mpox Global Health Emergency After 18-Month Battle",
    description: "Sustained vaccination campaigns, improved diagnostics, and coordinated international response successfully contained transmission to isolated clusters, the organization announced.",
    source: { name: "Reuters" },
    publishedAt: daysAgo(3),
    url: "https://www.reuters.com",
    urlToImage: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&q=80",
    category: "general",
  },
]

export const categories = [
  { id: 'all', label: 'All News' },
  { id: 'technology', label: 'Technology' },
  { id: 'business', label: 'Business' },
  { id: 'sports', label: 'Sports' },
  { id: 'general', label: 'General' },
]
