# ==============================================================================
# AI-SaaS 全栈服务一键清理/停止脚本 (Windows PowerShell 原生支持)
# 强制检查并安全释放 3000 (SaaS Web)、4980 (Vocab Worker)、4990 (IP Worker) 端口
# 解决终端异常关闭造成的残留孤儿进程或端口占用冲突
# ==============================================================================

$targetPorts = @(3000, 4980, 4990)

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "    [CLEANUP] 正在检测并释放 SaaS 及各 Worker 端口与残留进程 " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

foreach ($port in $targetPorts) {
    Write-Host "检查端口 ${port}..." -ForegroundColor Yellow
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($conn in $conns) {
            $pidToKill = $conn.OwningProcess
            if ($pidToKill -and $pidToKill -ne 0) {
                Write-Host "正在终止占用端口 ${port} 的残留进程 (PID: $pidToKill)..." -ForegroundColor Yellow
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Host "[OK] 端口 ${port} 已成功释放" -ForegroundColor Green
    } else {
        Write-Host "[OK] 端口 ${port} 当前空闲" -ForegroundColor Green
    }
}

Write-Host "======================================================" -ForegroundColor Green
Write-Host " [DONE] 全部相关服务端口清理完成！                        " -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
