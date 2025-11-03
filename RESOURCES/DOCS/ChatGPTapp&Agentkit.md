Perfect timing—OpenAI’s latest drops give you two clean paths:

1. **Build “apps inside ChatGPT”** (distribution + users right in ChatGPT).
2. **Embed your own agents on your website** (full control, custom tools, voice, guardrails).

Below is a practical map + copy-paste snippets you can use today.

---

# What’s new (super short)

* **AgentKit** = the end-to-end agent platform: **Agent Builder** (visual canvas), **Agents SDKs (TS/Python)**, **Guardrails SDK**, **ChatKit** (embeddable chat UI), evals/tracing, connectors, vector stores. ([OpenAI][1])
* **Apps in ChatGPT** + **Apps SDK** = ship interactive apps that run *inside* ChatGPT (MCP-based; open-source SDK; app directory coming). ([OpenAI][2])
* **Realtime API** = voice/AV assistants via WebRTC/WebSocket with server-side tool control. ([OpenAI Platform][3])

---

# Decide your path

**A) Reach users inside ChatGPT (no site embed needed)**
Use the **Apps SDK** to build a chat-native app (payments/dir coming). Great for discovery. ([OpenAI][2])

**B) Power your own website/engine (your case)**
Use **Agents SDK (TS)** + **ChatKit embeds** + **Guardrails** + **Vector Stores** + **Realtime** for voice. Fit this behind your R3F/Three UI. ([OpenAI GitHub][4])

---

# The minimal, modern embed (Next.js + R3F site)

## 1) Drop in ChatKit as your in-page assistant UI

```tsx
// components/Assistant.tsx
'use client'
import { ChatKit, useChatKit } from '@openai/chatkit-react'

export default function Assistant({ clientToken }: { clientToken: string }) {
  const { control } = useChatKit({ api: { clientToken } })
  return <ChatKit control={control} className="h-[600px] w-full" />
}
```

ChatKit gives you a production chat widget (streaming, tools, file uploads, theming). ([OpenAI GitHub][5])

## 2) Create an agent (TypeScript SDK) with your **site tools**

```ts
// app/api/agent/route.ts
import { Agent, run, tool } from '@openai/agents'
import { z } from 'zod'

const navigate = tool(
  'navigate',
  z.object({ path: z.string() }),
  async ({ path }) => ({ ok: true, path }) // your router logic server-side
)

const setParam = tool(
  'setParam',
  z.object({ key: z.string(), value: z.any() }),
  async ({ key, value }) => ({ ok: true, key, value }) // write to store/config
)

export const POST = async (req: Request) => {
  const { message } = await req.json()
  const agent = new Agent({
    name: 'UX Copilot',
    instructions: 'Help users explore the site. Use tools to navigate and tweak scene params.',
    tools: [navigate, setParam],
  })
  const result = await run(agent, message)
  return new Response(JSON.stringify(result.finalOutput))
}
```

The Agents SDK is tiny but expressive (agents, tools, handoffs, guardrails) and ships with tracing. ([OpenAI GitHub][6])

## 3) Add your knowledge (RAG) with Vector Stores

```ts
// one-time setup: create a vector store and upload files
import OpenAI from 'openai'
import fs from 'node:fs'
const openai = new OpenAI()

const store = await openai.vectorStores.create({ name: 'site-knowledge' })
await openai.vectorStores.files.upload(store.id, fs.createReadStream('exported-notes.md'))
```

Attach via the Agents SDK’s **File Search tool** (vector_store_ids). ([OpenAI Platform][7])

## 4) Turn on **Guardrails** (PII, jailbreak checks, policy)

* Wrap the TS client or configure guardrails in Agent Builder; both routes are supported. ([Guardrails][8])

## 5) Add **voice** (optional) with the Realtime API

```ts
// browser-side voice agent (WebRTC)
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime'
const agent = new RealtimeAgent({ name: 'Voice Copilot', instructions: 'Be concise and helpful.' })
const session = new RealtimeSession(agent)
await session.connect({ apiKey: '<ephemeral-client-key>' }) // mint on your server
```

Realtime supports WebRTC/WebSocket; keep tool use on your server via the sideband control channel. ([OpenAI Platform][3])

## 6) Build visually, then export

Use **Agent Builder** (drag-and-drop nodes, templates, evals). Start in the canvas, then keep the code-first SDK for production. ([OpenAI Platform][9])

---

# If you also want distribution: build a ChatGPT app

* Use the **Apps SDK** (built on MCP). Define capabilities and UI, then submit to the upcoming directory. Ideal for acquiring users *in ChatGPT* while your site runs its own embedded agent. ([OpenAI][2])

---

# Suggested setup for your interactive site (R3F + agents)

* **Frontend:** Next.js (App Router), R3F/Three, your persistent `<Canvas>`, **ChatKit** overlay. ([OpenAI GitHub][5])
* **Agent runtime:** **Agents SDK (TS)** with your tools (navigate, setParam, publishPost, openPR, etc.). Handoff to a “Builder Agent” for repo/CI actions. ([OpenAI GitHub][6])
* **Knowledge:** OpenAI **Vector Stores** + File Search tool. ([OpenAI Platform][10])
* **Safety:** **Guardrails** (TS) or enable in **Agent Builder**. ([Guardrails][8])
* **Voice:** **Realtime API** for instant speech in/out. ([OpenAI Platform][3])

---

If you tell me your current repo layout, I can tailor the exact files (API routes, tools, client embed) and wire it into your R3F canvas in one pass.

* [The Verge](https://www.theverge.com/news/793039/openai-chatgpt-apps-developers-sdk-canva-zillow-devday-2025?utm_source=chatgpt.com)
* [businessinsider.com](https://www.businessinsider.com/openai-just-launched-app-store-taking-aim-apple-google-2025-10?utm_source=chatgpt.com)
* [wired.com](https://www.wired.com/story/openai-dev-day-sam-altman-chatgpt-apps?utm_source=chatgpt.com)

[1]: https://openai.com/index/introducing-agentkit/?utm_source=chatgpt.com "Introducing AgentKit"
[2]: https://openai.com/index/introducing-apps-in-chatgpt/?utm_source=chatgpt.com "Introducing apps in ChatGPT and the new Apps SDK"
[3]: https://platform.openai.com/docs/guides/realtime/quickstart?utm_source=chatgpt.com "Realtime API"
[4]: https://openai.github.io/openai-agents-js/?utm_source=chatgpt.com "OpenAI Agents SDK TypeScript - GitHub Pages"
[5]: https://openai.github.io/chatkit-js/ "OpenAI Agent Embeds | OpenAI Agent Embeds"
[6]: https://openai.github.io/openai-agents-js/ "OpenAI Agents SDK TypeScript | OpenAI Agents SDK"
[7]: https://platform.openai.com/docs/api-reference/vector-stores/create?utm_source=chatgpt.com "Create Vector Store"
[8]: https://guardrails.openai.com/docs/typescript-quickstart/?utm_source=chatgpt.com "Quickstart: TypeScript - OpenAI Guardrails"
[9]: https://platform.openai.com/docs/guides/agent-builder?utm_source=chatgpt.com "Agent Builder - OpenAI API"
[10]: https://platform.openai.com/docs/api-reference/vector-stores?utm_source=chatgpt.com "API Reference"
