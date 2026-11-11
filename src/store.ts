import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { STORE_PATH } from "./config.ts";

export interface SentMessage {
  to: string;
  text: string;
  sentAt: string;
}

type Data = Record<string, SentMessage[]>;

function readAll(): Data {
  try {
    return JSON.parse(readFileSync(STORE_PATH, "utf8"));
  } catch {
    return {};
  }
}

export function loadSession(sessionId: string): SentMessage[] {
  return readAll()[sessionId] ?? [];
}

export function appendMessage(sessionId: string, message: SentMessage): void {
  const data = readAll();
  data[sessionId] = [...(data[sessionId] ?? []), message];
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}
