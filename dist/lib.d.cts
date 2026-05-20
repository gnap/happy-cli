import * as z from 'zod';
import { z as z$1 } from 'zod';
import { EventEmitter } from 'node:events';
import { Socket } from 'socket.io-client';
import { ExpoPushMessage } from 'expo-server-sdk';

/**
 * Simplified schema that only validates fields actually used in the codebase
 * while preserving all other fields through passthrough()
 */

declare const UsageSchema: z$1.ZodObject<{
    input_tokens: z$1.ZodNumber;
    cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
    cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
    output_tokens: z$1.ZodNumber;
    service_tier: z$1.ZodOptional<z$1.ZodString>;
}, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
    input_tokens: z$1.ZodNumber;
    cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
    cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
    output_tokens: z$1.ZodNumber;
    service_tier: z$1.ZodOptional<z$1.ZodString>;
}, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
    input_tokens: z$1.ZodNumber;
    cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
    cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
    output_tokens: z$1.ZodNumber;
    service_tier: z$1.ZodOptional<z$1.ZodString>;
}, z$1.ZodTypeAny, "passthrough">>;
declare const RawJSONLinesSchema: z$1.ZodDiscriminatedUnion<"type", [z$1.ZodObject<{
    type: z$1.ZodLiteral<"user">;
    isSidechain: z$1.ZodOptional<z$1.ZodBoolean>;
    isMeta: z$1.ZodOptional<z$1.ZodBoolean>;
    uuid: z$1.ZodString;
    message: z$1.ZodObject<{
        content: z$1.ZodUnion<[z$1.ZodString, z$1.ZodAny]>;
    }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
        content: z$1.ZodUnion<[z$1.ZodString, z$1.ZodAny]>;
    }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
        content: z$1.ZodUnion<[z$1.ZodString, z$1.ZodAny]>;
    }, z$1.ZodTypeAny, "passthrough">>;
}, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
    type: z$1.ZodLiteral<"user">;
    isSidechain: z$1.ZodOptional<z$1.ZodBoolean>;
    isMeta: z$1.ZodOptional<z$1.ZodBoolean>;
    uuid: z$1.ZodString;
    message: z$1.ZodObject<{
        content: z$1.ZodUnion<[z$1.ZodString, z$1.ZodAny]>;
    }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
        content: z$1.ZodUnion<[z$1.ZodString, z$1.ZodAny]>;
    }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
        content: z$1.ZodUnion<[z$1.ZodString, z$1.ZodAny]>;
    }, z$1.ZodTypeAny, "passthrough">>;
}, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
    type: z$1.ZodLiteral<"user">;
    isSidechain: z$1.ZodOptional<z$1.ZodBoolean>;
    isMeta: z$1.ZodOptional<z$1.ZodBoolean>;
    uuid: z$1.ZodString;
    message: z$1.ZodObject<{
        content: z$1.ZodUnion<[z$1.ZodString, z$1.ZodAny]>;
    }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
        content: z$1.ZodUnion<[z$1.ZodString, z$1.ZodAny]>;
    }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
        content: z$1.ZodUnion<[z$1.ZodString, z$1.ZodAny]>;
    }, z$1.ZodTypeAny, "passthrough">>;
}, z$1.ZodTypeAny, "passthrough">>, z$1.ZodObject<{
    uuid: z$1.ZodString;
    type: z$1.ZodLiteral<"assistant">;
    message: z$1.ZodOptional<z$1.ZodObject<{
        usage: z$1.ZodOptional<z$1.ZodObject<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">>>;
    }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
        usage: z$1.ZodOptional<z$1.ZodObject<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">>>;
    }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
        usage: z$1.ZodOptional<z$1.ZodObject<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">>>;
    }, z$1.ZodTypeAny, "passthrough">>>;
}, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
    uuid: z$1.ZodString;
    type: z$1.ZodLiteral<"assistant">;
    message: z$1.ZodOptional<z$1.ZodObject<{
        usage: z$1.ZodOptional<z$1.ZodObject<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">>>;
    }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
        usage: z$1.ZodOptional<z$1.ZodObject<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">>>;
    }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
        usage: z$1.ZodOptional<z$1.ZodObject<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">>>;
    }, z$1.ZodTypeAny, "passthrough">>>;
}, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
    uuid: z$1.ZodString;
    type: z$1.ZodLiteral<"assistant">;
    message: z$1.ZodOptional<z$1.ZodObject<{
        usage: z$1.ZodOptional<z$1.ZodObject<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">>>;
    }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
        usage: z$1.ZodOptional<z$1.ZodObject<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">>>;
    }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
        usage: z$1.ZodOptional<z$1.ZodObject<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
            input_tokens: z$1.ZodNumber;
            cache_creation_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            cache_read_input_tokens: z$1.ZodOptional<z$1.ZodNumber>;
            output_tokens: z$1.ZodNumber;
            service_tier: z$1.ZodOptional<z$1.ZodString>;
        }, z$1.ZodTypeAny, "passthrough">>>;
    }, z$1.ZodTypeAny, "passthrough">>>;
}, z$1.ZodTypeAny, "passthrough">>, z$1.ZodObject<{
    type: z$1.ZodLiteral<"summary">;
    summary: z$1.ZodString;
    leafUuid: z$1.ZodString;
}, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
    type: z$1.ZodLiteral<"summary">;
    summary: z$1.ZodString;
    leafUuid: z$1.ZodString;
}, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
    type: z$1.ZodLiteral<"summary">;
    summary: z$1.ZodString;
    leafUuid: z$1.ZodString;
}, z$1.ZodTypeAny, "passthrough">>, z$1.ZodObject<{
    type: z$1.ZodLiteral<"system">;
    uuid: z$1.ZodString;
}, "passthrough", z$1.ZodTypeAny, z$1.objectOutputType<{
    type: z$1.ZodLiteral<"system">;
    uuid: z$1.ZodString;
}, z$1.ZodTypeAny, "passthrough">, z$1.objectInputType<{
    type: z$1.ZodLiteral<"system">;
    uuid: z$1.ZodString;
}, z$1.ZodTypeAny, "passthrough">>]>;
type RawJSONLines = z$1.infer<typeof RawJSONLinesSchema>;

/**
 * Permission mode type - includes both Claude and Codex modes
 * Must match MessageMetaSchema.permissionMode enum values
 *
 * Claude modes: default, acceptEdits, bypassPermissions, plan
 * Codex modes: read-only, safe-yolo, yolo
 *
 * When calling Claude SDK, Codex modes are mapped at the SDK boundary:
 * - yolo → bypassPermissions
 * - safe-yolo → default
 * - read-only → default
 */
type PermissionMode = 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan' | 'read-only' | 'safe-yolo' | 'yolo';
/**
 * Usage data type from Claude
 */
type Usage = z$1.infer<typeof UsageSchema>;
/**
 * Session information
 */
type Session = {
    id: string;
    seq: number;
    encryptionKey: Uint8Array;
    encryptionVariant: 'legacy' | 'dataKey';
    metadata: Metadata;
    metadataVersion: number;
    agentState: AgentState | null;
    agentStateVersion: number;
};
/**
 * Machine metadata - static information (rarely changes)
 */
declare const MachineMetadataSchema: z$1.ZodObject<{
    host: z$1.ZodString;
    platform: z$1.ZodString;
    happyCliVersion: z$1.ZodString;
    homeDir: z$1.ZodString;
    happyHomeDir: z$1.ZodString;
    happyLibDir: z$1.ZodString;
}, "strip", z$1.ZodTypeAny, {
    host: string;
    platform: string;
    happyCliVersion: string;
    homeDir: string;
    happyHomeDir: string;
    happyLibDir: string;
}, {
    host: string;
    platform: string;
    happyCliVersion: string;
    homeDir: string;
    happyHomeDir: string;
    happyLibDir: string;
}>;
type MachineMetadata = z$1.infer<typeof MachineMetadataSchema>;
/**
 * Daemon state - dynamic runtime information (frequently updated)
 */
declare const DaemonStateSchema: z$1.ZodObject<{
    status: z$1.ZodUnion<[z$1.ZodEnum<["running", "shutting-down"]>, z$1.ZodString]>;
    pid: z$1.ZodOptional<z$1.ZodNumber>;
    httpPort: z$1.ZodOptional<z$1.ZodNumber>;
    startedAt: z$1.ZodOptional<z$1.ZodNumber>;
    shutdownRequestedAt: z$1.ZodOptional<z$1.ZodNumber>;
    shutdownSource: z$1.ZodOptional<z$1.ZodUnion<[z$1.ZodEnum<["mobile-app", "cli", "os-signal", "unknown"]>, z$1.ZodString]>>;
}, "strip", z$1.ZodTypeAny, {
    status: string;
    pid?: number | undefined;
    httpPort?: number | undefined;
    startedAt?: number | undefined;
    shutdownRequestedAt?: number | undefined;
    shutdownSource?: string | undefined;
}, {
    status: string;
    pid?: number | undefined;
    httpPort?: number | undefined;
    startedAt?: number | undefined;
    shutdownRequestedAt?: number | undefined;
    shutdownSource?: string | undefined;
}>;
type DaemonState = z$1.infer<typeof DaemonStateSchema>;
type Machine = {
    id: string;
    encryptionKey: Uint8Array;
    encryptionVariant: 'legacy' | 'dataKey';
    metadata: MachineMetadata;
    metadataVersion: number;
    daemonState: DaemonState | null;
    daemonStateVersion: number;
};
declare const UserMessageSchema: z$1.ZodObject<{
    role: z$1.ZodLiteral<"user">;
    content: z$1.ZodObject<{
        type: z$1.ZodLiteral<"text">;
        text: z$1.ZodString;
    }, "strip", z$1.ZodTypeAny, {
        type: "text";
        text: string;
    }, {
        type: "text";
        text: string;
    }>;
    localKey: z$1.ZodOptional<z$1.ZodString>;
    meta: z$1.ZodOptional<z$1.ZodObject<{
        sentFrom: z$1.ZodOptional<z$1.ZodString>;
        permissionMode: z$1.ZodOptional<z$1.ZodEnum<["default", "acceptEdits", "bypassPermissions", "plan", "read-only", "safe-yolo", "yolo"]>>;
        model: z$1.ZodOptional<z$1.ZodNullable<z$1.ZodString>>;
        fallbackModel: z$1.ZodOptional<z$1.ZodNullable<z$1.ZodString>>;
        customSystemPrompt: z$1.ZodOptional<z$1.ZodNullable<z$1.ZodString>>;
        appendSystemPrompt: z$1.ZodOptional<z$1.ZodNullable<z$1.ZodString>>;
        allowedTools: z$1.ZodOptional<z$1.ZodNullable<z$1.ZodArray<z$1.ZodString, "many">>>;
        disallowedTools: z$1.ZodOptional<z$1.ZodNullable<z$1.ZodArray<z$1.ZodString, "many">>>;
    }, "strip", z$1.ZodTypeAny, {
        model?: string | null | undefined;
        sentFrom?: string | undefined;
        permissionMode?: "default" | "acceptEdits" | "bypassPermissions" | "plan" | "read-only" | "safe-yolo" | "yolo" | undefined;
        fallbackModel?: string | null | undefined;
        customSystemPrompt?: string | null | undefined;
        appendSystemPrompt?: string | null | undefined;
        allowedTools?: string[] | null | undefined;
        disallowedTools?: string[] | null | undefined;
    }, {
        model?: string | null | undefined;
        sentFrom?: string | undefined;
        permissionMode?: "default" | "acceptEdits" | "bypassPermissions" | "plan" | "read-only" | "safe-yolo" | "yolo" | undefined;
        fallbackModel?: string | null | undefined;
        customSystemPrompt?: string | null | undefined;
        appendSystemPrompt?: string | null | undefined;
        allowedTools?: string[] | null | undefined;
        disallowedTools?: string[] | null | undefined;
    }>>;
}, "strip", z$1.ZodTypeAny, {
    content: {
        type: "text";
        text: string;
    };
    role: "user";
    localKey?: string | undefined;
    meta?: {
        model?: string | null | undefined;
        sentFrom?: string | undefined;
        permissionMode?: "default" | "acceptEdits" | "bypassPermissions" | "plan" | "read-only" | "safe-yolo" | "yolo" | undefined;
        fallbackModel?: string | null | undefined;
        customSystemPrompt?: string | null | undefined;
        appendSystemPrompt?: string | null | undefined;
        allowedTools?: string[] | null | undefined;
        disallowedTools?: string[] | null | undefined;
    } | undefined;
}, {
    content: {
        type: "text";
        text: string;
    };
    role: "user";
    localKey?: string | undefined;
    meta?: {
        model?: string | null | undefined;
        sentFrom?: string | undefined;
        permissionMode?: "default" | "acceptEdits" | "bypassPermissions" | "plan" | "read-only" | "safe-yolo" | "yolo" | undefined;
        fallbackModel?: string | null | undefined;
        customSystemPrompt?: string | null | undefined;
        appendSystemPrompt?: string | null | undefined;
        allowedTools?: string[] | null | undefined;
        disallowedTools?: string[] | null | undefined;
    } | undefined;
}>;
type UserMessage = z$1.infer<typeof UserMessageSchema>;
type Metadata = {
    path: string;
    host: string;
    version?: string;
    name?: string;
    os?: string;
    summary?: {
        text: string;
        updatedAt: number;
    };
    machineId?: string;
    claudeSessionId?: string;
    tools?: string[];
    slashCommands?: string[];
    homeDir: string;
    happyHomeDir: string;
    happyLibDir: string;
    happyToolsDir: string;
    startedFromDaemon?: boolean;
    hostPid?: number;
    startedBy?: 'daemon' | 'terminal';
    lifecycleState?: 'running' | 'archiveRequested' | 'archived' | string;
    lifecycleStateSince?: number;
    archivedBy?: string;
    archiveReason?: string;
    flavor?: string;
};
type AgentState = {
    controlledByUser?: boolean | null | undefined;
    requests?: {
        [id: string]: {
            tool: string;
            arguments: any;
            createdAt: number;
        };
    };
    completedRequests?: {
        [id: string]: {
            tool: string;
            arguments: any;
            createdAt: number;
            completedAt: number;
            status: 'canceled' | 'denied' | 'approved';
            reason?: string;
            mode?: PermissionMode;
            decision?: 'approved' | 'approved_for_session' | 'denied' | 'abort';
            allowTools?: string[];
        };
    };
};

/**
 * Common RPC types and interfaces for both session and machine clients
 */
/**
 * Generic RPC handler function type
 * @template TRequest - The request data type
 * @template TResponse - The response data type
 */
type RpcHandler<TRequest = any, TResponse = any> = (data: TRequest) => TResponse | Promise<TResponse>;
/**
 * RPC request data from server
 */
interface RpcRequest {
    method: string;
    params: string;
}
/**
 * Configuration for RPC handler manager
 */
interface RpcHandlerConfig {
    scopePrefix: string;
    encryptionKey: Uint8Array;
    encryptionVariant: 'legacy' | 'dataKey';
    logger?: (message: string, data?: any) => void;
}

/**
 * Generic RPC handler manager for session and machine clients
 * Manages RPC method registration, encryption/decryption, and handler execution
 */

declare class RpcHandlerManager {
    private handlers;
    private readonly scopePrefix;
    private readonly encryptionKey;
    private readonly encryptionVariant;
    private readonly logger;
    private socket;
    constructor(config: RpcHandlerConfig);
    /**
     * Register an RPC handler for a specific method
     * @param method - The method name (without prefix)
     * @param handler - The handler function
     */
    registerHandler<TRequest = any, TResponse = any>(method: string, handler: RpcHandler<TRequest, TResponse>): void;
    /**
     * Handle an incoming RPC request
     * @param request - The RPC request data
     * @param callback - The response callback
     */
    handleRequest(request: RpcRequest): Promise<any>;
    onSocketConnect(socket: Socket): void;
    onSocketDisconnect(): void;
    /**
     * Get the number of registered handlers
     */
    getHandlerCount(): number;
    /**
     * Check if a handler is registered
     * @param method - The method name (without prefix)
     */
    hasHandler(method: string): boolean;
    /**
     * Clear all handlers
     */
    clearHandlers(): void;
    /**
     * Get the prefixed method name
     * @param method - The method name
     */
    private getPrefixedMethod;
}

/**
 * ACP (Agent Communication Protocol) message data types.
 * This is the unified format for all agent messages - CLI adapts each provider's format to ACP.
 */
type ACPMessageData = {
    type: 'message';
    message: string;
} | {
    type: 'reasoning';
    message: string;
} | {
    type: 'thinking';
    text: string;
} | {
    type: 'tool-call';
    callId: string;
    name: string;
    input: unknown;
    id: string;
} | {
    type: 'tool-result';
    callId: string;
    output: unknown;
    id: string;
    isError?: boolean;
} | {
    type: 'file-edit';
    description: string;
    filePath: string;
    diff?: string;
    oldContent?: string;
    newContent?: string;
    id: string;
} | {
    type: 'terminal-output';
    data: string;
    callId: string;
} | {
    type: 'task_started';
    id: string;
} | {
    type: 'task_complete';
    id: string;
} | {
    type: 'turn_aborted';
    id: string;
} | {
    type: 'permission-request';
    permissionId: string;
    toolName: string;
    description: string;
    options?: unknown;
} | {
    type: 'token_count';
    [key: string]: unknown;
};
declare class ApiSessionClient extends EventEmitter {
    private readonly token;
    readonly sessionId: string;
    private metadata;
    private metadataVersion;
    private agentState;
    private agentStateVersion;
    private socket;
    private pendingMessages;
    private pendingMessageCallback;
    readonly rpcHandlerManager: RpcHandlerManager;
    private agentStateLock;
    private metadataLock;
    private encryptionKey;
    private encryptionVariant;
    constructor(token: string, session: Session);
    onUserMessage(callback: (data: UserMessage) => void): void;
    /**
     * Send message to session
     * @param body - Message body (can be MessageContent or raw content for agent messages)
     */
    sendClaudeSessionMessage(body: RawJSONLines): void;
    sendCodexMessage(body: any): void;
    /**
     * Send a generic agent message to the session using ACP (Agent Communication Protocol) format.
     * Works for any agent type (Gemini, Codex, Claude, etc.) - CLI normalizes to unified ACP format.
     *
     * @param provider - The agent provider sending the message (e.g., 'gemini', 'codex', 'claude')
     * @param body - The message payload (type: 'message' | 'reasoning' | 'tool-call' | 'tool-result')
     */
    sendAgentMessage(provider: 'gemini' | 'codex' | 'claude' | 'opencode', body: ACPMessageData): void;
    sendSessionEvent(event: {
        type: 'switch';
        mode: 'local' | 'remote';
    } | {
        type: 'message';
        message: string;
    } | {
        type: 'permission-mode-changed';
        mode: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
    } | {
        type: 'ready';
    }, id?: string): void;
    /**
     * Send a ping message to keep the connection alive
     */
    keepAlive(thinking: boolean, mode: 'local' | 'remote'): void;
    /**
     * Send session death message
     */
    sendSessionDeath(): void;
    /**
     * Send usage data to the server
     */
    sendUsageData(usage: Usage): void;
    /**
     * Send cursor-agent usage data to the server.
     * Accepts the normalized cursor usage format (camelCase fields)
     * and converts to the usage-report shape the App expects.
     */
    sendCursorUsageData(fields: {
        inputTokens?: number;
        outputTokens?: number;
        cacheReadInputTokens?: number;
        cacheCreationInputTokens?: number;
        totalTokens?: number;
        contextSize?: number;
        costUsd?: number;
        durationMs?: number;
    }): void;
    /**
     * Update session metadata
     * @param handler - Handler function that returns the updated metadata
     */
    updateMetadata(handler: (metadata: Metadata) => Metadata): void;
    /**
     * Update session agent state
     * @param handler - Handler function that returns the updated agent state
     */
    updateAgentState(handler: (metadata: AgentState) => AgentState): void;
    /**
     * Wait for socket buffer to flush
     */
    flush(): Promise<void>;
    /**
     * Send a session protocol envelope to the server (cursor-agent support).
     * Wraps the envelope in the format expected by the App and emits via WebSocket.
     */
    sendSessionProtocolMessage(envelope: {
        id?: string;
        role: string;
        ev: Record<string, unknown>;
        meta?: Record<string, unknown>;
    }): void;
    /**
     * Send a turn-end / turn-start lifecycle envelope.
     * Same shape as sendSessionProtocolMessage so the App's timer stops correctly.
     */
    sendSessionLifecycleEnvelope(envelope: {
        id?: string;
        role: string;
        ev: Record<string, unknown>;
        meta?: Record<string, unknown>;
    }): void;
    close(): Promise<void>;
}

interface SpawnSessionOptions {
    machineId?: string;
    directory: string;
    sessionId?: string;
    approvedNewDirectoryCreation?: boolean;
    agent?: 'claude' | 'codex' | 'gemini';
    token?: string;
    environmentVariables?: {
        ANTHROPIC_BASE_URL?: string;
        ANTHROPIC_AUTH_TOKEN?: string;
        ANTHROPIC_MODEL?: string;
        TMUX_SESSION_NAME?: string;
        TMUX_TMPDIR?: string;
    };
}
type SpawnSessionResult = {
    type: 'success';
    sessionId: string;
} | {
    type: 'requestToApproveDirectoryCreation';
    directory: string;
} | {
    type: 'error';
    errorMessage: string;
};

/**
 * WebSocket client for machine/daemon communication with Happy server
 * Similar to ApiSessionClient but for machine-scoped connections
 */

type MachineRpcHandlers = {
    spawnSession: (options: SpawnSessionOptions) => Promise<SpawnSessionResult>;
    stopSession: (sessionId: string) => boolean;
    requestShutdown: () => void;
};
declare class ApiMachineClient {
    private token;
    private machine;
    private socket;
    private keepAliveInterval;
    private rpcHandlerManager;
    constructor(token: string, machine: Machine);
    setRPCHandlers({ spawnSession, stopSession, requestShutdown }: MachineRpcHandlers): void;
    /**
     * Update machine metadata
     * Currently unused, changes from the mobile client are more likely
     * for example to set a custom name.
     */
    updateMachineMetadata(handler: (metadata: MachineMetadata | null) => MachineMetadata): Promise<void>;
    /**
     * Update daemon state (runtime info) - similar to session updateAgentState
     * Simplified without lock - relies on backoff for retry
     */
    updateDaemonState(handler: (state: DaemonState | null) => DaemonState): Promise<void>;
    connect(): void;
    private startKeepAlive;
    private stopKeepAlive;
    shutdown(): void;
}

interface PushToken {
    id: string;
    token: string;
    createdAt: number;
    updatedAt: number;
}
declare class PushNotificationClient {
    private readonly token;
    private readonly baseUrl;
    private readonly expo;
    constructor(token: string, baseUrl?: string);
    /**
     * Fetch all push tokens for the authenticated user
     */
    fetchPushTokens(): Promise<PushToken[]>;
    /**
     * Send push notification via Expo Push API with retry
     * @param messages - Array of push messages to send
     */
    sendPushNotifications(messages: ExpoPushMessage[]): Promise<void>;
    /**
     * Send a push notification to all registered devices for the user
     * @param title - Notification title
     * @param body - Notification body
     * @param data - Additional data to send with the notification
     */
    sendToAllDevices(title: string, body: string, data?: Record<string, any>): void;
}

/**
 * Minimal persistence functions for happy CLI
 *
 * Handles settings and private key storage in ~/.happy/ or local .happy/
 */

declare const AIBackendProfileSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    anthropicConfig: z.ZodOptional<z.ZodObject<{
        baseUrl: z.ZodOptional<z.ZodString>;
        authToken: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        baseUrl?: string | undefined;
        authToken?: string | undefined;
        model?: string | undefined;
    }, {
        baseUrl?: string | undefined;
        authToken?: string | undefined;
        model?: string | undefined;
    }>>;
    openaiConfig: z.ZodOptional<z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        baseUrl: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        baseUrl?: string | undefined;
        model?: string | undefined;
        apiKey?: string | undefined;
    }, {
        baseUrl?: string | undefined;
        model?: string | undefined;
        apiKey?: string | undefined;
    }>>;
    azureOpenAIConfig: z.ZodOptional<z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        endpoint: z.ZodOptional<z.ZodString>;
        apiVersion: z.ZodOptional<z.ZodString>;
        deploymentName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        apiKey?: string | undefined;
        endpoint?: string | undefined;
        apiVersion?: string | undefined;
        deploymentName?: string | undefined;
    }, {
        apiKey?: string | undefined;
        endpoint?: string | undefined;
        apiVersion?: string | undefined;
        deploymentName?: string | undefined;
    }>>;
    togetherAIConfig: z.ZodOptional<z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        model?: string | undefined;
        apiKey?: string | undefined;
    }, {
        model?: string | undefined;
        apiKey?: string | undefined;
    }>>;
    tmuxConfig: z.ZodOptional<z.ZodObject<{
        sessionName: z.ZodOptional<z.ZodString>;
        tmpDir: z.ZodOptional<z.ZodString>;
        updateEnvironment: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        sessionName?: string | undefined;
        tmpDir?: string | undefined;
        updateEnvironment?: boolean | undefined;
    }, {
        sessionName?: string | undefined;
        tmpDir?: string | undefined;
        updateEnvironment?: boolean | undefined;
    }>>;
    environmentVariables: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        value: string;
    }, {
        name: string;
        value: string;
    }>, "many">>;
    defaultSessionType: z.ZodOptional<z.ZodEnum<["simple", "worktree"]>>;
    defaultPermissionMode: z.ZodOptional<z.ZodEnum<["default", "acceptEdits", "bypassPermissions", "plan", "read-only", "safe-yolo", "yolo"]>>;
    defaultModelMode: z.ZodOptional<z.ZodString>;
    compatibility: z.ZodDefault<z.ZodObject<{
        claude: z.ZodDefault<z.ZodBoolean>;
        codex: z.ZodDefault<z.ZodBoolean>;
        gemini: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        claude: boolean;
        codex: boolean;
        gemini: boolean;
    }, {
        claude?: boolean | undefined;
        codex?: boolean | undefined;
        gemini?: boolean | undefined;
    }>>;
    isBuiltIn: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDefault<z.ZodNumber>;
    updatedAt: z.ZodDefault<z.ZodNumber>;
    version: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    environmentVariables: {
        name: string;
        value: string;
    }[];
    compatibility: {
        claude: boolean;
        codex: boolean;
        gemini: boolean;
    };
    isBuiltIn: boolean;
    createdAt: number;
    updatedAt: number;
    version: string;
    description?: string | undefined;
    anthropicConfig?: {
        baseUrl?: string | undefined;
        authToken?: string | undefined;
        model?: string | undefined;
    } | undefined;
    openaiConfig?: {
        baseUrl?: string | undefined;
        model?: string | undefined;
        apiKey?: string | undefined;
    } | undefined;
    azureOpenAIConfig?: {
        apiKey?: string | undefined;
        endpoint?: string | undefined;
        apiVersion?: string | undefined;
        deploymentName?: string | undefined;
    } | undefined;
    togetherAIConfig?: {
        model?: string | undefined;
        apiKey?: string | undefined;
    } | undefined;
    tmuxConfig?: {
        sessionName?: string | undefined;
        tmpDir?: string | undefined;
        updateEnvironment?: boolean | undefined;
    } | undefined;
    defaultSessionType?: "simple" | "worktree" | undefined;
    defaultPermissionMode?: "default" | "acceptEdits" | "bypassPermissions" | "plan" | "read-only" | "safe-yolo" | "yolo" | undefined;
    defaultModelMode?: string | undefined;
}, {
    id: string;
    name: string;
    description?: string | undefined;
    anthropicConfig?: {
        baseUrl?: string | undefined;
        authToken?: string | undefined;
        model?: string | undefined;
    } | undefined;
    openaiConfig?: {
        baseUrl?: string | undefined;
        model?: string | undefined;
        apiKey?: string | undefined;
    } | undefined;
    azureOpenAIConfig?: {
        apiKey?: string | undefined;
        endpoint?: string | undefined;
        apiVersion?: string | undefined;
        deploymentName?: string | undefined;
    } | undefined;
    togetherAIConfig?: {
        model?: string | undefined;
        apiKey?: string | undefined;
    } | undefined;
    tmuxConfig?: {
        sessionName?: string | undefined;
        tmpDir?: string | undefined;
        updateEnvironment?: boolean | undefined;
    } | undefined;
    environmentVariables?: {
        name: string;
        value: string;
    }[] | undefined;
    defaultSessionType?: "simple" | "worktree" | undefined;
    defaultPermissionMode?: "default" | "acceptEdits" | "bypassPermissions" | "plan" | "read-only" | "safe-yolo" | "yolo" | undefined;
    defaultModelMode?: string | undefined;
    compatibility?: {
        claude?: boolean | undefined;
        codex?: boolean | undefined;
        gemini?: boolean | undefined;
    } | undefined;
    isBuiltIn?: boolean | undefined;
    createdAt?: number | undefined;
    updatedAt?: number | undefined;
    version?: string | undefined;
}>;
type AIBackendProfile = z.infer<typeof AIBackendProfileSchema>;
interface Settings {
    schemaVersion: number;
    onboardingCompleted: boolean;
    machineId?: string;
    machineIdConfirmedByServer?: boolean;
    daemonAutoStartWhenRunningHappy?: boolean;
    activeProfileId?: string;
    profiles: AIBackendProfile[];
    localEnvironmentVariables: Record<string, Record<string, string>>;
}
declare function readSettings(): Promise<Settings>;
type Credentials = {
    token: string;
    encryption: {
        type: 'legacy';
        secret: Uint8Array;
    } | {
        type: 'dataKey';
        publicKey: Uint8Array;
        machineKey: Uint8Array;
    };
};
declare function readCredentials(): Promise<Credentials | null>;

declare class ApiClient {
    static create(credential: Credentials): Promise<ApiClient>;
    private readonly credential;
    private readonly pushClient;
    private constructor();
    /**
     * Create a new session or load existing one with the given tag
     */
    getOrCreateSession(opts: {
        tag: string;
        metadata: Metadata;
        state: AgentState | null;
    }): Promise<Session | null>;
    /**
     * Register or update machine with the server
     * Returns the current machine state from the server with decrypted metadata and daemonState
     */
    getOrCreateMachine(opts: {
        machineId: string;
        metadata: MachineMetadata;
        daemonState?: DaemonState;
    }): Promise<Machine>;
    sessionSyncClient(session: Session): ApiSessionClient;
    machineSyncClient(machine: Machine): ApiMachineClient;
    push(): PushNotificationClient;
    /**
     * Register a vendor API token with the server
     * The token is sent as a JSON string - server handles encryption
     */
    registerVendorToken(vendor: 'openai' | 'anthropic' | 'gemini', apiKey: any): Promise<void>;
    /**
     * Get vendor API token from the server
     * Returns the token if it exists, null otherwise
     */
    getVendorToken(vendor: 'openai' | 'anthropic' | 'gemini'): Promise<any | null>;
}

/**
 * Design decisions:
 * - Logging should be done only through file for debugging, otherwise we might disturb the claude session when in interactive mode
 * - Use info for logs that are useful to the user - this is our UI
 * - File output location: ~/.handy/logs/<date time in local timezone>.log
 */
declare class Logger {
    readonly logFilePath: string;
    private dangerouslyUnencryptedServerLoggingUrl;
    constructor(logFilePath?: string);
    localTimezoneTimestamp(): string;
    debug(message: string, ...args: unknown[]): void;
    debugLargeJson(message: string, object: unknown, maxStringLength?: number, maxArrayLength?: number): void;
    info(message: string, ...args: unknown[]): void;
    infoDeveloper(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    getLogPath(): string;
    private logToConsole;
    private sendToRemoteServer;
    private logToFile;
}
declare let logger: Logger;

/**
 * Global configuration for happy CLI
 *
 * Centralizes all configuration including environment variables and paths
 * Environment files should be loaded using Node's --env-file flag
 */
declare class Configuration {
    readonly serverUrl: string;
    readonly webappUrl: string;
    readonly isDaemonProcess: boolean;
    readonly happyHomeDir: string;
    readonly logsDir: string;
    readonly settingsFile: string;
    readonly privateKeyFile: string;
    readonly daemonStateFile: string;
    readonly daemonLockFile: string;
    readonly currentCliVersion: string;
    readonly isExperimentalEnabled: boolean;
    readonly disableCaffeinate: boolean;
    constructor();
}
declare const configuration: Configuration;

/**
 * Session Metadata Factory
 *
 * Creates session state and metadata objects for all backends (Claude, Codex, Gemini).
 * This follows DRY principles by providing a single implementation for all backends.
 *
 * @module createSessionMetadata
 */

/**
 * Backend flavor identifier for session metadata.
 */
type BackendFlavor = 'claude' | 'codex' | 'gemini';
/**
 * Options for creating session metadata.
 */
interface CreateSessionMetadataOptions {
    /** Backend flavor (claude, codex, gemini) */
    flavor: BackendFlavor;
    /** Machine ID for server identification */
    machineId: string;
    /** How the session was started */
    startedBy?: 'daemon' | 'terminal';
}
/**
 * Result containing both state and metadata for session creation.
 */
interface SessionMetadataResult {
    /** Agent state for session */
    state: AgentState;
    /** Session metadata */
    metadata: Metadata;
}
/**
 * Creates session state and metadata for backend agents.
 *
 * This utility consolidates the common session metadata creation logic used by
 * Codex and Gemini backends, ensuring consistency across all backend implementations.
 *
 * @param opts - Options specifying flavor, machineId, and startedBy
 * @returns Object containing state and metadata for session creation
 *
 * @example
 * ```typescript
 * const { state, metadata } = createSessionMetadata({
 *     flavor: 'gemini',
 *     machineId: settings.machineId,
 *     startedBy: opts.startedBy
 * });
 *
 * const response = await api.getOrCreateSession({ tag: sessionTag, metadata, state });
 * ```
 */
declare function createSessionMetadata(opts: CreateSessionMetadataOptions): SessionMetadataResult;

declare const initialMachineMetadata: MachineMetadata;

interface QueueItem<T> {
    message: string;
    mode: T;
    modeHash: string;
    isolate?: boolean;
}
/**
 * A mode-aware message queue that stores messages with their modes.
 * Returns consistent batches of messages with the same mode.
 */
declare class MessageQueue2<T> {
    queue: QueueItem<T>[];
    private waiter;
    private closed;
    private onMessageHandler;
    modeHasher: (mode: T) => string;
    constructor(modeHasher: (mode: T) => string, onMessageHandler?: ((message: string, mode: T) => void) | null);
    /**
     * Set a handler that will be called when a message arrives
     */
    setOnMessage(handler: ((message: string, mode: T) => void) | null): void;
    /**
     * Push a message to the queue with a mode.
     */
    push(message: string, mode: T): void;
    /**
     * Push a message immediately without batching delay.
     * Does not clear the queue or enforce isolation.
     */
    pushImmediate(message: string, mode: T): void;
    /**
     * Push a message that must be processed in complete isolation.
     * Clears any pending messages and ensures this message is never batched with others.
     * Used for special commands that require dedicated processing.
     */
    pushIsolateAndClear(message: string, mode: T): void;
    /**
     * Push a message to the beginning of the queue with a mode.
     */
    unshift(message: string, mode: T): void;
    /**
     * Reset the queue - clears all messages and resets to empty state
     */
    reset(): void;
    /**
     * Close the queue - no more messages can be pushed
     */
    close(): void;
    /**
     * Check if the queue is closed
     */
    isClosed(): boolean;
    /**
     * Get the current queue size
     */
    size(): number;
    /**
     * Wait for messages and return all messages with the same mode as a single string
     * Returns { message: string, mode: T } or null if aborted/closed
     */
    waitForMessagesAndGetAsString(abortSignal?: AbortSignal): Promise<{
        message: string;
        mode: T;
        isolate: boolean;
        hash: string;
    } | null>;
    /**
     * Collect a batch of messages with the same mode, respecting isolation requirements
     */
    private collectBatch;
    /**
     * Wait for messages to arrive
     */
    private waitForMessages;
}

/**
 * Deterministic JSON utilities for consistent object serialization and hashing
 *
 * Provides stable JSON stringification with sorted keys and consistent handling
 * of edge cases like undefined, circular references, and special types.
 *
 * Used for:
 * - Consistent encryption/decryption in API communication
 * - Reliable message deduplication in session scanning
 * - Stable object comparison for optimistic concurrency
 */
/**
 * Options for deterministic JSON stringification
 */
interface DeterministicJsonOptions {
    /** How to handle undefined values */
    undefinedBehavior?: 'omit' | 'null' | 'throw';
    /** Whether to sort array contents (default: false) */
    sortArrays?: boolean;
    /** Custom replacer function */
    replacer?: (key: string, value: any) => any;
    /** Whether to include Symbol properties (default: false) */
    includeSymbols?: boolean;
}
/**
 * Calculate SHA-256 hash of an object using deterministic JSON stringification
 *
 * @param obj Object to hash
 * @param options Stringification options
 * @param encoding Output encoding (default: 'hex')
 * @returns Hash string
 */
declare function hashObject(obj: any, options?: DeterministicJsonOptions, encoding?: 'hex' | 'base64' | 'base64url'): string;

/**
 * Happy MCP server
 * Provides Happy CLI specific tools including chat session title management
 */

interface StartHappyServerOptions {
    onA2aMessage?: (message: UserMessage) => Promise<void> | void;
    useDaemonA2ARoute?: boolean;
}
declare function startHappyServer(client: ApiSessionClient, options?: StartHappyServerOptions): Promise<{
    url: string;
    toolNames: string[];
    stop: () => void;
}>;

/**
 * HTTP client helpers for daemon communication
 * Used by CLI commands to interact with running daemon
 */

declare function notifyDaemonSessionStarted(sessionId: string, metadata: Metadata): Promise<{
    error?: string;
} | any>;

declare function registerKillSessionHandler(rpcHandlerManager: RpcHandlerManager, killThisHappy: () => Promise<void>): void;

/**
 * Stop the caffeinate process
 */
declare function stopCaffeinate(): Promise<void>;

/**
 * Offline reconnection utility for graceful server disconnection handling.
 *
 * Provides a backend-agnostic reconnection mechanism with exponential backoff
 * that works for both Claude and Codex (and future backends).
 *
 * ## Requirements Satisfied
 * - REQ-1: Claude/Codex keeps working when server unreachable
 * - REQ-3: Exponential backoff reconnection attempts
 * - REQ-4: Hot reconnection without PTY exit
 * - REQ-7: Notify user when server becomes available
 * - REQ-8: DRY - single shared implementation for all backends
 * - REQ-9: Backend-transparent design via generic TSession type
 *
 * ## Key Features
 * - Exponential backoff with jitter (prevents thundering herd)
 * - Auth error detection (stops retrying on 401)
 * - Cancellable for clean process cleanup (RAII pattern)
 * - Generic session type for backend transparency
 * - Dependency injection for health check (testability)
 *
 * ## State Machine
 * ```
 * [IDLE] --initialDelay--> [ATTEMPTING]
 *                              |
 *           +------------------+------------------+
 *           |                  |                  |
 *           v                  v                  v
 *     [RECONNECTED]    [RETRY_PENDING]     [AUTH_FAILED]
 *        (final)             |                (final)
 *                            |
 *                      --backoff-->
 *                            |
 *                            v
 *                      [ATTEMPTING]
 *
 * cancel() from any state --> [CANCELLED] (final)
 * ```
 *
 * ## Edge Cases Handled
 * - Auth errors (401): Stop retrying, notify user to re-authenticate
 * - Server 4xx: Treated as "server is up" (validateStatus < 500)
 * - Server 5xx: Retry with backoff (server error, may recover)
 * - Cancel during async: `cancelled` flag checked before state changes
 * - onReconnected throws: Treated as connection error, retry with backoff
 * - Multiple success attempts: `reconnected` flag prevents duplicates
 *
 * @module serverConnectionErrors
 */
/**
 * Configuration for offline reconnection behavior.
 * Uses dependency injection for testability.
 */
interface OfflineReconnectionConfig<TSession> {
    /** Server URL to health-check against (e.g., 'https://api.happy-servers.com') */
    serverUrl: string;
    /**
     * Called when server becomes available - should create and return session.
     * If this throws, it's treated as a connection error and retried.
     */
    onReconnected: () => Promise<TSession>;
    /** Called to notify user of status changes (success or auth failure) */
    onNotify: (message: string) => void;
    /** Optional cleanup callback invoked when cancel() is called */
    onCleanup?: () => void;
    /**
     * Optional: override the health check function.
     * Injected for testing. Default uses axios.get to /v1/sessions.
     * Should throw on failure, resolve on success.
     */
    healthCheck?: () => Promise<void>;
    /**
     * Optional: initial delay in ms before first attempt.
     * Default: 5000ms. Set to small value in tests.
     */
    initialDelayMs?: number;
}
/**
 * Handle returned by startOfflineReconnection for controlling the reconnection process.
 */
interface OfflineReconnectionHandle<TSession> {
    /**
     * Cancel reconnection attempts and clean up timers.
     * Safe to call multiple times. Invokes onCleanup if provided.
     */
    cancel: () => void;
    /** Get the session if reconnection succeeded, null otherwise */
    getSession: () => TSession | null;
    /** Check if reconnection has succeeded (idempotent) */
    isReconnected: () => boolean;
}
/**
 * Starts background reconnection with exponential backoff.
 * Backend-agnostic: works for Claude, Codex, or any future backend.
 *
 * ## Retry Behavior
 * - **Retries are UNLIMITED** - will keep trying for hours/days/weeks
 * - Only auth failures (401) stop retrying
 * - Sessions can stay open indefinitely; server outages are expected
 *
 * ## Backoff Timing (via exponentialBackoffDelay from time.ts)
 * - Attempt 1: ~5 seconds (min delay with jitter)
 * - Attempt 5: ~30 seconds
 * - Attempt 10+: ~60 seconds (delay caps here, retries continue forever)
 * - Random jitter prevents thundering herd problem
 *
 * ## Usage Example
 * ```typescript
 * const handle = startOfflineReconnection({
 *     serverUrl: 'https://api.example.com',
 *     onReconnected: async () => {
 *         const session = await createSession();
 *         return session;
 *     },
 *     onNotify: console.log
 * });
 *
 * // Later, on cleanup:
 * handle.cancel();
 * ```
 *
 * @param config - Reconnection configuration
 * @returns Handle to control reconnection and access session
 */
declare function startOfflineReconnection<TSession>(config: OfflineReconnectionConfig<TSession>): OfflineReconnectionHandle<TSession>;
/** Failure context for accumulating multiple failures into one warning */
type OfflineFailure = {
    operation: string;
    caller?: string;
    errorCode?: string;
    url?: string;
    details?: string[];
};
/**
 * Coordinates offline warnings across multiple API callers.
 *
 * When server goes down, session + machine API calls both fail. This class
 * consolidates those into one clear message with all failure details, then
 * suppresses duplicates until recovery. Call recover() when back online to
 * re-enable warnings for future disconnections.
 */
declare class OfflineState {
    private state;
    private failures;
    private backend;
    /** Report failure - accumulates context, prints once on first offline transition */
    fail(failure: OfflineFailure): void;
    /** Reset on reconnection */
    recover(): void;
    /** Set backend name before API calls */
    setBackend(name: string): void;
    /** Check current state */
    isOffline(): boolean;
    /** Reset for testing - clears all state */
    reset(): void;
    private print;
}
/**
 * Shared singleton - call setBackend() before API calls, fail() on errors,
 * recover() on successful reconnection.
 */
declare const connectionState: OfflineState;

/**
 * Offline Reconnection Setup
 *
 * Handles the common pattern of creating an offline session stub with
 * automatic background reconnection for all backends (Codex, Gemini).
 *
 * @module setupOfflineReconnection
 */

/**
 * Options for setting up offline reconnection.
 */
interface SetupOfflineReconnectionOptions {
    /** API client instance */
    api: ApiClient;
    /** Unique session tag */
    sessionTag: string;
    /** Session metadata */
    metadata: Metadata;
    /** Agent state */
    state: AgentState;
    /** Initial API response (null if server unreachable) */
    response: Session | null;
    /**
     * Callback invoked when session is swapped after reconnection.
     * Use this to update the session reference in the calling code.
     */
    onSessionSwap: (newSession: ApiSessionClient) => void;
}
/**
 * Result from setupOfflineReconnection.
 */
interface SetupOfflineReconnectionResult {
    /** The session client (stub if offline, real if connected) */
    session: ApiSessionClient;
    /** Handle to the reconnection process, null if connected */
    reconnectionHandle: ReturnType<typeof startOfflineReconnection<ApiSessionClient>> | null;
    /** Whether we're in offline mode */
    isOffline: boolean;
}
/**
 * Sets up offline session handling with automatic background reconnection.
 *
 * If the server is unreachable (response is null), this creates an offline
 * session stub and starts background reconnection. When reconnection succeeds,
 * the `onSessionSwap` callback is invoked with the new real session.
 *
 * @param opts - Options including api, sessionTag, metadata, state, response, onSessionSwap
 * @returns Result with session, reconnectionHandle, and isOffline flag
 *
 * @example
 * ```typescript
 * let session: ApiSessionClient;
 *
 * const result = setupOfflineReconnection({
 *     api,
 *     sessionTag,
 *     metadata,
 *     state,
 *     response,
 *     onSessionSwap: (newSession) => { session = newSession; }
 * });
 *
 * session = result.session;
 * const reconnectionHandle = result.reconnectionHandle;
 * ```
 */
declare function setupOfflineReconnection(opts: SetupOfflineReconnectionOptions): SetupOfflineReconnectionResult;

export { ApiClient, ApiSessionClient, MessageQueue2, RawJSONLinesSchema, configuration, connectionState, createSessionMetadata, hashObject, initialMachineMetadata, logger, notifyDaemonSessionStarted, readCredentials, readSettings, registerKillSessionHandler, setupOfflineReconnection, startHappyServer, stopCaffeinate };
export type { BackendFlavor, CreateSessionMetadataOptions, Credentials, PermissionMode, RawJSONLines, SessionMetadataResult, SetupOfflineReconnectionOptions, SetupOfflineReconnectionResult, UserMessage };
