Set sh = CreateObject("WScript.Shell")
startup = sh.SpecialFolders("Startup")
Set shortcut = sh.CreateShortcut(startup & "\ForensiqBackend.lnk")
shortcut.TargetPath = "wscript.exe"
shortcut.Arguments = """c:\Users\darma\OneDrive\Desktop\PDD\backend\run_hidden.vbs"""
shortcut.WorkingDirectory = "c:\Users\darma\OneDrive\Desktop\PDD\backend"
shortcut.WindowStyle = 0
shortcut.Save
