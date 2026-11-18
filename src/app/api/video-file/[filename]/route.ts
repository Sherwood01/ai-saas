import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// ai-saas 专属独立存储目录
const STORAGE_VIDEOS_DIR = path.join(process.cwd(), "storage", "videos");

/**
 * 视频文件流式传输接口（从 ai-saas/storage/videos 中提供安全分块播放与下载）
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const decodedName = decodeURIComponent(filename);
    const filePath = path.join(STORAGE_VIDEOS_DIR, decodedName);

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return NextResponse.json({ error: "Video file not found in storage." }, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.get("range");

    // 支持流式分块播放 (HTTP 206)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(filePath, { start, end });
      // @ts-ignore
      return new Response(fileStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": "video/mp4",
        },
      });
    }

    // 普通直接下载传输
    const fileStream = fs.createReadStream(filePath);
    const encodedName = encodeURIComponent(decodedName);
    // @ts-ignore
    return new Response(fileStream, {
      status: 200,
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
