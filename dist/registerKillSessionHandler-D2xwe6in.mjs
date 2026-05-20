import * as z from 'zod';
import { z as z$1 } from 'zod';
import fs, { readFile, stat, writeFile, readdir } from 'fs/promises';
import os, { platform } from 'os';
import * as tmp from 'tmp';
import axios from 'axios';
import { EventEmitter } from 'node:events';
import { io } from 'socket.io-client';
import { randomBytes, createCipheriv, createDecipheriv, randomUUID } from 'node:crypto';
import tweetnacl from 'tweetnacl';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { createHash } from 'crypto';
import { dirname, resolve, join as join$1 } from 'path';
import { fileURLToPath } from 'url';
import { Expo } from 'expo-server-sdk';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import { readFile as readFile$1, open, stat as stat$1, unlink, mkdir, writeFile as writeFile$1, rename } from 'node:fs/promises';
import { existsSync, mkdirSync, readdirSync, statSync, constants, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import open$1 from 'open';
import React, { useState } from 'react';
import { useInput, Box, Text, render } from 'ink';
import { appendFileSync, readFileSync as readFileSync$1 } from 'fs';
import psList from 'ps-list';
import spawn$1 from 'cross-spawn';
import { join, basename } from 'node:path';
import fastify from 'fastify';
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createServer } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { homedir } from 'node:os';

var name = "happy-coder";
var version = "0.14.0-0";
var description = "Mobile and Web client for Claude Code and Codex";
var author = "Kirill Dubovitskiy";
var license = "MIT";
var type = "module";
var homepage = "https://github.com/slopus/happy-cli";
var bugs = "https://github.com/slopus/happy-cli/issues";
var repository = "slopus/happy-cli";
var bin = {
	happy: "./bin/happy.mjs",
	"happy-mcp": "./bin/happy-mcp.mjs"
};
var main = "./dist/index.cjs";
var module$1 = "./dist/index.mjs";
var types = "./dist/index.d.cts";
var exports$1 = {
	".": {
		require: {
			types: "./dist/index.d.cts",
			"default": "./dist/index.cjs"
		},
		"import": {
			types: "./dist/index.d.mts",
			"default": "./dist/index.mjs"
		}
	},
	"./lib": {
		require: {
			types: "./dist/lib.d.cts",
			"default": "./dist/lib.cjs"
		},
		"import": {
			types: "./dist/lib.d.mts",
			"default": "./dist/lib.mjs"
		}
	},
	"./codex/happyMcpStdioBridge": {
		require: {
			types: "./dist/codex/happyMcpStdioBridge.d.cts",
			"default": "./dist/codex/happyMcpStdioBridge.cjs"
		},
		"import": {
			types: "./dist/codex/happyMcpStdioBridge.d.mts",
			"default": "./dist/codex/happyMcpStdioBridge.mjs"
		}
	}
};
var files = [
	"dist",
	"bin",
	"scripts",
	"tools",
	"package.json"
];
var scripts = {
	"why do we need to build before running tests / dev?": "We need the binary to be built so we run daemon commands which directly run the binary - we don't want them to go out of sync or have custom spawn logic depending how we started happy",
	typecheck: "tsc --noEmit",
	build: "shx rm -rf dist && npx tsc --noEmit && pkgroll",
	test: "$npm_execpath run build && vitest run",
	start: "$npm_execpath run build && node ./bin/happy.mjs",
	dev: "tsx src/index.ts",
	"dev:local-server": "$npm_execpath run build && tsx --env-file .env.dev-local-server src/index.ts",
	"dev:integration-test-env": "$npm_execpath run build && tsx --env-file .env.integration-test src/index.ts",
	prepublishOnly: "$npm_execpath run build && $npm_execpath test",
	release: "$npm_execpath install && release-it",
	"postinstall-disabled": "node scripts/unpack-tools.cjs",
	"// ==== Dev/Stable Variant Management ====": "",
	stable: "node scripts/env-wrapper.cjs stable",
	"dev:variant": "node scripts/env-wrapper.cjs dev",
	"// ==== Stable Version Quick Commands ====": "",
	"stable:daemon:start": "node scripts/env-wrapper.cjs stable daemon start",
	"stable:daemon:stop": "node scripts/env-wrapper.cjs stable daemon stop",
	"stable:daemon:status": "node scripts/env-wrapper.cjs stable daemon status",
	"stable:auth": "node scripts/env-wrapper.cjs stable auth",
	"// ==== Development Version Quick Commands ====": "",
	"dev:daemon:start": "node scripts/env-wrapper.cjs dev daemon start",
	"dev:daemon:stop": "node scripts/env-wrapper.cjs dev daemon stop",
	"dev:daemon:status": "node scripts/env-wrapper.cjs dev daemon status",
	"dev:auth": "node scripts/env-wrapper.cjs dev auth",
	"// ==== Setup ====": "",
	"setup:dev": "node scripts/setup-dev.cjs",
	doctor: "node scripts/env-wrapper.cjs stable doctor",
	"// ==== Development Linking ====": "",
	"link:dev": "node scripts/link-dev.cjs",
	"unlink:dev": "node scripts/link-dev.cjs unlink"
};
var dependencies = {
	"@agentclientprotocol/sdk": "^0.8.0",
	"@modelcontextprotocol/sdk": "^1.22.0",
	"@stablelib/base64": "^2.0.1",
	"@stablelib/hex": "^2.0.1",
	"@types/cross-spawn": "^6.0.6",
	"@types/http-proxy": "^1.17.17",
	"@types/ps-list": "^6.2.1",
	"@types/qrcode-terminal": "^0.12.2",
	"@types/react": "^19.2.7",
	"@types/tmp": "^0.2.6",
	ai: "^5.0.107",
	axios: "^1.13.2",
	chalk: "^5.6.2",
	"cross-spawn": "^7.0.6",
	"expo-server-sdk": "^3.15.0",
	fastify: "^5.6.2",
	"fastify-type-provider-zod": "4.0.2",
	"http-proxy": "^1.18.1",
	"http-proxy-middleware": "^3.0.5",
	ink: "^6.5.1",
	open: "^10.2.0",
	"ps-list": "^8.1.1",
	"qrcode-terminal": "^0.12.0",
	react: "^19.2.0",
	"socket.io-client": "^4.8.1",
	tar: "^7.5.2",
	tmp: "^0.2.5",
	tweetnacl: "^1.0.3",
	zod: "^3.23.8"
};
var devDependencies = {
	"@eslint/compat": "^1",
	"@types/node": ">=20",
	"cross-env": "^10.1.0",
	dotenv: "^16.6.1",
	eslint: "^9",
	"eslint-config-prettier": "^10",
	pkgroll: "^2.14.2",
	"release-it": "^19.0.6",
	shx: "^0.3.3",
	"ts-node": "^10",
	tsx: "^4.20.6",
	typescript: "^5",
	vitest: "^3.2.4"
};
var resolutions = {
	"whatwg-url": "14.2.0",
	"parse-path": "7.0.3",
	"@types/parse-path": "7.0.3"
};
var publishConfig = {
	registry: "https://registry.npmjs.org"
};
var packageManager = "yarn@1.22.22";
var packageJson = {
	name: name,
	version: version,
	description: description,
	author: author,
	license: license,
	type: type,
	homepage: homepage,
	bugs: bugs,
	repository: repository,
	bin: bin,
	main: main,
	module: module$1,
	types: types,
	exports: exports$1,
	files: files,
	scripts: scripts,
	dependencies: dependencies,
	devDependencies: devDependencies,
	resolutions: resolutions,
	publishConfig: publishConfig,
	packageManager: packageManager
};

class Configuration {
  serverUrl;
  webappUrl;
  isDaemonProcess;
  // Directories and paths (from persistence)
  happyHomeDir;
  logsDir;
  settingsFile;
  privateKeyFile;
  daemonStateFile;
  daemonLockFile;
  currentCliVersion;
  isExperimentalEnabled;
  disableCaffeinate;
  constructor() {
    this.serverUrl = process.env.HAPPY_SERVER_URL || "https://api.cluster-fluster.com";
    this.webappUrl = process.env.HAPPY_WEBAPP_URL || "https://app.happy.engineering";
    const args = process.argv.slice(2);
    this.isDaemonProcess = args.length >= 2 && args[0] === "daemon" && args[1] === "start-sync";
    if (process.env.HAPPY_HOME_DIR) {
      const expandedPath = process.env.HAPPY_HOME_DIR.replace(/^~/, homedir());
      this.happyHomeDir = expandedPath;
    } else {
      this.happyHomeDir = join(homedir(), ".happy");
    }
    this.logsDir = join(this.happyHomeDir, "logs");
    this.settingsFile = join(this.happyHomeDir, "settings.json");
    this.privateKeyFile = join(this.happyHomeDir, "access.key");
    this.daemonStateFile = join(this.happyHomeDir, "daemon.state.json");
    this.daemonLockFile = join(this.happyHomeDir, "daemon.state.json.lock");
    this.isExperimentalEnabled = ["true", "1", "yes"].includes(process.env.HAPPY_EXPERIMENTAL?.toLowerCase() || "");
    this.disableCaffeinate = ["true", "1", "yes"].includes(process.env.HAPPY_DISABLE_CAFFEINATE?.toLowerCase() || "");
    this.currentCliVersion = packageJson.version;
    const variant = process.env.HAPPY_VARIANT || "stable";
    if (variant === "dev" && !this.happyHomeDir.includes("dev")) {
      console.warn('\u26A0\uFE0F  WARNING: HAPPY_VARIANT=dev but HAPPY_HOME_DIR does not contain "dev"');
      console.warn(`   Current: ${this.happyHomeDir}`);
      console.warn(`   Expected: Should contain "dev" (e.g., ~/.happy-dev)`);
    }
    if (!this.isDaemonProcess && variant === "dev") {
      console.log("\x1B[33m\u{1F527} DEV MODE\x1B[0m - Data: " + this.happyHomeDir);
    }
    if (!existsSync(this.happyHomeDir)) {
      mkdirSync(this.happyHomeDir, { recursive: true });
    }
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }
  }
}
const configuration = new Configuration();

function createTimestampForFilename(date = /* @__PURE__ */ new Date()) {
  return date.toLocaleString("sv-SE", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).replace(/[: ]/g, "-").replace(/,/g, "") + "-pid-" + process.pid;
}
function createTimestampForLogEntry(date = /* @__PURE__ */ new Date()) {
  return date.toLocaleTimeString("en-US", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3
  });
}
function getSessionLogPath() {
  const timestamp = createTimestampForFilename();
  const filename = configuration.isDaemonProcess ? `${timestamp}-daemon.log` : `${timestamp}.log`;
  return join(configuration.logsDir, filename);
}
class Logger {
  constructor(logFilePath = getSessionLogPath()) {
    this.logFilePath = logFilePath;
    if (process.env.DANGEROUSLY_LOG_TO_SERVER_FOR_AI_AUTO_DEBUGGING && process.env.HAPPY_SERVER_URL) {
      this.dangerouslyUnencryptedServerLoggingUrl = process.env.HAPPY_SERVER_URL;
      console.log(chalk.yellow("[REMOTE LOGGING] Sending logs to server for AI debugging"));
    }
  }
  dangerouslyUnencryptedServerLoggingUrl;
  // Use local timezone for simplicity of locating the logs,
  // in practice you will not need absolute timestamps
  localTimezoneTimestamp() {
    return createTimestampForLogEntry();
  }
  debug(message, ...args) {
    this.logToFile(`[${this.localTimezoneTimestamp()}]`, message, ...args);
  }
  debugLargeJson(message, object, maxStringLength = 100, maxArrayLength = 10) {
    if (!process.env.DEBUG) {
      this.debug(`In production, skipping message inspection`);
    }
    const truncateStrings = (obj) => {
      if (typeof obj === "string") {
        return obj.length > maxStringLength ? obj.substring(0, maxStringLength) + "... [truncated for logs]" : obj;
      }
      if (Array.isArray(obj)) {
        const truncatedArray = obj.map((item) => truncateStrings(item)).slice(0, maxArrayLength);
        if (obj.length > maxArrayLength) {
          truncatedArray.push(`... [truncated array for logs up to ${maxArrayLength} items]`);
        }
        return truncatedArray;
      }
      if (obj && typeof obj === "object") {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          if (key === "usage") {
            continue;
          }
          result[key] = truncateStrings(value);
        }
        return result;
      }
      return obj;
    };
    const truncatedObject = truncateStrings(object);
    const json = JSON.stringify(truncatedObject, null, 2);
    this.logToFile(`[${this.localTimezoneTimestamp()}]`, message, "\n", json);
  }
  info(message, ...args) {
    this.logToConsole("info", "", message, ...args);
    this.debug(message, args);
  }
  infoDeveloper(message, ...args) {
    this.debug(message, ...args);
    if (process.env.DEBUG) {
      this.logToConsole("info", "[DEV]", message, ...args);
    }
  }
  warn(message, ...args) {
    this.logToConsole("warn", "", message, ...args);
    this.debug(`[WARN] ${message}`, ...args);
  }
  getLogPath() {
    return this.logFilePath;
  }
  logToConsole(level, prefix, message, ...args) {
    switch (level) {
      case "debug": {
        console.log(chalk.gray(prefix), message, ...args);
        break;
      }
      case "error": {
        console.error(chalk.red(prefix), message, ...args);
        break;
      }
      case "info": {
        console.log(chalk.blue(prefix), message, ...args);
        break;
      }
      case "warn": {
        console.log(chalk.yellow(prefix), message, ...args);
        break;
      }
      default: {
        this.debug("Unknown log level:", level);
        console.log(chalk.blue(prefix), message, ...args);
        break;
      }
    }
  }
  async sendToRemoteServer(level, message, ...args) {
    if (!this.dangerouslyUnencryptedServerLoggingUrl) return;
    try {
      await fetch(this.dangerouslyUnencryptedServerLoggingUrl + "/logs-combined-from-cli-and-mobile-for-simple-ai-debugging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          level,
          message: `${message} ${args.map(
            (a) => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
          ).join(" ")}`,
          source: "cli",
          platform: process.platform
        })
      });
    } catch (error) {
    }
  }
  logToFile(prefix, message, ...args) {
    const logLine = `${prefix} ${message} ${args.map(
      (arg) => typeof arg === "string" ? arg : JSON.stringify(arg)
    ).join(" ")}
`;
    if (this.dangerouslyUnencryptedServerLoggingUrl) {
      let level = "info";
      if (prefix.includes(this.localTimezoneTimestamp())) {
        level = "debug";
      }
      this.sendToRemoteServer(level, message, ...args).catch(() => {
      });
    }
    try {
      appendFileSync(this.logFilePath, logLine);
    } catch (appendError) {
      if (process.env.DEBUG) {
        console.error("[DEV MODE ONLY THROWING] Failed to append to log file:", appendError);
        throw appendError;
      }
    }
  }
}
let logger = new Logger();
async function listDaemonLogFiles(limit = 50) {
  try {
    const logsDir = configuration.logsDir;
    if (!existsSync(logsDir)) {
      return [];
    }
    const logs = readdirSync(logsDir).filter((file) => file.endsWith("-daemon.log")).map((file) => {
      const fullPath = join(logsDir, file);
      const stats = statSync(fullPath);
      return { file, path: fullPath, modified: stats.mtime };
    }).sort((a, b) => b.modified.getTime() - a.modified.getTime());
    try {
      const { readDaemonState } = await Promise.resolve().then(function () { return persistence; });
      const state = await readDaemonState();
      if (!state) {
        return logs;
      }
      if (state.daemonLogPath && existsSync(state.daemonLogPath)) {
        const stats = statSync(state.daemonLogPath);
        const persisted = {
          file: basename(state.daemonLogPath),
          path: state.daemonLogPath,
          modified: stats.mtime
        };
        const idx = logs.findIndex((l) => l.path === persisted.path);
        if (idx >= 0) {
          const [found] = logs.splice(idx, 1);
          logs.unshift(found);
        } else {
          logs.unshift(persisted);
        }
      }
    } catch {
    }
    return logs.slice(0, Math.max(0, limit));
  } catch {
    return [];
  }
}
async function getLatestDaemonLog() {
  const [latest] = await listDaemonLogFiles(1);
  return latest || null;
}

const SessionMessageContentSchema = z$1.object({
  c: z$1.string(),
  // Base64 encoded encrypted content
  t: z$1.literal("encrypted")
});
const UpdateBodySchema = z$1.object({
  message: z$1.object({
    id: z$1.string(),
    seq: z$1.number(),
    content: SessionMessageContentSchema
  }),
  sid: z$1.string(),
  // Session ID
  t: z$1.literal("new-message")
});
const UpdateSessionBodySchema = z$1.object({
  t: z$1.literal("update-session"),
  sid: z$1.string(),
  metadata: z$1.object({
    version: z$1.number(),
    value: z$1.string()
  }).nullish(),
  agentState: z$1.object({
    version: z$1.number(),
    value: z$1.string()
  }).nullish()
});
const UpdateMachineBodySchema = z$1.object({
  t: z$1.literal("update-machine"),
  machineId: z$1.string(),
  metadata: z$1.object({
    version: z$1.number(),
    value: z$1.string()
  }).nullish(),
  daemonState: z$1.object({
    version: z$1.number(),
    value: z$1.string()
  }).nullish()
});
z$1.object({
  id: z$1.string(),
  seq: z$1.number(),
  body: z$1.union([
    UpdateBodySchema,
    UpdateSessionBodySchema,
    UpdateMachineBodySchema
  ]),
  createdAt: z$1.number()
});
z$1.object({
  host: z$1.string(),
  platform: z$1.string(),
  happyCliVersion: z$1.string(),
  homeDir: z$1.string(),
  happyHomeDir: z$1.string(),
  happyLibDir: z$1.string()
});
z$1.object({
  status: z$1.union([
    z$1.enum(["running", "shutting-down"]),
    z$1.string()
    // Forward compatibility
  ]),
  pid: z$1.number().optional(),
  httpPort: z$1.number().optional(),
  startedAt: z$1.number().optional(),
  shutdownRequestedAt: z$1.number().optional(),
  shutdownSource: z$1.union([
    z$1.enum(["mobile-app", "cli", "os-signal", "unknown"]),
    z$1.string()
    // Forward compatibility
  ]).optional()
});
z$1.object({
  content: SessionMessageContentSchema,
  createdAt: z$1.number(),
  id: z$1.string(),
  seq: z$1.number(),
  updatedAt: z$1.number()
});
const MessageMetaSchema = z$1.object({
  sentFrom: z$1.string().optional(),
  // Source identifier
  permissionMode: z$1.enum(["default", "acceptEdits", "bypassPermissions", "plan", "read-only", "safe-yolo", "yolo"]).optional(),
  // Permission mode for this message
  model: z$1.string().nullable().optional(),
  // Model name for this message (null = reset)
  fallbackModel: z$1.string().nullable().optional(),
  // Fallback model for this message (null = reset)
  customSystemPrompt: z$1.string().nullable().optional(),
  // Custom system prompt for this message (null = reset)
  appendSystemPrompt: z$1.string().nullable().optional(),
  // Append to system prompt for this message (null = reset)
  allowedTools: z$1.array(z$1.string()).nullable().optional(),
  // Allowed tools for this message (null = reset)
  disallowedTools: z$1.array(z$1.string()).nullable().optional()
  // Disallowed tools for this message (null = reset)
});
z$1.object({
  session: z$1.object({
    id: z$1.string(),
    tag: z$1.string(),
    seq: z$1.number(),
    createdAt: z$1.number(),
    updatedAt: z$1.number(),
    metadata: z$1.string(),
    metadataVersion: z$1.number(),
    agentState: z$1.string().nullable(),
    agentStateVersion: z$1.number()
  })
});
const UserMessageSchema = z$1.object({
  role: z$1.literal("user"),
  content: z$1.object({
    type: z$1.literal("text"),
    text: z$1.string()
  }),
  localKey: z$1.string().optional(),
  // Mobile messages include this
  meta: MessageMetaSchema.optional()
});
const AgentMessageSchema = z$1.object({
  role: z$1.literal("agent"),
  content: z$1.object({
    type: z$1.literal("output"),
    data: z$1.any()
  }),
  meta: MessageMetaSchema.optional()
});
z$1.union([UserMessageSchema, AgentMessageSchema]);

function encodeBase64(buffer, variant = "base64") {
  if (variant === "base64url") {
    return encodeBase64Url(buffer);
  }
  return Buffer.from(buffer).toString("base64");
}
function encodeBase64Url(buffer) {
  return Buffer.from(buffer).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
function decodeBase64(base64, variant = "base64") {
  if (variant === "base64url") {
    const base64Standard = base64.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - base64.length % 4) % 4);
    return new Uint8Array(Buffer.from(base64Standard, "base64"));
  }
  return new Uint8Array(Buffer.from(base64, "base64"));
}
function getRandomBytes(size) {
  return new Uint8Array(randomBytes(size));
}
function libsodiumEncryptForPublicKey(data, recipientPublicKey) {
  const ephemeralKeyPair = tweetnacl.box.keyPair();
  const nonce = getRandomBytes(tweetnacl.box.nonceLength);
  const encrypted = tweetnacl.box(data, nonce, recipientPublicKey, ephemeralKeyPair.secretKey);
  const result = new Uint8Array(ephemeralKeyPair.publicKey.length + nonce.length + encrypted.length);
  result.set(ephemeralKeyPair.publicKey, 0);
  result.set(nonce, ephemeralKeyPair.publicKey.length);
  result.set(encrypted, ephemeralKeyPair.publicKey.length + nonce.length);
  return result;
}
function encryptLegacy(data, secret) {
  const nonce = getRandomBytes(tweetnacl.secretbox.nonceLength);
  const encrypted = tweetnacl.secretbox(new TextEncoder().encode(JSON.stringify(data)), nonce, secret);
  const result = new Uint8Array(nonce.length + encrypted.length);
  result.set(nonce);
  result.set(encrypted, nonce.length);
  return result;
}
function decryptLegacy(data, secret) {
  const nonce = data.slice(0, tweetnacl.secretbox.nonceLength);
  const encrypted = data.slice(tweetnacl.secretbox.nonceLength);
  const decrypted = tweetnacl.secretbox.open(encrypted, nonce, secret);
  if (!decrypted) {
    return null;
  }
  return JSON.parse(new TextDecoder().decode(decrypted));
}
function encryptWithDataKey(data, dataKey) {
  const nonce = getRandomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", dataKey, nonce);
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = Buffer.concat([
    cipher.update(plaintext),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();
  const bundle = new Uint8Array(12 + encrypted.length + 16 + 1);
  bundle.set([0], 0);
  bundle.set(nonce, 1);
  bundle.set(new Uint8Array(encrypted), 13);
  bundle.set(new Uint8Array(authTag), 13 + encrypted.length);
  return bundle;
}
function decryptWithDataKey(bundle, dataKey) {
  if (bundle.length < 1) {
    return null;
  }
  if (bundle[0] !== 0) {
    return null;
  }
  if (bundle.length < 12 + 16 + 1) {
    return null;
  }
  const nonce = bundle.slice(1, 13);
  const authTag = bundle.slice(bundle.length - 16);
  const ciphertext = bundle.slice(13, bundle.length - 16);
  try {
    const decipher = createDecipheriv("aes-256-gcm", dataKey, nonce);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (error) {
    return null;
  }
}
function encrypt(key, variant, data) {
  if (variant === "legacy") {
    return encryptLegacy(data, key);
  } else {
    return encryptWithDataKey(data, key);
  }
}
function decrypt(key, variant, data) {
  if (variant === "legacy") {
    return decryptLegacy(data, key);
  } else {
    return decryptWithDataKey(data, key);
  }
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function exponentialBackoffDelay(currentFailureCount, minDelay, maxDelay, maxFailureCount) {
  let maxDelayRet = minDelay + (maxDelay - minDelay) / maxFailureCount * Math.min(currentFailureCount, maxFailureCount);
  return Math.round(Math.random() * maxDelayRet);
}
function createBackoff(opts) {
  return async (callback) => {
    let currentFailureCount = 0;
    const minDelay = 250;
    const maxDelay = 1e3;
    const maxFailureCount = 50;
    while (true) {
      try {
        return await callback();
      } catch (e) {
        if (currentFailureCount < maxFailureCount) {
          currentFailureCount++;
        }
        let waitForRequest = exponentialBackoffDelay(currentFailureCount, minDelay, maxDelay, maxFailureCount);
        await delay(waitForRequest);
      }
    }
  };
}
let backoff = createBackoff();

class AsyncLock {
  permits = 1;
  promiseResolverQueue = [];
  async inLock(func) {
    try {
      await this.lock();
      return await func();
    } finally {
      this.unlock();
    }
  }
  async lock() {
    if (this.permits > 0) {
      this.permits = this.permits - 1;
      return;
    }
    await new Promise((resolve) => this.promiseResolverQueue.push(resolve));
  }
  unlock() {
    this.permits += 1;
    if (this.permits > 1 && this.promiseResolverQueue.length > 0) {
      throw new Error("this.permits should never be > 0 when there is someone waiting.");
    } else if (this.permits === 1 && this.promiseResolverQueue.length > 0) {
      this.permits -= 1;
      const nextResolver = this.promiseResolverQueue.shift();
      if (nextResolver) {
        setTimeout(() => {
          nextResolver(true);
        }, 0);
      }
    }
  }
}

class RpcHandlerManager {
  handlers = /* @__PURE__ */ new Map();
  scopePrefix;
  encryptionKey;
  encryptionVariant;
  logger;
  socket = null;
  constructor(config) {
    this.scopePrefix = config.scopePrefix;
    this.encryptionKey = config.encryptionKey;
    this.encryptionVariant = config.encryptionVariant;
    this.logger = config.logger || ((msg, data) => logger.debug(msg, data));
  }
  /**
   * Register an RPC handler for a specific method
   * @param method - The method name (without prefix)
   * @param handler - The handler function
   */
  registerHandler(method, handler) {
    const prefixedMethod = this.getPrefixedMethod(method);
    this.handlers.set(prefixedMethod, handler);
    if (this.socket) {
      this.socket.emit("rpc-register", { method: prefixedMethod });
    }
  }
  /**
   * Handle an incoming RPC request
   * @param request - The RPC request data
   * @param callback - The response callback
   */
  async handleRequest(request) {
    try {
      const handler = this.handlers.get(request.method);
      if (!handler) {
        this.logger("[RPC] [ERROR] Method not found", { method: request.method });
        const errorResponse = { error: "Method not found" };
        const encryptedError = encodeBase64(encrypt(this.encryptionKey, this.encryptionVariant, errorResponse));
        return encryptedError;
      }
      const decryptedParams = decrypt(this.encryptionKey, this.encryptionVariant, decodeBase64(request.params));
      this.logger("[RPC] Calling handler", { method: request.method });
      const result = await handler(decryptedParams);
      this.logger("[RPC] Handler returned", { method: request.method, hasResult: result !== void 0 });
      const encryptedResponse = encodeBase64(encrypt(this.encryptionKey, this.encryptionVariant, result));
      this.logger("[RPC] Sending encrypted response", { method: request.method, responseLength: encryptedResponse.length });
      return encryptedResponse;
    } catch (error) {
      this.logger("[RPC] [ERROR] Error handling request", { error });
      const errorResponse = {
        error: error instanceof Error ? error.message : "Unknown error"
      };
      return encodeBase64(encrypt(this.encryptionKey, this.encryptionVariant, errorResponse));
    }
  }
  onSocketConnect(socket) {
    this.socket = socket;
    for (const [prefixedMethod] of this.handlers) {
      socket.emit("rpc-register", { method: prefixedMethod });
    }
  }
  onSocketDisconnect() {
    this.socket = null;
  }
  /**
   * Get the number of registered handlers
   */
  getHandlerCount() {
    return this.handlers.size;
  }
  /**
   * Check if a handler is registered
   * @param method - The method name (without prefix)
   */
  hasHandler(method) {
    const prefixedMethod = this.getPrefixedMethod(method);
    return this.handlers.has(prefixedMethod);
  }
  /**
   * Clear all handlers
   */
  clearHandlers() {
    this.handlers.clear();
    this.logger("Cleared all RPC handlers");
  }
  /**
   * Get the prefixed method name
   * @param method - The method name
   */
  getPrefixedMethod(method) {
    return `${this.scopePrefix}:${method}`;
  }
}

const __dirname$1 = dirname(fileURLToPath(import.meta.url));
function projectPath() {
  const path = resolve(__dirname$1, "..");
  return path;
}

function run$1(args, options) {
  const RUNNER_PATH = resolve(join$1(projectPath(), "scripts", "ripgrep_launcher.cjs"));
  return new Promise((resolve2, reject) => {
    const child = spawn("node", [RUNNER_PATH, JSON.stringify(args)], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: options?.cwd
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    child.on("close", (code) => {
      resolve2({
        exitCode: code || 0,
        stdout,
        stderr
      });
    });
    child.on("error", (err) => {
      reject(err);
    });
  });
}

function getBinaryPath() {
  const platformName = platform();
  const binaryName = platformName === "win32" ? "difft.exe" : "difft";
  return resolve(join$1(projectPath(), "tools", "unpacked", binaryName));
}
function run(args, options) {
  const binaryPath = getBinaryPath();
  return new Promise((resolve2, reject) => {
    const child = spawn(binaryPath, args, {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: options?.cwd,
      env: {
        ...process.env,
        // Force color output when needed
        FORCE_COLOR: "1"
      }
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    child.on("close", (code) => {
      resolve2({
        exitCode: code || 0,
        stdout,
        stderr
      });
    });
    child.on("error", (err) => {
      reject(err);
    });
  });
}

function validatePath(targetPath, workingDirectory) {
  const resolvedTarget = resolve(workingDirectory, targetPath);
  const resolvedWorkingDir = resolve(workingDirectory);
  if (!resolvedTarget.startsWith(resolvedWorkingDir + "/") && resolvedTarget !== resolvedWorkingDir) {
    return {
      valid: false,
      error: `Access denied: Path '${targetPath}' is outside the working directory`
    };
  }
  return { valid: true };
}

const execAsync = promisify(exec);
function registerCommonHandlers(rpcHandlerManager, workingDirectory) {
  rpcHandlerManager.registerHandler("bash", async (data) => {
    logger.debug("Shell command request:", data.command);
    if (data.cwd && data.cwd !== "/") {
      const validation = validatePath(data.cwd, workingDirectory);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
    }
    try {
      const options = {
        cwd: data.cwd === "/" ? void 0 : data.cwd,
        timeout: data.timeout || 3e4
        // Default 30 seconds timeout
      };
      logger.debug("Shell command executing...", { cwd: options.cwd, timeout: options.timeout });
      const { stdout, stderr } = await execAsync(data.command, options);
      logger.debug("Shell command executed, processing result...");
      const result = {
        success: true,
        stdout: stdout ? stdout.toString() : "",
        stderr: stderr ? stderr.toString() : "",
        exitCode: 0
      };
      logger.debug("Shell command result:", {
        success: true,
        exitCode: 0,
        stdoutLen: result.stdout.length,
        stderrLen: result.stderr.length
      });
      return result;
    } catch (error) {
      const execError = error;
      if (execError.code === "ETIMEDOUT" || execError.killed) {
        const result2 = {
          success: false,
          stdout: execError.stdout || "",
          stderr: execError.stderr || "",
          exitCode: typeof execError.code === "number" ? execError.code : -1,
          error: "Command timed out"
        };
        logger.debug("Shell command timed out:", {
          success: false,
          exitCode: result2.exitCode,
          error: "Command timed out"
        });
        return result2;
      }
      const result = {
        success: false,
        stdout: execError.stdout ? execError.stdout.toString() : "",
        stderr: execError.stderr ? execError.stderr.toString() : execError.message || "Command failed",
        exitCode: typeof execError.code === "number" ? execError.code : 1,
        error: execError.message || "Command failed"
      };
      logger.debug("Shell command failed:", {
        success: false,
        exitCode: result.exitCode,
        error: result.error,
        stdoutLen: result.stdout.length,
        stderrLen: result.stderr.length
      });
      return result;
    }
  });
  rpcHandlerManager.registerHandler("readFile", async (data) => {
    logger.debug("Read file request:", data.path);
    const validation = validatePath(data.path, workingDirectory);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    try {
      const buffer = await readFile(data.path);
      const content = buffer.toString("base64");
      return { success: true, content };
    } catch (error) {
      logger.debug("Failed to read file:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to read file" };
    }
  });
  rpcHandlerManager.registerHandler("writeFile", async (data) => {
    logger.debug("Write file request:", data.path);
    const validation = validatePath(data.path, workingDirectory);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    try {
      if (data.expectedHash !== null && data.expectedHash !== void 0) {
        try {
          const existingBuffer = await readFile(data.path);
          const existingHash = createHash("sha256").update(existingBuffer).digest("hex");
          if (existingHash !== data.expectedHash) {
            return {
              success: false,
              error: `File hash mismatch. Expected: ${data.expectedHash}, Actual: ${existingHash}`
            };
          }
        } catch (error) {
          const nodeError = error;
          if (nodeError.code !== "ENOENT") {
            throw error;
          }
          return {
            success: false,
            error: "File does not exist but hash was provided"
          };
        }
      } else {
        try {
          await stat(data.path);
          return {
            success: false,
            error: "File already exists but was expected to be new"
          };
        } catch (error) {
          const nodeError = error;
          if (nodeError.code !== "ENOENT") {
            throw error;
          }
        }
      }
      const buffer = Buffer.from(data.content, "base64");
      await writeFile(data.path, buffer);
      const hash = createHash("sha256").update(buffer).digest("hex");
      return { success: true, hash };
    } catch (error) {
      logger.debug("Failed to write file:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to write file" };
    }
  });
  rpcHandlerManager.registerHandler("listDirectory", async (data) => {
    logger.debug("List directory request:", data.path);
    const validation = validatePath(data.path, workingDirectory);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    try {
      const entries = await readdir(data.path, { withFileTypes: true });
      const directoryEntries = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = join$1(data.path, entry.name);
          let type = "other";
          let size;
          let modified;
          if (entry.isDirectory()) {
            type = "directory";
          } else if (entry.isFile()) {
            type = "file";
          }
          try {
            const stats = await stat(fullPath);
            size = stats.size;
            modified = stats.mtime.getTime();
          } catch (error) {
            logger.debug(`Failed to stat ${fullPath}:`, error);
          }
          return {
            name: entry.name,
            type,
            size,
            modified
          };
        })
      );
      directoryEntries.sort((a, b) => {
        if (a.type === "directory" && b.type !== "directory") return -1;
        if (a.type !== "directory" && b.type === "directory") return 1;
        return a.name.localeCompare(b.name);
      });
      return { success: true, entries: directoryEntries };
    } catch (error) {
      logger.debug("Failed to list directory:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to list directory" };
    }
  });
  rpcHandlerManager.registerHandler("getDirectoryTree", async (data) => {
    logger.debug("Get directory tree request:", data.path, "maxDepth:", data.maxDepth);
    const validation = validatePath(data.path, workingDirectory);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    async function buildTree(path, name, currentDepth) {
      try {
        const stats = await stat(path);
        const node = {
          name,
          path,
          type: stats.isDirectory() ? "directory" : "file",
          size: stats.size,
          modified: stats.mtime.getTime()
        };
        if (stats.isDirectory() && currentDepth < data.maxDepth) {
          const entries = await readdir(path, { withFileTypes: true });
          const children = [];
          await Promise.all(
            entries.map(async (entry) => {
              if (entry.isSymbolicLink()) {
                logger.debug(`Skipping symlink: ${join$1(path, entry.name)}`);
                return;
              }
              const childPath = join$1(path, entry.name);
              const childNode = await buildTree(childPath, entry.name, currentDepth + 1);
              if (childNode) {
                children.push(childNode);
              }
            })
          );
          children.sort((a, b) => {
            if (a.type === "directory" && b.type !== "directory") return -1;
            if (a.type !== "directory" && b.type === "directory") return 1;
            return a.name.localeCompare(b.name);
          });
          node.children = children;
        }
        return node;
      } catch (error) {
        logger.debug(`Failed to process ${path}:`, error instanceof Error ? error.message : String(error));
        return null;
      }
    }
    try {
      if (data.maxDepth < 0) {
        return { success: false, error: "maxDepth must be non-negative" };
      }
      const baseName = data.path === "/" ? "/" : data.path.split("/").pop() || data.path;
      const tree = await buildTree(data.path, baseName, 0);
      if (!tree) {
        return { success: false, error: "Failed to access the specified path" };
      }
      return { success: true, tree };
    } catch (error) {
      logger.debug("Failed to get directory tree:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to get directory tree" };
    }
  });
  rpcHandlerManager.registerHandler("ripgrep", async (data) => {
    logger.debug("Ripgrep request with args:", data.args, "cwd:", data.cwd);
    if (data.cwd) {
      const validation = validatePath(data.cwd, workingDirectory);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
    }
    try {
      const result = await run$1(data.args, { cwd: data.cwd });
      return {
        success: true,
        exitCode: result.exitCode,
        stdout: result.stdout.toString(),
        stderr: result.stderr.toString()
      };
    } catch (error) {
      logger.debug("Failed to run ripgrep:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to run ripgrep"
      };
    }
  });
  rpcHandlerManager.registerHandler("difftastic", async (data) => {
    logger.debug("Difftastic request with args:", data.args, "cwd:", data.cwd);
    if (data.cwd) {
      const validation = validatePath(data.cwd, workingDirectory);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
    }
    try {
      const result = await run(data.args, { cwd: data.cwd });
      return {
        success: true,
        exitCode: result.exitCode,
        stdout: result.stdout.toString(),
        stderr: result.stderr.toString()
      };
    } catch (error) {
      logger.debug("Failed to run difftastic:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to run difftastic"
      };
    }
  });
}

class ApiSessionClient extends EventEmitter {
  token;
  sessionId;
  metadata;
  metadataVersion;
  agentState;
  agentStateVersion;
  socket;
  pendingMessages = [];
  pendingMessageCallback = null;
  rpcHandlerManager;
  agentStateLock = new AsyncLock();
  metadataLock = new AsyncLock();
  encryptionKey;
  encryptionVariant;
  constructor(token, session) {
    super();
    this.token = token;
    this.sessionId = session.id;
    this.metadata = session.metadata;
    this.metadataVersion = session.metadataVersion;
    this.agentState = session.agentState;
    this.agentStateVersion = session.agentStateVersion;
    this.encryptionKey = session.encryptionKey;
    this.encryptionVariant = session.encryptionVariant;
    this.rpcHandlerManager = new RpcHandlerManager({
      scopePrefix: this.sessionId,
      encryptionKey: this.encryptionKey,
      encryptionVariant: this.encryptionVariant,
      logger: (msg, data) => logger.debug(msg, data)
    });
    registerCommonHandlers(this.rpcHandlerManager, this.metadata.path);
    this.socket = io(configuration.serverUrl, {
      auth: {
        token: this.token,
        clientType: "session-scoped",
        sessionId: this.sessionId
      },
      path: "/v1/updates",
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1e3,
      reconnectionDelayMax: 5e3,
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: false
    });
    this.socket.on("connect", () => {
      logger.debug("Socket connected successfully");
      this.rpcHandlerManager.onSocketConnect(this.socket);
    });
    this.socket.on("rpc-request", async (data, callback) => {
      callback(await this.rpcHandlerManager.handleRequest(data));
    });
    this.socket.on("disconnect", (reason) => {
      logger.debug("[API] Socket disconnected:", reason);
      this.rpcHandlerManager.onSocketDisconnect();
    });
    this.socket.on("connect_error", (error) => {
      logger.debug("[API] Socket connection error:", error);
      this.rpcHandlerManager.onSocketDisconnect();
    });
    this.socket.on("update", (data) => {
      try {
        logger.debugLargeJson("[SOCKET] [UPDATE] Received update:", data);
        if (!data.body) {
          logger.debug("[SOCKET] [UPDATE] [ERROR] No body in update!");
          return;
        }
        if (data.body.t === "new-message" && data.body.message.content.t === "encrypted") {
          const body = decrypt(this.encryptionKey, this.encryptionVariant, decodeBase64(data.body.message.content.c));
          logger.debugLargeJson("[SOCKET] [UPDATE] Received update:", body);
          const userResult = UserMessageSchema.safeParse(body);
          if (userResult.success) {
            if (this.pendingMessageCallback) {
              this.pendingMessageCallback(userResult.data);
            } else {
              this.pendingMessages.push(userResult.data);
            }
          } else {
            this.emit("message", body);
          }
        } else if (data.body.t === "update-session") {
          if (data.body.metadata && data.body.metadata.version > this.metadataVersion) {
            this.metadata = decrypt(this.encryptionKey, this.encryptionVariant, decodeBase64(data.body.metadata.value));
            this.metadataVersion = data.body.metadata.version;
          }
          if (data.body.agentState && data.body.agentState.version > this.agentStateVersion) {
            this.agentState = data.body.agentState.value ? decrypt(this.encryptionKey, this.encryptionVariant, decodeBase64(data.body.agentState.value)) : null;
            this.agentStateVersion = data.body.agentState.version;
          }
        } else if (data.body.t === "update-machine") {
          logger.debug(`[SOCKET] WARNING: Session client received unexpected machine update - ignoring`);
        } else {
          this.emit("message", data.body);
        }
      } catch (error) {
        logger.debug("[SOCKET] [UPDATE] [ERROR] Error handling update", { error });
      }
    });
    this.socket.on("error", (error) => {
      logger.debug("[API] Socket error:", error);
    });
    this.socket.connect();
  }
  onUserMessage(callback) {
    this.pendingMessageCallback = callback;
    while (this.pendingMessages.length > 0) {
      callback(this.pendingMessages.shift());
    }
  }
  /**
   * Send message to session
   * @param body - Message body (can be MessageContent or raw content for agent messages)
   */
  sendClaudeSessionMessage(body) {
    let content;
    if (body.type === "user" && typeof body.message.content === "string" && body.isSidechain !== true && body.isMeta !== true) {
      content = {
        role: "user",
        content: {
          type: "text",
          text: body.message.content
        },
        meta: {
          sentFrom: "cli"
        }
      };
    } else {
      content = {
        role: "agent",
        content: {
          type: "output",
          data: body
          // This wraps the entire Claude message
        },
        meta: {
          sentFrom: "cli"
        }
      };
    }
    logger.debugLargeJson("[SOCKET] Sending message through socket:", content);
    if (!this.socket.connected) {
      logger.debug("[API] Socket not connected, cannot send Claude session message. Message will be lost:", { type: body.type });
      return;
    }
    const encrypted = encodeBase64(encrypt(this.encryptionKey, this.encryptionVariant, content));
    this.socket.emit("message", {
      sid: this.sessionId,
      message: encrypted
    });
    if (body.type === "assistant" && body.message?.usage) {
      try {
        this.sendUsageData(body.message.usage);
      } catch (error) {
        logger.debug("[SOCKET] Failed to send usage data:", error);
      }
    }
    if (body.type === "summary" && "summary" in body && "leafUuid" in body) {
      this.updateMetadata((metadata) => ({
        ...metadata,
        summary: {
          text: body.summary,
          updatedAt: Date.now()
        }
      }));
    }
  }
  sendCodexMessage(body) {
    let content = {
      role: "agent",
      content: {
        type: "codex",
        data: body
        // This wraps the entire Claude message
      },
      meta: {
        sentFrom: "cli"
      }
    };
    const encrypted = encodeBase64(encrypt(this.encryptionKey, this.encryptionVariant, content));
    if (!this.socket.connected) {
      logger.debug("[API] Socket not connected, cannot send message. Message will be lost:", { type: body.type });
    }
    this.socket.emit("message", {
      sid: this.sessionId,
      message: encrypted
    });
  }
  /**
   * Send a generic agent message to the session using ACP (Agent Communication Protocol) format.
   * Works for any agent type (Gemini, Codex, Claude, etc.) - CLI normalizes to unified ACP format.
   * 
   * @param provider - The agent provider sending the message (e.g., 'gemini', 'codex', 'claude')
   * @param body - The message payload (type: 'message' | 'reasoning' | 'tool-call' | 'tool-result')
   */
  sendAgentMessage(provider, body) {
    let content = {
      role: "agent",
      content: {
        type: "acp",
        provider,
        data: body
      },
      meta: {
        sentFrom: "cli"
      }
    };
    logger.debug(`[SOCKET] Sending ACP message from ${provider}:`, { type: body.type, hasMessage: "message" in body });
    const encrypted = encodeBase64(encrypt(this.encryptionKey, this.encryptionVariant, content));
    this.socket.emit("message", {
      sid: this.sessionId,
      message: encrypted
    });
  }
  sendSessionEvent(event, id) {
    let content = {
      role: "agent",
      content: {
        id: id ?? randomUUID(),
        type: "event",
        data: event
      }
    };
    const encrypted = encodeBase64(encrypt(this.encryptionKey, this.encryptionVariant, content));
    this.socket.emit("message", {
      sid: this.sessionId,
      message: encrypted
    });
  }
  /**
   * Send a ping message to keep the connection alive
   */
  keepAlive(thinking, mode) {
    if (process.env.DEBUG) {
      logger.debug(`[API] Sending keep alive message: ${thinking}`);
    }
    this.socket.volatile.emit("session-alive", {
      sid: this.sessionId,
      time: Date.now(),
      thinking,
      mode
    });
  }
  /**
   * Send session death message
   */
  sendSessionDeath() {
    this.socket.emit("session-end", { sid: this.sessionId, time: Date.now() });
  }
  /**
   * Send usage data to the server
   */
  sendUsageData(usage) {
    const totalTokens = usage.input_tokens + usage.output_tokens + (usage.cache_creation_input_tokens || 0) + (usage.cache_read_input_tokens || 0);
    const usageReport = {
      key: "claude-session",
      sessionId: this.sessionId,
      tokens: {
        total: totalTokens,
        input: usage.input_tokens,
        output: usage.output_tokens,
        cache_creation: usage.cache_creation_input_tokens || 0,
        cache_read: usage.cache_read_input_tokens || 0
      },
      cost: {
        // TODO: Calculate actual costs based on pricing
        // For now, using placeholder values
        total: 0,
        input: 0,
        output: 0
      }
    };
    logger.debugLargeJson("[SOCKET] Sending usage data:", usageReport);
    this.socket.emit("usage-report", usageReport);
  }
  /**
   * Send cursor-agent usage data to the server.
   * Accepts the normalized cursor usage format (camelCase fields)
   * and converts to the usage-report shape the App expects.
   */
  sendCursorUsageData(fields) {
    if (!this.socket.connected) return;
    const report = {
      key: "cursor-session",
      sessionId: this.sessionId,
      tokens: {
        total: fields.totalTokens ?? 0,
        input: fields.inputTokens ?? 0,
        output: fields.outputTokens ?? 0,
        cache_creation: fields.cacheCreationInputTokens ?? 0,
        cache_read: fields.cacheReadInputTokens ?? 0
      },
      cost: {
        total: fields.costUsd ?? 0,
        input: 0,
        output: 0
      },
      costUsd: fields.costUsd,
      durationMs: fields.durationMs,
      contextSize: fields.contextSize
    };
    logger.debugLargeJson("[SOCKET] Sending cursor usage data:", report);
    this.socket.emit("usage-report", report);
  }
  /**
   * Update session metadata
   * @param handler - Handler function that returns the updated metadata
   */
  updateMetadata(handler) {
    this.metadataLock.inLock(async () => {
      await backoff(async () => {
        let updated = handler(this.metadata);
        const answer = await this.socket.emitWithAck("update-metadata", { sid: this.sessionId, expectedVersion: this.metadataVersion, metadata: encodeBase64(encrypt(this.encryptionKey, this.encryptionVariant, updated)) });
        if (answer.result === "success") {
          this.metadata = decrypt(this.encryptionKey, this.encryptionVariant, decodeBase64(answer.metadata));
          this.metadataVersion = answer.version;
        } else if (answer.result === "version-mismatch") {
          if (answer.version > this.metadataVersion) {
            this.metadataVersion = answer.version;
            this.metadata = decrypt(this.encryptionKey, this.encryptionVariant, decodeBase64(answer.metadata));
          }
          throw new Error("Metadata version mismatch");
        } else if (answer.result === "error") ;
      });
    });
  }
  /**
   * Update session agent state
   * @param handler - Handler function that returns the updated agent state
   */
  updateAgentState(handler) {
    logger.debugLargeJson("Updating agent state", this.agentState);
    this.agentStateLock.inLock(async () => {
      await backoff(async () => {
        let updated = handler(this.agentState || {});
        const answer = await this.socket.emitWithAck("update-state", { sid: this.sessionId, expectedVersion: this.agentStateVersion, agentState: updated ? encodeBase64(encrypt(this.encryptionKey, this.encryptionVariant, updated)) : null });
        if (answer.result === "success") {
          this.agentState = answer.agentState ? decrypt(this.encryptionKey, this.encryptionVariant, decodeBase64(answer.agentState)) : null;
          this.agentStateVersion = answer.version;
          logger.debug("Agent state updated", this.agentState);
        } else if (answer.result === "version-mismatch") {
          if (answer.version > this.agentStateVersion) {
            this.agentStateVersion = answer.version;
            this.agentState = answer.agentState ? decrypt(this.encryptionKey, this.encryptionVariant, decodeBase64(answer.agentState)) : null;
          }
          throw new Error("Agent state version mismatch");
        } else if (answer.result === "error") ;
      });
    });
  }
  /**
   * Wait for socket buffer to flush
   */
  async flush() {
    if (!this.socket.connected) {
      return;
    }
    return new Promise((resolve) => {
      this.socket.emit("ping", () => {
        resolve();
      });
      setTimeout(() => {
        resolve();
      }, 1e4);
    });
  }
  /**
   * Send a session protocol envelope to the server (cursor-agent support).
   * Wraps the envelope in the format expected by the App and emits via WebSocket.
   */
  sendSessionProtocolMessage(envelope) {
    if (!this.socket.connected) {
      logger.debug("[API] Socket not connected, session protocol message lost");
      return;
    }
    const content = {
      role: "session",
      content: { type: "session", data: envelope },
      meta: { sentFrom: "cli" }
    };
    const encrypted = encodeBase64(encrypt(this.encryptionKey, this.encryptionVariant, content));
    this.socket.emit("message", {
      sid: this.sessionId,
      message: encrypted
    });
  }
  /**
   * Send a turn-end / turn-start lifecycle envelope.
   * Same shape as sendSessionProtocolMessage so the App's timer stops correctly.
   */
  sendSessionLifecycleEnvelope(envelope) {
    this.sendSessionProtocolMessage(envelope);
  }
  async close() {
    logger.debug("[API] socket.close() called");
    this.socket.close();
  }
}

class ApiMachineClient {
  constructor(token, machine) {
    this.token = token;
    this.machine = machine;
    this.rpcHandlerManager = new RpcHandlerManager({
      scopePrefix: this.machine.id,
      encryptionKey: this.machine.encryptionKey,
      encryptionVariant: this.machine.encryptionVariant,
      logger: (msg, data) => logger.debug(msg, data)
    });
    registerCommonHandlers(this.rpcHandlerManager, process.cwd());
  }
  socket;
  keepAliveInterval = null;
  rpcHandlerManager;
  setRPCHandlers({
    spawnSession,
    stopSession,
    requestShutdown
  }) {
    this.rpcHandlerManager.registerHandler("spawn-happy-session", async (params) => {
      const { directory, sessionId, machineId, approvedNewDirectoryCreation, agent, token, environmentVariables } = params || {};
      logger.debug(`[API MACHINE] Spawning session with params: ${JSON.stringify(params)}`);
      if (!directory) {
        throw new Error("Directory is required");
      }
      const result = await spawnSession({ directory, sessionId, machineId, approvedNewDirectoryCreation, agent, token, environmentVariables });
      switch (result.type) {
        case "success":
          logger.debug(`[API MACHINE] Spawned session ${result.sessionId}`);
          return { type: "success", sessionId: result.sessionId };
        case "requestToApproveDirectoryCreation":
          logger.debug(`[API MACHINE] Requesting directory creation approval for: ${result.directory}`);
          return { type: "requestToApproveDirectoryCreation", directory: result.directory };
        case "error":
          throw new Error(result.errorMessage);
      }
    });
    this.rpcHandlerManager.registerHandler("stop-session", (params) => {
      const { sessionId } = params || {};
      if (!sessionId) {
        throw new Error("Session ID is required");
      }
      const success = stopSession(sessionId);
      if (!success) {
        throw new Error("Session not found or failed to stop");
      }
      logger.debug(`[API MACHINE] Stopped session ${sessionId}`);
      return { message: "Session stopped" };
    });
    this.rpcHandlerManager.registerHandler("stop-daemon", () => {
      logger.debug("[API MACHINE] Received stop-daemon RPC request");
      setTimeout(() => {
        logger.debug("[API MACHINE] Initiating daemon shutdown from RPC");
        requestShutdown();
      }, 100);
      return { message: "Daemon stop request acknowledged, starting shutdown sequence..." };
    });
  }
  /**
   * Update machine metadata
   * Currently unused, changes from the mobile client are more likely
   * for example to set a custom name.
   */
  async updateMachineMetadata(handler) {
    await backoff(async () => {
      const updated = handler(this.machine.metadata);
      const answer = await this.socket.emitWithAck("machine-update-metadata", {
        machineId: this.machine.id,
        metadata: encodeBase64(encrypt(this.machine.encryptionKey, this.machine.encryptionVariant, updated)),
        expectedVersion: this.machine.metadataVersion
      });
      if (answer.result === "success") {
        this.machine.metadata = decrypt(this.machine.encryptionKey, this.machine.encryptionVariant, decodeBase64(answer.metadata));
        this.machine.metadataVersion = answer.version;
        logger.debug("[API MACHINE] Metadata updated successfully");
      } else if (answer.result === "version-mismatch") {
        if (answer.version > this.machine.metadataVersion) {
          this.machine.metadataVersion = answer.version;
          this.machine.metadata = decrypt(this.machine.encryptionKey, this.machine.encryptionVariant, decodeBase64(answer.metadata));
        }
        throw new Error("Metadata version mismatch");
      }
    });
  }
  /**
   * Update daemon state (runtime info) - similar to session updateAgentState
   * Simplified without lock - relies on backoff for retry
   */
  async updateDaemonState(handler) {
    await backoff(async () => {
      const updated = handler(this.machine.daemonState);
      const answer = await this.socket.emitWithAck("machine-update-state", {
        machineId: this.machine.id,
        daemonState: encodeBase64(encrypt(this.machine.encryptionKey, this.machine.encryptionVariant, updated)),
        expectedVersion: this.machine.daemonStateVersion
      });
      if (answer.result === "success") {
        this.machine.daemonState = decrypt(this.machine.encryptionKey, this.machine.encryptionVariant, decodeBase64(answer.daemonState));
        this.machine.daemonStateVersion = answer.version;
        logger.debug("[API MACHINE] Daemon state updated successfully");
      } else if (answer.result === "version-mismatch") {
        if (answer.version > this.machine.daemonStateVersion) {
          this.machine.daemonStateVersion = answer.version;
          this.machine.daemonState = decrypt(this.machine.encryptionKey, this.machine.encryptionVariant, decodeBase64(answer.daemonState));
        }
        throw new Error("Daemon state version mismatch");
      }
    });
  }
  connect() {
    const serverUrl = configuration.serverUrl.replace(/^http/, "ws");
    logger.debug(`[API MACHINE] Connecting to ${serverUrl}`);
    this.socket = io(serverUrl, {
      transports: ["websocket"],
      auth: {
        token: this.token,
        clientType: "machine-scoped",
        machineId: this.machine.id
      },
      path: "/v1/updates",
      reconnection: true,
      reconnectionDelay: 1e3,
      reconnectionDelayMax: 5e3
    });
    this.socket.on("connect", () => {
      logger.debug("[API MACHINE] Connected to server");
      this.updateDaemonState((state) => ({
        ...state,
        status: "running",
        pid: process.pid,
        httpPort: this.machine.daemonState?.httpPort,
        startedAt: Date.now()
      }));
      this.rpcHandlerManager.onSocketConnect(this.socket);
      this.startKeepAlive();
    });
    this.socket.on("disconnect", () => {
      logger.debug("[API MACHINE] Disconnected from server");
      this.rpcHandlerManager.onSocketDisconnect();
      this.stopKeepAlive();
    });
    this.socket.on("rpc-request", async (data, callback) => {
      logger.debugLargeJson(`[API MACHINE] Received RPC request:`, data);
      callback(await this.rpcHandlerManager.handleRequest(data));
    });
    this.socket.on("update", (data) => {
      if (data.body.t === "update-machine" && data.body.machineId === this.machine.id) {
        const update = data.body;
        if (update.metadata) {
          logger.debug("[API MACHINE] Received external metadata update");
          this.machine.metadata = decrypt(this.machine.encryptionKey, this.machine.encryptionVariant, decodeBase64(update.metadata.value));
          this.machine.metadataVersion = update.metadata.version;
        }
        if (update.daemonState) {
          logger.debug("[API MACHINE] Received external daemon state update");
          this.machine.daemonState = decrypt(this.machine.encryptionKey, this.machine.encryptionVariant, decodeBase64(update.daemonState.value));
          this.machine.daemonStateVersion = update.daemonState.version;
        }
      } else {
        logger.debug(`[API MACHINE] Received unknown update type: ${data.body.t}`);
      }
    });
    this.socket.on("connect_error", (error) => {
      logger.debug(`[API MACHINE] Connection error: ${error.message}`);
    });
    this.socket.io.on("error", (error) => {
      logger.debug("[API MACHINE] Socket error:", error);
    });
  }
  startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveInterval = setInterval(() => {
      const payload = {
        machineId: this.machine.id,
        time: Date.now()
      };
      if (process.env.DEBUG) {
        logger.debugLargeJson(`[API MACHINE] Emitting machine-alive`, payload);
      }
      this.socket.emit("machine-alive", payload);
    }, 2e4);
    logger.debug("[API MACHINE] Keep-alive started (20s interval)");
  }
  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
      logger.debug("[API MACHINE] Keep-alive stopped");
    }
  }
  shutdown() {
    logger.debug("[API MACHINE] Shutting down");
    this.stopKeepAlive();
    if (this.socket) {
      this.socket.close();
      logger.debug("[API MACHINE] Socket closed");
    }
  }
}

class PushNotificationClient {
  token;
  baseUrl;
  expo;
  constructor(token, baseUrl = "https://api.cluster-fluster.com") {
    this.token = token;
    this.baseUrl = baseUrl;
    this.expo = new Expo();
  }
  /**
   * Fetch all push tokens for the authenticated user
   */
  async fetchPushTokens() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/push-tokens`,
        {
          headers: {
            "Authorization": `Bearer ${this.token}`,
            "Content-Type": "application/json"
          }
        }
      );
      logger.debug(`Fetched ${response.data.tokens.length} push tokens`);
      response.data.tokens.forEach((token, index) => {
        logger.debug(`[PUSH] Token ${index + 1}: id=${token.id}, created=${new Date(token.createdAt).toISOString()}, updated=${new Date(token.updatedAt).toISOString()}`);
      });
      return response.data.tokens;
    } catch (error) {
      logger.debug("[PUSH] [ERROR] Failed to fetch push tokens:", error);
      throw new Error(`Failed to fetch push tokens: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  /**
   * Send push notification via Expo Push API with retry
   * @param messages - Array of push messages to send
   */
  async sendPushNotifications(messages) {
    logger.debug(`Sending ${messages.length} push notifications`);
    const validMessages = messages.filter((message) => {
      if (Array.isArray(message.to)) {
        return message.to.every((token) => Expo.isExpoPushToken(token));
      }
      return Expo.isExpoPushToken(message.to);
    });
    if (validMessages.length === 0) {
      logger.debug("No valid Expo push tokens found");
      return;
    }
    const chunks = this.expo.chunkPushNotifications(validMessages);
    for (const chunk of chunks) {
      const startTime = Date.now();
      const timeout = 3e5;
      let attempt = 0;
      while (true) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          const errors = ticketChunk.filter((ticket) => ticket.status === "error");
          if (errors.length > 0) {
            const errorDetails = errors.map((e) => ({ message: e.message, details: e.details }));
            logger.debug("[PUSH] Some notifications failed:", errorDetails);
          }
          if (errors.length === ticketChunk.length) {
            throw new Error("All push notifications in chunk failed");
          }
          break;
        } catch (error) {
          const elapsed = Date.now() - startTime;
          if (elapsed >= timeout) {
            logger.debug("[PUSH] Timeout reached after 5 minutes, giving up on chunk");
            break;
          }
          attempt++;
          const delay = Math.min(1e3 * Math.pow(2, attempt), 3e4);
          const remainingTime = timeout - elapsed;
          const waitTime = Math.min(delay, remainingTime);
          if (waitTime > 0) {
            logger.debug(`[PUSH] Retrying in ${waitTime}ms (attempt ${attempt})`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }
      }
    }
    logger.debug(`Push notifications sent successfully`);
  }
  /**
   * Send a push notification to all registered devices for the user
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Additional data to send with the notification
   */
  sendToAllDevices(title, body, data) {
    logger.debug(`[PUSH] sendToAllDevices called with title: "${title}", body: "${body}"`);
    (async () => {
      try {
        logger.debug("[PUSH] Fetching push tokens...");
        const tokens = await this.fetchPushTokens();
        logger.debug(`[PUSH] Fetched ${tokens.length} push tokens`);
        tokens.forEach((token, index) => {
          logger.debug(`[PUSH] Using token ${index + 1}: id=${token.id}`);
        });
        if (tokens.length === 0) {
          logger.debug("No push tokens found for user");
          return;
        }
        const messages = tokens.map((token, index) => {
          logger.debug(`[PUSH] Creating message ${index + 1} for token`);
          return {
            to: token.token,
            title,
            body,
            data,
            sound: "default",
            priority: "high"
          };
        });
        logger.debug(`[PUSH] Sending ${messages.length} push notifications...`);
        await this.sendPushNotifications(messages);
        logger.debug("[PUSH] Push notifications sent successfully");
      } catch (error) {
        logger.debug("[PUSH] Error sending to all devices:", error);
      }
    })();
  }
}

function startOfflineReconnection(config) {
  let reconnected = false;
  let session = null;
  let timeoutId = null;
  let failureCount = 0;
  let cancelled = false;
  const defaultHealthCheck = async () => {
    await axios.get(`${config.serverUrl}/v1/sessions`, {
      timeout: 5e3,
      validateStatus: (status) => status < 500
      // 4xx = server is up, 5xx = server error
    });
  };
  const healthCheck = config.healthCheck ?? defaultHealthCheck;
  const initialDelayMs = config.initialDelayMs ?? 5e3;
  const attemptReconnect = async () => {
    if (reconnected || cancelled) return;
    try {
      await healthCheck();
      if (cancelled) return;
      session = await config.onReconnected();
      if (cancelled) return;
      reconnected = true;
      config.onNotify("\u2705 Reconnected! Session syncing in background.");
      logger.debug("[OfflineReconnection] Successfully reconnected");
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        logger.debug("[OfflineReconnection] Authentication error, stopping retries");
        config.onNotify("\u274C Authentication failed. Please re-authenticate with `happy auth`.");
        return;
      }
      failureCount++;
      const delay = exponentialBackoffDelay(failureCount, 5e3, 6e4, 10);
      logger.debug(`[OfflineReconnection] Attempt ${failureCount} failed, retrying in ${delay}ms`);
      if (!cancelled) {
        timeoutId = setTimeout(attemptReconnect, delay);
      }
    }
  };
  timeoutId = setTimeout(attemptReconnect, initialDelayMs);
  return {
    cancel: () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      config.onCleanup?.();
    },
    getSession: () => session,
    isReconnected: () => reconnected
  };
}
const NETWORK_ERROR_CODES = [
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH"
];
function isNetworkError(code) {
  return code !== void 0 && NETWORK_ERROR_CODES.includes(code);
}
const ERROR_DESCRIPTIONS = {
  // Network errors (Node.js)
  ECONNREFUSED: "server not accepting connections",
  ENOTFOUND: "server hostname not found",
  ETIMEDOUT: "connection timed out",
  ECONNRESET: "connection reset by server",
  EHOSTUNREACH: "server host unreachable",
  ENETUNREACH: "network unreachable",
  // HTTP errors
  "401": "authentication failed - run `happy auth`",
  "403": "access forbidden",
  "404": "endpoint not found, check server deployment",
  "500": "server internal error",
  "502": "bad gateway",
  "503": "service unavailable"
};
class OfflineState {
  state = "online";
  failures = /* @__PURE__ */ new Map();
  // Dedupe by operation
  backend = "Claude";
  /** Report failure - accumulates context, prints once on first offline transition */
  fail(failure) {
    this.failures.set(failure.operation, failure);
    if (this.state === "online") {
      this.state = "offline";
      this.print();
    }
  }
  /** Reset on reconnection */
  recover() {
    this.state = "online";
    this.failures.clear();
  }
  /** Set backend name before API calls */
  setBackend(name) {
    this.backend = name;
  }
  /** Check current state */
  isOffline() {
    return this.state === "offline";
  }
  /** Reset for testing - clears all state */
  reset() {
    this.state = "online";
    this.failures.clear();
    this.backend = "Claude";
  }
  print() {
    const summary = [...this.failures.values()].map((f) => {
      const desc = f.errorCode ? `${f.errorCode} - ${ERROR_DESCRIPTIONS[f.errorCode] || "unknown error"}` : "unknown error";
      const url = f.url ? ` at ${f.url}` : "";
      return `${f.operation} failed: ${desc}${url}`;
    }).join("; ");
    console.log(`\u26A0\uFE0F  Happy server unreachable, offline mode with auto-reconnect enabled - error details: ${summary}`);
    const allDetails = [...this.failures.values()].flatMap((f) => f.details || []);
    allDetails.forEach((line) => console.log(chalk.yellow(`   \u2192 ${line}`)));
  }
}
const connectionState = new OfflineState();

class ApiClient {
  static async create(credential) {
    return new ApiClient(credential);
  }
  credential;
  pushClient;
  constructor(credential) {
    this.credential = credential;
    this.pushClient = new PushNotificationClient(credential.token, configuration.serverUrl);
  }
  /**
   * Create a new session or load existing one with the given tag
   */
  async getOrCreateSession(opts) {
    let dataEncryptionKey = null;
    let encryptionKey;
    let encryptionVariant;
    if (this.credential.encryption.type === "dataKey") {
      encryptionKey = getRandomBytes(32);
      encryptionVariant = "dataKey";
      let encryptedDataKey = libsodiumEncryptForPublicKey(encryptionKey, this.credential.encryption.publicKey);
      dataEncryptionKey = new Uint8Array(encryptedDataKey.length + 1);
      dataEncryptionKey.set([0], 0);
      dataEncryptionKey.set(encryptedDataKey, 1);
    } else {
      encryptionKey = this.credential.encryption.secret;
      encryptionVariant = "legacy";
    }
    try {
      const response = await axios.post(
        `${configuration.serverUrl}/v1/sessions`,
        {
          tag: opts.tag,
          metadata: encodeBase64(encrypt(encryptionKey, encryptionVariant, opts.metadata)),
          agentState: opts.state ? encodeBase64(encrypt(encryptionKey, encryptionVariant, opts.state)) : null,
          dataEncryptionKey: dataEncryptionKey ? encodeBase64(dataEncryptionKey) : null
        },
        {
          headers: {
            "Authorization": `Bearer ${this.credential.token}`,
            "Content-Type": "application/json"
          },
          timeout: 6e4
          // 1 minute timeout for very bad network connections
        }
      );
      logger.debug(`Session created/loaded: ${response.data.session.id} (tag: ${opts.tag})`);
      let raw = response.data.session;
      let session = {
        id: raw.id,
        seq: raw.seq,
        metadata: decrypt(encryptionKey, encryptionVariant, decodeBase64(raw.metadata)),
        metadataVersion: raw.metadataVersion,
        agentState: raw.agentState ? decrypt(encryptionKey, encryptionVariant, decodeBase64(raw.agentState)) : null,
        agentStateVersion: raw.agentStateVersion,
        encryptionKey,
        encryptionVariant
      };
      return session;
    } catch (error) {
      logger.debug("[API] [ERROR] Failed to get or create session:", error);
      if (error && typeof error === "object" && "code" in error) {
        const errorCode = error.code;
        if (isNetworkError(errorCode)) {
          connectionState.fail({
            operation: "Session creation",
            caller: "api.getOrCreateSession",
            errorCode,
            url: `${configuration.serverUrl}/v1/sessions`
          });
          return null;
        }
      }
      const is404Error = axios.isAxiosError(error) && error.response?.status === 404 || error && typeof error === "object" && "response" in error && error.response?.status === 404;
      if (is404Error) {
        connectionState.fail({
          operation: "Session creation",
          errorCode: "404",
          url: `${configuration.serverUrl}/v1/sessions`
        });
        return null;
      }
      if (axios.isAxiosError(error) && error.response?.status) {
        const status = error.response.status;
        if (status >= 500) {
          connectionState.fail({
            operation: "Session creation",
            errorCode: String(status),
            url: `${configuration.serverUrl}/v1/sessions`,
            details: ["Server encountered an error, will retry automatically"]
          });
          return null;
        }
      }
      throw new Error(`Failed to get or create session: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  /**
   * Register or update machine with the server
   * Returns the current machine state from the server with decrypted metadata and daemonState
   */
  async getOrCreateMachine(opts) {
    let dataEncryptionKey = null;
    let encryptionKey;
    let encryptionVariant;
    if (this.credential.encryption.type === "dataKey") {
      encryptionVariant = "dataKey";
      encryptionKey = this.credential.encryption.machineKey;
      let encryptedDataKey = libsodiumEncryptForPublicKey(this.credential.encryption.machineKey, this.credential.encryption.publicKey);
      dataEncryptionKey = new Uint8Array(encryptedDataKey.length + 1);
      dataEncryptionKey.set([0], 0);
      dataEncryptionKey.set(encryptedDataKey, 1);
    } else {
      encryptionKey = this.credential.encryption.secret;
      encryptionVariant = "legacy";
    }
    const createMinimalMachine = () => ({
      id: opts.machineId,
      encryptionKey,
      encryptionVariant,
      metadata: opts.metadata,
      metadataVersion: 0,
      daemonState: opts.daemonState || null,
      daemonStateVersion: 0
    });
    try {
      const response = await axios.post(
        `${configuration.serverUrl}/v1/machines`,
        {
          id: opts.machineId,
          metadata: encodeBase64(encrypt(encryptionKey, encryptionVariant, opts.metadata)),
          daemonState: opts.daemonState ? encodeBase64(encrypt(encryptionKey, encryptionVariant, opts.daemonState)) : void 0,
          dataEncryptionKey: dataEncryptionKey ? encodeBase64(dataEncryptionKey) : void 0
        },
        {
          headers: {
            "Authorization": `Bearer ${this.credential.token}`,
            "Content-Type": "application/json"
          },
          timeout: 6e4
          // 1 minute timeout for very bad network connections
        }
      );
      const raw = response.data.machine;
      logger.debug(`[API] Machine ${opts.machineId} registered/updated with server`);
      const machine = {
        id: raw.id,
        encryptionKey,
        encryptionVariant,
        metadata: raw.metadata ? decrypt(encryptionKey, encryptionVariant, decodeBase64(raw.metadata)) : null,
        metadataVersion: raw.metadataVersion || 0,
        daemonState: raw.daemonState ? decrypt(encryptionKey, encryptionVariant, decodeBase64(raw.daemonState)) : null,
        daemonStateVersion: raw.daemonStateVersion || 0
      };
      return machine;
    } catch (error) {
      if (axios.isAxiosError(error) && error.code && isNetworkError(error.code)) {
        connectionState.fail({
          operation: "Machine registration",
          caller: "api.getOrCreateMachine",
          errorCode: error.code,
          url: `${configuration.serverUrl}/v1/machines`
        });
        return createMinimalMachine();
      }
      if (axios.isAxiosError(error) && error.response?.status) {
        const status = error.response.status;
        if (status === 403 || status === 409) {
          console.log(chalk.yellow(
            `\u26A0\uFE0F  Machine registration rejected by the server with status ${status}`
          ));
          console.log(chalk.yellow(
            `   \u2192 This machine ID is already registered to another account on the server`
          ));
          console.log(chalk.yellow(
            `   \u2192 This usually happens after re-authenticating with a different account`
          ));
          console.log(chalk.yellow(
            `   \u2192 Run 'happy doctor clean' to reset local state and generate a new machine ID`
          ));
          console.log(chalk.yellow(
            `   \u2192 Open a GitHub issue if this problem persists`
          ));
          return createMinimalMachine();
        }
        if (status >= 500) {
          connectionState.fail({
            operation: "Machine registration",
            errorCode: String(status),
            url: `${configuration.serverUrl}/v1/machines`,
            details: ["Server encountered an error, will retry automatically"]
          });
          return createMinimalMachine();
        }
        if (status === 404) {
          connectionState.fail({
            operation: "Machine registration",
            errorCode: "404",
            url: `${configuration.serverUrl}/v1/machines`
          });
          return createMinimalMachine();
        }
      }
      throw error;
    }
  }
  sessionSyncClient(session) {
    return new ApiSessionClient(this.credential.token, session);
  }
  machineSyncClient(machine) {
    return new ApiMachineClient(this.credential.token, machine);
  }
  push() {
    return this.pushClient;
  }
  /**
   * Register a vendor API token with the server
   * The token is sent as a JSON string - server handles encryption
   */
  async registerVendorToken(vendor, apiKey) {
    try {
      const response = await axios.post(
        `${configuration.serverUrl}/v1/connect/${vendor}/register`,
        {
          token: JSON.stringify(apiKey)
        },
        {
          headers: {
            "Authorization": `Bearer ${this.credential.token}`,
            "Content-Type": "application/json"
          },
          timeout: 5e3
        }
      );
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Server returned status ${response.status}`);
      }
      logger.debug(`[API] Vendor token for ${vendor} registered successfully`);
    } catch (error) {
      logger.debug(`[API] [ERROR] Failed to register vendor token:`, error);
      throw new Error(`Failed to register vendor token: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  /**
   * Get vendor API token from the server
   * Returns the token if it exists, null otherwise
   */
  async getVendorToken(vendor) {
    try {
      const response = await axios.get(
        `${configuration.serverUrl}/v1/connect/${vendor}/token`,
        {
          headers: {
            "Authorization": `Bearer ${this.credential.token}`,
            "Content-Type": "application/json"
          },
          timeout: 5e3
        }
      );
      if (response.status === 404) {
        logger.debug(`[API] No vendor token found for ${vendor}`);
        return null;
      }
      if (response.status !== 200) {
        throw new Error(`Server returned status ${response.status}`);
      }
      logger.debug(`[API] Raw vendor token response:`, {
        status: response.status,
        dataKeys: Object.keys(response.data || {}),
        hasToken: "token" in (response.data || {}),
        tokenType: typeof response.data?.token
      });
      let tokenData = null;
      if (response.data?.token) {
        if (typeof response.data.token === "string") {
          try {
            tokenData = JSON.parse(response.data.token);
          } catch (parseError) {
            logger.debug(`[API] Failed to parse token as JSON, using as string:`, parseError);
            tokenData = response.data.token;
          }
        } else if (response.data.token !== null) {
          tokenData = response.data.token;
        } else {
          logger.debug(`[API] Token is null for ${vendor}, treating as not found`);
          return null;
        }
      } else if (response.data && typeof response.data === "object") {
        if (response.data.token === null && Object.keys(response.data).length === 1) {
          logger.debug(`[API] Response contains only null token for ${vendor}, treating as not found`);
          return null;
        }
        tokenData = response.data;
      }
      if (tokenData === null || tokenData && typeof tokenData === "object" && tokenData.token === null && Object.keys(tokenData).length === 1) {
        logger.debug(`[API] Token data is null for ${vendor}`);
        return null;
      }
      logger.debug(`[API] Vendor token for ${vendor} retrieved successfully`, {
        tokenDataType: typeof tokenData,
        tokenDataKeys: tokenData && typeof tokenData === "object" ? Object.keys(tokenData) : "not an object"
      });
      return tokenData;
    } catch (error) {
      if (error.response?.status === 404) {
        logger.debug(`[API] No vendor token found for ${vendor}`);
        return null;
      }
      logger.debug(`[API] [ERROR] Failed to get vendor token:`, error);
      return null;
    }
  }
}

var api = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ApiClient: ApiClient
});

const UsageSchema = z$1.object({
  input_tokens: z$1.number().int().nonnegative(),
  cache_creation_input_tokens: z$1.number().int().nonnegative().optional(),
  cache_read_input_tokens: z$1.number().int().nonnegative().optional(),
  output_tokens: z$1.number().int().nonnegative(),
  service_tier: z$1.string().optional()
}).passthrough();
const RawJSONLinesSchema = z$1.discriminatedUnion("type", [
  // User message - validates uuid and message.content
  z$1.object({
    type: z$1.literal("user"),
    isSidechain: z$1.boolean().optional(),
    isMeta: z$1.boolean().optional(),
    uuid: z$1.string(),
    // Used in getMessageKey()
    message: z$1.object({
      content: z$1.union([z$1.string(), z$1.any()])
      // Used in sessionScanner.ts
    }).passthrough()
  }).passthrough(),
  // Assistant message - only validates uuid and type
  // message object is optional to handle synthetic error messages (isApiErrorMessage: true)
  // which may have different structure than normal assistant messages
  z$1.object({
    uuid: z$1.string(),
    type: z$1.literal("assistant"),
    message: z$1.object({
      usage: UsageSchema.optional()
      // Used in apiSession.ts
    }).passthrough().optional()
  }).passthrough(),
  // Summary message - validates summary and leafUuid
  z$1.object({
    type: z$1.literal("summary"),
    summary: z$1.string(),
    // Used in apiSession.ts
    leafUuid: z$1.string()
    // Used in getMessageKey()
  }).passthrough(),
  // System message - validates uuid
  z$1.object({
    type: z$1.literal("system"),
    uuid: z$1.string()
    // Used in getMessageKey()
  }).passthrough()
]);

let cachedRuntime = null;
function getRuntime() {
  if (cachedRuntime) return cachedRuntime;
  if (typeof globalThis.Bun !== "undefined") {
    cachedRuntime = "bun";
    return cachedRuntime;
  }
  if (typeof globalThis.Deno !== "undefined") {
    cachedRuntime = "deno";
    return cachedRuntime;
  }
  if (process?.versions?.bun) {
    cachedRuntime = "bun";
    return cachedRuntime;
  }
  if (process?.versions?.deno) {
    cachedRuntime = "deno";
    return cachedRuntime;
  }
  if (process?.versions?.node) {
    cachedRuntime = "node";
    return cachedRuntime;
  }
  cachedRuntime = "unknown";
  return cachedRuntime;
}
const isBun = () => getRuntime() === "bun";

const AnthropicConfigSchema = z.object({
  baseUrl: z.string().url().optional(),
  authToken: z.string().optional(),
  model: z.string().optional()
});
const OpenAIConfigSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  model: z.string().optional()
});
const AzureOpenAIConfigSchema = z.object({
  apiKey: z.string().optional(),
  endpoint: z.string().url().optional(),
  apiVersion: z.string().optional(),
  deploymentName: z.string().optional()
});
const TogetherAIConfigSchema = z.object({
  apiKey: z.string().optional(),
  model: z.string().optional()
});
const TmuxConfigSchema = z.object({
  sessionName: z.string().optional(),
  tmpDir: z.string().optional(),
  updateEnvironment: z.boolean().optional()
});
const EnvironmentVariableSchema = z.object({
  name: z.string().regex(/^[A-Z_][A-Z0-9_]*$/, "Invalid environment variable name"),
  value: z.string()
});
const ProfileCompatibilitySchema = z.object({
  claude: z.boolean().default(true),
  codex: z.boolean().default(true),
  gemini: z.boolean().default(true)
});
const AIBackendProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  // Agent-specific configurations
  anthropicConfig: AnthropicConfigSchema.optional(),
  openaiConfig: OpenAIConfigSchema.optional(),
  azureOpenAIConfig: AzureOpenAIConfigSchema.optional(),
  togetherAIConfig: TogetherAIConfigSchema.optional(),
  // Tmux configuration
  tmuxConfig: TmuxConfigSchema.optional(),
  // Environment variables (validated)
  environmentVariables: z.array(EnvironmentVariableSchema).default([]),
  // Default session type for this profile
  defaultSessionType: z.enum(["simple", "worktree"]).optional(),
  // Default permission mode for this profile (supports both Claude and Codex modes)
  defaultPermissionMode: z.enum([
    "default",
    "acceptEdits",
    "bypassPermissions",
    "plan",
    // Claude modes
    "read-only",
    "safe-yolo",
    "yolo"
    // Codex modes
  ]).optional(),
  // Default model mode for this profile
  defaultModelMode: z.string().optional(),
  // Compatibility metadata
  compatibility: ProfileCompatibilitySchema.default({ claude: true, codex: true, gemini: true }),
  // Built-in profile indicator
  isBuiltIn: z.boolean().default(false),
  // Metadata
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().default(() => Date.now()),
  version: z.string().default("1.0.0")
});
function validateProfileForAgent(profile, agent) {
  return profile.compatibility[agent];
}
function getProfileEnvironmentVariables(profile) {
  const envVars = {};
  profile.environmentVariables.forEach((envVar) => {
    envVars[envVar.name] = envVar.value;
  });
  if (profile.anthropicConfig) {
    if (profile.anthropicConfig.baseUrl) envVars.ANTHROPIC_BASE_URL = profile.anthropicConfig.baseUrl;
    if (profile.anthropicConfig.authToken) envVars.ANTHROPIC_AUTH_TOKEN = profile.anthropicConfig.authToken;
    if (profile.anthropicConfig.model) envVars.ANTHROPIC_MODEL = profile.anthropicConfig.model;
  }
  if (profile.openaiConfig) {
    if (profile.openaiConfig.apiKey) envVars.OPENAI_API_KEY = profile.openaiConfig.apiKey;
    if (profile.openaiConfig.baseUrl) envVars.OPENAI_BASE_URL = profile.openaiConfig.baseUrl;
    if (profile.openaiConfig.model) envVars.OPENAI_MODEL = profile.openaiConfig.model;
  }
  if (profile.azureOpenAIConfig) {
    if (profile.azureOpenAIConfig.apiKey) envVars.AZURE_OPENAI_API_KEY = profile.azureOpenAIConfig.apiKey;
    if (profile.azureOpenAIConfig.endpoint) envVars.AZURE_OPENAI_ENDPOINT = profile.azureOpenAIConfig.endpoint;
    if (profile.azureOpenAIConfig.apiVersion) envVars.AZURE_OPENAI_API_VERSION = profile.azureOpenAIConfig.apiVersion;
    if (profile.azureOpenAIConfig.deploymentName) envVars.AZURE_OPENAI_DEPLOYMENT_NAME = profile.azureOpenAIConfig.deploymentName;
  }
  if (profile.togetherAIConfig) {
    if (profile.togetherAIConfig.apiKey) envVars.TOGETHER_API_KEY = profile.togetherAIConfig.apiKey;
    if (profile.togetherAIConfig.model) envVars.TOGETHER_MODEL = profile.togetherAIConfig.model;
  }
  if (profile.tmuxConfig) {
    if (profile.tmuxConfig.sessionName !== void 0) envVars.TMUX_SESSION_NAME = profile.tmuxConfig.sessionName;
    if (profile.tmuxConfig.tmpDir) envVars.TMUX_TMPDIR = profile.tmuxConfig.tmpDir;
    if (profile.tmuxConfig.updateEnvironment !== void 0) {
      envVars.TMUX_UPDATE_ENVIRONMENT = profile.tmuxConfig.updateEnvironment.toString();
    }
  }
  return envVars;
}
const SUPPORTED_SCHEMA_VERSION = 2;
const defaultSettings = {
  schemaVersion: SUPPORTED_SCHEMA_VERSION,
  onboardingCompleted: false,
  profiles: [],
  localEnvironmentVariables: {}
};
function migrateSettings(raw, fromVersion) {
  let migrated = { ...raw };
  if (fromVersion < 2) {
    if (!migrated.profiles) {
      migrated.profiles = [];
    }
    if (!migrated.localEnvironmentVariables) {
      migrated.localEnvironmentVariables = {};
    }
    migrated.schemaVersion = 2;
  }
  return migrated;
}
async function readSettings() {
  if (!existsSync(configuration.settingsFile)) {
    return { ...defaultSettings };
  }
  try {
    const content = await readFile$1(configuration.settingsFile, "utf8");
    const raw = JSON.parse(content);
    const schemaVersion = raw.schemaVersion ?? 1;
    if (schemaVersion > SUPPORTED_SCHEMA_VERSION) {
      logger.warn(
        `\u26A0\uFE0F Settings schema v${schemaVersion} > supported v${SUPPORTED_SCHEMA_VERSION}. Update happy-cli for full functionality.`
      );
    }
    const migrated = migrateSettings(raw, schemaVersion);
    if (migrated.profiles && Array.isArray(migrated.profiles)) {
      const validProfiles = [];
      for (const profile of migrated.profiles) {
        try {
          const validated = AIBackendProfileSchema.parse(profile);
          validProfiles.push(validated);
        } catch (error) {
          logger.warn(
            `\u26A0\uFE0F Invalid profile "${profile?.name || profile?.id || "unknown"}" - skipping. Error: ${error.message}`
          );
        }
      }
      migrated.profiles = validProfiles;
    }
    return { ...defaultSettings, ...migrated };
  } catch (error) {
    logger.warn(`Failed to read settings: ${error.message}`);
    return { ...defaultSettings };
  }
}
async function updateSettings(updater) {
  const LOCK_RETRY_INTERVAL_MS = 100;
  const MAX_LOCK_ATTEMPTS = 50;
  const STALE_LOCK_TIMEOUT_MS = 1e4;
  const lockFile = configuration.settingsFile + ".lock";
  const tmpFile = configuration.settingsFile + ".tmp";
  let fileHandle;
  let attempts = 0;
  while (attempts < MAX_LOCK_ATTEMPTS) {
    try {
      fileHandle = await open(lockFile, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY);
      break;
    } catch (err) {
      if (err.code === "EEXIST") {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, LOCK_RETRY_INTERVAL_MS));
        try {
          const stats = await stat$1(lockFile);
          if (Date.now() - stats.mtimeMs > STALE_LOCK_TIMEOUT_MS) {
            await unlink(lockFile).catch(() => {
            });
          }
        } catch {
        }
      } else {
        throw err;
      }
    }
  }
  if (!fileHandle) {
    throw new Error(`Failed to acquire settings lock after ${MAX_LOCK_ATTEMPTS * LOCK_RETRY_INTERVAL_MS / 1e3} seconds`);
  }
  try {
    const current = await readSettings() || { ...defaultSettings };
    const updated = await updater(current);
    if (!existsSync(configuration.happyHomeDir)) {
      await mkdir(configuration.happyHomeDir, { recursive: true });
    }
    await writeFile$1(tmpFile, JSON.stringify(updated, null, 2));
    await rename(tmpFile, configuration.settingsFile);
    return updated;
  } finally {
    await fileHandle.close();
    await unlink(lockFile).catch(() => {
    });
  }
}
const credentialsSchema = z.object({
  token: z.string(),
  secret: z.string().base64().nullish(),
  // Legacy
  encryption: z.object({
    publicKey: z.string().base64(),
    machineKey: z.string().base64()
  }).nullish()
});
async function readCredentials() {
  if (!existsSync(configuration.privateKeyFile)) {
    return null;
  }
  try {
    const keyBase64 = await readFile$1(configuration.privateKeyFile, "utf8");
    const credentials = credentialsSchema.parse(JSON.parse(keyBase64));
    if (credentials.secret) {
      return {
        token: credentials.token,
        encryption: {
          type: "legacy",
          secret: new Uint8Array(Buffer.from(credentials.secret, "base64"))
        }
      };
    } else if (credentials.encryption) {
      return {
        token: credentials.token,
        encryption: {
          type: "dataKey",
          publicKey: new Uint8Array(Buffer.from(credentials.encryption.publicKey, "base64")),
          machineKey: new Uint8Array(Buffer.from(credentials.encryption.machineKey, "base64"))
        }
      };
    }
  } catch {
    return null;
  }
  return null;
}
async function writeCredentialsLegacy(credentials) {
  if (!existsSync(configuration.happyHomeDir)) {
    await mkdir(configuration.happyHomeDir, { recursive: true });
  }
  await writeFile$1(configuration.privateKeyFile, JSON.stringify({
    secret: encodeBase64(credentials.secret),
    token: credentials.token
  }, null, 2));
}
async function writeCredentialsDataKey(credentials) {
  if (!existsSync(configuration.happyHomeDir)) {
    await mkdir(configuration.happyHomeDir, { recursive: true });
  }
  await writeFile$1(configuration.privateKeyFile, JSON.stringify({
    encryption: { publicKey: encodeBase64(credentials.publicKey), machineKey: encodeBase64(credentials.machineKey) },
    token: credentials.token
  }, null, 2));
}
async function clearCredentials() {
  if (existsSync(configuration.privateKeyFile)) {
    await unlink(configuration.privateKeyFile);
  }
}
async function clearMachineId() {
  await updateSettings((settings) => ({
    ...settings,
    machineId: void 0
  }));
}
async function readDaemonState() {
  try {
    if (!existsSync(configuration.daemonStateFile)) {
      return null;
    }
    const content = await readFile$1(configuration.daemonStateFile, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`[PERSISTENCE] Daemon state file corrupted: ${configuration.daemonStateFile}`, error);
    return null;
  }
}
function writeDaemonState(state) {
  writeFileSync(configuration.daemonStateFile, JSON.stringify(state, null, 2), "utf-8");
}
async function clearDaemonState() {
  if (existsSync(configuration.daemonStateFile)) {
    await unlink(configuration.daemonStateFile);
  }
  if (existsSync(configuration.daemonLockFile)) {
    try {
      await unlink(configuration.daemonLockFile);
    } catch {
    }
  }
}
async function acquireDaemonLock(maxAttempts = 5, delayIncrementMs = 200) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const fileHandle = await open(
        configuration.daemonLockFile,
        constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY
      );
      await fileHandle.writeFile(String(process.pid));
      return fileHandle;
    } catch (error) {
      if (error.code === "EEXIST") {
        try {
          const lockPid = readFileSync(configuration.daemonLockFile, "utf-8").trim();
          if (lockPid && !isNaN(Number(lockPid))) {
            try {
              process.kill(Number(lockPid), 0);
            } catch {
              unlinkSync(configuration.daemonLockFile);
              continue;
            }
          }
        } catch {
        }
      }
      if (attempt === maxAttempts) {
        return null;
      }
      const delayMs = attempt * delayIncrementMs;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return null;
}
async function releaseDaemonLock(lockHandle) {
  try {
    await lockHandle.close();
  } catch {
  }
  try {
    if (existsSync(configuration.daemonLockFile)) {
      unlinkSync(configuration.daemonLockFile);
    }
  } catch {
  }
}

var persistence = /*#__PURE__*/Object.freeze({
  __proto__: null,
  AIBackendProfileSchema: AIBackendProfileSchema,
  SUPPORTED_SCHEMA_VERSION: SUPPORTED_SCHEMA_VERSION,
  acquireDaemonLock: acquireDaemonLock,
  clearCredentials: clearCredentials,
  clearDaemonState: clearDaemonState,
  clearMachineId: clearMachineId,
  getProfileEnvironmentVariables: getProfileEnvironmentVariables,
  readCredentials: readCredentials,
  readDaemonState: readDaemonState,
  readSettings: readSettings,
  releaseDaemonLock: releaseDaemonLock,
  updateSettings: updateSettings,
  validateProfileForAgent: validateProfileForAgent,
  writeCredentialsDataKey: writeCredentialsDataKey,
  writeCredentialsLegacy: writeCredentialsLegacy,
  writeDaemonState: writeDaemonState
});

function displayQRCode(url) {
  console.log("=".repeat(80));
  console.log("\u{1F4F1} To authenticate, scan this QR code with your mobile device:");
  console.log("=".repeat(80));
  qrcode.generate(url, { small: true }, (qr) => {
    for (let l of qr.split("\n")) {
      console.log(" ".repeat(10) + l);
    }
  });
  console.log("=".repeat(80));
}

function generateWebAuthUrl(publicKey) {
  const publicKeyBase64 = encodeBase64(publicKey, "base64url");
  return `${configuration.webappUrl}/terminal/connect#key=${publicKeyBase64}`;
}

async function openBrowser(url) {
  try {
    if (!process.stdout.isTTY || process.env.CI || process.env.HEADLESS) {
      logger.debug("[browser] Headless environment detected, skipping browser open");
      return false;
    }
    logger.debug(`[browser] Attempting to open URL: ${url}`);
    await open$1(url);
    logger.debug("[browser] Browser opened successfully");
    return true;
  } catch (error) {
    logger.debug("[browser] Failed to open browser:", error);
    return false;
  }
}

const AuthSelector = ({ onSelect, onCancel }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const options = [
    {
      method: "mobile",
      label: "Mobile App"
    },
    {
      method: "web",
      label: "Web Browser"
    }
  ];
  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(options.length - 1, prev + 1));
    } else if (key.return) {
      onSelect(options[selectedIndex].method);
    } else if (key.escape || key.ctrl && input === "c") {
      onCancel();
    } else if (input === "1") {
      setSelectedIndex(0);
      onSelect("mobile");
    } else if (input === "2") {
      setSelectedIndex(1);
      onSelect("web");
    }
  });
  return /* @__PURE__ */ React.createElement(Box, { flexDirection: "column", paddingY: 1 }, /* @__PURE__ */ React.createElement(Box, { marginBottom: 1 }, /* @__PURE__ */ React.createElement(Text, null, "How would you like to authenticate?")), /* @__PURE__ */ React.createElement(Box, { flexDirection: "column" }, options.map((option, index) => {
    const isSelected = selectedIndex === index;
    return /* @__PURE__ */ React.createElement(Box, { key: option.method, marginY: 0 }, /* @__PURE__ */ React.createElement(Text, { color: isSelected ? "cyan" : "gray" }, isSelected ? "\u203A " : "  ", index + 1, ". ", option.label));
  })), /* @__PURE__ */ React.createElement(Box, { marginTop: 1 }, /* @__PURE__ */ React.createElement(Text, { dimColor: true }, "Use arrows or 1-2 to select, Enter to confirm")));
};

async function doAuth() {
  console.clear();
  const authMethod = await selectAuthenticationMethod();
  if (!authMethod) {
    console.log("\nAuthentication cancelled.\n");
    process.exit(0);
  }
  const secret = new Uint8Array(randomBytes(32));
  const keypair = tweetnacl.box.keyPair.fromSecretKey(secret);
  try {
    if (process.env.DEBUG) {
      console.log(`[AUTH DEBUG] Sending auth request to: ${configuration.serverUrl}/v1/auth/request`);
      console.log(`[AUTH DEBUG] Public key: ${encodeBase64(keypair.publicKey).substring(0, 20)}...`);
    }
    await axios.post(`${configuration.serverUrl}/v1/auth/request`, {
      publicKey: encodeBase64(keypair.publicKey),
      supportsV2: true
    });
    if (process.env.DEBUG) {
      console.log(`[AUTH DEBUG] Auth request sent successfully`);
    }
  } catch (error) {
    if (process.env.DEBUG) {
      console.log(`[AUTH DEBUG] Failed to send auth request:`, error);
    }
    console.log("Failed to create authentication request, please try again later.");
    return null;
  }
  if (authMethod === "mobile") {
    return await doMobileAuth(keypair);
  } else {
    return await doWebAuth(keypair);
  }
}
function selectAuthenticationMethod() {
  return new Promise((resolve) => {
    let hasResolved = false;
    const onSelect = (method) => {
      if (!hasResolved) {
        hasResolved = true;
        app.unmount();
        resolve(method);
      }
    };
    const onCancel = () => {
      if (!hasResolved) {
        hasResolved = true;
        app.unmount();
        resolve(null);
      }
    };
    const app = render(React.createElement(AuthSelector, { onSelect, onCancel }), {
      exitOnCtrlC: false,
      patchConsole: false
    });
  });
}
async function doMobileAuth(keypair) {
  console.clear();
  console.log("\nMobile Authentication\n");
  console.log("Scan this QR code with your Happy mobile app:\n");
  const authUrl = "happy://terminal?" + encodeBase64Url(keypair.publicKey);
  displayQRCode(authUrl);
  console.log("\nOr manually enter this URL:");
  console.log(authUrl);
  console.log("");
  return await waitForAuthentication(keypair);
}
async function doWebAuth(keypair) {
  console.clear();
  console.log("\nWeb Authentication\n");
  const webUrl = generateWebAuthUrl(keypair.publicKey);
  console.log("Opening your browser...");
  const browserOpened = await openBrowser(webUrl);
  if (browserOpened) {
    console.log("\u2713 Browser opened\n");
    console.log("Complete authentication in your browser window.");
  } else {
    console.log("Could not open browser automatically.");
  }
  console.log("\nIf the browser did not open, please copy and paste this URL:");
  console.log(webUrl);
  console.log("");
  return await waitForAuthentication(keypair);
}
async function waitForAuthentication(keypair) {
  process.stdout.write("Waiting for authentication");
  let dots = 0;
  let cancelled = false;
  const handleInterrupt = () => {
    cancelled = true;
    console.log("\n\nAuthentication cancelled.");
    process.exit(0);
  };
  process.on("SIGINT", handleInterrupt);
  try {
    while (!cancelled) {
      try {
        const response = await axios.post(`${configuration.serverUrl}/v1/auth/request`, {
          publicKey: encodeBase64(keypair.publicKey),
          supportsV2: true
        });
        if (response.data.state === "authorized") {
          let token = response.data.token;
          let r = decodeBase64(response.data.response);
          let decrypted = decryptWithEphemeralKey(r, keypair.secretKey);
          if (decrypted) {
            if (decrypted.length === 32) {
              const credentials = {
                secret: decrypted,
                token
              };
              await writeCredentialsLegacy(credentials);
              console.log("\n\n\u2713 Authentication successful\n");
              return {
                encryption: {
                  type: "legacy",
                  secret: decrypted
                },
                token
              };
            } else {
              if (decrypted[0] === 0) {
                const credentials = {
                  publicKey: decrypted.slice(1, 33),
                  machineKey: randomBytes(32),
                  token
                };
                await writeCredentialsDataKey(credentials);
                console.log("\n\n\u2713 Authentication successful\n");
                return {
                  encryption: {
                    type: "dataKey",
                    publicKey: credentials.publicKey,
                    machineKey: credentials.machineKey
                  },
                  token
                };
              } else {
                console.log("\n\nFailed to decrypt response. Please try again.");
                return null;
              }
            }
          } else {
            console.log("\n\nFailed to decrypt response. Please try again.");
            return null;
          }
        }
      } catch (error) {
        console.log("\n\nFailed to check authentication status. Please try again.");
        return null;
      }
      process.stdout.write("\rWaiting for authentication" + ".".repeat(dots % 3 + 1) + "   ");
      dots++;
      await delay(1e3);
    }
  } finally {
    process.off("SIGINT", handleInterrupt);
  }
  return null;
}
function decryptWithEphemeralKey(encryptedBundle, recipientSecretKey) {
  const ephemeralPublicKey = encryptedBundle.slice(0, 32);
  const nonce = encryptedBundle.slice(32, 32 + tweetnacl.box.nonceLength);
  const encrypted = encryptedBundle.slice(32 + tweetnacl.box.nonceLength);
  const decrypted = tweetnacl.box.open(encrypted, nonce, ephemeralPublicKey, recipientSecretKey);
  if (!decrypted) {
    return null;
  }
  return decrypted;
}
async function authAndSetupMachineIfNeeded() {
  logger.debug("[AUTH] Starting auth and machine setup...");
  let credentials = await readCredentials();
  let newAuth = false;
  if (!credentials) {
    logger.debug("[AUTH] No credentials found, starting authentication flow...");
    const authResult = await doAuth();
    if (!authResult) {
      throw new Error("Authentication failed or was cancelled");
    }
    credentials = authResult;
    newAuth = true;
  } else {
    logger.debug("[AUTH] Using existing credentials");
  }
  const settings = await updateSettings(async (s) => {
    if (newAuth || !s.machineId) {
      return {
        ...s,
        machineId: randomUUID()
      };
    }
    return s;
  });
  logger.debug(`[AUTH] Machine ID: ${settings.machineId}`);
  return { credentials, machineId: settings.machineId };
}

let caffeinateProcess = null;
function startCaffeinate() {
  if (configuration.disableCaffeinate) {
    logger.debug("[caffeinate] Caffeinate disabled via HAPPY_DISABLE_CAFFEINATE environment variable");
    return false;
  }
  if (process.platform !== "darwin") {
    logger.debug("[caffeinate] Not on macOS, skipping caffeinate");
    return false;
  }
  if (caffeinateProcess && !caffeinateProcess.killed) {
    logger.debug("[caffeinate] Caffeinate already running");
    return true;
  }
  try {
    caffeinateProcess = spawn("caffeinate", ["-im"], {
      stdio: "ignore",
      detached: false
    });
    caffeinateProcess.on("error", (error) => {
      logger.debug("[caffeinate] Error starting caffeinate:", error);
      caffeinateProcess = null;
    });
    caffeinateProcess.on("exit", (code, signal) => {
      logger.debug(`[caffeinate] Process exited with code ${code}, signal ${signal}`);
      caffeinateProcess = null;
    });
    logger.debug(`[caffeinate] Started with PID ${caffeinateProcess.pid}`);
    setupCleanupHandlers();
    return true;
  } catch (error) {
    logger.debug("[caffeinate] Failed to start caffeinate:", error);
    return false;
  }
}
let isStopping = false;
async function stopCaffeinate() {
  if (isStopping) {
    logger.debug("[caffeinate] Already stopping, skipping");
    return;
  }
  if (caffeinateProcess && !caffeinateProcess.killed) {
    isStopping = true;
    logger.debug(`[caffeinate] Stopping caffeinate process PID ${caffeinateProcess.pid}`);
    try {
      caffeinateProcess.kill("SIGTERM");
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      if (caffeinateProcess && !caffeinateProcess.killed) {
        logger.debug("[caffeinate] Force killing caffeinate process");
        caffeinateProcess.kill("SIGKILL");
      }
      caffeinateProcess = null;
      isStopping = false;
    } catch (error) {
      logger.debug("[caffeinate] Error stopping caffeinate:", error);
      isStopping = false;
    }
  }
}
let cleanupHandlersSet = false;
function setupCleanupHandlers() {
  if (cleanupHandlersSet) {
    return;
  }
  cleanupHandlersSet = true;
  const cleanup = () => {
    stopCaffeinate();
  };
  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGUSR1", cleanup);
  process.on("SIGUSR2", cleanup);
  process.on("uncaughtException", (error) => {
    logger.debug("[caffeinate] Uncaught exception, cleaning up:", error);
    cleanup();
  });
  process.on("unhandledRejection", (reason, promise) => {
    logger.debug("[caffeinate] Unhandled rejection, cleaning up:", reason);
    cleanup();
  });
}

async function daemonPost(path, body) {
  const state = await readDaemonState();
  if (!state?.httpPort) {
    const errorMessage = "No daemon running, no state file found";
    logger.debug(`[CONTROL CLIENT] ${errorMessage}`);
    return {
      error: errorMessage
    };
  }
  try {
    process.kill(state.pid, 0);
  } catch (error) {
    const errorMessage = "Daemon is not running, file is stale";
    logger.debug(`[CONTROL CLIENT] ${errorMessage}`);
    return {
      error: errorMessage
    };
  }
  try {
    const timeout = process.env.HAPPY_DAEMON_HTTP_TIMEOUT ? parseInt(process.env.HAPPY_DAEMON_HTTP_TIMEOUT) : 1e4;
    const response = await fetch(`http://127.0.0.1:${state.httpPort}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
      // Mostly increased for stress test
      signal: AbortSignal.timeout(timeout)
    });
    if (!response.ok) {
      const errorMessage = `Request failed: ${path}, HTTP ${response.status}`;
      logger.debug(`[CONTROL CLIENT] ${errorMessage}`);
      return {
        error: errorMessage
      };
    }
    return await response.json();
  } catch (error) {
    const errorMessage = `Request failed: ${path}, ${error instanceof Error ? error.message : "Unknown error"}`;
    logger.debug(`[CONTROL CLIENT] ${errorMessage}`);
    return {
      error: errorMessage
    };
  }
}
async function notifyDaemonSessionStarted(sessionId, metadata) {
  return await daemonPost("/session-started", {
    sessionId,
    metadata
  });
}
async function listDaemonSessions() {
  const result = await daemonPost("/list");
  return result.children || [];
}
async function stopDaemonSession(sessionId) {
  const result = await daemonPost("/stop-session", { sessionId });
  return result.success || false;
}
async function stopDaemonHttp() {
  await daemonPost("/stop");
}
async function checkIfDaemonRunningAndCleanupStaleState() {
  const state = await readDaemonState();
  if (!state) {
    return false;
  }
  try {
    process.kill(state.pid, 0);
    return true;
  } catch {
    logger.debug("[DAEMON RUN] Daemon PID not running, cleaning up state");
    await cleanupDaemonState();
    return false;
  }
}
async function isDaemonRunningCurrentlyInstalledHappyVersion() {
  logger.debug("[DAEMON CONTROL] Checking if daemon is running same version");
  const runningDaemon = await checkIfDaemonRunningAndCleanupStaleState();
  if (!runningDaemon) {
    logger.debug("[DAEMON CONTROL] No daemon running, returning false");
    return false;
  }
  const state = await readDaemonState();
  if (!state) {
    logger.debug("[DAEMON CONTROL] No daemon state found, returning false");
    return false;
  }
  try {
    const packageJsonPath = join$1(projectPath(), "package.json");
    const packageJson = JSON.parse(readFileSync$1(packageJsonPath, "utf-8"));
    const currentCliVersion = packageJson.version;
    logger.debug(`[DAEMON CONTROL] Current CLI version: ${currentCliVersion}, Daemon started with version: ${state.startedWithCliVersion}`);
    return currentCliVersion === state.startedWithCliVersion;
  } catch (error) {
    logger.debug("[DAEMON CONTROL] Error checking daemon version", error);
    return false;
  }
}
async function cleanupDaemonState() {
  try {
    await clearDaemonState();
    logger.debug("[DAEMON RUN] Daemon state file removed");
  } catch (error) {
    logger.debug("[DAEMON RUN] Error cleaning up daemon metadata", error);
  }
}
async function stopDaemon() {
  try {
    const state = await readDaemonState();
    if (!state) {
      logger.debug("No daemon state found");
      return;
    }
    logger.debug(`Stopping daemon with PID ${state.pid}`);
    try {
      await stopDaemonHttp();
      await waitForProcessDeath(state.pid, 2e3);
      logger.debug("Daemon stopped gracefully via HTTP");
      return;
    } catch (error) {
      logger.debug("HTTP stop failed, will force kill", error);
    }
    try {
      process.kill(state.pid, "SIGKILL");
      logger.debug("Force killed daemon");
    } catch (error) {
      logger.debug("Daemon already dead");
    }
  } catch (error) {
    logger.debug("Error stopping daemon", error);
  }
}
async function waitForProcessDeath(pid, timeout) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      process.kill(pid, 0);
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch {
      return;
    }
  }
  throw new Error("Process did not die within timeout");
}

async function findAllHappyProcesses() {
  try {
    const processes = await psList();
    const allProcesses = [];
    for (const proc of processes) {
      const cmd = proc.cmd || "";
      const name = proc.name || "";
      const isHappy = name.includes("happy") || name === "node" && (cmd.includes("happy-cli") || cmd.includes("dist/index.mjs")) || cmd.includes("happy.mjs") || cmd.includes("happy-coder") || cmd.includes("tsx") && cmd.includes("src/index.ts") && cmd.includes("happy-cli");
      if (!isHappy) continue;
      let type = "unknown";
      if (proc.pid === process.pid) {
        type = "current";
      } else if (cmd.includes("--version")) {
        type = cmd.includes("tsx") ? "dev-daemon-version-check" : "daemon-version-check";
      } else if (cmd.includes("daemon start-sync") || cmd.includes("daemon start")) {
        type = cmd.includes("tsx") ? "dev-daemon" : "daemon";
      } else if (cmd.includes("--started-by daemon")) {
        type = cmd.includes("tsx") ? "dev-daemon-spawned" : "daemon-spawned-session";
      } else if (cmd.includes("doctor")) {
        type = cmd.includes("tsx") ? "dev-doctor" : "doctor";
      } else if (cmd.includes("--yolo")) {
        type = "dev-session";
      } else {
        type = cmd.includes("tsx") ? "dev-related" : "user-session";
      }
      allProcesses.push({ pid: proc.pid, command: cmd || name, type });
    }
    return allProcesses;
  } catch (error) {
    return [];
  }
}
async function findRunawayHappyProcesses() {
  const allProcesses = await findAllHappyProcesses();
  return allProcesses.filter(
    (p) => p.pid !== process.pid && (p.type === "daemon" || p.type === "dev-daemon" || p.type === "daemon-spawned-session" || p.type === "dev-daemon-spawned" || p.type === "daemon-version-check" || p.type === "dev-daemon-version-check")
  ).map((p) => ({ pid: p.pid, command: p.command }));
}
async function killRunawayHappyProcesses() {
  const runawayProcesses = await findRunawayHappyProcesses();
  const errors = [];
  let killed = 0;
  for (const { pid, command } of runawayProcesses) {
    try {
      console.log(`Killing runaway process PID ${pid}: ${command}`);
      if (process.platform === "win32") {
        const result = spawn$1.sync("taskkill", ["/F", "/PID", pid.toString()], { stdio: "pipe" });
        if (result.error) throw result.error;
        if (result.status !== 0) throw new Error(`taskkill exited with code ${result.status}`);
      } else {
        process.kill(pid, "SIGTERM");
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        const processes = await psList();
        const stillAlive = processes.find((p) => p.pid === pid);
        if (stillAlive) {
          console.log(`Process PID ${pid} ignored SIGTERM, using SIGKILL`);
          process.kill(pid, "SIGKILL");
        }
      }
      console.log(`Successfully killed runaway process PID ${pid}`);
      killed++;
    } catch (error) {
      const errorMessage = error.message;
      errors.push({ pid, error: errorMessage });
      console.log(`Failed to kill process PID ${pid}: ${errorMessage}`);
    }
  }
  return { killed, errors };
}

function getEnvironmentInfo() {
  return {
    PWD: process.env.PWD,
    HAPPY_HOME_DIR: process.env.HAPPY_HOME_DIR,
    HAPPY_SERVER_URL: process.env.HAPPY_SERVER_URL,
    HAPPY_PROJECT_ROOT: process.env.HAPPY_PROJECT_ROOT,
    DANGEROUSLY_LOG_TO_SERVER_FOR_AI_AUTO_DEBUGGING: process.env.DANGEROUSLY_LOG_TO_SERVER_FOR_AI_AUTO_DEBUGGING,
    NODE_ENV: process.env.NODE_ENV,
    DEBUG: process.env.DEBUG,
    workingDirectory: process.cwd(),
    processArgv: process.argv,
    happyDir: configuration?.happyHomeDir,
    serverUrl: configuration?.serverUrl,
    logsDir: configuration?.logsDir,
    processPid: process.pid,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    user: process.env.USER,
    home: process.env.HOME,
    shell: process.env.SHELL,
    terminal: process.env.TERM
  };
}
function getLogFiles(logDir) {
  if (!existsSync(logDir)) {
    return [];
  }
  try {
    return readdirSync(logDir).filter((file) => file.endsWith(".log")).map((file) => {
      const path = join(logDir, file);
      const stats = statSync(path);
      return { file, path, modified: stats.mtime };
    }).sort((a, b) => b.modified.getTime() - a.modified.getTime());
  } catch {
    return [];
  }
}
async function runDoctorCommand(filter) {
  if (!filter) {
    filter = "all";
  }
  console.log(chalk.bold.cyan("\n\u{1FA7A} Happy CLI Doctor\n"));
  if (filter === "all") {
    console.log(chalk.bold("\u{1F4CB} Basic Information"));
    console.log(`Happy CLI Version: ${chalk.green(packageJson.version)}`);
    console.log(`Platform: ${chalk.green(process.platform)} ${process.arch}`);
    console.log(`Node.js Version: ${chalk.green(process.version)}`);
    console.log("");
    console.log(chalk.bold("\u{1F527} Daemon Spawn Diagnostics"));
    const projectRoot = projectPath();
    const wrapperPath = join(projectRoot, "bin", "happy.mjs");
    const cliEntrypoint = join(projectRoot, "dist", "index.mjs");
    console.log(`Project Root: ${chalk.blue(projectRoot)}`);
    console.log(`Wrapper Script: ${chalk.blue(wrapperPath)}`);
    console.log(`CLI Entrypoint: ${chalk.blue(cliEntrypoint)}`);
    console.log(`Wrapper Exists: ${existsSync(wrapperPath) ? chalk.green("\u2713 Yes") : chalk.red("\u274C No")}`);
    console.log(`CLI Exists: ${existsSync(cliEntrypoint) ? chalk.green("\u2713 Yes") : chalk.red("\u274C No")}`);
    console.log("");
    console.log(chalk.bold("\u2699\uFE0F  Configuration"));
    console.log(`Happy Home: ${chalk.blue(configuration.happyHomeDir)}`);
    console.log(`Server URL: ${chalk.blue(configuration.serverUrl)}`);
    console.log(`Logs Dir: ${chalk.blue(configuration.logsDir)}`);
    console.log(chalk.bold("\n\u{1F30D} Environment Variables"));
    const env = getEnvironmentInfo();
    console.log(`HAPPY_HOME_DIR: ${env.HAPPY_HOME_DIR ? chalk.green(env.HAPPY_HOME_DIR) : chalk.gray("not set")}`);
    console.log(`HAPPY_SERVER_URL: ${env.HAPPY_SERVER_URL ? chalk.green(env.HAPPY_SERVER_URL) : chalk.gray("not set")}`);
    console.log(`DANGEROUSLY_LOG_TO_SERVER: ${env.DANGEROUSLY_LOG_TO_SERVER_FOR_AI_AUTO_DEBUGGING ? chalk.yellow("ENABLED") : chalk.gray("not set")}`);
    console.log(`DEBUG: ${env.DEBUG ? chalk.green(env.DEBUG) : chalk.gray("not set")}`);
    console.log(`NODE_ENV: ${env.NODE_ENV ? chalk.green(env.NODE_ENV) : chalk.gray("not set")}`);
    try {
      const settings = await readSettings();
      console.log(chalk.bold("\n\u{1F4C4} Settings (settings.json):"));
      console.log(chalk.gray(JSON.stringify(settings, null, 2)));
    } catch (error) {
      console.log(chalk.bold("\n\u{1F4C4} Settings:"));
      console.log(chalk.red("\u274C Failed to read settings"));
    }
    console.log(chalk.bold("\n\u{1F510} Authentication"));
    try {
      const credentials = await readCredentials();
      if (credentials) {
        console.log(chalk.green("\u2713 Authenticated (credentials found)"));
      } else {
        console.log(chalk.yellow("\u26A0\uFE0F  Not authenticated (no credentials)"));
      }
    } catch (error) {
      console.log(chalk.red("\u274C Error reading credentials"));
    }
  }
  console.log(chalk.bold("\n\u{1F916} Daemon Status"));
  try {
    const isRunning = await checkIfDaemonRunningAndCleanupStaleState();
    const state = await readDaemonState();
    if (isRunning && state) {
      console.log(chalk.green("\u2713 Daemon is running"));
      console.log(`  PID: ${state.pid}`);
      console.log(`  Started: ${new Date(state.startTime).toLocaleString()}`);
      console.log(`  CLI Version: ${state.startedWithCliVersion}`);
      if (state.httpPort) {
        console.log(`  HTTP Port: ${state.httpPort}`);
      }
    } else if (state && !isRunning) {
      console.log(chalk.yellow("\u26A0\uFE0F  Daemon state exists but process not running (stale)"));
    } else {
      console.log(chalk.red("\u274C Daemon is not running"));
    }
    if (state) {
      console.log(chalk.bold("\n\u{1F4C4} Daemon State:"));
      console.log(chalk.blue(`Location: ${configuration.daemonStateFile}`));
      console.log(chalk.gray(JSON.stringify(state, null, 2)));
    }
    const allProcesses = await findAllHappyProcesses();
    if (allProcesses.length > 0) {
      console.log(chalk.bold("\n\u{1F50D} All Happy CLI Processes"));
      const grouped = allProcesses.reduce((groups, process2) => {
        if (!groups[process2.type]) groups[process2.type] = [];
        groups[process2.type].push(process2);
        return groups;
      }, {});
      Object.entries(grouped).forEach(([type, processes]) => {
        const typeLabels = {
          "current": "\u{1F4CD} Current Process",
          "daemon": "\u{1F916} Daemon",
          "daemon-version-check": "\u{1F50D} Daemon Version Check (stuck)",
          "daemon-spawned-session": "\u{1F517} Daemon-Spawned Sessions",
          "user-session": "\u{1F464} User Sessions",
          "dev-daemon": "\u{1F6E0}\uFE0F  Dev Daemon",
          "dev-daemon-version-check": "\u{1F6E0}\uFE0F  Dev Daemon Version Check (stuck)",
          "dev-session": "\u{1F6E0}\uFE0F  Dev Sessions",
          "dev-doctor": "\u{1F6E0}\uFE0F  Dev Doctor",
          "dev-related": "\u{1F6E0}\uFE0F  Dev Related",
          "doctor": "\u{1FA7A} Doctor",
          "unknown": "\u2753 Unknown"
        };
        console.log(chalk.blue(`
${typeLabels[type] || type}:`));
        processes.forEach(({ pid, command }) => {
          const color = type === "current" ? chalk.green : type.startsWith("dev") ? chalk.cyan : type.includes("daemon") ? chalk.blue : chalk.gray;
          console.log(`  ${color(`PID ${pid}`)}: ${chalk.gray(command)}`);
        });
      });
    } else {
      console.log(chalk.red("\u274C No happy processes found"));
    }
    if (filter === "all" && allProcesses.length > 1) {
      console.log(chalk.bold("\n\u{1F4A1} Process Management"));
      console.log(chalk.gray("To clean up runaway processes: happy doctor clean"));
    }
  } catch (error) {
    console.log(chalk.red("\u274C Error checking daemon status"));
  }
  if (filter === "all") {
    console.log(chalk.bold("\n\u{1F4DD} Log Files"));
    const allLogs = getLogFiles(configuration.logsDir);
    if (allLogs.length > 0) {
      const daemonLogs = allLogs.filter(({ file }) => file.includes("daemon"));
      const regularLogs = allLogs.filter(({ file }) => !file.includes("daemon"));
      if (regularLogs.length > 0) {
        console.log(chalk.blue("\nRecent Logs:"));
        const logsToShow = regularLogs.slice(0, 10);
        logsToShow.forEach(({ file, path, modified }) => {
          console.log(`  ${chalk.green(file)} - ${modified.toLocaleString()}`);
          console.log(chalk.gray(`    ${path}`));
        });
        if (regularLogs.length > 10) {
          console.log(chalk.gray(`  ... and ${regularLogs.length - 10} more log files`));
        }
      }
      if (daemonLogs.length > 0) {
        console.log(chalk.blue("\nDaemon Logs:"));
        const daemonLogsToShow = daemonLogs.slice(0, 5);
        daemonLogsToShow.forEach(({ file, path, modified }) => {
          console.log(`  ${chalk.green(file)} - ${modified.toLocaleString()}`);
          console.log(chalk.gray(`    ${path}`));
        });
        if (daemonLogs.length > 5) {
          console.log(chalk.gray(`  ... and ${daemonLogs.length - 5} more daemon log files`));
        }
      } else {
        console.log(chalk.yellow("\nNo daemon log files found"));
      }
    } else {
      console.log(chalk.yellow("No log files found"));
    }
    console.log(chalk.bold("\n\u{1F41B} Support & Bug Reports"));
    console.log(`Report issues: ${chalk.blue("https://github.com/slopus/happy-cli/issues")}`);
    console.log(`Documentation: ${chalk.blue("https://happy.engineering/")}`);
  }
  console.log(chalk.green("\n\u2705 Doctor diagnosis complete!\n"));
}

function spawnHappyCLI(args, options = {}) {
  const projectRoot = projectPath();
  const entrypoint = join(projectRoot, "dist", "index.mjs");
  let directory;
  if ("cwd" in options) {
    directory = options.cwd;
  } else {
    directory = process.cwd();
  }
  const fullCommand = `happy ${args.join(" ")}`;
  logger.debug(`[SPAWN HAPPY CLI] Spawning: ${fullCommand} in ${directory}`);
  const nodeArgs = [
    "--no-warnings",
    "--no-deprecation",
    entrypoint,
    ...args
  ];
  if (!existsSync(entrypoint)) {
    const errorMessage = `Entrypoint ${entrypoint} does not exist`;
    logger.debug(`[SPAWN HAPPY CLI] ${errorMessage}`);
    throw new Error(errorMessage);
  }
  const runtime = isBun() ? "bun" : "node";
  return spawn(runtime, nodeArgs, options);
}

function startDaemonControlServer({
  getChildren,
  stopSession,
  spawnSession,
  requestShutdown,
  onHappySessionWebhook
}) {
  return new Promise((resolve) => {
    const app = fastify({
      logger: false
      // We use our own logger
    });
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    const typed = app.withTypeProvider();
    typed.post("/session-started", {
      schema: {
        body: z$1.object({
          sessionId: z$1.string(),
          metadata: z$1.any()
          // Metadata type from API
        }),
        response: {
          200: z$1.object({
            status: z$1.literal("ok")
          })
        }
      }
    }, async (request) => {
      const { sessionId, metadata } = request.body;
      logger.debug(`[CONTROL SERVER] Session started: ${sessionId}`);
      onHappySessionWebhook(sessionId, metadata);
      return { status: "ok" };
    });
    typed.post("/list", {
      schema: {
        response: {
          200: z$1.object({
            children: z$1.array(z$1.object({
              startedBy: z$1.string(),
              happySessionId: z$1.string(),
              pid: z$1.number()
            }))
          })
        }
      }
    }, async () => {
      const children = getChildren();
      logger.debug(`[CONTROL SERVER] Listing ${children.length} sessions`);
      return {
        children: children.filter((child) => child.happySessionId !== void 0).map((child) => ({
          startedBy: child.startedBy,
          happySessionId: child.happySessionId,
          pid: child.pid
        }))
      };
    });
    typed.post("/stop-session", {
      schema: {
        body: z$1.object({
          sessionId: z$1.string()
        }),
        response: {
          200: z$1.object({
            success: z$1.boolean()
          })
        }
      }
    }, async (request) => {
      const { sessionId } = request.body;
      logger.debug(`[CONTROL SERVER] Stop session request: ${sessionId}`);
      const success = stopSession(sessionId);
      return { success };
    });
    typed.post("/spawn-session", {
      schema: {
        body: z$1.object({
          directory: z$1.string(),
          sessionId: z$1.string().optional()
        }),
        response: {
          200: z$1.object({
            success: z$1.boolean(),
            sessionId: z$1.string().optional(),
            approvedNewDirectoryCreation: z$1.boolean().optional()
          }),
          409: z$1.object({
            success: z$1.boolean(),
            requiresUserApproval: z$1.boolean().optional(),
            actionRequired: z$1.string().optional(),
            directory: z$1.string().optional()
          }),
          500: z$1.object({
            success: z$1.boolean(),
            error: z$1.string().optional()
          })
        }
      }
    }, async (request, reply) => {
      const { directory, sessionId } = request.body;
      logger.debug(`[CONTROL SERVER] Spawn session request: dir=${directory}, sessionId=${sessionId || "new"}`);
      const result = await spawnSession({ directory, sessionId });
      switch (result.type) {
        case "success":
          if (!result.sessionId) {
            reply.code(500);
            return {
              success: false,
              error: "Failed to spawn session: no session ID returned"
            };
          }
          return {
            success: true,
            sessionId: result.sessionId,
            approvedNewDirectoryCreation: true
          };
        case "requestToApproveDirectoryCreation":
          reply.code(409);
          return {
            success: false,
            requiresUserApproval: true,
            actionRequired: "CREATE_DIRECTORY",
            directory: result.directory
          };
        case "error":
          reply.code(500);
          return {
            success: false,
            error: result.errorMessage
          };
      }
    });
    typed.post("/stop", {
      schema: {
        response: {
          200: z$1.object({
            status: z$1.string()
          })
        }
      }
    }, async () => {
      logger.debug("[CONTROL SERVER] Stop daemon request received");
      setTimeout(() => {
        logger.debug("[CONTROL SERVER] Triggering daemon shutdown");
        requestShutdown();
      }, 50);
      return { status: "stopping" };
    });
    app.listen({ port: 0, host: "127.0.0.1" }, (err, address) => {
      if (err) {
        logger.debug("[CONTROL SERVER] Failed to start:", err);
        throw err;
      }
      const port = parseInt(address.split(":").pop());
      logger.debug(`[CONTROL SERVER] Started on port ${port}`);
      resolve({
        port,
        stop: async () => {
          logger.debug("[CONTROL SERVER] Stopping server");
          await app.close();
          logger.debug("[CONTROL SERVER] Server stopped");
        }
      });
    });
  });
}

class TmuxSessionIdentifierError extends Error {
  constructor(message) {
    super(message);
    this.name = "TmuxSessionIdentifierError";
  }
}
function parseTmuxSessionIdentifier(identifier) {
  if (!identifier || typeof identifier !== "string") {
    throw new TmuxSessionIdentifierError("Session identifier must be a non-empty string");
  }
  const parts = identifier.split(":");
  if (parts.length === 0 || !parts[0]) {
    throw new TmuxSessionIdentifierError("Invalid session identifier: missing session name");
  }
  const result = {
    session: parts[0].trim()
  };
  if (!/^[a-zA-Z0-9._-]+$/.test(result.session)) {
    throw new TmuxSessionIdentifierError(`Invalid session name: "${result.session}". Only alphanumeric characters, dots, hyphens, and underscores are allowed.`);
  }
  if (parts.length > 1) {
    const windowAndPane = parts[1].split(".");
    result.window = windowAndPane[0]?.trim();
    if (result.window && !/^[a-zA-Z0-9._-]+$/.test(result.window)) {
      throw new TmuxSessionIdentifierError(`Invalid window name: "${result.window}". Only alphanumeric characters, dots, hyphens, and underscores are allowed.`);
    }
    if (windowAndPane.length > 1) {
      result.pane = windowAndPane[1]?.trim();
      if (result.pane && !/^[0-9]+$/.test(result.pane)) {
        throw new TmuxSessionIdentifierError(`Invalid pane identifier: "${result.pane}". Only numeric values are allowed.`);
      }
    }
  }
  return result;
}
function formatTmuxSessionIdentifier(identifier) {
  if (!identifier.session) {
    throw new TmuxSessionIdentifierError("Session identifier must have a session name");
  }
  let result = identifier.session;
  if (identifier.window) {
    result += `:${identifier.window}`;
    if (identifier.pane) {
      result += `.${identifier.pane}`;
    }
  }
  return result;
}
const WIN_OPS = {
  // Navigation and window management
  "new-window": "new-window",
  "new": "new-window",
  "nw": "new-window",
  "select-window": "select-window -t",
  "sw": "select-window -t",
  "window": "select-window -t",
  "w": "select-window -t",
  "next-window": "next-window",
  "n": "next-window",
  "prev-window": "previous-window",
  "p": "previous-window",
  "pw": "previous-window",
  // Pane management
  "split-window": "split-window",
  "split": "split-window",
  "sp": "split-window",
  "vsplit": "split-window -h",
  "vsp": "split-window -h",
  "select-pane": "select-pane -t",
  "pane": "select-pane -t",
  "next-pane": "select-pane -t :.+",
  "np": "select-pane -t :.+",
  "prev-pane": "select-pane -t :.-",
  "pp": "select-pane -t :.-",
  // Session management
  "new-session": "new-session",
  "ns": "new-session",
  "new-sess": "new-session",
  "attach-session": "attach-session -t",
  "attach": "attach-session -t",
  "as": "attach-session -t",
  "detach-client": "detach-client",
  "detach": "detach-client",
  "dc": "detach-client",
  // Layout and display
  "select-layout": "select-layout",
  "layout": "select-layout",
  "sl": "select-layout",
  "clock-mode": "clock-mode",
  "clock": "clock-mode",
  // Copy mode
  "copy-mode": "copy-mode",
  "copy": "copy-mode",
  // Search and navigation in copy mode
  "search-forward": "search-forward",
  "search-backward": "search-backward",
  // Misc operations
  "list-windows": "list-windows",
  "lw": "list-windows",
  "list-sessions": "list-sessions",
  "ls": "list-sessions",
  "list-panes": "list-panes",
  "lp": "list-panes",
  "rename-window": "rename-window",
  "rename": "rename-window",
  "kill-window": "kill-window",
  "kw": "kill-window",
  "kill-pane": "kill-pane",
  "kp": "kill-pane",
  "kill-session": "kill-session",
  "ks": "kill-session",
  // Display and info
  "display-message": "display-message",
  "display": "display-message",
  "dm": "display-message",
  "show-options": "show-options",
  "show": "show-options",
  "so": "show-options",
  // Control and scripting
  "send-keys": "send-keys",
  "send": "send-keys",
  "sk": "send-keys",
  "capture-pane": "capture-pane",
  "capture": "capture-pane",
  "cp": "capture-pane",
  "pipe-pane": "pipe-pane",
  "pipe": "pipe-pane",
  // Buffer operations
  "list-buffers": "list-buffers",
  "lb": "list-buffers",
  "save-buffer": "save-buffer",
  "sb": "save-buffer",
  "delete-buffer": "delete-buffer",
  "db": "delete-buffer",
  // Advanced operations
  "resize-pane": "resize-pane",
  "resize": "resize-pane",
  "rp": "resize-pane",
  "swap-pane": "swap-pane",
  "swap": "swap-pane",
  "join-pane": "join-pane",
  "join": "join-pane",
  "break-pane": "break-pane",
  "break": "break-pane"
};
const COMMANDS_SUPPORTING_TARGET = /* @__PURE__ */ new Set([
  "send-keys",
  "capture-pane",
  "new-window",
  "kill-window",
  "select-window",
  "split-window",
  "select-pane",
  "kill-pane",
  "select-layout",
  "display-message",
  "attach-session",
  "detach-client",
  "new-session",
  "kill-session",
  "list-windows",
  "list-panes"
]);
const CONTROL_SEQUENCES = /* @__PURE__ */ new Set([
  "C-m",
  "C-c",
  "C-l",
  "C-u",
  "C-w",
  "C-a",
  "C-b",
  "C-d",
  "C-e",
  "C-f",
  "C-g",
  "C-h",
  "C-i",
  "C-j",
  "C-k",
  "C-n",
  "C-o",
  "C-p",
  "C-q",
  "C-r",
  "C-s",
  "C-t",
  "C-v",
  "C-x",
  "C-y",
  "C-z",
  "C-\\",
  "C-]",
  "C-[",
  "C-]"
]);
class TmuxUtilities {
  /** Default session name to prevent interference */
  static DEFAULT_SESSION_NAME = "happy";
  controlState = "normal" /* NORMAL */;
  sessionName;
  constructor(sessionName) {
    this.sessionName = sessionName || TmuxUtilities.DEFAULT_SESSION_NAME;
  }
  /**
   * Detect tmux environment from TMUX environment variable
   */
  detectTmuxEnvironment() {
    const tmuxEnv = process.env.TMUX;
    if (!tmuxEnv) {
      return null;
    }
    try {
      const parts = tmuxEnv.split(",");
      if (parts.length >= 3) {
        const socketPath = parts[0];
        const pathParts = parts[1].split("/");
        const sessionAndWindow = pathParts[pathParts.length - 1] || parts[1];
        const pane = parts[2];
        let session;
        let window;
        if (sessionAndWindow.includes(".")) {
          const parts2 = sessionAndWindow.split(".", 2);
          session = parts2[0];
          window = parts2[1] || "0";
        } else {
          session = sessionAndWindow;
          window = "0";
        }
        return {
          session,
          window,
          pane,
          socket_path: socketPath
        };
      }
    } catch (error) {
      logger.debug("[TMUX] Failed to parse TMUX environment variable:", error);
    }
    return null;
  }
  /**
   * Execute tmux command with proper session targeting and socket handling
   */
  async executeTmuxCommand(cmd, session, window, pane, socketPath) {
    const targetSession = session || this.sessionName;
    let baseCmd = ["tmux"];
    if (socketPath) {
      baseCmd = ["tmux", "-S", socketPath];
    }
    if (cmd.length > 0 && cmd[0] === "send-keys") {
      const fullCmd = [...baseCmd, cmd[0]];
      let target = targetSession;
      if (window) target += `:${window}`;
      if (pane) target += `.${pane}`;
      fullCmd.push("-t", target);
      fullCmd.push(...cmd.slice(1));
      return this.executeCommand(fullCmd);
    } else {
      const fullCmd = [...baseCmd, ...cmd];
      if (cmd.length > 0 && COMMANDS_SUPPORTING_TARGET.has(cmd[0])) {
        let target = targetSession;
        if (window) target += `:${window}`;
        if (pane) target += `.${pane}`;
        fullCmd.push("-t", target);
      }
      return this.executeCommand(fullCmd);
    }
  }
  /**
   * Execute command with subprocess and return result
   */
  async executeCommand(cmd) {
    try {
      const result = await this.runCommand(cmd);
      return {
        returncode: result.exitCode,
        stdout: result.stdout || "",
        stderr: result.stderr || "",
        command: cmd
      };
    } catch (error) {
      logger.debug("[TMUX] Command execution failed:", error);
      return null;
    }
  }
  /**
   * Run command using Node.js child_process.spawn
   */
  runCommand(args, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(args[0], args.slice(1), {
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 5e3,
        shell: false,
        ...options
      });
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });
      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });
      child.on("close", (code) => {
        resolve({
          exitCode: code || 0,
          stdout,
          stderr
        });
      });
      child.on("error", (error) => {
        reject(error);
      });
    });
  }
  /**
   * Parse control sequences in text (^ for escape, ^^ for literal ^)
   */
  parseControlSequences(text) {
    const result = [];
    let i = 0;
    let localState = this.controlState;
    while (i < text.length) {
      const char = text[i];
      if (localState === "normal" /* NORMAL */) {
        if (char === "^") {
          if (i + 1 < text.length && text[i + 1] === "^") {
            result.push("^");
            i += 2;
          } else {
            localState = "escape" /* ESCAPE */;
            i += 1;
          }
        } else {
          result.push(char);
          i += 1;
        }
      } else if (localState === "escape" /* ESCAPE */) {
        result.push(char);
        i += 1;
        localState = "normal" /* NORMAL */;
      } else {
        result.push(char);
        i += 1;
      }
    }
    this.controlState = localState;
    return [result.join(""), localState];
  }
  /**
   * Execute window operation using WIN_OPS dispatch with type safety
   */
  async executeWinOp(operation, args = [], session, window, pane) {
    const tmuxCmd = WIN_OPS[operation];
    if (!tmuxCmd) {
      logger.debug(`[TMUX] Unknown operation: ${operation}`);
      return false;
    }
    const cmdParts = tmuxCmd.split(" ");
    cmdParts.push(...args);
    const result = await this.executeTmuxCommand(cmdParts, session, window, pane);
    return result !== null && result.returncode === 0;
  }
  /**
   * Ensure session exists, create if needed
   */
  async ensureSessionExists(sessionName) {
    const targetSession = sessionName || this.sessionName;
    const result = await this.executeTmuxCommand(["has-session", "-t", targetSession]);
    if (result && result.returncode === 0) {
      return true;
    }
    const createResult = await this.executeTmuxCommand(["new-session", "-d", "-s", targetSession]);
    return createResult !== null && createResult.returncode === 0;
  }
  /**
   * Capture current input from tmux pane
   */
  async captureCurrentInput(session, window, pane) {
    const result = await this.executeTmuxCommand(["capture-pane", "-p"], session, window, pane);
    if (result && result.returncode === 0) {
      const lines = result.stdout.trim().split("\n");
      return lines[lines.length - 1] || "";
    }
    return "";
  }
  /**
   * Check if user is actively typing
   */
  async isUserTyping(checkInterval = 500, maxChecks = 3, session, window, pane) {
    const initialInput = await this.captureCurrentInput(session, window, pane);
    for (let i = 0; i < maxChecks - 1; i++) {
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
      const currentInput = await this.captureCurrentInput(session, window, pane);
      if (currentInput !== initialInput) {
        return true;
      }
    }
    return false;
  }
  /**
   * Send keys to tmux pane with proper control sequence handling and type safety
   */
  async sendKeys(keys, session, window, pane) {
    if (!keys || typeof keys !== "string") {
      logger.debug("[TMUX] Invalid keys provided to sendKeys");
      return false;
    }
    if (CONTROL_SEQUENCES.has(keys)) {
      const result = await this.executeTmuxCommand(["send-keys", keys], session, window, pane);
      return result !== null && result.returncode === 0;
    } else {
      const result = await this.executeTmuxCommand(["send-keys", keys], session, window, pane);
      return result !== null && result.returncode === 0;
    }
  }
  /**
   * Send multiple keys to tmux pane with proper control sequence handling
   */
  async sendMultipleKeys(keys, session, window, pane) {
    if (!Array.isArray(keys) || keys.length === 0) {
      logger.debug("[TMUX] Invalid keys array provided to sendMultipleKeys");
      return false;
    }
    for (const key of keys) {
      const success = await this.sendKeys(key, session, window, pane);
      if (!success) {
        return false;
      }
    }
    return true;
  }
  /**
   * Get comprehensive session information
   */
  async getSessionInfo(sessionName) {
    const targetSession = sessionName || this.sessionName;
    const envInfo = this.detectTmuxEnvironment();
    const info = {
      target_session: targetSession,
      session: targetSession,
      window: "unknown",
      pane: "unknown",
      socket_path: void 0,
      tmux_active: envInfo !== null,
      current_session: envInfo?.session,
      available_sessions: []
    };
    if (envInfo && envInfo.session === targetSession) {
      info.window = envInfo.window;
      info.pane = envInfo.pane;
      info.socket_path = envInfo.socket_path;
    } else if (envInfo) {
      info.env_session = envInfo.session;
      info.env_window = envInfo.window;
      info.env_pane = envInfo.pane;
    }
    const result = await this.executeTmuxCommand(["list-sessions"]);
    if (result && result.returncode === 0) {
      info.available_sessions = result.stdout.trim().split("\n").filter((line) => line.trim()).map((line) => line.split(":")[0]);
    }
    return info;
  }
  /**
   * Spawn process in tmux session with environment variables.
   *
   * IMPORTANT: Unlike Node.js spawn(), env is a separate parameter.
   * This is intentional because:
   * - Tmux windows inherit environment from the tmux server
   * - Only NEW or DIFFERENT variables need to be set via -e flag
   * - Passing all of process.env would create 50+ unnecessary -e flags
   *
   * @param args - Command and arguments to execute (as array, will be joined)
   * @param options - Spawn options (tmux-specific, excludes env)
   * @param env - Environment variables to set in window (only pass what's different!)
   * @returns Result with success status and session identifier
   */
  async spawnInTmux(args, options = {}, env) {
    try {
      const tmuxCheck = await this.executeTmuxCommand(["list-sessions"]);
      if (!tmuxCheck) {
        throw new Error("tmux not available");
      }
      let sessionName = options.sessionName !== void 0 && options.sessionName !== "" ? options.sessionName : null;
      if (!sessionName) {
        const listResult = await this.executeTmuxCommand(["list-sessions", "-F", "#{session_name}"]);
        if (listResult && listResult.returncode === 0 && listResult.stdout.trim()) {
          const firstSession = listResult.stdout.trim().split("\n")[0];
          sessionName = firstSession;
          logger.debug(`[TMUX] Using first existing session: ${sessionName}`);
        } else {
          sessionName = "happy";
          logger.debug(`[TMUX] No existing sessions, using default: ${sessionName}`);
        }
      }
      const windowName = options.windowName || `happy-${Date.now()}`;
      await this.ensureSessionExists(sessionName);
      const fullCommand = args.join(" ");
      const createWindowArgs = ["new-window", "-n", windowName];
      if (options.cwd) {
        const cwdPath = typeof options.cwd === "string" ? options.cwd : options.cwd.pathname;
        createWindowArgs.push("-c", cwdPath);
      }
      if (env && Object.keys(env).length > 0) {
        for (const [key, value] of Object.entries(env)) {
          if (value === void 0 || value === null) {
            logger.warn(`[TMUX] Skipping undefined/null environment variable: ${key}`);
            continue;
          }
          if (!/^[A-Z_][A-Z0-9_]*$/i.test(key)) {
            logger.warn(`[TMUX] Skipping invalid environment variable name: ${key}`);
            continue;
          }
          const escapedValue = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/`/g, "\\`");
          createWindowArgs.push("-e", `${key}="${escapedValue}"`);
        }
        logger.debug(`[TMUX] Setting ${Object.keys(env).length} environment variables in tmux window`);
      }
      createWindowArgs.push(fullCommand);
      createWindowArgs.push("-P");
      createWindowArgs.push("-F", "#{pane_pid}");
      const createResult = await this.executeTmuxCommand(createWindowArgs, sessionName);
      if (!createResult || createResult.returncode !== 0) {
        throw new Error(`Failed to create tmux window: ${createResult?.stderr}`);
      }
      const panePid = parseInt(createResult.stdout.trim());
      if (isNaN(panePid)) {
        throw new Error(`Failed to extract PID from tmux output: ${createResult.stdout}`);
      }
      logger.debug(`[TMUX] Spawned command in tmux session ${sessionName}, window ${windowName}, PID ${panePid}`);
      const sessionIdentifier = {
        session: sessionName,
        window: windowName
      };
      return {
        success: true,
        sessionId: formatTmuxSessionIdentifier(sessionIdentifier),
        pid: panePid
      };
    } catch (error) {
      logger.debug("[TMUX] Failed to spawn in tmux:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  /**
   * Get session info for a given session identifier string
   */
  async getSessionInfoFromString(sessionIdentifier) {
    try {
      const parsed = parseTmuxSessionIdentifier(sessionIdentifier);
      const info = await this.getSessionInfo(parsed.session);
      return info;
    } catch (error) {
      if (error instanceof TmuxSessionIdentifierError) {
        logger.debug(`[TMUX] Invalid session identifier: ${error.message}`);
      } else {
        logger.debug("[TMUX] Error getting session info:", error);
      }
      return null;
    }
  }
  /**
   * Kill a tmux window safely with proper error handling
   */
  async killWindow(sessionIdentifier) {
    try {
      const parsed = parseTmuxSessionIdentifier(sessionIdentifier);
      if (!parsed.window) {
        throw new TmuxSessionIdentifierError(`Window identifier required: ${sessionIdentifier}`);
      }
      const result = await this.executeWinOp("kill-window", [parsed.window], parsed.session);
      return result;
    } catch (error) {
      if (error instanceof TmuxSessionIdentifierError) {
        logger.debug(`[TMUX] Invalid window identifier: ${error.message}`);
      } else {
        logger.debug("[TMUX] Error killing window:", error);
      }
      return false;
    }
  }
  /**
   * List windows in a session
   */
  async listWindows(sessionName) {
    const targetSession = sessionName || this.sessionName;
    const result = await this.executeTmuxCommand(["list-windows", "-t", targetSession]);
    if (!result || result.returncode !== 0) {
      return [];
    }
    const windows = [];
    const lines = result.stdout.trim().split("\n");
    for (const line of lines) {
      const match = line.match(/^\d+:\s+(\w+)/);
      if (match) {
        windows.push(match[1]);
      }
    }
    return windows;
  }
}
let _tmuxUtils = null;
function getTmuxUtilities(sessionName) {
  if (!_tmuxUtils || sessionName && sessionName !== _tmuxUtils.sessionName) {
    _tmuxUtils = new TmuxUtilities(sessionName);
  }
  return _tmuxUtils;
}
async function isTmuxAvailable() {
  try {
    const utils = new TmuxUtilities();
    const result = await utils.executeTmuxCommand(["list-sessions"]);
    return result !== null;
  } catch {
    return false;
  }
}

function expandEnvironmentVariables(envVars, sourceEnv = process.env) {
  const expanded = {};
  const undefinedVars = [];
  for (const [key, value] of Object.entries(envVars)) {
    const expandedValue = value.replace(/\$\{([^}]+)\}/g, (match, expr) => {
      const colonDashIndex = expr.indexOf(":-");
      let varName;
      let defaultValue;
      if (colonDashIndex !== -1) {
        varName = expr.substring(0, colonDashIndex);
        defaultValue = expr.substring(colonDashIndex + 2);
      } else {
        varName = expr;
      }
      const resolvedValue = sourceEnv[varName];
      if (resolvedValue !== void 0) {
        const isSensitive = varName.toLowerCase().includes("token") || varName.toLowerCase().includes("key") || varName.toLowerCase().includes("secret");
        const displayValue = isSensitive ? resolvedValue ? `<${resolvedValue.length} chars>` : "<empty>" : resolvedValue;
        logger.debug(`[EXPAND ENV] Expanded ${varName} from daemon env: ${displayValue}`);
        if (resolvedValue === "") {
          logger.warn(`[EXPAND ENV] WARNING: ${varName} is set but EMPTY in daemon environment`);
        }
        return resolvedValue;
      } else if (defaultValue !== void 0) {
        logger.debug(`[EXPAND ENV] Using default value for ${varName}: ${defaultValue}`);
        return defaultValue;
      } else {
        undefinedVars.push(varName);
        return match;
      }
    });
    expanded[key] = expandedValue;
  }
  if (undefinedVars.length > 0) {
    logger.warn(`[EXPAND ENV] Undefined variables referenced in profile environment: ${undefinedVars.join(", ")}`);
    logger.warn(`[EXPAND ENV] Session may fail to authenticate. Set these in daemon environment before launching:`);
    undefinedVars.forEach((varName) => {
      logger.warn(`[EXPAND ENV]   ${varName}=<your-value>`);
    });
  }
  return expanded;
}

const initialMachineMetadata = {
  host: os.hostname(),
  platform: os.platform(),
  happyCliVersion: packageJson.version,
  homeDir: os.homedir(),
  happyHomeDir: configuration.happyHomeDir,
  happyLibDir: projectPath()
};
async function getProfileEnvironmentVariablesForAgent(profileId, agentType) {
  try {
    const settings = await readSettings();
    const profile = settings.profiles.find((p) => p.id === profileId);
    if (!profile) {
      logger.debug(`[DAEMON RUN] Profile ${profileId} not found`);
      return {};
    }
    if (!validateProfileForAgent(profile, agentType)) {
      logger.debug(`[DAEMON RUN] Profile ${profileId} not compatible with agent ${agentType}`);
      return {};
    }
    const envVars = getProfileEnvironmentVariables(profile);
    logger.debug(`[DAEMON RUN] Loaded ${Object.keys(envVars).length} environment variables from profile ${profileId} for agent ${agentType}`);
    return envVars;
  } catch (error) {
    logger.debug("[DAEMON RUN] Failed to get profile environment variables:", error);
    return {};
  }
}
async function startDaemon() {
  let requestShutdown;
  let resolvesWhenShutdownRequested = new Promise((resolve) => {
    requestShutdown = (source, errorMessage) => {
      logger.debug(`[DAEMON RUN] Requesting shutdown (source: ${source}, errorMessage: ${errorMessage})`);
      setTimeout(async () => {
        logger.debug("[DAEMON RUN] Startup malfunctioned, forcing exit with code 1");
        await new Promise((resolve2) => setTimeout(resolve2, 100));
        process.exit(1);
      }, 1e3);
      resolve({ source, errorMessage });
    };
  });
  process.on("SIGINT", () => {
    logger.debug("[DAEMON RUN] Received SIGINT");
    requestShutdown("os-signal");
  });
  process.on("SIGTERM", () => {
    logger.debug("[DAEMON RUN] Received SIGTERM");
    requestShutdown("os-signal");
  });
  process.on("uncaughtException", (error) => {
    logger.debug("[DAEMON RUN] FATAL: Uncaught exception", error);
    logger.debug(`[DAEMON RUN] Stack trace: ${error.stack}`);
    requestShutdown("exception", error.message);
  });
  process.on("unhandledRejection", (reason, promise) => {
    logger.debug("[DAEMON RUN] FATAL: Unhandled promise rejection", reason);
    logger.debug(`[DAEMON RUN] Rejected promise:`, promise);
    const error = reason instanceof Error ? reason : new Error(`Unhandled promise rejection: ${reason}`);
    logger.debug(`[DAEMON RUN] Stack trace: ${error.stack}`);
    requestShutdown("exception", error.message);
  });
  process.on("exit", (code) => {
    logger.debug(`[DAEMON RUN] Process exiting with code: ${code}`);
  });
  process.on("beforeExit", (code) => {
    logger.debug(`[DAEMON RUN] Process about to exit with code: ${code}`);
  });
  logger.debug("[DAEMON RUN] Starting daemon process...");
  logger.debugLargeJson("[DAEMON RUN] Environment", getEnvironmentInfo());
  const runningDaemonVersionMatches = await isDaemonRunningCurrentlyInstalledHappyVersion();
  if (!runningDaemonVersionMatches) {
    logger.debug("[DAEMON RUN] Daemon version mismatch detected, restarting daemon with current CLI version");
    await stopDaemon();
  } else {
    logger.debug("[DAEMON RUN] Daemon version matches, keeping existing daemon");
    console.log("Daemon already running with matching version");
    process.exit(0);
  }
  const daemonLockHandle = await acquireDaemonLock(5, 200);
  if (!daemonLockHandle) {
    logger.debug("[DAEMON RUN] Daemon lock file already held, another daemon is running");
    process.exit(0);
  }
  try {
    const caffeinateStarted = startCaffeinate();
    if (caffeinateStarted) {
      logger.debug("[DAEMON RUN] Sleep prevention enabled");
    }
    const { credentials, machineId } = await authAndSetupMachineIfNeeded();
    logger.debug("[DAEMON RUN] Auth and machine setup complete");
    const pidToTrackedSession = /* @__PURE__ */ new Map();
    const pidToAwaiter = /* @__PURE__ */ new Map();
    const getCurrentChildren = () => Array.from(pidToTrackedSession.values());
    const onHappySessionWebhook = (sessionId, sessionMetadata) => {
      logger.debugLargeJson(`[DAEMON RUN] Session reported`, sessionMetadata);
      const pid = sessionMetadata.hostPid;
      if (!pid) {
        logger.debug(`[DAEMON RUN] Session webhook missing hostPid for sessionId: ${sessionId}`);
        return;
      }
      logger.debug(`[DAEMON RUN] Session webhook: ${sessionId}, PID: ${pid}, started by: ${sessionMetadata.startedBy || "unknown"}`);
      logger.debug(`[DAEMON RUN] Current tracked sessions before webhook: ${Array.from(pidToTrackedSession.keys()).join(", ")}`);
      const existingSession = pidToTrackedSession.get(pid);
      if (existingSession && existingSession.startedBy === "daemon") {
        existingSession.happySessionId = sessionId;
        existingSession.happySessionMetadataFromLocalWebhook = sessionMetadata;
        logger.debug(`[DAEMON RUN] Updated daemon-spawned session ${sessionId} with metadata`);
        const awaiter = pidToAwaiter.get(pid);
        if (awaiter) {
          pidToAwaiter.delete(pid);
          awaiter(existingSession);
          logger.debug(`[DAEMON RUN] Resolved session awaiter for PID ${pid}`);
        }
      } else if (!existingSession) {
        const trackedSession = {
          startedBy: "happy directly - likely by user from terminal",
          happySessionId: sessionId,
          happySessionMetadataFromLocalWebhook: sessionMetadata,
          pid
        };
        pidToTrackedSession.set(pid, trackedSession);
        logger.debug(`[DAEMON RUN] Registered externally-started session ${sessionId}`);
      }
    };
    const spawnSession = async (options) => {
      logger.debugLargeJson("[DAEMON RUN] Spawning session", options);
      const { directory, sessionId, machineId: machineId2, approvedNewDirectoryCreation = true } = options;
      let directoryCreated = false;
      try {
        await fs.access(directory);
        logger.debug(`[DAEMON RUN] Directory exists: ${directory}`);
      } catch (error) {
        logger.debug(`[DAEMON RUN] Directory doesn't exist, creating: ${directory}`);
        if (!approvedNewDirectoryCreation) {
          logger.debug(`[DAEMON RUN] Directory creation not approved for: ${directory}`);
          return {
            type: "requestToApproveDirectoryCreation",
            directory
          };
        }
        try {
          await fs.mkdir(directory, { recursive: true });
          logger.debug(`[DAEMON RUN] Successfully created directory: ${directory}`);
          directoryCreated = true;
        } catch (mkdirError) {
          let errorMessage = `Unable to create directory at '${directory}'. `;
          if (mkdirError.code === "EACCES") {
            errorMessage += `Permission denied. You don't have write access to create a folder at this location. Try using a different path or check your permissions.`;
          } else if (mkdirError.code === "ENOTDIR") {
            errorMessage += `A file already exists at this path or in the parent path. Cannot create a directory here. Please choose a different location.`;
          } else if (mkdirError.code === "ENOSPC") {
            errorMessage += `No space left on device. Your disk is full. Please free up some space and try again.`;
          } else if (mkdirError.code === "EROFS") {
            errorMessage += `The file system is read-only. Cannot create directories here. Please choose a writable location.`;
          } else {
            errorMessage += `System error: ${mkdirError.message || mkdirError}. Please verify the path is valid and you have the necessary permissions.`;
          }
          logger.debug(`[DAEMON RUN] Directory creation failed: ${errorMessage}`);
          return {
            type: "error",
            errorMessage
          };
        }
      }
      try {
        const authEnv = {};
        if (options.token) {
          if (options.agent === "codex") {
            const codexHomeDir = tmp.dirSync();
            fs.writeFile(join$1(codexHomeDir.name, "auth.json"), options.token);
            authEnv.CODEX_HOME = codexHomeDir.name;
          } else {
            authEnv.CLAUDE_CODE_OAUTH_TOKEN = options.token;
          }
        }
        let profileEnv = {};
        if (options.environmentVariables && Object.keys(options.environmentVariables).length > 0) {
          profileEnv = options.environmentVariables;
          logger.info(`[DAEMON RUN] Using GUI-provided profile environment variables (${Object.keys(profileEnv).length} vars)`);
          logger.debug(`[DAEMON RUN] GUI profile env var keys: ${Object.keys(profileEnv).join(", ")}`);
        } else {
          try {
            const settings = await readSettings();
            if (settings.activeProfileId) {
              logger.debug(`[DAEMON RUN] No GUI profile provided, loading CLI local active profile: ${settings.activeProfileId}`);
              profileEnv = await getProfileEnvironmentVariablesForAgent(
                settings.activeProfileId,
                options.agent || "claude"
              );
              logger.debug(`[DAEMON RUN] Loaded ${Object.keys(profileEnv).length} environment variables from CLI local profile for agent ${options.agent || "claude"}`);
              logger.debug(`[DAEMON RUN] CLI profile env var keys: ${Object.keys(profileEnv).join(", ")}`);
            } else {
              logger.debug("[DAEMON RUN] No CLI local active profile set");
            }
          } catch (error) {
            logger.debug("[DAEMON RUN] Failed to load CLI local profile environment variables:", error);
          }
        }
        let extraEnv = { ...profileEnv, ...authEnv };
        logger.debug(`[DAEMON RUN] Final environment variable keys (before expansion) (${Object.keys(extraEnv).length}): ${Object.keys(extraEnv).join(", ")}`);
        extraEnv = expandEnvironmentVariables(extraEnv, process.env);
        logger.debug(`[DAEMON RUN] After variable expansion: ${Object.keys(extraEnv).join(", ")}`);
        const potentialAuthVars = ["ANTHROPIC_AUTH_TOKEN", "CLAUDE_CODE_OAUTH_TOKEN", "OPENAI_API_KEY", "CODEX_HOME", "AZURE_OPENAI_API_KEY", "TOGETHER_API_KEY"];
        const unexpandedAuthVars = potentialAuthVars.filter((varName) => {
          const value = extraEnv[varName];
          return value && typeof value === "string" && value.includes("${");
        });
        if (unexpandedAuthVars.length > 0) {
          const missingVarDetails = unexpandedAuthVars.map((authVar) => {
            const value = extraEnv[authVar];
            const unresolvedMatch = value?.match(/\$\{([A-Z_][A-Z0-9_]*)(:-[^}]*)?\}/);
            const missingVar = unresolvedMatch ? unresolvedMatch[1] : "unknown";
            return `${authVar} references \${${missingVar}} which is not defined`;
          });
          const errorMessage = `Authentication will fail - environment variables not found in daemon: ${missingVarDetails.join("; ")}. Ensure these variables are set in the daemon's environment (not just your shell) before starting sessions.`;
          logger.warn(`[DAEMON RUN] ${errorMessage}`);
          return {
            type: "error",
            errorMessage
          };
        }
        const tmuxAvailable = await isTmuxAvailable();
        let useTmux = tmuxAvailable;
        let tmuxSessionName = extraEnv.TMUX_SESSION_NAME;
        if (!tmuxAvailable || tmuxSessionName === void 0) {
          useTmux = false;
          if (tmuxSessionName !== void 0) {
            logger.debug(`[DAEMON RUN] tmux session name specified but tmux not available, falling back to regular spawning`);
          }
        }
        if (useTmux && tmuxSessionName !== void 0) {
          const sessionDesc = tmuxSessionName || "current/most recent session";
          logger.debug(`[DAEMON RUN] Attempting to spawn session in tmux: ${sessionDesc}`);
          const tmux = getTmuxUtilities(tmuxSessionName);
          const cliPath = join$1(projectPath(), "dist", "index.mjs");
          const agent = options.agent === "gemini" ? "gemini" : options.agent === "codex" ? "codex" : "claude";
          const fullCommand = `node --no-warnings --no-deprecation ${cliPath} ${agent} --happy-starting-mode remote --started-by daemon`;
          const windowName = `happy-${Date.now()}-${agent}`;
          const tmuxEnv = {};
          for (const [key, value] of Object.entries(process.env)) {
            if (value !== void 0) {
              tmuxEnv[key] = value;
            }
          }
          Object.assign(tmuxEnv, extraEnv);
          const tmuxResult = await tmux.spawnInTmux([fullCommand], {
            sessionName: tmuxSessionName,
            windowName,
            cwd: directory
          }, tmuxEnv);
          if (tmuxResult.success) {
            logger.debug(`[DAEMON RUN] Successfully spawned in tmux session: ${tmuxResult.sessionId}, PID: ${tmuxResult.pid}`);
            if (!tmuxResult.pid) {
              throw new Error("Tmux window created but no PID returned");
            }
            const trackedSession = {
              startedBy: "daemon",
              pid: tmuxResult.pid,
              // Real PID from tmux -P flag
              tmuxSessionId: tmuxResult.sessionId,
              directoryCreated,
              message: directoryCreated ? `The path '${directory}' did not exist. We created a new folder and spawned a new session in tmux session '${tmuxSessionName}'. Use 'tmux attach -t ${tmuxSessionName}' to view the session.` : `Spawned new session in tmux session '${tmuxSessionName}'. Use 'tmux attach -t ${tmuxSessionName}' to view the session.`
            };
            pidToTrackedSession.set(tmuxResult.pid, trackedSession);
            logger.debug(`[DAEMON RUN] Waiting for session webhook for PID ${tmuxResult.pid} (tmux)`);
            return new Promise((resolve) => {
              const timeout = setTimeout(() => {
                pidToAwaiter.delete(tmuxResult.pid);
                logger.debug(`[DAEMON RUN] Session webhook timeout for PID ${tmuxResult.pid} (tmux)`);
                resolve({
                  type: "error",
                  errorMessage: `Session webhook timeout for PID ${tmuxResult.pid} (tmux)`
                });
              }, 15e3);
              pidToAwaiter.set(tmuxResult.pid, (completedSession) => {
                clearTimeout(timeout);
                logger.debug(`[DAEMON RUN] Session ${completedSession.happySessionId} fully spawned with webhook (tmux)`);
                resolve({
                  type: "success",
                  sessionId: completedSession.happySessionId
                });
              });
            });
          } else {
            logger.debug(`[DAEMON RUN] Failed to spawn in tmux: ${tmuxResult.error}, falling back to regular spawning`);
            useTmux = false;
          }
        }
        if (!useTmux) {
          logger.debug(`[DAEMON RUN] Using regular process spawning`);
          let agentCommand;
          switch (options.agent) {
            case "claude":
            case void 0:
              agentCommand = "claude";
              break;
            case "codex":
              agentCommand = "codex";
              break;
            case "gemini":
              agentCommand = "gemini";
              break;
            default:
              return {
                type: "error",
                errorMessage: `Unsupported agent type: '${options.agent}'. Please update your CLI to the latest version.`
              };
          }
          const args = [
            agentCommand,
            "--happy-starting-mode",
            "remote",
            "--started-by",
            "daemon"
          ];
          const happyProcess = spawnHappyCLI(args, {
            cwd: directory,
            detached: true,
            // Sessions stay alive when daemon stops
            stdio: ["ignore", "pipe", "pipe"],
            // Capture stdout/stderr for debugging
            env: {
              ...process.env,
              ...extraEnv
            }
          });
          if (process.env.DEBUG) {
            happyProcess.stdout?.on("data", (data) => {
              logger.debug(`[DAEMON RUN] Child stdout: ${data.toString()}`);
            });
            happyProcess.stderr?.on("data", (data) => {
              logger.debug(`[DAEMON RUN] Child stderr: ${data.toString()}`);
            });
          }
          if (!happyProcess.pid) {
            logger.debug("[DAEMON RUN] Failed to spawn process - no PID returned");
            return {
              type: "error",
              errorMessage: "Failed to spawn Happy process - no PID returned"
            };
          }
          logger.debug(`[DAEMON RUN] Spawned process with PID ${happyProcess.pid}`);
          const trackedSession = {
            startedBy: "daemon",
            pid: happyProcess.pid,
            childProcess: happyProcess,
            directoryCreated,
            message: directoryCreated ? `The path '${directory}' did not exist. We created a new folder and spawned a new session there.` : void 0
          };
          pidToTrackedSession.set(happyProcess.pid, trackedSession);
          happyProcess.on("exit", (code, signal) => {
            logger.debug(`[DAEMON RUN] Child PID ${happyProcess.pid} exited with code ${code}, signal ${signal}`);
            if (happyProcess.pid) {
              onChildExited(happyProcess.pid);
            }
          });
          happyProcess.on("error", (error) => {
            logger.debug(`[DAEMON RUN] Child process error:`, error);
            if (happyProcess.pid) {
              onChildExited(happyProcess.pid);
            }
          });
          logger.debug(`[DAEMON RUN] Waiting for session webhook for PID ${happyProcess.pid}`);
          return new Promise((resolve) => {
            const timeout = setTimeout(() => {
              pidToAwaiter.delete(happyProcess.pid);
              logger.debug(`[DAEMON RUN] Session webhook timeout for PID ${happyProcess.pid}`);
              resolve({
                type: "error",
                errorMessage: `Session webhook timeout for PID ${happyProcess.pid}`
              });
            }, 15e3);
            pidToAwaiter.set(happyProcess.pid, (completedSession) => {
              clearTimeout(timeout);
              logger.debug(`[DAEMON RUN] Session ${completedSession.happySessionId} fully spawned with webhook`);
              resolve({
                type: "success",
                sessionId: completedSession.happySessionId
              });
            });
          });
        }
        return {
          type: "error",
          errorMessage: "Unexpected error in session spawning"
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.debug("[DAEMON RUN] Failed to spawn session:", error);
        return {
          type: "error",
          errorMessage: `Failed to spawn session: ${errorMessage}`
        };
      }
    };
    const stopSession = (sessionId) => {
      logger.debug(`[DAEMON RUN] Attempting to stop session ${sessionId}`);
      for (const [pid, session] of pidToTrackedSession.entries()) {
        if (session.happySessionId === sessionId || sessionId.startsWith("PID-") && pid === parseInt(sessionId.replace("PID-", ""))) {
          if (session.startedBy === "daemon" && session.childProcess) {
            try {
              session.childProcess.kill("SIGTERM");
              logger.debug(`[DAEMON RUN] Sent SIGTERM to daemon-spawned session ${sessionId}`);
            } catch (error) {
              logger.debug(`[DAEMON RUN] Failed to kill session ${sessionId}:`, error);
            }
          } else {
            try {
              process.kill(pid, "SIGTERM");
              logger.debug(`[DAEMON RUN] Sent SIGTERM to external session PID ${pid}`);
            } catch (error) {
              logger.debug(`[DAEMON RUN] Failed to kill external session PID ${pid}:`, error);
            }
          }
          pidToTrackedSession.delete(pid);
          logger.debug(`[DAEMON RUN] Removed session ${sessionId} from tracking`);
          return true;
        }
      }
      logger.debug(`[DAEMON RUN] Session ${sessionId} not found`);
      return false;
    };
    const onChildExited = (pid) => {
      logger.debug(`[DAEMON RUN] Removing exited process PID ${pid} from tracking`);
      pidToTrackedSession.delete(pid);
    };
    const { port: controlPort, stop: stopControlServer } = await startDaemonControlServer({
      getChildren: getCurrentChildren,
      stopSession,
      spawnSession,
      requestShutdown: () => requestShutdown("happy-cli"),
      onHappySessionWebhook
    });
    const fileState = {
      pid: process.pid,
      httpPort: controlPort,
      startTime: (/* @__PURE__ */ new Date()).toLocaleString(),
      startedWithCliVersion: packageJson.version,
      daemonLogPath: logger.logFilePath
    };
    writeDaemonState(fileState);
    logger.debug("[DAEMON RUN] Daemon state written");
    const initialDaemonState = {
      status: "offline",
      pid: process.pid,
      httpPort: controlPort,
      startedAt: Date.now()
    };
    const api = await ApiClient.create(credentials);
    const machine = await api.getOrCreateMachine({
      machineId,
      metadata: initialMachineMetadata,
      daemonState: initialDaemonState
    });
    logger.debug(`[DAEMON RUN] Machine registered: ${machine.id}`);
    const apiMachine = api.machineSyncClient(machine);
    apiMachine.setRPCHandlers({
      spawnSession,
      stopSession,
      requestShutdown: () => requestShutdown("happy-app")
    });
    apiMachine.connect();
    const heartbeatIntervalMs = parseInt(process.env.HAPPY_DAEMON_HEARTBEAT_INTERVAL || "60000");
    let heartbeatRunning = false;
    const restartOnStaleVersionAndHeartbeat = setInterval(async () => {
      if (heartbeatRunning) {
        return;
      }
      heartbeatRunning = true;
      if (process.env.DEBUG) {
        logger.debug(`[DAEMON RUN] Health check started at ${(/* @__PURE__ */ new Date()).toLocaleString()}`);
      }
      for (const [pid, _] of pidToTrackedSession.entries()) {
        try {
          process.kill(pid, 0);
        } catch (error) {
          logger.debug(`[DAEMON RUN] Removing stale session with PID ${pid} (process no longer exists)`);
          pidToTrackedSession.delete(pid);
        }
      }
      const projectVersion = JSON.parse(readFileSync$1(join$1(projectPath(), "package.json"), "utf-8")).version;
      if (projectVersion !== configuration.currentCliVersion) {
        logger.debug("[DAEMON RUN] Daemon is outdated, triggering self-restart with latest version, clearing heartbeat interval");
        clearInterval(restartOnStaleVersionAndHeartbeat);
        try {
          spawnHappyCLI(["daemon", "start"], {
            detached: true,
            stdio: "ignore"
          });
        } catch (error) {
          logger.debug("[DAEMON RUN] Failed to spawn new daemon, this is quite likely to happen during integration tests as we are cleaning out dist/ directory", error);
        }
        logger.debug("[DAEMON RUN] Hanging for a bit - waiting for CLI to kill us because we are running outdated version of the code");
        await new Promise((resolve) => setTimeout(resolve, 1e4));
        process.exit(0);
      }
      const daemonState = await readDaemonState();
      if (daemonState && daemonState.pid !== process.pid) {
        logger.debug("[DAEMON RUN] Somehow a different daemon was started without killing us. We should kill ourselves.");
        requestShutdown("exception", "A different daemon was started without killing us. We should kill ourselves.");
      }
      try {
        const updatedState = {
          pid: process.pid,
          httpPort: controlPort,
          startTime: fileState.startTime,
          startedWithCliVersion: packageJson.version,
          lastHeartbeat: (/* @__PURE__ */ new Date()).toLocaleString(),
          daemonLogPath: fileState.daemonLogPath
        };
        writeDaemonState(updatedState);
        if (process.env.DEBUG) {
          logger.debug(`[DAEMON RUN] Health check completed at ${updatedState.lastHeartbeat}`);
        }
      } catch (error) {
        logger.debug("[DAEMON RUN] Failed to write heartbeat", error);
      }
      heartbeatRunning = false;
    }, heartbeatIntervalMs);
    const cleanupAndShutdown = async (source, errorMessage) => {
      logger.debug(`[DAEMON RUN] Starting proper cleanup (source: ${source}, errorMessage: ${errorMessage})...`);
      if (restartOnStaleVersionAndHeartbeat) {
        clearInterval(restartOnStaleVersionAndHeartbeat);
        logger.debug("[DAEMON RUN] Health check interval cleared");
      }
      await apiMachine.updateDaemonState((state) => ({
        ...state,
        status: "shutting-down",
        shutdownRequestedAt: Date.now(),
        shutdownSource: source
      }));
      await new Promise((resolve) => setTimeout(resolve, 100));
      apiMachine.shutdown();
      await stopControlServer();
      await cleanupDaemonState();
      await stopCaffeinate();
      await releaseDaemonLock(daemonLockHandle);
      logger.debug("[DAEMON RUN] Cleanup completed, exiting process");
      process.exit(0);
    };
    logger.debug("[DAEMON RUN] Daemon started successfully, waiting for shutdown request");
    const shutdownRequest = await resolvesWhenShutdownRequested;
    await cleanupAndShutdown(shutdownRequest.source, shutdownRequest.errorMessage);
  } catch (error) {
    logger.debug("[DAEMON RUN][FATAL] Failed somewhere unexpectedly - exiting with code 1", error);
    process.exit(1);
  }
}

class MessageQueue2 {
  queue = [];
  // Made public for testing
  waiter = null;
  closed = false;
  onMessageHandler = null;
  modeHasher;
  constructor(modeHasher, onMessageHandler = null) {
    this.modeHasher = modeHasher;
    this.onMessageHandler = onMessageHandler;
    logger.debug(`[MessageQueue2] Initialized`);
  }
  /**
   * Set a handler that will be called when a message arrives
   */
  setOnMessage(handler) {
    this.onMessageHandler = handler;
  }
  /**
   * Push a message to the queue with a mode.
   */
  push(message, mode) {
    if (this.closed) {
      throw new Error("Cannot push to closed queue");
    }
    const modeHash = this.modeHasher(mode);
    logger.debug(`[MessageQueue2] push() called with mode hash: ${modeHash}`);
    this.queue.push({
      message,
      mode,
      modeHash,
      isolate: false
    });
    if (this.onMessageHandler) {
      this.onMessageHandler(message, mode);
    }
    if (this.waiter) {
      logger.debug(`[MessageQueue2] Notifying waiter`);
      const waiter = this.waiter;
      this.waiter = null;
      waiter(true);
    }
    logger.debug(`[MessageQueue2] push() completed. Queue size: ${this.queue.length}`);
  }
  /**
   * Push a message immediately without batching delay.
   * Does not clear the queue or enforce isolation.
   */
  pushImmediate(message, mode) {
    if (this.closed) {
      throw new Error("Cannot push to closed queue");
    }
    const modeHash = this.modeHasher(mode);
    logger.debug(`[MessageQueue2] pushImmediate() called with mode hash: ${modeHash}`);
    this.queue.push({
      message,
      mode,
      modeHash,
      isolate: false
    });
    if (this.onMessageHandler) {
      this.onMessageHandler(message, mode);
    }
    if (this.waiter) {
      logger.debug(`[MessageQueue2] Notifying waiter for immediate message`);
      const waiter = this.waiter;
      this.waiter = null;
      waiter(true);
    }
    logger.debug(`[MessageQueue2] pushImmediate() completed. Queue size: ${this.queue.length}`);
  }
  /**
   * Push a message that must be processed in complete isolation.
   * Clears any pending messages and ensures this message is never batched with others.
   * Used for special commands that require dedicated processing.
   */
  pushIsolateAndClear(message, mode) {
    if (this.closed) {
      throw new Error("Cannot push to closed queue");
    }
    const modeHash = this.modeHasher(mode);
    logger.debug(`[MessageQueue2] pushIsolateAndClear() called with mode hash: ${modeHash} - clearing ${this.queue.length} pending messages`);
    this.queue = [];
    this.queue.push({
      message,
      mode,
      modeHash,
      isolate: true
    });
    if (this.onMessageHandler) {
      this.onMessageHandler(message, mode);
    }
    if (this.waiter) {
      logger.debug(`[MessageQueue2] Notifying waiter for isolated message`);
      const waiter = this.waiter;
      this.waiter = null;
      waiter(true);
    }
    logger.debug(`[MessageQueue2] pushIsolateAndClear() completed. Queue size: ${this.queue.length}`);
  }
  /**
   * Push a message to the beginning of the queue with a mode.
   */
  unshift(message, mode) {
    if (this.closed) {
      throw new Error("Cannot unshift to closed queue");
    }
    const modeHash = this.modeHasher(mode);
    logger.debug(`[MessageQueue2] unshift() called with mode hash: ${modeHash}`);
    this.queue.unshift({
      message,
      mode,
      modeHash,
      isolate: false
    });
    if (this.onMessageHandler) {
      this.onMessageHandler(message, mode);
    }
    if (this.waiter) {
      logger.debug(`[MessageQueue2] Notifying waiter`);
      const waiter = this.waiter;
      this.waiter = null;
      waiter(true);
    }
    logger.debug(`[MessageQueue2] unshift() completed. Queue size: ${this.queue.length}`);
  }
  /**
   * Reset the queue - clears all messages and resets to empty state
   */
  reset() {
    logger.debug(`[MessageQueue2] reset() called. Clearing ${this.queue.length} messages`);
    this.queue = [];
    this.closed = false;
    this.waiter = null;
  }
  /**
   * Close the queue - no more messages can be pushed
   */
  close() {
    logger.debug(`[MessageQueue2] close() called`);
    this.closed = true;
    if (this.waiter) {
      const waiter = this.waiter;
      this.waiter = null;
      waiter(false);
    }
  }
  /**
   * Check if the queue is closed
   */
  isClosed() {
    return this.closed;
  }
  /**
   * Get the current queue size
   */
  size() {
    return this.queue.length;
  }
  /**
   * Wait for messages and return all messages with the same mode as a single string
   * Returns { message: string, mode: T } or null if aborted/closed
   */
  async waitForMessagesAndGetAsString(abortSignal) {
    if (this.queue.length > 0) {
      return this.collectBatch();
    }
    if (this.closed || abortSignal?.aborted) {
      return null;
    }
    const hasMessages = await this.waitForMessages(abortSignal);
    if (!hasMessages) {
      return null;
    }
    return this.collectBatch();
  }
  /**
   * Collect a batch of messages with the same mode, respecting isolation requirements
   */
  collectBatch() {
    if (this.queue.length === 0) {
      return null;
    }
    const firstItem = this.queue[0];
    const sameModeMessages = [];
    let mode = firstItem.mode;
    let isolate = firstItem.isolate ?? false;
    const targetModeHash = firstItem.modeHash;
    if (firstItem.isolate) {
      const item = this.queue.shift();
      sameModeMessages.push(item.message);
      logger.debug(`[MessageQueue2] Collected isolated message with mode hash: ${targetModeHash}`);
    } else {
      while (this.queue.length > 0 && this.queue[0].modeHash === targetModeHash && !this.queue[0].isolate) {
        const item = this.queue.shift();
        sameModeMessages.push(item.message);
      }
      logger.debug(`[MessageQueue2] Collected batch of ${sameModeMessages.length} messages with mode hash: ${targetModeHash}`);
    }
    const combinedMessage = sameModeMessages.join("\n");
    return {
      message: combinedMessage,
      mode,
      hash: targetModeHash,
      isolate
    };
  }
  /**
   * Wait for messages to arrive
   */
  waitForMessages(abortSignal) {
    return new Promise((resolve) => {
      let abortHandler = null;
      if (abortSignal) {
        abortHandler = () => {
          logger.debug("[MessageQueue2] Wait aborted");
          if (this.waiter === waiterFunc) {
            this.waiter = null;
          }
          resolve(false);
        };
        abortSignal.addEventListener("abort", abortHandler);
      }
      const waiterFunc = (hasMessages) => {
        if (abortHandler && abortSignal) {
          abortSignal.removeEventListener("abort", abortHandler);
        }
        resolve(hasMessages);
      };
      if (this.queue.length > 0) {
        if (abortHandler && abortSignal) {
          abortSignal.removeEventListener("abort", abortHandler);
        }
        resolve(true);
        return;
      }
      if (this.closed || abortSignal?.aborted) {
        if (abortHandler && abortSignal) {
          abortSignal.removeEventListener("abort", abortHandler);
        }
        resolve(false);
        return;
      }
      this.waiter = waiterFunc;
      logger.debug("[MessageQueue2] Waiting for messages...");
    });
  }
}

function deterministicStringify(obj, options = {}) {
  const {
    undefinedBehavior = "omit",
    sortArrays = false,
    replacer,
    includeSymbols = false
  } = options;
  const seen = /* @__PURE__ */ new WeakSet();
  function processValue(value, key) {
    if (replacer && key !== void 0) {
      value = replacer(key, value);
    }
    if (value === null) return null;
    if (value === void 0) {
      switch (undefinedBehavior) {
        case "omit":
          return void 0;
        case "null":
          return null;
        case "throw":
          throw new Error(`Undefined value at key: ${key}`);
      }
    }
    if (typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
      return value;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (value instanceof RegExp) {
      return value.toString();
    }
    if (typeof value === "function") {
      return void 0;
    }
    if (typeof value === "symbol") {
      return includeSymbols ? value.toString() : void 0;
    }
    if (typeof value === "bigint") {
      return value.toString() + "n";
    }
    if (seen.has(value)) {
      throw new Error("Circular reference detected");
    }
    seen.add(value);
    if (Array.isArray(value)) {
      const processed2 = value.map((item, index) => processValue(item, String(index))).filter((item) => item !== void 0);
      if (sortArrays) {
        processed2.sort((a, b) => {
          const aStr = JSON.stringify(processValue(a));
          const bStr = JSON.stringify(processValue(b));
          return aStr.localeCompare(bStr);
        });
      }
      seen.delete(value);
      return processed2;
    }
    if (value.constructor === Object || value.constructor === void 0) {
      const processed2 = {};
      const keys = Object.keys(value).sort();
      for (const k of keys) {
        const processedValue = processValue(value[k], k);
        if (processedValue !== void 0) {
          processed2[k] = processedValue;
        }
      }
      seen.delete(value);
      return processed2;
    }
    try {
      const plain = { ...value };
      seen.delete(value);
      return processValue(plain, key);
    } catch {
      seen.delete(value);
      return String(value);
    }
  }
  const processed = processValue(obj);
  return JSON.stringify(processed);
}
function hashObject(obj, options, encoding = "hex") {
  const jsonString = deterministicStringify(obj, options);
  return createHash("sha256").update(jsonString).digest(encoding);
}

async function startHappyServer(client, options) {
  const handler = async (title) => {
    logger.debug("[happyMCP] Changing title to:", title);
    try {
      client.sendClaudeSessionMessage({
        type: "summary",
        summary: title,
        leafUuid: randomUUID()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  };
  const mcp = new McpServer({
    name: "Happy MCP",
    version: "1.0.0"
  });
  mcp.registerTool("change_title", {
    description: "Change the title of the current chat session",
    title: "Change Chat Title",
    inputSchema: {
      title: z$1.string().describe("The new title for the chat session")
    }
  }, async (args) => {
    const response = await handler(args.title);
    logger.debug("[happyMCP] Response:", response);
    if (response.success) {
      return {
        content: [
          {
            type: "text",
            text: `Successfully changed chat title to: "${args.title}"`
          }
        ],
        isError: false
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: `Failed to change chat title: ${response.error || "Unknown error"}`
          }
        ],
        isError: true
      };
    }
  });
  const transport = new StreamableHTTPServerTransport({
    // NOTE: Returning session id here will result in claude
    // sdk spawn to fail with `Invalid Request: Server already initialized`
    sessionIdGenerator: void 0
  });
  await mcp.connect(transport);
  const server = createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/a2a/message" && options?.onA2aMessage) {
      try {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const raw = Buffer.concat(chunks).toString("utf8").trim();
        if (!raw) {
          res.writeHead(400).end(JSON.stringify({ error: "Empty body" }));
          return;
        }
        const body = JSON.parse(raw);
        const text = typeof body.text === "string" ? body.text.trim() : null;
        if (!text) {
          res.writeHead(400).end(JSON.stringify({ error: "Missing text" }));
          return;
        }
        const message = {
          role: "user",
          content: { text, type: "text" },
          meta: {
            origin: "a2a",
            title: typeof body.title === "string" ? body.title : void 0
          }
        };
        await options.onA2aMessage(message);
        res.writeHead(200).end(JSON.stringify({ ok: true }));
        return;
      } catch (err) {
        logger.debug("[happyMCP] A2A message error:", err);
        if (!res.headersSent) {
          res.writeHead(500).end(JSON.stringify({ error: "Internal error" }));
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
  const baseUrl = await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve(new URL(`http://127.0.0.1:${addr.port}`));
    });
  });
  return {
    url: baseUrl.toString(),
    toolNames: ["change_title"],
    stop: () => {
      logger.debug("[happyMCP] Stopping server");
      mcp.close();
      server.close();
    }
  };
}

function registerKillSessionHandler(rpcHandlerManager, killThisHappy) {
  rpcHandlerManager.registerHandler("killSession", async () => {
    logger.debug("Kill session request received");
    void killThisHappy();
    return {
      success: true,
      message: "Killing happy-cli process"
    };
  });
}

export { ApiClient as A, openBrowser as B, killRunawayHappyProcesses as C, runDoctorCommand as D, isDaemonRunningCurrentlyInstalledHappyVersion as E, spawnHappyCLI as F, listDaemonSessions as G, stopDaemonSession as H, startDaemon as I, getLatestDaemonLog as J, api as K, persistence as L, MessageQueue2 as M, RawJSONLinesSchema as R, ApiSessionClient as a, readSettings as b, configuration as c, registerKillSessionHandler as d, stopCaffeinate as e, connectionState as f, packageJson as g, hashObject as h, initialMachineMetadata as i, startOfflineReconnection as j, delay as k, logger as l, backoff as m, notifyDaemonSessionStarted as n, isBun as o, projectPath as p, AsyncLock as q, readCredentials as r, startHappyServer as s, getEnvironmentInfo as t, startCaffeinate as u, checkIfDaemonRunningAndCleanupStaleState as v, stopDaemon as w, clearCredentials as x, clearMachineId as y, authAndSetupMachineIfNeeded as z };
