require("dotenv").config();
const axios = require("axios");

// Load API credentials from .env
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_ID = process.env.FILE_ID;

// API Base URL
const BASE_URL = `https://api.figma.com/v1/files/${FILE_ID}`;
const HEADERS = { "X-Figma-Token": FIGMA_TOKEN };

/**
 * Fetch all nodes from the Figma file.
 */
async function getFileNodes() {
    try {
        const response = await axios.get(BASE_URL, { headers: HEADERS });
        return response.data.document.children; // Return the main document nodes
    } catch (error) {
        console.error("❌ Error fetching file nodes:", error.response?.data || error.message);
        return [];
    }
}

/**
 * Extract component sets from the file.
 */
async function getComponentSets() {
    const nodes = await getFileNodes();
    const componentSets = [];

    function findComponentSets(items) {
        for (const item of items) {
            if (item.type === "COMPONENT_SET") {
                componentSets.push({ name: item.name, node_id: item.id });
            }
            if (item.children) {
                findComponentSets(item.children); // Recursively search deeper
            }
        }
    }

    findComponentSets(nodes);
    return componentSets;
}

/**
 * Main function to fetch and display component sets.
 */
async function main() {
    console.log("🔍 Fetching component sets from Figma...");

    const componentSets = await getComponentSets();

    if (componentSets.length === 0) {
        console.log("❌ No component sets found.");
        return;
    }

    console.log(`✅ Found ${componentSets.length} component sets:\n`);
    componentSets.forEach((comp) => console.log(`- ${comp.name} (Node ID: ${comp.node_id})`));
}

main();
