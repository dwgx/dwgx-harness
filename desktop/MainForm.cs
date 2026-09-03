using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace DwGxHarness;

internal sealed class MainForm : Form
{
	private readonly WebView2 _web = new() { Dock = DockStyle.Fill };
	private readonly WebHost _host;
	private readonly EventWaitHandle _reload;
	private readonly CancellationTokenSource _cts = new();

	internal MainForm(WebHost host, EventWaitHandle reload)
	{
		_host = host;
		_reload = reload;
		Text = "dwgx-harness";
		Width = 1280;
		Height = 800;
		StartPosition = FormStartPosition.CenterScreen;
		Controls.Add(_web);
		Shown += async (_, _) => await BootAsync();
		FormClosed += (_, _) =>
		{
			_cts.Cancel();
			if (_host.OwnsProcess)
				WebHost.StopExisting();
			_host.Dispose();
		};
	}

	private async Task BootAsync()
	{
		try
		{
			Directory.CreateDirectory(Paths.WebViewUserData);
			var env = await CoreWebView2Environment.CreateAsync(userDataFolder: Paths.WebViewUserData);
			await _web.EnsureCoreWebView2Async(env);
			_web.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;
			_web.CoreWebView2.Navigate(Paths.WebUrl);
			_ = Task.Run(WatchReload);
		}
		catch (Exception ex)
		{
			MessageBox.Show(this, ex.Message, "dwgx-harness", MessageBoxButtons.OK, MessageBoxIcon.Error);
			Close();
		}
	}

	private void WatchReload()
	{
		try
		{
			while (!_cts.IsCancellationRequested)
			{
				if (_reload.WaitOne(500))
				{
					try
					{
						BeginInvoke(() =>
						{
							if (_web.CoreWebView2 != null)
								_web.CoreWebView2.Navigate(Paths.WebUrl);
						});
					}
					catch { }
				}
			}
		}
		catch (ObjectDisposedException) { }
	}
}
