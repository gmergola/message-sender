import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { SessionCache } from "./sessionCache.ts";
import { assertAllowed, sendMessage } from "./sender.ts";

const sessionId = process.argv[2] ?? randomUUID();
const cache = new SessionCache();
const rl = createInterface({ input: process.stdin, output: process.stdout });

console.log(`Session: ${sessionId}`);
console.log("Commands: /history, /quit. Otherwise enter a recipient number, then a message.");

while (true) {
  const to = (await rl.question("To: ")).trim();
  if (to === "/quit") break;
  if (to === "/history") {
    for (const m of cache.get(sessionId)) console.log(`${m.sentAt}  ${m.to}  ${m.text}`);
    continue;
  }
  if (!to) continue;
  try {
    assertAllowed(to);
  } catch (error) {
    console.error((error as Error).message);
    continue;
  }
  const text = (await rl.question("Message: ")).trim();
  if (!text) continue;
  try {
    await sendMessage(to, text);
    cache.add(sessionId, { to, text, sentAt: new Date().toISOString() });
    console.log("Sent.");
  } catch (error) {
    console.error(`Failed to send: ${(error as Error).message}`);
  }
}

rl.close();
