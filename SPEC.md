# Duckie Productivity MCP Server Specification

This document outlines the design and implementation plan for a Duckie Productivity MCP server that provides rubber duck debugging, task management, focus timer functionality, **GitHub repository analysis**, and Spotify integration with a friendly duck personality.

The server will support AI-powered debugging conversations, task CRUD operations with duck-themed responses, focus timer sessions with motivational messages, **GitHub code analysis with AI insights**, and Spotify music control. All interactions will maintain a cheerful, encouraging duck persona.

The system will be built using Cloudflare Workers with Hono as the API framework, Cloudflare D1 for data persistence, and Cloudflare Workers AI for AI-powered debugging assistance.

## 1. Technology Stack
- **Edge Runtime:** Cloudflare Workers
- **API Framework:** Hono.js (TypeScript-based API framework)
- **Database:** Cloudflare D1 (serverless SQLite)
- **ORM:** Drizzle ORM for type-safe database operations
- **AI Integration:** Cloudflare Workers AI with Llama 3.1 8B for debugging assistance
- **GitHub Integration:** GitHub API for repository analysis
- **MCP Framework:** @modelcontextprotocol/sdk and @hono/mcp
- **Music Integration:** Spotify Web API

## 2. Database Schema Design
The database will store user tasks, debugging sessions, focus timer sessions, and Spotify tokens to provide persistence across interactions.

### 2.1. Tasks Table
- id (INTEGER, Primary Key, Auto Increment)
- title (TEXT, Not Null)
- description (TEXT)
- status (TEXT, Default 'pending') // 'pending', 'in_progress', 'completed'
- priority (TEXT, Default 'medium') // 'low', 'medium', 'high'
- created_at (INTEGER, Not Null) // Unix timestamp
- updated_at (INTEGER, Not Null) // Unix timestamp
- due_date (INTEGER) // Unix timestamp, optional

### 2.2. Debug Sessions Table
- id (INTEGER, Primary Key, Auto Increment)
- session_id (TEXT, Not Null, Unique)
- title (TEXT, Not Null)
- problem_description (TEXT, Not Null)
- conversation_history (TEXT) // JSON string of messages
- created_at (INTEGER, Not Null)
- updated_at (INTEGER, Not Null)

### 2.3. Focus Sessions Table
- id (INTEGER, Primary Key, Auto Increment)
- session_id (TEXT, Not Null, Unique)
- duration_minutes (INTEGER, Not Null)
- status (TEXT, Default 'active') // 'active', 'paused', 'completed', 'cancelled'
- start_time (INTEGER, Not Null) // Unix timestamp
- end_time (INTEGER) // Unix timestamp, set when completed
- task_description (TEXT)
- created_at (INTEGER, Not Null)

### 2.4. Spotify User Tokens Table
- id (INTEGER, Primary Key, Auto Increment)
- user_id (TEXT, Not Null, Unique) // Spotify user ID
- access_token (TEXT, Not Null)
- refresh_token (TEXT, Not Null)
- expires_at (INTEGER, Not Null) // Unix timestamp
- scope (TEXT, Not Null) // Spotify permissions granted
- created_at (INTEGER, Not Null)
- updated_at (INTEGER, Not Null)

## 3. API Endpoints

### 3.1. MCP Server Endpoint
- **POST /mcp** - Main MCP server endpoint handling JSON-RPC requests
- Provides tools for: rubber duck debugging, task management, focus timer, **GitHub analysis**
- Returns duck-themed responses with encouraging personality

### 3.2. Task Management Endpoints
- **POST /api/tasks** - Create a new task with duck-themed confirmation
- **GET /api/tasks** - List all tasks with duck-themed status messages
- **PUT /api/tasks/:id** - Update task with encouraging duck response
- **DELETE /api/tasks/:id** - Delete task with supportive duck message

### 3.3. Rubber Duck Debugging Endpoints
- **POST /api/debug/sessions** - Start new debugging session with AI-powered duck responses
- **POST /api/debug/sessions/:sessionId/chat** - Continue debugging conversation with AI assistance
- **GET /api/debug/sessions/:sessionId** - Retrieve debugging session history

### 3.4. Focus Timer Endpoints
- **POST /api/focus/sessions** - Start focus timer with motivational duck message
- **PUT /api/focus/sessions/:sessionId/pause** - Pause focus session with encouraging message
- **PUT /api/focus/sessions/:sessionId/resume** - Resume focus session with motivational boost
- **PUT /api/focus/sessions/:sessionId/complete** - Complete focus session with celebratory duck response
- **GET /api/focus/sessions/:sessionId/status** - Get current timer status with time remaining

### 3.5. **GitHub Repository Analysis Endpoints (NEW!)**
- **POST /api/github/analyze** - Analyze GitHub repositories or specific files
  - **Parameters:** github_url, issue_description (optional), focus_files (optional)
  - **Returns:** AI-powered code analysis with duck personality
  - **Features:** 
    - Analyze entire repositories (finds common files automatically)
    - Analyze specific files via URL paths
    - Focus on specific files via focus_files parameter
    - AI insights with debugging suggestions

### 3.6. Spotify Music Control Endpoints
- **POST /api/spotify/auth** - Initiate Spotify OAuth flow for user authentication
- **POST /api/spotify/callback** - Handle Spotify OAuth callback and store tokens
- **GET /api/spotify/search** - Search for productivity playlists and focus music
- **POST /api/spotify/play** - Start playback with duck-themed confirmation
- **PUT /api/spotify/pause** - Pause current playback with encouraging message
- **PUT /api/spotify/resume** - Resume playback with motivational duck response
- **POST /api/spotify/skip** - Skip to next track with duck commentary
- **PUT /api/spotify/volume** - Adjust volume with duck-themed feedback
- **GET /api/spotify/current** - Get currently playing track with duck commentary

## 4. MCP Tools Implementation

### 4.1. rubber_duck_debug
- **Description:** Start or continue a rubber duck debugging session
- **Parameters:** problem_description, session_id (optional)
- **Returns:** AI-powered debugging suggestions with duck personality

### 4.2. manage_tasks
- **Description:** Create, update, list, or delete tasks
- **Parameters:** action, task_data, task_id (for updates/deletes)
- **Returns:** Task information with duck-themed responses

### 4.3. focus_timer
- **Description:** Start, pause, resume, or check focus timer sessions
- **Parameters:** action, duration_minutes, task_description
- **Returns:** Timer status with motivational duck messages

### 4.4. spotify_control
- **Description:** Control Spotify playback and get music recommendations
- **Parameters:** action, search_query, playlist_uri, volume_percent, mood
- **Returns:** Playback status and duck-themed music suggestions

### 4.5. **analyze_github_repo (NEW!)**
- **Description:** Analyze GitHub repositories or specific files for bugs and improvements
- **Parameters:** 
  - github_url (required) - Repository or file URL
  - issue_description (optional) - Specific issue context
  - focus_files (optional) - Array of specific file paths to analyze
- **Returns:** AI-powered code analysis with duck personality and debugging suggestions
- **Features:**
  - Supports repository URLs, file URLs, and specific file targeting
  - Uses Cloudflare Workers AI for intelligent code analysis
  - Provides step-by-step debugging advice with duck encouragement
  - Analyzes up to 3-5 files per request for performance

## 5. Integrations

### 5.1. Cloudflare Workers AI
- **Model:** Llama 3.1 8B for debugging assistance and code analysis
- **Features:** Duck personality prompts, code analysis, debugging suggestions

### 5.2. **GitHub API Integration (NEW!)**
- **GitHub Contents API** for fetching repository files
- **Base64 decoding** for file content processing
- **URL parsing** for repository, file, and path extraction
- **Rate limiting** and error handling for API requests

### 5.3. Spotify Web API
- **OAuth 2.0 flow** for secure authentication
- **Playback control** and playlist management
- **Token refresh** handling for long-term usage

### 5.4. MCP SDK
- **Standardized AI assistant integration**
- **Tool discovery** and execution
- **HTTP transport** handling

## 6. Duck Personality Implementation
All responses maintain a consistent duck personality:
- Use encouraging, supportive language
- Include duck-themed expressions ("Quack-tastic!", "Let's dive in!", "You've got this, fellow developer!")
- Provide gentle guidance and positive reinforcement
- Use water/pond metaphors when appropriate
- Maintain professionalism while being friendly and approachable

## 7. **GitHub Analysis Features (NEW!)**

### 7.1. Repository Analysis Modes
- **Auto-discovery:** Automatically finds and analyzes common files (package.json, src/index.js, etc.)
- **Specific file:** Analyze individual files via GitHub blob URLs
- **Focused analysis:** Target specific files using focus_files parameter

### 7.2. AI-Powered Insights
- **Bug detection:** Identifies potential issues and code smells
- **Performance suggestions:** Recommends optimizations
- **Best practices:** Suggests improvements following coding standards
- **Duck encouragement:** Maintains motivational tone throughout analysis

### 7.3. Supported File Types
- JavaScript/TypeScript files
- Package.json and configuration files
- README and documentation files
- Common web development files (React, Node.js, etc.)

## 8. Additional Notes
- All timestamps stored as Unix timestamps for consistency
- Session IDs generated using crypto.randomUUID()
- **GitHub API requests** include proper User-Agent headers
- **No GitHub authentication required** for public repositories
- Cloudflare Workers AI binding automatically available
- Spotify Client ID and Secret provided via environment bindings
- Implement proper error handling with duck-themed error messages
- Consider rate limiting for AI-powered debugging and GitHub analysis endpoints
- All database operations use Drizzle ORM for type safety
- **GitHub analysis limited to 3-5 files per request** for performance
- **Base64 decoding** handled for GitHub API responses

## 9. Further Reading
Took inspiration from the project template here: https://github.com/fiberplane/create-honc-app/tree/main/templates/d1
