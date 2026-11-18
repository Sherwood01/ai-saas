import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { WorkerRenderPayload, WorkerTaskStatusResponse, PipelineType } from "./worker-types";
import { getWorkerEndpoint } from "./tools-registry";

const STORAGE_VIDEOS_DIR = path.join(process.cwd(), "storage", "videos");

// 确保 ai-saas 本地存储目录存在
if (!fs.existsSync(STORAGE_VIDEOS_DIR)) {
  fs.mkdirSync(STORAGE_VIDEOS_DIR, { recursive: true });
}

export class WorkerClient {
  /**
   * 根据业务类型获取对应的 Worker 服务节点地址 (基于统一注册表)
   */
  static getWorkerEndpoint(pipelineType: PipelineType = "vocab-shorts"): string {
    return getWorkerEndpoint(pipelineType);
  }

  /**
   * 1. 向指定的 Worker 节点派发标准视频渲染任务 (POST /api/worker/render)
   */
  static async dispatchTask(payload: WorkerRenderPayload): Promise<{
    success: boolean;
    workerUrl: string;
    data?: WorkerTaskStatusResponse;
    error?: string;
  }> {
    const workerUrl = this.getWorkerEndpoint(payload.pipelineType);

    try {
      const resp = await fetch(`${workerUrl}/api/worker/render`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        return {
          success: false,
          workerUrl,
          error: `Worker returned error: ${resp.status} - ${errText}`,
        };
      }

      const data = (await resp.json()) as WorkerTaskStatusResponse;
      return { success: true, workerUrl, data };
    } catch (err: any) {
      console.warn(`[Worker Dispatch Notice] Failed to connect to worker at ${workerUrl}: ${err.message}`);
      return {
        success: false,
        workerUrl,
        error: `Could not connect to Worker service: ${err.message}`,
      };
    }
  }

  /**
   * 2. 向 Worker 节点轮询或同步任务最新进度 (GET /api/worker/status/:taskId)
   */
  static async queryTaskStatus(
    taskId: string,
    workerUrlOrPipeline: string | PipelineType = "vocab-shorts"
  ): Promise<WorkerTaskStatusResponse | null> {
    const workerUrl = workerUrlOrPipeline.startsWith("http")
      ? workerUrlOrPipeline
      : this.getWorkerEndpoint(workerUrlOrPipeline as PipelineType);

    try {
      const resp = await fetch(`${workerUrl}/api/worker/status/${encodeURIComponent(taskId)}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(4000),
      });

      if (!resp.ok) return null;
      return (await resp.json()) as WorkerTaskStatusResponse;
    } catch {
      return null;
    }
  }

  /**
   * 3. 核心流式传输：当 Worker 渲染完成后，将成品 MP4 流式拉取并落盘存储至 ai-saas/storage/videos/
   * 彻底解除 Worker 端的持久存储压力
   */
  static async syncVideoToStorage(
    downloadPathOrUrl: string, 
    targetFilename: string,
    workerUrlOrPipeline?: string | PipelineType
  ): Promise<string | null> {
    const baseWorkerUrl = !workerUrlOrPipeline
      ? this.getWorkerEndpoint()
      : workerUrlOrPipeline.startsWith("http")
      ? workerUrlOrPipeline
      : this.getWorkerEndpoint(workerUrlOrPipeline as PipelineType);

    const remoteUrl = downloadPathOrUrl.startsWith("http")
      ? downloadPathOrUrl
      : `${baseWorkerUrl}${downloadPathOrUrl}`;
    const localDest = path.join(STORAGE_VIDEOS_DIR, targetFilename);

    try {
      console.log(`[Storage Sync] Downloading finished video from ${remoteUrl} to ${localDest}...`);
      const resp = await fetch(remoteUrl);
      if (!resp.ok || !resp.body) {
        console.error(`[Storage Sync] Failed to download video: ${resp.status}`);
        return null;
      }

      // @ts-ignore Node Readable stream pipeline
      const nodeStream = Readable.fromWeb(resp.body);
      const fileWriteStream = fs.createWriteStream(localDest);
      await pipeline(nodeStream, fileWriteStream);

      console.log(`[Storage Sync] Video successfully saved into ai-saas storage: ${targetFilename}`);
      return `/api/video-file/${encodeURIComponent(targetFilename)}`;
    } catch (err: any) {
      console.error("[Storage Sync Exception]", err);
      return null;
    }
  }

  /**
   * 4. 向对应 Worker 节点发送彻底清理指令 (POST /api/worker/cleanup)
   * 彻底清除该视频在 Worker 端产生的所有中间渲染缓存、草稿 JSON、动态 Remotion 组件及音频目录
   */
  static async cleanupTask(
    taskId: string,
    word: string,
    pipelineType: PipelineType = "vocab-shorts"
  ): Promise<{ success: boolean; deletedFiles?: string[]; error?: string }> {
    const workerUrl = this.getWorkerEndpoint(pipelineType);

    try {
      const resp = await fetch(`${workerUrl}/api/worker/cleanup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, word }),
        signal: AbortSignal.timeout(6000),
      });

      if (!resp.ok) {
        return { success: false, error: `Worker cleanup returned HTTP ${resp.status}` };
      }

      const data = await resp.json();
      return { success: true, deletedFiles: data.deletedFiles };
    } catch (err: any) {
      console.warn(`[Worker Cleanup Notice] Failed to call cleanup on ${workerUrl}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}
