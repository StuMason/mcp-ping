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

// Enhanced CORS setup for SSE
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// SSE endpoint for server-to-client communication
app.get("/sse", (req, res) => {
  console.log("SSE connection attempt from:", req.headers.origin || 'unknown origin');
  
  // Set essential SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // For Nginx specifically
  
  // Disable compression for SSE
  res.setHeader('Content-Encoding', 'identity');
  
  // Keep the connection alive
  res.flushHeaders();
  
  // Send a comment to keep the connection open
  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
    // Force flush data to the client
    res.flush && res.flush();
  }, 30000);
  
  // Create transport
  transport = new SSEServerTransport("/messages", res);
  
  try {
    server.connect(transport);
    console.log("SSE connection established successfully");
  } catch (error) {
    console.error("Error connecting to transport:", error);
  }
  
  