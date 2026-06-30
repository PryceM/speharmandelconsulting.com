param(
    [Parameter(Position = 0)]
    [ValidateSet('check','preview')]
    [string]$Command = 'check'
)

$ErrorActionPreference = 'Stop'
$RepoPath = 'C:\Users\pmandel.ATTAIN\GitHub\speharmandelconsulting.com'
$GitExe = 'C:\Program Files\Git\cmd\git.exe'
$IndexPath = Join-Path $RepoPath 'public\index.html'
$PreviewRoot = Join-Path $RepoPath 'public'

Set-Location -Path $RepoPath

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
    & $GitExe @Args
}

function Require-File([string]$Path, [string]$Label) {
    if (-not (Test-Path -Path $Path -PathType Leaf)) { throw "$Label not found: $Path" }
}

function Require-Folder([string]$Path, [string]$Label) {
    if (-not (Test-Path -Path $Path -PathType Container)) { throw "$Label not found: $Path" }
}

function Start-PreviewServer {
    Write-Host 'http://localhost:8080/'
    $listener = [System.Net.HttpListener]::new()
    $listener.Prefixes.Add('http://localhost:8080/')
    $listener.Start()
    try {
        while ($listener.IsListening) {
            $context = $listener.GetContext()
            $requestPath = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
            if ([string]::IsNullOrWhiteSpace($requestPath)) { $requestPath = 'index.html' }
            $filePath = Join-Path $PreviewRoot $requestPath
            if ((Test-Path $filePath) -and -not (Get-Item $filePath).PSIsContainer) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $ext = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
                $mime = switch ($ext) {
                    '.html' { 'text/html; charset=utf-8' }
                    '.css' { 'text/css; charset=utf-8' }
                    '.js' { 'application/javascript; charset=utf-8' }
                    '.txt' { 'text/plain; charset=utf-8' }
                    default { 'application/octet-stream' }
                }
                $context.Response.StatusCode = 200
                $context.Response.ContentType = $mime
                $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $msg = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
                $context.Response.StatusCode = 404
                $context.Response.OutputStream.Write($msg, 0, $msg.Length)
            }
            $context.Response.Close()
        }
    } finally {
        $listener.Stop()
        $listener.Close()
    }
}

function Run-Check {
    Write-Host 'Running check...'
    Require-Folder (Join-Path $RepoPath '.git') '.git'
    Require-File (Join-Path $RepoPath 'wrangler.jsonc') 'wrangler.jsonc'
    Require-File $IndexPath 'public/index.html'
    Require-File (Join-Path $RepoPath 'src\worker.js') 'src/worker.js'
    Require-File (Join-Path $RepoPath 'public\styles.css') 'public/styles.css'
    Require-File (Join-Path $RepoPath 'public\script.js') 'public/script.js'

    $branch = (Invoke-Git branch --show-current).Trim()
    $commit = (Invoke-Git rev-parse --short HEAD).Trim()
    Write-Host "Branch: $branch"
    Write-Host "Commit: $commit"
    Write-Host 'Git status:'
    Invoke-Git status --short

    $index = Get-Content -Path $IndexPath -Raw
    $worker = Get-Content -Path (Join-Path $RepoPath 'src\worker.js') -Raw
    if ($index -notmatch 'action="/api/contact"|action=''/api/contact''') { throw 'Missing /api/contact form action.' }
    if ($worker -notmatch 'formsubmit\.co/ajax' -or $worker -notmatch 'noah\.z\.mandel@gmail\.com') { throw 'Worker contact routing markers missing.' }
    if ($index -notmatch 'styles\.css' -or $index -notmatch 'script\.js') { throw 'Missing expected public asset references.' }
    Write-Host 'Check complete.'
}

switch ($Command) {
    'check' { Run-Check }
    'preview' { Run-Check; Start-PreviewServer }
}
