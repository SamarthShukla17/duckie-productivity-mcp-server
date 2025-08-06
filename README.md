# 🐤 Duckie Productivity MCP Server 🚀

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![MCP Compliant](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-purple)](https://modelcontext.org/)
[![Built for Hackathons](https://img.shields.io/badge/Hackathon-Vibe%20Summer%20Challenge-brightgreen)](https://developers.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> 🦆 *"Quack-tastic productivity, right from the edge!"*

A **Model Context Protocol (MCP) Server** like no other — the **Duckie Productivity Server** combines rubber duck debugging 🐤, smart task tracking 📋, focus session timers ⏱️, and Spotify-powered vibes 🎧, all infused with a cheerful duck personality to lift your spirits and keep your code flowing.

**🌐 Live URL:** [https://66bc69efc66f844b6f89c379.fp.dev](https://66bc69efc66f844b6f89c379.fp.dev)  
**🔗 MCP Endpoint:** [`/mcp`](https://66bc69efc66f844b6f89c379.fp.dev/mcp)

---

## ✨ Features

### 🧠 AI-Powered Rubber Duck Debugging
> "Let's dive into this bug together, quack-quack!"  
Start a debug session, describe your problem, and let our friendly duck AI (powered by Llama 3.1 via Workers AI) walk you through it — step by step, with delightful quacks of encouragement.

### ✅ Smart Task Management
> "You’ve got tasks? Let’s line ‘em up like little ducklings!"  
Create, view, update, and delete tasks with priority, status, and due dates. Duckie remembers everything — and helps you stay organized.

### ⏳ Focus Timer Sessions (Pomodoro Style)
> "Let’s go full quack-mode for 25 minutes!"  
Start/resume/pause timers, track focus stats, and boost productivity with Pomodoro-style flows — with Duckie cheering you on all the way!

### 🎶 Spotify Integration
> "Every great dev deserves a banger playlist. Let’s quack up the volume!"  
Authenticate with Spotify, search and play tracks, pause/resume, and get duck-curated jams to keep the vibes immaculate.

---

## 🚀 Quick Start Guide (for MCP Clients)

Connect your AI assistant to the MCP endpoint:

```ts
const mcp = createMCPAgent({
  endpoint: "https://66bc69efc66f844b6f89c379.fp.dev/mcp",
});


Available tools include:

create_task, list_tasks, update_task, delete_task

start_debug_session, resolve_debug_session

start_focus_session, complete_focus_session, get_focus_stats

spotify_auth_url

🧪 Ready to power up your assistant with full-stack productivity? Quack yeah.

📡 API Usage Examples
# 🐥 List all tasks
curl https://66bc69efc66f844b6f89c379.fp.dev/api/tasks

# 🐥 Create a task
curl -X POST https://66bc69efc66f844b6f89c379.fp.dev/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Fix login bug", "priority":"high", "status":"todo"}'

# 🐥 Start a debug session
curl -X POST https://66bc69efc66f844b6f89c379.fp.dev/api/debug/sessions \
  -H "Content-Type: application/json" \
  -d '{"title":"API Error", "problem_description":"Getting 500 when submitting form"}'

# 🐥 Start a focus session
curl -X POST https://66bc69efc66f844b6f89c379.fp.dev/api/focus/sessions \
  -H "Content-Type: application/json" \
  -d '{"duration_minutes":25, "task_description":"Work on UI"}'


📘 API Documentation
Endpoint	Method	Description
/mcp	POST	Main MCP JSON-RPC endpoint
/api/tasks	GET/POST/PUT/DELETE	Task CRUD operations
/api/debug/sessions	POST, PUT	Create or resolve debug sessions
/api/focus/sessions	POST, PUT	Manage focus timers
/api/spotify/auth	GET	Start Spotify OAuth
/api/spotify/callback	GET	OAuth redirect handler
/api/spotify/search	GET	Search for tracks/playlists
/api/spotify/play	POST	Start playback
/api/spotify/pause	POST	Pause playback

🧱 Database Schema (D1)
sql
Copy
Edit
-- tasks
id INTEGER PRIMARY KEY AUTOINCREMENT
title TEXT NOT NULL
description TEXT
status TEXT CHECK(status IN ('todo','in_progress','done'))
priority TEXT CHECK(priority IN ('low','medium','high'))
due_date DATETIME
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME

-- debug_sessions
id INTEGER PRIMARY KEY AUTOINCREMENT
session_id TEXT UNIQUE
title TEXT
problem_description TEXT
conversation_history TEXT
created_at DATETIME
updated_at DATETIME

-- focus_sessions
id INTEGER PRIMARY KEY AUTOINCREMENT
session_id TEXT
duration_minutes INTEGER
status TEXT CHECK(status IN ('active','completed'))
start_time DATETIME
end_time DATETIME
task_description TEXT

-- spotify_tokens
id INTEGER PRIMARY KEY AUTOINCREMENT
user_id TEXT
access_token TEXT
refresh_token TEXT
expires_at DATETIME
scope TEXT
created_at DATETIME
updated_at DATETIME
🛠️ Development Setup
bash
Copy
Edit
# 1. Clone the repo
git clone https://github.com/your-username/duckie-productivity-mcp-server
cd duckie-productivity-mcp-server

# 2. Install dependencies
npm install

# 3. Set environment variables (in .env)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=https://yourdomain.dev/api/spotify/callback

# 4. Start local dev (via Miniflare)
npm run dev
🐣 Cloudflare D1 and Workers AI are automatically available via c.env.

🦆 Duck Personality: What Makes Duckie Special?
Every interaction with Duckie is:

🧡 Encouraging — "You’ve got this, fellow developer!"

🐣 Friendly — "Hey hey! Ready to quack some bugs?"

🌈 Motivational — "Let’s paddle through this one line at a time."

Even when you're stuck, Duckie keeps your spirits up with humor, heart, and high-fives (er, wing-flaps). Expect a cheerful tone in AI responses, error messages, and even loading states!

🏆 Built For: Vibe Summer Challenge
This project showcases the power of Cloudflare’s edge ecosystem:

⚡ Cloudflare Workers for blazing-fast APIs

🧠 Workers AI for serverless intelligence (Llama 3.1, 8B)

🗃️ Cloudflare D1 for relational data at the edge

🎵 Real-time Spotify integration

🧩 Model Context Protocol (MCP) for tooling assistants

It’s a productivity stack — with personality.

🤝 Acknowledgments
🧑‍💻 @modelcontextprotocol/sdk

☁️ Cloudflare Workers + D1 + Workers AI

🧠 Meta’s Llama 3.1 via Workers AI

🎵 Spotify Web API

🛠️ Hono.js + Drizzle ORM

📄 License
This project is licensed under the MIT License. See LICENSE for details.

🐥 Built with feathers, code, and lots of quacking love. Dive into productivity with Duckie — your new favorite AI rubber duck!
