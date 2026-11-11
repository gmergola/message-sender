export const CACHE_TTL_MS = 10 * 60 * 1000;
export const STORE_PATH = new URL("../data/messages.json", import.meta.url).pathname;

export function getAllowedNumber(): string {
  if (!process.env.ALLOWED_NUMBER) {
    try {
      process.loadEnvFile(new URL("../.env", import.meta.url).pathname);
    } catch {}
  }
  const digits = (process.env.ALLOWED_NUMBER ?? "").replace(/\D/g, "");
  const number = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (number.length !== 10) {
    throw new Error("ALLOWED_NUMBER is not set. Copy .env.example to .env and set it.");
  }
  return number;
}
