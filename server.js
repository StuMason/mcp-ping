import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import cors from "cors";

// Create the simplest MCP server
const server = new McpServer({
  name: "ping-server",
  version: "1.0.0"
});

// Add a simple ping tool
server.tool(
  "ping",
  {},  // No parameters needed
  async () => ({
    content: [{ type: "text", text: "pong" }]
  })
);

// Set up Express with SSE transport
const app = express();
const port = process.env.PORT || 3001;
let transport;

// Enable CORS for all routes
app.use(cors({
  origin: '*'
}));

// SSE endpoint for server-to-client communication
app.get("/sse", (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  server.connect(transport);
  console.log("SSE connection established");
});

// Message endpoint for client-to-server communication
app.post("/messages", (req, res) => {
  if (transport) {
    console.log("Received message from client");
    transport.handlePostMessage(req, res);
  } else {
    res.status(503).send("Transport not ready");
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Start the server
app.listen(port, () => {
  console.log(`Ping server running at http://localhost:${port}`);
});