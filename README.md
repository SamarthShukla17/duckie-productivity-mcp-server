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
