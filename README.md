# Qwen3 Chat

A Next.js chat interface for interacting with multiple AI models, including Qwen3, Grok 4.5, and Kimi K3. It provides chat session management, custom API endpoint configuration, and rich message formatting with Markdown and code blocks.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)

## Features

- **Multi-Model Support**: Switch between Qwen3, Grok 4.5-Free (via ZenMux API), and Kimi K3 (via TokenRouter API).
- **Session Management**: Create new chat sessions, select previous conversations, and delete sessions. Session data is persisted locally in `localStorage`.
- **Markdown & Code Rendering**: Parses inline code, bold, italics, blockquotes, ordered/unordered lists, headings, and code blocks with dedicated syntax styling and code copying capabilities.
- **Server-Side API Proxy**: Handles API requests via Next.js route handlers (`/api/chat`) to conceal credentials and bypass client CORS restrictions.
- **Custom Configuration**: Save custom API endpoints and authorization tokens directly through the UI settings modal.

## Requirements

- **Node.js**: Version 20.x or higher recommended.
- **npm**: Package manager for dependency resolution and script execution.

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

## Configuration

Configure environment variables in a `.env` file at the root of the project to set server defaults for downstream model APIs:

```env
QWEN_API_ENDPOINT=https://daisy-stubborn-proving.ngrok-free.dev/chat
QWEN_AUTH_TOKEN=sk-garv-9f8x7q2m4k1p
ZENMUX_API_KEY=your_zenmux_api_key
TOKENROUTER_API_KEY=your_tokenrouter_api_key
```

### In-App Settings

You can also override the API Endpoint URL and Authorization Token dynamically in the browser:
1. Open the sidebar in the application.
2. Click **API settings**.
3. Input your **Endpoint URL** and **Authorization Token**.
4. Click **Save changes**. Values persist in browser `localStorage`.

## Usage

### Development

Run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build and Production

Create an optimized production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

### Linting

Run ESLint to check for code issues:

```bash
npm run lint
```

## API Reference

### POST `/api/chat`

Proxies incoming messages to the selected model API provider.

#### Request Body

```json
{
  "message": "Explain quantum computing in simple terms.",
  "model": "qwen",
  "apiEndpoint": "https://custom-endpoint.example.com/chat",
  "authToken": "custom-auth-token"
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `message` | `string` | Yes | User input message text. |
| `model` | `string` | No | Model provider: `"qwen"` (default), `"grok"`, or `"kimi"`. |
| `apiEndpoint` | `string` | No | Overrides `QWEN_API_ENDPOINT` when using model `"qwen"`. |
| `authToken` | `string` | No | Overrides environment API keys (`ZENMUX_API_KEY`, `TOKENROUTER_API_KEY`, or `QWEN_AUTH_TOKEN`). |

#### Responses

- **`200 OK`**: Returns the model answer.
  ```json
  {
    "response": "Quantum computing is a type of computation..."
  }
  ```
- **`400 Bad Request`**: Missing message or missing API credentials for requested model.
  ```json
  {
    "error": "Message is required"
  }
  ```
- **`500 Internal Server Error`**: Upstream API connection failures or unhandled exceptions.

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts       # Proxy route handler for Qwen, Grok, and Kimi APIs
│   │   ├── globals.css            # Global CSS styles and custom variable themes
│   │   ├── layout.tsx             # Root application layout and font setup
│   │   └── page.tsx               # Main application container managing state & local storage
│   ├── components/
│   │   ├── chat-interface.tsx     # Chat messages viewport, input box, and markdown parser
│   │   ├── chat-sidebar.tsx       # Conversation sidebar list and API settings modal
│   │   └── ui/                    # Reusable UI primitives (Avatar, Button, Card, Input, ScrollArea)
│   └── lib/
│       └── utils.ts               # Utility function for Tailwind class merging
├── components.json                # UI component configuration
├── next.config.mjs                # Next.js configuration settings
├── postcss.config.js              # PostCSS plugin definitions
├── tailwind.config.js             # Tailwind CSS theme extension
└── tsconfig.json                  # TypeScript compiler settings
```