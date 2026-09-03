/** Parse /forget input and owner UI prefs. No Cordis imports. */

const SESSIONS_ROOT = "D:\\Software\\dsh\\sessions";
const PREFS_PATH = "D:\\Software\\dsh\\owner-ui.json";
const USAGE = [
	"Usage:",
	"  /forget              — help + current session id",
	"  /forget list         — live + on-disk sessions",
	"  /forget confirm      — delete THIS session's jsonl (irreversible)",
	"  /forget confirm <id> — delete that session id"
].join("\n");

const WHALE_PRESETS = {
	gold: { id: "gold", label: "金色", fill: "#E0B422" },
	white: { id: "white", label: "白色", fill: "#F5F5F5" },
	ink: { id: "ink", label: "墨色", fill: "#171717" },
	blue: { id: "blue", label: "深蓝", fill: "#4D6BFE" },
	amber: { id: "amber", label: "琥珀", fill: "#F59E0B" },
	custom: { id: "custom", label: "自定义", fill: null }
};

const WHALE_RESTART_REASON = "网页里的图标会马上变色。桌面快捷方式和任务栏图标写在 .ico 文件里，Windows 会缓存旧图；当前这个窗口也不会自己换图标。一键重启会关掉本窗口、按新颜色重建快捷方式，再打开 DSH（本地模型不关）。";

function normalizeHex(value) {
	if (typeof value !== "string") return null;
	const match = value.trim().match(/^#?([0-9A-Fa-f]{6})$/);
	return match ? `#${match[1].toUpperCase()}` : null;
}

function whaleFill(prefs) {
	const preset = prefs?.whalePreset;
	if (preset === "custom") return normalizeHex(prefs.whaleCustom) ?? "#E0B422";
	return WHALE_PRESETS[preset]?.fill ?? WHALE_PRESETS.gold.fill;
}

function normalizePrefs(raw) {
	const src = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
	const whalePreset = WHALE_PRESETS[src.whalePreset] ? src.whalePreset : "gold";
	const whaleCustom = normalizeHex(src.whaleCustom) ?? "#E0B422";
	const whaleIconPath = typeof src.whaleIconPath === "string" && src.whaleIconPath.toLowerCase().endsWith(".ico")
		? src.whaleIconPath
		: "";
	return {
		showPreviewBadge: src.showPreviewBadge !== false,
		whalePreset,
		whaleCustom,
		whaleIconPath
	};
}

function withoutArchived(ids, sessionId) {
	if (!Array.isArray(ids)) return [];
	return ids.filter((id) => id !== sessionId);
}

function parseForgetInput(rawInput) {
	const line = (rawInput ?? "").trim();
	if (line === "") return { action: "help" };
	const parts = line.split(/\s+/);
	const head = parts[0].toLowerCase();
	if (head === "list") return { action: "list" };
	if (head === "confirm") {
		const sessionId = parts[1] ? parts[1].trim() : null;
		return { action: "delete", sessionId };
	}
	return { action: "help" };
}

function isUnderSessionsRoot(dir) {
	if (typeof dir !== "string" || dir.length === 0) return false;
	const normalized = dir.replace(/\//g, "\\").toLowerCase();
	const root = SESSIONS_ROOT.toLowerCase();
	return normalized === root || normalized.startsWith(`${root}\\`);
}

export {
	PREFS_PATH,
	SESSIONS_ROOT,
	USAGE,
	WHALE_PRESETS,
	WHALE_RESTART_REASON,
	isUnderSessionsRoot,
	normalizeHex,
	normalizePrefs,
	parseForgetInput,
	whaleFill,
	withoutArchived
};
