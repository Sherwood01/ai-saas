import { PipelineType } from "./worker-types";

/**
 * AI 工具元数据与调度配置模型
 */
export interface AIToolConfig {
  id: PipelineType;
  name: string;
  shortName: string;
  description: string;
  category: "video" | "audio" | "image" | "multimodal";
  creditCost: number; // 单次生成消耗的 Credits 额度
  workerEnvKey: string; // 对应的环境变量名称
  defaultEndpoint: string; // 默认通信端口与地址
  status: "active" | "beta" | "coming_soon";
  badgeText: string;
  resolution: string;
  storageSubdir: string; // 物理资产存储子目录
}

/**
 * 全局 AI 算力工具注册中心 (AI Tools Registry)
 * 集中管理各微服务算力节点通信端点、计费成本与资产归档策略
 */
export const AI_TOOLS_REGISTRY: Record<PipelineType, AIToolConfig> = {
  "ip-explainer": {
    id: "ip-explainer",
    name: "IP Doodle Video Studio",
    shortName: "IP Video",
    description: "Automated hand-drawn doodle explainer videos for patents, trademarks & commercial battles.",
    category: "video",
    creditCost: 2,
    workerEnvKey: "IP_WORKER_URL",
    defaultEndpoint: "http://localhost:4990",
    status: "active",
    badgeText: "New",
    resolution: "1080p (16:9)",
    storageSubdir: "ip-explainer",
  },
  "vocab-shorts": {
    id: "vocab-shorts",
    name: "Vocabulary Shorts Studio",
    shortName: "Vocab Shorts",
    description: "Automated 1080p vertical short videos for TikTok, Reels & Shorts.",
    category: "video",
    creditCost: 1,
    workerEnvKey: "VOCAB_WORKER_URL",
    defaultEndpoint: "http://localhost:4980",
    status: "active",
    badgeText: "Active",
    resolution: "1080p (9:16)",
    storageSubdir: "vocab-shorts",
  },
  "story-adventure": {
    id: "story-adventure",
    name: "Story & Adventure Video Studio",
    shortName: "Story & Adventure",
    description: "Cinematic multi-scene episodic storytelling journeys for YouTube.",
    category: "video",
    creditCost: 3,
    workerEnvKey: "ADVENTURE_WORKER_URL",
    defaultEndpoint: "http://localhost:5200",
    status: "beta",
    badgeText: "Beta",
    resolution: "1080p (16:9 / 9:16)",
    storageSubdir: "story-adventure",
  },
  "voiceover": {
    id: "voiceover",
    name: "Neural Voiceover & Audio Studio",
    shortName: "Voiceover",
    description: "Multi-speaker neural voiceover synthesis with expressive emotion.",
    category: "audio",
    creditCost: 1,
    workerEnvKey: "VOICEOVER_WORKER_URL",
    defaultEndpoint: "http://localhost:5300",
    status: "coming_soon",
    badgeText: "Soon",
    resolution: "Lossless Audio",
    storageSubdir: "voiceover",
  },
  "custom": {
    id: "custom",
    name: "Custom Experimental Pipeline",
    shortName: "Custom",
    description: "Custom user-defined headless rendering pipeline.",
    category: "multimodal",
    creditCost: 1,
    workerEnvKey: "CUSTOM_WORKER_URL",
    defaultEndpoint: "http://localhost:5999",
    status: "coming_soon",
    badgeText: "Lab",
    resolution: "Custom",
    storageSubdir: "custom",
  },
};

/**
 * 根据管道类型获取对应的工具配置
 * @param pipelineType 管道类型
 * @returns 对应的 AI 工具配置
 */
export function getToolConfig(pipelineType: PipelineType = "vocab-shorts"): AIToolConfig {
  return AI_TOOLS_REGISTRY[pipelineType] || AI_TOOLS_REGISTRY["vocab-shorts"];
}

/**
 * 获取指定工具微服务节点的真实远程通信地址
 * @param pipelineType 管道类型
 * @returns 对应 Worker 的 URL 端点
 */
export function getWorkerEndpoint(pipelineType: PipelineType = "vocab-shorts"): string {
  const config = getToolConfig(pipelineType);
  return process.env[config.workerEnvKey] || config.defaultEndpoint;
}

