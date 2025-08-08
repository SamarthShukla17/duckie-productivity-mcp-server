# 🦆 Duckie Productivity MCP Server

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Quack--tastic!-brightgreen)](https://66bc69efc66f844b6f89c379.fp.dev)  
[![GitHub](https://img.shields.io/badge/Source%20Code-GitHub-blue)](https://github.com/SamarthShukla17/duckie-productivity-mcp-server)  
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)  

> **"Quack-tastic! Let's dive in!"** – Your friendly, productivity-boosting duck.  
> Duckie Productivity MCP Server is a **comprehensive Model Context Protocol server** that blends AI-powered assistance with a fun duck personality. Whether you need **rubber duck debugging**, **task management**, **focus timers**, **Spotify music boosts**, or the brand-new **GitHub repository analysis**, Duckie’s got your back. **You've got this, fellow developer!**

---

## 🌟 Overview

**Live URL:** [https://66bc69efc66f844b6f89c379.fp.dev](https://66bc69efc66f844b6f89c379.fp.dev)  
**MCP Endpoint:** [https://66bc69efc66f844b6f89c379.fp.dev/mcp](https://66bc69efc66f844b6f89c379.fp.dev/mcp)  
**GitHub Repository:** [Duckie Productivity MCP Server](https://github.com/SamarthShukla17/duckie-productivity-mcp-server)  

---

## 🚀 Features

### 1. **AI-Powered Rubber Duck Debugging**
- Start AI-assisted debugging sessions
- Friendly duck personality with step-by-step explanations
- Maintains full conversation history

### 2. **Smart Task Management**
- Create, list, update, and delete tasks
- Priority levels: Low, Medium, High
- Status tracking & due dates

### 3. **Focus Timer Sessions**
- Pomodoro-style timers: Start, pause, resume, complete
- Productivity tracking & statistics

### 4. **Spotify Integration**
- OAuth authentication
- Search playlists & control playback
- Duck-curated music recommendations

### 5. **GitHub Repository Analysis** *(NEW!)*
- Analyze public repositories or specific files
- AI-powered bug detection, performance suggestions, and best practices
- Focus on specific files with `focus_files` parameter
- Duck personality preserved in analysis results
- Supports JavaScript, TypeScript, configs, and docs

---

## 🛠 Technology Stack

- **Runtime:** Cloudflare Workers (Edge Computing)
- **API Framework:** [Hono.js](https://hono.dev/) (TypeScript)
- **Database:** Cloudflare D1 (Serverless SQLite)
- **ORM:** Drizzle ORM (Type-safe database operations)
- **AI Integration:** Cloudflare Workers AI ([Llama 3.1 8B](https://developers.cloudflare.com/workers-ai/models/))
- **GitHub API:** Repository & file analysis
- **Music Integration:** Spotify Web API
- **MCP Framework:** `@modelcontextprotocol/sdk`

---

## 🧰 MCP Tools (11 total)

| Tool Name                  | Purpose |
|----------------------------|---------|
| `create_task`              | Create new task |
| `list_tasks`               | List all tasks |
| `update_task`              | Update task details |
| `delete_task`              | Remove a task |
| `start_debug_session`      | Begin AI-powered debugging |
| `resolve_debug_session`    | Mark debug session resolved |
| `start_focus_session`      | Start a focus timer |
| `complete_focus_session`   | End a focus timer |
| `get_focus_stats`          | Retrieve focus session stats |
| `spotify_auth_url`         | Authenticate Spotify |
| `analyze_github_repo` *(NEW)* | Analyze repositories or files |

---

## 📡 API Endpoints

**Core:**



/mcp (JSON-RPC)
/api/tasks (GET, POST, PUT, DELETE)
/api/debug/sessions
/api/focus/sessions

makefile
Copy
Edit

**Spotify:**
/api/spotify/auth
/api/spotify/callback
/api/spotify/search
/api/spotify/play
/api/spotify/pause

markdown
Copy
Edit

**GitHub (NEW!):**
/api/github/analyze

yaml
Copy
Edit

---

## 🐙 GitHub Analysis Features (NEW!)

- Analyze **entire repositories** (auto-discovers common files: `package.json`, `src/index.js`, etc.)
- Analyze **specific files** via GitHub URLs
- Limit scope with `focus_files` parameter
- AI-driven code quality review with:
  - Bug detection
  - Performance improvements
  - Best practices
- Works without authentication for **public repositories**

---

## 🗄 Database Schema

**`tasks`**
id, title, description, status, priority, created_at, updated_at, due_date

go
Copy
Edit

**`debug_sessions`**
id, session_id, title, problem_description, conversation_history, timestamps

go
Copy
Edit

**`focus_sessions`**
id, session_id, duration_minutes, status, start_time, end_time, task_description

go
Copy
Edit

**`spotify_tokens`**
id, user_id, access_token, refresh_token, expires_at, scope, timestamps

yaml
Copy
Edit

---

## 🔑 Environment Variables

SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
SPOTIFY_REDIRECT_URI

yaml
Copy
Edit
> Cloudflare Workers AI is available automatically via `c.env.AI`.

---

## 🏆 Built For

**Vibe Summer Challenge** – showcasing **Cloudflare Workers**, **D1**, **Workers AI**, modern architecture, and **GitHub API integration** in a playful yet productive concept.

---

## 💻 Usage Examples

### MCP Usage:
- `"Analyze this GitHub repository: https://github.com/facebook/react"`
- `"Check this file for bugs: https://github.com/user/repo/blob/main/src/app.js"`
- `"Create a high-priority task to fix login bug"`
- `"Start a 25-minute focus session for coding"`
- `"Help me debug why my API returns 500 errors"`

### API Usage:

#### GitHub Analysis
```bash
curl -X POST https://66bc69efc66f844b6f89c379.fp.dev/api/github/analyze \
  -H "Content-Type: application/json" \
  -d '{"github_url": "https://github.com/user/repo", "issue_description": "App crashes on startup"}'
Task Creation
bash
Copy
Edit
curl -X POST https://66bc69efc66f844b6f89c379.fp.dev/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Fix bug", "priority": "high"}'
📜 License
This project is licensed under the MIT License.
See the LICENSE file for more details.

🦆 Duckie says: "Stay productive, keep quacking, and remember – the best code is written with a smile!"
