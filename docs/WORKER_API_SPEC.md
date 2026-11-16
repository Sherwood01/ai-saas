# AI-SaaS 统一计算节点 RPC 通信契约规范 (Worker API Specification v2.0)

本文档规定了外部独立 AI 算力服务（例如 `vocabulary-video-pipeline`、`story-adventure-pipeline`、`voiceover-tts-pipeline` 等）接入 `ai-saas` 商业化中枢的标准 HTTP RPC 接口契约与开发规范。

---

## 1. 架构定位与设计哲学

在微服务分拆体系中：
* **`ai-saas` (商业化中枢，端口 3100)**：
  * 拥有多租户用户体系、第三方 OAuth、Creem 全球订阅与 Credits 计费钱包；
  * 拥有全局资产持久化存储 (`storage/videos/`) 与多模式资产库；
  * **职责定位**：业务总控与计费前置守卫。
* **各独立算力节点 (Compute Workers, 例如 5100, 5200, 5300)**：
  * 拥有特定领域的核心生成管道（例如 Remotion、TTS 声音合成、大模型分镜脚本执行等）；
  * **职责定位**：**纯粹、无状态（Stateless）的瞬态计算集群**。
  * **核心准则**：算力节点无需感知任何用户信息、无需处理复杂的支付订阅逻辑。渲染完成后，中枢会自动将视频/音频流式拉走持久化存储，彻底释放 Worker 端的存储压力。

---

## 2. 标准必须实现的 4 个 RPC 端点

任何新的 AI 服务（Node.js、Python、Go 均可）只需实现以下 4 个标准端点，即可无缝挂载接入 `ai-saas`：

```
┌────────────────────────────────────────────────────────┐
│               ai-saas 调度中枢 (客户端)                │
└───────────────────────────┬────────────────────────────┘
                            │
       1. POST /api/worker/render ──────► [任务入队/启动计算]
       2. GET  /api/worker/status/:id ──► [状态与阶段进度轮询]
       3. GET  /api/worker/video/:file ─► [成品流式转存拉取]
       4. GET  /health ─────────────────► [节点健康心跳探测]
```

### 2.1 任务派发接口：`POST /api/worker/render`

由 `ai-saas` 在扣除用户对应 Credits 后发起，通知 Worker 启动计算流水线。

* **请求格式**：`application/json`
* **请求体 (Request Payload)**：
  ```json
  {
    "taskId": "task_1794811176039_6eybo",
    "pipelineType": "vocab-shorts",
    "promptOrWord": "pipeline",
    "userId": "usr_1794215869248_9s7q7",
    "options": {
      "aspectRatio": "9:16",
      "style": "cinematic",
      "voiceId": "en-US-Aria"
    }
  }
  ```
* **响应体 (Response Body)**：
  * **状态码**：`200 OK`
  * **已入队/进行中**：
    ```json
    {
      "taskId": "task_1794811176039_6eybo",
      "status": "queued",
      "stage": "Queued in worker engine",
      "progress": 5,
      "videoUrl": null,
      "downloadUrl": null
    }
    ```
  * **命中本地缓存秒级完成（可选优化）**：
    若 Worker 发现本地已有渲染成品，可直接返回 `completed`：
    ```json
    {
      "taskId": "task_1794811176039_6eybo",
      "status": "completed",
      "stage": "Completed (Cached)",
      "progress": 100,
      "videoUrl": "/api/worker/video/pipeline-word-video.mp4",
      "downloadUrl": "/api/worker/video/pipeline-word-video.mp4"
    }
    ```

---

### 2.2 任务状态与进度轮询：`GET /api/worker/status/:taskId`

前端或中枢定时（通常每 2 秒）向 Worker 轮询当前任务的最新阶段与百分比。

* **URL 参数**：`:taskId` 为派发任务时生成的唯一 ID
* **响应体 (Response Body)**：
  * **运行中**：
    ```json
    {
      "taskId": "task_1794811176039_6eybo",
      "status": "running",
      "stage": "Rendering 1080p Remotion composition",
      "progress": 75,
      "videoUrl": null,
      "downloadUrl": null,
      "error": null,
      "updatedAt": "2026-11-16T14:39:34.000Z"
    }
    ```
  * **渲染完成**：
    ```json
    {
      "taskId": "task_1794811176039_6eybo",
      "status": "completed",
      "stage": "Render complete and ready",
      "progress": 100,
      "videoUrl": "/api/worker/video/pipeline-output.mp4",
      "downloadUrl": "/api/worker/video/pipeline-output.mp4",
      "updatedAt": "2026-11-16T14:40:12.000Z"
    }
    ```
  * **失败**：
    ```json
    {
      "taskId": "task_1794811176039_6eybo",
      "status": "failed",
      "stage": "Pipeline process exited with error",
      "progress": 0,
      "error": "Out of memory or TTS API error"
    }
    ```

---

### 2.3 成品流式拉取与下载：`GET /api/worker/video/:filename`

当中枢检测到 `status === "completed"` 时，会立即调用该接口，通过 Node.js Stream 将成品 MP4/MP3 流式传输并落盘至 `ai-saas/storage/videos/`。

* **URL 参数**：`:filename` 媒体文件名
* **传输规范**：
  * 支持 `Range` 标头（HTTP 206 部分内容传输），以便在转存前也可以在线直接 Seek 播放；
  * `Content-Type`: `video/mp4` 或 `audio/mpeg`；
  * 传输完成后，Worker 可视情况执行本地缓存自动清理。

---

### 2.4 心跳与健康检查：`GET /health`

用于 `ai-saas` 总控看板探测微服务节点的健康连通性与负载情况。

* **响应示例**：
  ```json
  {
    "service": "Vocab Video Render Worker",
    "status": "healthy",
    "activeTasks": 0,
    "timestamp": "2026-11-16T14:45:00.000Z"
  }
  ```

---

## 3. 在 ai-saas 中挂载新 Worker 的极简 3 步操作

当您开发完成了第二款服务（例如 `story-adventure-pipeline`，运行在端口 `5200`）后：

### 第 1 步：配置环境变量 (`.env.local`)
```bash
ADVENTURE_WORKER_URL=http://localhost:5200
```

### 第 2 步：在 `src/lib/tools-registry.ts` 中激活服务状态
将对应工具的 `status` 从 `"beta"` 改为 `"active"`：
```typescript
"story-adventure": {
  id: "story-adventure",
  name: "Story & Adventure Video Studio",
  creditCost: 3,
  workerEnvKey: "ADVENTURE_WORKER_URL",
  defaultEndpoint: "http://localhost:5200",
  status: "active",
  badgeText: "Active",
  ...
}
```

### 第 3 步：一键联调测试
启动您的新 Worker，直接在 `ai-saas` 前端工作台点击发起生成，中枢会自动扣减 3 Credits、派发任务并完成流式转存归档！

