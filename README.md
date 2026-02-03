# KeyStream-Gemini

KeyStream-Gemini is a high-performance reverse proxy designed to optimize Google Gemini API usage through intelligent key rotation and real-time monitoring. It ensures high availability and bypasses rate limits by dynamically managing a pool of API keys.
<img width="2534" height="1299" alt="58b66edb-f990-45f2-b895-52d8953cac59" src="https://github.com/user-attachments/assets/b4262ecd-47b1-4357-9183-8eac19659c55" />

## Core Features

- **Dynamic Key Rotation**: Automatically cycles through API keys to maintain continuous service availability.
- **Real-time Observability**: Web-based dashboard featuring traffic metrics, key health status, and backend logs.
- **Model Synchronization**: Automated discovery and update of available Gemini models via Google API.
- **Native Streaming Support**: Optimized handling of Server-Sent Events (SSE) for fluid AI interactions.
- **OpenAI Compatibility**: Standardized interface for seamless integration with tools like Continue.dev.

## Installation

### Prerequisites

- Node.js 18 or higher
- bun
- Google Gemini API Keys

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/billtruong003/KeyStream-Gemini.git
   cd KeyStream-Gemini
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Start the server**

   ```bash
   bun dev
   ```

   The gateway will be accessible at `http://localhost:13337`.

## Integration

KeyStream-Gemini provides an OpenAI-compatible endpoint. To integrate with your AI tools, use the following configuration:

- **Base URL**: `http://localhost:13337/v1`
- **API Key**: `sk-keystream` (The proxy handles actual authentication)

### Example Configuration (Continue.dev)

```yaml
models:
  - name: "⚡ gemini-3-flash-preview"
    model: "gemini-3-flash-preview"
    provider: openai
    apiBase: "http://localhost:13337/v1"
    apiKey: "sk-local-proxy"
    contextLength: 128000
```
