/**
 * Happy MCP server
 * Provides Happy CLI specific tools including chat session title management
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { AddressInfo } from "node:net";
import { z } from "zod";
import { logger } from "@/ui/logger";
import { ApiSessionClient } from "@/api/apiSession";
import type { UserMessage } from "@/api/types";
import { randomUUID } from "node:crypto";

export interface StartHappyServerOptions {
    onA2aMessage?: (message: UserMessage) => Promise<void> | void;
    useDaemonA2ARoute?: boolean;
}

export async function startHappyServer(client: ApiSessionClient, options?: StartHappyServerOptions) {
    // Handler that sends title updates via the client
    const handler = async (title: string) => {
        logger.debug('[happyMCP] Changing title to:', title);
        try {
            // Send title as a summary message, similar to title generator
            client.sendClaudeSessionMessage({
                type: 'summary',
                summary: title,
                leafUuid: randomUUID()
            });
            
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    };

    //
    // Create the MCP server
    //

    const mcp = new McpServer({
        name: "Happy MCP",
        version: "1.0.0",
    });

    mcp.registerTool('change_title', {
        description: 'Change the title of the current chat session',
        title: 'Change Chat Title',
        inputSchema: {
            title: z.string().describe('The new title for the chat session'),
        },
    }, async (args) => {
        const response = await handler(args.title);
        logger.debug('[happyMCP] Response:', response);
        
        if (response.success) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Successfully changed chat title to: "${args.title}"`,
                    },
                ],
                isError: false,
            };
        } else {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to change chat title: ${response.error || 'Unknown error'}`,
                    },
                ],
                isError: true,
            };
        }
    });

    const transport = new StreamableHTTPServerTransport({
        // NOTE: Returning session id here will result in claude
        // sdk spawn to fail with `Invalid Request: Server already initialized`
        sessionIdGenerator: undefined
    });
    await mcp.connect(transport);

    //
    // Create the HTTP server
    //

    const server = createServer(async (req, res) => {
        // ── A2A message inbox ──────────────────────────────────────────
        if (req.method === 'POST' && req.url === '/a2a/message' && options?.onA2aMessage) {
            try {
                const chunks: Buffer[] = [];
                for await (const chunk of req) {
                    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                }
                const raw = Buffer.concat(chunks).toString('utf8').trim();
                if (!raw) {
                    res.writeHead(400).end(JSON.stringify({ error: 'Empty body' }));
                    return;
                }
                const body = JSON.parse(raw) as Record<string, unknown>;
                const text = typeof body.text === 'string' ? body.text.trim() : null;
                if (!text) {
                    res.writeHead(400).end(JSON.stringify({ error: 'Missing text' }));
                    return;
                }
                const message = {
                    content: { text, type: 'text' as const },
                    meta: {
                        origin: 'a2a',
                        title: typeof body.title === 'string' ? body.title : undefined,
                    },
                } as UserMessage;
                await options.onA2aMessage(message);
                res.writeHead(200).end(JSON.stringify({ ok: true }));
                return;
            } catch (err) {
                logger.debug('[happyMCP] A2A message error:', err);
                if (!res.headersSent) {
                    res.writeHead(500).end(JSON.stringify({ error: 'Internal error' }));
                }
                return;
            }
        }

        try {
            await transport.handleRequest(req, res);
        } catch (error) {
            logger.debug("Error handling request:", error);
            if (!res.headersSent) {
                res.writeHead(500).end();
            }
        }
    });

    const baseUrl = await new Promise<URL>((resolve) => {
        server.listen(0, "127.0.0.1", () => {
            const addr = server.address() as AddressInfo;
            resolve(new URL(`http://127.0.0.1:${addr.port}`));
        });
    });

    return {
        url: baseUrl.toString(),
        toolNames: ['change_title'],
        stop: () => {
            logger.debug('[happyMCP] Stopping server');
            mcp.close();
            server.close();
        }
    }
}
