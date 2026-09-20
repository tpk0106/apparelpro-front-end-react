import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

// ─── Request / Response types ──────────────────────────────

export interface AiSummariseRequest {
  entityType: string;
  entityKey: string;
  userQuery?: string;
}

export interface AiSummariseResponse {
  summary: string;
  entityType: string;
  entityKey: string;
  provider: string;
  generatedAt: string;
}

export interface AiAnalyseRequest {
  entityType: string;
  entityKey: string;
  userQuery?: string;
}

export interface AiAnalyseResponse {
  analysis: string;
  entityType: string;
  entityKey: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  generatedAt: string;
}

// ─── Service functions ─────────────────────────────────────

const summariseEntity = async (request: AiSummariseRequest) => {
  return await client.post<AiSummariseResponse>(
    APPARELPRO_ENDPOINTS.AI.SUMMARISE,
    request,
  );
};

const analyseEntity = async (request: AiAnalyseRequest) => {
  return await client.post<AiAnalyseResponse>(
    APPARELPRO_ENDPOINTS.AI.ANALYSE,
    request,
    { timeout: 120000 }, // 2 minutes — analysis needs more time
  );
};

export { summariseEntity, analyseEntity };
