/**
 * AI-SaaS 标准微服务计算节点参考模板 (Worker Template Node.js)
 * 遵循 WORKER_API_SPEC.md 规范，提供纯粹无状态的瞬态渲染与流式传输
 *
 * 运行方式:
 *   node worker-template.js
 * 默认端口: 5200 (可通过环境变量 WORKER_PORT 覆盖)
 */

const http = require("http");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

// 1. 服务端口与关键目录配置
const PORT = process.env.WORKER_PORT || 5200;
const ROOT_DIR = __dirname;
const RENDERS_DIR = path.join(ROOT_DIR, "renders");

if (!fs.existsSync(RENDERS_DIR)) {
  fs.mkdirSync(RENDERS_DIR, { recursive: true });
}

// 2. 内存任务状态管理
const tasks = new Map();
const queue = [];
let isProcessing = false;

/**
 * 队列调度处理器：依次执行计算任务
 */
async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  const taskId = queue.shift();
  const task = tasks.get(taskId);
  if (!task) {
    isProcessing = false;
    processQueue();
    return;
  }

  task.status = "running";
  task.stage = "Initializing AI generation pipeline";
  task.progress = 20;
  task.updatedAt = new Date().toISOString();

  console.log(`[Worker Engine] Starting pipeline for Task: ${taskId}`);

  // 【在此接入您具体的执行命令，如 Python 脚本、Remotion、FFmpeg 等】
  // 示例模拟执行管道 (耗时 3 秒)
  setTimeout(() => {
    // 假设生成的文件名
    const outputFilename = `${task.word || "sample"}-${taskId}.mp4`;
    const targetFilePath = path.join(RENDERS_DIR, outputFilename);

    // 模拟写入一个测试视频文件 (若是真实脚本则为 child_process 产出)
    if (!fs.existsSync(targetFilePath)) {
      fs.writeFileSync(targetFilePath, Buffer.from("mock video stream content"));
    }

    task.status = "completed";
    task.stage = "Render complete and ready";
    task.progress = 100;
    task.videoUrl = `/api/worker/video/${encodeURIComponent(outputFilename)}`;
    task.downloadUrl = `/api/worker/video/${encodeURIComponent(outputFilename)}`;
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();

    console.log(`[Worker Engine] Task ${taskId} finished successfully.`);
    isProcessing = false;
    processQueue();
  }, 3000);
}

// 3. 创建 HTTP API 服务器
const server = http.createServer((req, res) => {
  // 允许跨域调用 (CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  const sendJson = (data, statusCode = 200) => {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
  };

  // 端点 1: 任务派发 POST /api/worker/render
  if (req.method === "POST" && pathname === "/api/worker/render") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const promptOrWord = payload.promptOrWord || payload.word;
        if (!promptOrWord) {
          return sendJson({ error: "promptOrWord is required" }, 400);
        }

        const taskId = payload.taskId || `task_${Date.now()}`;
        const newTask = {
          taskId,
          word: promptOrWord,
          pipelineType: payload.pipelineType || "custom",
          options: payload.options || {},
          status: "queued",
          stage: "Queued in worker engine",
          progress: 5,
          videoUrl: null,
          downloadUrl: null,
          error: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        tasks.set(taskId, newTask);
        queue.push(taskId);
        processQueue();

        return sendJson(newTask);
      } catch (e) {
        return sendJson({ error: "Invalid JSON format" }, 400);
      }
    });
    return;
  }

  // 端点 2: 任务状态轮询 GET /api/worker/status/:taskId
  if (req.method === "GET" && pathname.startsWith("/api/worker/status/")) {
    const taskId = decodeURIComponent(pathname.replace("/api/worker/status/", ""));
    const task = tasks.get(taskId);
    if (!task) {
      return sendJson({ error: "Task not found" }, 404);
    }
    return sendJson({
      taskId: task.taskId,
      status: task.status,
      stage: task.stage,
      progress: task.progress,
      videoUrl: task.videoUrl,
      downloadUrl: task.downloadUrl,
      error: task.error,
      updatedAt: task.updatedAt,
    });
  }

  // 端点 3: 成品流式拉取 GET /api/worker/video/:filename
  if (req.method === "GET" && pathname.startsWith("/api/worker/video/")) {
    const filename = decodeURIComponent(pathname.replace("/api/worker/video/", ""));
    const filePath = path.join(RENDERS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return sendJson({ error: "Rendered media file not found" }, 404);
    }

    const stat = fs.statSync(filePath);
    const range = req.headers.range;

    // 支持 HTTP 206 分块传输
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": stat.size,
        "Content-Type": "video/mp4",
        "Content-Disposition": `inline; filename="${filename}"`,
      });
      fs.createReadStream(filePath).pipe(res);
    }
    return;
  }

  // 端点 4: 心跳探测 GET /health
  if (pathname === "/health" || pathname === "/") {
    return sendJson({
      service: "Standard AI Compute Worker",
      status: "healthy",
      activeTasks: queue.length + (isProcessing ? 1 : 0),
      timestamp: new Date().toISOString(),
    });
  }

  sendJson({ error: "Endpoint Not Found" }, 404);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`====================================================`);
  console.log(` Standard AI Compute Worker Service Running!`);
  console.log(` Listening on: http://localhost:${PORT}`);
  console.log(` Ready to accept dispatch jobs from ai-saas.`);
  console.log(`====================================================`);
});

