/* Owner DSH UI: native modal, settings trash, hide 预览版. */
(() => {
	if (window.__ownerForgetUi) return;
	window.__ownerForgetUi = true;

	const ARCHIVE = ["归档会话", "Archive session"];
	const DELETE_ZH = "删除会话";
	const MARK = "data-owner-forget";
	const PREFS_KEY = "owner-dsh-show-preview-badge";
	const WHALE_KEY = "owner-dsh-whale";
	const ROUTE = "/owner/session-forget";
	const WHALE_PRESETS = [
		{ id: "gold", label: "金色", fill: "#E0B422", bg: "linear-gradient(135deg,#F8E7A0,#E0B422 42%,#A67C12)" },
		{ id: "white", label: "白色", fill: "#F5F5F5", bg: "#F5F5F5" },
		{ id: "ink", label: "墨色", fill: "#171717", bg: "#171717" },
		{ id: "blue", label: "深蓝", fill: "#4D6BFE", bg: "#4D6BFE" },
		{ id: "amber", label: "琥珀", fill: "#F59E0B", bg: "#F59E0B" }
	];

	const css = `
.owner-dsh-root{position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;padding:24px}
.owner-dsh-mask{position:absolute;inset:0;background:var(--dsw-alias-bg-mask-1);-webkit-backdrop-filter:var(--dsw-mask-blur);backdrop-filter:var(--dsw-mask-blur)}
.owner-dsh-dialog{position:relative;z-index:1;display:flex;flex-direction:column;gap:20px;width:min(380px,100%);padding:0 0 24px;overflow:hidden;border:1px solid var(--dsw-alias-border-inverted);border-radius:24px;background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-shadow-lv3)}
.owner-dsh-content{display:flex;flex-direction:column;width:100%}
.owner-dsh-header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:22px 14px 12px 24px}
.owner-dsh-title{margin:0;font-size:16px;line-height:24px;font-weight:500;color:var(--dsw-alias-label-primary)}
.owner-dsh-close{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;border-radius:8px;background:transparent;cursor:pointer;color:var(--dsw-alias-label-secondary)}
.owner-dsh-close:hover{background:var(--dsw-alias-interactive-bg-hover)}
.owner-dsh-desc{margin:0;padding:0 24px;font-size:14px;line-height:22px;font-weight:400;color:var(--dsw-alias-label-primary)}
.owner-dsh-body{display:flex;flex-direction:column;min-width:0;margin-top:20px;padding:0 24px}
.owner-dsh-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:0 24px}
.owner-dsh-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:4px;border:none;border-radius:20px;cursor:pointer;font:inherit;font-size:14px;line-height:1;color:var(--dsw-alias-label-primary);background:transparent;padding:0 20px;height:40px;min-width:fit-content;width:auto;max-width:none;flex-shrink:0;white-space:nowrap;overflow:visible}
.owner-dsh-btn:disabled{cursor:not-allowed;opacity:.4}
.owner-dsh-btn-outline{border:1px solid var(--dsw-alias-border-l2);background:transparent}
.owner-dsh-btn-outline:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.owner-dsh-btn-primary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.owner-dsh-btn-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}
.owner-dsh-btn-danger:not(:disabled){color:var(--dsw-alias-state-error-primary)}
.owner-dsh-row{border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}
.owner-dsh-row-text{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:24px;display:flex}
.owner-dsh-row-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
.owner-dsh-row-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}
.owner-dsh-pills{display:inline-flex;align-items:center;gap:4px;background:var(--dsw-alias-bg-module-platform);border-radius:18px;padding:3px;flex-shrink:0}
.owner-dsh-pill{display:inline-flex;align-items:center;justify-content:center;height:32px;padding:0 12px;border:none;border-radius:16px;cursor:pointer;font:inherit;font-size:13px;line-height:1;color:var(--dsw-alias-label-secondary);background:transparent;white-space:nowrap;flex-shrink:0}
.owner-dsh-pill[aria-pressed="true"]{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);box-shadow:var(--dsw-shadow-lv1)}
.owner-dsh-trash-note{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin:0 0 12px}
.owner-dsh-trash-item{border-bottom:1px solid var(--dsw-alias-border-l2);padding:12px 0;display:flex;gap:12px;align-items:flex-start}
.owner-dsh-trash-item:last-child{border-bottom:none}
.owner-dsh-trash-meta{flex:1;min-width:0}
.owner-dsh-trash-name{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.owner-dsh-trash-id{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;word-break:break-all}
.owner-dsh-trash-actions{display:flex;gap:8px;flex:none}
.owner-dsh-empty{color:var(--dsw-alias-label-tertiary);font-size:14px;line-height:22px;padding:24px 0}
.owner-dsh-swatches{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:flex-end;max-width:280px}
.owner-dsh-swatch{width:28px;height:28px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0;box-shadow:inset 0 0 0 1px rgba(0,0,0,.18)}
.owner-dsh-swatch[aria-pressed="true"]{border-color:var(--dsw-alias-state-business-primary)}
.owner-dsh-custom{width:28px;height:28px;padding:0;border:none;background:transparent;cursor:pointer}
.owner-dsh-restart{position:absolute;right:18px;bottom:14px;z-index:6;display:flex;flex-direction:column;align-items:flex-end;gap:8px;max-width:min(360px,calc(100% - 210px))}
.owner-dsh-restart-why{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;text-align:right;width:100%}
.owner-dsh-restart [data-owner-restart]{box-sizing:border-box;white-space:nowrap !important;width:max-content !important;min-width:0 !important;max-width:none !important;flex-shrink:0;height:40px;padding:0 24px;line-height:1;justify-content:center !important;align-items:center !important}
.VOzbGW_panel.owner-dsh-has-restart .VOzbGW_options{padding-bottom:120px}
html[data-owner-hide-preview] .pXSMma_previewBadge{display:none !important}
html[data-owner-whale] svg[viewBox="0 0 23.16 17.04"]{color:var(--owner-whale-fill) !important}
html[data-owner-whale] .pXSMma_fish{color:var(--owner-whale-fill) !important}
`;

	const style = document.createElement("style");
	style.dataset.plugin = "owner-session-forget";
	style.textContent = css;
	document.head.appendChild(style);

	function showPreview() {
		try {
			return localStorage.getItem(PREFS_KEY) !== "0";
		} catch {
			return true;
		}
	}

	function setShowPreviewLocal(value) {
		try {
			localStorage.setItem(PREFS_KEY, value ? "1" : "0");
		} catch { /* private mode */ }
		applyPreviewBadge(value);
	}

	function applyPreviewBadge(value) {
		const show = value !== false;
		document.documentElement.toggleAttribute("data-owner-hide-preview", !show);
		for (const el of document.querySelectorAll('[class*="previewBadge"]')) {
			el.hidden = !show;
		}
	}

	function readWhaleLocal() {
		try {
			const raw = localStorage.getItem(WHALE_KEY);
			if (!raw) return { whalePreset: "gold", whaleCustom: "#E0B422" };
			const parsed = JSON.parse(raw);
			return {
				whalePreset: parsed.whalePreset || "gold",
				whaleCustom: parsed.whaleCustom || "#E0B422"
			};
		} catch {
			return { whalePreset: "gold", whaleCustom: "#E0B422" };
		}
	}

	function whaleFillOf(prefs) {
		if (prefs.whalePreset === "custom") return prefs.whaleCustom || "#E0B422";
		return WHALE_PRESETS.find((item) => item.id === prefs.whalePreset)?.fill || "#E0B422";
	}

	function applyWhale(prefs) {
		const fill = whaleFillOf(prefs);
		const root = document.documentElement;
		root.style.setProperty("--owner-whale-fill", fill);
		root.toggleAttribute("data-owner-whale", true);
		try {
			localStorage.setItem(WHALE_KEY, JSON.stringify({
				whalePreset: prefs.whalePreset,
				whaleCustom: prefs.whaleCustom
			}));
		} catch { /* private mode */ }
	}

	let restartState = { required: false, reason: "" };

	function fiberSessionId(start) {
		let n = start;
		for (let hop = 0; hop < 24 && n; hop += 1, n = n.parentElement) {
			const key = Object.keys(n).find((k) => k.startsWith("__reactFiber") || k.startsWith("__reactInternalInstance"));
			if (!key) continue;
			let fiber = n[key];
			for (let depth = 0; depth < 48 && fiber; depth += 1, fiber = fiber.return) {
				const props = fiber.memoizedProps || {};
				if (typeof props.node?.id === "string" && props.node.id) return props.node.id;
				if (typeof props.sessionId === "string" && props.sessionId) return props.sessionId;
				if (typeof props.id === "string" && /^session-/.test(props.id)) return props.id;
			}
		}
		return null;
	}

	function exactLeaves(root, labels) {
		const hits = [];
		for (const el of root.querySelectorAll('[role="menuitem"], button')) {
			const text = (el.textContent || "").replace(/\s+/g, " ").trim();
			if (labels.includes(text)) hits.push(el);
		}
		return hits;
	}

	function relabel(clone, to) {
		const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
		const nodes = [];
		while (walker.nextNode()) nodes.push(walker.currentNode);
		for (const node of nodes) {
			node.nodeValue = node.nodeValue
				.replace("归档会话", to)
				.replace("Archive session", "Delete session");
		}
	}

	function closeIcon() {
		return `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M3.53 3.53a.75.75 0 0 1 1.06 0L8 6.94l3.41-3.41a.75.75 0 1 1 1.06 1.06L9.06 8l3.41 3.41a.75.75 0 1 1-1.06 1.06L8 9.06l-3.41 3.41a.75.75 0 0 1-1.06-1.06L6.94 8 3.53 4.59a.75.75 0 0 1 0-1.06Z"/></svg>`;
	}

	function trashIcon() {
		return `<svg class="VOzbGW_navIcon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M6.25 1.5h3.5c.41 0 .75.34.75.75V3h2.75a.75.75 0 0 1 0 1.5h-.32l-.62 8.12A1.75 1.75 0 0 1 10.57 14H5.43a1.75 1.75 0 0 1-1.74-1.38L3.07 4.5h-.32a.75.75 0 0 1 0-1.5H5.5V2.25c0-.41.34-.75.75-.75Zm.75 1.5v.5h2v-.5h-2ZM4.58 4.5l.6 7.88c.03.4.36.72.76.72h5.14c.4 0 .73-.32.76-.72l.6-7.88H4.58ZM7 6.25a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4A.75.75 0 0 1 7 6.25Zm2 0a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4A.75.75 0 0 1 9 6.25Z"/></svg>`;
	}

	function btnClass(kind) {
		const native = {
			outline: "_button_kz6gm_4 _md_kz6gm_24 _outline_kz6gm_56",
			primary: "_button_kz6gm_4 _md_kz6gm_24 _primary_kz6gm_38",
			danger: "_button_kz6gm_4 _md_kz6gm_24 _outline_kz6gm_56 qDHVXG_deleteAction"
		}[kind] || "";
		const local = {
			outline: "owner-dsh-btn owner-dsh-btn-outline",
			primary: "owner-dsh-btn owner-dsh-btn-primary",
			danger: "owner-dsh-btn owner-dsh-btn-outline owner-dsh-btn-danger"
		}[kind];
		return `${local} ${native}`.trim();
	}

	function openDialog({ title, description, confirmLabel, danger, hideCancel }) {
		return new Promise((resolve) => {
			const existing = document.querySelector(".owner-dsh-root");
			if (existing) existing.remove();
			const root = document.createElement("div");
			root.className = "owner-dsh-root _root_15u5s_2";
			root.setAttribute("role", "presentation");
			root.innerHTML = `
				<div class="owner-dsh-mask _mask_15u5s_14" aria-hidden="true" data-owner-mask></div>
				<div class="owner-dsh-dialog _dialog_15u5s_22 _confirmation_1nu42_1" role="dialog" aria-modal="true" aria-labelledby="owner-dsh-title">
					<div class="owner-dsh-content _content_15u5s_37 _confirmationContent_1nu42_7">
						<div class="owner-dsh-header _header_15u5s_45">
							<h2 class="owner-dsh-title _title_15u5s_53" id="owner-dsh-title"></h2>
							<button type="button" class="owner-dsh-close _close_15u5s_61" aria-label="关闭" data-owner-x>${closeIcon()}</button>
						</div>
						<p class="owner-dsh-desc _description_15u5s_80" data-owner-desc></p>
					</div>
					<div class="owner-dsh-footer _footer_15u5s_97">
						<button type="button" class="${btnClass("outline")}" data-owner-cancel>取消</button>
						<button type="button" class="${danger ? btnClass("danger") : btnClass("primary")}" data-owner-ok></button>
					</div>
				</div>`;
			root.querySelector("#owner-dsh-title").textContent = title;
			root.querySelector("[data-owner-desc]").textContent = description;
			root.querySelector("[data-owner-ok]").textContent = confirmLabel;
			const cancel = root.querySelector("[data-owner-cancel]");
			if (hideCancel) cancel.hidden = true;
			const finish = (value) => {
				document.removeEventListener("keydown", onKey, true);
				root.remove();
				resolve(value);
			};
			const onKey = (event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					finish(false);
				}
			};
			root.querySelector("[data-owner-mask]").addEventListener("click", () => finish(false));
			root.querySelector("[data-owner-x]").addEventListener("click", () => finish(false));
			cancel.addEventListener("click", () => finish(false));
			root.querySelector("[data-owner-ok]").addEventListener("click", () => finish(true));
			document.addEventListener("keydown", onKey, true);
			document.body.appendChild(root);
			(hideCancel ? root.querySelector("[data-owner-ok]") : cancel).focus();
		});
	}

	async function alertDialog(title, description) {
		await openDialog({ title, description, confirmLabel: "知道了", danger: false, hideCancel: true });
	}

	async function api(payload) {
		const response = await fetch(ROUTE, {
			method: payload ? "POST" : "GET",
			headers: payload ? { "content-type": "application/json" } : undefined,
			body: payload ? JSON.stringify(payload) : undefined
		});
		const body = await response.json().catch(() => ({}));
		if (!response.ok || body.ok !== true) {
			throw new Error(body.error || `HTTP ${response.status}`);
		}
		return body;
	}

	async function forget(sessionId) {
		if (!sessionId) {
			await alertDialog("无法删除", "找不到会话 id。可用 /forget confirm。");
			return;
		}
		const ok = await openDialog({
			title: "删除会话",
			description: "永久删除此会话的 jsonl（磁盘文件）？不可恢复。侧栏「归档」只是隐藏，会进设置里的回收站。",
			confirmLabel: "永久删除",
			danger: true
		});
		if (!ok) return;
		try {
			await api({ action: "delete", confirm: true, sessionId });
			window.location.reload();
		} catch (error) {
			await alertDialog("删除失败", String(error));
		}
	}

	function injectAfter(sourceEl) {
		if (sourceEl.getAttribute(MARK) === "1") return;
		const parent = sourceEl.parentElement;
		if (!parent) return;
		if ([...parent.children].some((child) => (child.textContent || "").trim() === DELETE_ZH)) {
			sourceEl.setAttribute(MARK, "1");
			return;
		}
		const clone = sourceEl.cloneNode(true);
		clone.removeAttribute("id");
		clone.setAttribute(MARK, "item");
		relabel(clone, DELETE_ZH);
		clone.style.color = "var(--dsw-alias-state-error-primary, #c62828)";
		clone.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();
			const openRow = document.querySelector('[class*="menuOpen"]');
			forget(fiberSessionId(openRow) || fiberSessionId(sourceEl) || fiberSessionId(clone));
		}, true);
		parent.insertBefore(clone, sourceEl.nextSibling);
		sourceEl.setAttribute(MARK, "1");
	}

	function settingsPanel() {
		return document.querySelector(".VOzbGW_overlay")
			|| [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')]
				.find((el) => el.querySelector(".VOzbGW_navList"));
	}

	function shortId(id) {
		if (!id) return "";
		return id.length > 18 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
	}

	function formatWhen(createdAt) {
		if (!createdAt) return "";
		try {
			return new Date(createdAt).toLocaleString();
		} catch {
			return "";
		}
	}

	let trashBusy = false;

	async function refreshTrash(pane) {
		if (trashBusy) return;
		trashBusy = true;
		const list = pane.querySelector("[data-owner-trash-list]");
		list.textContent = "加载中…";
		try {
			const body = await api();
			const rows = (body.sessions || []).filter((row) => row.archived && row.hasFiles);
			if (rows.length === 0) {
				list.replaceChildren();
				const empty = document.createElement("div");
				empty.className = "owner-dsh-empty";
				empty.textContent = "回收站是空的。侧栏「归档会话」会把对话藏到这里，文件还在。";
				list.appendChild(empty);
				return;
			}
			list.replaceChildren();
			for (const row of rows) {
				const item = document.createElement("div");
				item.className = "owner-dsh-trash-item";
				const meta = document.createElement("div");
				meta.className = "owner-dsh-trash-meta";
				const name = document.createElement("div");
				name.className = "owner-dsh-trash-name";
				name.textContent = formatWhen(row.createdAt) || "已归档会话";
				const idLine = document.createElement("div");
				idLine.className = "owner-dsh-trash-id";
				idLine.textContent = row.cwd ? `${shortId(row.id)} · ${row.cwd}` : shortId(row.id);
				meta.append(name, idLine);
				const actions = document.createElement("div");
				actions.className = "owner-dsh-trash-actions";
				actions.innerHTML = `
					<button type="button" class="${btnClass("outline")}" data-restore>还原</button>
					<button type="button" class="${btnClass("danger")}" data-purge>永久删除</button>`;
				item.append(meta, actions);
				item.querySelector("[data-restore]").addEventListener("click", async () => {
					try {
						await api({ action: "restore", sessionId: row.id });
						await refreshTrash(pane);
					} catch (error) {
						await alertDialog("还原失败", String(error));
					}
				});
				item.querySelector("[data-purge]").addEventListener("click", async () => {
					const ok = await openDialog({
						title: "永久删除",
						description: `删除 ${shortId(row.id)} 的 jsonl？不可恢复。`,
						confirmLabel: "永久删除",
						danger: true
					});
					if (!ok) return;
					try {
						await api({ action: "delete", confirm: true, sessionId: row.id });
						await refreshTrash(pane);
					} catch (error) {
						await alertDialog("删除失败", String(error));
					}
				});
				list.appendChild(item);
			}
		} catch (error) {
			list.textContent = String(error);
		} finally {
			trashBusy = false;
		}
	}

	function ensureTrashPane(options) {
		let pane = options.querySelector("[data-owner-trash-pane]");
		const created = !pane;
		if (!pane) {
			pane = document.createElement("div");
			pane.setAttribute("data-owner-trash-pane", "1");
			pane.innerHTML = `
				<p class="owner-dsh-trash-note">归档只是从侧栏隐藏。还原后会回来。永久删除会清掉磁盘上的 session.jsonl。</p>
				<div data-owner-trash-list></div>`;
			options.appendChild(pane);
		}
		const wasHidden = pane.style.display === "none";
		pane.style.display = "";
		if (created || wasHidden) refreshTrash(pane);
		return pane;
	}

	function enterTrash(panel) {
		panel.setAttribute("data-owner-trash-open", "1");
		for (const cell of panel.querySelectorAll(".VOzbGW_navCell")) {
			const mine = cell.hasAttribute("data-owner-trash-nav");
			cell.classList.toggle("VOzbGW_active", mine);
			if (mine) cell.setAttribute("aria-current", "true");
			else cell.removeAttribute("aria-current");
		}
		const options = panel.querySelector(".VOzbGW_options");
		if (!options) return;
		for (const child of [...options.children]) {
			if (child.hasAttribute("data-owner-trash-pane")) continue;
			child.style.display = "none";
			child.setAttribute("data-owner-hidden-for-trash", "1");
		}
		ensureTrashPane(options);
	}

	function leaveTrash(panel) {
		if (!panel.hasAttribute("data-owner-trash-open")) return;
		panel.removeAttribute("data-owner-trash-open");
		const nav = panel.querySelector("[data-owner-trash-nav]");
		if (nav) {
			nav.classList.remove("VOzbGW_active");
			nav.removeAttribute("aria-current");
		}
		const options = panel.querySelector(".VOzbGW_options");
		if (!options) return;
		for (const child of [...options.children]) {
			if (child.hasAttribute("data-owner-trash-pane")) {
				child.style.display = "none";
				continue;
			}
			if (child.hasAttribute("data-owner-hidden-for-trash")) {
				child.style.display = "";
				child.removeAttribute("data-owner-hidden-for-trash");
			}
		}
	}

	function injectTrashNav(panel) {
		const list = panel.querySelector(".VOzbGW_navList");
		if (!list) return;
		if (!list.getAttribute("data-owner-trash-bound")) {
			list.setAttribute("data-owner-trash-bound", "1");
			list.addEventListener("click", (event) => {
				const cell = event.target.closest(".VOzbGW_navCell");
				if (!cell) return;
				if (cell.hasAttribute("data-owner-trash-nav")) {
					event.preventDefault();
					event.stopPropagation();
					enterTrash(panel);
					return;
				}
				leaveTrash(panel);
			}, true);
		}
		if (list.querySelector("[data-owner-trash-nav]")) {
			if (panel.hasAttribute("data-owner-trash-open")) {
				const options = panel.querySelector(".VOzbGW_options");
				const pane = options?.querySelector("[data-owner-trash-pane]");
				if (!pane || pane.style.display === "none") enterTrash(panel);
			}
			return;
		}
		const sample = list.querySelector(".VOzbGW_navCell");
		if (!sample) return;
		const cell = sample.cloneNode(true);
		cell.setAttribute("data-owner-trash-nav", "1");
		cell.removeAttribute("aria-current");
		cell.classList.remove("VOzbGW_active");
		const iconHost = cell.querySelector(".VOzbGW_navIcon") || cell.querySelector("svg");
		if (iconHost) {
			const wrap = iconHost.classList?.contains("VOzbGW_navIcon") ? iconHost : iconHost.parentElement;
			(wrap || iconHost).outerHTML = trashIcon();
		}
		const label = cell.querySelector(".VOzbGW_navLabel") || cell;
		if (label !== cell) label.textContent = "回收站";
		else relabel(cell, "回收站");
		list.appendChild(cell);
	}

	function injectPreviewRow(panel) {
		if (panel.hasAttribute("data-owner-trash-open")) return;
		const section = panel.querySelector("._WvWnq_section");
		if (!section || section.querySelector("[data-owner-preview-row]")) return;
		const row = document.createElement("div");
		row.className = "owner-dsh-row oY77xG_row T1PP_q_row";
		row.setAttribute("data-owner-preview-row", "1");
		const shown = showPreview();
		row.innerHTML = `
			<div class="owner-dsh-row-text oY77xG_rowText T1PP_q_rowText">
				<div class="owner-dsh-row-title oY77xG_title T1PP_q_title">显示「预览版」角标</div>
				<div class="owner-dsh-row-desc oY77xG_desc T1PP_q_desc">首页口号旁边那枚蓝色 Preview 徽章。关掉后只留「探索未至之境」。</div>
			</div>
			<div class="owner-dsh-pills" role="group" aria-label="预览版角标">
				<button type="button" class="owner-dsh-pill" data-preview="1" aria-pressed="${shown ? "true" : "false"}">显示</button>
				<button type="button" class="owner-dsh-pill" data-preview="0" aria-pressed="${shown ? "false" : "true"}">隐藏</button>
			</div>`;
		const syncButtons = (value) => {
			for (const btn of row.querySelectorAll(".owner-dsh-pill")) {
				btn.setAttribute("aria-pressed", btn.getAttribute("data-preview") === (value ? "1" : "0") ? "true" : "false");
			}
		};
		row.addEventListener("click", async (event) => {
			const btn = event.target.closest("[data-preview]");
			if (!btn) return;
			const value = btn.getAttribute("data-preview") === "1";
			setShowPreviewLocal(value);
			syncButtons(value);
			try {
				await api({ action: "prefs", showPreviewBadge: value });
			} catch { /* local already applied */ }
		});
		section.appendChild(row);
	}

	function injectWhaleRow(panel) {
		if (panel.hasAttribute("data-owner-trash-open")) return;
		const section = panel.querySelector("._WvWnq_section");
		if (!section || section.querySelector("[data-owner-whale-row]")) return;
		const current = readWhaleLocal();
		const row = document.createElement("div");
		row.className = "owner-dsh-row oY77xG_row T1PP_q_row";
		row.setAttribute("data-owner-whale-row", "1");
		const swatches = WHALE_PRESETS.map((item) => (
			`<button type="button" class="owner-dsh-swatch" data-whale="${item.id}" title="${item.label}" aria-label="${item.label}" aria-pressed="${current.whalePreset === item.id ? "true" : "false"}" style="background:${item.bg}"></button>`
		)).join("");
		row.innerHTML = `
			<div class="owner-dsh-row-text oY77xG_rowText T1PP_q_rowText">
				<div class="owner-dsh-row-title oY77xG_title T1PP_q_title">图标颜色</div>
				<div class="owner-dsh-row-desc oY77xG_desc T1PP_q_desc">网页里马上变。桌面快捷方式的 .ico 要重启窗口才会刷新 Windows 图标缓存。</div>
			</div>
			<div class="owner-dsh-swatches">
				${swatches}
				<input type="color" class="owner-dsh-custom" data-whale-custom value="${current.whaleCustom}" title="自定义" aria-label="自定义颜色">
			</div>`;
		const sync = (prefs) => {
			for (const btn of row.querySelectorAll("[data-whale]")) {
				btn.setAttribute("aria-pressed", btn.getAttribute("data-whale") === prefs.whalePreset ? "true" : "false");
			}
			const picker = row.querySelector("[data-whale-custom]");
			if (picker) picker.value = prefs.whaleCustom;
		};
		const save = async (prefs) => {
			applyWhale(prefs);
			sync(prefs);
			try {
				const body = await api({
					action: "prefs",
					whalePreset: prefs.whalePreset,
					whaleCustom: prefs.whaleCustom
				});
				if (body.restartRequired) {
					restartState = { required: true, reason: body.restartReason || "" };
					injectRestartDock(panel);
				}
			} catch (error) {
				restartState = { required: true, reason: String(error) };
				injectRestartDock(panel);
			}
		};
		row.addEventListener("click", (event) => {
			const btn = event.target.closest("[data-whale]");
			if (!btn) return;
			const local = readWhaleLocal();
			save({ whalePreset: btn.getAttribute("data-whale"), whaleCustom: local.whaleCustom });
		});
		row.querySelector("[data-whale-custom]").addEventListener("change", (event) => {
			save({ whalePreset: "custom", whaleCustom: event.target.value });
		});
		section.appendChild(row);
	}

	function injectRestartDock(panel) {
		const shell = panel.querySelector(".VOzbGW_panel") || panel.querySelector('[role="dialog"]');
		if (!shell) return;
		if (!restartState.required) return;
		shell.classList.add("owner-dsh-has-restart");
		let dock = shell.querySelector("[data-owner-restart-dock]");
		if (!dock) {
			dock = document.createElement("div");
			dock.className = "owner-dsh-restart";
			dock.setAttribute("data-owner-restart-dock", "1");
			dock.innerHTML = `
				<div class="owner-dsh-restart-why" data-owner-restart-why></div>
				<button type="button" class="owner-dsh-btn owner-dsh-btn-primary" data-owner-restart>一键重启</button>`;
			dock.querySelector("[data-owner-restart]").addEventListener("click", async () => {
				const ok = await openDialog({
					title: "重启 DSH 窗口",
					description: restartState.reason || "将关掉当前窗口并重新打开 DeepSeek Harness。本地模型不会关。",
					confirmLabel: "重启",
					danger: false
				});
				if (!ok) return;
				try {
					await api({ action: "restart", confirm: true });
				} catch (error) {
					await alertDialog("重启失败", String(error));
				}
			});
			shell.appendChild(dock);
		}
		dock.querySelector("[data-owner-restart-why]").textContent = restartState.reason;
	}

	function injectSettings() {
		const panel = settingsPanel();
		if (!panel) return;
		injectTrashNav(panel);
		injectPreviewRow(panel);
		injectWhaleRow(panel);
		injectRestartDock(panel);
	}

	let injecting = false;
	let scanTimer = 0;

	function scan() {
		if (injecting) return;
		injecting = true;
		observer.disconnect();
		try {
			for (const menu of document.querySelectorAll('[role="menu"]')) {
				for (const el of exactLeaves(menu, ARCHIVE)) injectAfter(el);
			}
			injectSettings();
		} finally {
			injecting = false;
			observer.observe(document.documentElement, { childList: true, subtree: true });
		}
	}

	function requestScan() {
		if (injecting) return;
		clearTimeout(scanTimer);
		scanTimer = setTimeout(() => {
			scanTimer = 0;
			scan();
		}, 80);
	}

	async function hydratePrefs() {
		try {
			const body = await api();
			if (typeof body.prefs?.showPreviewBadge === "boolean") {
				setShowPreviewLocal(body.prefs.showPreviewBadge);
			}
			if (body.prefs?.whalePreset) {
				applyWhale({
					whalePreset: body.prefs.whalePreset,
					whaleCustom: body.prefs.whaleCustom || "#E0B422"
				});
			}
		} catch { /* keep localStorage */ }
	}

	const observer = new MutationObserver(requestScan);
	observer.observe(document.documentElement, { childList: true, subtree: true });
	applyPreviewBadge(showPreview());
	applyWhale(readWhaleLocal());
	scan();
	hydratePrefs();
})();
