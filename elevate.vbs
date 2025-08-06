Set UAC = CreateObject("Shell.Application")
UAC.ShellExecute "cmd", "/c cd /d """ & WScript.Arguments(0) & """ && start.bat", "", "runas", 1 