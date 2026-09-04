import { access, rm, writeFile } from "node:fs/promises";
import { constants as fsConstants, existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
	isUnderSessionsRoot,
	normalizePrefs,
	parseForgetInput,
	PREFS_PATH,
	USAGE,
	WHALE_RESTART_REASON,
	withoutArchived
} from "./parse.js";

const HERE = dirname(fileURLToPath(import.meta.url));

function dshToolsEntry() {
	const home = process.env.DSH_HOME ?? "D:\\Software\\dsh";
	const candidates = [
		join(HERE, "../../packages/core/tools/src/index.ts"),
		join(HERE, "../../packages/core/tools/lib/index.js"),
		join(home, "profiles/node_modules/@deepseek-ai/dsh-tools/src/index.ts"),
		join(home, "profiles/node_modules/@deepseek-ai/dsh-tools/lib/index.js"),
		join(HERE, "../../profiles/node_modules/@deepseek-ai/dsh-tools/src/index.ts"),
		join(HERE, "../../profiles/node_modules/@deepseek-ai/dsh-tools/lib/index.js")
	];
	const hit = candidates.find((path) => existsSync(path));
	if (!hit) {
		throw new Error(`dsh-tools not found. Tried:\n${candidates.join("\n")}`);
	}
	return pathToFileURL(hit).href;
}

const { defineTool } = await import(dshToolsEntry());

const name = "owner-session-forget";
const inject = [
	"webServer",
	"commands",
	"tools",
	"sessionPersistence",
	"agents",
	"sessions",
	"workspaceRegistry"
];
const ROUTE_PATH = "/owner/session-forget";
const MAX_BODY = 1 << 16;
const FORGET_DELAY_MS = 800;
const RESTART_SCRIPT = "D:\\Software\\dsh-cli\\Restart-DshDesktop.ps1";
const DESKTOP_EXE_CANDIDATES = [
	process.env.DWGX_HARNESS_EXE,
	"D:\\Project\\dwgx-harness\\desktop\\bin\\Release\\net10.0-windows\\DwGxHarness.exe",
	"D:\\Project\\dwgx-harness\\desktop\\bin\\Debug\\net10.0-windows\\DwGxHarness.exe"
];
const UI_INJECT = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "ui-inject.js"), "utf8");

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function readBody(req) {
	return new Promise((resolve, reject) => {
		let data = "";
		let size = 0;
		req.on("data", (chunk) => {
			size += chunk.length;
			if (size > MAX_BODY) {
				req.destroy();
				reject(new Error("request body too large"));
				return;
			}
			data += chunk.toString("utf8");
		});
		req.on("end", () => resolve(data));
		req.on("error", reject);
	});
}

function json(res, status, body) {
	res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(body));
}

async function resolveHeader(ctx, sessionId) {
	const live = ctx.sessions?.get?.(sessionId);
	if (live?.header) return live.header;
	const persistence = ctx.sessionPersistence;
	if (persistence && typeof persistence.inspect === "function") {
		try {
			return (await persistence.inspect(sessionId))?.meta;
		} catch {
			return undefined;
		}
	}
	return undefined;
}

function locateDir(ctx, header) {
	if (!header) return undefined;
	try {
		const loc = ctx.sessionPersistence?.locate?.(header);
		if (!loc?.path) return undefined;
		return dirname(loc.path);
	} catch {
		return undefined;
	}
}

function readPrefs() {
	try {
		return normalizePrefs(JSON.parse(readFileSync(PREFS_PATH, "utf8")));
	} catch {
		return normalizePrefs(null);
	}
}

function compactPatch(payload) {
	const skip = new Set(["action", "confirm", "sessionId", "sessions", "ok", "error"]);
	const out = {};
	for (const [key, value] of Object.entries(payload ?? {})) {
		if (skip.has(key) || value === undefined) continue;
		out[key] = value;
	}
	return out;
}

function desktopExe() {
	return DESKTOP_EXE_CANDIDATES.find((path) => path && existsSync(path)) ?? null;
}

function scheduleRestart() {
	const exe = desktopExe();
	const child = exe
		? spawn(exe, ["--restart"], { detached: true, stdio: "ignore", windowsHide: true })
		: spawn("powershell.exe", [
			"-NoProfile",
			"-ExecutionPolicy", "Bypass",
			"-File", RESTART_SCRIPT
		], {
			detached: true,
			stdio: "ignore",
			windowsHide: true
		});
	child.unref();
}

async function savePrefs(patch) {
	const before = readPrefs();
	const prefs = normalizePrefs({ ...before, ...compactPatch(patch) });
	const whaleChanged = before.whalePreset !== prefs.whalePreset || before.whaleCustom !== prefs.whaleCustom;
	await writeFile(PREFS_PATH, `${JSON.stringify(prefs, null, 2)}\n`, "utf8");
	return {
		prefs,
		restartRequired: whaleChanged,
		restartReason: whaleChanged ? WHALE_RESTART_REASON : ""
	};
}

async function pathExists(dir) {
	if (!dir) return false;
	try {
		await access(dir, fsConstants.F_OK);
		return true;
	} catch {
		return false;
	}
}

async function listSessions(ctx) {
	const liveIds = new Set((ctx.sessions?.list?.() ?? []).map((session) => session.id));
	const archivedIds = [...(ctx.workspaceRegistry?.archivedSessionIds ?? [])];
	const archivedSet = new Set(archivedIds);
	let headers = [];
	try {
		headers = await ctx.sessionPersistence.list();
	} catch {
		headers = [];
	}
	const byId = new Map();
	for (const header of headers) byId.set(header.id, header);
	for (const session of ctx.sessions?.list?.() ?? []) {
		if (!byId.has(session.id)) byId.set(session.id, session.header);
	}
	for (const id of archivedIds) {
		if (!byId.has(id)) byId.set(id, { id, createdAt: 0, cwd: "", agentPreset: "" });
	}
	const rows = await Promise.all([...byId.values()].map(async (header) => {
		const dir = locateDir(ctx, header);
		return {
			id: header.id,
			cwd: header.cwd ?? "",
			createdAt: header.createdAt ?? 0,
			preset: header.agentPreset ?? "",
			live: liveIds.has(header.id),
			archived: archivedSet.has(header.id),
			path: dir ?? "",
			hasFiles: await pathExists(dir)
		};
	}));
	rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
	return rows;
}

async function restoreSession(ctx, sessionId) {
	if (typeof sessionId !== "string" || sessionId.length === 0) {
		throw new Error("missing sessionId");
	}
	const wr = ctx.workspaceRegistry;
	if (!wr || typeof wr.enqueueOperation !== "function") {
		throw new Error("workspace registry cannot unarchive");
	}
	await wr.enqueueOperation(async () => {
		const state = wr.requireState();
		const next = withoutArchived(state.archivedSessionIds, sessionId);
		if (next.length === state.archivedSessionIds.length) return;
		await wr.setState({
			...state,
			archivedSessionIds: next
		});
	});
	return {
		ok: true,
		sessionId,
		archivedSessionIds: [...(wr.archivedSessionIds ?? [])]
	};
}

function formatList(rows) {
	if (rows.length === 0) return "no sessions";
	return rows.map((row) => {
		const when = row.createdAt ? new Date(row.createdAt).toISOString() : "?";
		const live = row.live ? "live" : "disk";
		return `${row.id}  ${live}  ${when}  ${row.cwd || "(no cwd)"}`;
	}).join("\n");
}

async function forgetSession(ctx, sessionId) {
	if (typeof sessionId !== "string" || sessionId.length === 0) {
		throw new Error("missing sessionId");
	}
	const agent = ctx.agents?.get?.(sessionId);
	if (agent && typeof agent.cancel === "function") {
		try {
			agent.cancel({ kind: "user" }, { keepInbox: false });
		} catch { /* still delete files */ }
		try {
			await Promise.race([agent.whenIdle(), sleep(4000)]);
		} catch { /* continue */ }
	}
	const live = ctx.sessions?.get?.(sessionId);
	if (live && typeof ctx.sessions.flush === "function") {
		try {
			await ctx.sessions.flush(live);
		} catch { /* continue */ }
	}
	const header = await resolveHeader(ctx, sessionId);
	const dir = locateDir(ctx, header);
	if (!dir || !isUnderSessionsRoot(dir)) {
		throw new Error(`refusing delete: session dir not under D:\\Software\\dsh\\sessions (${dir ?? "unresolved"})`);
	}
	let archived = false;
	try {
		await ctx.workspaceRegistry.archiveSession(sessionId);
		archived = true;
	} catch { /* still delete files */ }
	await rm(dir, { recursive: true, force: true });
	if (agent?.ctx?.scope && typeof agent.ctx.scope.dispose === "function") {
		try {
			await agent.ctx.scope.dispose();
		} catch { /* optional teardown */ }
	}
	return {
		ok: true,
		sessionId,
		removedPath: dir,
		archived
	};
}

function scheduleForget(ctx, sessionId) {
	setTimeout(() => {
		forgetSession(ctx, sessionId).catch((error) => {
			const message = error instanceof Error ? error.message : String(error);
			try {
				ctx.logger?.warn?.(`owner-session-forget: ${message}`);
			} catch {
				console.warn(`owner-session-forget: ${message}`);
			}
		});
	}, FORGET_DELAY_MS);
}

function apply(ctx) {
	ctx.on("webserver/index-inject", (table) => {
		table.push({
			kind: "script",
			placement: "body",
			text: UI_INJECT
		});
	});

	ctx.effect(() => {
		const dispose = ctx.webServer.register({
			kind: "exact",
			path: ROUTE_PATH,
			handler: async (req, res) => {
				if (req.method === "GET") {
					try {
						json(res, 200, {
							ok: true,
							prefs: readPrefs(),
							sessions: await listSessions(ctx)
						});
					} catch (error) {
						json(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
					}
					return;
				}
				if (req.method !== "POST") {
					json(res, 405, { ok: false, error: "method not allowed" });
					return;
				}
				let payload = {};
				try {
					const text = await readBody(req);
					payload = text ? JSON.parse(text) : {};
				} catch {
					json(res, 400, { ok: false, error: "invalid json body" });
					return;
				}
				const action = payload.action ?? (payload.sessionId ? "delete" : "list");
				if (action === "list") {
					try {
						json(res, 200, {
							ok: true,
							prefs: readPrefs(),
							sessions: await listSessions(ctx)
						});
					} catch (error) {
						json(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
					}
					return;
				}
				if (action === "prefs") {
					try {
						const saved = await savePrefs(payload);
						json(res, 200, { ok: true, ...saved });
					} catch (error) {
						json(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
					}
					return;
				}
				if (action === "restart") {
					if (payload.confirm !== true) {
						json(res, 400, { ok: false, error: "confirm:true required" });
						return;
					}
					scheduleRestart();
					json(res, 200, { ok: true, restarting: true });
					return;
				}
				if (action === "restore") {
					const sessionId = payload.sessionId;
					if (typeof sessionId !== "string" || sessionId.length === 0) {
						json(res, 400, { ok: false, error: "missing sessionId" });
						return;
					}
					try {
						json(res, 200, await restoreSession(ctx, sessionId));
					} catch (error) {
						json(res, 500, {
							ok: false,
							sessionId,
							error: error instanceof Error ? error.message : String(error)
						});
					}
					return;
				}
				if (action !== "delete") {
					json(res, 400, { ok: false, error: "action must be list, delete, restore, prefs, or restart" });
					return;
				}
				if (payload.confirm !== true) {
					json(res, 400, { ok: false, error: "confirm:true required" });
					return;
				}
				const sessionId = payload.sessionId;
				if (typeof sessionId !== "string" || sessionId.length === 0) {
					json(res, 400, { ok: false, error: "missing sessionId" });
					return;
				}
				try {
					json(res, 200, await forgetSession(ctx, sessionId));
				} catch (error) {
					json(res, 500, {
						ok: false,
						sessionId,
						error: error instanceof Error ? error.message : String(error)
					});
				}
			}
		});
		return () => {
			try { dispose(); } catch { /* already gone */ }
		};
	}, "owner-session-forget: host route");

	ctx.commands.register({
		name: "forget",
		description: "Delete a session jsonl for real (not archive). /forget confirm",
		input: { hint: "[list|confirm [sessionId]]" },
		handler: async ({ agent, rawInput }) => {
			const parsed = parseForgetInput(rawInput);
			if (parsed.action === "help") {
				return {
					kind: "success",
					text: `${USAGE}\n\ncurrent: ${agent.id}`
				};
			}
			if (parsed.action === "list") {
				const rows = await listSessions(ctx);
				return { kind: "success", text: formatList(rows) };
			}
			const sessionId = parsed.sessionId ?? agent.id;
			scheduleForget(ctx, sessionId);
			return {
				kind: "success",
				text: `已排队删除会话 ${sessionId}（含 session.jsonl.zstd，不可恢复）。侧栏会归档。请新开一个会话。`
			};
		}
	});

	ctx.tools.register(defineTool({
		name: "forget_session",
		description: "Permanently delete a DSH session directory (jsonl). Requires confirm=true. Default is the current session. Prefer the human /forget confirm; only call this if the Owner asked to wipe the log.",
		parameters: {
			confirm: {
				type: "boolean",
				required: true,
				description: "Must be true. Refuse otherwise."
			},
			session_id: {
				type: "string",
				description: "Session id to delete. Omit = current session."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					ok: { type: "boolean", required: true },
					text: { type: "string", required: true }
				}
			},
			render: (_args, value) => [{ type: "text", text: value.text }]
		},
		execute(args, exec) {
			if (args.confirm !== true) throw new Error("forget_session requires confirm=true");
			const sessionId = (args.session_id ?? "").trim() || exec.agent?.id;
			if (!sessionId) throw new Error("missing session id");
			scheduleForget(ctx, sessionId);
			return {
				ok: true,
				text: `queued delete ${sessionId}`
			};
		}
	}));
}

export { apply, inject, name };
