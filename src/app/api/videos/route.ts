import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getUserVideos, deleteVideoTask } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { WorkerClient } from "@/lib/worker-client";

// 本地视频存储目录
const STORAGE_VIDEOS_DIR = path.join(process.cwd(), "storage", "videos");

// 字节换算常量
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;

/**
 * 将字节大小格式化为易读的字符串 (如 "7.9 MB")
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes >= BYTES_PER_MB) {
    return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
  }
  return `${(bytes / BYTES_PER_KB).toFixed(1)} KB`;
}

/**
 * 获取当前登录用户的专属视频列表（严格多租户数据隔离，包含文件大小与分辨率比例）
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json([]);
    }

    // 严格按 userId 查询归属数据，杜绝越权串线
    const rawVideos = getUserVideos(user.id);

    // 丰富视频元数据：读取实际落盘物理文件大小与分辨率比例
    const enrichedVideos = rawVideos.map((video) => {
      let fileSize = "Pending";
      const resolution = "1080p (9:16)";

      // 根据下载/播放地址获取物理文件名
      const url = video.downloadUrl || video.videoUrl || "";
      if (url) {
        const parts = url.split("/");
        const filename = decodeURIComponent(parts[parts.length - 1] || "");
        if (filename) {
          const filePath = path.join(STORAGE_VIDEOS_DIR, filename);
          if (fs.existsSync(filePath)) {
            try {
              const stat = fs.statSync(filePath);
              fileSize = formatBytes(stat.size);
            } catch {
              fileSize = "Available";
            }
          }
        }
      }

      return {
        ...video,
        fileSize,
        resolution,
      };
    });

    return NextResponse.json(enrichedVideos);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * 彻底级联删除视频资产及其底层算力 Worker 全量过程文件
 * 1. 验证用户权限 -> 2. 从本地 DB 移除记录 -> 3. 物理删除 SaaS storage/videos 成品 MP4 -> 4. RPC 联动对应 Worker 清理全部过程文件
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("id");

    if (!taskId) {
      return NextResponse.json({ error: "Task ID parameter is required." }, { status: 400 });
    }

    // 1. 从本地 DB 查找并删除任务（带所有权校验）
    const deletedTask = deleteVideoTask(taskId, user.id);
    if (!deletedTask) {
      return NextResponse.json({ error: "Video task not found or unauthorized." }, { status: 404 });
    }

    // 2. 物理删除 SaaS storage/videos/ 中的成品文件
    const url = deletedTask.downloadUrl || deletedTask.videoUrl || "";
    const filenameCandidates: string[] = [
      `${deletedTask.word}-${deletedTask.id}.mp4`,
    ];
    if (url) {
      const parts = url.split("/");
      const rawName = decodeURIComponent(parts[parts.length - 1] || "");
      if (rawName && !filenameCandidates.includes(rawName)) {
        filenameCandidates.push(rawName);
      }
    }

    const localDeleted: string[] = [];
    for (const name of filenameCandidates) {
      const filePath = path.join(STORAGE_VIDEOS_DIR, name);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          localDeleted.push(name);
        } catch (err: any) {
          console.warn(`[Storage Delete Warning] Could not delete ${name}: ${err.message}`);
        }
      }
    }

    // 3. 跨微服务联动对应 Worker 节点彻底清理过程文件（草稿 JSON、TSX、TTS音频、renders缓存）
    const pipelineType = deletedTask.pipelineType || "vocab-shorts";
    const workerCleanup = await WorkerClient.cleanupTask(deletedTask.id, deletedTask.word, pipelineType);

    return NextResponse.json({
      success: true,
      message: `Video "${deletedTask.word}" and all associated artifacts purged successfully.`,
      deletedTaskId: taskId,
      localDeleted,
      workerDeleted: workerCleanup.deletedFiles || [],
    });
  } catch (err: any) {
    console.error("[Delete Video Exception]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
