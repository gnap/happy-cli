import os from 'node:os';
import { resolve } from 'node:path';
import { p as projectPath, c as configuration, g as packageJson, j as startOfflineReconnection } from './registerKillSessionHandler-C5lXxTYr.mjs';

function createSessionMetadata(opts) {
  const state = {
    controlledByUser: false
  };
  const metadata = {
    path: process.cwd(),
    host: os.hostname(),
    version: packageJson.version,
    os: os.platform(),
    machineId: opts.machineId,
    homeDir: os.homedir(),
    happyHomeDir: configuration.happyHomeDir,
    happyLibDir: projectPath(),
    happyToolsDir: resolve(projectPath(), "tools", "unpacked"),
    startedFromDaemon: opts.startedBy === "daemon",
    hostPid: process.pid,
    startedBy: opts.startedBy || "terminal",
    lifecycleState: "running",
    lifecycleStateSince: Date.now(),
    flavor: opts.flavor
  };
  return { state, metadata };
}

function createOfflineSessionStub(sessionTag) {
  return {
    sessionId: `offline-${sessionTag}`,
    sendCodexMessage: () => {
    },
    sendAgentMessage: () => {
    },
    sendClaudeSessionMessage: () => {
    },
    keepAlive: () => {
    },
    sendSessionEvent: () => {
    },
    sendSessionDeath: () => {
    },
    updateLifecycleState: () => {
    },
    requestControlTransfer: async () => {
    },
    flush: async () => {
    },
    close: async () => {
    },
    updateMetadata: () => {
    },
    updateAgentState: () => {
    },
    onUserMessage: () => {
    },
    rpcHandlerManager: {
      registerHandler: () => {
      }
    }
  };
}

function setupOfflineReconnection(opts) {
  const { api, sessionTag, metadata, state, response, onSessionSwap } = opts;
  let session;
  let reconnectionHandle = null;
  if (!response) {
    session = createOfflineSessionStub(sessionTag);
    reconnectionHandle = startOfflineReconnection({
      serverUrl: configuration.serverUrl,
      onReconnected: async () => {
        const resp = await api.getOrCreateSession({ tag: sessionTag, metadata, state });
        if (!resp) throw new Error("Server unavailable");
        const realSession = api.sessionSyncClient(resp);
        onSessionSwap(realSession);
        return realSession;
      },
      onNotify: (msg) => {
        console.log(msg);
      }
    });
    return { session, reconnectionHandle, isOffline: true };
  } else {
    session = api.sessionSyncClient(response);
    return { session, reconnectionHandle: null, isOffline: false };
  }
}

export { createSessionMetadata as c, setupOfflineReconnection as s };
