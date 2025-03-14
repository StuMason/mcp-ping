# MCP Ping Server

A simple server implementing the Model Context Protocol (MCP) over Server-Sent Events (SSE), providing a basic "ping" tool that responds with "pong".

## Overview

This project demonstrates a minimal implementation of an MCP server using SSE for communication. It's built with Node.js and Express, and can be deployed as a standalone service or using Docker.

The server implements:

- A simple "ping" tool that responds with "pong"
- SSE-based communication for real-time server-to-client messaging
- HTTP POST endpoint for client-to-server communication
- Health check endpoint for monitoring

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/mcp-ping.git
cd mcp-ping
npm install
```

## Usage

### Running Locally

Start the server with:

```bash
npm start
```

The server will be available at http://localhost:3001.

### Docker Deployment

Build and run using Docker:

```bash
docker build -t mcp-ping .
docker run -p 3001:3001 mcp-ping
```

Or use Docker Compose:

```bash
docker-compose up
```

## API Endpoints

- `GET /sse`: Establishes an SSE connection for server-to-client communication
- `POST /messages`: Receives messages from clients
- `GET /health`: Health check endpoint that returns "OK" if the server is running

## MCP Tools

### ping

A simple tool that responds with "pong" when called.

**Parameters**: None

**Response**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "pong"
    }
  ]
}
```

## Environment Variables

- `PORT`: The port on which the server will listen (default: 3001)

## Deployment

### Docker Compose

The included Docker Compose configuration is set up for deployment with Traefik as a reverse proxy, with automatic HTTPS certificate generation via Let's Encrypt.

### Deploying to Coolify

[Coolify](https://coolify.io/) is a self-hosted PaaS that makes it easy to deploy applications. This MCP server can be deployed to Coolify with the following steps:

1. **Prepare your repository**:
   - Make sure your repository includes the `server.js`, `package.json`, and `Dockerfile`
   - Push your code to a Git repository (GitHub, GitLab, etc.)

2. **Create a new service in Coolify**:
   - Create a new resource and select "Application" 
   - Choose your Git provider and select your repository
   - Set the build method to "Dockerfile"
   - Configure a domain name (e.g., `mcp-ping.example.com`)

3. **Configure Advanced Settings**:
   - In the advanced settings, find "Enable Gzip Compression" and make sure it is **DISABLED**
   - This is critical for SSE to work properly with MCP

4. **Deploy the application**:
   - Finish the configuration and deploy
   - Once deployed, you should be able to access the health check at `https://your-domain.com/health`

5. **Testing with MCP Inspector**:
   - Use the MCP Inspector to test your server:
   ```bash
   npx @modelcontextprotocol/inspector --sse-url https://your-domain.com/sse
   ```

#### Important Note About Proxies and SSE

MCP servers use Server-Sent Events (SSE) for real-time communication, which can be problematic with reverse proxies and CDNs like Cloudflare. If you encounter connection issues:

1. **Disable compression**: As mentioned above, compression must be disabled for SSE to work properly
2. **Cloudflare consideration**: If using Cloudflare in front of your Coolify instance, you may need to set the DNS record to "DNS Only" mode (gray cloud in Cloudflare) instead of proxied mode
3. **Timeout settings**: Ensure your proxy timeout settings are high enough for long-lived connections (at least 120 seconds)

## Development

This project uses:
- Express.js for the web server
- @modelcontextprotocol/sdk for MCP implementation
- Server-Sent Events (SSE) for real-time communication

## License

ISC