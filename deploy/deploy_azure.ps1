# Azure 自动化部署脚本
# 适用服务: Azure App Service (Linux Web App) / Azure Container App

param (
    [string]$ResourceGroup = "rg-travel-agent",
    [string]$Location = "eastasia",
    [string]$AppServicePlan = "asp-travel-agent",
    [string]$AppName = "travel-planner-agent",
    [string]$CustomDomain = "travel.hisunalan.me"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🚀 开始部署 Travel Planner Agent 至 Microsoft Azure" -ForegroundColor Cyan
Write-Host "  📌 目标域名: $CustomDomain" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. 检查 Azure 登录状态
Write-Host "`n[1/5] 检查 Azure CLI 登录..." -ForegroundColor Yellow
$account = az account show --output json 2>$null
if (-not $account) {
    Write-Host "⚠️ 未检测到有效登录，正在唤起浏览器进行 Azure 交互式登录..." -ForegroundColor Yellow
    az login
}
$accountInfo = az account show | ConvertFrom-Json
Write-Host "✅ 已登录 Azure 订阅: $($accountInfo.name) ($($accountInfo.id))" -ForegroundColor Green

# 2. 创建/确认资源组
Write-Host "`n[2/5] 确保资源组存在 [$ResourceGroup] ($Location)..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output table

# 3. 创建 App Service Plan (Linux)
Write-Host "`n[3/5] 确保 App Service Plan 存在 [$AppServicePlan]..." -ForegroundColor Yellow
az appservice plan create --name $AppServicePlan --resource-group $ResourceGroup --location $Location --is-linux --sku B1 --output table

# 4. 创建 Web App (支持源码打包 / 容器)
Write-Host "`n[4/5] 创建/更新 Web App [$AppName]..." -ForegroundColor Yellow
az webapp create --resource-group $ResourceGroup --plan $AppServicePlan --name $AppName --runtime "PYTHON:3.11" --output table

# 配置应用设置 (环境变量)
Write-Host "配置环境变量与超时参数..." -ForegroundColor Yellow
az webapp config appsettings set --resource-group $ResourceGroup --name $AppName --settings `
    WEBSITES_PORT=80 `
    SCM_DO_BUILD_DURING_DEPLOYMENT=true `
    LLM_API_BASE="https://api.hisunalan.me/v1" `
    LLM_MODEL="gemini-3.7-flash" `
    --output table

# 5. 绑定自定义域名提示
Write-Host "`n[5/5] 自定义域名绑定指南 [$CustomDomain]" -ForegroundColor Yellow
$defaultHostname = (az webapp show --name $AppName --resource-group $ResourceGroup --query defaultHostName -o tsv)
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "✅ 应用部署基础配置完成！默认访问地址: https://$defaultHostname" -ForegroundColor Green
Write-Host "`n🌐 关联自定义域名 $CustomDomain 的 DNS 解析步骤：" -ForegroundColor Cyan
Write-Host "请在您的域名服务商 (如 Cloudflare / DNSPod / 阿里云) 添加以下 2 条记录：" -ForegroundColor White
Write-Host "  1. CNAME 记录: travel -> $defaultHostname" -ForegroundColor Yellow
Write-Host "  2. TXT 记录: asuid.travel -> $defaultHostname (或 Azure 验证码)" -ForegroundColor Yellow
Write-Host "`nDNS 解析生效后，执行以下命令即可自动签发免费 SSL 证书：" -ForegroundColor Cyan
Write-Host "  az webapp config hostname add --webapp-name $AppName --resource-group $ResourceGroup --hostname $CustomDomain" -ForegroundColor White
Write-Host "  az webapp config ssl bind --certificate-type ManagedCertificate --name $AppName --resource-group $ResourceGroup --hostname $CustomDomain" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
