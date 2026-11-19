import { NextRequest, NextResponse } from "next/server";
import { getUserVideos, updateVideoTaskStatus } from "@/lib/db";
import { WorkerClient } from "@/lib/worker-client";
import { getSessionUser } from "@/lib/auth";

/**
 * 轮询 Worker 任务状态 + 渲染完成后的“视频流式转存”至 ai-saas 存储中心
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videos = getUserVideos(user.id);
    let task = videos.find((v) => v.id === taskId);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // 1. 如果任务还在运行中，或者虽已标记完成但尚未流式转存视频 (缺少 videoUrl)，则向底层对应 Worker 查询并补充转存
    const needsSync = task.status === "running" || task.status === "queued" || (task.status === "completed" && !task.videoUrl);
    if (needsSync) {
      const pipelineType = task.pipelineType || "vocab-shorts";
      const workerStatus = await WorkerClient.queryTaskStatus(taskId, pipelineType);
      if (workerStatus) {
        // 如果底层 Worker 已经渲染完成 (completed)
        if (workerStatus.status === "completed" && (workerStatus.downloadUrl || workerStatus.videoUrl)) {
          const downloadUrl = workerStatus.downloadUrl || workerStatus.videoUrl || "";
          const targetFilename = `${task.word}-${task.id}.mp4`;

          // 将视频从底层对应 Worker 流式拉取并转存到 ai-saas/storage/videos/
          const saasVideoUrl = await WorkerClient.syncVideoToStorage(downloadUrl, targetFilename, pipelineType);

          const finalTask = updateVideoTaskStatus(taskId, {
            status: "completed",
            stage: "Ready in SaaS Storage",
            progress: 100,
            videoUrl: saasVideoUrl || `/api/video-file/${encodeURIComponent(targetFilename)}`,
            playUrl: saasVideoUrl || `/api/video-file/${encodeURIComponent(targetFilename)}`,
            downloadUrl: saasVideoUrl || `/api/video-file/${encodeURIComponent(targetFilename)}`,
            completedAt: new Date().toISOString(),
          });
          return NextResponse.json(finalTask || task);
        }

        // 仍在渲染中，更新阶段与进度百分比
        const updated = updateVideoTaskStatus(taskId, {
          status: workerStatus.status,
          stage: workerStatus.stage,
          progress: workerStatus.progress,
          error: workerStatus.error || null,
        });
        if (updated) {
          task = { ...updated, logs: workerStatus.logs || [] };
        } else {
          task = { ...task, logs: workerStatus.logs || [] };
        }
      }
    }

    return NextResponse.json(task);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
