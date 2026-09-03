# Native desktop (WinExe + WebView2)

Not Electron. Not Tauri. Shortcut Target must be `DwGxHarness.exe`, never `powershell.exe`.

```
dotnet build desktop\DwGxHarness.csproj -c Release
powershell -NoProfile -File desktop\Install-Shortcut.ps1
```

- Starts `node …\dsh\lib\bin.js web --no-open --port 3080` with no console window when 3080 is down.
- Does not start or stop llama on 8090.
- `--restart`: recycle the web UI, rebuild the whale .ico, reload the window.
- Logs: `%DSH_HOME%\logs` (default `D:\Software\dsh\logs`).
