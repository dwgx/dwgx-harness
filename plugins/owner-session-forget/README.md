# owner-session-forget

Host plugin for this dwgx line. Copy the folder to `$DSH_HOME/plugins/` and apply `contrib/dsh-home/profiles/web/cordis.patch.yml`.

- Sidebar `⋯` only: rename, fork, archive, **delete session** (native DSH modal). Not in the header next to Session log.
- Settings: **图标颜色** presets + custom hex; trash archived sessions; Preview badge hide.
- Restart dock: reason text + **一键重启** (nowrap pill). Restarts the UI window only — llama on 8090 stays up.

Do not `dsh plugin add` community session-delete packages. Prefs live in `$DSH_HOME/owner-ui.json` (not committed).
