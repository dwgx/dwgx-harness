namespace DwGxHarness;

internal static class Paths
{
	internal const int WebPort = 3080;
	internal const string WebUrl = "http://127.0.0.1:3080/";
	internal const string LlamaHealth = "http://127.0.0.1:8090/health";

	internal static string DshHome =>
		Environment.GetEnvironmentVariable("DSH_HOME") is { Length: > 0 } home
			? home
			: @"D:\Software\dsh";

	internal static string Workspace =>
		Environment.GetEnvironmentVariable("DWGX_WORKSPACE") is { Length: > 0 } ws
			? ws
			: @"C:\Agent";

	internal static string LogDir => Path.Combine(DshHome, "logs");

	internal static string WebViewUserData => Path.Combine(DshHome, "webview2-profile");

	internal static string NodeExe()
	{
		foreach (var candidate in new[]
		{
			@"D:\Software\Developer\nodejs\node.exe",
			Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "nodejs", "node.exe"),
			Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "nodejs", "node.exe")
		})
		{
			if (File.Exists(candidate)) return candidate;
		}

		var path = Environment.GetEnvironmentVariable("PATH") ?? "";
		foreach (var dir in path.Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries))
		{
			var exe = Path.Combine(dir.Trim(), "node.exe");
			if (File.Exists(exe) && !exe.Contains("cursor-agent", StringComparison.OrdinalIgnoreCase))
				return exe;
		}

		throw new InvalidOperationException("node.exe not found (expected D:\\Software\\Developer\\nodejs\\node.exe).");
	}

	internal static string DshBinJs()
	{
		var fromEnv = Environment.GetEnvironmentVariable("DWGX_DSH_BIN");
		if (!string.IsNullOrWhiteSpace(fromEnv) && File.Exists(fromEnv)) return fromEnv;

		var npm = @"D:\Software\dsh-cli\node_modules\@deepseek-ai\dsh\lib\bin.js";
		if (File.Exists(npm)) return npm;

		throw new InvalidOperationException("dsh bin.js not found. Install @deepseek-ai/dsh under D:\\Software\\dsh-cli or set DWGX_DSH_BIN.");
	}

	internal static string ApplyIconScript =>
		@"D:\Software\dsh-cli\icons\Apply-DshWhaleIcon.ps1";

	internal static string PowerShell =>
		Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), @"WindowsPowerShell\v1.0\powershell.exe");
}
