using System.Diagnostics;
using System.Runtime.InteropServices;

namespace DwGxHarness;

internal sealed class KillOnCloseJob : IDisposable
{
	private IntPtr _handle;
	private bool _disposed;

	internal KillOnCloseJob()
	{
		_handle = CreateJobObject(IntPtr.Zero, null);
		if (_handle == IntPtr.Zero)
			throw new InvalidOperationException("CreateJobObject failed.");

		var info = new JOBOBJECT_EXTENDED_LIMIT_INFORMATION
		{
			BasicLimitInformation = new JOBOBJECT_BASIC_LIMIT_INFORMATION
			{
				LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
			}
		};
		var length = Marshal.SizeOf<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>();
		var ptr = Marshal.AllocHGlobal(length);
		try
		{
			Marshal.StructureToPtr(info, ptr, false);
			if (!SetInformationJobObject(_handle, JobObjectExtendedLimitInformation, ptr, (uint)length))
				throw new InvalidOperationException("SetInformationJobObject failed.");
		}
		finally
		{
			Marshal.FreeHGlobal(ptr);
		}
	}

	internal void Add(Process process)
	{
		if (!AssignProcessToJobObject(_handle, process.Handle))
			throw new InvalidOperationException("AssignProcessToJobObject failed.");
	}

	public void Dispose()
	{
		if (_disposed) return;
		_disposed = true;
		if (_handle != IntPtr.Zero)
		{
			CloseHandle(_handle);
			_handle = IntPtr.Zero;
		}
	}

	private const int JobObjectExtendedLimitInformation = 9;
	private const uint JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x2000;

	[DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
	private static extern IntPtr CreateJobObject(IntPtr lpJobAttributes, string? lpName);

	[DllImport("kernel32.dll", SetLastError = true)]
	private static extern bool SetInformationJobObject(IntPtr hJob, int infoClass, IntPtr lpJobObjectInfo, uint cbJobObjectInfoLength);

	[DllImport("kernel32.dll", SetLastError = true)]
	private static extern bool AssignProcessToJobObject(IntPtr hJob, IntPtr hProcess);

	[DllImport("kernel32.dll", SetLastError = true)]
	private static extern bool CloseHandle(IntPtr hObject);

	[StructLayout(LayoutKind.Sequential)]
	private struct JOBOBJECT_BASIC_LIMIT_INFORMATION
	{
		public long PerProcessUserTimeLimit;
		public long PerJobUserTimeLimit;
		public uint LimitFlags;
		public UIntPtr MinimumWorkingSetSize;
		public UIntPtr MaximumWorkingSetSize;
		public uint ActiveProcessLimit;
		public UIntPtr Affinity;
		public uint PriorityClass;
		public uint SchedulingClass;
	}

	[StructLayout(LayoutKind.Sequential)]
	private struct IO_COUNTERS
	{
		public ulong ReadOperationCount;
		public ulong WriteOperationCount;
		public ulong OtherOperationCount;
		public ulong ReadTransferCount;
		public ulong WriteTransferCount;
		public ulong OtherTransferCount;
	}

	[StructLayout(LayoutKind.Sequential)]
	private struct JOBOBJECT_EXTENDED_LIMIT_INFORMATION
	{
		public JOBOBJECT_BASIC_LIMIT_INFORMATION BasicLimitInformation;
		public IO_COUNTERS IoInfo;
		public UIntPtr ProcessMemoryLimit;
		public UIntPtr JobMemoryLimit;
		public UIntPtr PeakProcessMemoryUsed;
		public UIntPtr PeakJobMemoryUsed;
	}
}
