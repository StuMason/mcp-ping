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

// Store active transports
let activeTransport = null;

// Enhanced CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// SSE endpoint for server-to-client communication
app.get("/sse", (req, res) => {
  console.log("SSE connection attempt");
  
  // Create transport
  const transport = new SSEServerTransport("/messages", res);
  activeTransport = transport;
  
  // Connect server to transport
  server.connect(transport);
  console.log("SSE connection established");
  
  // Handle connection close
  req.on('close', () => {
    console.log("SSE connection closed");
    if (activeTransport === transport) {
      activeTransport = null;
    }
  });
});

// Message endpoint for client-to-server communication
app.post("/messages", (req, res) => {
  if (!activeTransport) {
    return res.status(503).send("SSE connection not established");
  }
  
  console.log("Received message from client");
  try {
    activeTransport.handlePostMessage(req, res);
  } catch (error) {
    console.error(`Error handling message: ${error.message}`);
    res.status(500).send(error.message);
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