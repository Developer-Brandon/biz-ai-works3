/**
 * ============================================================
 * [API 모듈] 모델 사용량 조회 API
 * ============================================================
 *
 * 역할:
 * - 로그인한 사용자의 AI 모델 일일 사용량 조회
 */

import { http } from "@/api/http";
import { ENV } from "@/utils/constants";
import { getEndpoint } from "@/utils/common";

/**
 * ============================================================
 * 1.모델 일일 사용량 조회
 * ============================================================
 */
async function getModelDailyUsage() {
  const endpoint = getEndpoint(
    "/api/model/daily-usage",
    "/api/model/daily-usage",
  );
  console.group("[모델 사용량 API] 요청 시작");
  console.log("엔드포인트:", endpoint);
  console.log("환경:", ENV.IS_DEVELOPMENT ? "로컬" : "배포");
  console.groupEnd();
  return http.post(endpoint, {});
}

// ============================================================
// Export
// ============================================================
export const modelUsageApi = {
  getModelDailyUsage,
};

export default modelUsageApi;
