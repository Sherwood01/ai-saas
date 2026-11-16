# AI-SaaS 商业化总控平台

本工程是多租户 AI 短视频生成平台的商业化中枢，包含：
- **用户体系**：OAuth 2.0 (Google / GitHub / Microsoft) + 邮箱密码注册登录
- **订阅与支付**：Creem.io 全球代缴税支付集成、Webhook 自动激活与账单管理
- **资产中心**：统一 30 天保留期的视频存储空间 (`storage/videos/`)，与月度订阅周期完全对齐
- **多计算节点调度**：对接 `vocabulary-video-pipeline` (默认 Worker 端口 `5100`，通过 `node worker-server.js` 启动) 等无状态渲染引擎

## 快速启动

```bash
# 1. 复制环境变量并配置
cp .env.example .env.local

# 2. 启动本地开发服务 (默认端口 3100)
npm run dev
```

## 环境变量配置 (`.env.local`)
- `VOCAB_WORKER_URL`: 底层词汇视频管线 Worker 节点地址，如 `http://localhost:5100`
- `AUTH_SECRET`: Cookie 会话加密秘钥
- `CREEM_API_KEY`: Creem 支付 API 密钥
- `CREEM_WEBHOOK_SECRET`: Creem 异步验签密钥
- `CREEM_PRODUCT_PRO`: Pro 套餐产品 ID
- `CREEM_PRODUCT_ULTRA`: Ultra 套餐产品 ID
- `CREEM_PRODUCT_STUDIO`: Studio 套餐产品 ID
- 第三方 OAuth 配置 (Google / GitHub / Microsoft)

## 接入新 AI 服务 (Worker RPC 规范)
平台采用无状态计算节点架构，任何新开发的 AI 服务只需实现 4 个标准的 HTTP RPC 端点（任务派发、状态轮询、成品流式拉取、心跳检查）即可一键挂载：
- 完整规范文档：[WORKER_API_SPEC.md](file:///d:/Claude%20code/ai-saas/docs/WORKER_API_SPEC.md)
- 开箱即用参考模板：[worker-template.js](file:///d:/Claude%20code/ai-saas/docs/templates/worker-template.js)

