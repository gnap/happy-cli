import { l as logger } from './registerKillSessionHandler-Doe9-t5n.mjs';
import { randomUUID } from 'node:crypto';

class BasePermissionHandler {
  pendingRequests = /* @__PURE__ */ new Map();
  session;
  isResetting = false;
  constructor(session) {
    this.session = session;
    this.setupRpcHandler();
  }
  /**
   * Update the session reference (used after offline reconnection swaps sessions).
   * This is critical for avoiding stale session references after onSessionSwap.
   */
  updateSession(newSession) {
    logger.debug(`${this.getLogPrefix()} Session reference updated`);
    this.session = newSession;
    this.setupRpcHandler();
  }
  /**
   * Setup RPC handler for permission responses.
   */
  setupRpcHandler() {
    this.session.rpcHandlerManager.registerHandler(
      "permission",
      async (response) => {
        const pending = this.pendingRequests.get(response.id);
        if (!pending) {
          logger.debug(`${this.getLogPrefix()} Permission request not found or already resolved`);
          return;
        }
        this.pendingRequests.delete(response.id);
        const result = response.approved ? { decision: response.decision === "approved_for_session" ? "approved_for_session" : "approved" } : { decision: response.decision === "denied" ? "denied" : "abort" };
        pending.resolve(result);
        this.session.updateAgentState((currentState) => {
          const request = currentState.requests?.[response.id];
          if (!request) return currentState;
          const { [response.id]: _, ...remainingRequests } = currentState.requests || {};
          let res = {
            ...currentState,
            requests: remainingRequests,
            completedRequests: {
              ...currentState.completedRequests,
              [response.id]: {
                ...request,
                completedAt: Date.now(),
                status: response.approved ? "approved" : "denied",
                decision: result.decision
              }
            }
          };
          return res;
        });
        logger.debug(`${this.getLogPrefix()} Permission ${response.approved ? "approved" : "denied"} for ${pending.toolName}`);
      }
    );
  }
  /**
   * Add a pending request to the agent state.
   */
  addPendingRequestToState(toolCallId, toolName, input) {
    this.session.updateAgentState((currentState) => ({
      ...currentState,
      requests: {
        ...currentState.requests,
        [toolCallId]: {
          tool: toolName,
          arguments: input,
          createdAt: Date.now()
        }
      }
    }));
  }
  /**
   * Reset state for new sessions.
   * This method is idempotent - safe to call multiple times.
   */
  reset() {
    if (this.isResetting) {
      logger.debug(`${this.getLogPrefix()} Reset already in progress, skipping`);
      return;
    }
    this.isResetting = true;
    try {
      const pendingSnapshot = Array.from(this.pendingRequests.entries());
      this.pendingRequests.clear();
      for (const [id, pending] of pendingSnapshot) {
        try {
          pending.reject(new Error("Session reset"));
        } catch (err) {
          logger.debug(`${this.getLogPrefix()} Error rejecting pending request ${id}:`, err);
        }
      }
      this.session.updateAgentState((currentState) => {
        const pendingRequests = currentState.requests || {};
        const completedRequests = { ...currentState.completedRequests };
        for (const [id, request] of Object.entries(pendingRequests)) {
          completedRequests[id] = {
            ...request,
            completedAt: Date.now(),
            status: "canceled",
            reason: "Session reset"
          };
        }
        return {
          ...currentState,
          requests: {},
          completedRequests
        };
      });
      logger.debug(`${this.getLogPrefix()} Permission handler reset`);
    } finally {
      this.isResetting = false;
    }
  }
}

class BaseReasoningProcessor {
  accumulator = "";
  inTitleCapture = false;
  titleBuffer = "";
  contentBuffer = "";
  hasTitle = false;
  currentCallId = null;
  toolCallStarted = false;
  currentTitle = null;
  onMessage = null;
  constructor(onMessage) {
    this.onMessage = onMessage || null;
    this.reset();
  }
  /**
   * Set the message callback for sending messages directly.
   */
  setMessageCallback(callback) {
    this.onMessage = callback;
  }
  /**
   * Process a reasoning section break - indicates a new reasoning section is starting.
   */
  handleSectionBreak() {
    this.finishCurrentToolCall("canceled");
    this.resetState();
    logger.debug(`${this.getLogPrefix()} Section break - reset state`);
  }
  /**
   * Process a reasoning delta/chunk and accumulate content.
   */
  processInput(input) {
    this.accumulator += input;
    if (!this.inTitleCapture && !this.hasTitle && !this.contentBuffer) {
      if (this.accumulator.startsWith("**")) {
        this.inTitleCapture = true;
        this.titleBuffer = this.accumulator.substring(2);
        logger.debug(`${this.getLogPrefix()} Started title capture`);
      } else if (this.accumulator.length > 0) {
        this.contentBuffer = this.accumulator;
      }
    } else if (this.inTitleCapture) {
      this.titleBuffer = this.accumulator.substring(2);
      const titleEndIndex = this.titleBuffer.indexOf("**");
      if (titleEndIndex !== -1) {
        const title = this.titleBuffer.substring(0, titleEndIndex);
        const afterTitle = this.titleBuffer.substring(titleEndIndex + 2);
        this.hasTitle = true;
        this.inTitleCapture = false;
        this.currentTitle = title;
        this.contentBuffer = afterTitle;
        this.currentCallId = randomUUID();
        logger.debug(`${this.getLogPrefix()} Title captured: "${title}"`);
        this.sendToolCallStart(title);
      }
    } else if (this.hasTitle) {
      const titleStartIndex = this.accumulator.indexOf("**");
      if (titleStartIndex !== -1) {
        this.contentBuffer = this.accumulator.substring(
          titleStartIndex + 2 + this.currentTitle.length + 2
        );
      }
    } else {
      this.contentBuffer = this.accumulator;
    }
  }
  /**
   * Send the tool call start message.
   */
  sendToolCallStart(title) {
    if (!this.currentCallId || this.toolCallStarted) {
      return;
    }
    const toolCall = {
      type: "tool-call",
      name: this.getToolName(),
      callId: this.currentCallId,
      input: {
        title
      },
      id: randomUUID()
    };
    logger.debug(`${this.getLogPrefix()} Sending tool call start for: "${title}"`);
    this.onMessage?.(toolCall);
    this.toolCallStarted = true;
  }
  /**
   * Complete the reasoning section.
   * Returns true if reasoning was completed, false if there was nothing to complete.
   */
  completeReasoning(fullText) {
    const text = fullText ?? this.accumulator;
    if (!text.trim() && !this.toolCallStarted) {
      logger.debug(`${this.getLogPrefix()} Complete called but no content accumulated, skipping`);
      return false;
    }
    let title;
    let content = text;
    if (text.startsWith("**")) {
      const titleEndIndex = text.indexOf("**", 2);
      if (titleEndIndex !== -1) {
        title = text.substring(2, titleEndIndex);
        content = text.substring(titleEndIndex + 2).trim();
      }
    }
    logger.debug(`${this.getLogPrefix()} Complete reasoning - Title: "${title}", Has content: ${content.length > 0}`);
    if (title && !this.toolCallStarted) {
      this.currentCallId = this.currentCallId || randomUUID();
      this.sendToolCallStart(title);
    }
    if (this.toolCallStarted && this.currentCallId) {
      const toolResult = {
        type: "tool-call-result",
        callId: this.currentCallId,
        output: {
          content,
          status: "completed"
        },
        id: randomUUID()
      };
      logger.debug(`${this.getLogPrefix()} Sending tool call result`);
      this.onMessage?.(toolResult);
    } else if (content.trim()) {
      const reasoningMessage = {
        type: "reasoning",
        message: content,
        id: randomUUID()
      };
      logger.debug(`${this.getLogPrefix()} Sending reasoning message`);
      this.onMessage?.(reasoningMessage);
    }
    this.resetState();
    return true;
  }
  /**
   * Abort the current reasoning section.
   */
  abort() {
    logger.debug(`${this.getLogPrefix()} Abort called`);
    this.finishCurrentToolCall("canceled");
    this.resetState();
  }
  /**
   * Reset the processor state.
   */
  reset() {
    this.finishCurrentToolCall("canceled");
    this.resetState();
  }
  /**
   * Finish current tool call if one is in progress.
   */
  finishCurrentToolCall(status) {
    if (this.toolCallStarted && this.currentCallId) {
      const toolResult = {
        type: "tool-call-result",
        callId: this.currentCallId,
        output: {
          content: this.contentBuffer || "",
          status
        },
        id: randomUUID()
      };
      logger.debug(`${this.getLogPrefix()} Sending tool call result with status: ${status}`);
      this.onMessage?.(toolResult);
    }
  }
  /**
   * Reset internal state.
   */
  resetState() {
    this.accumulator = "";
    this.inTitleCapture = false;
    this.titleBuffer = "";
    this.contentBuffer = "";
    this.hasTitle = false;
    this.currentCallId = null;
    this.toolCallStarted = false;
    this.currentTitle = null;
  }
  /**
   * Get the current call ID for tool result matching.
   */
  getCurrentCallId() {
    return this.currentCallId;
  }
  /**
   * Check if a tool call has been started.
   */
  hasStartedToolCall() {
    return this.toolCallStarted;
  }
}

export { BasePermissionHandler as B, BaseReasoningProcessor as a };
