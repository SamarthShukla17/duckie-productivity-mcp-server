import { createFiberplane, createOpenAPISpec } from "@fiberplane/hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, desc, and } from "drizzle-orm";
import { Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { z } from "zod";
import * as schema from "./db/schema";

type Bindings = {
  DB: D1Database;
  AI: Ai;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SPOTIFY_REDIRECT_URI: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Duck personality helper functions
const duckResponses = {
  success: ["Quack-tastic!", "Duck yeah!", "That's absolutely ducky!", "Rubber duck approved!", "Splendidly ducky!"],
  encouragement: ["You've got this, duckling!", "Keep paddling forward!", "Every duck has their day!", "Smooth sailing ahead!"],
  celebration: ["🦆 Quack! Outstanding work!", "Time to celebrate with some breadcrumbs!", "You're one productive duck!", "Absolutely quack-tacular!"],
  error: ["Oops! Even ducks hit rough waters sometimes.", "Don't worry, we'll get through this together!", "Every duck faces challenges!"]
};

const getRandomDuckResponse = (type: keyof typeof duckResponses) => {
  const responses = duckResponses[type];
  return responses[Math.floor(Math.random() * responses.length)];
};

// Cloudflare Workers AI helper function
async function getAIDebuggingHelp(problemDescription: string, ai: Ai): Promise<string> {
  try {
    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You are a helpful rubber duck debugging assistant with a friendly, encouraging duck personality. Provide clear, step-by-step debugging advice with duck-themed expressions like "Quack!", "Let\'s dive in!", and "You\'ve got this, fellow developer!". Include practical solutions and explain the reasoning behind your suggestions. Keep responses concise but helpful.'
        },
        {
          role: 'user',
          content: `Help me debug this problem: ${problemDescription}`
        }
      ],
      max_tokens: 512,
      temperature: 0.7,
    });

    return response.response || 'Quack! I couldn\'t generate a response right now, but don\'t worry - every duck faces challenges! Try breaking down your problem into smaller parts.';
  } catch (error) {
    console.error('Cloudflare AI error:', error);
    return 'Quack! I\'m having trouble connecting to my AI brain right now, but that doesn\'t stop a good rubber duck session! Try explaining your problem step by step - sometimes talking through it reveals the solution!';
  }
}

// Spotify helper functions
async function refreshSpotifyToken(refreshToken: string, clientId: string, clientSecret: string) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Spotify token');
  }

  return await response.json() as {
    access_token: string;
    expires_in: number;
  };
}

async function makeSpotifyRequest(endpoint: string, accessToken: string, options: RequestInit = {}) {
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`);
  }

  return await response.json();
}

// MCP Server creation
function createMcpServer(env: Bindings) {
  const server = new McpServer({
    name: "duckie-productivity-server",
    version: "1.0.0",
    description: "A delightful duck-themed productivity MCP server with AI debugging, task management, focus timers, and Spotify integration"
  });

  const db = drizzle(env.DB);

  // Task Management Tools
  server.tool(
    "create_task",
    {
      title: z.string().min(1).describe("Title of the task"),
      description: z.string().optional().describe("Optional description"),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
      due_date: z.string().optional().describe("Due date in ISO format")
    },
    async ({ title, description, priority, due_date }) => {
      try {
        const [newTask] = await db.insert(schema.tasks).values({
          title,
          description: description || null,
          priority,
          dueDate: due_date || null
        }).returning();

        return {
          content: [{
            type: "text",
            text: `${getRandomDuckResponse('success')} Task "${title}" created successfully! 🦆\n\nTask Details:\n${JSON.stringify(newTask, null, 2)}\n\n${getRandomDuckResponse('encouragement')}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `${getRandomDuckResponse('error')} Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "list_tasks",
    {
      status: z.enum(["pending", "in_progress", "completed"]).optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      limit: z.number().default(10)
    },
    async ({ status, priority, limit }) => {
      try {
        const conditions = [];
        if (status) conditions.push(eq(schema.tasks.status, status));
        if (priority) conditions.push(eq(schema.tasks.priority, priority));

        const query = db.select().from(schema.tasks).orderBy(desc(schema.tasks.createdAt)).limit(limit);
        const tasksQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;
        const tasks = await tasksQuery;

        const statusEmoji = { pending: "⏳", in_progress: "🔄", completed: "✅" };
        const priorityEmoji = { low: "🟢", medium: "🟡", high: "🔴" };

        const taskList = tasks.map(task => 
          `${statusEmoji[task.status as keyof typeof statusEmoji]} ${priorityEmoji[task.priority as keyof typeof priorityEmoji]} **${task.title}**\n   ${task.description || 'No description'}\n   Due: ${task.dueDate || 'No due date'}`
        ).join('\n\n');

        return {
          content: [{
            type: "text",
            text: `🦆 Here are your tasks, productive duck!\n\n${taskList || 'No tasks found - time to create some!'}\n\n${getRandomDuckResponse('encouragement')}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `${getRandomDuckResponse('error')} Failed to fetch tasks: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "update_task",
    {
      id: z.number().describe("Task ID to update"),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["pending", "in_progress", "completed"]).optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      due_date: z.string().optional()
    },
    async ({ id, title, description, status, priority, due_date }) => {
      try {
        const updateData: any = { updatedAt: new Date().toISOString() };
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;
        if (due_date !== undefined) updateData.dueDate = due_date;

        const [updatedTask] = await db.update(schema.tasks)
          .set(updateData)
          .where(eq(schema.tasks.id, id))
          .returning();

        if (!updatedTask) {
          return {
            content: [{
              type: "text",
              text: `Quack! Task with ID ${id} not found. Double-check that ID, duckling!`
            }],
            isError: true
          };
        }

        const celebrationMessage = status === 'completed' ? getRandomDuckResponse('celebration') : getRandomDuckResponse('success');

        return {
          content: [{
            type: "text",
            text: `${celebrationMessage} Task updated successfully! 🦆\n\nUpdated Task:\n${JSON.stringify(updatedTask, null, 2)}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `${getRandomDuckResponse('error')} Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "delete_task",
    {
      id: z.number().describe("Task ID to delete")
    },
    async ({ id }) => {
      try {
        const [deletedTask] = await db.delete(schema.tasks)
          .where(eq(schema.tasks.id, id))
          .returning();

        if (!deletedTask) {
          return {
            content: [{
              type: "text",
              text: `Quack! Task with ID ${id} not found. Nothing to delete here!`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: "text",
            text: `${getRandomDuckResponse('success')} Task "${deletedTask.title}" has been deleted. Sometimes we need to let go to move forward! 🦆`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `${getRandomDuckResponse('error')} Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  // Debug Session Tools
  server.tool(
    "start_debug_session",
    {
      problem_description: z.string().min(1).describe("Description of the problem to debug")
    },
    async ({ problem_description }) => {
      try {
        const aiResponse = await getAIDebuggingHelp(problem_description, env.AI);
        
        const [debugSession] = await db.insert(schema.debugSessions).values({
          problemDescription: problem_description,
          aiResponse,
          status: 'active'
        }).returning();

        return {
          content: [{
            type: "text",
            text: `🦆 Rubber duck debugging session started! Let's solve this together!\n\n**Problem:** ${problem_description}\n\n**AI Assistant's Advice:**\n${aiResponse}\n\n**Session ID:** ${debugSession.id}\n\n${getRandomDuckResponse('encouragement')} Remember, explaining your problem to a rubber duck often reveals the solution!`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `${getRandomDuckResponse('error')} Failed to start debug session: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "resolve_debug_session",
    {
      id: z.number().describe("Debug session ID to resolve")
    },
    async ({ id }) => {
      try {
        const [resolvedSession] = await db.update(schema.debugSessions)
          .set({ status: 'resolved', updatedAt: new Date().toISOString() })
          .where(eq(schema.debugSessions.id, id))
          .returning();

        if (!resolvedSession) {
          return {
            content: [{
              type: "text",
              text: `Quack! Debug session with ID ${id} not found.`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: "text",
            text: `${getRandomDuckResponse('celebration')} Debug session resolved! 🎉🦆\n\nYou've successfully debugged: "${resolvedSession.problemDescription}"\n\nEvery bug squashed makes you a stronger developer!`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `${getRandomDuckResponse('error')} Failed to resolve debug session: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  // Focus Session Tools
  server.tool(
    "start_focus_session",
    {
      duration_minutes: z.number().min(1).max(180).describe("Focus session duration in minutes"),
      task_description: z.string().optional().describe("Optional description of what you'll focus on")
    },
    async ({ duration_minutes, task_description }) => {
      try {
        const [focusSession] = await db.insert(schema.focusSessions).values({
          durationMinutes: duration_minutes,
          taskDescription: task_description || null,
          completed: false
        }).returning();

        return {
          content: [{
            type: "text",
            text: `🦆 Focus session started! Time to dive deep!\n\n**Duration:** ${duration_minutes} minutes\n**Task:** ${task_description || 'General focus time'}\n**Session ID:** ${focusSession.id}\n\n${getRandomDuckResponse('encouragement')} Stay focused like a duck on water - calm on the surface, paddling hard underneath! 🏊‍♀️`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `${getRandomDuckResponse('error')} Failed to start focus session: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "complete_focus_session",
    {
      id: z.number().describe("Focus session ID to complete")
    },
    async ({ id }) => {
      try {
        const [completedSession] = await db.update(schema.focusSessions)
          .set({ 
            completed: true, 
            completedAt: new Date().toISOString() 
          })
          .where(eq(schema.focusSessions.id, id))
          .returning();

        if (!completedSession) {
          return {
            content: [{
              type: "text",
              text: `Quack! Focus session with ID ${id} not found.`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: "text",
            text: `${getRandomDuckResponse('celebration')} Focus session completed! 🎯🦆\n\n**Duration:** ${completedSession.durationMinutes} minutes\n**Task:** ${completedSession.taskDescription || 'General focus'}\n\nYou've just proven that focused work pays off! Time for a well-deserved break! 🌟`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `${getRandomDuckResponse('error')} Failed to complete focus session: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_focus_stats",
    {
      days: z.number().default(7).describe("Number of days to look back for statistics")
    },
    async ({ days }) => {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const sessions = await db.select()
          .from(schema.focusSessions)
          .where(eq(schema.focusSessions.completed, true));

        const totalSessions = sessions.length;
        const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
        const averageSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

        return {
          content: [{
            type: "text",
            text: `🦆 Your focus statistics (last ${days} days):\n\n📊 **Total Sessions:** ${totalSessions}\n⏱️ **Total Focus Time:** ${totalMinutes} minutes (${Math.round(totalMinutes / 60 * 10) / 10} hours)\n📈 **Average Session:** ${averageSession} minutes\n\n${totalSessions > 0 ? getRandomDuckResponse('celebration') : getRandomDuckResponse('encouragement')} ${totalSessions > 0 ? 'Your focus game is strong!' : 'Ready to start your focus journey?'}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `${getRandomDuckResponse('error')} Failed to get focus stats: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  // Spotify Integration Tools
  server.tool(
    "spotify_auth_url",
    {},
    async () => {
      const scopes = [
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'playlist-read-private',
        'playlist-read-collaborative'
      ].join(' ');

      const authUrl = `https://accounts.spotify.com/authorize?` +
        `response_type=code&` +
        `client_id=${env.SPOTIFY_CLIENT_ID}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `redirect_uri=${encodeURIComponent(env.SPOTIFY_REDIRECT_URI)}`;

      return {
        content: [{
          type: "text",
          text: `🦆 Ready to add some music to your productivity? \n\n🎵 Click this link to connect your Spotify account:\n${authUrl}\n\n${getRandomDuckResponse('encouragement')} Music makes everything better!`
        }]
      };
    }
  );

  return server;
}

// API Routes
app.get("/", (c) => {
  return c.json({
    message: `${getRandomDuckResponse('success')} Welcome to Duckie Productivity Server! 🦆`,
    description: "Your friendly rubber duck companion for debugging, task management, focus sessions, and music!",
    endpoints: {
      mcp: "/mcp",
      tasks: "/api/tasks",
      debug: "/api/debug",
      focus: "/api/focus",
      spotify: "/api/spotify"
    }
  });
});

// Task Management API Routes
app.post("/api/tasks", async (c) => {
  const db = drizzle(c.env.DB);
  const { title, description, priority = "medium", due_date } = await c.req.json();

  if (!title) {
    return c.json({ 
      error: `${getRandomDuckResponse('error')} Title is required!`,
      success: false 
    }, 400);
  }

  try {
    const [newTask] = await db.insert(schema.tasks).values({
      title,
      description: description || null,
      priority,
      dueDate: due_date || null
    }).returning();

    return c.json({
      message: `${getRandomDuckResponse('success')} Task created successfully!`,
      task: newTask,
      encouragement: getRandomDuckResponse('encouragement')
    }, 201);
  } catch (error) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Failed to create task`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.get("/api/tasks", async (c) => {
  const db = drizzle(c.env.DB);
  const status = c.req.query('status') as 'pending' | 'in_progress' | 'completed' | undefined;
  const priority = c.req.query('priority') as 'low' | 'medium' | 'high' | undefined;
  const limit = Number.parseInt(c.req.query('limit') || '10');

  try {
    const conditions = [];
    if (status) conditions.push(eq(schema.tasks.status, status));
    if (priority) conditions.push(eq(schema.tasks.priority, priority));

    const query = db.select().from(schema.tasks).orderBy(desc(schema.tasks.createdAt)).limit(limit);
    const tasksQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;
    const tasks = await tasksQuery;

    return c.json({
      message: `${getRandomDuckResponse('success')} Here are your tasks!`,
      tasks,
      count: tasks.length,
      encouragement: getRandomDuckResponse('encouragement')
    });
  } catch (error) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Failed to fetch tasks`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.put("/api/tasks/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number.parseInt(c.req.param('id'));
  const updates = await c.req.json();

  try {
    const updateData: any = { updatedAt: new Date().toISOString() };
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.due_date !== undefined) updateData.dueDate = updates.due_date;

    const [updatedTask] = await db.update(schema.tasks)
      .set(updateData)
      .where(eq(schema.tasks.id, id))
      .returning();

    if (!updatedTask) {
      return c.json({
        error: `Quack! Task with ID ${id} not found.`,
        success: false
      }, 404);
    }

    const celebrationMessage = updates.status === 'completed' ? 
      getRandomDuckResponse('celebration') : 
      getRandomDuckResponse('success');

    return c.json({
      message: `${celebrationMessage} Task updated successfully!`,
      task: updatedTask
    });
  } catch (error) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Failed to update task`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.delete("/api/tasks/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number.parseInt(c.req.param('id'));

  try {
    const [deletedTask] = await db.delete(schema.tasks)
      .where(eq(schema.tasks.id, id))
      .returning();

    if (!deletedTask) {
      return c.json({
        error: `Quack! Task with ID ${id} not found.`,
        success: false
      }, 404);
    }

    return c.json({
      message: `${getRandomDuckResponse('success')} Task "${deletedTask.title}" deleted successfully!`,
      farewell: "Sometimes we need to let go to move forward! 🦆"
    });
  } catch (error) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Failed to delete task`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Debug Session API Routes
app.post("/api/debug", async (c) => {
  const db = drizzle(c.env.DB);
  const { problem_description } = await c.req.json();

  if (!problem_description) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Problem description is required!`,
      success: false
    }, 400);
  }

  try {
    const aiResponse = await getAIDebuggingHelp(problem_description, c.env.AI);
    
    const [debugSession] = await db.insert(schema.debugSessions).values({
      problemDescription: problem_description,
      aiResponse,
      status: 'active'
    }).returning();

    return c.json({
      message: `${getRandomDuckResponse('success')} Rubber duck debugging session started!`,
      session: debugSession,
      ai_advice: aiResponse,
      encouragement: `${getRandomDuckResponse('encouragement')} Remember, explaining your problem often reveals the solution!`
    }, 201);
  } catch (error) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Failed to start debug session`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.get("/api/debug/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number.parseInt(c.req.param('id'));

  try {
    const [debugSession] = await db.select()
      .from(schema.debugSessions)
      .where(eq(schema.debugSessions.id, id));

    if (!debugSession) {
      return c.json({
        error: `Quack! Debug session with ID ${id} not found.`,
        success: false
      }, 404);
    }

    return c.json({
      message: `${getRandomDuckResponse('success')} Here's your debug session!`,
      session: debugSession,
      encouragement: getRandomDuckResponse('encouragement')
    });
  } catch (error) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Failed to fetch debug session`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.put("/api/debug/:id/resolve", async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number.parseInt(c.req.param('id'));

  try {
    const [resolvedSession] = await db.update(schema.debugSessions)
      .set({ status: 'resolved', updatedAt: new Date().toISOString() })
      .where(eq(schema.debugSessions.id, id))
      .returning();

    if (!resolvedSession) {
      return c.json({
        error: `Quack! Debug session with ID ${id} not found.`,
        success: false
      }, 404);
    }

    return c.json({
      message: `${getRandomDuckResponse('celebration')} Debug session resolved! 🎉`,
      session: resolvedSession,
      celebration: "Every bug squashed makes you a stronger developer!"
    });
  } catch (error) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Failed to resolve debug session`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Focus Session API Routes
app.post("/api/focus", async (c) => {
  const db = drizzle(c.env.DB);
  const { duration_minutes, task_description } = await c.req.json();

  if (!duration_minutes || duration_minutes < 1 || duration_minutes > 180) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Duration must be between 1 and 180 minutes!`,
      success: false
    }, 400);
  }

  try {
    const [focusSession] = await db.insert(schema.focusSessions).values({
      durationMinutes: duration_minutes,
      taskDescription: task_description || null,
      completed: false
    }).returning();

    return c.json({
      message: `${getRandomDuckResponse('success')} Focus session started!`,
      session: focusSession,
      motivation: `${getRandomDuckResponse('encouragement')} Stay focused like a duck on water!`,
      tip: "Calm on the surface, paddling hard underneath! 🏊‍♀️"
    }, 201);
  } catch (error) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Failed to start focus session`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.put("/api/focus/:id/complete", async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number.parseInt(c.req.param('id'));

  try {
    const [completedSession] = await db.update(schema.focusSessions)
      .set({ 
        completed: true, 
        completedAt: new Date().toISOString() 
      })
      .where(eq(schema.focusSessions.id, id))
      .returning();

    if (!completedSession) {
      return c.json({
        error: `Quack! Focus session with ID ${id} not found.`,
        success: false
      }, 404);
    }

    return c.json({
      message: `${getRandomDuckResponse('celebration')} Focus session completed! 🎯`,
      session: completedSession,
      celebration: "You've just proven that focused work pays off! Time for a well-deserved break! 🌟"
    });
  } catch (error) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Failed to complete focus session`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.get("/api/focus/stats", async (c) => {
  const db = drizzle(c.env.DB);
  const days = Number.parseInt(c.req.query('days') || '7');

  try {
    const sessions = await db.select()
      .from(schema.focusSessions)
      .where(eq(schema.focusSessions.completed, true));

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
    const averageSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    return c.json({
      message: `${getRandomDuckResponse('success')} Your focus statistics!`,
      stats: {
        total_sessions: totalSessions,
        total_minutes: totalMinutes,
        total_hours: Math.round(totalMinutes / 60 * 10) / 10,
        average_session_minutes: averageSession,
        period_days: days
      },
      encouragement: totalSessions > 0 ? 
        `${getRandomDuckResponse('celebration')} Your focus game is strong!` : 
        `${getRandomDuckResponse('encouragement')} Ready to start your focus journey?`
    });
  } catch (error) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Failed to get focus stats`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Spotify Integration API Routes
app.get("/api/spotify/auth", (c) => {
  const scopes = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative'
  ].join(' ');

  const authUrl = `https://accounts.spotify.com/authorize?` +
    `response_type=code&` +
    `client_id=${c.env.SPOTIFY_CLIENT_ID}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `redirect_uri=${encodeURIComponent(c.env.SPOTIFY_REDIRECT_URI)}`;

  return c.json({
    message: `${getRandomDuckResponse('success')} Ready to add some music to your productivity?`,
    auth_url: authUrl,
    instructions: "Click the auth_url to connect your Spotify account!",
    encouragement: `${getRandomDuckResponse('encouragement')} Music makes everything better! 🎵`
  });
});

app.post("/api/spotify/callback", async (c) => {
  const db = drizzle(c.env.DB);
  const { code, user_id = "default_user" } = await c.req.json();

  if (!code) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Authorization code is required!`,
      success: false
    }, 400);
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${c.env.SPOTIFY_CLIENT_ID}:${c.env.SPOTIFY_CLIENT_SECRET}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: c.env.SPOTIFY_REDIRECT_URI
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await db.insert(schema.spotifyTokens).values({
      userId: user_id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt
    }).onConflictDoUpdate({
      target: schema.spotifyTokens.userId,
      set: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        updatedAt: new Date().toISOString()
      }
    });

    return c.json({
      message: `${getRandomDuckResponse('celebration')} Spotify connected successfully! 🎵`,
      success: true,
      encouragement: "Now you can control your music while staying productive!"
    });
  } catch (error) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Failed to connect Spotify`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.post("/api/spotify/play", async (c) => {
  const db = drizzle(c.env.DB);
  const { action, playlist_uri, user_id = "default_user" } = await c.req.json();

  if (!action || !['play', 'pause', 'next', 'previous'].includes(action)) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Valid action is required (play, pause, next, previous)!`,
      success: false
    }, 400);
  }

  try {
    const [tokenRecord] = await db.select()
      .from(schema.spotifyTokens)
      .where(eq(schema.spotifyTokens.userId, user_id));

    if (!tokenRecord) {
      return c.json({
        error: `Quack! No Spotify connection found. Please authenticate first!`,
        auth_needed: true
      }, 401);
    }

    let accessToken = tokenRecord.accessToken;

    // Check if token needs refresh
    if (new Date(tokenRecord.expiresAt) <= new Date()) {
      const refreshedTokens = await refreshSpotifyToken(
        tokenRecord.refreshToken,
        c.env.SPOTIFY_CLIENT_ID,
        c.env.SPOTIFY_CLIENT_SECRET
      );

      accessToken = refreshedTokens.access_token;
      const newExpiresAt = new Date(Date.now() + refreshedTokens.expires_in * 1000).toISOString();

      await db.update(schema.spotifyTokens)
        .set({
          accessToken,
          expiresAt: newExpiresAt,
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.spotifyTokens.userId, user_id));
    }

    let endpoint = '';
    let method = 'PUT';
    let body: any = undefined;

    switch (action) {
      case 'play':
        endpoint = '/me/player/play';
        if (playlist_uri) {
          body = JSON.stringify({ context_uri: playlist_uri });
        }
        break;
      case 'pause':
        endpoint = '/me/player/pause';
        break;
      case 'next':
        endpoint = '/me/player/next';
        method = 'POST';
        break;
      case 'previous':
        endpoint = '/me/player/previous';
        method = 'POST';
        break;
    }

    await makeSpotifyRequest(endpoint, accessToken, {
      method,
      body
    });

    const actionMessages = {
      play: `${getRandomDuckResponse('success')} Music is playing! Time to get productive! 🎵`,
      pause: `${getRandomDuckResponse('success')} Music paused. Taking a break? 🦆`,
      next: `${getRandomDuckResponse('success')} Skipped to next track! 🎶`,
      previous: `${getRandomDuckResponse('success')} Back to previous track! 🎵`
    };

    return c.json({
      message: actionMessages[action as keyof typeof actionMessages],
      action,
      success: true
    });
  } catch (error) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Failed to control Spotify playback`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.get("/api/spotify/playlists", async (c) => {
  const db = drizzle(c.env.DB);
  const user_id = c.req.query('user_id') || "default_user";

  try {
    const [tokenRecord] = await db.select()
      .from(schema.spotifyTokens)
      .where(eq(schema.spotifyTokens.userId, user_id));

    if (!tokenRecord) {
      return c.json({
        error: `Quack! No Spotify connection found. Please authenticate first!`,
        auth_needed: true
      }, 401);
    }

    let accessToken = tokenRecord.accessToken;

    // Check if token needs refresh
    if (new Date(tokenRecord.expiresAt) <= new Date()) {
      const refreshedTokens = await refreshSpotifyToken(
        tokenRecord.refreshToken,
        c.env.SPOTIFY_CLIENT_ID,
        c.env.SPOTIFY_CLIENT_SECRET
      );

      accessToken = refreshedTokens.access_token;
      const newExpiresAt = new Date(Date.now() + refreshedTokens.expires_in * 1000).toISOString();

      await db.update(schema.spotifyTokens)
        .set({
          accessToken,
          expiresAt: newExpiresAt,
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.spotifyTokens.userId, user_id));
    }

    const playlists = await makeSpotifyRequest('/me/playlists?limit=50', accessToken) as {
      items: Array<{
        id: string;
        name: string;
        description: string;
        uri: string;
      }>;
      total: number;
    };

    return c.json({
      message: `${getRandomDuckResponse('success')} Here are your playlists!`,
      playlists: playlists.items,
      total: playlists.total,
      recommendation: `${getRandomDuckResponse('encouragement')} Pick something that keeps you motivated! 🎵`
    });
  } catch (error) {
    return c.json({
      error: `${getRandomDuckResponse('error')} Failed to fetch playlists`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// MCP Server endpoint
app.all("/mcp", async (c) => {
  const mcpServer = createMcpServer(c.env);
  const transport = new StreamableHTTPTransport();
  
  await mcpServer.connect(transport);
  return transport.handleRequest(c);
});

// OpenAPI specification
app.get("/openapi.json", c => {
  return c.json(createOpenAPISpec(app, {
    info: {
      title: "Duckie Productivity MCP Server",
      version: "1.0.0",
      description: "A delightful duck-themed productivity server with AI debugging, task management, focus timers, and Spotify integration"
    },
  }));
});

// Fiberplane API explorer
app.use("/fp/*", createFiberplane({
  app,
  openapi: { url: "/openapi.json" }
}));

export default app;
