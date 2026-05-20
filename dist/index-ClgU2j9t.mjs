import{createRequire as _pkgrollCR}from"node:module";const require=_pkgrollCR(import.meta.url);import chalk from 'chalk';
import os, { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { l as logger, p as projectPath, m as backoff, k as delay, R as RawJSONLinesSchema, o as isBun, q as AsyncLock, c as configuration, t as getEnvironmentInfo, f as connectionState, A as ApiClient, b as readSettings, i as initialMachineMetadata, g as packageJson, j as startOfflineReconnection, e as stopCaffeinate, n as notifyDaemonSessionStarted, s as startHappyServer, u as startCaffeinate, M as MessageQueue2, h as hashObject, d as registerKillSessionHandler, r as readCredentials, v as checkIfDaemonRunningAndCleanupStaleState, w as stopDaemon, x as clearCredentials, y as clearMachineId, z as authAndSetupMachineIfNeeded, B as openBrowser, C as killRunawayHappyProcesses, D as runDoctorCommand, E as isDaemonRunningCurrentlyInstalledHappyVersion, F as spawnHappyCLI, G as listDaemonSessions, H as stopDaemonSession, I as startDaemon, J as getLatestDaemonLog } from './registerKillSessionHandler-C8ArcSFa.mjs';
import { spawn, execSync, execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { createInterface } from 'node:readline';
import { existsSync, readFileSync, readdirSync, statSync, mkdirSync, writeFileSync, unlinkSync, rmSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { watch, access } from 'fs/promises';
import { useStdout, useInput, Box, Text, render } from 'ink';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fileURLToPath } from 'node:url';
import 'axios';
import 'node:events';
import 'socket.io-client';
import 'tweetnacl';
import 'expo-server-sdk';
import { randomBytes, createHash } from 'crypto';
import '@modelcontextprotocol/sdk/server/mcp.js';
import { createServer } from 'node:http';
import '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { existsSync as existsSync$1, writeFileSync as writeFileSync$1, chmodSync, unlinkSync as unlinkSync$1, mkdirSync as mkdirSync$1 } from 'fs';
import { join as join$1 } from 'path';
import { execSync as execSync$1, exec } from 'child_process';
import { isDeepStrictEqual } from 'node:util';
import os$1, { homedir as homedir$1 } from 'os';
import { createServer as createServer$1 } from 'http';
import { promisify } from 'util';

class Session {
  path;
  logPath;
  api;
  client;
  queue;
  claudeEnvVars;
  claudeArgs;
  // Made mutable to allow filtering
  mcpServers;
  allowedTools;
  _onModeChange;
  /** Path to temporary settings file with SessionStart hook (required for session tracking) */
  hookSettingsPath;
  /** JavaScript runtime to use for spawning Claude Code (default: 'node') */
  jsRuntime;
  sessionId;
  mode = "local";
  thinking = false;
  /** Callbacks to be notified when session ID is found/changed */
  sessionFoundCallbacks = [];
  /** Keep alive interval reference for cleanup */
  keepAliveInterval;
  constructor(opts) {
    this.path = opts.path;
    this.api = opts.api;
    this.client = opts.client;
    this.logPath = opts.logPath;
    this.sessionId = opts.sessionId;
    this.queue = opts.messageQueue;
    this.claudeEnvVars = opts.claudeEnvVars;
    this.claudeArgs = opts.claudeArgs;
    this.mcpServers = opts.mcpServers;
    this.allowedTools = opts.allowedTools;
    this._onModeChange = opts.onModeChange;
    this.hookSettingsPath = opts.hookSettingsPath;
    this.jsRuntime = opts.jsRuntime ?? "node";
    this.client.keepAlive(this.thinking, this.mode);
    this.keepAliveInterval = setInterval(() => {
      this.client.keepAlive(this.thinking, this.mode);
    }, 2e3);
  }
  /**
   * Cleanup resources (call when session is no longer needed)
   */
  cleanup = () => {
    clearInterval(this.keepAliveInterval);
    this.sessionFoundCallbacks = [];
    logger.debug("[Session] Cleaned up resources");
  };
  onThinkingChange = (thinking) => {
    this.thinking = thinking;
    this.client.keepAlive(thinking, this.mode);
  };
  onModeChange = (mode) => {
    this.mode = mode;
    this.client.keepAlive(this.thinking, mode);
    this._onModeChange(mode);
  };
  /**
   * Called when Claude session ID is discovered or changed.
   * 
   * This is triggered by the SessionStart hook when:
   * - Claude starts a new session (fresh start)
   * - Claude resumes a session (--continue, --resume flags)
   * - Claude forks a session (/compact, double-escape fork)
   * 
   * Updates internal state, syncs to API metadata, and notifies
   * all registered callbacks (e.g., SessionScanner) about the change.
   */
  onSessionFound = (sessionId) => {
    this.sessionId = sessionId;
    this.client.updateMetadata((metadata) => ({
      ...metadata,
      claudeSessionId: sessionId
    }));
    logger.debug(`[Session] Claude Code session ID ${sessionId} added to metadata`);
    for (const callback of this.sessionFoundCallbacks) {
      callback(sessionId);
    }
  };
  /**
   * Register a callback to be notified when session ID is found/changed
   */
  addSessionFoundCallback = (callback) => {
    this.sessionFoundCallbacks.push(callback);
  };
  /**
   * Remove a session found callback
   */
  removeSessionFoundCallback = (callback) => {
    const index = this.sessionFoundCallbacks.indexOf(callback);
    if (index !== -1) {
      this.sessionFoundCallbacks.splice(index, 1);
    }
  };
  /**
   * Clear the current session ID (used by /clear command)
   */
  clearSessionId = () => {
    this.sessionId = null;
    logger.debug("[Session] Session ID cleared");
  };
  /**
   * Consume one-time Claude flags from claudeArgs after Claude spawn
   * Handles: --resume (with or without session ID), --continue
   */
  consumeOneTimeFlags = () => {
    if (!this.claudeArgs) return;
    const filteredArgs = [];
    for (let i = 0; i < this.claudeArgs.length; i++) {
      const arg = this.claudeArgs[i];
      if (arg === "--continue") {
        logger.debug("[Session] Consumed --continue flag");
        continue;
      }
      if (arg === "--resume") {
        if (i + 1 < this.claudeArgs.length) {
          const nextArg = this.claudeArgs[i + 1];
          if (!nextArg.startsWith("-") && nextArg.includes("-")) {
            i++;
            logger.debug(`[Session] Consumed --resume flag with session ID: ${nextArg}`);
          } else {
            logger.debug("[Session] Consumed --resume flag (no session ID)");
          }
        } else {
          logger.debug("[Session] Consumed --resume flag (no session ID)");
        }
        continue;
      }
      filteredArgs.push(arg);
    }
    this.claudeArgs = filteredArgs.length > 0 ? filteredArgs : void 0;
    logger.debug(`[Session] Consumed one-time flags, remaining args:`, this.claudeArgs);
  };
}

function getProjectPath(workingDirectory) {
  const projectId = resolve(workingDirectory).replace(/[\\\/\.: _]/g, "-");
  const claudeConfigDir = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
  return join(claudeConfigDir, "projects", projectId);
}

function claudeCheckSession(sessionId, path) {
  const projectDir = getProjectPath(path);
  const sessionFile = join(projectDir, `${sessionId}.jsonl`);
  const sessionExists = existsSync(sessionFile);
  if (!sessionExists) {
    logger.debug(`[claudeCheckSession] Path ${sessionFile} does not exist`);
    return false;
  }
  const sessionData = readFileSync(sessionFile, "utf-8").split("\n");
  const hasGoodMessage = !!sessionData.find((v, index) => {
    if (!v.trim()) return false;
    try {
      const parsed = JSON.parse(v);
      return typeof parsed.uuid === "string" && parsed.uuid.length > 0 || // Claude Code 2.1.x
      typeof parsed.messageId === "string" && parsed.messageId.length > 0 || // Older Claude Code
      typeof parsed.leafUuid === "string" && parsed.leafUuid.length > 0;
    } catch (e) {
      logger.debug(`[claudeCheckSession] Malformed JSON at line ${index + 1}:`, e);
      return false;
    }
  });
  logger.debug(`[claudeCheckSession] Session ${sessionId}: ${hasGoodMessage ? "valid" : "invalid"}`);
  return hasGoodMessage;
}

function claudeFindLastSession(workingDirectory) {
  try {
    const projectDir = getProjectPath(workingDirectory);
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const files = readdirSync(projectDir).filter((f) => f.endsWith(".jsonl")).map((f) => {
      const sessionId = f.replace(".jsonl", "");
      if (!uuidPattern.test(sessionId)) {
        return null;
      }
      if (claudeCheckSession(sessionId, workingDirectory)) {
        return {
          name: f,
          sessionId,
          mtime: statSync(join(projectDir, f)).mtime.getTime()
        };
      }
      return null;
    }).filter((f) => f !== null).sort((a, b) => b.mtime - a.mtime);
    return files.length > 0 ? files[0].sessionId : null;
  } catch (e) {
    logger.debug("[claudeFindLastSession] Error finding sessions:", e);
    return null;
  }
}

function trimIdent(text) {
  const lines = text.split("\n");
  while (lines.length > 0 && lines[0].trim() === "") {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  const minSpaces = lines.reduce((min, line) => {
    if (line.trim() === "") {
      return min;
    }
    const leadingSpaces = line.match(/^\s*/)[0].length;
    return Math.min(min, leadingSpaces);
  }, Infinity);
  const trimmedLines = lines.map((line) => line.slice(minSpaces));
  return trimmedLines.join("\n");
}

function getClaudeSettingsPath() {
  const claudeConfigDir = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
  return join(claudeConfigDir, "settings.json");
}
function readClaudeSettings() {
  try {
    const settingsPath = getClaudeSettingsPath();
    if (!existsSync(settingsPath)) {
      logger.debug(`[ClaudeSettings] No Claude settings file found at ${settingsPath}`);
      return null;
    }
    const settingsContent = readFileSync(settingsPath, "utf-8");
    const settings = JSON.parse(settingsContent);
    logger.debug(`[ClaudeSettings] Successfully read Claude settings from ${settingsPath}`);
    logger.debug(`[ClaudeSettings] includeCoAuthoredBy: ${settings.includeCoAuthoredBy}`);
    return settings;
  } catch (error) {
    logger.debug(`[ClaudeSettings] Error reading Claude settings: ${error}`);
    return null;
  }
}
function shouldIncludeCoAuthoredBy() {
  const settings = readClaudeSettings();
  if (!settings || settings.includeCoAuthoredBy === void 0) {
    return true;
  }
  return settings.includeCoAuthoredBy;
}

const BASE_SYSTEM_PROMPT = (() => trimIdent(`
    ALWAYS when you start a new chat - you must call a tool "mcp__happy__change_title" to set a chat title. When you think chat title is not relevant anymore - call the tool again to change it. When chat name is too generic and you have a change to make it more specific - call the tool again to change it. This title is needed to easily find the chat in the future. Help human.
`))();
const CO_AUTHORED_CREDITS = (() => trimIdent(`
    When making commit messages, instead of just giving co-credit to Claude, also give credit to Happy like so:

    <main commit message>

    Generated with [Claude Code](https://claude.ai/code)
    via [Happy](https://happy.engineering)

    Co-Authored-By: Claude <noreply@anthropic.com>
    Co-Authored-By: Happy <yesreply@happy.engineering>
`))();
const systemPrompt = (() => {
  const includeCoAuthored = shouldIncludeCoAuthoredBy();
  if (includeCoAuthored) {
    return BASE_SYSTEM_PROMPT + "\n\n" + CO_AUTHORED_CREDITS;
  } else {
    return BASE_SYSTEM_PROMPT;
  }
})();

const claudeCliPath = resolve(join(projectPath(), "scripts", "claude_local_launcher.cjs"));
async function claudeLocal(opts) {
  const projectDir = getProjectPath(opts.path);
  mkdirSync(projectDir, { recursive: true });
  const hasContinueFlag = opts.claudeArgs?.includes("--continue");
  const hasResumeFlag = opts.claudeArgs?.includes("--resume");
  const hasUserSessionControl = hasContinueFlag || hasResumeFlag;
  let startFrom = opts.sessionId;
  const extractFlag = (flags, withValue = false) => {
    if (!opts.claudeArgs) return { found: false };
    for (const flag of flags) {
      const index = opts.claudeArgs.indexOf(flag);
      if (index !== -1) {
        if (withValue && index + 1 < opts.claudeArgs.length) {
          const nextArg = opts.claudeArgs[index + 1];
          if (!nextArg.startsWith("-")) {
            const value = nextArg;
            opts.claudeArgs = opts.claudeArgs.filter((_, i) => i !== index && i !== index + 1);
            return { found: true, value };
          }
        }
        if (!withValue) {
          opts.claudeArgs = opts.claudeArgs.filter((_, i) => i !== index);
          return { found: true };
        }
        return { found: false };
      }
    }
    return { found: false };
  };
  const sessionIdFlag = extractFlag(["--session-id"], true);
  if (sessionIdFlag.found && sessionIdFlag.value) {
    startFrom = null;
    logger.debug(`[ClaudeLocal] Using explicit --session-id: ${sessionIdFlag.value}`);
  }
  if (!startFrom && !sessionIdFlag.value) {
    const resumeFlag = extractFlag(["--resume", "-r"], true);
    if (resumeFlag.found) {
      if (resumeFlag.value) {
        startFrom = resumeFlag.value;
        logger.debug(`[ClaudeLocal] Using provided session ID from --resume: ${startFrom}`);
      } else {
        const lastSession = claudeFindLastSession(opts.path);
        if (lastSession) {
          startFrom = lastSession;
          logger.debug(`[ClaudeLocal] --resume: Found last session: ${lastSession}`);
        }
      }
    }
  }
  if (!startFrom && !sessionIdFlag.value) {
    const continueFlag = extractFlag(["--continue", "-c"], false);
    if (continueFlag.found) {
      const lastSession = claudeFindLastSession(opts.path);
      if (lastSession) {
        startFrom = lastSession;
        logger.debug(`[ClaudeLocal] --continue: Found last session: ${lastSession}`);
      }
    }
  }
  const explicitSessionId = sessionIdFlag.value || null;
  let newSessionId = null;
  let effectiveSessionId = startFrom;
  if (!opts.hookSettingsPath) {
    newSessionId = startFrom ? null : explicitSessionId || randomUUID();
    effectiveSessionId = startFrom || newSessionId;
    if (startFrom) {
      logger.debug(`[ClaudeLocal] Resuming session: ${startFrom}`);
      opts.onSessionFound(startFrom);
    } else if (explicitSessionId) {
      logger.debug(`[ClaudeLocal] Using explicit session ID: ${explicitSessionId}`);
      opts.onSessionFound(explicitSessionId);
    } else {
      logger.debug(`[ClaudeLocal] Generated new session ID: ${newSessionId}`);
      opts.onSessionFound(newSessionId);
    }
  } else {
    if (startFrom) {
      logger.debug(`[ClaudeLocal] Will resume existing session: ${startFrom}`);
    } else if (hasUserSessionControl) {
      logger.debug(`[ClaudeLocal] User passed ${hasContinueFlag ? "--continue" : "--resume"} flag, session ID will be determined by hook`);
    } else {
      logger.debug(`[ClaudeLocal] Fresh start, session ID will be provided by hook`);
    }
  }
  let thinking = false;
  let stopThinkingTimeout = null;
  const updateThinking = (newThinking) => {
    if (thinking !== newThinking) {
      thinking = newThinking;
      logger.debug(`[ClaudeLocal] Thinking state changed to: ${thinking}`);
      if (opts.onThinkingChange) {
        opts.onThinkingChange(thinking);
      }
    }
  };
  try {
    process.stdin.pause();
    await new Promise((r, reject) => {
      const args = [];
      if (!opts.hookSettingsPath) {
        const hasResumeFlag2 = opts.claudeArgs?.includes("--resume") || opts.claudeArgs?.includes("-r");
        if (startFrom) {
          args.push("--resume", startFrom);
        } else if (!hasResumeFlag2 && newSessionId) {
          args.push("--session-id", newSessionId);
        }
      } else {
        if (startFrom) {
          args.push("--resume", startFrom);
        }
      }
      args.push("--append-system-prompt", systemPrompt);
      if (opts.mcpServers && Object.keys(opts.mcpServers).length > 0) {
        args.push("--mcp-config", JSON.stringify({ mcpServers: opts.mcpServers }));
      }
      if (opts.allowedTools && opts.allowedTools.length > 0) {
        args.push("--allowedTools", opts.allowedTools.join(","));
      }
      if (opts.claudeArgs) {
        args.push(...opts.claudeArgs);
      }
      if (opts.hookSettingsPath) {
        args.push("--settings", opts.hookSettingsPath);
        logger.debug(`[ClaudeLocal] Using hook settings: ${opts.hookSettingsPath}`);
      }
      if (!claudeCliPath || !existsSync(claudeCliPath)) {
        throw new Error("Claude local launcher not found. Please ensure HAPPY_PROJECT_ROOT is set correctly for development.");
      }
      const env = {
        ...process.env,
        ...opts.claudeEnvVars
      };
      logger.debug(`[ClaudeLocal] Spawning launcher: ${claudeCliPath}`);
      logger.debug(`[ClaudeLocal] Args: ${JSON.stringify(args)}`);
      const child = spawn("node", [claudeCliPath, ...args], {
        stdio: ["inherit", "inherit", "inherit", "pipe"],
        signal: opts.abort,
        cwd: opts.path,
        env
      });
      if (child.stdio[3]) {
        const rl = createInterface({
          input: child.stdio[3],
          crlfDelay: Infinity
        });
        const activeFetches = /* @__PURE__ */ new Map();
        rl.on("line", (line) => {
          try {
            const message = JSON.parse(line);
            switch (message.type) {
              case "fetch-start":
                activeFetches.set(message.id, {
                  hostname: message.hostname,
                  path: message.path,
                  startTime: message.timestamp
                });
                if (stopThinkingTimeout) {
                  clearTimeout(stopThinkingTimeout);
                  stopThinkingTimeout = null;
                }
                updateThinking(true);
                break;
              case "fetch-end":
                activeFetches.delete(message.id);
                if (activeFetches.size === 0 && thinking && !stopThinkingTimeout) {
                  stopThinkingTimeout = setTimeout(() => {
                    if (activeFetches.size === 0) {
                      updateThinking(false);
                    }
                    stopThinkingTimeout = null;
                  }, 500);
                }
                break;
              default:
                logger.debug(`[ClaudeLocal] Unknown message type: ${message.type}`);
            }
          } catch (e) {
            logger.debug(`[ClaudeLocal] Non-JSON line from fd3: ${line}`);
          }
        });
        rl.on("error", (err) => {
          console.error("Error reading from fd 3:", err);
        });
        child.on("exit", () => {
          if (stopThinkingTimeout) {
            clearTimeout(stopThinkingTimeout);
          }
          updateThinking(false);
        });
      }
      child.on("error", (error) => {
      });
      child.on("exit", (code, signal) => {
        if (signal === "SIGTERM" && opts.abort.aborted) {
          r();
        } else if (signal) {
          reject(new Error(`Process terminated with signal: ${signal}`));
        } else {
          r();
        }
      });
    });
  } finally {
    process.stdin.resume();
    if (stopThinkingTimeout) {
      clearTimeout(stopThinkingTimeout);
      stopThinkingTimeout = null;
    }
    updateThinking(false);
  }
  return effectiveSessionId;
}

class Future {
  _resolve;
  _reject;
  _promise;
  constructor() {
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
  resolve(value) {
    this._resolve(value);
  }
  reject(reason) {
    this._reject(reason);
  }
  get promise() {
    return this._promise;
  }
}

class InvalidateSync {
  _invalidated = false;
  _invalidatedDouble = false;
  _stopped = false;
  _command;
  _pendings = [];
  constructor(command) {
    this._command = command;
  }
  invalidate() {
    if (this._stopped) {
      return;
    }
    if (!this._invalidated) {
      this._invalidated = true;
      this._invalidatedDouble = false;
      this._doSync();
    } else {
      if (!this._invalidatedDouble) {
        this._invalidatedDouble = true;
      }
    }
  }
  async invalidateAndAwait() {
    if (this._stopped) {
      return;
    }
    await new Promise((resolve) => {
      this._pendings.push(resolve);
      this.invalidate();
    });
  }
  stop() {
    if (this._stopped) {
      return;
    }
    this._notifyPendings();
    this._stopped = true;
  }
  _notifyPendings = () => {
    for (let pending of this._pendings) {
      pending();
    }
    this._pendings = [];
  };
  _doSync = async () => {
    await backoff(async () => {
      if (this._stopped) {
        return;
      }
      await this._command();
    });
    if (this._stopped) {
      this._notifyPendings();
      return;
    }
    if (this._invalidatedDouble) {
      this._invalidatedDouble = false;
      this._doSync();
    } else {
      this._invalidated = false;
      this._notifyPendings();
    }
  };
}

function startFileWatcher(file, onFileChange) {
  const abortController = new AbortController();
  void (async () => {
    while (true) {
      try {
        logger.debug(`[FILE_WATCHER] Starting watcher for ${file}`);
        const watcher = watch(file, { persistent: true, signal: abortController.signal });
        for await (const event of watcher) {
          if (abortController.signal.aborted) {
            return;
          }
          logger.debug(`[FILE_WATCHER] File changed: ${file}`);
          onFileChange(file);
        }
      } catch (e) {
        if (abortController.signal.aborted) {
          return;
        }
        logger.debug(`[FILE_WATCHER] Watch error: ${e.message}, restarting watcher in a second`);
        await delay(1e3);
      }
    }
  })();
  return () => {
    abortController.abort();
  };
}

const INTERNAL_CLAUDE_EVENT_TYPES = /* @__PURE__ */ new Set([
  "file-history-snapshot",
  "change",
  "queue-operation"
]);
async function createSessionScanner(opts) {
  const projectDir = getProjectPath(opts.workingDirectory);
  let finishedSessions = /* @__PURE__ */ new Set();
  let pendingSessions = /* @__PURE__ */ new Set();
  let currentSessionId = null;
  let watchers = /* @__PURE__ */ new Map();
  let processedMessageKeys = /* @__PURE__ */ new Set();
  if (opts.sessionId) {
    let messages = await readSessionLog(projectDir, opts.sessionId);
    logger.debug(`[SESSION_SCANNER] Marking ${messages.length} existing messages as processed from session ${opts.sessionId}`);
    for (let m of messages) {
      processedMessageKeys.add(messageKey(m));
    }
    currentSessionId = opts.sessionId;
  }
  const sync = new InvalidateSync(async () => {
    let sessions = [];
    for (let p of pendingSessions) {
      sessions.push(p);
    }
    if (currentSessionId && !pendingSessions.has(currentSessionId)) {
      sessions.push(currentSessionId);
    }
    for (let [sessionId] of watchers) {
      if (!sessions.includes(sessionId)) {
        sessions.push(sessionId);
      }
    }
    for (let session of sessions) {
      const sessionMessages = await readSessionLog(projectDir, session);
      let skipped = 0;
      let sent = 0;
      for (let file of sessionMessages) {
        let key = messageKey(file);
        if (processedMessageKeys.has(key)) {
          skipped++;
          continue;
        }
        processedMessageKeys.add(key);
        logger.debug(`[SESSION_SCANNER] Sending new message: type=${file.type}, uuid=${file.type === "summary" ? file.leafUuid : file.uuid}`);
        opts.onMessage(file);
        sent++;
      }
      if (sessionMessages.length > 0) {
        logger.debug(`[SESSION_SCANNER] Session ${session}: found=${sessionMessages.length}, skipped=${skipped}, sent=${sent}`);
      }
    }
    for (let p of sessions) {
      if (pendingSessions.has(p)) {
        pendingSessions.delete(p);
        finishedSessions.add(p);
      }
    }
    for (let p of sessions) {
      if (!watchers.has(p)) {
        logger.debug(`[SESSION_SCANNER] Starting watcher for session: ${p}`);
        watchers.set(p, startFileWatcher(join(projectDir, `${p}.jsonl`), () => {
          sync.invalidate();
        }));
      }
    }
  });
  await sync.invalidateAndAwait();
  const intervalId = setInterval(() => {
    sync.invalidate();
  }, 3e3);
  return {
    cleanup: async () => {
      clearInterval(intervalId);
      for (let w of watchers.values()) {
        w();
      }
      watchers.clear();
      await sync.invalidateAndAwait();
      sync.stop();
    },
    onNewSession: (sessionId) => {
      if (currentSessionId === sessionId) {
        logger.debug(`[SESSION_SCANNER] New session: ${sessionId} is the same as the current session, skipping`);
        return;
      }
      if (finishedSessions.has(sessionId)) {
        logger.debug(`[SESSION_SCANNER] New session: ${sessionId} is already finished, skipping`);
        return;
      }
      if (pendingSessions.has(sessionId)) {
        logger.debug(`[SESSION_SCANNER] New session: ${sessionId} is already pending, skipping`);
        return;
      }
      if (currentSessionId) {
        pendingSessions.add(currentSessionId);
      }
      logger.debug(`[SESSION_SCANNER] New session: ${sessionId}`);
      currentSessionId = sessionId;
      sync.invalidate();
    }
  };
}
function messageKey(message) {
  if (message.type === "user") {
    return message.uuid;
  } else if (message.type === "assistant") {
    return message.uuid;
  } else if (message.type === "summary") {
    return "summary: " + message.leafUuid + ": " + message.summary;
  } else if (message.type === "system") {
    return message.uuid;
  } else {
    throw Error();
  }
}
async function readSessionLog(projectDir, sessionId) {
  const expectedSessionFile = join(projectDir, `${sessionId}.jsonl`);
  logger.debug(`[SESSION_SCANNER] Reading session file: ${expectedSessionFile}`);
  let file;
  try {
    file = await readFile(expectedSessionFile, "utf-8");
  } catch (error) {
    logger.debug(`[SESSION_SCANNER] Session file not found: ${expectedSessionFile}`);
    return [];
  }
  let lines = file.split("\n");
  let messages = [];
  for (let l of lines) {
    try {
      if (l.trim() === "") {
        continue;
      }
      let message = JSON.parse(l);
      if (message.type && INTERNAL_CLAUDE_EVENT_TYPES.has(message.type)) {
        continue;
      }
      let parsed = RawJSONLinesSchema.safeParse(message);
      if (!parsed.success) {
        continue;
      }
      messages.push(parsed.data);
    } catch (e) {
      logger.debug(`[SESSION_SCANNER] Error processing message: ${e}`);
      continue;
    }
  }
  return messages;
}

async function claudeLocalLauncher(session) {
  const scanner = await createSessionScanner({
    sessionId: session.sessionId,
    workingDirectory: session.path,
    onMessage: (message) => {
      if (message.type !== "summary") {
        session.client.sendClaudeSessionMessage(message);
      }
    }
  });
  const scannerSessionCallback = (sessionId) => {
    scanner.onNewSession(sessionId);
  };
  session.addSessionFoundCallback(scannerSessionCallback);
  let exitReason = null;
  const processAbortController = new AbortController();
  let exutFuture = new Future();
  try {
    async function abort() {
      if (!processAbortController.signal.aborted) {
        processAbortController.abort();
      }
      await exutFuture.promise;
    }
    async function doAbort() {
      logger.debug("[local]: doAbort");
      if (!exitReason) {
        exitReason = "switch";
      }
      session.queue.reset();
      await abort();
    }
    async function doSwitch() {
      logger.debug("[local]: doSwitch");
      if (!exitReason) {
        exitReason = "switch";
      }
      await abort();
    }
    session.client.rpcHandlerManager.registerHandler("abort", doAbort);
    session.client.rpcHandlerManager.registerHandler("switch", doSwitch);
    session.queue.setOnMessage((message, mode) => {
      doSwitch();
    });
    if (session.queue.size() > 0) {
      return "switch";
    }
    const handleSessionStart = (sessionId) => {
      session.onSessionFound(sessionId);
      scanner.onNewSession(sessionId);
    };
    while (true) {
      if (exitReason) {
        return exitReason;
      }
      logger.debug("[local]: launch");
      try {
        await claudeLocal({
          path: session.path,
          sessionId: session.sessionId,
          onSessionFound: handleSessionStart,
          onThinkingChange: session.onThinkingChange,
          abort: processAbortController.signal,
          claudeEnvVars: session.claudeEnvVars,
          claudeArgs: session.claudeArgs,
          mcpServers: session.mcpServers,
          allowedTools: session.allowedTools,
          hookSettingsPath: session.hookSettingsPath
        });
        session.consumeOneTimeFlags();
        if (!exitReason) {
          exitReason = "exit";
          break;
        }
      } catch (e) {
        logger.debug("[local]: launch error", e);
        if (!exitReason) {
          session.client.sendSessionEvent({ type: "message", message: "Process exited unexpectedly" });
          continue;
        } else {
          break;
        }
      }
      logger.debug("[local]: launch done");
    }
  } finally {
    exutFuture.resolve(void 0);
    session.client.rpcHandlerManager.registerHandler("abort", async () => {
    });
    session.client.rpcHandlerManager.registerHandler("switch", async () => {
    });
    session.queue.setOnMessage(null);
    session.removeSessionFoundCallback(scannerSessionCallback);
    await scanner.cleanup();
  }
  return exitReason || "exit";
}

class MessageBuffer {
  messages = [];
  listeners = [];
  nextId = 1;
  addMessage(content, type = "assistant") {
    const message = {
      id: `msg-${this.nextId++}`,
      timestamp: /* @__PURE__ */ new Date(),
      content,
      type
    };
    this.messages.push(message);
    this.notifyListeners();
  }
  /**
   * Update the last message of a specific type by appending content to it
   * Useful for streaming responses where deltas should accumulate in one message
   */
  updateLastMessage(contentDelta, type = "assistant") {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].type === type) {
        const oldMessage = this.messages[i];
        const updatedMessage = {
          ...oldMessage,
          content: oldMessage.content + contentDelta
        };
        this.messages[i] = updatedMessage;
        this.notifyListeners();
        return;
      }
    }
    this.addMessage(contentDelta, type);
  }
  /**
   * Remove the last message of a specific type
   * Useful for removing placeholder messages like "Thinking..." when actual response starts
   */
  removeLastMessage(type) {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].type === type) {
        this.messages.splice(i, 1);
        this.notifyListeners();
        return true;
      }
    }
    return false;
  }
  getMessages() {
    return [...this.messages];
  }
  clear() {
    this.messages = [];
    this.nextId = 1;
    this.notifyListeners();
  }
  onUpdate(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  notifyListeners() {
    const messages = this.getMessages();
    this.listeners.forEach((listener) => listener(messages));
  }
}

const RemoteModeDisplay = ({ messageBuffer, logPath, onExit, onSwitchToLocal }) => {
  const [messages, setMessages] = useState([]);
  const [confirmationMode, setConfirmationMode] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  const confirmationTimeoutRef = useRef(null);
  const { stdout } = useStdout();
  const terminalWidth = stdout.columns || 80;
  const terminalHeight = stdout.rows || 24;
  useEffect(() => {
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
  const resetConfirmation = useCallback(() => {
    setConfirmationMode(null);
    if (confirmationTimeoutRef.current) {
      clearTimeout(confirmationTimeoutRef.current);
      confirmationTimeoutRef.current = null;
    }
  }, []);
  const setConfirmationWithTimeout = useCallback((mode) => {
    setConfirmationMode(mode);
    if (confirmationTimeoutRef.current) {
      clearTimeout(confirmationTimeoutRef.current);
    }
    confirmationTimeoutRef.current = setTimeout(() => {
      resetConfirmation();
    }, 15e3);
  }, [resetConfirmation]);
  useInput(useCallback(async (input, key) => {
    if (actionInProgress) return;
    if (key.ctrl && input === "c") {
      if (confirmationMode === "exit") {
        resetConfirmation();
        setActionInProgress("exiting");
        await new Promise((resolve) => setTimeout(resolve, 100));
        onExit?.();
      } else {
        setConfirmationWithTimeout("exit");
      }
      return;
    }
    if (input === " ") {
      if (confirmationMode === "switch") {
        resetConfirmation();
        setActionInProgress("switching");
        await new Promise((resolve) => setTimeout(resolve, 100));
        onSwitchToLocal?.();
      } else {
        setConfirmationWithTimeout("switch");
      }
      return;
    }
    if (confirmationMode) {
      resetConfirmation();
    }
  }, [confirmationMode, actionInProgress, onExit, onSwitchToLocal, setConfirmationWithTimeout, resetConfirmation]));
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
  return /* @__PURE__ */ React.createElement(Box, { flexDirection: "column", width: terminalWidth, height: terminalHeight }, /* @__PURE__ */ React.createElement(
    Box,
    {
      flexDirection: "column",
      width: terminalWidth,
      height: terminalHeight - 4,
      borderStyle: "round",
      borderColor: "gray",
      paddingX: 1,
      overflow: "hidden"
    },
    /* @__PURE__ */ React.createElement(Box, { flexDirection: "column", marginBottom: 1 }, /* @__PURE__ */ React.createElement(Text, { color: "gray", bold: true }, "\u{1F4E1} Remote Mode - Claude Messages"), /* @__PURE__ */ React.createElement(Text, { color: "gray", dimColor: true }, "\u2500".repeat(Math.min(terminalWidth - 4, 60)))),
    /* @__PURE__ */ React.createElement(Box, { flexDirection: "column", height: terminalHeight - 10, overflow: "hidden" }, messages.length === 0 ? /* @__PURE__ */ React.createElement(Text, { color: "gray", dimColor: true }, "Waiting for messages...") : (
      // Show only the last messages that fit in the available space
      messages.slice(-Math.max(1, terminalHeight - 10)).map((msg) => /* @__PURE__ */ React.createElement(Box, { key: msg.id, flexDirection: "column", marginBottom: 1 }, /* @__PURE__ */ React.createElement(Text, { color: getMessageColor(msg.type), dimColor: true }, formatMessage(msg))))
    ))
  ), /* @__PURE__ */ React.createElement(
    Box,
    {
      width: terminalWidth,
      borderStyle: "round",
      borderColor: actionInProgress ? "gray" : confirmationMode === "exit" ? "red" : confirmationMode === "switch" ? "yellow" : "green",
      paddingX: 2,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column"
    },
    /* @__PURE__ */ React.createElement(Box, { flexDirection: "column", alignItems: "center" }, actionInProgress === "exiting" ? /* @__PURE__ */ React.createElement(Text, { color: "gray", bold: true }, "Exiting...") : actionInProgress === "switching" ? /* @__PURE__ */ React.createElement(Text, { color: "gray", bold: true }, "Switching to local mode...") : confirmationMode === "exit" ? /* @__PURE__ */ React.createElement(Text, { color: "red", bold: true }, "\u26A0\uFE0F  Press Ctrl-C again to exit completely") : confirmationMode === "switch" ? /* @__PURE__ */ React.createElement(Text, { color: "yellow", bold: true }, "\u23F8\uFE0F  Press space again to switch to local mode") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Text, { color: "green", bold: true }, "\u{1F4F1} Press space to switch to local mode \u2022 Ctrl-C to exit")), process.env.DEBUG && logPath && /* @__PURE__ */ React.createElement(Text, { color: "gray", dimColor: true }, "Debug logs: ", logPath))
  ));
};

class Stream {
  constructor(returned) {
    this.returned = returned;
  }
  queue = [];
  readResolve;
  readReject;
  isDone = false;
  hasError;
  started = false;
  /**
   * Implements async iterable protocol
   */
  [Symbol.asyncIterator]() {
    if (this.started) {
      throw new Error("Stream can only be iterated once");
    }
    this.started = true;
    return this;
  }
  /**
   * Gets the next value from the stream
   */
  async next() {
    if (this.queue.length > 0) {
      return Promise.resolve({
        done: false,
        value: this.queue.shift()
      });
    }
    if (this.isDone) {
      return Promise.resolve({ done: true, value: void 0 });
    }
    if (this.hasError) {
      return Promise.reject(this.hasError);
    }
    return new Promise((resolve, reject) => {
      this.readResolve = resolve;
      this.readReject = reject;
    });
  }
  /**
   * Adds a value to the stream
   */
  enqueue(value) {
    if (this.readResolve) {
      const resolve = this.readResolve;
      this.readResolve = void 0;
      this.readReject = void 0;
      resolve({ done: false, value });
    } else {
      this.queue.push(value);
    }
  }
  /**
   * Marks the stream as complete
   */
  done() {
    this.isDone = true;
    if (this.readResolve) {
      const resolve = this.readResolve;
      this.readResolve = void 0;
      this.readReject = void 0;
      resolve({ done: true, value: void 0 });
    }
  }
  /**
   * Propagates an error through the stream
   */
  error(error) {
    this.hasError = error;
    if (this.readReject) {
      const reject = this.readReject;
      this.readResolve = void 0;
      this.readReject = void 0;
      reject(error);
    }
  }
  /**
   * Implements async iterator cleanup
   */
  async return() {
    this.isDone = true;
    if (this.returned) {
      this.returned();
    }
    return Promise.resolve({ done: true, value: void 0 });
  }
}

class AbortError extends Error {
  constructor(message) {
    super(message);
    this.name = "AbortError";
  }
}

const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = join(__filename$1, "..");
function getGlobalClaudeVersion() {
  try {
    const cleanEnv = getCleanEnv();
    const output = execSync("claude --version", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      cwd: homedir(),
      env: cleanEnv
    }).trim();
    const match = output.match(/(\d+\.\d+\.\d+)/);
    logger.debug(`[Claude SDK] Global claude --version output: ${output}`);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
function getCleanEnv() {
  const env = { ...process.env };
  const cwd = process.cwd();
  const pathSep = process.platform === "win32" ? ";" : ":";
  const pathKey = process.platform === "win32" ? "Path" : "PATH";
  const actualPathKey = Object.keys(env).find((k) => k.toLowerCase() === "path") || pathKey;
  if (env[actualPathKey]) {
    const cleanPath = env[actualPathKey].split(pathSep).filter((p) => {
      const normalizedP = p.replace(/\\/g, "/").toLowerCase();
      const normalizedCwd = cwd.replace(/\\/g, "/").toLowerCase();
      return !normalizedP.startsWith(normalizedCwd);
    }).join(pathSep);
    env[actualPathKey] = cleanPath;
    logger.debug(`[Claude SDK] Cleaned PATH, removed local paths from: ${cwd}`);
  }
  if (isBun()) {
    Object.keys(env).forEach((key) => {
      if (key.startsWith("BUN_")) {
        delete env[key];
      }
    });
    logger.debug("[Claude SDK] Removed Bun-specific environment variables for Node.js compatibility");
  }
  return env;
}
function findGlobalClaudePath() {
  const homeDir = homedir();
  const cleanEnv = getCleanEnv();
  try {
    execSync("claude --version", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      cwd: homeDir,
      env: cleanEnv
    });
    logger.debug("[Claude SDK] Global claude command available (checked with clean PATH)");
    return "claude";
  } catch {
  }
  if (process.platform !== "win32") {
    try {
      const result = execSync("which claude", {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
        cwd: homeDir,
        env: cleanEnv
      }).trim();
      if (result && existsSync(result)) {
        logger.debug(`[Claude SDK] Found global claude path via which: ${result}`);
        return result;
      }
    } catch {
    }
  }
  return null;
}
function getDefaultClaudeCodePath() {
  const nodeModulesPath = join(__dirname$1, "..", "..", "..", "node_modules", "@anthropic-ai", "claude-code", "cli.js");
  if (process.env.HAPPY_CLAUDE_PATH) {
    logger.debug(`[Claude SDK] Using HAPPY_CLAUDE_PATH: ${process.env.HAPPY_CLAUDE_PATH}`);
    return process.env.HAPPY_CLAUDE_PATH;
  }
  if (process.env.HAPPY_USE_BUNDLED_CLAUDE === "1") {
    logger.debug(`[Claude SDK] Forced bundled version: ${nodeModulesPath}`);
    return nodeModulesPath;
  }
  const globalPath = findGlobalClaudePath();
  if (!globalPath) {
    logger.debug(`[Claude SDK] No global claude found, using bundled: ${nodeModulesPath}`);
    return nodeModulesPath;
  }
  const globalVersion = getGlobalClaudeVersion();
  logger.debug(`[Claude SDK] Global version: ${globalVersion || "unknown"}`);
  if (!globalVersion) {
    logger.debug(`[Claude SDK] Cannot compare versions, using global: ${globalPath}`);
    return globalPath;
  }
  return globalPath;
}
function logDebug(message) {
  if (process.env.DEBUG) {
    logger.debug(message);
    console.log(message);
  }
}
async function streamToStdin(stream, stdin, abort) {
  for await (const message of stream) {
    if (abort?.aborted) break;
    stdin.write(JSON.stringify(message) + "\n");
  }
  stdin.end();
}

class Query {
  constructor(childStdin, childStdout, processExitPromise, canCallTool) {
    this.childStdin = childStdin;
    this.childStdout = childStdout;
    this.processExitPromise = processExitPromise;
    this.canCallTool = canCallTool;
    this.readMessages();
    this.sdkMessages = this.readSdkMessages();
  }
  pendingControlResponses = /* @__PURE__ */ new Map();
  cancelControllers = /* @__PURE__ */ new Map();
  sdkMessages;
  inputStream = new Stream();
  canCallTool;
  /**
   * Set an error on the stream
   */
  setError(error) {
    this.inputStream.error(error);
  }
  /**
   * AsyncIterableIterator implementation
   */
  next(...args) {
    return this.sdkMessages.next(...args);
  }
  return(value) {
    if (this.sdkMessages.return) {
      return this.sdkMessages.return(value);
    }
    return Promise.resolve({ done: true, value: void 0 });
  }
  throw(e) {
    if (this.sdkMessages.throw) {
      return this.sdkMessages.throw(e);
    }
    return Promise.reject(e);
  }
  [Symbol.asyncIterator]() {
    return this.sdkMessages;
  }
  /**
   * Read messages from Claude process stdout
   */
  async readMessages() {
    const rl = createInterface({ input: this.childStdout });
    try {
      for await (const line of rl) {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            if (message.type === "control_response") {
              const controlResponse = message;
              const handler = this.pendingControlResponses.get(controlResponse.response.request_id);
              if (handler) {
                handler(controlResponse.response);
              }
              continue;
            } else if (message.type === "control_request") {
              await this.handleControlRequest(message);
              continue;
            } else if (message.type === "control_cancel_request") {
              this.handleControlCancelRequest(message);
              continue;
            }
            this.inputStream.enqueue(message);
          } catch (e) {
            logger.debug(line);
          }
        }
      }
      await this.processExitPromise;
    } catch (error) {
      this.inputStream.error(error);
    } finally {
      this.inputStream.done();
      this.cleanupControllers();
      rl.close();
    }
  }
  /**
   * Async generator for SDK messages
   */
  async *readSdkMessages() {
    for await (const message of this.inputStream) {
      yield message;
    }
  }
  /**
   * Send interrupt request to Claude
   */
  async interrupt() {
    if (!this.childStdin) {
      throw new Error("Interrupt requires --input-format stream-json");
    }
    await this.request({
      subtype: "interrupt"
    }, this.childStdin);
  }
  /**
   * Send control request to Claude process
   */
  request(request, childStdin) {
    const requestId = Math.random().toString(36).substring(2, 15);
    const sdkRequest = {
      request_id: requestId,
      type: "control_request",
      request
    };
    return new Promise((resolve, reject) => {
      this.pendingControlResponses.set(requestId, (response) => {
        if (response.subtype === "success") {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
      childStdin.write(JSON.stringify(sdkRequest) + "\n");
    });
  }
  /**
   * Handle incoming control requests for tool permissions
   * Replicates the exact logic from the SDK's handleControlRequest method
   */
  async handleControlRequest(request) {
    if (!this.childStdin) {
      logDebug("Cannot handle control request - no stdin available");
      return;
    }
    const controller = new AbortController();
    this.cancelControllers.set(request.request_id, controller);
    try {
      const response = await this.processControlRequest(request, controller.signal);
      const controlResponse = {
        type: "control_response",
        response: {
          subtype: "success",
          request_id: request.request_id,
          response
        }
      };
      this.childStdin.write(JSON.stringify(controlResponse) + "\n");
    } catch (error) {
      const controlErrorResponse = {
        type: "control_response",
        response: {
          subtype: "error",
          request_id: request.request_id,
          error: error instanceof Error ? error.message : String(error)
        }
      };
      this.childStdin.write(JSON.stringify(controlErrorResponse) + "\n");
    } finally {
      this.cancelControllers.delete(request.request_id);
    }
  }
  /**
   * Handle control cancel requests
   * Replicates the exact logic from the SDK's handleControlCancelRequest method
   */
  handleControlCancelRequest(request) {
    const controller = this.cancelControllers.get(request.request_id);
    if (controller) {
      controller.abort();
      this.cancelControllers.delete(request.request_id);
    }
  }
  /**
   * Process control requests based on subtype
   * Replicates the exact logic from the SDK's processControlRequest method
   */
  async processControlRequest(request, signal) {
    if (request.request.subtype === "can_use_tool") {
      if (!this.canCallTool) {
        throw new Error("canCallTool callback is not provided.");
      }
      return this.canCallTool(request.request.tool_name, request.request.input, {
        signal
      });
    }
    throw new Error("Unsupported control request subtype: " + request.request.subtype);
  }
  /**
   * Cleanup method to abort all pending control requests
   */
  cleanupControllers() {
    for (const [requestId, controller] of this.cancelControllers.entries()) {
      controller.abort();
      this.cancelControllers.delete(requestId);
    }
  }
}
function query(config) {
  const {
    prompt,
    options: {
      allowedTools = [],
      appendSystemPrompt,
      customSystemPrompt,
      cwd,
      disallowedTools = [],
      executable = "node",
      executableArgs = [],
      maxTurns,
      mcpServers,
      pathToClaudeCodeExecutable = getDefaultClaudeCodePath(),
      permissionMode = "default",
      continue: continueConversation,
      resume,
      model,
      fallbackModel,
      strictMcpConfig,
      canCallTool,
      settingsPath
    } = {}
  } = config;
  if (!process.env.CLAUDE_CODE_ENTRYPOINT) {
    process.env.CLAUDE_CODE_ENTRYPOINT = "sdk-ts";
  }
  const args = ["--output-format", "stream-json", "--verbose"];
  if (customSystemPrompt) args.push("--system-prompt", customSystemPrompt);
  if (appendSystemPrompt) args.push("--append-system-prompt", appendSystemPrompt);
  if (maxTurns) args.push("--max-turns", maxTurns.toString());
  if (model) args.push("--model", model);
  if (canCallTool) {
    if (typeof prompt === "string") {
      throw new Error("canCallTool callback requires --input-format stream-json. Please set prompt as an AsyncIterable.");
    }
    args.push("--permission-prompt-tool", "stdio");
  }
  if (continueConversation) args.push("--continue");
  if (resume) args.push("--resume", resume);
  if (allowedTools.length > 0) args.push("--allowedTools", allowedTools.join(","));
  if (disallowedTools.length > 0) args.push("--disallowedTools", disallowedTools.join(","));
  if (mcpServers && Object.keys(mcpServers).length > 0) {
    args.push("--mcp-config", JSON.stringify({ mcpServers }));
  }
  if (strictMcpConfig) args.push("--strict-mcp-config");
  if (permissionMode) args.push("--permission-mode", permissionMode);
  if (settingsPath) args.push("--settings", settingsPath);
  if (fallbackModel) {
    if (model && fallbackModel === model) {
      throw new Error("Fallback model cannot be the same as the main model. Please specify a different model for fallbackModel option.");
    }
    args.push("--fallback-model", fallbackModel);
  }
  if (typeof prompt === "string") {
    args.push("--print", prompt.trim());
  } else {
    args.push("--input-format", "stream-json");
  }
  const isJsFile = pathToClaudeCodeExecutable.endsWith(".js") || pathToClaudeCodeExecutable.endsWith(".cjs");
  const isCommandOnly = pathToClaudeCodeExecutable === "claude";
  if (!isCommandOnly && !existsSync(pathToClaudeCodeExecutable)) {
    throw new ReferenceError(`Claude Code executable not found at ${pathToClaudeCodeExecutable}. Is options.pathToClaudeCodeExecutable set?`);
  }
  const spawnCommand = isJsFile ? executable : pathToClaudeCodeExecutable;
  const spawnArgs = isJsFile ? [...executableArgs, pathToClaudeCodeExecutable, ...args] : args;
  const spawnEnv = isCommandOnly ? getCleanEnv() : process.env;
  logDebug(`Spawning Claude Code process: ${spawnCommand} ${spawnArgs.join(" ")} (using ${isCommandOnly ? "clean" : "normal"} env)`);
  const child = spawn(spawnCommand, spawnArgs, {
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
    signal: config.options?.abort,
    env: spawnEnv,
    // Use shell on Windows for global binaries and command-only mode
    shell: !isJsFile && process.platform === "win32"
  });
  let childStdin = null;
  if (typeof prompt === "string") {
    child.stdin.end();
  } else {
    streamToStdin(prompt, child.stdin, config.options?.abort);
    childStdin = child.stdin;
  }
  if (process.env.DEBUG) {
    child.stderr.on("data", (data) => {
      console.error("Claude Code stderr:", data.toString());
    });
  }
  const cleanup = () => {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  };
  config.options?.abort?.addEventListener("abort", cleanup);
  process.on("exit", cleanup);
  const processExitPromise = new Promise((resolve) => {
    child.on("close", (code) => {
      if (config.options?.abort?.aborted) {
        query2.setError(new AbortError("Claude Code process aborted by user"));
      }
      if (code !== 0) {
        query2.setError(new Error(`Claude Code process exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
  const query2 = new Query(childStdin, child.stdout, processExitPromise, canCallTool);
  child.on("error", (error) => {
    if (config.options?.abort?.aborted) {
      query2.setError(new AbortError("Claude Code process aborted by user"));
    } else {
      query2.setError(new Error(`Failed to spawn Claude Code process: ${error.message}`));
    }
  });
  processExitPromise.finally(() => {
    cleanup();
    config.options?.abort?.removeEventListener("abort", cleanup);
    if (process.env.CLAUDE_SDK_MCP_SERVERS) {
      delete process.env.CLAUDE_SDK_MCP_SERVERS;
    }
  });
  return query2;
}

function mapToClaudeMode(mode) {
  const codexToClaudeMap = {
    "yolo": "bypassPermissions",
    "safe-yolo": "default",
    "read-only": "default"
  };
  return codexToClaudeMap[mode] ?? mode;
}

function parseCompact(message) {
  const trimmed = message.trim();
  if (trimmed === "/compact") {
    return {
      isCompact: true,
      originalMessage: trimmed
    };
  }
  if (trimmed.startsWith("/compact ")) {
    return {
      isCompact: true,
      originalMessage: trimmed
    };
  }
  return {
    isCompact: false,
    originalMessage: message
  };
}
function parseClear(message) {
  const trimmed = message.trim();
  return {
    isClear: trimmed === "/clear"
  };
}
function parseSpecialCommand(message) {
  const compactResult = parseCompact(message);
  if (compactResult.isCompact) {
    return {
      type: "compact",
      originalMessage: compactResult.originalMessage
    };
  }
  const clearResult = parseClear(message);
  if (clearResult.isClear) {
    return {
      type: "clear"
    };
  }
  return {
    type: null
  };
}

class PushableAsyncIterable {
  queue = [];
  waiters = [];
  isDone = false;
  error = null;
  started = false;
  constructor() {
  }
  /**
   * Push a value to the iterable
   */
  push(value) {
    if (this.isDone) {
      throw new Error("Cannot push to completed iterable");
    }
    if (this.error) {
      throw this.error;
    }
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter.resolve({ done: false, value });
    } else {
      this.queue.push(value);
    }
  }
  /**
   * Mark the iterable as complete
   */
  end() {
    if (this.isDone) {
      return;
    }
    this.isDone = true;
    this.cleanup();
  }
  /**
   * Set an error on the iterable
   */
  setError(err) {
    if (this.isDone) {
      return;
    }
    this.error = err;
    this.isDone = true;
    this.cleanup();
  }
  /**
   * Cleanup waiting consumers
   */
  cleanup() {
    while (this.waiters.length > 0) {
      const waiter = this.waiters.shift();
      if (this.error) {
        waiter.reject(this.error);
      } else {
        waiter.resolve({ done: true, value: void 0 });
      }
    }
  }
  /**
   * AsyncIterableIterator implementation
   */
  async next() {
    if (this.queue.length > 0) {
      return { done: false, value: this.queue.shift() };
    }
    if (this.isDone) {
      if (this.error) {
        throw this.error;
      }
      return { done: true, value: void 0 };
    }
    return new Promise((resolve, reject) => {
      this.waiters.push({ resolve, reject });
    });
  }
  /**
   * AsyncIterableIterator return implementation
   */
  async return(_value) {
    this.end();
    return { done: true, value: void 0 };
  }
  /**
   * AsyncIterableIterator throw implementation
   */
  async throw(e) {
    this.setError(e instanceof Error ? e : new Error(String(e)));
    throw this.error;
  }
  /**
   * Make this iterable
   */
  [Symbol.asyncIterator]() {
    if (this.started) {
      throw new Error("PushableAsyncIterable can only be iterated once");
    }
    this.started = true;
    return this;
  }
  /**
   * Check if the iterable is done
   */
  get done() {
    return this.isDone;
  }
  /**
   * Check if the iterable has an error
   */
  get hasError() {
    return this.error !== null;
  }
  /**
   * Get the current queue size
   */
  get queueSize() {
    return this.queue.length;
  }
  /**
   * Get the number of waiting consumers
   */
  get waiterCount() {
    return this.waiters.length;
  }
}

async function awaitFileExist(file, timeout = 1e4) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      await access(file);
      return true;
    } catch (e) {
      await delay(1e3);
    }
  }
  return false;
}

async function claudeRemote(opts) {
  let startFrom = opts.sessionId;
  if (opts.sessionId && !claudeCheckSession(opts.sessionId, opts.path)) {
    startFrom = null;
  }
  if (!startFrom && opts.claudeArgs) {
    for (let i = 0; i < opts.claudeArgs.length; i++) {
      if (opts.claudeArgs[i] === "--resume") {
        if (i + 1 < opts.claudeArgs.length) {
          const nextArg = opts.claudeArgs[i + 1];
          if (!nextArg.startsWith("-") && nextArg.includes("-")) {
            startFrom = nextArg;
            logger.debug(`[claudeRemote] Found --resume with session ID: ${startFrom}`);
            break;
          } else {
            logger.debug("[claudeRemote] Found --resume without session ID - not supported in remote mode");
            break;
          }
        } else {
          logger.debug("[claudeRemote] Found --resume without session ID - not supported in remote mode");
          break;
        }
      }
    }
  }
  if (opts.claudeEnvVars) {
    Object.entries(opts.claudeEnvVars).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }
  const initial = await opts.nextMessage();
  if (!initial) {
    return;
  }
  const specialCommand = parseSpecialCommand(initial.message);
  if (specialCommand.type === "clear") {
    if (opts.onCompletionEvent) {
      opts.onCompletionEvent("Context was reset");
    }
    if (opts.onSessionReset) {
      opts.onSessionReset();
    }
    return;
  }
  let isCompactCommand = false;
  if (specialCommand.type === "compact") {
    logger.debug("[claudeRemote] /compact command detected - will process as normal but with compaction behavior");
    isCompactCommand = true;
    if (opts.onCompletionEvent) {
      opts.onCompletionEvent("Compaction started");
    }
  }
  let mode = initial.mode;
  const sdkOptions = {
    cwd: opts.path,
    resume: startFrom ?? void 0,
    mcpServers: opts.mcpServers,
    permissionMode: mapToClaudeMode(initial.mode.permissionMode),
    model: initial.mode.model,
    fallbackModel: initial.mode.fallbackModel,
    customSystemPrompt: initial.mode.customSystemPrompt ? initial.mode.customSystemPrompt + "\n\n" + systemPrompt : void 0,
    appendSystemPrompt: initial.mode.appendSystemPrompt ? initial.mode.appendSystemPrompt + "\n\n" + systemPrompt : systemPrompt,
    allowedTools: initial.mode.allowedTools ? initial.mode.allowedTools.concat(opts.allowedTools) : opts.allowedTools,
    disallowedTools: initial.mode.disallowedTools,
    canCallTool: (toolName, input, options) => opts.canCallTool(toolName, input, mode, options),
    executable: opts.jsRuntime ?? "node",
    abort: opts.signal,
    pathToClaudeCodeExecutable: (() => {
      return resolve(join(projectPath(), "scripts", "claude_remote_launcher.cjs"));
    })(),
    settingsPath: opts.hookSettingsPath
  };
  let thinking = false;
  const updateThinking = (newThinking) => {
    if (thinking !== newThinking) {
      thinking = newThinking;
      logger.debug(`[claudeRemote] Thinking state changed to: ${thinking}`);
      if (opts.onThinkingChange) {
        opts.onThinkingChange(thinking);
      }
    }
  };
  let messages = new PushableAsyncIterable();
  messages.push({
    type: "user",
    message: {
      role: "user",
      content: initial.message
    }
  });
  const response = query({
    prompt: messages,
    options: sdkOptions
  });
  updateThinking(true);
  try {
    logger.debug(`[claudeRemote] Starting to iterate over response`);
    for await (const message of response) {
      logger.debugLargeJson(`[claudeRemote] Message ${message.type}`, message);
      opts.onMessage(message);
      if (message.type === "system" && message.subtype === "init") {
        updateThinking(true);
        const systemInit = message;
        if (systemInit.session_id) {
          logger.debug(`[claudeRemote] Waiting for session file to be written to disk: ${systemInit.session_id}`);
          const projectDir = getProjectPath(opts.path);
          const found = await awaitFileExist(join(projectDir, `${systemInit.session_id}.jsonl`));
          logger.debug(`[claudeRemote] Session file found: ${systemInit.session_id} ${found}`);
          opts.onSessionFound(systemInit.session_id);
        }
      }
      if (message.type === "result") {
        updateThinking(false);
        logger.debug("[claudeRemote] Result received, exiting claudeRemote");
        if (isCompactCommand) {
          logger.debug("[claudeRemote] Compaction completed");
          if (opts.onCompletionEvent) {
            opts.onCompletionEvent("Compaction completed");
          }
          isCompactCommand = false;
        }
        opts.onReady();
        const next = await opts.nextMessage();
        if (!next) {
          messages.end();
          return;
        }
        mode = next.mode;
        messages.push({ type: "user", message: { role: "user", content: next.message } });
      }
      if (message.type === "user") {
        const msg = message;
        if (msg.message.role === "user" && Array.isArray(msg.message.content)) {
          for (let c of msg.message.content) {
            if (c.type === "tool_result" && c.tool_use_id && opts.isAborted(c.tool_use_id)) {
              logger.debug("[claudeRemote] Tool aborted, exiting claudeRemote");
              return;
            }
          }
        }
      }
    }
  } catch (e) {
    if (e instanceof AbortError) {
      logger.debug(`[claudeRemote] Aborted`);
    } else {
      throw e;
    }
  } finally {
    updateThinking(false);
  }
}

const PLAN_FAKE_REJECT = `User approved plan, but you need to be restarted. STOP IMMEDIATELY TO SWITCH FROM PLAN MODE. DO NOT REPLY TO THIS MESSAGE.`;
const PLAN_FAKE_RESTART = `PlEaZe Continue with plan.`;

const STANDARD_TOOLS = {
  // File operations
  "Read": "Read File",
  "Write": "Write File",
  "Edit": "Edit File",
  "MultiEdit": "Edit File",
  "NotebookEdit": "Edit Notebook",
  // Search and navigation
  "Glob": "Find Files",
  "Grep": "Search in Files",
  "LS": "List Directory",
  // Command execution
  "Bash": "Run Command",
  "BashOutput": "Check Command Output",
  "KillBash": "Stop Command",
  // Task management
  "TodoWrite": "Update Tasks",
  "TodoRead": "Read Tasks",
  "Task": "Launch Agent",
  // Web tools
  "WebFetch": "Fetch Web Page",
  "WebSearch": "Search Web",
  // Special cases
  "exit_plan_mode": "Execute Plan",
  "ExitPlanMode": "Execute Plan"
};
function toTitleCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
function getToolName(toolName) {
  if (STANDARD_TOOLS[toolName]) {
    return STANDARD_TOOLS[toolName];
  }
  if (toolName.startsWith("mcp__")) {
    const parts = toolName.split("__");
    if (parts.length >= 3) {
      const server = toTitleCase(parts[1]);
      const action = toTitleCase(parts.slice(2).join("_"));
      return `${server}: ${action}`;
    }
  }
  return toTitleCase(toolName);
}

function getToolDescriptor(toolName) {
  if (toolName === "exit_plan_mode" || toolName === "ExitPlanMode") {
    return { edit: false, exitPlan: true };
  }
  if (toolName === "Edit" || toolName === "MultiEdit" || toolName === "Write" || toolName === "NotebookEdit") {
    return { edit: true, exitPlan: false };
  }
  return { edit: false, exitPlan: false };
}

class PermissionHandler {
  toolCalls = [];
  responses = /* @__PURE__ */ new Map();
  pendingRequests = /* @__PURE__ */ new Map();
  session;
  allowedTools = /* @__PURE__ */ new Set();
  allowedBashLiterals = /* @__PURE__ */ new Set();
  allowedBashPrefixes = /* @__PURE__ */ new Set();
  permissionMode = "default";
  onPermissionRequestCallback;
  constructor(session) {
    this.session = session;
    this.setupClientHandler();
  }
  /**
   * Set callback to trigger when permission request is made
   */
  setOnPermissionRequest(callback) {
    this.onPermissionRequestCallback = callback;
  }
  handleModeChange(mode) {
    this.permissionMode = mode;
  }
  /**
   * Handler response
   */
  handlePermissionResponse(response, pending) {
    if (response.allowTools && response.allowTools.length > 0) {
      response.allowTools.forEach((tool) => {
        if (tool.startsWith("Bash(") || tool === "Bash") {
          this.parseBashPermission(tool);
        } else {
          this.allowedTools.add(tool);
        }
      });
    }
    if (response.mode) {
      this.permissionMode = response.mode;
    }
    if (pending.toolName === "exit_plan_mode" || pending.toolName === "ExitPlanMode") {
      logger.debug("Plan mode result received", response);
      if (response.approved) {
        logger.debug("Plan approved - injecting PLAN_FAKE_RESTART");
        if (response.mode && ["default", "acceptEdits", "bypassPermissions"].includes(response.mode)) {
          this.session.queue.unshift(PLAN_FAKE_RESTART, { permissionMode: response.mode });
        } else {
          this.session.queue.unshift(PLAN_FAKE_RESTART, { permissionMode: "default" });
        }
        pending.resolve({ behavior: "deny", message: PLAN_FAKE_REJECT });
      } else {
        pending.resolve({ behavior: "deny", message: response.reason || "Plan rejected" });
      }
    } else {
      const result = response.approved ? { behavior: "allow", updatedInput: pending.input || {} } : { behavior: "deny", message: response.reason || `The user doesn't want to proceed with this tool use. The tool use was rejected (eg. if it was a file edit, the new_string was NOT written to the file). STOP what you are doing and wait for the user to tell you how to proceed.` };
      pending.resolve(result);
    }
  }
  /**
   * Creates the canCallTool callback for the SDK
   */
  handleToolCall = async (toolName, input, mode, options) => {
    if (toolName === "Bash") {
      const inputObj = input;
      if (inputObj?.command) {
        if (this.allowedBashLiterals.has(inputObj.command)) {
          return { behavior: "allow", updatedInput: input };
        }
        for (const prefix of this.allowedBashPrefixes) {
          if (inputObj.command.startsWith(prefix)) {
            return { behavior: "allow", updatedInput: input };
          }
        }
      }
    } else if (this.allowedTools.has(toolName)) {
      return { behavior: "allow", updatedInput: input };
    }
    const descriptor = getToolDescriptor(toolName);
    if (this.permissionMode === "bypassPermissions") {
      return { behavior: "allow", updatedInput: input };
    }
    if (this.permissionMode === "acceptEdits" && descriptor.edit) {
      return { behavior: "allow", updatedInput: input };
    }
    let toolCallId = this.resolveToolCallId(toolName, input);
    if (!toolCallId) {
      await delay(1e3);
      toolCallId = this.resolveToolCallId(toolName, input);
      if (!toolCallId) {
        throw new Error(`Could not resolve tool call ID for ${toolName}`);
      }
    }
    return this.handlePermissionRequest(toolCallId, toolName, input, options.signal);
  };
  /**
   * Handles individual permission requests
   */
  async handlePermissionRequest(id, toolName, input, signal) {
    return new Promise((resolve, reject) => {
      const abortHandler = () => {
        this.pendingRequests.delete(id);
        reject(new Error("Permission request aborted"));
      };
      signal.addEventListener("abort", abortHandler, { once: true });
      this.pendingRequests.set(id, {
        resolve: (result) => {
          signal.removeEventListener("abort", abortHandler);
          resolve(result);
        },
        reject: (error) => {
          signal.removeEventListener("abort", abortHandler);
          reject(error);
        },
        toolName,
        input
      });
      if (this.onPermissionRequestCallback) {
        this.onPermissionRequestCallback(id);
      }
      this.session.api.push().sendToAllDevices(
        "Permission Request",
        `Claude wants to ${getToolName(toolName)}`,
        {
          sessionId: this.session.client.sessionId,
          requestId: id,
          tool: toolName,
          type: "permission_request"
        }
      );
      this.session.client.updateAgentState((currentState) => ({
        ...currentState,
        requests: {
          ...currentState.requests,
          [id]: {
            tool: toolName,
            arguments: input,
            createdAt: Date.now()
          }
        }
      }));
      logger.debug(`Permission request sent for tool call ${id}: ${toolName}`);
    });
  }
  /**
   * Parses Bash permission strings into literal and prefix sets
   */
  parseBashPermission(permission) {
    if (permission === "Bash") {
      return;
    }
    const bashPattern = /^Bash\((.+?)\)$/;
    const match = permission.match(bashPattern);
    if (!match) {
      return;
    }
    const command = match[1];
    if (command.endsWith(":*")) {
      const prefix = command.slice(0, -2);
      this.allowedBashPrefixes.add(prefix);
    } else {
      this.allowedBashLiterals.add(command);
    }
  }
  /**
   * Resolves tool call ID based on tool name and input
   */
  resolveToolCallId(name, args) {
    for (let i = this.toolCalls.length - 1; i >= 0; i--) {
      const call = this.toolCalls[i];
      if (call.name === name && isDeepStrictEqual(call.input, args)) {
        if (call.used) {
          return null;
        }
        call.used = true;
        return call.id;
      }
    }
    return null;
  }
  /**
   * Handles messages to track tool calls
   */
  onMessage(message) {
    if (message.type === "assistant") {
      const assistantMsg = message;
      if (assistantMsg.message && assistantMsg.message.content) {
        for (const block of assistantMsg.message.content) {
          if (block.type === "tool_use") {
            this.toolCalls.push({
              id: block.id,
              name: block.name,
              input: block.input,
              used: false
            });
          }
        }
      }
    }
    if (message.type === "user") {
      const userMsg = message;
      if (userMsg.message && userMsg.message.content && Array.isArray(userMsg.message.content)) {
        for (const block of userMsg.message.content) {
          if (block.type === "tool_result" && block.tool_use_id) {
            const toolCall = this.toolCalls.find((tc) => tc.id === block.tool_use_id);
            if (toolCall && !toolCall.used) {
              toolCall.used = true;
            }
          }
        }
      }
    }
  }
  /**
   * Checks if a tool call is rejected
   */
  isAborted(toolCallId) {
    if (this.responses.get(toolCallId)?.approved === false) {
      return true;
    }
    const toolCall = this.toolCalls.find((tc) => tc.id === toolCallId);
    if (toolCall && (toolCall.name === "exit_plan_mode" || toolCall.name === "ExitPlanMode")) {
      return true;
    }
    return false;
  }
  /**
   * Resets all state for new sessions
   */
  reset() {
    this.toolCalls = [];
    this.responses.clear();
    this.allowedTools.clear();
    this.allowedBashLiterals.clear();
    this.allowedBashPrefixes.clear();
    for (const [, pending] of this.pendingRequests.entries()) {
      pending.reject(new Error("Session reset"));
    }
    this.pendingRequests.clear();
    this.session.client.updateAgentState((currentState) => {
      const pendingRequests = currentState.requests || {};
      const completedRequests = { ...currentState.completedRequests };
      for (const [id, request] of Object.entries(pendingRequests)) {
        completedRequests[id] = {
          ...request,
          completedAt: Date.now(),
          status: "canceled",
          reason: "Session switched to local mode"
        };
      }
      return {
        ...currentState,
        requests: {},
        // Clear all pending requests
        completedRequests
      };
    });
  }
  /**
   * Sets up the client handler for permission responses
   */
  setupClientHandler() {
    this.session.client.rpcHandlerManager.registerHandler("permission", async (message) => {
      logger.debug(`Permission response: ${JSON.stringify(message)}`);
      const id = message.id;
      const pending = this.pendingRequests.get(id);
      if (!pending) {
        logger.debug("Permission request not found or already resolved");
        return;
      }
      this.responses.set(id, { ...message, receivedAt: Date.now() });
      this.pendingRequests.delete(id);
      this.handlePermissionResponse(message, pending);
      this.session.client.updateAgentState((currentState) => {
        const request = currentState.requests?.[id];
        if (!request) return currentState;
        let r = { ...currentState.requests };
        delete r[id];
        return {
          ...currentState,
          requests: r,
          completedRequests: {
            ...currentState.completedRequests,
            [id]: {
              ...request,
              completedAt: Date.now(),
              status: message.approved ? "approved" : "denied",
              reason: message.reason,
              mode: message.mode,
              allowTools: message.allowTools
            }
          }
        };
      });
    });
  }
  /**
   * Gets the responses map (for compatibility with existing code)
   */
  getResponses() {
    return this.responses;
  }
}

function formatClaudeMessageForInk(message, messageBuffer, onAssistantResult) {
  logger.debugLargeJson("[CLAUDE INK] Message from remote mode:", message);
  switch (message.type) {
    case "system": {
      const sysMsg = message;
      if (sysMsg.subtype === "init") {
        messageBuffer.addMessage("\u2500".repeat(40), "status");
        messageBuffer.addMessage(`\u{1F680} Session initialized: ${sysMsg.session_id}`, "system");
        messageBuffer.addMessage(`  Model: ${sysMsg.model}`, "status");
        messageBuffer.addMessage(`  CWD: ${sysMsg.cwd}`, "status");
        if (sysMsg.tools && sysMsg.tools.length > 0) {
          messageBuffer.addMessage(`  Tools: ${sysMsg.tools.join(", ")}`, "status");
        }
        messageBuffer.addMessage("\u2500".repeat(40), "status");
      }
      break;
    }
    case "user": {
      const userMsg = message;
      if (userMsg.message && typeof userMsg.message === "object" && "content" in userMsg.message) {
        const content = userMsg.message.content;
        if (typeof content === "string") {
          messageBuffer.addMessage(`\u{1F464} User: ${content}`, "user");
        } else if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === "text") {
              messageBuffer.addMessage(`\u{1F464} User: ${block.text}`, "user");
            } else if (block.type === "tool_result") {
              messageBuffer.addMessage(`\u2705 Tool Result (ID: ${block.tool_use_id})`, "result");
              if (block.content) {
                const outputStr = typeof block.content === "string" ? block.content : JSON.stringify(block.content, null, 2);
                const maxLength = 200;
                if (outputStr.length > maxLength) {
                  messageBuffer.addMessage(outputStr.substring(0, maxLength) + "... (truncated)", "result");
                } else {
                  messageBuffer.addMessage(outputStr, "result");
                }
              }
            }
          }
        } else {
          messageBuffer.addMessage(`\u{1F464} User: ${JSON.stringify(content, null, 2)}`, "user");
        }
      }
      break;
    }
    case "assistant": {
      const assistantMsg = message;
      if (assistantMsg.message && assistantMsg.message.content) {
        messageBuffer.addMessage("\u{1F916} Assistant:", "assistant");
        for (const block of assistantMsg.message.content) {
          if (block.type === "text") {
            messageBuffer.addMessage(block.text || "", "assistant");
          } else if (block.type === "tool_use") {
            messageBuffer.addMessage(`\u{1F527} Tool: ${block.name}`, "tool");
            if (block.input) {
              const inputStr = JSON.stringify(block.input, null, 2);
              const maxLength = 500;
              if (inputStr.length > maxLength) {
                messageBuffer.addMessage(`Input: ${inputStr.substring(0, maxLength)}... (truncated)`, "tool");
              } else {
                messageBuffer.addMessage(`Input: ${inputStr}`, "tool");
              }
            }
          }
        }
      }
      break;
    }
    case "result": {
      const resultMsg = message;
      if (resultMsg.subtype === "success") {
        if ("result" in resultMsg && resultMsg.result) {
          messageBuffer.addMessage("\u2728 Summary:", "result");
          messageBuffer.addMessage(resultMsg.result || "", "result");
        }
        if (resultMsg.usage) {
          messageBuffer.addMessage("\u{1F4CA} Session Stats:", "status");
          messageBuffer.addMessage(`  \u2022 Turns: ${resultMsg.num_turns}`, "status");
          messageBuffer.addMessage(`  \u2022 Input tokens: ${resultMsg.usage.input_tokens}`, "status");
          messageBuffer.addMessage(`  \u2022 Output tokens: ${resultMsg.usage.output_tokens}`, "status");
          if (resultMsg.usage.cache_read_input_tokens) {
            messageBuffer.addMessage(`  \u2022 Cache read tokens: ${resultMsg.usage.cache_read_input_tokens}`, "status");
          }
          if (resultMsg.usage.cache_creation_input_tokens) {
            messageBuffer.addMessage(`  \u2022 Cache creation tokens: ${resultMsg.usage.cache_creation_input_tokens}`, "status");
          }
          messageBuffer.addMessage(`  \u2022 Cost: $${resultMsg.total_cost_usd.toFixed(4)}`, "status");
          messageBuffer.addMessage(`  \u2022 Duration: ${resultMsg.duration_ms}ms`, "status");
        }
      } else if (resultMsg.subtype === "error_max_turns") {
        messageBuffer.addMessage("\u274C Error: Maximum turns reached", "result");
        messageBuffer.addMessage(`Completed ${resultMsg.num_turns} turns`, "status");
      } else if (resultMsg.subtype === "error_during_execution") {
        messageBuffer.addMessage("\u274C Error during execution", "result");
        messageBuffer.addMessage(`Completed ${resultMsg.num_turns} turns before error`, "status");
        logger.debugLargeJson("[RESULT] Error during execution", resultMsg);
      }
      break;
    }
    default: {
      if (process.env.DEBUG) {
        messageBuffer.addMessage(`[Unknown message type: ${message.type}]`, "status");
      }
    }
  }
}

function getGitBranch(cwd) {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return branch || void 0;
  } catch {
    return void 0;
  }
}
class SDKToLogConverter {
  lastUuid = null;
  context;
  responses;
  sidechainLastUUID = /* @__PURE__ */ new Map();
  constructor(context, responses) {
    this.context = {
      ...context,
      gitBranch: context.gitBranch ?? getGitBranch(context.cwd),
      version: context.version ?? process.env.npm_package_version ?? "0.0.0",
      parentUuid: null
    };
    this.responses = responses;
  }
  /**
   * Update session ID (for when session changes during resume)
   */
  updateSessionId(sessionId) {
    this.context.sessionId = sessionId;
  }
  /**
   * Reset parent chain (useful when starting new conversation)
   */
  resetParentChain() {
    this.lastUuid = null;
    this.context.parentUuid = null;
  }
  /**
   * Convert SDK message to log format
   */
  convert(sdkMessage) {
    const uuid = randomUUID();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    let parentUuid = this.lastUuid;
    let isSidechain = false;
    if (sdkMessage.parent_tool_use_id) {
      isSidechain = true;
      parentUuid = this.sidechainLastUUID.get(sdkMessage.parent_tool_use_id) ?? null;
      this.sidechainLastUUID.set(sdkMessage.parent_tool_use_id, uuid);
    }
    const baseFields = {
      parentUuid,
      isSidechain,
      userType: "external",
      cwd: this.context.cwd,
      sessionId: this.context.sessionId,
      version: this.context.version,
      gitBranch: this.context.gitBranch,
      uuid,
      timestamp
    };
    let logMessage = null;
    switch (sdkMessage.type) {
      case "user": {
        const userMsg = sdkMessage;
        logMessage = {
          ...baseFields,
          type: "user",
          message: userMsg.message
        };
        if (Array.isArray(userMsg.message.content)) {
          for (const content of userMsg.message.content) {
            if (content.type === "tool_result" && content.tool_use_id && this.responses?.has(content.tool_use_id)) {
              const response = this.responses.get(content.tool_use_id);
              if (response?.mode) {
                logMessage.mode = response.mode;
              }
            }
          }
        } else if (typeof userMsg.message.content === "string") ;
        break;
      }
      case "assistant": {
        const assistantMsg = sdkMessage;
        logMessage = {
          ...baseFields,
          type: "assistant",
          message: assistantMsg.message,
          // Assistant messages often have additional fields
          requestId: assistantMsg.requestId
        };
        break;
      }
      case "system": {
        const systemMsg = sdkMessage;
        if (systemMsg.subtype === "init" && systemMsg.session_id) {
          this.updateSessionId(systemMsg.session_id);
        }
        logMessage = {
          ...baseFields,
          type: "system",
          subtype: systemMsg.subtype,
          model: systemMsg.model,
          tools: systemMsg.tools,
          // Include all other fields
          ...systemMsg
        };
        break;
      }
      case "result": {
        break;
      }
      // Handle tool use results (often comes as user messages)
      case "tool_result": {
        const toolMsg = sdkMessage;
        const baseLogMessage = {
          ...baseFields,
          type: "user",
          message: {
            role: "user",
            content: [{
              type: "tool_result",
              tool_use_id: toolMsg.tool_use_id,
              content: toolMsg.content
            }]
          },
          toolUseResult: toolMsg.content
        };
        if (toolMsg.tool_use_id && this.responses?.has(toolMsg.tool_use_id)) {
          const response = this.responses.get(toolMsg.tool_use_id);
          if (response?.mode) {
            baseLogMessage.mode = response.mode;
          }
        }
        logMessage = baseLogMessage;
        break;
      }
      default:
        logMessage = {
          ...baseFields,
          ...sdkMessage,
          type: sdkMessage.type
          // Override type last to ensure it's set
        };
    }
    if (logMessage && logMessage.type !== "summary") {
      this.lastUuid = uuid;
    }
    return logMessage;
  }
  /**
   * Convert multiple SDK messages to log format
   */
  convertMany(sdkMessages) {
    return sdkMessages.map((msg) => this.convert(msg)).filter((msg) => msg !== null);
  }
  /**
   * Convert a simple string content to a sidechain user message
   * Used for Task tool sub-agent prompts
   */
  convertSidechainUserMessage(toolUseId, content) {
    const uuid = randomUUID();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    this.sidechainLastUUID.set(toolUseId, uuid);
    return {
      parentUuid: null,
      isSidechain: true,
      userType: "external",
      cwd: this.context.cwd,
      sessionId: this.context.sessionId,
      version: this.context.version,
      gitBranch: this.context.gitBranch,
      type: "user",
      message: {
        role: "user",
        content
      },
      uuid,
      timestamp
    };
  }
  /**
   * Generate an interrupted tool result message
   * Used when a tool call is interrupted by the user
   * @param toolUseId - The ID of the tool that was interrupted
   * @param parentToolUseId - Optional parent tool ID if this is a sidechain tool
   */
  generateInterruptedToolResult(toolUseId, parentToolUseId) {
    const uuid = randomUUID();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const errorMessage = "[Request interrupted by user for tool use]";
    let isSidechain = false;
    let parentUuid = this.lastUuid;
    if (parentToolUseId) {
      isSidechain = true;
      parentUuid = this.sidechainLastUUID.get(parentToolUseId) ?? null;
      this.sidechainLastUUID.set(parentToolUseId, uuid);
    }
    const logMessage = {
      type: "user",
      isSidechain,
      uuid,
      message: {
        role: "user",
        content: [
          {
            type: "tool_result",
            content: errorMessage,
            is_error: true,
            tool_use_id: toolUseId
          }
        ]
      },
      parentUuid,
      userType: "external",
      cwd: this.context.cwd,
      sessionId: this.context.sessionId,
      version: this.context.version,
      gitBranch: this.context.gitBranch,
      timestamp,
      toolUseResult: `Error: ${errorMessage}`
    };
    this.lastUuid = uuid;
    return logMessage;
  }
}

class OutgoingMessageQueue {
  constructor(sendFunction) {
    this.sendFunction = sendFunction;
  }
  queue = [];
  nextId = 1;
  lock = new AsyncLock();
  processTimer;
  delayTimers = /* @__PURE__ */ new Map();
  /**
   * Add message to queue
   */
  enqueue(logMessage, options) {
    this.lock.inLock(async () => {
      const item = {
        id: this.nextId++,
        logMessage,
        delayed: !!options?.delay,
        delayMs: options?.delay || 0,
        toolCallIds: options?.toolCallIds,
        released: !options?.delay,
        // Not delayed = already released
        sent: false
      };
      this.queue.push(item);
      if (item.delayed) {
        const timer = setTimeout(() => {
          this.releaseItem(item.id);
        }, item.delayMs);
        this.delayTimers.set(item.id, timer);
      }
    });
    this.scheduleProcessing();
  }
  /**
   * Release specific item by ID
   */
  async releaseItem(itemId) {
    await this.lock.inLock(async () => {
      const item = this.queue.find((i) => i.id === itemId);
      if (item && !item.released) {
        item.released = true;
        const timer = this.delayTimers.get(itemId);
        if (timer) {
          clearTimeout(timer);
          this.delayTimers.delete(itemId);
        }
      }
    });
    this.scheduleProcessing();
  }
  /**
   * Release all messages with specific tool call ID
   */
  async releaseToolCall(toolCallId) {
    await this.lock.inLock(async () => {
      for (const item of this.queue) {
        if (item.toolCallIds?.includes(toolCallId) && !item.released) {
          item.released = true;
          const timer = this.delayTimers.get(item.id);
          if (timer) {
            clearTimeout(timer);
            this.delayTimers.delete(item.id);
          }
        }
      }
    });
    this.scheduleProcessing();
  }
  /**
   * Process queue - send messages in ID order that are released
   * (Internal implementation without lock)
   */
  processQueueInternal() {
    this.queue.sort((a, b) => a.id - b.id);
    while (this.queue.length > 0) {
      const item = this.queue[0];
      if (!item.released) {
        break;
      }
      if (!item.sent) {
        if (item.logMessage.type !== "system") {
          this.sendFunction(item.logMessage);
        }
        item.sent = true;
      }
      this.queue.shift();
    }
  }
  /**
   * Process queue - send messages in ID order that are released
   */
  async processQueue() {
    await this.lock.inLock(async () => {
      this.processQueueInternal();
    });
  }
  /**
   * Flush all messages immediately (for cleanup)
   */
  async flush() {
    await this.lock.inLock(async () => {
      for (const timer of this.delayTimers.values()) {
        clearTimeout(timer);
      }
      this.delayTimers.clear();
      for (const item of this.queue) {
        item.released = true;
      }
      this.processQueueInternal();
    });
  }
  /**
   * Schedule processing on next tick
   */
  scheduleProcessing() {
    if (this.processTimer) {
      clearTimeout(this.processTimer);
    }
    this.processTimer = setTimeout(() => {
      this.processQueue();
    }, 0);
  }
  /**
   * Cleanup timers and resources
   */
  destroy() {
    if (this.processTimer) {
      clearTimeout(this.processTimer);
    }
    for (const timer of this.delayTimers.values()) {
      clearTimeout(timer);
    }
    this.delayTimers.clear();
  }
}

async function claudeRemoteLauncher(session) {
  logger.debug("[claudeRemoteLauncher] Starting remote launcher");
  const hasTTY = process.stdout.isTTY && process.stdin.isTTY;
  logger.debug(`[claudeRemoteLauncher] TTY available: ${hasTTY}`);
  let messageBuffer = new MessageBuffer();
  let inkInstance = null;
  if (hasTTY) {
    console.clear();
    inkInstance = render(React.createElement(RemoteModeDisplay, {
      messageBuffer,
      logPath: process.env.DEBUG ? session.logPath : void 0,
      onExit: async () => {
        logger.debug("[remote]: Exiting client via Ctrl-C");
        if (!exitReason) {
          exitReason = "exit";
        }
        await abort();
      },
      onSwitchToLocal: () => {
        logger.debug("[remote]: Switching to local mode via double space");
        doSwitch();
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
  let exitReason = null;
  let abortController = null;
  let abortFuture = null;
  async function abort() {
    if (abortController && !abortController.signal.aborted) {
      abortController.abort();
    }
    await abortFuture?.promise;
  }
  async function doAbort() {
    logger.debug("[remote]: doAbort");
    await abort();
  }
  async function doSwitch() {
    logger.debug("[remote]: doSwitch");
    if (!exitReason) {
      exitReason = "switch";
    }
    await abort();
  }
  session.client.rpcHandlerManager.registerHandler("abort", doAbort);
  session.client.rpcHandlerManager.registerHandler("switch", doSwitch);
  const permissionHandler = new PermissionHandler(session);
  const messageQueue = new OutgoingMessageQueue(
    (logMessage) => session.client.sendClaudeSessionMessage(logMessage)
  );
  permissionHandler.setOnPermissionRequest((toolCallId) => {
    messageQueue.releaseToolCall(toolCallId);
  });
  const sdkToLogConverter = new SDKToLogConverter({
    sessionId: session.sessionId || "unknown",
    cwd: session.path,
    version: process.env.npm_package_version
  }, permissionHandler.getResponses());
  let planModeToolCalls = /* @__PURE__ */ new Set();
  let ongoingToolCalls = /* @__PURE__ */ new Map();
  function onMessage(message) {
    formatClaudeMessageForInk(message, messageBuffer);
    permissionHandler.onMessage(message);
    if (message.type === "assistant") {
      let umessage = message;
      if (umessage.message.content && Array.isArray(umessage.message.content)) {
        for (let c of umessage.message.content) {
          if (c.type === "tool_use" && (c.name === "exit_plan_mode" || c.name === "ExitPlanMode")) {
            logger.debug("[remote]: detected plan mode tool call " + c.id);
            planModeToolCalls.add(c.id);
          }
        }
      }
    }
    if (message.type === "assistant") {
      let umessage = message;
      if (umessage.message.content && Array.isArray(umessage.message.content)) {
        for (let c of umessage.message.content) {
          if (c.type === "tool_use") {
            logger.debug("[remote]: detected tool use " + c.id + " parent: " + umessage.parent_tool_use_id);
            ongoingToolCalls.set(c.id, { parentToolCallId: umessage.parent_tool_use_id ?? null });
          }
        }
      }
    }
    if (message.type === "user") {
      let umessage = message;
      if (umessage.message.content && Array.isArray(umessage.message.content)) {
        for (let c of umessage.message.content) {
          if (c.type === "tool_result" && c.tool_use_id) {
            ongoingToolCalls.delete(c.tool_use_id);
            messageQueue.releaseToolCall(c.tool_use_id);
          }
        }
      }
    }
    let msg = message;
    if (message.type === "user") {
      let umessage = message;
      if (umessage.message.content && Array.isArray(umessage.message.content)) {
        msg = {
          ...umessage,
          message: {
            ...umessage.message,
            content: umessage.message.content.map((c) => {
              if (c.type === "tool_result" && c.tool_use_id && planModeToolCalls.has(c.tool_use_id)) {
                if (c.content === PLAN_FAKE_REJECT) {
                  logger.debug("[remote]: hack plan mode exit");
                  logger.debugLargeJson("[remote]: hack plan mode exit", c);
                  return {
                    ...c,
                    is_error: false,
                    content: "Plan approved",
                    mode: c.mode
                  };
                } else {
                  return c;
                }
              }
              return c;
            })
          }
        };
      }
    }
    const logMessage = sdkToLogConverter.convert(msg);
    if (logMessage) {
      if (logMessage.type === "user" && logMessage.message?.content) {
        const content = Array.isArray(logMessage.message.content) ? logMessage.message.content : [];
        for (let i = 0; i < content.length; i++) {
          const c = content[i];
          if (c.type === "tool_result" && c.tool_use_id) {
            const responses = permissionHandler.getResponses();
            const response = responses.get(c.tool_use_id);
            if (response) {
              const permissions = {
                date: response.receivedAt || Date.now(),
                result: response.approved ? "approved" : "denied"
              };
              if (response.mode) {
                permissions.mode = response.mode;
              }
              if (response.allowTools && response.allowTools.length > 0) {
                permissions.allowedTools = response.allowTools;
              }
              content[i] = {
                ...c,
                permissions
              };
            }
          }
        }
      }
      if (logMessage.type === "assistant" && message.type === "assistant") {
        const assistantMsg = message;
        const toolCallIds = [];
        if (assistantMsg.message.content && Array.isArray(assistantMsg.message.content)) {
          for (const block of assistantMsg.message.content) {
            if (block.type === "tool_use" && block.id) {
              toolCallIds.push(block.id);
            }
          }
        }
        if (toolCallIds.length > 0) {
          const isSidechain = assistantMsg.parent_tool_use_id !== void 0;
          if (!isSidechain) {
            messageQueue.enqueue(logMessage, {
              delay: 250,
              toolCallIds
            });
            return;
          }
        }
      }
      messageQueue.enqueue(logMessage);
    }
    if (message.type === "assistant") {
      let umessage = message;
      if (umessage.message.content && Array.isArray(umessage.message.content)) {
        for (let c of umessage.message.content) {
          if (c.type === "tool_use" && c.name === "Task" && c.input && typeof c.input.prompt === "string") {
            const logMessage2 = sdkToLogConverter.convertSidechainUserMessage(c.id, c.input.prompt);
            if (logMessage2) {
              messageQueue.enqueue(logMessage2);
            }
          }
        }
      }
    }
  }
  try {
    let pending = null;
    let previousSessionId = null;
    while (!exitReason) {
      logger.debug("[remote]: launch");
      messageBuffer.addMessage("\u2550".repeat(40), "status");
      const isNewSession = session.sessionId !== previousSessionId;
      if (isNewSession) {
        messageBuffer.addMessage("Starting new Claude session...", "status");
        permissionHandler.reset();
        sdkToLogConverter.resetParentChain();
        logger.debug(`[remote]: New session detected (previous: ${previousSessionId}, current: ${session.sessionId})`);
      } else {
        messageBuffer.addMessage("Continuing Claude session...", "status");
        logger.debug(`[remote]: Continuing existing session: ${session.sessionId}`);
      }
      previousSessionId = session.sessionId;
      const controller = new AbortController();
      abortController = controller;
      abortFuture = new Future();
      let modeHash = null;
      let mode = null;
      try {
        const remoteResult = await claudeRemote({
          sessionId: session.sessionId,
          path: session.path,
          allowedTools: session.allowedTools ?? [],
          mcpServers: session.mcpServers,
          hookSettingsPath: session.hookSettingsPath,
          jsRuntime: session.jsRuntime,
          canCallTool: permissionHandler.handleToolCall,
          isAborted: (toolCallId) => {
            return permissionHandler.isAborted(toolCallId);
          },
          nextMessage: async () => {
            if (pending) {
              let p = pending;
              pending = null;
              permissionHandler.handleModeChange(p.mode.permissionMode);
              return p;
            }
            let msg = await session.queue.waitForMessagesAndGetAsString(controller.signal);
            if (msg) {
              if (modeHash && msg.hash !== modeHash || msg.isolate) {
                logger.debug("[remote]: mode has changed, pending message");
                pending = msg;
                return null;
              }
              modeHash = msg.hash;
              mode = msg.mode;
              permissionHandler.handleModeChange(mode.permissionMode);
              return {
                message: msg.message,
                mode: msg.mode
              };
            }
            return null;
          },
          onSessionFound: (sessionId) => {
            sdkToLogConverter.updateSessionId(sessionId);
            session.onSessionFound(sessionId);
          },
          onThinkingChange: session.onThinkingChange,
          claudeEnvVars: session.claudeEnvVars,
          claudeArgs: session.claudeArgs,
          onMessage,
          onCompletionEvent: (message) => {
            logger.debug(`[remote]: Completion event: ${message}`);
            session.client.sendSessionEvent({ type: "message", message });
          },
          onSessionReset: () => {
            logger.debug("[remote]: Session reset");
            session.clearSessionId();
          },
          onReady: () => {
            if (!pending && session.queue.size() === 0) {
              session.client.sendSessionEvent({ type: "ready" });
              session.api.push().sendToAllDevices(
                "It's ready!",
                `Claude is waiting for your command`,
                { sessionId: session.client.sessionId }
              );
            }
          },
          signal: abortController.signal
        });
        session.consumeOneTimeFlags();
        if (!exitReason && abortController.signal.aborted) {
          session.client.sendSessionEvent({ type: "message", message: "Aborted by user" });
        }
      } catch (e) {
        logger.debug("[remote]: launch error", e);
        if (!exitReason) {
          session.client.sendSessionEvent({ type: "message", message: "Process exited unexpectedly" });
          continue;
        }
      } finally {
        logger.debug("[remote]: launch finally");
        for (let [toolCallId, { parentToolCallId }] of ongoingToolCalls) {
          const converted = sdkToLogConverter.generateInterruptedToolResult(toolCallId, parentToolCallId);
          if (converted) {
            logger.debug("[remote]: terminating tool call " + toolCallId + " parent: " + parentToolCallId);
            session.client.sendClaudeSessionMessage(converted);
          }
        }
        ongoingToolCalls.clear();
        logger.debug("[remote]: flushing message queue");
        await messageQueue.flush();
        messageQueue.destroy();
        logger.debug("[remote]: message queue flushed");
        abortController = null;
        abortFuture?.resolve(void 0);
        abortFuture = null;
        logger.debug("[remote]: launch done");
        permissionHandler.reset();
        modeHash = null;
        mode = null;
      }
    }
  } finally {
    permissionHandler.reset();
    process.stdin.off("data", abort);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    if (inkInstance) {
      inkInstance.unmount();
    }
    messageBuffer.clear();
    if (abortFuture) {
      abortFuture.resolve(void 0);
    }
  }
  return exitReason || "exit";
}

async function loop(opts) {
  const logPath = logger.logFilePath;
  let session = new Session({
    api: opts.api,
    client: opts.session,
    path: opts.path,
    sessionId: null,
    claudeEnvVars: opts.claudeEnvVars,
    claudeArgs: opts.claudeArgs,
    mcpServers: opts.mcpServers,
    logPath,
    messageQueue: opts.messageQueue,
    allowedTools: opts.allowedTools,
    onModeChange: opts.onModeChange,
    hookSettingsPath: opts.hookSettingsPath,
    jsRuntime: opts.jsRuntime
  });
  if (opts.onSessionReady) {
    opts.onSessionReady(session);
  }
  let mode = opts.startingMode ?? "local";
  while (true) {
    logger.debug(`[loop] Iteration with mode: ${mode}`);
    if (mode === "local") {
      let reason = await claudeLocalLauncher(session);
      if (reason === "exit") {
        return;
      }
      mode = "remote";
      if (opts.onModeChange) {
        opts.onModeChange(mode);
      }
      continue;
    }
    if (mode === "remote") {
      let reason = await claudeRemoteLauncher(session);
      if (reason === "exit") {
        return;
      }
      mode = "local";
      if (opts.onModeChange) {
        opts.onModeChange(mode);
      }
      continue;
    }
  }
}

async function extractSDKMetadata() {
  const abortController = new AbortController();
  try {
    logger.debug("[metadataExtractor] Starting SDK metadata extraction");
    const sdkQuery = query({
      prompt: "hello",
      options: {
        allowedTools: ["Bash(echo)"],
        maxTurns: 1,
        abort: abortController.signal
      }
    });
    for await (const message of sdkQuery) {
      if (message.type === "system" && message.subtype === "init") {
        const systemMessage = message;
        const metadata = {
          tools: systemMessage.tools,
          slashCommands: systemMessage.slash_commands
        };
        logger.debug("[metadataExtractor] Captured SDK metadata:", metadata);
        abortController.abort();
        return metadata;
      }
    }
    logger.debug("[metadataExtractor] No init message received from SDK");
    return {};
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      logger.debug("[metadataExtractor] SDK query aborted after capturing metadata");
      return {};
    }
    logger.debug("[metadataExtractor] Error extracting SDK metadata:", error);
    return {};
  }
}
function extractSDKMetadataAsync(onComplete) {
  extractSDKMetadata().then((metadata) => {
    if (metadata.tools || metadata.slashCommands) {
      onComplete(metadata);
    }
  }).catch((error) => {
    logger.debug("[metadataExtractor] Async extraction failed:", error);
  });
}

async function startHookServer(options) {
  const { onSessionHook } = options;
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      if (req.method === "POST" && req.url === "/hook/session-start") {
        const timeout = setTimeout(() => {
          if (!res.headersSent) {
            logger.debug("[hookServer] Request timeout");
            res.writeHead(408).end("timeout");
          }
        }, 5e3);
        try {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          clearTimeout(timeout);
          const body = Buffer.concat(chunks).toString("utf-8");
          logger.debug("[hookServer] Received session hook:", body);
          let data = {};
          try {
            data = JSON.parse(body);
          } catch (parseError) {
            logger.debug("[hookServer] Failed to parse hook data as JSON:", parseError);
          }
          const sessionId = data.session_id || data.sessionId;
          if (sessionId) {
            logger.debug(`[hookServer] Session hook received session ID: ${sessionId}`);
            onSessionHook(sessionId, data);
          } else {
            logger.debug("[hookServer] Session hook received but no session_id found in data");
          }
          res.writeHead(200, { "Content-Type": "text/plain" }).end("ok");
        } catch (error) {
          clearTimeout(timeout);
          logger.debug("[hookServer] Error handling session hook:", error);
          if (!res.headersSent) {
            res.writeHead(500).end("error");
          }
        }
        return;
      }
      res.writeHead(404).end("not found");
    });
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to get server address"));
        return;
      }
      const port = address.port;
      logger.debug(`[hookServer] Started on port ${port}`);
      resolve({
        port,
        stop: () => {
          server.close();
          logger.debug("[hookServer] Stopped");
        }
      });
    });
    server.on("error", (err) => {
      logger.debug("[hookServer] Server error:", err);
      reject(err);
    });
  });
}

function generateHookSettingsFile(port) {
  const hooksDir = join(configuration.happyHomeDir, "tmp", "hooks");
  mkdirSync(hooksDir, { recursive: true });
  const filename = `session-hook-${process.pid}.json`;
  const filepath = join(hooksDir, filename);
  const forwarderScript = resolve(projectPath(), "scripts", "session_hook_forwarder.cjs");
  const hookCommand = `node "${forwarderScript}" ${port}`;
  const settings = {
    hooks: {
      SessionStart: [
        {
          matcher: "*",
          hooks: [
            {
              type: "command",
              command: hookCommand
            }
          ]
        }
      ]
    }
  };
  writeFileSync(filepath, JSON.stringify(settings, null, 2));
  logger.debug(`[generateHookSettings] Created hook settings file: ${filepath}`);
  return filepath;
}
function cleanupHookSettingsFile(filepath) {
  try {
    if (existsSync(filepath)) {
      unlinkSync(filepath);
      logger.debug(`[generateHookSettings] Cleaned up hook settings file: ${filepath}`);
    }
  } catch (error) {
    logger.debug(`[generateHookSettings] Failed to cleanup hook settings file: ${error}`);
  }
}

async function runClaude(credentials, options = {}) {
  logger.debug(`[CLAUDE] ===== CLAUDE MODE STARTING =====`);
  logger.debug(`[CLAUDE] This is the Claude agent, NOT Gemini`);
  const workingDirectory = process.cwd();
  const sessionTag = randomUUID();
  logger.debugLargeJson("[START] Happy process started", getEnvironmentInfo());
  logger.debug(`[START] Options: startedBy=${options.startedBy}, startingMode=${options.startingMode}`);
  if (options.startedBy === "daemon" && options.startingMode === "local") {
    throw new Error("Daemon-spawned sessions cannot use local/interactive mode. Use --happy-starting-mode remote or spawn sessions directly from terminal.");
  }
  connectionState.setBackend("Claude");
  const api = await ApiClient.create(credentials);
  let state = {};
  const settings = await readSettings();
  let machineId = settings?.machineId;
  if (!machineId) {
    console.error(`[START] No machine ID found in settings, which is unexpected since authAndSetupMachineIfNeeded should have created it. Please report this issue on https://github.com/slopus/happy-cli/issues`);
    process.exit(1);
  }
  logger.debug(`Using machineId: ${machineId}`);
  await api.getOrCreateMachine({
    machineId,
    metadata: initialMachineMetadata
  });
  let metadata = {
    path: workingDirectory,
    host: os.hostname(),
    version: packageJson.version,
    os: os.platform(),
    machineId,
    homeDir: os.homedir(),
    happyHomeDir: configuration.happyHomeDir,
    happyLibDir: projectPath(),
    happyToolsDir: resolve(projectPath(), "tools", "unpacked"),
    startedFromDaemon: options.startedBy === "daemon",
    hostPid: process.pid,
    startedBy: options.startedBy || "terminal",
    // Initialize lifecycle state
    lifecycleState: "running",
    lifecycleStateSince: Date.now(),
    flavor: "claude"
  };
  const response = await api.getOrCreateSession({ tag: sessionTag, metadata, state });
  if (!response) {
    let offlineSessionId = null;
    const reconnection = startOfflineReconnection({
      serverUrl: configuration.serverUrl,
      onReconnected: async () => {
        const resp = await api.getOrCreateSession({ tag: randomUUID(), metadata, state });
        if (!resp) throw new Error("Server unavailable");
        const session2 = api.sessionSyncClient(resp);
        const scanner = await createSessionScanner({
          sessionId: null,
          workingDirectory,
          onMessage: (msg) => session2.sendClaudeSessionMessage(msg)
        });
        if (offlineSessionId) scanner.onNewSession(offlineSessionId);
        return { session: session2, scanner };
      },
      onNotify: console.log,
      onCleanup: () => {
      }
    });
    try {
      await claudeLocal({
        path: workingDirectory,
        sessionId: null,
        onSessionFound: (id) => {
          offlineSessionId = id;
        },
        onThinkingChange: () => {
        },
        abort: new AbortController().signal,
        claudeEnvVars: options.claudeEnvVars,
        claudeArgs: options.claudeArgs,
        mcpServers: {},
        allowedTools: []
      });
    } finally {
      reconnection.cancel();
      stopCaffeinate();
    }
    process.exit(0);
  }
  logger.debug(`Session created: ${response.id}`);
  try {
    logger.debug(`[START] Reporting session ${response.id} to daemon`);
    const result = await notifyDaemonSessionStarted(response.id, metadata);
    if (result.error) {
      logger.debug(`[START] Failed to report to daemon (may not be running):`, result.error);
    } else {
      logger.debug(`[START] Reported session ${response.id} to daemon`);
    }
  } catch (error) {
    logger.debug("[START] Failed to report to daemon (may not be running):", error);
  }
  extractSDKMetadataAsync(async (sdkMetadata) => {
    logger.debug("[start] SDK metadata extracted, updating session:", sdkMetadata);
    try {
      api.sessionSyncClient(response).updateMetadata((currentMetadata) => ({
        ...currentMetadata,
        tools: sdkMetadata.tools,
        slashCommands: sdkMetadata.slashCommands
      }));
      logger.debug("[start] Session metadata updated with SDK capabilities");
    } catch (error) {
      logger.debug("[start] Failed to update session metadata:", error);
    }
  });
  const session = api.sessionSyncClient(response);
  const happyServer = await startHappyServer(session);
  logger.debug(`[START] Happy MCP server started at ${happyServer.url}`);
  let currentSession = null;
  const hookServer = await startHookServer({
    onSessionHook: (sessionId, data) => {
      logger.debug(`[START] Session hook received: ${sessionId}`, data);
      if (currentSession) {
        const previousSessionId = currentSession.sessionId;
        if (previousSessionId !== sessionId) {
          logger.debug(`[START] Claude session ID changed: ${previousSessionId} -> ${sessionId}`);
          currentSession.onSessionFound(sessionId);
        }
      }
    }
  });
  logger.debug(`[START] Hook server started on port ${hookServer.port}`);
  const hookSettingsPath = generateHookSettingsFile(hookServer.port);
  logger.debug(`[START] Generated hook settings file: ${hookSettingsPath}`);
  const logPath = logger.logFilePath;
  logger.infoDeveloper(`Session: ${response.id}`);
  logger.infoDeveloper(`Logs: ${logPath}`);
  session.updateAgentState((currentState) => ({
    ...currentState,
    controlledByUser: options.startingMode !== "remote"
  }));
  const caffeinateStarted = startCaffeinate();
  if (caffeinateStarted) {
    logger.infoDeveloper("Sleep prevention enabled (macOS)");
  }
  const messageQueue = new MessageQueue2((mode) => hashObject({
    isPlan: mode.permissionMode === "plan",
    model: mode.model,
    fallbackModel: mode.fallbackModel,
    customSystemPrompt: mode.customSystemPrompt,
    appendSystemPrompt: mode.appendSystemPrompt,
    allowedTools: mode.allowedTools,
    disallowedTools: mode.disallowedTools
  }));
  let currentPermissionMode = options.permissionMode;
  let currentModel = options.model;
  let currentFallbackModel = void 0;
  let currentCustomSystemPrompt = void 0;
  let currentAppendSystemPrompt = void 0;
  let currentAllowedTools = void 0;
  let currentDisallowedTools = void 0;
  session.onUserMessage((message) => {
    let messagePermissionMode = currentPermissionMode;
    if (message.meta?.permissionMode) {
      messagePermissionMode = message.meta.permissionMode;
      currentPermissionMode = messagePermissionMode;
      logger.debug(`[loop] Permission mode updated from user message to: ${currentPermissionMode}`);
    } else {
      logger.debug(`[loop] User message received with no permission mode override, using current: ${currentPermissionMode}`);
    }
    let messageModel = currentModel;
    if (message.meta?.hasOwnProperty("model")) {
      messageModel = message.meta.model || void 0;
      currentModel = messageModel;
      logger.debug(`[loop] Model updated from user message: ${messageModel || "reset to default"}`);
    } else {
      logger.debug(`[loop] User message received with no model override, using current: ${currentModel || "default"}`);
    }
    let messageCustomSystemPrompt = currentCustomSystemPrompt;
    if (message.meta?.hasOwnProperty("customSystemPrompt")) {
      messageCustomSystemPrompt = message.meta.customSystemPrompt || void 0;
      currentCustomSystemPrompt = messageCustomSystemPrompt;
      logger.debug(`[loop] Custom system prompt updated from user message: ${messageCustomSystemPrompt ? "set" : "reset to none"}`);
    } else {
      logger.debug(`[loop] User message received with no custom system prompt override, using current: ${currentCustomSystemPrompt ? "set" : "none"}`);
    }
    let messageFallbackModel = currentFallbackModel;
    if (message.meta?.hasOwnProperty("fallbackModel")) {
      messageFallbackModel = message.meta.fallbackModel || void 0;
      currentFallbackModel = messageFallbackModel;
      logger.debug(`[loop] Fallback model updated from user message: ${messageFallbackModel || "reset to none"}`);
    } else {
      logger.debug(`[loop] User message received with no fallback model override, using current: ${currentFallbackModel || "none"}`);
    }
    let messageAppendSystemPrompt = currentAppendSystemPrompt;
    if (message.meta?.hasOwnProperty("appendSystemPrompt")) {
      messageAppendSystemPrompt = message.meta.appendSystemPrompt || void 0;
      currentAppendSystemPrompt = messageAppendSystemPrompt;
      logger.debug(`[loop] Append system prompt updated from user message: ${messageAppendSystemPrompt ? "set" : "reset to none"}`);
    } else {
      logger.debug(`[loop] User message received with no append system prompt override, using current: ${currentAppendSystemPrompt ? "set" : "none"}`);
    }
    let messageAllowedTools = currentAllowedTools;
    if (message.meta?.hasOwnProperty("allowedTools")) {
      messageAllowedTools = message.meta.allowedTools || void 0;
      currentAllowedTools = messageAllowedTools;
      logger.debug(`[loop] Allowed tools updated from user message: ${messageAllowedTools ? messageAllowedTools.join(", ") : "reset to none"}`);
    } else {
      logger.debug(`[loop] User message received with no allowed tools override, using current: ${currentAllowedTools ? currentAllowedTools.join(", ") : "none"}`);
    }
    let messageDisallowedTools = currentDisallowedTools;
    if (message.meta?.hasOwnProperty("disallowedTools")) {
      messageDisallowedTools = message.meta.disallowedTools || void 0;
      currentDisallowedTools = messageDisallowedTools;
      logger.debug(`[loop] Disallowed tools updated from user message: ${messageDisallowedTools ? messageDisallowedTools.join(", ") : "reset to none"}`);
    } else {
      logger.debug(`[loop] User message received with no disallowed tools override, using current: ${currentDisallowedTools ? currentDisallowedTools.join(", ") : "none"}`);
    }
    const specialCommand = parseSpecialCommand(message.content.text);
    if (specialCommand.type === "compact") {
      logger.debug("[start] Detected /compact command");
      const enhancedMode2 = {
        permissionMode: messagePermissionMode || "default",
        model: messageModel,
        fallbackModel: messageFallbackModel,
        customSystemPrompt: messageCustomSystemPrompt,
        appendSystemPrompt: messageAppendSystemPrompt,
        allowedTools: messageAllowedTools,
        disallowedTools: messageDisallowedTools
      };
      messageQueue.pushIsolateAndClear(specialCommand.originalMessage || message.content.text, enhancedMode2);
      logger.debugLargeJson("[start] /compact command pushed to queue:", message);
      return;
    }
    if (specialCommand.type === "clear") {
      logger.debug("[start] Detected /clear command");
      const enhancedMode2 = {
        permissionMode: messagePermissionMode || "default",
        model: messageModel,
        fallbackModel: messageFallbackModel,
        customSystemPrompt: messageCustomSystemPrompt,
        appendSystemPrompt: messageAppendSystemPrompt,
        allowedTools: messageAllowedTools,
        disallowedTools: messageDisallowedTools
      };
      messageQueue.pushIsolateAndClear(specialCommand.originalMessage || message.content.text, enhancedMode2);
      logger.debugLargeJson("[start] /compact command pushed to queue:", message);
      return;
    }
    const enhancedMode = {
      permissionMode: messagePermissionMode || "default",
      model: messageModel,
      fallbackModel: messageFallbackModel,
      customSystemPrompt: messageCustomSystemPrompt,
      appendSystemPrompt: messageAppendSystemPrompt,
      allowedTools: messageAllowedTools,
      disallowedTools: messageDisallowedTools
    };
    messageQueue.push(message.content.text, enhancedMode);
    logger.debugLargeJson("User message pushed to queue:", message);
  });
  const cleanup = async () => {
    logger.debug("[START] Received termination signal, cleaning up...");
    try {
      if (session) {
        session.updateMetadata((currentMetadata) => ({
          ...currentMetadata,
          lifecycleState: "archived",
          lifecycleStateSince: Date.now(),
          archivedBy: "cli",
          archiveReason: "User terminated"
        }));
        currentSession?.cleanup();
        session.sendSessionDeath();
        await session.flush();
        await session.close();
      }
      stopCaffeinate();
      happyServer.stop();
      hookServer.stop();
      cleanupHookSettingsFile(hookSettingsPath);
      logger.debug("[START] Cleanup complete, exiting");
      process.exit(0);
    } catch (error) {
      logger.debug("[START] Error during cleanup:", error);
      process.exit(1);
    }
  };
  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
  process.on("uncaughtException", (error) => {
    logger.debug("[START] Uncaught exception:", error);
    cleanup();
  });
  process.on("unhandledRejection", (reason) => {
    logger.debug("[START] Unhandled rejection:", reason);
    cleanup();
  });
  registerKillSessionHandler(session.rpcHandlerManager, cleanup);
  await loop({
    path: workingDirectory,
    model: options.model,
    permissionMode: options.permissionMode,
    startingMode: options.startingMode,
    messageQueue,
    api,
    allowedTools: happyServer.toolNames.map((toolName) => `mcp__happy__${toolName}`),
    onModeChange: (newMode) => {
      session.sendSessionEvent({ type: "switch", mode: newMode });
      session.updateAgentState((currentState) => ({
        ...currentState,
        controlledByUser: newMode === "local"
      }));
    },
    onSessionReady: (sessionInstance) => {
      currentSession = sessionInstance;
    },
    mcpServers: {
      "happy": {
        type: "http",
        url: happyServer.url
      }
    },
    session,
    claudeEnvVars: options.claudeEnvVars,
    claudeArgs: options.claudeArgs,
    hookSettingsPath,
    jsRuntime: options.jsRuntime
  });
  currentSession?.cleanup();
  session.sendSessionDeath();
  logger.debug("Waiting for socket to flush...");
  await session.flush();
  logger.debug("Closing session...");
  await session.close();
  stopCaffeinate();
  logger.debug("Stopped sleep prevention");
  happyServer.stop();
  logger.debug("Stopped Happy MCP server");
  hookServer.stop();
  cleanupHookSettingsFile(hookSettingsPath);
  logger.debug("Stopped Hook server and cleaned up settings file");
  process.exit(0);
}

const PLIST_LABEL$1 = "com.happy-cli.daemon";
const PLIST_FILE$1 = `/Library/LaunchDaemons/${PLIST_LABEL$1}.plist`;
async function install$1() {
  try {
    if (existsSync$1(PLIST_FILE$1)) {
      logger.info("Daemon plist already exists. Uninstalling first...");
      execSync$1(`launchctl unload ${PLIST_FILE$1}`, { stdio: "inherit" });
    }
    const happyPath = process.argv[0];
    const scriptPath = process.argv[1];
    const plistContent = trimIdent(`
            <?xml version="1.0" encoding="UTF-8"?>
            <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
            <plist version="1.0">
            <dict>
                <key>Label</key>
                <string>${PLIST_LABEL$1}</string>
                
                <key>ProgramArguments</key>
                <array>
                    <string>${happyPath}</string>
                    <string>${scriptPath}</string>
                    <string>happy-daemon</string>
                </array>
                
                <key>EnvironmentVariables</key>
                <dict>
                    <key>HAPPY_DAEMON_MODE</key>
                    <string>true</string>
                </dict>
                
                <key>RunAtLoad</key>
                <true/>
                
                <key>KeepAlive</key>
                <true/>
                
                <key>StandardErrorPath</key>
                <string>${os$1.homedir()}/.happy/daemon.err</string>
                
                <key>StandardOutPath</key>
                <string>${os$1.homedir()}/.happy/daemon.log</string>
                
                <key>WorkingDirectory</key>
                <string>/tmp</string>
            </dict>
            </plist>
        `);
    writeFileSync$1(PLIST_FILE$1, plistContent);
    chmodSync(PLIST_FILE$1, 420);
    logger.info(`Created daemon plist at ${PLIST_FILE$1}`);
    execSync$1(`launchctl load ${PLIST_FILE$1}`, { stdio: "inherit" });
    logger.info("Daemon installed and started successfully");
    logger.info("Check logs at ~/.happy/daemon.log");
  } catch (error) {
    logger.debug("Failed to install daemon:", error);
    throw error;
  }
}

async function install() {
  if (process.platform !== "darwin") {
    throw new Error("Daemon installation is currently only supported on macOS");
  }
  if (process.getuid && process.getuid() !== 0) {
    throw new Error("Daemon installation requires sudo privileges. Please run with sudo.");
  }
  logger.info("Installing Happy CLI daemon for macOS...");
  await install$1();
}

const PLIST_LABEL = "com.happy-cli.daemon";
const PLIST_FILE = `/Library/LaunchDaemons/${PLIST_LABEL}.plist`;
async function uninstall$1() {
  try {
    if (!existsSync$1(PLIST_FILE)) {
      logger.info("Daemon plist not found. Nothing to uninstall.");
      return;
    }
    try {
      execSync$1(`launchctl unload ${PLIST_FILE}`, { stdio: "inherit" });
      logger.info("Daemon stopped successfully");
    } catch (error) {
      logger.info("Failed to unload daemon (it might not be running)");
    }
    unlinkSync$1(PLIST_FILE);
    logger.info(`Removed daemon plist from ${PLIST_FILE}`);
    logger.info("Daemon uninstalled successfully");
  } catch (error) {
    logger.debug("Failed to uninstall daemon:", error);
    throw error;
  }
}

async function uninstall() {
  if (process.platform !== "darwin") {
    throw new Error("Daemon uninstallation is currently only supported on macOS");
  }
  if (process.getuid && process.getuid() !== 0) {
    throw new Error("Daemon uninstallation requires sudo privileges. Please run with sudo.");
  }
  logger.info("Uninstalling Happy CLI daemon for macOS...");
  await uninstall$1();
}

async function handleAuthCommand(args) {
  const subcommand = args[0];
  if (!subcommand || subcommand === "help" || subcommand === "--help" || subcommand === "-h") {
    showAuthHelp();
    return;
  }
  switch (subcommand) {
    case "login":
      await handleAuthLogin(args.slice(1));
      break;
    case "logout":
      await handleAuthLogout();
      break;
    case "status":
      await handleAuthStatus();
      break;
    default:
      console.error(chalk.red(`Unknown auth subcommand: ${subcommand}`));
      showAuthHelp();
      process.exit(1);
  }
}
function showAuthHelp() {
  console.log(`
${chalk.bold("happy auth")} - Authentication management

${chalk.bold("Usage:")}
  happy auth login [--force]    Authenticate with Happy
  happy auth logout             Remove authentication and machine data
  happy auth status             Show authentication status
  happy auth help               Show this help message

${chalk.bold("Options:")}
  --force    Clear credentials, machine ID, and stop daemon before re-auth

${chalk.gray("PS: Your master secret never leaves your mobile/web device. Each CLI machine")}
${chalk.gray("receives only a derived key for per-machine encryption, so backup codes")}
${chalk.gray("cannot be displayed from the CLI.")}
`);
}
async function handleAuthLogin(args) {
  const forceAuth = args.includes("--force") || args.includes("-f");
  if (forceAuth) {
    console.log(chalk.yellow("Force authentication requested."));
    console.log(chalk.gray("This will:"));
    console.log(chalk.gray("  \u2022 Clear existing credentials"));
    console.log(chalk.gray("  \u2022 Clear machine ID"));
    console.log(chalk.gray("  \u2022 Stop daemon if running"));
    console.log(chalk.gray("  \u2022 Re-authenticate and register machine\n"));
    try {
      logger.debug("Stopping daemon for force auth...");
      await stopDaemon();
      console.log(chalk.gray("\u2713 Stopped daemon"));
    } catch (error) {
      logger.debug("Daemon was not running or failed to stop:", error);
    }
    await clearCredentials();
    console.log(chalk.gray("\u2713 Cleared credentials"));
    await clearMachineId();
    console.log(chalk.gray("\u2713 Cleared machine ID"));
    console.log("");
  }
  if (!forceAuth) {
    const existingCreds = await readCredentials();
    const settings = await readSettings();
    if (existingCreds && settings?.machineId) {
      console.log(chalk.green("\u2713 Already authenticated"));
      console.log(chalk.gray(`  Machine ID: ${settings.machineId}`));
      console.log(chalk.gray(`  Host: ${os.hostname()}`));
      console.log(chalk.gray(`  Use 'happy auth login --force' to re-authenticate`));
      return;
    } else if (existingCreds && !settings?.machineId) {
      console.log(chalk.yellow("\u26A0\uFE0F  Credentials exist but machine ID is missing"));
      console.log(chalk.gray("  This can happen if --auth flag was used previously"));
      console.log(chalk.gray("  Fixing by setting up machine...\n"));
    }
  }
  try {
    const result = await authAndSetupMachineIfNeeded();
    console.log(chalk.green("\n\u2713 Authentication successful"));
    console.log(chalk.gray(`  Machine ID: ${result.machineId}`));
  } catch (error) {
    console.error(chalk.red("Authentication failed:"), error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
}
async function handleAuthLogout() {
  const happyDir = configuration.happyHomeDir;
  const credentials = await readCredentials();
  if (!credentials) {
    console.log(chalk.yellow("Not currently authenticated"));
    return;
  }
  console.log(chalk.blue("This will log you out of Happy"));
  console.log(chalk.yellow("\u26A0\uFE0F  You will need to re-authenticate to use Happy again"));
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const answer = await new Promise((resolve) => {
    rl.question(chalk.yellow("Are you sure you want to log out? (y/N): "), resolve);
  });
  rl.close();
  if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
    try {
      try {
        await stopDaemon();
        console.log(chalk.gray("Stopped daemon"));
      } catch {
      }
      if (existsSync(happyDir)) {
        rmSync(happyDir, { recursive: true, force: true });
      }
      console.log(chalk.green("\u2713 Successfully logged out"));
      console.log(chalk.gray('  Run "happy auth login" to authenticate again'));
    } catch (error) {
      throw new Error(`Failed to logout: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  } else {
    console.log(chalk.blue("Logout cancelled"));
  }
}
async function handleAuthStatus() {
  const credentials = await readCredentials();
  const settings = await readSettings();
  console.log(chalk.bold("\nAuthentication Status\n"));
  if (!credentials) {
    console.log(chalk.red("\u2717 Not authenticated"));
    console.log(chalk.gray('  Run "happy auth login" to authenticate'));
    return;
  }
  console.log(chalk.green("\u2713 Authenticated"));
  const tokenPreview = credentials.token.substring(0, 30) + "...";
  console.log(chalk.gray(`  Token: ${tokenPreview}`));
  if (settings?.machineId) {
    console.log(chalk.green("\u2713 Machine registered"));
    console.log(chalk.gray(`  Machine ID: ${settings.machineId}`));
    console.log(chalk.gray(`  Host: ${os.hostname()}`));
  } else {
    console.log(chalk.yellow("\u26A0\uFE0F  Machine not registered"));
    console.log(chalk.gray('  Run "happy auth login --force" to fix this'));
  }
  console.log(chalk.gray(`
  Data directory: ${configuration.happyHomeDir}`));
  try {
    const running = await checkIfDaemonRunningAndCleanupStaleState();
    if (running) {
      console.log(chalk.green("\u2713 Daemon running"));
    } else {
      console.log(chalk.gray("\u2717 Daemon not running"));
    }
  } catch {
    console.log(chalk.gray("\u2717 Daemon not running"));
  }
}

const CLIENT_ID$2 = "app_EMoamEEZ73f0CkXaXp7hrann";
const AUTH_BASE_URL = "https://auth.openai.com";
const DEFAULT_PORT$2 = 1455;
function generatePKCE$2() {
  const verifier = randomBytes(32).toString("base64url").replace(/[^a-zA-Z0-9\-._~]/g, "");
  const challenge = createHash("sha256").update(verifier).digest("base64url").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return { verifier, challenge };
}
function generateState$2() {
  return randomBytes(16).toString("hex");
}
function parseJWT(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  const payload = Buffer.from(parts[1], "base64url").toString();
  return JSON.parse(payload);
}
async function findAvailablePort$2() {
  return new Promise((resolve) => {
    const server = createServer$1();
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}
async function isPortAvailable$2(port) {
  return new Promise((resolve) => {
    const testServer = createServer$1();
    testServer.once("error", () => {
      testServer.close();
      resolve(false);
    });
    testServer.listen(port, "127.0.0.1", () => {
      testServer.close(() => resolve(true));
    });
  });
}
async function exchangeCodeForTokens$2(code, verifier, port) {
  const response = await fetch(`${AUTH_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID$2,
      code,
      code_verifier: verifier,
      redirect_uri: `http://localhost:${port}/auth/callback`
    })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }
  const data = await response.json();
  const idTokenPayload = parseJWT(data.id_token);
  let accountId = idTokenPayload.chatgpt_account_id;
  if (!accountId) {
    const authClaim = idTokenPayload["https://api.openai.com/auth"];
    if (authClaim && typeof authClaim === "object") {
      accountId = authClaim.chatgpt_account_id || authClaim.account_id;
    }
  }
  return {
    id_token: data.id_token,
    access_token: data.access_token || data.id_token,
    refresh_token: data.refresh_token,
    account_id: accountId
  };
}
async function startCallbackServer$2(state, verifier, port) {
  return new Promise((resolve, reject) => {
    const server = createServer$1(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${port}`);
      if (url.pathname === "/auth/callback") {
        const code = url.searchParams.get("code");
        const receivedState = url.searchParams.get("state");
        if (receivedState !== state) {
          res.writeHead(400);
          res.end("Invalid state parameter");
          server.close();
          reject(new Error("Invalid state parameter"));
          return;
        }
        if (!code) {
          res.writeHead(400);
          res.end("No authorization code received");
          server.close();
          reject(new Error("No authorization code received"));
          return;
        }
        try {
          const tokens = await exchangeCodeForTokens$2(code, verifier, port);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
                        <html>
                        <body style="font-family: sans-serif; padding: 20px;">
                            <h2>\u2705 Authentication Successful!</h2>
                            <p>You can close this window and return to your terminal.</p>
                            <script>setTimeout(() => window.close(), 3000);<\/script>
                        </body>
                        </html>
                    `);
          server.close();
          resolve(tokens);
        } catch (error) {
          res.writeHead(500);
          res.end("Token exchange failed");
          server.close();
          reject(error);
        }
      }
    });
    server.listen(port, "127.0.0.1", () => {
    });
    setTimeout(() => {
      server.close();
      reject(new Error("Authentication timeout"));
    }, 5 * 60 * 1e3);
  });
}
async function authenticateCodex() {
  const { verifier, challenge } = generatePKCE$2();
  const state = generateState$2();
  let port = DEFAULT_PORT$2;
  const portAvailable = await isPortAvailable$2(port);
  if (!portAvailable) {
    port = await findAvailablePort$2();
  }
  const serverPromise = startCallbackServer$2(state, verifier, port);
  await new Promise((resolve) => setTimeout(resolve, 100));
  const redirect_uri = `http://localhost:${port}/auth/callback`;
  const params = [
    ["response_type", "code"],
    ["client_id", CLIENT_ID$2],
    ["redirect_uri", redirect_uri],
    ["scope", "openid profile email offline_access"],
    ["code_challenge", challenge],
    ["code_challenge_method", "S256"],
    ["id_token_add_organizations", "true"],
    ["codex_cli_simplified_flow", "true"],
    ["state", state]
  ];
  const queryString = params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");
  const authUrl = `${AUTH_BASE_URL}/oauth/authorize?${queryString}`;
  console.log("\u{1F4CB} Opening browser for authentication...");
  console.log(`If browser doesn't open, visit:
${authUrl}
`);
  await openBrowser(authUrl);
  const tokens = await serverPromise;
  console.log("\u{1F389} Authentication successful!");
  return tokens;
}

const CLIENT_ID$1 = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
const CLAUDE_AI_AUTHORIZE_URL = "https://claude.ai/oauth/authorize";
const TOKEN_URL$1 = "https://console.anthropic.com/v1/oauth/token";
const DEFAULT_PORT$1 = 54545;
const SCOPE = "user:inference";
function generatePKCE$1() {
  const verifier = randomBytes(32).toString("base64url").replace(/[^a-zA-Z0-9\-._~]/g, "");
  const challenge = createHash("sha256").update(verifier).digest("base64url").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return { verifier, challenge };
}
function generateState$1() {
  return randomBytes(32).toString("base64url");
}
async function findAvailablePort$1() {
  return new Promise((resolve) => {
    const server = createServer$1();
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}
async function isPortAvailable$1(port) {
  return new Promise((resolve) => {
    const testServer = createServer$1();
    testServer.once("error", () => {
      testServer.close();
      resolve(false);
    });
    testServer.listen(port, "127.0.0.1", () => {
      testServer.close(() => resolve(true));
    });
  });
}
async function exchangeCodeForTokens$1(code, verifier, port, state) {
  const tokenResponse = await fetch(TOKEN_URL$1, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: `http://localhost:${port}/callback`,
      client_id: CLIENT_ID$1,
      code_verifier: verifier,
      state
    })
  });
  if (!tokenResponse.ok) {
    throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
  }
  const tokenData = await tokenResponse.json();
  return {
    raw: tokenData,
    token: tokenData.access_token,
    expires: Date.now() + tokenData.expires_in * 1e3
  };
}
async function startCallbackServer$1(state, verifier, port) {
  return new Promise((resolve, reject) => {
    const server = createServer$1(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${port}`);
      if (url.pathname === "/callback") {
        const code = url.searchParams.get("code");
        const receivedState = url.searchParams.get("state");
        if (receivedState !== state) {
          res.writeHead(400);
          res.end("Invalid state parameter");
          server.close();
          reject(new Error("Invalid state parameter"));
          return;
        }
        if (!code) {
          res.writeHead(400);
          res.end("No authorization code received");
          server.close();
          reject(new Error("No authorization code received"));
          return;
        }
        try {
          const tokens = await exchangeCodeForTokens$1(code, verifier, port, state);
          res.writeHead(302, {
            "Location": "https://console.anthropic.com/oauth/code/success?app=claude-code"
          });
          res.end();
          server.close();
          resolve(tokens);
        } catch (error) {
          res.writeHead(500);
          res.end("Token exchange failed");
          server.close();
          reject(error);
        }
      }
    });
    server.listen(port, "127.0.0.1", () => {
    });
    setTimeout(() => {
      server.close();
      reject(new Error("Authentication timeout"));
    }, 5 * 60 * 1e3);
  });
}
async function authenticateClaude() {
  console.log("\u{1F680} Starting Anthropic Claude authentication...");
  const { verifier, challenge } = generatePKCE$1();
  const state = generateState$1();
  let port = DEFAULT_PORT$1;
  const portAvailable = await isPortAvailable$1(port);
  if (!portAvailable) {
    console.log(`Port ${port} is in use, finding an available port...`);
    port = await findAvailablePort$1();
  }
  console.log(`\u{1F4E1} Using callback port: ${port}`);
  const serverPromise = startCallbackServer$1(state, verifier, port);
  await new Promise((resolve) => setTimeout(resolve, 100));
  const redirect_uri = `http://localhost:${port}/callback`;
  const params = new URLSearchParams({
    code: "true",
    // This tells Claude.ai to show the code AND redirect
    client_id: CLIENT_ID$1,
    response_type: "code",
    redirect_uri,
    scope: SCOPE,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state
  });
  const authUrl = `${CLAUDE_AI_AUTHORIZE_URL}?${params}`;
  console.log("\u{1F4CB} Opening browser for authentication...");
  console.log("If browser doesn't open, visit this URL:");
  console.log();
  console.log(`${authUrl}`);
  console.log();
  await openBrowser(authUrl);
  try {
    const tokens = await serverPromise;
    console.log("\u{1F389} Authentication successful!");
    console.log("\u2705 OAuth tokens received");
    return tokens;
  } catch (error) {
    console.error("\n\u274C Failed to authenticate with Anthropic");
    throw error;
  }
}

const execAsync = promisify(exec);
const CLIENT_ID = "681255809395-oo8ft2oprdrnp9e3aqf6av3hmdib135j.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DEFAULT_PORT = 54545;
const SCOPES = [
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
].join(" ");
function generatePKCE() {
  const verifier = randomBytes(32).toString("base64url").replace(/[^a-zA-Z0-9\-._~]/g, "");
  const challenge = createHash("sha256").update(verifier).digest("base64url").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return { verifier, challenge };
}
function generateState() {
  return randomBytes(32).toString("hex");
}
async function findAvailablePort() {
  return new Promise((resolve) => {
    const server = createServer$1();
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const testServer = createServer$1();
    testServer.once("error", () => {
      testServer.close();
      resolve(false);
    });
    testServer.listen(port, "127.0.0.1", () => {
      testServer.close(() => resolve(true));
    });
  });
}
async function exchangeCodeForTokens(code, verifier, port) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      code_verifier: verifier,
      redirect_uri: `http://localhost:${port}/oauth2callback`
    })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }
  const data = await response.json();
  return data;
}
async function startCallbackServer(state, verifier, port) {
  return new Promise((resolve, reject) => {
    const server = createServer$1(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${port}`);
      if (url.pathname === "/oauth2callback") {
        const code = url.searchParams.get("code");
        const receivedState = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        if (error) {
          res.writeHead(302, {
            "Location": "https://developers.google.com/gemini-code-assist/auth_failure_gemini"
          });
          res.end();
          server.close();
          reject(new Error(`Authentication error: ${error}`));
          return;
        }
        if (receivedState !== state) {
          res.writeHead(400);
          res.end("State mismatch. Possible CSRF attack");
          server.close();
          reject(new Error("Invalid state parameter"));
          return;
        }
        if (!code) {
          res.writeHead(400);
          res.end("No authorization code received");
          server.close();
          reject(new Error("No authorization code received"));
          return;
        }
        try {
          const tokens = await exchangeCodeForTokens(code, verifier, port);
          res.writeHead(302, {
            "Location": "https://developers.google.com/gemini-code-assist/auth_success_gemini"
          });
          res.end();
          server.close();
          resolve(tokens);
        } catch (error2) {
          res.writeHead(500);
          res.end("Token exchange failed");
          server.close();
          reject(error2);
        }
      }
    });
    server.listen(port, "127.0.0.1", () => {
    });
    setTimeout(() => {
      server.close();
      reject(new Error("Authentication timeout"));
    }, 5 * 60 * 1e3);
  });
}
async function authenticateGemini() {
  console.log("\u{1F680} Starting Google Gemini authentication...");
  const { verifier, challenge } = generatePKCE();
  const state = generateState();
  let port = DEFAULT_PORT;
  const portAvailable = await isPortAvailable(port);
  if (!portAvailable) {
    console.log(`Port ${port} is in use, finding an available port...`);
    port = await findAvailablePort();
  }
  console.log(`\u{1F4E1} Using callback port: ${port}`);
  const serverPromise = startCallbackServer(state, verifier, port);
  await new Promise((resolve) => setTimeout(resolve, 100));
  const redirect_uri = `http://localhost:${port}/oauth2callback`;
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri,
    scope: SCOPES,
    access_type: "offline",
    // To get refresh token
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
    prompt: "consent"
    // Force consent to get refresh token
  });
  const authUrl = `${AUTHORIZE_URL}?${params}`;
  console.log("\n\u{1F4CB} Opening browser for authentication...");
  console.log("If browser doesn't open, visit this URL:");
  console.log(`
${authUrl}
`);
  const platform = process.platform;
  const openCommand = platform === "darwin" ? "open" : platform === "win32" ? "start" : "xdg-open";
  try {
    await execAsync(`${openCommand} "${authUrl}"`);
  } catch {
    console.log("\u26A0\uFE0F  Could not open browser automatically");
  }
  try {
    const tokens = await serverPromise;
    console.log("\n\u{1F389} Authentication successful!");
    console.log("\u2705 OAuth tokens received");
    return tokens;
  } catch (error) {
    console.error("\n\u274C Failed to authenticate with Google");
    throw error;
  }
}

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const decoded = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

async function handleConnectCommand(args) {
  const subcommand = args[0];
  if (!subcommand || subcommand === "help" || subcommand === "--help" || subcommand === "-h") {
    showConnectHelp();
    return;
  }
  switch (subcommand.toLowerCase()) {
    case "codex":
      await handleConnectVendor("codex", "OpenAI");
      break;
    case "claude":
      await handleConnectVendor("claude", "Anthropic");
      break;
    case "gemini":
      await handleConnectVendor("gemini", "Gemini");
      break;
    case "status":
      await handleConnectStatus();
      break;
    default:
      console.error(chalk.red(`Unknown connect target: ${subcommand}`));
      showConnectHelp();
      process.exit(1);
  }
}
function showConnectHelp() {
  console.log(`
${chalk.bold("happy connect")} - Connect AI vendor API keys to Happy cloud

${chalk.bold("Usage:")}
  happy connect codex        Store your Codex API key in Happy cloud
  happy connect claude       Store your Anthropic API key in Happy cloud
  happy connect gemini       Store your Gemini API key in Happy cloud
  happy connect status       Show connection status for all vendors
  happy connect help         Show this help message

${chalk.bold("Description:")}
  The connect command allows you to securely store your AI vendor API keys
  in Happy cloud. This enables you to use these services through Happy
  without exposing your API keys locally.

${chalk.bold("Examples:")}
  happy connect codex
  happy connect claude
  happy connect gemini
  happy connect status

${chalk.bold("Notes:")} 
  \u2022 You must be authenticated with Happy first (run 'happy auth login')
  \u2022 API keys are encrypted and stored securely in Happy cloud
  \u2022 You can manage your stored keys at app.happy.engineering
`);
}
async function handleConnectVendor(vendor, displayName) {
  console.log(chalk.bold(`
\u{1F50C} Connecting ${displayName} to Happy cloud
`));
  const credentials = await readCredentials();
  if (!credentials) {
    console.log(chalk.yellow("\u26A0\uFE0F  Not authenticated with Happy"));
    console.log(chalk.gray('  Please run "happy auth login" first'));
    process.exit(1);
  }
  const api = await ApiClient.create(credentials);
  if (vendor === "codex") {
    console.log("\u{1F680} Registering Codex token with server");
    const codexAuthTokens = await authenticateCodex();
    await api.registerVendorToken("openai", { oauth: codexAuthTokens });
    console.log("\u2705 Codex token registered with server");
    process.exit(0);
  } else if (vendor === "claude") {
    console.log("\u{1F680} Registering Anthropic token with server");
    const anthropicAuthTokens = await authenticateClaude();
    await api.registerVendorToken("anthropic", { oauth: anthropicAuthTokens });
    console.log("\u2705 Anthropic token registered with server");
    process.exit(0);
  } else if (vendor === "gemini") {
    console.log("\u{1F680} Registering Gemini token with server");
    const geminiAuthTokens = await authenticateGemini();
    await api.registerVendorToken("gemini", { oauth: geminiAuthTokens });
    console.log("\u2705 Gemini token registered with server");
    updateLocalGeminiCredentials(geminiAuthTokens);
    process.exit(0);
  } else {
    throw new Error(`Unsupported vendor: ${vendor}`);
  }
}
async function handleConnectStatus() {
  console.log(chalk.bold("\n\u{1F50C} Connection Status\n"));
  const credentials = await readCredentials();
  if (!credentials) {
    console.log(chalk.yellow("\u26A0\uFE0F  Not authenticated with Happy"));
    console.log(chalk.gray('  Please run "happy auth login" first'));
    process.exit(1);
  }
  const api = await ApiClient.create(credentials);
  const vendors = [
    { key: "gemini", name: "Gemini", display: "Google Gemini" },
    { key: "openai", name: "Codex", display: "OpenAI Codex" },
    { key: "anthropic", name: "Claude", display: "Anthropic Claude" }
  ];
  for (const vendor of vendors) {
    try {
      const token = await api.getVendorToken(vendor.key);
      if (token?.oauth) {
        let userInfo = "";
        if (token.oauth.id_token) {
          const payload = decodeJwtPayload(token.oauth.id_token);
          if (payload?.email) {
            userInfo = chalk.gray(` (${payload.email})`);
          }
        }
        const expiresAt = token.oauth.expires_at || (token.oauth.expires_in ? Date.now() + token.oauth.expires_in * 1e3 : null);
        const isExpired = expiresAt && expiresAt < Date.now();
        if (isExpired) {
          console.log(`  ${chalk.yellow("\u26A0\uFE0F")}  ${vendor.display}: ${chalk.yellow("expired")}${userInfo}`);
        } else {
          console.log(`  ${chalk.green("\u2713")}  ${vendor.display}: ${chalk.green("connected")}${userInfo}`);
        }
      } else {
        console.log(`  ${chalk.gray("\u25CB")}  ${vendor.display}: ${chalk.gray("not connected")}`);
      }
    } catch {
      console.log(`  ${chalk.gray("\u25CB")}  ${vendor.display}: ${chalk.gray("not connected")}`);
    }
  }
  console.log("");
  console.log(chalk.gray("To connect a vendor, run: happy connect <vendor>"));
  console.log(chalk.gray("Example: happy connect gemini"));
  console.log("");
}
function updateLocalGeminiCredentials(tokens) {
  try {
    const geminiDir = join$1(homedir$1(), ".gemini");
    const credentialsPath = join$1(geminiDir, "oauth_creds.json");
    if (!existsSync$1(geminiDir)) {
      mkdirSync$1(geminiDir, { recursive: true });
    }
    const credentials = {
      access_token: tokens.access_token,
      token_type: tokens.token_type || "Bearer",
      scope: tokens.scope || "https://www.googleapis.com/auth/cloud-platform",
      ...tokens.refresh_token && { refresh_token: tokens.refresh_token },
      ...tokens.id_token && { id_token: tokens.id_token },
      ...tokens.expires_in && { expires_in: tokens.expires_in }
    };
    writeFileSync$1(credentialsPath, JSON.stringify(credentials, null, 2), "utf-8");
    console.log(chalk.gray(`  Updated local credentials: ${credentialsPath}`));
  } catch (error) {
    console.log(chalk.yellow(`  \u26A0\uFE0F Could not update local credentials: ${error}`));
  }
}

(async () => {
  const args = process.argv.slice(2);
  if (!args.includes("--version")) {
    logger.debug("Starting happy CLI with args: ", process.argv);
  }
  const subcommand = args[0];
  if (!args.includes("--version")) ;
  if (subcommand === "doctor") {
    if (args[1] === "clean") {
      const result = await killRunawayHappyProcesses();
      console.log(`Cleaned up ${result.killed} runaway processes`);
      if (result.errors.length > 0) {
        console.log("Errors:", result.errors);
      }
      process.exit(0);
    }
    await runDoctorCommand();
    return;
  } else if (subcommand === "auth") {
    try {
      await handleAuthCommand(args.slice(1));
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : "Unknown error");
      if (process.env.DEBUG) {
        console.error(error);
      }
      process.exit(1);
    }
    return;
  } else if (subcommand === "connect") {
    try {
      await handleConnectCommand(args.slice(1));
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : "Unknown error");
      if (process.env.DEBUG) {
        console.error(error);
      }
      process.exit(1);
    }
    return;
  } else if (subcommand === "codex") {
    try {
      const { runCodex } = await import('./runCodex-CPL8B7Hh.mjs');
      let startedBy = void 0;
      for (let i = 1; i < args.length; i++) {
        if (args[i] === "--started-by") {
          startedBy = args[++i];
        }
      }
      const {
        credentials
      } = await authAndSetupMachineIfNeeded();
      await runCodex({ credentials, startedBy });
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : "Unknown error");
      if (process.env.DEBUG) {
        console.error(error);
      }
      process.exit(1);
    }
    return;
  } else if (subcommand === "gemini") {
    const geminiSubcommand = args[1];
    if (geminiSubcommand === "model" && args[2] === "set" && args[3]) {
      const modelName = args[3];
      const validModels = ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite"];
      if (!validModels.includes(modelName)) {
        console.error(`Invalid model: ${modelName}`);
        console.error(`Available models: ${validModels.join(", ")}`);
        process.exit(1);
      }
      try {
        const { existsSync, readFileSync, writeFileSync, mkdirSync } = require("fs");
        const { join } = require("path");
        const { homedir } = require("os");
        const configDir = join(homedir(), ".gemini");
        const configPath = join(configDir, "config.json");
        if (!existsSync(configDir)) {
          mkdirSync(configDir, { recursive: true });
        }
        let config = {};
        if (existsSync(configPath)) {
          try {
            config = JSON.parse(readFileSync(configPath, "utf-8"));
          } catch (error) {
            config = {};
          }
        }
        config.model = modelName;
        writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
        console.log(`\u2713 Model set to: ${modelName}`);
        console.log(`  Config saved to: ${configPath}`);
        console.log(`  This model will be used in future sessions.`);
        process.exit(0);
      } catch (error) {
        console.error("Failed to save model configuration:", error);
        process.exit(1);
      }
    }
    if (geminiSubcommand === "model" && args[2] === "get") {
      try {
        const { existsSync, readFileSync } = require("fs");
        const { join } = require("path");
        const { homedir } = require("os");
        const configPaths = [
          join(homedir(), ".gemini", "config.json"),
          join(homedir(), ".config", "gemini", "config.json")
        ];
        let model = null;
        for (const configPath of configPaths) {
          if (existsSync(configPath)) {
            try {
              const config = JSON.parse(readFileSync(configPath, "utf-8"));
              model = config.model || config.GEMINI_MODEL || null;
              if (model) break;
            } catch (error) {
            }
          }
        }
        if (model) {
          console.log(`Current model: ${model}`);
        } else if (process.env.GEMINI_MODEL) {
          console.log(`Current model: ${process.env.GEMINI_MODEL} (from GEMINI_MODEL env var)`);
        } else {
          console.log("Current model: gemini-2.5-pro (default)");
        }
        process.exit(0);
      } catch (error) {
        console.error("Failed to read model configuration:", error);
        process.exit(1);
      }
    }
    if (geminiSubcommand === "project" && args[2] === "set" && args[3]) {
      const projectId = args[3];
      try {
        const { saveGoogleCloudProjectToConfig } = await import('./config-B7RvsrgJ.mjs');
        const { readCredentials: readCredentials2 } = await import('./registerKillSessionHandler-C8ArcSFa.mjs').then(function (n) { return n.L; });
        const { ApiClient: ApiClient2 } = await import('./registerKillSessionHandler-C8ArcSFa.mjs').then(function (n) { return n.K; });
        let userEmail = void 0;
        try {
          const credentials = await readCredentials2();
          if (credentials) {
            const api = await ApiClient2.create(credentials);
            const vendorToken = await api.getVendorToken("gemini");
            if (vendorToken?.oauth?.id_token) {
              const parts = vendorToken.oauth.id_token.split(".");
              if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
                userEmail = payload.email;
              }
            }
          }
        } catch {
        }
        saveGoogleCloudProjectToConfig(projectId, userEmail);
        console.log(`\u2713 Google Cloud Project set to: ${projectId}`);
        if (userEmail) {
          console.log(`  Linked to account: ${userEmail}`);
        }
        console.log(`  This project will be used for Google Workspace accounts.`);
        process.exit(0);
      } catch (error) {
        console.error("Failed to save project configuration:", error);
        process.exit(1);
      }
    }
    if (geminiSubcommand === "project" && args[2] === "get") {
      try {
        const { readGeminiLocalConfig } = await import('./config-B7RvsrgJ.mjs');
        const config = readGeminiLocalConfig();
        if (config.googleCloudProject) {
          console.log(`Current Google Cloud Project: ${config.googleCloudProject}`);
          if (config.googleCloudProjectEmail) {
            console.log(`  Linked to account: ${config.googleCloudProjectEmail}`);
          } else {
            console.log(`  Applies to: all accounts (global)`);
          }
        } else if (process.env.GOOGLE_CLOUD_PROJECT) {
          console.log(`Current Google Cloud Project: ${process.env.GOOGLE_CLOUD_PROJECT} (from env var)`);
        } else {
          console.log("No Google Cloud Project configured.");
          console.log("");
          console.log('If you see "Authentication required" error, you may need to set a project:');
          console.log("  happy gemini project set <your-project-id>");
          console.log("");
          console.log("This is required for Google Workspace accounts.");
          console.log("Guide: https://goo.gle/gemini-cli-auth-docs#workspace-gca");
        }
        process.exit(0);
      } catch (error) {
        console.error("Failed to read project configuration:", error);
        process.exit(1);
      }
    }
    if (geminiSubcommand === "project" && !args[2]) {
      console.log("Usage: happy gemini project <command>");
      console.log("");
      console.log("Commands:");
      console.log("  set <project-id>   Set Google Cloud Project ID");
      console.log("  get                Show current Google Cloud Project ID");
      console.log("");
      console.log("Google Workspace accounts require a Google Cloud Project.");
      console.log('If you see "Authentication required" error, set your project ID.');
      console.log("");
      console.log("Guide: https://goo.gle/gemini-cli-auth-docs#workspace-gca");
      process.exit(0);
    }
    try {
      const { runGemini } = await import('./runGemini-DlDGsDp1.mjs');
      let startedBy = void 0;
      for (let i = 1; i < args.length; i++) {
        if (args[i] === "--started-by") {
          startedBy = args[++i];
        }
      }
      const {
        credentials
      } = await authAndSetupMachineIfNeeded();
      logger.debug("Ensuring Happy background service is running & matches our version...");
      if (!await isDaemonRunningCurrentlyInstalledHappyVersion()) {
        logger.debug("Starting Happy background service...");
        const daemonProcess = spawnHappyCLI(["daemon", "start-sync"], {
          detached: true,
          stdio: "ignore",
          env: process.env
        });
        daemonProcess.unref();
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      await runGemini({ credentials, startedBy });
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : "Unknown error");
      if (process.env.DEBUG) {
        console.error(error);
      }
      process.exit(1);
    }
    return;
  } else if (subcommand === "logout") {
    console.log(chalk.yellow('Note: "happy logout" is deprecated. Use "happy auth logout" instead.\n'));
    try {
      await handleAuthCommand(["logout"]);
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : "Unknown error");
      if (process.env.DEBUG) {
        console.error(error);
      }
      process.exit(1);
    }
    return;
  } else if (subcommand === "notify") {
    try {
      await handleNotifyCommand(args.slice(1));
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : "Unknown error");
      if (process.env.DEBUG) {
        console.error(error);
      }
      process.exit(1);
    }
    return;
  } else if (subcommand === "daemon") {
    const daemonSubcommand = args[1];
    if (daemonSubcommand === "list") {
      try {
        const sessions = await listDaemonSessions();
        if (sessions.length === 0) {
          console.log("No active sessions this daemon is aware of (they might have been started by a previous version of the daemon)");
        } else {
          console.log("Active sessions:");
          console.log(JSON.stringify(sessions, null, 2));
        }
      } catch (error) {
        console.log("No daemon running");
      }
      return;
    } else if (daemonSubcommand === "stop-session") {
      const sessionId = args[2];
      if (!sessionId) {
        console.error("Session ID required");
        process.exit(1);
      }
      try {
        const success = await stopDaemonSession(sessionId);
        console.log(success ? "Session stopped" : "Failed to stop session");
      } catch (error) {
        console.log("No daemon running");
      }
      return;
    } else if (daemonSubcommand === "start") {
      const child = spawnHappyCLI(["daemon", "start-sync"], {
        detached: true,
        stdio: "ignore",
        env: process.env
      });
      child.unref();
      let started = false;
      for (let i = 0; i < 50; i++) {
        if (await checkIfDaemonRunningAndCleanupStaleState()) {
          started = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (started) {
        console.log("Daemon started successfully");
      } else {
        console.error("Failed to start daemon");
        process.exit(1);
      }
      process.exit(0);
    } else if (daemonSubcommand === "start-sync") {
      await startDaemon();
      process.exit(0);
    } else if (daemonSubcommand === "stop") {
      await stopDaemon();
      process.exit(0);
    } else if (daemonSubcommand === "status") {
      await runDoctorCommand("daemon");
      process.exit(0);
    } else if (daemonSubcommand === "logs") {
      const latest = await getLatestDaemonLog();
      if (!latest) {
        console.log("No daemon logs found");
      } else {
        console.log(latest.path);
      }
      process.exit(0);
    } else if (daemonSubcommand === "install") {
      try {
        await install();
      } catch (error) {
        console.error(chalk.red("Error:"), error instanceof Error ? error.message : "Unknown error");
        process.exit(1);
      }
    } else if (daemonSubcommand === "uninstall") {
      try {
        await uninstall();
      } catch (error) {
        console.error(chalk.red("Error:"), error instanceof Error ? error.message : "Unknown error");
        process.exit(1);
      }
    } else {
      console.log(`
${chalk.bold("happy daemon")} - Daemon management

${chalk.bold("Usage:")}
  happy daemon start              Start the daemon (detached)
  happy daemon stop               Stop the daemon (sessions stay alive)
  happy daemon status             Show daemon status
  happy daemon list               List active sessions

  If you want to kill all happy related processes run 
  ${chalk.cyan("happy doctor clean")}

${chalk.bold("Note:")} The daemon runs in the background and manages Claude sessions.

${chalk.bold("To clean up runaway processes:")} Use ${chalk.cyan("happy doctor clean")}
`);
    }
    return;
  } else {
    if (args.length > 0 && args[0] === "claude") {
      args.shift();
    }
    const options = {};
    let showHelp = false;
    let showVersion = false;
    const unknownArgs = [];
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === "-h" || arg === "--help") {
        showHelp = true;
        unknownArgs.push(arg);
      } else if (arg === "-v" || arg === "--version") {
        showVersion = true;
        unknownArgs.push(arg);
      } else if (arg === "--happy-starting-mode") {
        options.startingMode = z.enum(["local", "remote"]).parse(args[++i]);
      } else if (arg === "--yolo") {
        unknownArgs.push("--dangerously-skip-permissions");
      } else if (arg === "--started-by") {
        options.startedBy = args[++i];
      } else if (arg === "--js-runtime") {
        const runtime = args[++i];
        if (runtime !== "node" && runtime !== "bun") {
          console.error(chalk.red(`Invalid --js-runtime value: ${runtime}. Must be 'node' or 'bun'`));
          process.exit(1);
        }
        options.jsRuntime = runtime;
      } else if (arg === "--claude-env") {
        const envArg = args[++i];
        if (envArg && envArg.includes("=")) {
          const eqIndex = envArg.indexOf("=");
          const key = envArg.substring(0, eqIndex);
          const value = envArg.substring(eqIndex + 1);
          options.claudeEnvVars = options.claudeEnvVars || {};
          options.claudeEnvVars[key] = value;
        } else {
          console.error(chalk.red(`Invalid --claude-env format: ${envArg}. Expected KEY=VALUE`));
          process.exit(1);
        }
      } else {
        unknownArgs.push(arg);
        if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
          unknownArgs.push(args[++i]);
        }
      }
    }
    if (unknownArgs.length > 0) {
      options.claudeArgs = [...options.claudeArgs || [], ...unknownArgs];
    }
    if (showHelp) {
      console.log(`
${chalk.bold("happy")} - Claude Code On the Go

${chalk.bold("Usage:")}
  happy [options]         Start Claude with mobile control
  happy auth              Manage authentication
  happy codex             Start Codex mode
  happy gemini            Start Gemini mode (ACP)
  happy connect           Connect AI vendor API keys
  happy notify            Send push notification
  happy daemon            Manage background service that allows
                            to spawn new sessions away from your computer
  happy doctor            System diagnostics & troubleshooting

${chalk.bold("Examples:")}
  happy                    Start session
  happy --yolo             Start with bypassing permissions
                            happy sugar for --dangerously-skip-permissions
  happy --js-runtime bun   Use bun instead of node to spawn Claude Code
  happy --claude-env ANTHROPIC_BASE_URL=http://127.0.0.1:3456
                           Use a custom API endpoint (e.g., claude-code-router)
  happy auth login --force Authenticate
  happy doctor             Run diagnostics

${chalk.bold("Happy supports ALL Claude options!")}
  Use any claude flag with happy as you would with claude. Our favorite:

  happy --resume

${chalk.gray("\u2500".repeat(60))}
${chalk.bold.cyan("Claude Code Options (from `claude --help`):")}
`);
      try {
        const claudeHelp = execFileSync(claudeCliPath, ["--help"], { encoding: "utf8" });
        console.log(claudeHelp);
      } catch (e) {
        console.log(chalk.yellow("Could not retrieve claude help. Make sure claude is installed."));
      }
      process.exit(0);
    }
    if (showVersion) {
      console.log(`happy version: ${packageJson.version}`);
    }
    const {
      credentials
    } = await authAndSetupMachineIfNeeded();
    logger.debug("Ensuring Happy background service is running & matches our version...");
    if (!await isDaemonRunningCurrentlyInstalledHappyVersion()) {
      logger.debug("Starting Happy background service...");
      const daemonProcess = spawnHappyCLI(["daemon", "start-sync"], {
        detached: true,
        stdio: "ignore",
        env: process.env
      });
      daemonProcess.unref();
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    try {
      await runClaude(credentials, options);
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : "Unknown error");
      if (process.env.DEBUG) {
        console.error(error);
      }
      process.exit(1);
    }
  }
})();
async function handleNotifyCommand(args) {
  let message = "";
  let title = "";
  let showHelp = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-p" && i + 1 < args.length) {
      message = args[++i];
    } else if (arg === "-t" && i + 1 < args.length) {
      title = args[++i];
    } else if (arg === "-h" || arg === "--help") {
      showHelp = true;
    } else {
      console.error(chalk.red(`Unknown argument for notify command: ${arg}`));
      process.exit(1);
    }
  }
  if (showHelp) {
    console.log(`
${chalk.bold("happy notify")} - Send notification

${chalk.bold("Usage:")}
  happy notify -p <message> [-t <title>]    Send notification with custom message and optional title
  happy notify -h, --help                   Show this help

${chalk.bold("Options:")}
  -p <message>    Notification message (required)
  -t <title>      Notification title (optional, defaults to "Happy")

${chalk.bold("Examples:")}
  happy notify -p "Deployment complete!"
  happy notify -p "System update complete" -t "Server Status"
  happy notify -t "Alert" -p "Database connection restored"
`);
    return;
  }
  if (!message) {
    console.error(chalk.red('Error: Message is required. Use -p "your message" to specify the notification text.'));
    console.log(chalk.gray('Run "happy notify --help" for usage information.'));
    process.exit(1);
  }
  let credentials = await readCredentials();
  if (!credentials) {
    console.error(chalk.red('Error: Not authenticated. Please run "happy auth login" first.'));
    process.exit(1);
  }
  console.log(chalk.blue("\u{1F4F1} Sending push notification..."));
  try {
    const api = await ApiClient.create(credentials);
    const notificationTitle = title || "Happy";
    api.push().sendToAllDevices(
      notificationTitle,
      message,
      {
        source: "cli",
        timestamp: Date.now()
      }
    );
    console.log(chalk.green("\u2713 Push notification sent successfully!"));
    console.log(chalk.gray(`  Title: ${notificationTitle}`));
    console.log(chalk.gray(`  Message: ${message}`));
    console.log(chalk.gray("  Check your mobile device for the notification."));
    await new Promise((resolve) => setTimeout(resolve, 1e3));
  } catch (error) {
    console.error(chalk.red("\u2717 Failed to send push notification"));
    throw error;
  }
}

export { MessageBuffer as M, trimIdent as t };
