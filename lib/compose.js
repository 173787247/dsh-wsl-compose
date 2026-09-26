import { spawn } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { resolve } from "node:path";

export function which(cmd) {
  const safe = String(cmd || "").replace(/[^a-zA-Z0-9._+-]/g, "");
  if (!safe) return Promise.resolve("");
  return new Promise((r) => {
    const child = spawn("bash", ["-lc", `command -v ${safe}`], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.on("close", (c) => r(c === 0 ? out.trim() : ""));
  });
}

export function resolveProject(dir, allowRoots = []) {
  const abs = resolve(String(dir || ".").trim() || ".");
  const real = existsSync(abs) ? realpathSync(abs) : abs;
  if (allowRoots.length) {
    const roots = allowRoots.map((r) => {
      const a = resolve(r);
      return existsSync(a) ? realpathSync(a) : a;
    });
    const ok = roots.some((root) => {
      const x = root.replace(/[/\\]+$/, "");
      return real === x || real.startsWith(x + "/") || real.startsWith(x + "\\");
    });
    if (!ok) throw new Error(`compose project outside allowRoots: ${real}`);
  }
  return real;
}

export function run(bin, args, { cwd, timeoutMs = 60_000, maxOut = 80_000 } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(bin, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const t = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("timeout"));
    }, timeoutMs);
    child.stdout.on("data", (d) => {
      stdout += d;
      if (stdout.length > maxOut * 2) child.kill("SIGKILL");
    });
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (code) => {
      clearTimeout(t);
      resolvePromise({
        code,
        stdout: stdout.slice(0, maxOut),
        stderr: stderr.slice(0, 4000),
        truncated: stdout.length > maxOut,
      });
    });
    child.on("error", (e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

async function composeBin() {
  // prefer `docker compose` plugin; fall back to docker-compose
  const docker = (await which("docker")) || "docker";
  return { kind: "plugin", docker };
}

export async function composeStatus() {
  const docker = (await which("docker")) || null;
  const legacy = (await which("docker-compose")) || null;
  let composeVersion = null;
  if (docker) {
    try {
      const r = await run(docker, ["compose", "version", "--short"], { timeoutMs: 8_000, maxOut: 2_000 });
      if (r.code === 0) composeVersion = r.stdout.trim();
      else {
        const r2 = await run(docker, ["compose", "version"], { timeoutMs: 8_000, maxOut: 4_000 });
        composeVersion = (r2.stdout || r2.stderr || "").trim().slice(0, 200) || null;
      }
    } catch {
      composeVersion = null;
    }
  }
  return { ok: true, docker, dockerComposeLegacy: legacy, composeVersion };
}

export async function composePs({ projectDir, allowRoots, timeoutMs }) {
  const cwd = resolveProject(projectDir, allowRoots);
  const { docker } = await composeBin();
  const r = await run(docker, ["compose", "ps", "--format", "json"], { cwd, timeoutMs });
  if (r.code !== 0) {
    // try table format
    const r2 = await run(docker, ["compose", "ps"], { cwd, timeoutMs });
    if (r2.code !== 0) throw new Error(`compose ps failed: ${r2.stderr || r2.code}`);
    return { ok: true, project: cwd, output: r2.stdout, truncated: r2.truncated };
  }
  return { ok: true, project: cwd, output: r.stdout, truncated: r.truncated };
}

export async function composeLogs({ projectDir, service, tail = 80, allowRoots, timeoutMs, maxOut = 60_000 }) {
  const cwd = resolveProject(projectDir, allowRoots);
  const svc = String(service || "").trim();
  if (svc && !/^[A-Za-z0-9._-]+$/.test(svc)) throw new Error("invalid service name");
  const n = Math.min(500, Math.max(1, Number(tail) || 80));
  const { docker } = await composeBin();
  const args = ["compose", "logs", "--no-color", "--tail", String(n)];
  if (svc) args.push(svc);
  const r = await run(docker, args, { cwd, timeoutMs, maxOut });
  if (r.code !== 0) throw new Error(`compose logs failed: ${r.stderr || r.code}`);
  return { ok: true, project: cwd, service: svc || null, output: r.stdout, truncated: r.truncated };
}

/**
 * Dangerous: up/down require confirm=true explicitly.
 */
export async function composeUpDown({ projectDir, action, confirm, allowRoots, timeoutMs }) {
  if (confirm !== true) throw new Error(`${action} refused: pass confirm=true`);
  const act = String(action || "").toLowerCase();
  if (act !== "up" && act !== "down") throw new Error("action must be up or down");
  const cwd = resolveProject(projectDir, allowRoots);
  const { docker } = await composeBin();
  const args = act === "up" ? ["compose", "up", "-d"] : ["compose", "down"];
  const r = await run(docker, args, { cwd, timeoutMs: timeoutMs || 180_000, maxOut: 40_000 });
  if (r.code !== 0) throw new Error(`compose ${act} failed: ${r.stderr || r.code}`);
  return { ok: true, project: cwd, action: act, output: r.stdout || r.stderr };
}
