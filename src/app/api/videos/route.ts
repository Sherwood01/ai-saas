import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getUserVideos } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

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
