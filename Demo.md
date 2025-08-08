# 🦆 Duckie Productivity MCP Server - Demo

## 🚀 Live Server
- **URL:** https://66bc69efc66f844b6f89c379.fp.dev
- **MCP Endpoint:** https://66bc69efc66f844b6f89c379.fp.dev/mcp

## 🎯 Quick Test Commands

### Test Task Creation
```bash
curl -X POST https://66bc69efc66f844b6f89c379.fp.dev/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Duckie", "description": "Testing the duck!", "priority": "high"}'

### Test AI Debugging
curl -X POST https://66bc69efc66f844b6f89c379.fp.dev/api/debug/sessions \
  -H "Content-Type: application/json" \
  -d '{"title": "Demo Debug", "problem_description": "Testing AI debugging feature"}'

Test Focus Timer
curl -X POST https://66bc69efc66f844b6f89c379.fp.dev/api/focus/sessions \
  -H "Content-Type: application/json" \
  -d '{"duration_minutes": 25, "task_description": "Demo focus session"}'
🆕 Test GitHub Repository Analysis
# Analyze entire repository
curl -X POST https://66bc69efc66f844b6f89c379.fp.dev/api/github/analyze \
  -H "Content-Type: application/json" \
  -d '{"github_url": "https://github.com/facebook/react", "issue_description": "Looking for potential improvements"}'

# Analyze specific file
curl -X POST https://66bc69efc66f844b6f89c379.fp.dev/api/github/analyze \
  -H "Content-Type: application/json" \
  -d '{"github_url": "https://github.com/facebook/react/blob/main/package.json"}'

# Analyze specific files with focus
curl -X POST https://66bc69efc66f844b6f89c379.fp.dev/api/github/analyze \
  -H "Content-Type: application/json" \
  -d '{"github_url": "https://github.com/your-username/your-repo", "focus_files": ["src/index.js", "package.json"], "issue_description": "My app crashes on startup"}'
🦆 MCP Connection
Add this to your AI assistant:

{
  "url": "https://66bc69efc66f844b6f89c379.fp.dev/mcp",
  "name": "Duckie Productivity Server"
}
