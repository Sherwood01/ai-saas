/**
 * 统一视频生成工作节点（Unified Video Worker）标准通信协议
 * 任何后端视频生成引擎（如 词汇短视频、YouTube探险视频、企业新闻视频）均遵循此标准契约
 */

export type PipelineType = "vocab-shorts" | "ip-explainer" | "story-adventure" | "voiceover" | "custom";

/**
 * 派发给 Worker 的标准渲染请求体
 */
export interface WorkerRenderPayload {
  taskId: string;
  pipelineType: PipelineType;
  promptOrWord: string;
  userId?: string;
  options?: {
    voiceId?: string;
    style?: string;
    quality?: "720p" | "1080p";
    enableWatermark?: boolean;
    [key: string]: any;
  };
}

/**
 * Worker 返回的标准进度与状态响应体
 */
export interface WorkerTaskStatusResponse {
  taskId: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  stage: string;
  progress: number; // 0 ~ 100
  logs?: string[];
  videoUrl?: string | null;
  downloadUrl?: string | null;
  durationSeconds?: number | null;
  error?: string | null;
  updatedAt: string;
}

