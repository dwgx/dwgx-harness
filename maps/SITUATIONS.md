# Situations

If the row matches, do the **Then**. Do not improvise a second product.

Read with `maps/DWGX.md`. Progress: `.agent/HANDOFF.md`.

## Window

| If | Then |
|---|---|
| Cwd is `C:\Users\dwgx1`, `C:\Agent`, or `D:\Software\dsh-cli` | Do not write `D:\Project`. Open `D:\Project\dwgx-harness`. |
| Probe `kind: dcc` or the ask is VRChat / avatar | Stop this product. DCC station, not harness. |
| Probe `codegraph_station: yes` | That flag is **vrc-dcc**. This product's index is `.codegraph` here. |
| Probe `kind: project` and `product_writes: allowed` in this cwd | This is the dwgx window. One named slice. |
| Another live writer on a dirty tree | Stop. Do not share the tree. |
| Second material job in the same window | Write HANDOFF first. Prefer a new window. |

## Codegraph

| If | Then |
|---|---|
| Need to understand or edit code | `codegraph_explore` with `projectPath` `D:\Project\dwgx-harness`. |
| Index missing | `codegraph init -y` in this repo. Never `codegraph init -f` on home. |
| Index stale after TS/JS/C# edits | `codegraph sync` here. |
| Explore returned nothing useful | Fail-open to rg / Read. Do not invent symbols. |
| Querying vrc-dcc / Kaguya / origin by habit | Wrong graph. Pass this repo path. |

## Which copy is live

| If | Then |
|---|---|
| Daily UI still works | npm `@deepseek-ai/dsh@0.1.1-rc.2` in `D:\Software\dsh-cli`. This git tree is `dsh-v0.1.2-rc.1`. Cutover is a named slice. |
| Changing session delete / 图标颜色 / restart dock | Edit `plugins/owner-session-forget/` in **this git**. Copy to `D:\Software\dsh\plugins\owner-session-forget\` for the running UI. Do not edit only the live copy. |
| Tempted to patch `node_modules` or `dsh plugin add` | No. Host plugin + profile patch only. |
| Tempted to patch `packages/client/ui-*` for delete/color | Named slice only. Today that UI is `ui-inject.js`. |
| `pnpm dsh web` from this checkout | Not the daily driver yet. Do not dismantle `dsh-cli` first. |

## Desktop and shortcut

| If | Then |
|---|---|
| Shortcut Target is `powershell.exe` | `desktop/Install-Shortcut.ps1`. Target must be `DwGxHarness.exe`. |
| Need a UI-only restart | `DwGxHarness.exe --restart` or Settings 一键重启. Do not stop llama. |
| `MSB3027` / exe locked | Close the `dwgx-harness` window, then rebuild. |
| Rebuilding desktop | `dotnet build desktop/DwGxHarness.csproj -c Release` then Install-Shortcut. |
| Background console flashes | Shortcut still points at PowerShell. Fix the `.lnk`, do not wrap more `.ps1`. |
| Electron / Tauri / community launcher | Do not vendor. This shell is `desktop/` C# + WebView2. |

## Ports and llama

| If | Then |
|---|---|
| Restarting the chat UI | Touch **3080** only. |
| llama / Qwen / local model | **8090**, `D:\Software\llama.cpp`. Separate shortcut. Do not start or stop unless asked. |
| Anything on **8080** | Leave it. Never kill 8080. |
| 3080 down, Owner wants the window | Desktop exe starts `node … bin.js web --no-open --port 3080` with no console. |
| 8090 down during UI work | Warn once. Do not mix llama boot into a UI slice. |

## Sessions and prefs

| If | Then |
|---|---|
| Delete session in the header next to Session log | Regression. Delete belongs in sidebar `⋯` only (after 归档). Native DSH modal. |
| Settings freeze after 图标颜色 | Regression. Prefs POST must write JSON only; inject is debounced; do not walk every span. |
| 一键重启 wraps / squeezed pill | Regression. Dock is column; button nowrap; no native hashed `_button_*` classes on that pill. |
| Owner asks to wipe the golden boot session | Refuse. `Write golden boot txt file` / `session-a6597061-69d8-47a4-a545-ce5e6ec2b6cb`. |
| `owner-ui.json` / `sessions/` / API keys | Stay in `D:\Software\dsh`. Never git. |
| Recycle vs real delete | Archive is official; real delete is this plugin (`forgetSession` + disk `rm` under sessions root). |

## Git and GitHub

| If | Then |
|---|---|
| Commit message / NOTICE | One claim: third-party modification. No Fork / PR / Dependabot / Actions essays. |
| `git commit` `AGENTS.md` | Hook blocks leaf `agents.md`. Use `AGENTS.dwgx.md`. |
| `.agent/` | Local only (global exclude). HANDOFF/MAP stay here. |
| `git push upstream` or `gh pr create` to `deepseek-ai/*` | No. `upstream` push URL is `no_push`. |
| GitHub Fork button | No. |
| `.github/dependabot.yml` reappears (usually after upstream merge) | Delete the file. Do not add a commit titled Stop Dependabot. |
| GitHub Actions enabled | Turn **off**. Cloned DeepSeek CI will fail here. Do not narrate that in NOTICE. |
| Sync official | Own window: `git fetch upstream` then `git merge --no-ff upstream/master`. Then dependabot file, then `codegraph sync` or `index`. |
| History rewrite | Owner must name it. Official commits at/before `a66e470204` do not move. |
| AI attribution on commits | No. |

## Other products

| If | Then |
|---|---|
| Other trees under `D:\Project` | Do not edit. |
| VRC SDK Build & Publish | Never. |
| Home / machine / agent-system jobs | Wrong window. |

## After a slice

1. Dual-axis review (correct/safe/style **and** the named ask).
2. Verify the UI path you touched (sidebar delete, settings, shortcut Target, 3080, 8090 still as you found it).
3. If plugin JS changed, copy to `D:\Software\dsh\plugins\owner-session-forget\`.
4. `codegraph sync`.
5. Update `.agent/HANDOFF.md`. One next action. Ledger if material.
