const { getStore } = require("@netlify/blobs");

const AIRTABLE_BASE_ID = "appeFHMf1LvoL2r47";
const AIRTABLE_TABLE_ID = "tbll0B2E8WBZfj5Nm";

async function deleteFromAirtable(name) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) return;

  // Search for the record by name first
  const searchRes = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=LOWER({Name})="${name.toLowerCase()}"`,
    { headers: { "Authorization": `Bearer ${apiKey}` } }
  );
  const searchData = await searchRes.json();
  const records = searchData.records || [];
  if (!records.length) return;

  // Delete each matching record
  await Promise.all(records.map(record =>
    fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${record.id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${apiKey}` },
    })
  ));
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
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { name, token } = body;

  // Verify admin token
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken || token !== adminToken) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  if (!name) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Name is required" }) };
  }

  const store = getStore("sweepstake-entries");

  // Find the exact key (case-insensitive)
  const { blobs } = await store.list();
  const match = blobs.find(b => b.key.toLowerCase() === name.toLowerCase());
  if (!match) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: "Entry not found" }) };
  }

  await store.delete(match.key);

  // Delete from Airtable — non-blocking
  deleteFromAirtable(match.key).catch(err => console.error("Airtable delete failed:", err));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, deleted: match.key }),
  };
};
