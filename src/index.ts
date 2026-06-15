interface Message {
  name: string
  message: string
  timestamp: number
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url)

    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    // POST: Add new message
    if (request.method === 'POST' && url.pathname === '/api/message') {
      try {
        const { name, message } = await request.json()

        if (!name || !message) {
          return new Response(
            JSON.stringify({ error: 'Name and message required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }

        const msg: Message = {
          name,
          message,
          timestamp: Date.now(),
        }

        // Store in KV
        const messages = await env.MESSAGES.get('messages', 'json') || []
        messages.push(msg)
        await env.MESSAGES.put('messages', JSON.stringify(messages))

        return new Response(
          JSON.stringify({ success: true, message: 'Message received!' }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        )
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to save message' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // GET: Retrieve all messages (for admin)
    if (request.method === 'GET' && url.pathname === '/api/messages') {
      const messages = await env.MESSAGES.get('messages', 'json') || []
      return new Response(JSON.stringify(messages), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    return new Response('Not Found', { status: 404 })
  },
}
