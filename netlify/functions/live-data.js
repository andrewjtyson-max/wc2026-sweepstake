const { getBlobStore } = require("./blob-store");

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
    return { statusCode: 200, headers, body: JSON.stringify({ matches: [], eliminated: [], status: "no_api_key" }) };
  }

  const bustCache = (event.queryStringParameters || {}).bust === "1";

  if (bustCache) {
    try {
      const cache = getBlobStore("live-cache");
      await cache.delete("fixtures").catch(() => {});
    } catch (_) {}
  } else {
    try {
      const cache = getBlobStore("live-cache");
      const cached = await cache.get("fixtures", { type: "json" }).catch(() => null);
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return { statusCode: 200, headers, body: JSON.stringify(cached.data) };
      }
    } catch (_) {}
  }

  // Get manual eliminations
  let manualElim = [];
  try {
    const cache = getBlobStore("live-cache");
    const overrides = await cache.get("manual-eliminated", { type: "json" }).catch(() => null);
    manualElim = overrides?.teams || [];
  } catch (_) {}

  try {
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
    console.log(`API: results=${json.results}, fixtures=${json.response?.length || 0}, errors=${JSON.stringify(json.errors)}`);

    const fixtures = json.response || [];

    const matches = fixtures.map(f => ({
      id: f.fixture.id,
      date: f.fixture.date,
      venue: f.fixture.venue?.name || "",
      city: f.fixture.venue?.city || "",
      status: f.fixture.status.short,
      statusLong: f.fixture.status.long,
      elapsed: f.fixture.status.elapsed,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      homeGoals: f.goals.home,
      awayGoals: f.goals.away,
      round: f.league.round,
    }));

    const autoElim = deriveEliminated(fixtures);
    const eliminated = [...new Set([...autoElim, ...manualElim])];

    const data = {
      matches,
      eliminated,
      fetchedAt: Date.now(),
      status: matches.length > 0 ? "live" : "no_fixtures",
    };

    // Cache result
    try {
      const cache = getBlobStore("live-cache");
      await cache.setJSON("fixtures", { fetchedAt: Date.now(), data });
    } catch (_) {}

    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (err) {
    console.error("live-data error:", err.message);
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
