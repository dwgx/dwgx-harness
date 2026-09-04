using System.Diagnostics;
using System.Net.Http;
using System.Text.RegularExpressions;

namespace DwGxHarness;

internal sealed class WebHost : IDisposable
{
	private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(3) };
	private KillOnCloseJob? _job;
	private Process? _child;
	internal bool OwnsProcess { get; private set; }

	internal static async Task<bool> IsUpAsync()
	{
		try
		{
			using var res = await Http.GetAsync(Paths.WebUrl).ConfigureAwait(false);
			return (int)res.StatusCode is >= 200 and < 500;
		}
		catch
		{
			return false;
		}
	}

	internal static async Task WaitUpAsync(TimeSpan timeout)
	{
		var deadline = DateTime.UtcNow + timeout;
		while (DateTime.UtcNow < deadline)
		{
			if (await IsUpAsync().ConfigureAwait(false)) return;
			await Task.Delay(400).ConfigureAwait(false);
		}
		throw new TimeoutException($"DSH web did not listen on {Paths.WebUrl} within {timeout.TotalSeconds:0}s.");
	}

	internal async Task EnsureRunningAsync(bool forceRestart)
	{
		if (forceRestart)
			StopExisting();

		if (await IsUpAsync().ConfigureAwait(false))
		{
			OwnsProcess = false;
			return;
		}

		Directory.CreateDirectory(Paths.LogDir);
		Directory.CreateDirectory(Paths.Workspace);
		Directory.CreateDirectory(Paths.DshHome);

		var log = Path.Combine(Paths.LogDir, $"dsh-web-{DateTime.Now:yyyyMMdd-HHmmss}.log");
		var node = Paths.NodeExe();
		var bin = Paths.DshBinJs();

		var psi = new ProcessStartInfo
		{
			FileName = node,
			Arguments = $"\"{bin}\" web --no-open --port {Paths.WebPort}",
			WorkingDirectory = Directory.Exists(Paths.RepoRoot) ? Paths.RepoRoot : Paths.Workspace,
			UseShellExecute = false,
			CreateNoWindow = true,
			WindowStyle = ProcessWindowStyle.Hidden,
			RedirectStandardOutput = true,
			RedirectStandardError = true,
		};
		psi.Environment["DSH_HOME"] = Paths.DshHome;
		var apiKey = Environment.GetEnvironmentVariable("LOCAL_QWEN_API_KEY");
		psi.Environment["LOCAL_QWEN_API_KEY"] = string.IsNullOrEmpty(apiKey) ? "sk-local-qwen" : apiKey;

		_job = new KillOnCloseJob();
		_child = Process.Start(psi) ?? throw new InvalidOperationException("failed to start node dsh web");
		_job.Add(_child);
		OwnsProcess = true;

		_child.OutputDataReceived += (_, e) => { if (e.Data != null) AppendLog(log, e.Data); };
		_child.ErrorDataReceived += (_, e) => { if (e.Data != null) AppendLog(log, e.Data); };
		_child.BeginOutputReadLine();
		_child.BeginErrorReadLine();

		await WaitUpAsync(TimeSpan.FromSeconds(180)).ConfigureAwait(false);
	}

	internal static void StopExisting()
	{
		KillListeners(Paths.WebPort);
		try
		{
			foreach (var proc in Process.GetProcessesByName("node"))
			{
				string? cmd = null;
				try { cmd = QueryCommandLine(proc.Id); }
				catch { continue; }
				if (string.IsNullOrEmpty(cmd)) continue;
				if (Regex.IsMatch(cmd, @"dsh(\.cmd)?\s+web", RegexOptions.IgnoreCase) ||
				    (cmd.Contains("bin.js", StringComparison.OrdinalIgnoreCase) && cmd.Contains(" web ", StringComparison.OrdinalIgnoreCase)))
				{
					try { proc.Kill(entireProcessTree: true); } catch { }
				}
			}
		}
		catch { }
	}

	private static void KillListeners(int port)
	{
		var psi = new ProcessStartInfo
		{
			FileName = "netstat",
			Arguments = "-ano",
			UseShellExecute = false,
			CreateNoWindow = true,
			RedirectStandardOutput = true
		};
		using var p = Process.Start(psi);
		if (p is null) return;
		var output = p.StandardOutput.ReadToEnd();
		p.WaitForExit(5000);
		var seen = new HashSet<int>();
		foreach (Match m in Regex.Matches(output, $@"TCP\s+\S+:{port}\s+\S+\s+LISTENING\s+(\d+)", RegexOptions.IgnoreCase))
		{
			if (!int.TryParse(m.Groups[1].Value, out var pid) || pid <= 4) continue;
			if (!seen.Add(pid)) continue;
			try
			{
				using var victim = Process.GetProcessById(pid);
				victim.Kill(entireProcessTree: true);
			}
			catch { }
		}
	}

	private static string? QueryCommandLine(int pid)
	{
		var psi = new ProcessStartInfo
		{
			FileName = "wmic",
			Arguments = $"process where processid={pid} get CommandLine /value",
			UseShellExecute = false,
			CreateNoWindow = true,
			RedirectStandardOutput = true
		};
		using var p = Process.Start(psi);
		if (p is null) return null;
		var text = p.StandardOutput.ReadToEnd();
		p.WaitForExit(3000);
		const string prefix = "CommandLine=";
		foreach (var line in text.Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries))
		{
			if (line.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
				return line[prefix.Length..];
		}
		return null;
	}

	private static void AppendLog(string path, string line)
	{
		try { File.AppendAllText(path, line + Environment.NewLine); }
		catch { }
	}

	internal static void ApplyWhaleIconHidden()
	{
		var script = Paths.ApplyIconScript;
		if (!File.Exists(script) || !File.Exists(Paths.PowerShell)) return;
		var psi = new ProcessStartInfo
		{
			FileName = Paths.PowerShell,
			Arguments = $"-NoProfile -ExecutionPolicy Bypass -File \"{script}\"",
			UseShellExecute = false,
			CreateNoWindow = true,
			WindowStyle = ProcessWindowStyle.Hidden
		};
		using var p = Process.Start(psi);
		p?.WaitForExit(60_000);
	}

	public void Dispose()
	{
		try { _child?.Dispose(); } catch { }
		_child = null;
		_job?.Dispose();
		_job = null;
	}
}
