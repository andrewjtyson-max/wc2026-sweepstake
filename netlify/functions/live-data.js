const { getBlobStore } = require("./blob-store");

// API-Football: league 1 = FIFA World Cup, season 2026
const WC_LEAGUE_ID = 1;
const WC_SEASON = 2026;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };

  const apiKey = process.env.APIFOOTBALL_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ matches: [], eliminated: [], status: "no_api_key" }),
    };
  }

  // Check cache
  try {
    const cache = getBlobStore("live-cache");
    const cached = await cache.get("fixtures", { type: "json" }).catch(() => null);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return { statusCode: 200, headers, body: JSON.stringify(cached.data) };
    }
  } catch (_) {}

  try {
    // Fetch all fixtures for WC 2026
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${WC_LEAGUE_ID}&season=${WC_SEASON}`,
      {
        headers: {
          "x-apisports-key": apiKey,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      }
    );

    if (!res.ok) throw new Error(`API returned ${res.status}`);

    const json = await res.json();
    const fixtures = json.response || [];

    const matches = fixtures.map(f => ({
      id: f.fixture.id,
      date: f.fixture.date,
      venue: f.fixture.venue?.name || "",
      city: f.fixture.venue?.city || "",
      status: f.fixture.status.short,
      statusLong: f.fixture.status.long,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      homeGoals: f.goals.home,
      awayGoals: f.goals.away,
      round: f.league.round,
    }));

    // Get manual eliminated overrides
    let manualElim = [];
    try {
      const cache = getBlobStore("live-cache");
      const overrides = await cache.get("manual-eliminated", { type: "json" }).catch(() => null);
      manualElim = overrides?.teams || [];
    } catch (_) {}

    // Auto-detect knockout eliminations
    const autoElim = deriveEliminated(fixtures);
    const eliminated = [...new Set([...autoElim, ...manualElim])];

    const data = { matches, eliminated, fetchedAt: Date.now(), status: "live" };

    // Cache it
    try {
      const cache = getBlobStore("live-cache");
      await cache.setJSON("fixtures", { fetchedAt: Date.now(), data });
    } catch (_) {}

    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    console.error("live-data error:", err);

    // Return manual elim even on API error
    let manualElim = [];
    try {
      const cache = getBlobStore("live-cache");
      const overrides = await cache.get("manual-eliminated", { type: "json" }).catch(() => null);
      manualElim = overrides?.teams || [];
    } catch (_) {}

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ matches: [], eliminated: manualElim, status: "api_error", error: err.message }),
    };
  }
};

function deriveEliminated(fixtures) {
  const eliminated = new Set();
  for (const f of fixtures) {
    const status = f.fixture.status.short;
    const round = (f.league.round || "").toLowerCase();
    const isKnockout = round.includes("round of") || round.includes("quarter") || round.includes("semi") || round.includes("final");
    const isFinished = status === "FT" || status === "AET" || status === "PEN";
    if (!isKnockout || !isFinished) continue;
    const homeGoals = f.goals.home ?? 0;
    const awayGoals = f.goals.away ?? 0;
    if (homeGoals > awayGoals) eliminated.add(f.teams.away.name);
    else if (awayGoals > homeGoals) eliminated.add(f.teams.home.name);
  }
  return Array.from(eliminated);
}
