#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup script for deploying the IT Software Development Portal on a new GitHub account.

.DESCRIPTION
    This script configures the portal for a new GitHub organization or user account.
    It updates all references, URLs, and configurations to match the new owner.

.EXAMPLE
    .\setup-portal.ps1
#>

param(
    [string]$GitHubOwner,
    [string]$RepoName = "github-pages",
    [string]$ProjectUrl,
    [string]$KumaUrl,
    [string]$DepartmentName = "IT Software Development"
)

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  IT Development Portal - Setup Wizard" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# --- Gather Configuration ---

if (-not $GitHubOwner) {
    $GitHubOwner = Read-Host "Enter your GitHub username or organization name"
}
if (-not $GitHubOwner) {
    Write-Host "ERROR: GitHub owner is required." -ForegroundColor Red
    exit 1
}

if (-not $RepoName) {
    $RepoName = Read-Host "Enter repository name (default: github-pages)"
    if (-not $RepoName) { $RepoName = "github-pages" }
}

$OwnerType = Read-Host "Is '$GitHubOwner' a user or organization? (user/org, default: org)"
if (-not $OwnerType) { $OwnerType = "org" }

if (-not $ProjectUrl) {
    $ProjectUrl = Read-Host "Enter GitHub Project board URL (leave blank to skip)"
}

if (-not $KumaUrl) {
    $KumaUrl = Read-Host "Enter Uptime Kuma URL (e.g., https://kuma.example.com, leave blank to skip)"
}

$DepartmentInput = Read-Host "Enter department name (default: $DepartmentName)"
if ($DepartmentInput) { $DepartmentName = $DepartmentInput }

$PortalUrl = "https://$GitHubOwner.github.io/$RepoName/"

Write-Host ""
Write-Host "--- Configuration Summary ---" -ForegroundColor Yellow
Write-Host "  GitHub Owner:    $GitHubOwner"
Write-Host "  Repository:      $RepoName"
Write-Host "  Owner Type:      $OwnerType"
Write-Host "  Portal URL:      $PortalUrl"
Write-Host "  Project Board:   $(if ($ProjectUrl) { $ProjectUrl } else { '(none)' })"
Write-Host "  Uptime Kuma:     $(if ($KumaUrl) { $KumaUrl } else { '(none)' })"
Write-Host "  Department:      $DepartmentName"
Write-Host ""

$confirm = Read-Host "Proceed with setup? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "[1/5] Updating _config.yml..." -ForegroundColor Green

# --- Update _config.yml ---
$configPath = Join-Path $PSScriptRoot "_config.yml"
if (Test-Path $configPath) {
    $configContent = Get-Content $configPath -Raw
    $configContent = $configContent -replace 'baseurl:\s*"[^"]*"', "baseurl: `"/$RepoName`""
    $configContent = $configContent -replace 'url:\s*"[^"]*"', "url: `"https://$GitHubOwner.github.io`""
    $configContent = $configContent -replace 'title:\s*"[^"]*"', "title: `"$DepartmentName Portal`""
    Set-Content $configPath $configContent -NoNewline
    Write-Host "  Updated _config.yml" -ForegroundColor Gray
} else {
    Write-Host "  WARNING: _config.yml not found" -ForegroundColor Yellow
}

Write-Host "[2/5] Updating index.md..." -ForegroundColor Green

# --- Update index.md ---
$indexPath = Join-Path $PSScriptRoot "index.md"
if (Test-Path $indexPath) {
    $indexContent = Get-Content $indexPath -Raw
    $indexContent = $indexContent -replace 'IT Software Development Portal', "$DepartmentName Portal"
    
    # Update project board URL if provided
    if ($ProjectUrl) {
        $indexContent = $indexContent -replace 'https://github\.com/users/fahmiyuda31/projects/7', $ProjectUrl
    }
    
    Set-Content $indexPath $indexContent -NoNewline
    Write-Host "  Updated index.md" -ForegroundColor Gray
} else {
    Write-Host "  WARNING: index.md not found" -ForegroundColor Yellow
}

Write-Host "[3/5] Updating monitoring.md..." -ForegroundColor Green

# --- Update monitoring.md ---
$monitoringPath = Join-Path $PSScriptRoot "monitoring.md"
if (Test-Path $monitoringPath) {
    if ($KumaUrl) {
        $monitoringContent = Get-Content $monitoringPath -Raw
        $monitoringContent = $monitoringContent -replace 'https://kuma\.ravelware\.cloud/', "$KumaUrl"
        $monitoringContent = $monitoringContent -replace 'https://kuma\.ravelware\.cloud', "$KumaUrl"
        Set-Content $monitoringPath $monitoringContent -NoNewline
        Write-Host "  Updated monitoring.md with $KumaUrl" -ForegroundColor Gray
    } else {
        Write-Host "  Skipped (no Kuma URL provided)" -ForegroundColor Gray
    }
} else {
    Write-Host "  WARNING: monitoring.md not found" -ForegroundColor Yellow
}

Write-Host "[4/5] Updating app documents..." -ForegroundColor Green

# --- Update _apps/*.md ---
$appsDir = Join-Path $PSScriptRoot "_apps"
if (Test-Path $appsDir) {
    $appFiles = Get-ChildItem $appsDir -Filter "*.md"
    foreach ($file in $appFiles) {
        $content = Get-Content $file.FullName -Raw
        $content = $content -replace 'Fyudaz-Apps', $GitHubOwner
        $content = $content -replace 'https://github\.com/Fyudaz-Apps/', "https://github.com/$GitHubOwner/"
        $content = $content -replace 'https://github\.com/PT-Ravelware-Technology-Indonesia/', "https://github.com/$GitHubOwner/"
        
        if ($ProjectUrl) {
            $content = $content -replace 'https://github\.com/users/fahmiyuda31/projects/7', $ProjectUrl
        }
        
        Set-Content $file.FullName $content -NoNewline
        Write-Host "  Updated $($file.Name)" -ForegroundColor Gray
    }
} else {
    Write-Host "  WARNING: _apps/ directory not found" -ForegroundColor Yellow
}

Write-Host "[5/5] Updating deploy workflow..." -ForegroundColor Green

# --- Update GitHub Actions deploy workflow ---
$workflowPath = Join-Path $PSScriptRoot ".github" "workflows" "deploy.yml"
if (Test-Path $workflowPath) {
    Write-Host "  deploy.yml exists (no changes needed - works generically)" -ForegroundColor Gray
} else {
    Write-Host "  WARNING: .github/workflows/deploy.yml not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Create a new repository on GitHub:" -ForegroundColor White
Write-Host "     https://github.com/new" -ForegroundColor Cyan
Write-Host "     Name: $RepoName" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Push this repo to your account:" -ForegroundColor White
Write-Host "     git remote set-url origin https://github.com/$GitHubOwner/$RepoName.git" -ForegroundColor Cyan
Write-Host "     git push -u origin master" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Enable GitHub Pages:" -ForegroundColor White
Write-Host "     Go to: https://github.com/$GitHubOwner/$RepoName/settings/pages" -ForegroundColor Cyan
Write-Host "     Source: GitHub Actions" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Your portal will be live at:" -ForegroundColor White
Write-Host "     $PortalUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "  5. Customize further:" -ForegroundColor White
Write-Host "     - Edit _sop/*.md to add your SOPs" -ForegroundColor Gray
Write-Host "     - Edit _apps/*.md to add your app docs" -ForegroundColor Gray
Write-Host "     - Edit assets/css/style.css to change branding" -ForegroundColor Gray
Write-Host ""
