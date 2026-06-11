const { getStore } = require("@netlify/blobs");

// Simple token-based auth — set ADMIN_TOKEN env var in Netlify
exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };

  const adminToken = process.env.ADMIN_TOKEN;
  const authHeader = event.headers.authorization || "";
  if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const store = getStore("live-cache");

  if (event.httpMethod === "GET") {
    const overrides = await store.get("manual-eliminated", { type: "json" }).catch(() => ({ teams: [] }));
    return { statusCode: 200, headers, body: JSON.stringify(overrides) };
  }

  if (event.httpMethod === "POST") {
    let body;
    try { body = JSON.parse(event.body); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

    // Expecting { teams: ["Brazil", "France", ...] }
    if (!Array.isArray(body.teams)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Expected { teams: [] }" }) };
    }

    await store.setJSON("manual-eliminated", { teams: body.teams, updatedAt: new Date().toISOString() });

    // Bust fixture cache so next request picks up new data
    await store.delete("fixtures").catch(() => {});

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, teams: body.teams }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
};
