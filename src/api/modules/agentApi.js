/**
 * ============================================================
 * [API 모듈] AI Agent 조회 API - v2-FIXED
 * ============================================================
 *
 * 수정사항:
 * - ✅ 모든 endpoint 경로 통일 (로컬/배포 동일)
 * - ✅ getEndpoint() 제거, 직접 경로 사용
 * - ✅ Vercel rewrites가 자동으로 프록시 처리
 */

import { http } from "@/api/http";
import { CHAT_ROOM_TYPES } from "@/utils/constants";

/**
 * ============================================================
 * 1. AI Agent 목록 조회
 * ============================================================
 */
async function getAgentList(options = {}) {
  // ============================================================
  // ✅ [수정] 로컬/배포 동일한 경로 사용
  // ============================================================
  // 변경 전:
  // - 로컬: /api/chat/agents/list
  // - 배포: /api/agent/status ❌
  //
  // 변경 후:
  // - 로컬: /api/chat/agents/list
  // - 배포: /api/chat/agents/list ✅
  // ============================================================
  const endpoint = "/api/chat/agents/list";

  try {
    console.group("👥 [Agent List API] 요청 시작");
    console.log("엔드포인트:", endpoint);

    // 요청 파라미터 설정 (기본값 포함)
    const requestData = {
      mode: options.mode || CHAT_ROOM_TYPES.AGENT,
      status: options.status || "normal",
      search: options.search || "", // 빈 문자열이면 검색 없음
    };

    console.log("요청 파라미터:", requestData);

    // API 호출
    const response = await http.post(endpoint, requestData);

    console.log("API 응답:", response);

    // 응답 검증
    if (!response.success) {
      throw new Error(
        response.message || "에이전트 목록을 불러올 수 없습니다.",
      );
    }

    console.log("✅ 에이전트 목록 조회 성공:", response.data);
    console.groupEnd();

    return response.data;
  } catch (error) {
    console.error("❌ [Agent List API] 오류 발생:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * ============================================================
 * 2. AI Agent 상세 조회
 * ============================================================
 */
async function getAgentDetail(agentId) {
  // ============================================================
  // ✅ [수정] 로컬/배포 동일한 경로 사용
  // ============================================================
  // 변경 전:
  // - 로컬: /api/chat/agents/detail
  // - 배포: /api/agent/status?type=detail ❌
  //
  // 변경 후:
  // - 로컬: /api/chat/agents/detail
  // - 배포: /api/chat/agents/detail ✅
  // ============================================================
  const endpoint = "/api/chat/agents/detail";

  try {
    console.group("🔍 [Agent Detail API] 요청 시작");
    console.log("엔드포인트:", endpoint);

    const requestData = { agentId };

    console.log("요청 파라미터:", requestData);

    const response = await http.post(endpoint, requestData);

    console.log("API 응답:", response);

    if (!response.success) {
      throw new Error(
        response.message || "에이전트 정보를 불러올 수 없습니다.",
      );
    }

    console.log("✅ 에이전트 상세 조회 성공:", response.data);
    console.groupEnd();

    return response.data;
  } catch (error) {
    console.error("❌ [Agent Detail API] 오류 발생:", error);
    console.groupEnd();
    throw error;
  }
}

// ============================================================
// Export
// ============================================================

export const agentApi = {
  getAgentList,
  getAgentDetail,
};

export default agentApi;
