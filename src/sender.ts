import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getAllowedNumber } from "./config.ts";

const run = promisify(execFile);

const SCRIPT = [
  "on run argv",
  'tell application "Messages"',
  "set svc to 1st account whose service type = iMessage",
  "set target to participant (item 1 of argv) of svc",
  "send (item 2 of argv) to target",
  "end tell",
  "end run",
];

export class RecipientNotAllowedError extends Error {
  constructor() {
    super("Can't send: messages can only be sent to the configured number.");
  }
}

export function normalizeNumber(input: string): string {
  const digits = input.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

export function assertAllowed(input: string): string {
  const normalized = normalizeNumber(input);
  if (normalized !== getAllowedNumber()) throw new RecipientNotAllowedError();
  return normalized;
}

export async function sendMessage(to: string, text: string): Promise<void> {
  const number = assertAllowed(to);
  await run("osascript", [...SCRIPT.flatMap((line) => ["-e", line]), `+1${number}`, text]);
}
