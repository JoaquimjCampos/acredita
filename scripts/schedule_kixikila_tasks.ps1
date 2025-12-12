# Requires: PowerShell 5.1+
# Schedules daily tasks to automate Kixikila payouts

param(
    [string]$ProjectRoot = "C:\apps\Acredita",
    [string]$PythonPath = "C:\apps\Acredita\venv\Scripts\python.exe"
)

$autoCreateTask = {
    param($ProjectRoot, $PythonPath)
    $Action = New-ScheduledTaskAction -Execute $PythonPath -Argument "`"$ProjectRoot\manage.py`" auto_create_payouts"
    $Trigger = New-ScheduledTaskTrigger -Daily -At 02:00
    $Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -RunLevel Highest
    Register-ScheduledTask -TaskName "Kixikila_AutoCreatePayouts" -Action $Action -Trigger $Trigger -Principal $Principal -Force
}

$processTask = {
    param($ProjectRoot, $PythonPath)
    $Action = New-ScheduledTaskAction -Execute $PythonPath -Argument "`"$ProjectRoot\manage.py`" process_eligible_payouts"
    $Trigger = New-ScheduledTaskTrigger -Daily -At 03:00
    $Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -RunLevel Highest
    Register-ScheduledTask -TaskName "Kixikila_ProcessEligiblePayouts" -Action $Action -Trigger $Trigger -Principal $Principal -Force
}

& $autoCreateTask $ProjectRoot $PythonPath
& $processTask $ProjectRoot $PythonPath

Write-Host "✓ Scheduled tasks created: Kixikila_AutoCreatePayouts, Kixikila_ProcessEligiblePayouts"