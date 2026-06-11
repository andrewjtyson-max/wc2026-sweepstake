// Helper to get a Blobs store with explicit credentials
const { getStore } = require("@netlify/blobs");

function getBlobStore(name) {
  return getStore({
    name,
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_TOKEN,
  });
}

module.exports = { getBlobStore };
