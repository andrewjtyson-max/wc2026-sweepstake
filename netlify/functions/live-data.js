const { getBlobStore } = require("./blob-store");

// Hardcoded group stage fixtures — all times in UTC (displayed as BST/UK in frontend)
// Source: Sky Sports / official FIFA schedule
const GROUP_FIXTURES = [
  // June 11
  { date: "2026-06-11T19:00:00Z", home: "Mexico", away: "South Africa", group: "A", city: "Mexico City", status: "NS" },
  { date: "2026-06-12T00:00:00Z", home: "South Korea", away: "Czechia", group: "A", city: "Guadalajara", status: "NS" },
  // June 12
  { date: "2026-06-12T19:00:00Z", home: "Canada", away: "Bosnia-Herzegovina", group: "B", city: "Toronto", status: "NS" },
  { date: "2026-06-13T02:00:00Z", home: "USA", away: "Paraguay", group: "D", city: "Los Angeles", status: "NS" },
  // June 13
  { date: "2026-06-13T20:00:00Z", home: "Qatar", away: "Switzerland", group: "B", city: "Santa Clara", status: "NS" },
  { date: "2026-06-14T00:00:00Z", home: "Brazil", away: "Morocco", group: "C", city: "New Jersey", status: "NS" },
  { date: "2026-06-14T03:00:00Z", home: "Haiti", away: "Scotland", group: "C", city: "Boston", status: "NS" },
  { date: "2026-06-14T06:00:00Z", home: "Australia", away: "Turkey", group: "D", city: "Vancouver", status: "NS" },
  // June 14
  { date: "2026-06-14T18:00:00Z", home: "Germany", away: "Curacao", group: "E", city: "Houston", status: "NS" },
  { date: "2026-06-14T21:00:00Z", home: "Netherlands", away: "Japan", group: "F", city: "Arlington", status: "NS" },
  { date: "2026-06-15T00:00:00Z", home: "Ivory Coast", away: "Ecuador", group: "E", city: "Philadelphia", status: "NS" },
  { date: "2026-06-15T02:00:00Z", home: "Sweden", away: "Tunisia", group: "F", city: "Guadalupe", status: "NS" },
  // June 15
  { date: "2026-06-15T18:00:00Z", home: "Spain", away: "Cape Verde", group: "H", city: "Atlanta", status: "NS" },
  { date: "2026-06-15T21:00:00Z", home: "Belgium", away: "Egypt", group: "G", city: "Seattle", status: "NS" },
  { date: "2026-06-16T00:00:00Z", home: "Saudi Arabia", away: "Uruguay", group: "H", city: "Miami", status: "NS" },
  { date: "2026-06-16T03:00:00Z", home: "Iran", away: "New Zealand", group: "G", city: "Inglewood", status: "NS" },
  // June 16
  { date: "2026-06-16T20:00:00Z", home: "France", away: "Senegal", group: "I", city: "New Jersey", status: "NS" },
  { date: "2026-06-16T23:00:00Z", home: "Iraq", away: "Norway", group: "I", city: "Boston", status: "NS" },
  { date: "2026-06-17T02:00:00Z", home: "Argentina", away: "Algeria", group: "J", city: "Kansas City", status: "NS" },
  { date: "2026-06-17T05:00:00Z", home: "Austria", away: "Jordan", group: "J", city: "Santa Clara", status: "NS" },
  // June 17
  { date: "2026-06-17T20:00:00Z", home: "Portugal", away: "DR Congo", group: "K", city: "Kansas City", status: "NS" },
  { date: "2026-06-17T23:00:00Z", home: "Uzbekistan", away: "Colombia", group: "K", city: "Dallas", status: "NS" },
  { date: "2026-06-18T02:00:00Z", home: "England", away: "Croatia", group: "L", city: "Arlington", status: "NS" },
  { date: "2026-06-18T05:00:00Z", home: "Ghana", away: "Panama", group: "L", city: "Toronto", status: "NS" },
  // June 18
  { date: "2026-06-18T17:00:00Z", home: "Czechia", away: "South Africa", group: "A", city: "Atlanta", status: "NS" },
  { date: "2026-06-18T20:00:00Z", home: "Switzerland", away: "Bosnia-Herzegovina", group: "B", city: "Los Angeles", status: "NS" },
  { date: "2026-06-19T00:00:00Z", home: "Canada", away: "Qatar", group: "B", city: "Vancouver", status: "NS" },
  { date: "2026-06-19T03:00:00Z", home: "Mexico", away: "South Korea", group: "A", city: "Dallas", status: "NS" },
  // June 19
  { date: "2026-06-19T18:00:00Z", home: "Morocco", away: "Haiti", group: "C", city: "Houston", status: "NS" },
  { date: "2026-06-19T23:00:00Z", home: "Scotland", away: "Morocco", group: "C", city: "Boston", status: "NS" },
  { date: "2026-06-20T00:00:00Z", home: "Turkey", away: "USA", group: "D", city: "Philadelphia", status: "NS" },
  { date: "2026-06-20T03:00:00Z", home: "Paraguay", away: "Australia", group: "D", city: "Seattle", status: "NS" },
  // June 20
  { date: "2026-06-20T18:00:00Z", home: "Ecuador", away: "Germany", group: "E", city: "Miami", status: "NS" },
  { date: "2026-06-20T21:00:00Z", home: "Japan", away: "Sweden", group: "F", city: "New York", status: "NS" },
  { date: "2026-06-21T00:00:00Z", home: "Curacao", away: "Ivory Coast", group: "E", city: "Kansas City", status: "NS" },
  { date: "2026-06-21T03:00:00Z", home: "Tunisia", away: "Netherlands", group: "F", city: "Inglewood", status: "NS" },
  // June 21
  { date: "2026-06-21T17:00:00Z", home: "Spain", away: "Saudi Arabia", group: "H", city: "Atlanta", status: "NS" },
  { date: "2026-06-21T20:00:00Z", home: "New Zealand", away: "Belgium", group: "G", city: "Dallas", status: "NS" },
  { date: "2026-06-22T00:00:00Z", home: "Uruguay", away: "Cape Verde", group: "H", city: "Arlington", status: "NS" },
  { date: "2026-06-22T03:00:00Z", home: "Egypt", away: "Iran", group: "G", city: "Santa Clara", status: "NS" },
  // June 22
  { date: "2026-06-22T18:00:00Z", home: "Senegal", away: "Iraq", group: "I", city: "Los Angeles", status: "NS" },
  { date: "2026-06-22T21:00:00Z", home: "Norway", away: "France", group: "I", city: "Seattle", status: "NS" },
  { date: "2026-06-23T00:00:00Z", home: "Algeria", away: "Austria", group: "J", city: "Houston", status: "NS" },
  { date: "2026-06-23T03:00:00Z", home: "Jordan", away: "Argentina", group: "J", city: "Boston", status: "NS" },
  // June 23
  { date: "2026-06-23T20:00:00Z", home: "Colombia", away: "Portugal", group: "K", city: "Miami", status: "NS" },
  { date: "2026-06-24T00:00:00Z", home: "England", away: "Ghana", group: "L", city: "Boston", status: "NS" },
  { date: "2026-06-24T03:00:00Z", home: "Panama", away: "Croatia", group: "L", city: "Kansas City", status: "NS" },
  { date: "2026-06-24T03:00:00Z", home: "DR Congo", away: "Uzbekistan", group: "K", city: "Atlanta", status: "NS" },
  // June 24 matchday 3 — all same time per group
  { date: "2026-06-24T18:00:00Z", home: "South Africa", away: "Mexico", group: "A", city: "Arlington", status: "NS" },
  { date: "2026-06-24T18:00:00Z", home: "South Korea", away: "Czechia", group: "A", city: "Vancouver", status: "NS" },
  { date: "2026-06-24T21:00:00Z", home: "Morocco", away: "Scotland", group: "C", city: "Miami", status: "NS" },
  { date: "2026-06-24T21:00:00Z", home: "Brazil", away: "Haiti", group: "C", city: "Miami", status: "NS" },
  { date: "2026-06-25T00:00:00Z", home: "Bosnia-Herzegovina", away: "Canada", group: "B", city: "Dallas", status: "NS" },
  { date: "2026-06-25T00:00:00Z", home: "Switzerland", away: "Qatar", group: "B", city: "Houston", status: "NS" },
  { date: "2026-06-25T21:00:00Z", home: "Australia", away: "USA", group: "D", city: "New Jersey", status: "NS" },
  { date: "2026-06-25T21:00:00Z", home: "Paraguay", away: "Turkey", group: "D", city: "Philadelphia", status: "NS" },
  { date: "2026-06-26T00:00:00Z", home: "Germany", away: "Sweden", group: "E", city: "Boston", status: "NS" },
  { date: "2026-06-26T00:00:00Z", home: "Ecuador", away: "Curacao", group: "E", city: "Seattle", status: "NS" },
  { date: "2026-06-26T03:00:00Z", home: "Netherlands", away: "Ivory Coast", group: "F", city: "Kansas City", status: "NS" },
  { date: "2026-06-26T03:00:00Z", home: "Japan", away: "Tunisia", group: "F", city: "Dallas", status: "NS" },
  { date: "2026-06-26T18:00:00Z", home: "Belgium", away: "Iran", group: "G", city: "Los Angeles", status: "NS" },
  { date: "2026-06-26T18:00:00Z", home: "Egypt", away: "New Zealand", group: "G", city: "Inglewood", status: "NS" },
  { date: "2026-06-26T21:00:00Z", home: "Uruguay", away: "Spain", group: "H", city: "Arlington", status: "NS" },
  { date: "2026-06-26T21:00:00Z", home: "Cape Verde", away: "Saudi Arabia", group: "H", city: "Atlanta", status: "NS" },
  { date: "2026-06-27T00:00:00Z", home: "France", away: "Iraq", group: "I", city: "Houston", status: "NS" },
  { date: "2026-06-27T00:00:00Z", home: "Norway", away: "Senegal", group: "I", city: "Miami", status: "NS" },
  { date: "2026-06-27T03:00:00Z", home: "Argentina", away: "Austria", group: "J", city: "Santa Clara", status: "NS" },
  { date: "2026-06-27T03:00:00Z", home: "Jordan", away: "Algeria", group: "J", city: "Vancouver", status: "NS" },
  { date: "2026-06-27T22:30:00Z", home: "Portugal", away: "Uzbekistan", group: "K", city: "Kansas City", status: "NS" },
  { date: "2026-06-27T22:30:00Z", home: "Colombia", away: "DR Congo", group: "K", city: "Atlanta", status: "NS" },
  { date: "2026-06-28T01:00:00Z", home: "England", away: "Panama", group: "L", city: "New Jersey", status: "NS" },
  { date: "2026-06-28T01:00:00Z", home: "Croatia", away: "Ghana", group: "L", city: "Toronto", status: "NS" },
];

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };

  // Get manual eliminations from blob store
  let manualElim = [];
  try {
    const cache = getBlobStore("live-cache");
    const overrides = await cache.get("manual-eliminated", { type: "json" }).catch(() => null);
    manualElim = overrides?.teams || [];
  } catch (_) {}

  // Determine match statuses based on current time
  const now = Date.now();
  const matches = GROUP_FIXTURES.map(f => {
    const kickoff = new Date(f.date).getTime();
    const elapsed = now - kickoff;
    let status = "NS";
    let homeGoals = null;
    let awayGoals = null;
    if (elapsed > 0 && elapsed < 2 * 60 * 60 * 1000) {
      status = "LIVE";
    } else if (elapsed >= 2 * 60 * 60 * 1000) {
      status = "FT";
    }
    return {
      date: f.date,
      homeTeam: f.home,
      awayTeam: f.away,
      homeGoals,
      awayGoals,
      status,
      round: `Group ${f.group}`,
      city: f.city,
    };
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ matches, eliminated: manualElim, status: "hardcoded" }),
  };
};
