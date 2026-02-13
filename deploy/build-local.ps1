# Build Docker image locally and prepare for upload to EC2
# Run this from your project root on Windows

# Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t hivetalk:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green

# Save image to tar.gz
Write-Host "Saving image to hivetalk.tar.gz..." -ForegroundColor Cyan
docker save hivetalk:latest | gzip > hivetalk.tar.gz

$size = (Get-Item hivetalk.tar.gz).Length / 1MB
Write-Host "Image saved! Size: $([math]::Round($size, 2)) MB" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Next Steps:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Upload to EC2:" -ForegroundColor White
Write-Host "   scp -i your-key.pem hivetalk.tar.gz ec2-user@YOUR_EC2_IP:~/"
Write-Host ""
Write-Host "2. Upload docker-compose:" -ForegroundColor White
Write-Host "   scp -i your-key.pem docker-compose.simple.yml ec2-user@YOUR_EC2_IP:~/docker-compose.yml"
Write-Host ""
Write-Host "3. Upload .env file:" -ForegroundColor White
Write-Host "   scp -i your-key.pem .env ec2-user@YOUR_EC2_IP:~/.env"
Write-Host ""
Write-Host "4. On EC2, load and run:" -ForegroundColor White
Write-Host "   gunzip -c hivetalk.tar.gz | docker load"
Write-Host "   docker-compose up -d"
Write-Host ""
