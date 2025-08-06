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
