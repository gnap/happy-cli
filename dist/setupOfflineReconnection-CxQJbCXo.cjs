'use strict';

var os = require('node:os');
var node_path = require('node:path');
var api = require('./registerKillSessionHandler-B6NlxcWn.cjs');

function createSessionMetadata(opts) {
  const state = {
    controlledByUser: false
  };
  const metadata = {
    path: process.cwd(),
    host: os.hostname(),
    version: api.packageJson.version,
    os: os.platform(),
    machineId: opts.machineId,
    homeDir: os.homedir(),
    happyHomeDir: api.configuration.happyHomeDir,
    happyLibDir: api.projectPath(),
    happyToolsDir: node_path.resolve(api.projectPath(), "tools", "unpacked"),
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
  const { api: api$1, sessionTag, metadata, state, response, onSessionSwap } = opts;
  let session;
  let reconnectionHandle = null;
  if (!response) {
    session = createOfflineSessionStub(sessionTag);
    reconnectionHandle = api.startOfflineReconnection({
      serverUrl: api.configuration.serverUrl,
      onReconnected: async () => {
        const resp = await api$1.getOrCreateSession({ tag: sessionTag, metadata, state });
        if (!resp) throw new Error("Server unavailable");
        const realSession = api$1.sessionSyncClient(resp);
        onSessionSwap(realSession);
        return realSession;
      },
      onNotify: (msg) => {
        console.log(msg);
      }
    });
    return { session, reconnectionHandle, isOffline: true };
  } else {
    session = api$1.sessionSyncClient(response);
    return { session, reconnectionHandle: null, isOffline: false };
  }
}

exports.createSessionMetadata = createSessionMetadata;
exports.setupOfflineReconnection = setupOfflineReconnection;
