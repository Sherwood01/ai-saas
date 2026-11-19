# ==============================================================================
# AI-SaaS 全栈一键启动脚本 (Windows PowerShell 原生支持)
# 一次性启动 SaaS Web 主站 (3000) 以及两个算力流水线 Worker (4980, 4990)
# 默认采用极速生产模式 (npm run start)，毫秒级响应并开启 CDN 强缓存
# 传入 -Dev 参数可切换为开发调试热更新模式 (.\start-all.ps1 -Dev)
# 支持 Ctrl+C 优雅整体联动退出，杜绝后台孤儿进程与端口占用冲突
# ==============================================================================

param (
    [switch]$Dev
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptDir

$VocabDir = Join-Path $ProjectRoot "vocabulary-video-pipeline"
$IpDir = Join-Path $ProjectRoot "ip-video-pipeline"
$SaasDir = $ScriptDir

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "    [START] 正在启动 AI-SaaS 全栈服务与多模态 Worker 节点   " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# 验证各依赖微服务目录是否存在
if (-not (Test-Path $VocabDir)) {
    Write-Host "[ERROR] 未找到 Vocab Worker 目录: $VocabDir" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $IpDir)) {
    Write-Host "[ERROR] 未找到 IP Worker 目录: $IpDir" -ForegroundColor Red
    exit 1
}

# 1. 启动 Vocab Shorts Worker (Port 4980)
Write-Host "[1/3] 正在启动 Vocab Worker (端口 4980)..." -ForegroundColor Blue
$vocabProc = Start-Process -FilePath "node" -ArgumentList "worker-server.js" -WorkingDirectory $VocabDir -PassThru -NoNewWindow
Write-Host "[OK] Vocab Worker 已启动 (PID: $($vocabProc.Id))" -ForegroundColor Green
Start-Sleep -Seconds 1

# 2. 启动 IP Explainer Worker (Port 4990)
Write-Host "[2/3] 正在启动 IP Worker (端口 4990)..." -ForegroundColor Blue
$ipProc = Start-Process -FilePath "node" -ArgumentList "worker-server.js" -WorkingDirectory $IpDir -PassThru -NoNewWindow
Write-Host "[OK] IP Worker 已启动 (PID: $($ipProc.Id))" -ForegroundColor Green
Start-Sleep -Seconds 1

# 3. 启动 SaaS 前端与 API Web 主站 (Port 3000)
Write-Host "[3/3] 正在准备 SaaS Web 主站 (端口 3000)..." -ForegroundColor Blue

if ($Dev) {
    Write-Host "[MODE] 当前运行模式: 开发调试模式 (npm run dev)" -ForegroundColor Yellow
} else {
    Write-Host "[MODE] 当前运行模式: 极速生产模式 (npm run start) - 已开启 CDN 缓存与资源高压缩" -ForegroundColor Green
    $dotNext = Join-Path $SaasDir ".next"
    if (-not (Test-Path $dotNext)) {
        Write-Host "[BUILD] 正在执行生产优化打包 (首次运行构建)..." -ForegroundColor Yellow
        npm run build
    }
}

Write-Host "======================================================" -ForegroundColor Green
Write-Host " [READY] 全部服务已就绪！终端按 Ctrl + C 可一并关闭所有服务 " -ForegroundColor Green
Write-Host " [*] SaaS 前端:   http://localhost:3000              " -ForegroundColor Green
Write-Host " [*] Vocab Worker: http://localhost:4980              " -ForegroundColor Green
Write-Host " [*] IP Worker:    http://localhost:4990              " -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green

try {
    if ($Dev) {
        npm run dev
    } else {
        npm run start
    }
} finally {
    Write-Host ""
    Write-Host "[SHUTDOWN] 正在安全关闭全部后台服务，请稍候..." -ForegroundColor Yellow
    if ($vocabProc -and -not $vocabProc.HasExited) {
        Stop-Process -Id $vocabProc.Id -Force -ErrorAction SilentlyContinue
    }
    if ($ipProc -and -not $ipProc.HasExited) {
        Stop-Process -Id $ipProc.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[DONE] 所有服务已安全停止。" -ForegroundColor Green
}
