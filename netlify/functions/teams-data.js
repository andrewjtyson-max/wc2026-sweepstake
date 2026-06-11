// 2026 FIFA World Cup — all 48 confirmed teams
// Groups: confirmed draw, 5 Dec 2025, Washington DC
// Tiers based on FIFA April 2026 rankings:
//   Tier 1 = FIFA rank 1–16 (the genuine contenders / top seeds)
//   Tier 2 = FIFA rank 17–40 (solid mid-tier sides)
//   Tier 3 = FIFA rank 41+ (lower-ranked / tournament debutants)

const TEAMS = [
  // ── GROUP A ──
  { name: "Mexico",             flag: "🇲🇽", group: "A", tier: 1, rank: 15 }, // host
  { name: "South Korea",        flag: "🇰🇷", group: "A", tier: 2, rank: 25 },
  { name: "South Africa",       flag: "🇿🇦", group: "A", tier: 3, rank: 60 },
  { name: "Czechia",            flag: "🇨🇿", group: "A", tier: 3, rank: 41 },

  // ── GROUP B ──
  { name: "Canada",             flag: "🇨🇦", group: "B", tier: 2, rank: 30 }, // host
  { name: "Bosnia-Herzegovina", flag: "🇧🇦", group: "B", tier: 3, rank: 71 },
  { name: "Qatar",              flag: "🇶🇦", group: "B", tier: 3, rank: 53 },
  { name: "Switzerland",        flag: "🇨🇭", group: "B", tier: 2, rank: 19 },

  // ── GROUP C ──
  { name: "Brazil",             flag: "🇧🇷", group: "C", tier: 1, rank: 6  },
  { name: "Morocco",            flag: "🇲🇦", group: "C", tier: 1, rank: 8  },
  { name: "Haiti",              flag: "🇭🇹", group: "C", tier: 3, rank: 79 },
  { name: "Scotland",           flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", tier: 3, rank: 43 },

  // ── GROUP D ──
  { name: "USA",                flag: "🇺🇸", group: "D", tier: 1, rank: 16 }, // host
  { name: "Paraguay",           flag: "🇵🇾", group: "D", tier: 2, rank: 38 },
  { name: "Australia",          flag: "🇦🇺", group: "D", tier: 2, rank: 27 },
  { name: "Turkey",             flag: "🇹🇷", group: "D", tier: 2, rank: 22 },

  // ── GROUP E ──
  { name: "Germany",            flag: "🇩🇪", group: "E", tier: 1, rank: 10 },
  { name: "Curacao",            flag: "🇨🇼", group: "E", tier: 3, rank: 81 },
  { name: "Ivory Coast",        flag: "🇨🇮", group: "E", tier: 2, rank: 39 },
  { name: "Ecuador",            flag: "🇪🇨", group: "E", tier: 2, rank: 23 },

  // ── GROUP F ──
  { name: "Netherlands",        flag: "🇳🇱", group: "F", tier: 1, rank: 7  },
  { name: "Japan",              flag: "🇯🇵", group: "F", tier: 2, rank: 18 },
  { name: "Sweden",             flag: "🇸🇪", group: "F", tier: 2, rank: 37 },
  { name: "Tunisia",            flag: "🇹🇳", group: "F", tier: 3, rank: 47 },

  // ── GROUP G ──
  { name: "Belgium",            flag: "🇧🇪", group: "G", tier: 1, rank: 9  },
  { name: "Egypt",              flag: "🇪🇬", group: "G", tier: 2, rank: 33 },
  { name: "Iran",               flag: "🇮🇷", group: "G", tier: 2, rank: 21 },
  { name: "New Zealand",        flag: "🇳🇿", group: "G", tier: 3, rank: 88 },

  // ── GROUP H ──
  { name: "Spain",              flag: "🇪🇸", group: "H", tier: 1, rank: 2  },
  { name: "Cape Verde",         flag: "🇨🇻", group: "H", tier: 3, rank: 70 },
  { name: "Saudi Arabia",       flag: "🇸🇦", group: "H", tier: 3, rank: 58 },
  { name: "Uruguay",            flag: "🇺🇾", group: "H", tier: 1, rank: 17 },

  // ── GROUP I ──
  { name: "France",             flag: "🇫🇷", group: "I", tier: 1, rank: 1  },
  { name: "Senegal",            flag: "🇸🇳", group: "I", tier: 1, rank: 14 },
  { name: "Iraq",               flag: "🇮🇶", group: "I", tier: 3, rank: 56 },
  { name: "Norway",             flag: "🇳🇴", group: "I", tier: 2, rank: 32 },

  // ── GROUP J ──
  { name: "Argentina",          flag: "🇦🇷", group: "J", tier: 1, rank: 3  },
  { name: "Algeria",            flag: "🇩🇿", group: "J", tier: 2, rank: 36 },
  { name: "Austria",            flag: "🇦🇹", group: "J", tier: 2, rank: 24 },
  { name: "Jordan",             flag: "🇯🇴", group: "J", tier: 3, rank: 64 },

  // ── GROUP K ──
  { name: "Portugal",           flag: "🇵🇹", group: "K", tier: 1, rank: 5  },
  { name: "DR Congo",           flag: "🇨🇩", group: "K", tier: 3, rank: 55 },
  { name: "Uzbekistan",         flag: "🇺🇿", group: "K", tier: 3, rank: 57 },
  { name: "Colombia",           flag: "🇨🇴", group: "K", tier: 1, rank: 13 },

  // ── GROUP L ──
  { name: "England",            flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", tier: 1, rank: 4  },
  { name: "Croatia",            flag: "🇭🇷", group: "L", tier: 1, rank: 11 },
  { name: "Ghana",              flag: "🇬🇭", group: "L", tier: 3, rank: 73 },
  { name: "Panama",             flag: "🇵🇦", group: "L", tier: 3, rank: 51 },
];

module.exports = { TEAMS };
