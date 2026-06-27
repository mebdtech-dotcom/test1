// Six out-of-wire test doubles (Doc-8B §7, R12 hermeticity) — the ONLY mocked boundaries:
// Storage · Realtime · Email (Resend) · Analytics (PostHog) · Jobs (Inngest dispatch) · AI.
//
// Domain / data / contract paths are NEVER mocked (Doc-8 Band I — observe-never-author):
// they become real as their owning modules land. These are typed in-memory seams the harness
// PROVIDES so suites never touch a live external service. Real adapters replace them per module.

export interface StorageDouble {
  put(key: string, value: Uint8Array): Promise<void>;
  get(key: string): Promise<Uint8Array | null>;
}

export interface RealtimeDouble {
  publish(channel: string, event: unknown): Promise<void>;
  readonly published: ReadonlyArray<{ channel: string; event: unknown }>;
}

export interface EmailDouble {
  send(message: { to: string; subject: string }): Promise<void>;
  readonly sent: ReadonlyArray<{ to: string; subject: string }>;
}

export interface AnalyticsDouble {
  capture(event: string, props?: Record<string, unknown>): void;
  readonly events: ReadonlyArray<{ event: string; props?: Record<string, unknown> }>;
}

export interface JobsDouble {
  dispatch(name: string, data?: unknown): Promise<void>;
  readonly dispatched: ReadonlyArray<{ name: string; data?: unknown }>;
}

export interface AiDouble {
  // "AI suggests; modules decide" (Invariant #12): advisory text only, never authoritative.
  suggest(prompt: string): Promise<string>;
}

export interface MockDoubles {
  storage: StorageDouble;
  realtime: RealtimeDouble;
  email: EmailDouble;
  analytics: AnalyticsDouble;
  jobs: JobsDouble;
  ai: AiDouble;
}

function createStorageDouble(): StorageDouble {
  const store = new Map<string, Uint8Array>();
  return {
    async put(key, value) {
      store.set(key, value);
    },
    async get(key) {
      return store.get(key) ?? null;
    },
  };
}

function createRealtimeDouble(): RealtimeDouble {
  const published: Array<{ channel: string; event: unknown }> = [];
  return {
    published,
    async publish(channel, event) {
      published.push({ channel, event });
    },
  };
}

function createEmailDouble(): EmailDouble {
  const sent: Array<{ to: string; subject: string }> = [];
  return {
    sent,
    async send(message) {
      sent.push(message);
    },
  };
}

function createAnalyticsDouble(): AnalyticsDouble {
  const events: Array<{ event: string; props?: Record<string, unknown> }> = [];
  return {
    events,
    capture(event, props) {
      events.push({ event, props });
    },
  };
}

function createJobsDouble(): JobsDouble {
  const dispatched: Array<{ name: string; data?: unknown }> = [];
  return {
    dispatched,
    async dispatch(name, data) {
      dispatched.push({ name, data });
    },
  };
}

function createAiDouble(): AiDouble {
  return {
    async suggest(prompt) {
      return `[mock-suggestion:${prompt}]`;
    },
  };
}

// Fresh, isolated doubles per call — no shared state across tests (hermeticity).
export function createMockDoubles(): MockDoubles {
  return {
    storage: createStorageDouble(),
    realtime: createRealtimeDouble(),
    email: createEmailDouble(),
    analytics: createAnalyticsDouble(),
    jobs: createJobsDouble(),
    ai: createAiDouble(),
  };
}
