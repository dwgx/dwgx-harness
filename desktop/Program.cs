using System.Diagnostics;
using System.Runtime.InteropServices;

namespace DwGxHarness;

internal static class Program
{
	private const string MutexName = @"Local\DwGxHarness.Desktop";
	private const string ReloadEventName = @"Local\DwGxHarness.Reload";

	[STAThread]
	private static void Main(string[] args)
	{
		var restart = args.Any(a => a.Equals("--restart", StringComparison.OrdinalIgnoreCase));
		using var reload = new EventWaitHandle(false, EventResetMode.AutoReset, ReloadEventName);
		using var mutex = new Mutex(true, MutexName, out var createdNew);

		if (!createdNew)
		{
			if (restart)
				RunRestartHelper(reload);
			ActivateExisting();
			return;
		}

		ApplicationConfiguration.Initialize();
		var host = new WebHost();
		try
		{
			if (restart)
			{
				WebHost.StopExisting();
				WebHost.ApplyWhaleIconHidden();
			}
			host.EnsureRunningAsync(forceRestart: false).GetAwaiter().GetResult();
		}
		catch (Exception ex)
		{
			MessageBox.Show(ex.Message, "dwgx-harness", MessageBoxButtons.OK, MessageBoxIcon.Error);
			host.Dispose();
			return;
		}

		Application.Run(new MainForm(host, reload));
	}

	private static void RunRestartHelper(EventWaitHandle reload)
	{
		try
		{
			WebHost.StopExisting();
			WebHost.ApplyWhaleIconHidden();
			using var host = new WebHost();
			host.EnsureRunningAsync(forceRestart: false).GetAwaiter().GetResult();
			reload.Set();
		}
		catch (Exception ex)
		{
			MessageBox.Show(ex.Message, "dwgx-harness", MessageBoxButtons.OK, MessageBoxIcon.Error);
		}
	}

	private static void ActivateExisting()
	{
		foreach (var proc in Process.GetProcessesByName("DwGxHarness"))
		{
			if (proc.Id == Environment.ProcessId) continue;
			var hwnd = proc.MainWindowHandle;
			if (hwnd == IntPtr.Zero) continue;
			ShowWindow(hwnd, 9);
			SetForegroundWindow(hwnd);
			return;
		}
	}

	[DllImport("user32.dll")]
	private static extern bool SetForegroundWindow(IntPtr hWnd);

	[DllImport("user32.dll")]
	private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
