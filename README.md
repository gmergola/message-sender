# message-sender

A terminal app that sends an iMessage through the macOS Messages app, but only to one configured phone number. Any other number is rejected with an error. It keeps a history of the messages sent in each session.

There is no server and no LLM, so no API key is needed.

## Requirements

- macOS with the Messages app signed in to iMessage
- Node 22.18 or newer (TypeScript runs directly, no build step)

## Setup

```
npm install
cp .env.example .env
```

Edit `.env` and set `ALLOWED_NUMBER` to the 10-digit number messages may be sent to. `.env` is git-ignored.

The first send will ask you to let your terminal control Messages. Approve it.

## Usage

```
npm start
npm start <session-id>
```

Each run prints a session ID on the first line. Pass it as an argument to resume that session later.

At the `To:` prompt, enter the recipient number, then the message at `Message:`.

| Input      | Effect                              |
| ---------- | ----------------------------------- |
| `/history` | Show messages sent in this session  |
| `/quit`    | Exit                                |

Numbers are accepted in common formats, for example `2015550100`, `201-555-0100` or `+1 (201) 555-0100`. Anything other than `ALLOWED_NUMBER` prints an error and nothing is sent.

## How it works

- `src/sender.ts` checks the number against `ALLOWED_NUMBER` and sends with `osascript`. The check is in code, not a prompt.
- `src/store.ts` saves sent messages to `data/messages.json`, keyed by session ID. This folder is git-ignored.
- `src/sessionCache.ts` keeps a session's messages in memory for 10 minutes since last use. After that, the next access reloads them from the store.
- `src/cli.ts` is the prompt loop.

## Scripts

```
npm start
npm test
npm run typecheck
```
