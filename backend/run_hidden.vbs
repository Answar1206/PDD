Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd.exe /c .venv\Scripts\python.exe launcher.py", 0, False
