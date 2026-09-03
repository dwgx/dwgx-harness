# dwgx map

Read this, then `AGENTS.md`, then `.agent/HANDOFF.md`. Official architecture: `docs/architecture.md`.

This tree is a third-party modification of DeepSeek Harness. dwgx in source and host plugins. Do not patch `node_modules`.

## Codegraph

Index lives at `D:\Project\dwgx-harness\.codegraph` (local, not git). Config: `codegraph.json`.

`session-probe` `codegraph_station: yes` is the **vrc-dcc** station, not this repo. Always pass this product path.

Last init (2026-09-04, CLI 1.6.0): 4,782 files · 52,904 nodes · 316,416 edges · ~290 MB. Languages: typescript, yaml, tsx, javascript, python, **csharp** (desktop).

```
cd D:\Project\dwgx-harness
codegraph sync
```

MCP (always pass `projectPath`):

```
codegraph_explore
  projectPath: D:\Project\dwgx-harness
  query: <symbols or a short question>
```

No index → fail-open to rg / Read. Do not invent symbols.

Starter queries:

| Ask | Query |
|---|---|
| Session delete / recycle | `owner-session-forget forgetSession ui-inject archive` |
| Icon color / 图标颜色 | `whalePreset whaleFill owner-ui.json Apply-DshWhaleIcon` |
| Desktop window | `DwGxHarness WebHost KillOnCloseJob CREATE_NO_WINDOW` |
| Web boot | `dsh web app-boot web-app frontend-static` |
| Session log (official) | `session-persistence session-log-export SessionEvent` |
| Tools / agent loop | `defineTool ctx.tools agentLoop` |

CLI extras (not in user-global MCP): `codegraph callers`, `callees`, `impact`, `files`, `status`.

After editing TS/JS/C#: `codegraph sync` in this repo.

## Two homes

| What | Path | Git |
|---|---|---|
| Product source | `D:\Project\dwgx-harness` | `origin` = us, `upstream` = official fetch-only |
| Runtime data | `D:\Software\dsh` (`DSH_HOME`) | never |
| Daily npm CLI (until cutover) | `D:\Software\dsh-cli` | not this product |
| llama | `D:\Software\llama.cpp` port **8090** | never stop for UI work |
| DSH web | `127.0.0.1:3080` | do not kill **8080** |

Baseline tag: official `dsh-v0.1.2-rc.1` (`a66e470204`). Our commits sit on top.

## dwgx surfaces (edit these)

| Surface | Path | Notes |
|---|---|---|
| Host plugin | `plugins/owner-session-forget/` | Sidebar delete, recycle, 图标颜色, restart dock. Injects `ui-inject.js`. |
| Profile patch sample | `contrib/dsh-home/profiles/web/cordis.patch.yml` | Copy into `$DSH_HOME/profiles/web/`. Live copy: `D:\Software\dsh\plugins\owner-session-forget\` |
| Desktop | `desktop/` | C# WinExe + WebView2. Shortcut → `DwGxHarness.exe`. |
| Overlay | `AGENTS.dwgx.md`, `NOTICE.md`, README banners | Keep NOTICE to one claim: third-party modification. |

Plugin HTTP: `/owner/session-forget`. Restart prefers `desktop/bin/Release/net10.0-windows/DwGxHarness.exe --restart`.

Do not permanently delete the golden boot session (`Write golden boot txt file` / `session-a6597061-69d8-47a4-a545-ce5e6ec2b6cb`).

## Official tree (read, dwgx only when the slice names it)

Cordis plugin composition: profile bundles → `cordis.patch.yml`. Launch is `dsh web` (profile `web`).

| Area | Where |
|---|---|
| Boot / profiles | `packages/boot/app-boot`, `packages/bundle/web-app`, `packages/bundle/base` |
| Session log | `packages/core/session`, `packages/session/*` |
| Tools / loop | `packages/core/tools`, `packages/core/agent-loop` |
| Web UI (React) | `packages/client/ui-*`, `packages/client/web` |
| Host / static | `packages/host/webserver`, `packages/host/frontend-static` |
| Vendored Cordis | `vendor/` (deprioritized in codegraph) |

Changing delete/color by patching `packages/client/ui-session` is a **named slice**, not a silent extra. Today those features live in the host plugin inject, not in `ui-*`.

## Desktop process model

`desktop/Program.cs` → mutex `Local\DwGxHarness.Desktop`. If 3080 is down, `WebHost` starts `node …/dsh/lib/bin.js web --no-open --port 3080` with no console, Job Object kill-on-close. Does not start llama. Logs: `%DSH_HOME%\logs`.

Build: `dotnet build desktop/DwGxHarness.csproj -c Release` then `desktop/Install-Shortcut.ps1`.

## Next agent handshake

1. `session-probe.ps1` in this cwd (`kind: project`).
2. This file + `.agent/HANDOFF.md`.
3. `codegraph_explore` with `projectPath` before grepping dwgx files.
4. One named slice. Dual-axis review before push.
5. Chat Chinese; git English. No AI attribution. No `git push upstream`.
