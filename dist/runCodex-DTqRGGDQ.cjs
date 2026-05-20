'use strict';

var ink = require('ink');
var React = require('react');
var api = require('./registerKillSessionHandler-DvMk4CwC.cjs');
var index_js = require('@modelcontextprotocol/sdk/client/index.js');
var stdio_js = require('@modelcontextprotocol/sdk/client/stdio.js');
var z = require('zod');
var types_js = require('@modelcontextprotocol/sdk/types.js');
var child_process = require('child_process');
var BaseReasoningProcessor = require('./BaseReasoningProcessor-3OvRa81H.cjs');
var node_crypto = require('node:crypto');
var os = require('node:os');
var node_path = require('node:path');
var setupOfflineReconnection = require('./setupOfflineReconnection-oMd6te2B.cjs');
var fs = require('node:fs');
var index = require('./index-B8nGJG4m.cjs');
var constants = require('./constants-BoRzlgAD.cjs');
require('fs/promises');
require('os');
require('tmp');
require('axios');
require('node:events');
require('socket.io-client');
require('tweetnacl');
require('util');
require('crypto');
require('path');
require('url');
require('expo-server-sdk');
require('chalk');
require('qrcode-terminal');
require('node:fs/promises');
require('open');
require('fs');
require('ps-list');
require('cross-spawn');
require('fastify');
require('fastify-type-provider-zod');
require('@modelcontextprotocol/sdk/server/mcp.js');
require('node:http');
require('@modelcontextprotocol/sdk/server/streamableHttp.js');
require('node:child_process');
require('node:readline');
require('node:url');
require('node:util');
require('http');

const DEFAULT_TIMEOUT = 14 * 24 * 60 * 60 * 1e3;
function getCodexMcpCommand() {
  try {
    const version = child_process.execSync("codex --version", { encoding: "utf8" }).trim();
    const match = version.match(/codex-cli\s+(\d+\.\d+\.\d+(?:-alpha\.\d+)?)/);
    if (!match) {
      api.logger.debug("[CodexMCP] Could not parse codex version:", version);
      return null;
    }
    const versionStr = match[1];
    const [major, minor, patch] = versionStr.split(/[-.]/).map(Number);
    if (major > 0 || minor > 43) return "mcp-server";
    if (minor === 43 && patch === 0) {
      if (versionStr.includes("-alpha.")) {
        const alphaNum = parseInt(versionStr.split("-alpha.")[1]);
        return alphaNum >= 5 ? "mcp-server" : "mcp";
      }
      return "mcp-server";
    }
    return "mcp";
  } catch (error) {
    api.logger.debug("[CodexMCP] Codex CLI not found or not executable:", error);
    return null;
  }
}
class CodexMcpClient {
  client;
  transport = null;
  connected = false;
  sessionId = null;
  conversationId = null;
  handler = null;
  permissionHandler = null;
  constructor() {
    this.client = new index_js.Client(
      { name: "happy-codex-client", version: "1.0.0" },
      { capabilities: { elicitation: {} } }
    );
    this.client.setNotificationHandler(z.z.object({
      method: z.z.literal("codex/event"),
      params: z.z.object({
        msg: z.z.any()
      })
    }).passthrough(), (data) => {
      const msg = data.params.msg;
      this.updateIdentifiersFromEvent(msg);
      this.handler?.(msg);
    });
  }
  setHandler(handler) {
    this.handler = handler;
  }
  /**
   * Set the permission handler for tool approval
   */
  setPermissionHandler(handler) {
    this.permissionHandler = handler;
  }
  async connect() {
    if (this.connected) return;
    const mcpCommand = getCodexMcpCommand();
    if (mcpCommand === null) {
      throw new Error(
        "Codex CLI not found or not executable.\n\nTo install codex:\n  npm install -g @openai/codex\n\nAlternatively, use Claude:\n  happy claude"
      );
    }
    api.logger.debug(`[CodexMCP] Connecting to Codex MCP server using command: codex ${mcpCommand}`);
    this.transport = new stdio_js.StdioClientTransport({
      command: "codex",
      args: [mcpCommand],
      env: Object.keys(process.env).reduce((acc, key) => {
        const value = process.env[key];
        if (typeof value === "string") acc[key] = value;
        return acc;
      }, {})
    });
    this.registerPermissionHandlers();
    await this.client.connect(this.transport);
    this.connected = true;
    api.logger.debug("[CodexMCP] Connected to Codex");
  }
  registerPermissionHandlers() {
    this.client.setRequestHandler(
      types_js.ElicitRequestSchema,
      async (request) => {
        console.log("[CodexMCP] Received elicitation request:", request.params);
        const params = request.params;
        const toolName = "CodexBash";
        if (!this.permissionHandler) {
          api.logger.debug("[CodexMCP] No permission handler set, denying by default");
          return {
            decision: "denied"
          };
        }
        try {
          const result = await this.permissionHandler.handleToolCall(
            params.codex_call_id,
            toolName,
            {
              command: params.codex_command,
              cwd: params.codex_cwd
            }
          );
          api.logger.debug("[CodexMCP] Permission result:", result);
          return {
            decision: result.decision
          };
        } catch (error) {
          api.logger.debug("[CodexMCP] Error handling permission request:", error);
          return {
            decision: "denied",
            reason: error instanceof Error ? error.message : "Permission request failed"
          };
        }
      }
    );
    api.logger.debug("[CodexMCP] Permission handlers registered");
  }
  async startSession(config, options) {
    if (!this.connected) await this.connect();
    api.logger.debug("[CodexMCP] Starting Codex session:", config);
    const response = await this.client.callTool({
      name: "codex",
      arguments: config
    }, void 0, {
      signal: options?.signal,
      timeout: DEFAULT_TIMEOUT
      // maxTotalTimeout: 10000000000 
    });
    api.logger.debug("[CodexMCP] startSession response:", response);
    this.extractIdentifiers(response);
    return response;
  }
  async continueSession(prompt, options) {
    if (!this.connected) await this.connect();
    if (!this.sessionId) {
      throw new Error("No active session. Call startSession first.");
    }
    if (!this.conversationId) {
      this.conversationId = this.sessionId;
      api.logger.debug("[CodexMCP] conversationId missing, defaulting to sessionId:", this.conversationId);
    }
    const args = { sessionId: this.sessionId, conversationId: this.conversationId, prompt };
    api.logger.debug("[CodexMCP] Continuing Codex session:", args);
    const response = await this.client.callTool({
      name: "codex-reply",
      arguments: args
    }, void 0, {
      signal: options?.signal,
      timeout: DEFAULT_TIMEOUT
    });
    api.logger.debug("[CodexMCP] continueSession response:", response);
    this.extractIdentifiers(response);
    return response;
  }
  updateIdentifiersFromEvent(event) {
    if (!event || typeof event !== "object") {
      return;
    }
    const candidates = [event];
    if (event.data && typeof event.data === "object") {
      candidates.push(event.data);
    }
    for (const candidate of candidates) {
      const sessionId = candidate.session_id ?? candidate.sessionId;
      if (sessionId) {
        this.sessionId = sessionId;
        api.logger.debug("[CodexMCP] Session ID extracted from event:", this.sessionId);
      }
      const conversationId = candidate.conversation_id ?? candidate.conversationId;
      if (conversationId) {
        this.conversationId = conversationId;
        api.logger.debug("[CodexMCP] Conversation ID extracted from event:", this.conversationId);
      }
    }
  }
  extractIdentifiers(response) {
    const meta = response?.meta || {};
    if (meta.sessionId) {
      this.sessionId = meta.sessionId;
      api.logger.debug("[CodexMCP] Session ID extracted:", this.sessionId);
    } else if (response?.sessionId) {
      this.sessionId = response.sessionId;
      api.logger.debug("[CodexMCP] Session ID extracted:", this.sessionId);
    }
    if (meta.conversationId) {
      this.conversationId = meta.conversationId;
      api.logger.debug("[CodexMCP] Conversation ID extracted:", this.conversationId);
    } else if (response?.conversationId) {
      this.conversationId = response.conversationId;
      api.logger.debug("[CodexMCP] Conversation ID extracted:", this.conversationId);
    }
    const content = response?.content;
    if (Array.isArray(content)) {
      for (const item of content) {
        if (!this.sessionId && item?.sessionId) {
          this.sessionId = item.sessionId;
          api.logger.debug("[CodexMCP] Session ID extracted from content:", this.sessionId);
        }
        if (!this.conversationId && item && typeof item === "object" && "conversationId" in item && item.conversationId) {
          this.conversationId = item.conversationId;
          api.logger.debug("[CodexMCP] Conversation ID extracted from content:", this.conversationId);
        }
      }
    }
  }
  getSessionId() {
    return this.sessionId;
  }
  hasActiveSession() {
    return this.sessionId !== null;
  }
  clearSession() {
    const previousSessionId = this.sessionId;
    this.sessionId = null;
    this.conversationId = null;
    api.logger.debug("[CodexMCP] Session cleared, previous sessionId:", previousSessionId);
  }
  /**
   * Store the current session ID without clearing it, useful for abort handling
   */
  storeSessionForResume() {
    api.logger.debug("[CodexMCP] Storing session for potential resume:", this.sessionId);
    return this.sessionId;
  }
  /**
   * Force close the Codex MCP transport and clear all session identifiers.
   * Use this for permanent shutdown (e.g. kill/exit). Prefer `disconnect()` for
   * transient connection resets where you may want to keep the session id.
   */
  async forceCloseSession() {
    api.logger.debug("[CodexMCP] Force closing session");
    try {
      await this.disconnect();
    } finally {
      this.clearSession();
    }
    api.logger.debug("[CodexMCP] Session force-closed");
  }
  async disconnect() {
    if (!this.connected) return;
    const pid = this.transport?.pid ?? null;
    api.logger.debug(`[CodexMCP] Disconnecting; child pid=${pid ?? "none"}`);
    try {
      api.logger.debug("[CodexMCP] client.close begin");
      await this.client.close();
      api.logger.debug("[CodexMCP] client.close done");
    } catch (e) {
      api.logger.debug("[CodexMCP] Error closing client, attempting transport close directly", e);
      try {
        api.logger.debug("[CodexMCP] transport.close begin");
        await this.transport?.close?.();
        api.logger.debug("[CodexMCP] transport.close done");
      } catch {
      }
    }
    if (pid) {
      try {
        process.kill(pid, 0);
        api.logger.debug("[CodexMCP] Child still alive, sending SIGKILL");
        try {
          process.kill(pid, "SIGKILL");
        } catch {
        }
      } catch {
      }
    }
    this.transport = null;
    this.connected = false;
    api.logger.debug(`[CodexMCP] Disconnected; session ${this.sessionId ?? "none"} preserved`);
  }
}

class CodexPermissionHandler extends BaseReasoningProcessor.BasePermissionHandler {
  constructor(session) {
    super(session);
  }
  getLogPrefix() {
    return "[Codex]";
  }
  /**
   * Handle a tool permission request
   * @param toolCallId - The unique ID of the tool call
   * @param toolName - The name of the tool being called
   * @param input - The input parameters for the tool
   * @returns Promise resolving to permission result
   */
  async handleToolCall(toolCallId, toolName, input) {
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(toolCallId, {
        resolve,
        reject,
        toolName,
        input
      });
      this.addPendingRequestToState(toolCallId, toolName, input);
      api.logger.debug(`${this.getLogPrefix()} Permission request sent for tool: ${toolName} (${toolCallId})`);
    });
  }
}

class ReasoningProcessor extends BaseReasoningProcessor.BaseReasoningProcessor {
  getToolName() {
    return "CodexReasoning";
  }
  getLogPrefix() {
    return "[ReasoningProcessor]";
  }
  /**
   * Process a reasoning delta and accumulate content.
   */
  processDelta(delta) {
    this.processInput(delta);
  }
  /**
   * Complete the reasoning section with final text.
   */
  complete(fullText) {
    this.completeReasoning(fullText);
  }
}

class DiffProcessor {
  previousDiff = null;
  onMessage = null;
  constructor(onMessage) {
    this.onMessage = onMessage || null;
  }
  /**
   * Process a turn_diff message and check if the unified_diff has changed
   */
  processDiff(unifiedDiff) {
    if (this.previousDiff !== unifiedDiff) {
      api.logger.debug("[DiffProcessor] Unified diff changed, sending CodexDiff tool call");
      const callId = node_crypto.randomUUID();
      const toolCall = {
        type: "tool-call",
        name: "CodexDiff",
        callId,
        input: {
          unified_diff: unifiedDiff
        },
        id: node_crypto.randomUUID()
      };
      this.onMessage?.(toolCall);
      const toolResult = {
        type: "tool-call-result",
        callId,
        output: {
          status: "completed"
        },
        id: node_crypto.randomUUID()
      };
      this.onMessage?.(toolResult);
    }
    this.previousDiff = unifiedDiff;
    api.logger.debug("[DiffProcessor] Updated stored diff");
  }
  /**
   * Reset the processor state (called on task_complete or turn_aborted)
   */
  reset() {
    api.logger.debug("[DiffProcessor] Resetting diff state");
    this.previousDiff = null;
  }
  /**
   * Set the message callback for sending messages directly
   */
  setMessageCallback(callback) {
    this.onMessage = callback;
  }
  /**
   * Get the current diff value
   */
  getCurrentDiff() {
    return this.previousDiff;
  }
}

const CodexDisplay = ({ messageBuffer, logPath, onExit }) => {
  const [messages, setMessages] = React.useState([]);
  const [confirmationMode, setConfirmationMode] = React.useState(false);
  const [actionInProgress, setActionInProgress] = React.useState(false);
  const confirmationTimeoutRef = React.useRef(null);
  const { stdout } = ink.useStdout();
  const terminalWidth = stdout.columns || 80;
  const terminalHeight = stdout.rows || 24;
  React.useEffect(() => {
    setMessages(messageBuffer.getMessages());
    const unsubscribe = messageBuffer.onUpdate((newMessages) => {
      setMessages(newMessages);
    });
    return () => {
      unsubscribe();
      if (confirmationTimeoutRef.current) {
        clearTimeout(confirmationTimeoutRef.current);
      }
    };
  }, [messageBuffer]);
  const resetConfirmation = React.useCallback(() => {
    setConfirmationMode(false);
    if (confirmationTimeoutRef.current) {
      clearTimeout(confirmationTimeoutRef.current);
      confirmationTimeoutRef.current = null;
    }
  }, []);
  const setConfirmationWithTimeout = React.useCallback(() => {
    setConfirmationMode(true);
    if (confirmationTimeoutRef.current) {
      clearTimeout(confirmationTimeoutRef.current);
    }
    confirmationTimeoutRef.current = setTimeout(() => {
      resetConfirmation();
    }, 15e3);
  }, [resetConfirmation]);
  ink.useInput(React.useCallback(async (input, key) => {
    if (actionInProgress) return;
    if (key.ctrl && input === "c") {
      if (confirmationMode) {
        resetConfirmation();
        setActionInProgress(true);
        await new Promise((resolve) => setTimeout(resolve, 100));
        onExit?.();
      } else {
        setConfirmationWithTimeout();
      }
      return;
    }
    if (confirmationMode) {
      resetConfirmation();
    }
  }, [confirmationMode, actionInProgress, onExit, setConfirmationWithTimeout, resetConfirmation]));
  const getMessageColor = (type) => {
    switch (type) {
      case "user":
        return "magenta";
      case "assistant":
        return "cyan";
      case "system":
        return "blue";
      case "tool":
        return "yellow";
      case "result":
        return "green";
      case "status":
        return "gray";
      default:
        return "white";
    }
  };
  const formatMessage = (msg) => {
    const lines = msg.content.split("\n");
    const maxLineLength = terminalWidth - 10;
    return lines.map((line) => {
      if (line.length <= maxLineLength) return line;
      const chunks = [];
      for (let i = 0; i < line.length; i += maxLineLength) {
        chunks.push(line.slice(i, i + maxLineLength));
      }
      return chunks.join("\n");
    }).join("\n");
  };
  return /* @__PURE__ */ React.createElement(ink.Box, { flexDirection: "column", width: terminalWidth, height: terminalHeight }, /* @__PURE__ */ React.createElement(
    ink.Box,
    {
      flexDirection: "column",
      width: terminalWidth,
      height: terminalHeight - 4,
      borderStyle: "round",
      borderColor: "gray",
      paddingX: 1,
      overflow: "hidden"
    },
    /* @__PURE__ */ React.createElement(ink.Box, { flexDirection: "column", marginBottom: 1 }, /* @__PURE__ */ React.createElement(ink.Text, { color: "gray", bold: true }, "\u{1F916} Codex Agent Messages"), /* @__PURE__ */ React.createElement(ink.Text, { color: "gray", dimColor: true }, "\u2500".repeat(Math.min(terminalWidth - 4, 60)))),
    /* @__PURE__ */ React.createElement(ink.Box, { flexDirection: "column", height: terminalHeight - 10, overflow: "hidden" }, messages.length === 0 ? /* @__PURE__ */ React.createElement(ink.Text, { color: "gray", dimColor: true }, "Waiting for messages...") : (
      // Show only the last messages that fit in the available space
      messages.slice(-Math.max(1, terminalHeight - 10)).map((msg) => /* @__PURE__ */ React.createElement(ink.Box, { key: msg.id, flexDirection: "column", marginBottom: 1 }, /* @__PURE__ */ React.createElement(ink.Text, { color: getMessageColor(msg.type), dimColor: true }, formatMessage(msg))))
    ))
  ), /* @__PURE__ */ React.createElement(
    ink.Box,
    {
      width: terminalWidth,
      borderStyle: "round",
      borderColor: actionInProgress ? "gray" : confirmationMode ? "red" : "green",
      paddingX: 2,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column"
    },
    /* @__PURE__ */ React.createElement(ink.Box, { flexDirection: "column", alignItems: "center" }, actionInProgress ? /* @__PURE__ */ React.createElement(ink.Text, { color: "gray", bold: true }, "Exiting agent...") : confirmationMode ? /* @__PURE__ */ React.createElement(ink.Text, { color: "red", bold: true }, "\u26A0\uFE0F  Press Ctrl-C again to exit the agent") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(ink.Text, { color: "green", bold: true }, "\u{1F916} Codex Agent Running \u2022 Ctrl-C to exit")), process.env.DEBUG && logPath && /* @__PURE__ */ React.createElement(ink.Text, { color: "gray", dimColor: true }, "Debug logs: ", logPath))
  ));
};

function emitReadyIfIdle({ pending, queueSize, shouldExit, sendReady, notify }) {
  if (shouldExit) {
    return false;
  }
  if (pending) {
    return false;
  }
  if (queueSize() > 0) {
    return false;
  }
  sendReady();
  notify?.();
  return true;
}
async function runCodex(opts) {
  const sessionTag = node_crypto.randomUUID();
  api.connectionState.setBackend("Codex");
  const api$1 = await api.ApiClient.create(opts.credentials);
  api.logger.debug(`[codex] Starting with options: startedBy=${opts.startedBy || "terminal"}`);
  const settings = await api.readSettings();
  let machineId = settings?.machineId;
  if (!machineId) {
    console.error(`[START] No machine ID found in settings, which is unexpected since authAndSetupMachineIfNeeded should have created it. Please report this issue on https://github.com/slopus/happy-cli/issues`);
    process.exit(1);
  }
  api.logger.debug(`Using machineId: ${machineId}`);
  await api$1.getOrCreateMachine({
    machineId,
    metadata: api.initialMachineMetadata
  });
  const { state, metadata } = setupOfflineReconnection.createSessionMetadata({
    flavor: "codex",
    machineId,
    startedBy: opts.startedBy
  });
  const response = await api$1.getOrCreateSession({ tag: sessionTag, metadata, state });
  let session;
  let permissionHandler;
  const { session: initialSession, reconnectionHandle } = setupOfflineReconnection.setupOfflineReconnection({
    api: api$1,
    sessionTag,
    metadata,
    state,
    response,
    onSessionSwap: (newSession) => {
      session = newSession;
      if (permissionHandler) {
        permissionHandler.updateSession(newSession);
      }
    }
  });
  session = initialSession;
  if (response) {
    try {
      api.logger.debug(`[START] Reporting session ${response.id} to daemon`);
      const result = await api.notifyDaemonSessionStarted(response.id, metadata);
      if (result.error) {
        api.logger.debug(`[START] Failed to report to daemon (may not be running):`, result.error);
      } else {
        api.logger.debug(`[START] Reported session ${response.id} to daemon`);
      }
    } catch (error) {
      api.logger.debug("[START] Failed to report to daemon (may not be running):", error);
    }
  }
  const messageQueue = new api.MessageQueue2((mode) => api.hashObject({
    permissionMode: mode.permissionMode,
    model: mode.model
  }));
  let currentPermissionMode = void 0;
  let currentModel = void 0;
  session.onUserMessage((message) => {
    let messagePermissionMode = currentPermissionMode;
    if (message.meta?.permissionMode) {
      messagePermissionMode = message.meta.permissionMode;
      currentPermissionMode = messagePermissionMode;
      api.logger.debug(`[Codex] Permission mode updated from user message to: ${currentPermissionMode}`);
    } else {
      api.logger.debug(`[Codex] User message received with no permission mode override, using current: ${currentPermissionMode ?? "default (effective)"}`);
    }
    let messageModel = currentModel;
    if (message.meta?.hasOwnProperty("model")) {
      messageModel = message.meta.model || void 0;
      currentModel = messageModel;
      api.logger.debug(`[Codex] Model updated from user message: ${messageModel || "reset to default"}`);
    } else {
      api.logger.debug(`[Codex] User message received with no model override, using current: ${currentModel || "default"}`);
    }
    const enhancedMode = {
      permissionMode: messagePermissionMode || "default",
      model: messageModel
    };
    messageQueue.push(message.content.text, enhancedMode);
  });
  let thinking = false;
  session.keepAlive(thinking, "remote");
  const keepAliveInterval = setInterval(() => {
    session.keepAlive(thinking, "remote");
  }, 2e3);
  const sendReady = () => {
    session.sendSessionEvent({ type: "ready" });
    try {
      api$1.push().sendToAllDevices(
        "It's ready!",
        "Codex is waiting for your command",
        { sessionId: session.sessionId }
      );
    } catch (pushError) {
      api.logger.debug("[Codex] Failed to send ready push", pushError);
    }
  };
  function logActiveHandles(tag) {
    if (!process.env.DEBUG) return;
    const anyProc = process;
    const handles = typeof anyProc._getActiveHandles === "function" ? anyProc._getActiveHandles() : [];
    const requests = typeof anyProc._getActiveRequests === "function" ? anyProc._getActiveRequests() : [];
    api.logger.debug(`[codex][handles] ${tag}: handles=${handles.length} requests=${requests.length}`);
    try {
      const kinds = handles.map((h) => h && h.constructor ? h.constructor.name : typeof h);
      api.logger.debug(`[codex][handles] kinds=${JSON.stringify(kinds)}`);
    } catch {
    }
  }
  let abortController = new AbortController();
  let shouldExit = false;
  let storedSessionIdForResume = null;
  async function handleAbort() {
    api.logger.debug("[Codex] Abort requested - stopping current task");
    try {
      if (client.hasActiveSession()) {
        storedSessionIdForResume = client.storeSessionForResume();
        api.logger.debug("[Codex] Stored session for resume:", storedSessionIdForResume);
      }
      abortController.abort();
      reasoningProcessor.abort();
      api.logger.debug("[Codex] Abort completed - session remains active");
    } catch (error) {
      api.logger.debug("[Codex] Error during abort:", error);
    } finally {
      abortController = new AbortController();
    }
  }
  const handleKillSession = async () => {
    api.logger.debug("[Codex] Kill session requested - terminating process");
    await handleAbort();
    api.logger.debug("[Codex] Abort completed, proceeding with termination");
    try {
      if (session) {
        session.updateMetadata((currentMetadata) => ({
          ...currentMetadata,
          lifecycleState: "archived",
          lifecycleStateSince: Date.now(),
          archivedBy: "cli",
          archiveReason: "User terminated"
        }));
        session.sendSessionDeath();
        await session.flush();
        await session.close();
      }
      try {
        await client.forceCloseSession();
      } catch (e) {
        api.logger.debug("[Codex] Error while force closing Codex session during termination", e);
      }
      api.stopCaffeinate();
      happyServer.stop();
      api.logger.debug("[Codex] Session termination complete, exiting");
      process.exit(0);
    } catch (error) {
      api.logger.debug("[Codex] Error during session termination:", error);
      process.exit(1);
    }
  };
  session.rpcHandlerManager.registerHandler("abort", handleAbort);
  api.registerKillSessionHandler(session.rpcHandlerManager, handleKillSession);
  const messageBuffer = new index.MessageBuffer();
  const hasTTY = process.stdout.isTTY && process.stdin.isTTY;
  let inkInstance = null;
  if (hasTTY) {
    console.clear();
    inkInstance = ink.render(React.createElement(CodexDisplay, {
      messageBuffer,
      logPath: process.env.DEBUG ? api.logger.getLogPath() : void 0,
      onExit: async () => {
        api.logger.debug("[codex]: Exiting agent via Ctrl-C");
        shouldExit = true;
        await handleAbort();
      }
    }), {
      exitOnCtrlC: false,
      patchConsole: false
    });
  }
  if (hasTTY) {
    process.stdin.resume();
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.setEncoding("utf8");
  }
  const client = new CodexMcpClient();
  function findCodexResumeFile(sessionId) {
    if (!sessionId) return null;
    try {
      let collectFilesRecursive2 = function(dir, acc = []) {
        let entries;
        try {
          entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
          return acc;
        }
        for (const entry of entries) {
          const full = node_path.join(dir, entry.name);
          if (entry.isDirectory()) {
            collectFilesRecursive2(full, acc);
          } else if (entry.isFile()) {
            acc.push(full);
          }
        }
        return acc;
      };
      var collectFilesRecursive = collectFilesRecursive2;
      const codexHomeDir = process.env.CODEX_HOME || node_path.join(os.homedir(), ".codex");
      const rootDir = node_path.join(codexHomeDir, "sessions");
      const candidates = collectFilesRecursive2(rootDir).filter((full) => full.endsWith(`-${sessionId}.jsonl`)).filter((full) => {
        try {
          return fs.statSync(full).isFile();
        } catch {
          return false;
        }
      }).sort((a, b) => {
        const sa = fs.statSync(a).mtimeMs;
        const sb = fs.statSync(b).mtimeMs;
        return sb - sa;
      });
      return candidates[0] || null;
    } catch {
      return null;
    }
  }
  permissionHandler = new CodexPermissionHandler(session);
  const reasoningProcessor = new ReasoningProcessor((message) => {
    session.sendCodexMessage(message);
  });
  const diffProcessor = new DiffProcessor((message) => {
    session.sendCodexMessage(message);
  });
  client.setPermissionHandler(permissionHandler);
  client.setHandler((msg) => {
    api.logger.debug(`[Codex] MCP message: ${JSON.stringify(msg)}`);
    if (msg.type === "agent_message") {
      messageBuffer.addMessage(msg.message, "assistant");
    } else if (msg.type === "agent_reasoning_delta") ; else if (msg.type === "agent_reasoning") {
      messageBuffer.addMessage(`[Thinking] ${msg.text.substring(0, 100)}...`, "system");
    } else if (msg.type === "exec_command_begin") {
      messageBuffer.addMessage(`Executing: ${msg.command}`, "tool");
    } else if (msg.type === "exec_command_end") {
      const output = msg.output || msg.error || "Command completed";
      const truncatedOutput = output.substring(0, 200);
      messageBuffer.addMessage(
        `Result: ${truncatedOutput}${output.length > 200 ? "..." : ""}`,
        "result"
      );
    } else if (msg.type === "task_started") {
      messageBuffer.addMessage("Starting task...", "status");
    } else if (msg.type === "task_complete") {
      messageBuffer.addMessage("Task completed", "status");
      sendReady();
    } else if (msg.type === "turn_aborted") {
      messageBuffer.addMessage("Turn aborted", "status");
      sendReady();
    }
    if (msg.type === "task_started") {
      if (!thinking) {
        api.logger.debug("thinking started");
        thinking = true;
        session.keepAlive(thinking, "remote");
      }
    }
    if (msg.type === "task_complete" || msg.type === "turn_aborted") {
      if (thinking) {
        api.logger.debug("thinking completed");
        thinking = false;
        session.keepAlive(thinking, "remote");
      }
      diffProcessor.reset();
    }
    if (msg.type === "agent_reasoning_section_break") {
      reasoningProcessor.handleSectionBreak();
    }
    if (msg.type === "agent_reasoning_delta") {
      reasoningProcessor.processDelta(msg.delta);
    }
    if (msg.type === "agent_reasoning") {
      reasoningProcessor.complete(msg.text);
    }
    if (msg.type === "agent_message") {
      session.sendCodexMessage({
        type: "message",
        message: msg.message,
        id: node_crypto.randomUUID()
      });
    }
    if (msg.type === "exec_command_begin" || msg.type === "exec_approval_request") {
      let { call_id, type, ...inputs } = msg;
      session.sendCodexMessage({
        type: "tool-call",
        name: "CodexBash",
        callId: call_id,
        input: inputs,
        id: node_crypto.randomUUID()
      });
    }
    if (msg.type === "exec_command_end") {
      let { call_id, type, ...output } = msg;
      session.sendCodexMessage({
        type: "tool-call-result",
        callId: call_id,
        output,
        id: node_crypto.randomUUID()
      });
    }
    if (msg.type === "token_count") {
      session.sendCodexMessage({
        ...msg,
        id: node_crypto.randomUUID()
      });
    }
    if (msg.type === "patch_apply_begin") {
      let { call_id, auto_approved, changes } = msg;
      const changeCount = Object.keys(changes).length;
      const filesMsg = changeCount === 1 ? "1 file" : `${changeCount} files`;
      messageBuffer.addMessage(`Modifying ${filesMsg}...`, "tool");
      session.sendCodexMessage({
        type: "tool-call",
        name: "CodexPatch",
        callId: call_id,
        input: {
          auto_approved,
          changes
        },
        id: node_crypto.randomUUID()
      });
    }
    if (msg.type === "patch_apply_end") {
      let { call_id, stdout, stderr, success } = msg;
      if (success) {
        const message = stdout || "Files modified successfully";
        messageBuffer.addMessage(message.substring(0, 200), "result");
      } else {
        const errorMsg = stderr || "Failed to modify files";
        messageBuffer.addMessage(`Error: ${errorMsg.substring(0, 200)}`, "result");
      }
      session.sendCodexMessage({
        type: "tool-call-result",
        callId: call_id,
        output: {
          stdout,
          stderr,
          success
        },
        id: node_crypto.randomUUID()
      });
    }
    if (msg.type === "turn_diff") {
      if (msg.unified_diff) {
        diffProcessor.processDiff(msg.unified_diff);
      }
    }
  });
  const happyServer = await api.startHappyServer(session);
  const bridgeCommand = node_path.join(api.projectPath(), "bin", "happy-mcp.mjs");
  const mcpServers = {
    happy: {
      command: bridgeCommand,
      args: ["--url", happyServer.url]
    }
  };
  let first = true;
  try {
    api.logger.debug("[codex]: client.connect begin");
    await client.connect();
    api.logger.debug("[codex]: client.connect done");
    let wasCreated = false;
    let currentModeHash = null;
    let pending = null;
    let nextExperimentalResume = null;
    while (!shouldExit) {
      logActiveHandles("loop-top");
      let message = pending;
      pending = null;
      if (!message) {
        const waitSignal = abortController.signal;
        const batch = await messageQueue.waitForMessagesAndGetAsString(waitSignal);
        if (!batch) {
          if (waitSignal.aborted && !shouldExit) {
            api.logger.debug("[codex]: Wait aborted while idle; ignoring and continuing");
            continue;
          }
          api.logger.debug(`[codex]: batch=${!!batch}, shouldExit=${shouldExit}`);
          break;
        }
        message = batch;
      }
      if (!message) {
        break;
      }
      if (wasCreated && currentModeHash && message.hash !== currentModeHash) {
        api.logger.debug("[Codex] Mode changed \u2013 restarting Codex session");
        messageBuffer.addMessage("\u2550".repeat(40), "status");
        messageBuffer.addMessage("Starting new Codex session (mode changed)...", "status");
        try {
          const prevSessionId = client.getSessionId();
          nextExperimentalResume = findCodexResumeFile(prevSessionId);
          if (nextExperimentalResume) {
            api.logger.debug(`[Codex] Found resume file for session ${prevSessionId}: ${nextExperimentalResume}`);
            messageBuffer.addMessage("Resuming previous context\u2026", "status");
          } else {
            api.logger.debug("[Codex] No resume file found for previous session");
          }
        } catch (e) {
          api.logger.debug("[Codex] Error while searching resume file", e);
        }
        client.clearSession();
        wasCreated = false;
        currentModeHash = null;
        pending = message;
        permissionHandler.reset();
        reasoningProcessor.abort();
        diffProcessor.reset();
        thinking = false;
        session.keepAlive(thinking, "remote");
        continue;
      }
      messageBuffer.addMessage(message.message, "user");
      currentModeHash = message.hash;
      try {
        const approvalPolicy = (() => {
          switch (message.mode.permissionMode) {
            // Codex native modes
            case "default":
              return "untrusted";
            // Ask for non-trusted commands
            case "read-only":
              return "never";
            // Never ask, read-only enforced by sandbox
            case "safe-yolo":
              return "on-failure";
            // Auto-run, ask only on failure
            case "yolo":
              return "on-failure";
            // Auto-run, ask only on failure
            // Defensive fallback for Claude-specific modes (backward compatibility)
            case "bypassPermissions":
              return "on-failure";
            // Full access: map to yolo behavior
            case "acceptEdits":
              return "on-request";
            // Let model decide (closest to auto-approve edits)
            case "plan":
              return "untrusted";
            // Conservative: ask for non-trusted
            default:
              return "untrusted";
          }
        })();
        const sandbox = (() => {
          switch (message.mode.permissionMode) {
            // Codex native modes
            case "default":
              return "workspace-write";
            // Can write in workspace
            case "read-only":
              return "read-only";
            // Read-only filesystem
            case "safe-yolo":
              return "workspace-write";
            // Can write in workspace
            case "yolo":
              return "danger-full-access";
            // Full system access
            // Defensive fallback for Claude-specific modes
            case "bypassPermissions":
              return "danger-full-access";
            // Full access: map to yolo
            case "acceptEdits":
              return "workspace-write";
            // Can edit files in workspace
            case "plan":
              return "workspace-write";
            // Can write for planning
            default:
              return "workspace-write";
          }
        })();
        if (!wasCreated) {
          const startConfig = {
            prompt: first ? message.message + "\n\n" + constants.CHANGE_TITLE_INSTRUCTION : message.message,
            sandbox,
            "approval-policy": approvalPolicy,
            config: { mcp_servers: mcpServers }
          };
          if (message.mode.model) {
            startConfig.model = message.mode.model;
          }
          let resumeFile = null;
          if (nextExperimentalResume) {
            resumeFile = nextExperimentalResume;
            nextExperimentalResume = null;
            api.logger.debug("[Codex] Using resume file from mode change:", resumeFile);
          } else if (storedSessionIdForResume) {
            const abortResumeFile = findCodexResumeFile(storedSessionIdForResume);
            if (abortResumeFile) {
              resumeFile = abortResumeFile;
              api.logger.debug("[Codex] Using resume file from aborted session:", resumeFile);
              messageBuffer.addMessage("Resuming from aborted session...", "status");
            }
            storedSessionIdForResume = null;
          }
          if (resumeFile) {
            startConfig.config.experimental_resume = resumeFile;
          }
          await client.startSession(
            startConfig,
            { signal: abortController.signal }
          );
          wasCreated = true;
          first = false;
        } else {
          const response2 = await client.continueSession(
            message.message,
            { signal: abortController.signal }
          );
          api.logger.debug("[Codex] continueSession response:", response2);
        }
      } catch (error) {
        api.logger.warn("Error in codex session:", error);
        const isAbortError = error instanceof Error && error.name === "AbortError";
        if (isAbortError) {
          messageBuffer.addMessage("Aborted by user", "status");
          session.sendSessionEvent({ type: "message", message: "Aborted by user" });
        } else {
          messageBuffer.addMessage("Process exited unexpectedly", "status");
          session.sendSessionEvent({ type: "message", message: "Process exited unexpectedly" });
          if (client.hasActiveSession()) {
            storedSessionIdForResume = client.storeSessionForResume();
            api.logger.debug("[Codex] Stored session after unexpected error:", storedSessionIdForResume);
          }
        }
      } finally {
        permissionHandler.reset();
        reasoningProcessor.abort();
        diffProcessor.reset();
        thinking = false;
        session.keepAlive(thinking, "remote");
        emitReadyIfIdle({
          pending,
          queueSize: () => messageQueue.size(),
          shouldExit,
          sendReady
        });
        logActiveHandles("after-turn");
      }
    }
  } finally {
    api.logger.debug("[codex]: Final cleanup start");
    logActiveHandles("cleanup-start");
    if (reconnectionHandle) {
      api.logger.debug("[codex]: Cancelling offline reconnection");
      reconnectionHandle.cancel();
    }
    try {
      api.logger.debug("[codex]: sendSessionDeath");
      session.sendSessionDeath();
      api.logger.debug("[codex]: flush begin");
      await session.flush();
      api.logger.debug("[codex]: flush done");
      api.logger.debug("[codex]: session.close begin");
      await session.close();
      api.logger.debug("[codex]: session.close done");
    } catch (e) {
      api.logger.debug("[codex]: Error while closing session", e);
    }
    api.logger.debug("[codex]: client.forceCloseSession begin");
    await client.forceCloseSession();
    api.logger.debug("[codex]: client.forceCloseSession done");
    api.logger.debug("[codex]: happyServer.stop");
    happyServer.stop();
    if (process.stdin.isTTY) {
      api.logger.debug("[codex]: setRawMode(false)");
      try {
        process.stdin.setRawMode(false);
      } catch {
      }
    }
    if (hasTTY) {
      api.logger.debug("[codex]: stdin.pause()");
      try {
        process.stdin.pause();
      } catch {
      }
    }
    api.logger.debug("[codex]: clearInterval(keepAlive)");
    clearInterval(keepAliveInterval);
    if (inkInstance) {
      api.logger.debug("[codex]: inkInstance.unmount()");
      inkInstance.unmount();
    }
    messageBuffer.clear();
    logActiveHandles("cleanup-end");
    api.logger.debug("[codex]: Final cleanup completed");
  }
}

exports.emitReadyIfIdle = emitReadyIfIdle;
exports.runCodex = runCodex;
