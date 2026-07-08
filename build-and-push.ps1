# build-and-push.ps1
# Script to safely build and push Artistverse_X Docker images with version tagging

param (
    [Parameter(Mandatory=$false)]
    [string]$VersionTag = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Building and Pushing Artistverse_X" -ForegroundColor Cyan
Write-Host " Version Tag: $VersionTag" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Backend
Write-Host "[1/4] Building Backend Image (lingth/artistverse_x-backend:$VersionTag)..." -ForegroundColor Green
docker build -t lingth/artistverse_x-backend:$VersionTag ./Backend_Artistverse_X

Write-Host "[2/4] Pushing Backend Image to Docker Hub..." -ForegroundColor Green
docker push lingth/artistverse_x-backend:$VersionTag

# 2. Frontend
Write-Host "[3/4] Building Frontend Image (lingth/artistverse_x-frontend:$VersionTag)..." -ForegroundColor Green
docker build -t lingth/artistverse_x-frontend:$VersionTag ./Frontend_Artistverse_X

Write-Host "[4/4] Pushing Frontend Image to Docker Hub..." -ForegroundColor Green
docker push lingth/artistverse_x-frontend:$VersionTag

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " SUCCESS! Images have been pushed." -ForegroundColor Green
Write-Host " "
Write-Host " Next Steps:" -ForegroundColor Yellow
Write-Host " 1. Go to Portainer -> Stacks -> artistverse -> Editor"
Write-Host " 2. Update your docker-compose.yml to use the new tag: " -ForegroundColor Yellow
Write-Host "      image: lingth/artistverse_x-backend:$VersionTag"
Write-Host "      image: lingth/artistverse_x-frontend:$VersionTag"
Write-Host " 3. Click 'Update the stack'"
Write-Host "=========================================" -ForegroundColor Cyan
