import {
  composeStatus,
  composePs,
  composeLogs,
  composeUpDown,
} from "./lib/compose.js";

export const name = "dsh-wsl-compose";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  if (config.enabled === false) {
    console.log("[dsh-wsl-compose] disabled");
    return;
  }
  const timeoutMs = positive(config.timeoutMs, 60_000);
  const allowRoots = Array.isArray(config.allowRoots) ? config.allowRoots.map(String) : [];
  const allowMutate = config.allowMutate === true;
  console.log(`[dsh-wsl-compose] allowMutate=${allowMutate}`);

  ctx.systemPrompt.section({
    name: "tool:compose",
    order: 121,
    text: "dsh-wsl-compose wraps docker compose: prefer compose_ps and compose_logs. compose_up / compose_down require confirm=true and only work when allowMutate=true in plugin config. Complements docker_doctor; does not replace it.",
  });

  ctx.tools.register({
    name: "compose_status",
    description: "Whether docker / compose plugin are on PATH; compose version + allowMutate flag.",
    parameters: { type: "object", additionalProperties: false, properties: {} },
    output: { schema: { type: "object", additionalProperties: true }, render: (_a, v) => [{ type: "text", text: JSON.stringify(v, null, 2) }] },
    timeoutMs: 8_000,
    isConcurrencySafe: () => true,
    async execute() {
      return { ...(await composeStatus()), allowMutate, allowRootsCount: allowRoots.length };
    },
    presentCall: () => ({ card: "generic", title: "compose status" }),
    presentResult: (_a, r) => ({ card: "generic", title: "compose status", content: r.content }),
  });

  ctx.tools.register({
    name: "compose_ps",
    description: "docker compose ps for a project directory.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["projectDir"],
      properties: { projectDir: { type: "string" } },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : v.output }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        return await composePs({ projectDir: args.projectDir, allowRoots, timeoutMs });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "compose ps" }),
    presentResult: (_a, r) => ({ card: "generic", title: "compose ps", content: r.content }),
  });

  ctx.tools.register({
    name: "compose_logs",
    description: "Tail docker compose logs (capped). Optional service name.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["projectDir"],
      properties: {
        projectDir: { type: "string" },
        service: { type: "string" },
        tail: { type: "number" },
      },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : v.output }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        return await composeLogs({
          projectDir: args.projectDir,
          service: args.service,
          tail: args.tail,
          allowRoots,
          timeoutMs,
        });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "compose logs" }),
    presentResult: (_a, r) => ({ card: "generic", title: "compose logs", content: r.content }),
  });

  ctx.tools.register({
    name: "compose_up",
    description: "docker compose up -d. Requires plugin allowMutate=true AND confirm=true.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["projectDir", "confirm"],
      properties: {
        projectDir: { type: "string" },
        confirm: { type: "boolean" },
      },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : v.output || "ok" }],
    },
    timeoutMs: Math.max(timeoutMs, 180_000),
    isConcurrencySafe: () => false,
    async execute(args) {
      if (!allowMutate) return { ok: false, error: "compose_up disabled (set config.allowMutate=true)" };
      try {
        return await composeUpDown({
          projectDir: args.projectDir,
          action: "up",
          confirm: args.confirm,
          allowRoots,
          timeoutMs: Math.max(timeoutMs, 180_000),
        });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "compose up" }),
    presentResult: (_a, r) => ({ card: "generic", title: "compose up", content: r.content }),
  });

  ctx.tools.register({
    name: "compose_down",
    description: "docker compose down. Requires plugin allowMutate=true AND confirm=true.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["projectDir", "confirm"],
      properties: {
        projectDir: { type: "string" },
        confirm: { type: "boolean" },
      },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : v.output || "ok" }],
    },
    timeoutMs: Math.max(timeoutMs, 180_000),
    isConcurrencySafe: () => false,
    async execute(args) {
      if (!allowMutate) return { ok: false, error: "compose_down disabled (set config.allowMutate=true)" };
      try {
        return await composeUpDown({
          projectDir: args.projectDir,
          action: "down",
          confirm: args.confirm,
          allowRoots,
          timeoutMs: Math.max(timeoutMs, 180_000),
        });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "compose down" }),
    presentResult: (_a, r) => ({ card: "generic", title: "compose down", content: r.content }),
  });
}

function positive(v, fb) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fb;
}
