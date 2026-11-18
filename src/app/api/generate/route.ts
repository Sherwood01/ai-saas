import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeQuota, recordVideoTask, updateVideoTaskStatus } from "@/lib/db";
import { WorkerClient } from "@/lib/worker-client";
import { getSessionUser } from "@/lib/auth";
import { getToolConfig } from "@/lib/tools-registry";
import { PipelineType } from "@/lib/worker-types";

/**
 * 触发视频生成任务（面向商业用户的多引擎调度中枢）
 * 1. 鉴权校验 -> 2. 根据工具类型扣除 Credits -> 3. 向对应 Worker 节点派发任务
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { word, pipelineType = "vocab-shorts", options = {} } = body as {
      word: string;
      pipelineType?: PipelineType;
      options?: Record<string, any>;
    };

    if (!word || typeof word !== "string" || !word.trim()) {
      return NextResponse.json({ error: "Word parameter is required." }, { status: 400 });
    }

    // 支持中文知识产权词汇（如"商业秘密"）及英文词汇
    const cleanWord =
      pipelineType === "ip-explainer"
        ? word.trim().replace(/[^\u4e00-\u9fa5a-zA-Z0-9_\-\s]/g, "")
        : word.trim().toLowerCase().replace(/[^a-z0-9_-]/gi, "");

    if (!cleanWord) {
      return NextResponse.json({ error: "Invalid word provided." }, { status: 400 });
    }

    // 1. 鉴权校验：未登录用户严禁调用商业生成
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to generate videos.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // 2. 根据工具注册配置动态检查并扣除 Credits
    const toolConfig = getToolConfig(pipelineType);
    const quotaCheck = checkAndConsumeQuota(user.id, toolConfig.creditCost);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: "Quota exceeded",
          message: `You do not have enough credits to launch ${toolConfig.name} (requires ${toolConfig.creditCost} credits). Please upgrade your subscription to continue.`,
          user: quotaCheck.user,
          code: "QUOTA_EXCEEDED",
        },
        { status: 402 } // HTTP 402 Payment Required
      );
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    recordVideoTask(taskId, user.id, cleanWord, pipelineType);

    // 3. 向专用远程 Worker 服务 (worker-server.js 5100) 派发计算任务
    const workerDispatch = await WorkerClient.dispatchTask({
      taskId,
      pipelineType,
      promptOrWord: cleanWord,
      userId: user.id,
      options,
    });

    if (workerDispatch.success && workerDispatch.data) {
      const workerTask = workerDispatch.data;

      // 若 Worker 节点命中本地缓存直接完成，立即触发视频流式转存
      if (workerTask.status === "completed" && (workerTask.downloadUrl || workerTask.videoUrl)) {
        const downloadUrl = workerTask.downloadUrl || workerTask.videoUrl || "";
        const targetFilename = `${cleanWord}-${taskId}.mp4`;
        const saasVideoUrl = await WorkerClient.syncVideoToStorage(downloadUrl, targetFilename, workerDispatch.workerUrl);

        const completedTask = updateVideoTaskStatus(taskId, {
          status: "completed",
          stage: "Ready in SaaS Storage (Cached)",
          progress: 100,
          videoUrl: saasVideoUrl || `/api/video-file/${encodeURIComponent(targetFilename)}`,
          playUrl: saasVideoUrl || `/api/video-file/${encodeURIComponent(targetFilename)}`,
          downloadUrl: saasVideoUrl || `/api/video-file/${encodeURIComponent(targetFilename)}`,
          completedAt: new Date().toISOString(),
        });

        return NextResponse.json({
          taskId,
          message: "Task completed instantly from worker cache.",
          remainingQuota: quotaCheck.remaining,
          task: completedTask,
        });
      }

      const initialTask = updateVideoTaskStatus(taskId, {
        status: workerTask.status,
        stage: workerTask.stage,
        progress: workerTask.progress,
        error: workerTask.error,
      });

      return NextResponse.json({
        taskId,
        message: "Task dispatched to dedicated Render Worker.",
        remainingQuota: quotaCheck.remaining,
        task: initialTask,
      });
    }

    // 4. 若管线节点离线或报错
    updateVideoTaskStatus(taskId, {
      status: "failed",
      stage: "Worker Offline",
      error: workerDispatch.error || "Rendering pipeline worker unreachable",
    });

    return NextResponse.json(
      {
        error: "Rendering Worker service is currently unreachable. Please ensure worker-server.js is running.",
        details: workerDispatch.error,
      },
      { status: 503 }
    );
  } catch (err: any) {
    console.error("[API Generate Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
