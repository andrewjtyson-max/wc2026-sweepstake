const { getStore } = require("@netlify/blobs");

const WC_2026_ID = 1; // API-Football league ID for 2026 World Cup
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

  // Check cache first
  try {
    const cache = getStore("live-cache");
    const cached = await cache.get("fixtures", { type: "json" }).catch(() => null);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return { statusCode: 200, headers, body: JSON.stringify(cached.data) };
    }
  } catch (_) {}

  // Fetch from API-Football
  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${WC_2026_ID}&season=2026`,
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

    // Build matches list — completed and upcoming
    const matches = fixtures.map(f => ({
      id: f.fixture.id,
      date: f.fixture.date,
      status: f.fixture.status.short, // FT, NS, LIVE, HT, etc.
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      homeGoals: f.goals.home,
      awayGoals: f.goals.away,
      round: f.league.round,
    }));

    // Determine eliminated teams from knockout stage losses
    // Group stage: teams that finish bottom 2 of group and don't qualify
    // For simplicity: track teams that have played knockout matches and lost
    const eliminated = deriveEliminated(fixtures);

    const data = { matches, eliminated, fetchedAt: Date.now(), status: "live" };

    // Cache result
    try {
      const cache = getStore("live-cache");
      await cache.setJSON("fixtures", { fetchedAt: Date.now(), data });
    } catch (_) {}

    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    console.error("live-data error:", err);
    // Return empty rather than error so UI still works
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ matches: [], eliminated: [], status: "api_error", error: err.message }),
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

    // In knockout, loser is eliminated
    if (homeGoals > awayGoals) {
      eliminated.add(f.teams.away.name);
    } else if (awayGoals > homeGoals) {
      eliminated.add(f.teams.home.name);
    }
    // AET/PEN handled by goals including extra time
  }

  return Array.from(eliminated);
}
