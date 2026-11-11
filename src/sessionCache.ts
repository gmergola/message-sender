import { CACHE_TTL_MS } from "./config.ts";
import { appendMessage, loadSession, type SentMessage } from "./store.ts";

interface Entry {
  messages: SentMessage[];
  lastAccess: number;
}

export class SessionCache {
  private entries = new Map<string, Entry>();

  private ttlMs: number;
  private now: () => number;
  private load: (id: string) => SentMessage[];
  private save: (id: string, m: SentMessage) => void;

  constructor(
    ttlMs = CACHE_TTL_MS,
    now: () => number = Date.now,
    load: (id: string) => SentMessage[] = loadSession,
    save: (id: string, m: SentMessage) => void = appendMessage,
  ) {
    this.ttlMs = ttlMs;
    this.now = now;
    this.load = load;
    this.save = save;
  }

  get(sessionId: string): SentMessage[] {
    const entry = this.entries.get(sessionId);
    if (entry && this.now() - entry.lastAccess < this.ttlMs) {
      entry.lastAccess = this.now();
      return entry.messages;
    }
    const fresh = { messages: this.load(sessionId), lastAccess: this.now() };
    this.entries.set(sessionId, fresh);
    return fresh.messages;
  }

  add(sessionId: string, message: SentMessage): void {
    const messages = this.get(sessionId);
    messages.push(message);
    this.save(sessionId, message);
  }
}
