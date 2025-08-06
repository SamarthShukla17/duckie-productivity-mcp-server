# Duckie Productivity MCP Server Specification

This document outlines the design and implementation plan for a comprehensive productivity MCP server with a delightful duck personality. The server provides rubber duck debugging with AI assistance, task management, focus timer functionality, and Spotify integration for enhanced productivity.

The system will support AI-powered debugging sessions, CRUD task management, focus timers with motivational messages, and Spotify music control - all delivered with encouraging duck-themed responses and personality.

The system will be built using Cloudflare Workers with Hono as the API framework, Cloudflare D1 for data persistence, Drizzle ORM for database operations, Cloudflare Workers AI for AI assistance, and Spotify Web API for music integration.

## 1. Technology Stack

- **Edge Runtime:** Cloudflare Workers
- **API Framework:** Hono.js (TypeScript-based API framework)
- **Database:** Cloudflare D1 (serverless SQLite)
- **ORM:** Drizzle ORM for type-safe database operations
- **AI Integration:** Cloudflare Workers AI (Llama 3.1 8B for debugging assistance)
- **Music Integration:** Spotify Web API
- **MCP Framework:** @modelcontextprotocol/sdk and @hono/mcp

## 2. Database Schema Design

The database will store user tasks, debugging sessions, focus sessions, and Spotify authentication tokens to provide comprehensive productivity tracking and personalized experiences.

### 2.1. Tasks Table

- id (INTEGER, Primary Key, Auto Increment)
- title (TEXT, Not Null)
- description (TEXT)
- status (TEXT, Default: 'pending') - Values: 'pending', 'in_progress', 'completed'
- priority (TEXT, Default: 'medium') - Values: 'low', 'medium', 'high'
- due_date (TEXT) - ISO date string
- created_at (TEXT, Default: CURRENT_TIMESTAMP)
- updated_at (TEXT, Default: CURRENT_TIMESTAMP)

### 2.2. Debug Sessions Table

- id (INTEGER, Primary Key, Auto Increment)
- problem_description (TEXT, Not Null)
- ai_response (TEXT)
- status (TEXT, Default: 'active') - Values: 'active', 'resolved'
- created_at (TEXT, Default: CURRENT_TIMESTAMP)
- updated_at (TEXT, Default: CURRENT_TIMESTAMP)

### 2.3. Focus Sessions Table

- id (INTEGER, Primary Key, Auto Increment)
- duration_minutes (INTEGER, Not Null)
- task_description (TEXT)
- completed (BOOLEAN, Default: false)
- started_at (TEXT, Default: CURRENT_TIMESTAMP)
- completed_at (TEXT)

### 2.4. Spotify Tokens Table

- id (INTEGER, Primary Key, Auto Increment)
- user_id (TEXT, Not Null, Unique)
- access_token (TEXT, Not Null)
- refresh_token (TEXT, Not Null)
- expires_at (TEXT, Not Null)
- created_at (TEXT, Default: CURRENT_TIMESTAMP)
- updated_at (TEXT, Default: CURRENT_TIMESTAMP)

## 3. API Endpoints

The API will be structured into logical groups for task management, debugging assistance, focus sessions, and Spotify integration, with an MCP endpoint for tool communication.

### 3.1. MCP Server Endpoint

- **POST /mcp**
  - Description: Main MCP server endpoint handling JSON-RPC requests
  - Handles all MCP tool calls and resource requests
  - Uses StreamableHTTPTransport for direct Hono context handling

### 3.2. Task Management Endpoints

- **POST /api/tasks**
  - Description: Create a new task with duck-themed confirmation
  - Expected Payload:
    ```json
    {
      "title": "Complete project documentation",
      "description": "Write comprehensive docs",
      "priority": "high",
      "due_date": "2024-01-15"
    }
    ```

- **GET /api/tasks**
  - Description: Retrieve all tasks with duck personality responses
  - Query Params: status, priority, limit, offset

- **PUT /api/tasks/:id**
  - Description: Update existing task with encouraging duck messages
  - Expected Payload: Partial task object

- **DELETE /api/tasks/:id**
  - Description: Delete task with supportive duck farewell

### 3.3. Debug Session Endpoints

- **POST /api/debug**
  - Description: Start new debugging session with AI assistance
  - Expected Payload:
    ```json
    {
      "problem_description": "My React component won't re-render when state changes"
    }
    ```

- **GET /api/debug/:id**
  - Description: Retrieve debug session details with duck encouragement

- **PUT /api/debug/:id/resolve**
  - Description: Mark debug session as resolved with celebratory duck response

### 3.4. Focus Session Endpoints

- **POST /api/focus**
  - Description: Start new focus session with motivational duck message
  - Expected Payload:
    ```json
    {
      "duration_minutes": 25,
      "task_description": "Write API documentation"
    }
    ```

- **PUT /api/focus/:id/complete**
  - Description: Complete focus session with congratulatory duck response

- **GET /api/focus/stats**
  - Description: Get focus session statistics with encouraging duck insights

### 3.5. Spotify Integration Endpoints

- **GET /api/spotify/auth**
  - Description: Initiate Spotify OAuth flow with duck-themed instructions

- **POST /api/spotify/callback**
  - Description: Handle Spotify OAuth callback and store tokens

- **POST /api/spotify/play**
  - Description: Control Spotify playback with duck commentary
  - Expected Payload:
    ```json
    {
      "action": "play|pause|next|previous",
      "playlist_uri": "spotify:playlist:37i9dQZF1DX0XUsuxWHRQd"
    }
    ```

- **GET /api/spotify/playlists**
  - Description: Get user's playlists with duck recommendations

## 4. MCP Tools Implementation

The MCP server will expose the following tools with consistent duck personality:

### 4.1. Task Management Tools

- **create_task**: Create new tasks with duck encouragement
- **list_tasks**: List tasks with duck-themed status updates
- **update_task**: Update tasks with motivational duck messages
- **delete_task**: Delete tasks with supportive duck responses
- **get_task_stats**: Provide productivity insights with duck wisdom

### 4.2. Debugging Tools

- **start_debug_session**: Begin AI-powered debugging with duck support
- **get_debug_help**: Get AI assistance with encouraging duck commentary
- **resolve_debug_session**: Mark debugging complete with celebratory duck response

### 4.3. Focus Timer Tools

- **start_focus_session**: Begin focus timer with motivational duck messages
- **complete_focus_session**: End focus session with congratulatory duck response
- **get_focus_stats**: Provide focus insights with encouraging duck analysis

### 4.4. Spotify Integration Tools

- **spotify_auth**: Guide through Spotify authentication with duck instructions
- **control_spotify**: Control music playback with duck commentary
- **get_playlists**: Retrieve playlists with duck recommendations
- **create_focus_playlist**: Create productivity playlists with duck curation

## 5. Integrations

- **OpenAI API**: GPT-4.1 for intelligent debugging assistance and AI-powered problem solving
- **Spotify Web API**: Complete music control, playlist management, and user authentication
- **MCP Protocol**: Full implementation using @modelcontextprotocol/sdk for seamless tool integration

## 6. Duck Personality Guidelines

All responses must maintain a consistent, encouraging duck personality:

- Use duck-themed expressions: "Quack-tastic!", "Duck yeah!", "That's absolutely ducky!"
- Provide supportive, motivational language
- Include rubber duck debugging references
- Maintain professional helpfulness while being delightfully duck-themed
- Celebrate user achievements with enthusiastic duck responses
- Offer gentle encouragement during challenges

## 7. Environment Configuration

The application requires the following environment bindings:

- `OPENAI_API_KEY`: OpenAI API authentication
- `SPOTIFY_CLIENT_ID`: Spotify application client ID
- `SPOTIFY_CLIENT_SECRET`: Spotify application client secret
- `SPOTIFY_REDIRECT_URI`: OAuth callback URL
- `DB`: Cloudflare D1 database binding

## 8. Additional Notes

- All database operations should use Drizzle ORM for type safety
- Implement proper error handling with duck-themed error messages
- Include comprehensive logging for debugging and monitoring
- Ensure Spotify token refresh logic for long-term authentication
- Maintain consistent duck personality across all interactions
- Implement rate limiting for API endpoints to prevent abuse

## 9. Further Reading

Take inspiration from the project template here: https://github.com/fiberplane/create-honc-app/tree/main/templates/d1
