const { getBlobStore } = require("./blob-store");
const { TEAMS } = require("./teams-data");

const AIRTABLE_BASE_ID = "appeFHMf1LvoL2r47";
const AIRTABLE_TABLE_ID = "tbll0B2E8WBZfj5Nm";

function pickFromTier(tier, takenTeams) {
  const pool = TEAMS.filter(t => t.tier === tier && !takenTeams.includes(t.name));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)].name;
}

function pickWithFallback(preferredTier, takenTeams) {
  // Try preferred tier first, then fall back up through tiers
  for (let tier = preferredTier; tier >= 1; tier--) {
    const pick = pickFromTier(tier, takenTeams);
    if (pick) return { team: pick, tier };
  }
  // If all higher tiers exhausted, try lower tiers
  for (let tier = preferredTier + 1; tier <= 3; tier++) {
    const pick = pickFromTier(tier, takenTeams);
    if (pick) return { team: pick, tier };
  }
  throw new Error("No teams left at all — sweepstake is full.");
}

async function writeToAirtable(name, teams) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) return;
  const today = new Date().toISOString().split("T")[0];
  await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        "Name": name,
        "Top tier team": teams[0],
        "Mid tier team": teams[1],
        "Lower tier team": teams[2],
        "Status": "Still in",
        "Date entered": today,
      },
    }),
  });
}

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const rawName = (body.name || "").trim();
  if (!rawName || rawName.length > 40) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Name is required and must be under 40 characters" }) };
  }

  const store = getBlobStore("sweepstake-entries");
  const { blobs } = await store.list();

  // Check for duplicate name
  const existing = blobs.find(b => b.key.toLowerCase() === rawName.toLowerCase());
  if (existing) {
    return { statusCode: 409, headers, body: JSON.stringify({ error: `${existing.key} has already entered` }) };
  }

  // Load all existing entries to find already-taken teams
  const allEntries = await Promise.all(
    blobs.map(async ({ key }) => store.get(key, { type: "json" }))
  );
  const takenTeams = allEntries.flatMap(e => e?.teams || []);

  // Pick three teams — one per tier with fallback if a tier is exhausted
  let teams;
  try {
    const pick1 = pickWithFallback(1, takenTeams);
    takenTeams.push(pick1.team);

    const pick2 = pickWithFallback(2, takenTeams);
    takenTeams.push(pick2.team);

    const pick3 = pickWithFallback(3, takenTeams);
    takenTeams.push(pick3.team);

    teams = [pick1.team, pick2.team, pick3.team];
  } catch (err) {
    return { statusCode: 409, headers, body: JSON.stringify({ error: err.message }) };
  }

  const entry = { teams, enteredAt: new Date().toISOString() };
  await store.setJSON(rawName, entry);

  writeToAirtable(rawName, teams).catch(err => console.error("Airtable write failed:", err));

  return { statusCode: 200, headers, body: JSON.stringify({ name: rawName, teams }) };
};
