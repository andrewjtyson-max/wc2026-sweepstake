const { getBlobStore } = require("./blob-store");

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };
  if (event.httpMethod !== "GET") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const store = getBlobStore("sweepstake-entries");
    const { blobs } = await store.list();
    const entries = await Promise.all(
      blobs.map(async ({ key }) => {
        const data = await store.get(key, { type: "json" });
        return { name: key, ...data };
      })
    );
    return { statusCode: 200, headers, body: JSON.stringify({ entries }) };
  } catch (err) {
    console.error("get-entries error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to load entries" }) };
  }
};
