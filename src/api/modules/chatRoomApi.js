/**
 * ============================================================
 * [API 모듈] 대화방(Chat Room) 관련 API - v2-FIXED
 * ============================================================
 *
 * 역할:
 * - 클라이언트에서 백엔드의 /api/chat/rooms/* 엔드포인트 호출
 * - http.js 인터셉터 사용 (Authorization 헤더 자동 처리)
 * - multipart/form-data 처리는 하지 않음 (JSON 요청만)
 * - 응답 데이터를 그대로 반환
 *
 * 수정사항:
 * - ✅ 모든 endpoint 경로 통일 (로컬/배포 동일)
 * - ✅ getEndpoint() 제거, 직접 경로 사용
 * - ✅ Vercel rewrites가 자동으로 프록시 처리
 * ============================================================
 */

import { API_BASE_URL, ENV } from "@/utils/constants";
import { requestInterceptor } from "../interceptor";
import { validateAgentIds } from "@/utils/common";

/**
 * ============================================================
 * 대화방 목록 조회
 * ============================================================
 */
async function getChatRoomList(params = {}) {
  console.log("📋 [chatRoomApi] getChatRoomList 호출");
  console.log("params:", params);

  try {
    // ============================================================
    // ✅ [수정] 로컬/배포 동일한 경로 사용
    // ============================================================
    const endpoint = "/api/chat/rooms/list";

    // URL 구성
    let fullUrl = endpoint;
    if (ENV.IS_DEVELOPMENT && API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${endpoint}`;
    }

    console.log("환경:", ENV.IS_DEVELOPMENT ? "🔨 로컬" : "🌐 배포");
    console.log("fullUrl:", fullUrl);

    // 요청 본문
    const requestBody = {
      page: params.page || 0,
      size: params.size || 20,
      ...(params.status && { status: params.status }),
    };

    console.log("requestBody:", requestBody);

    // Config 준비
    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };

    // Interceptor 적용 (Authorization 헤더 자동 추가)
    const configAfterInterceptor = requestInterceptor(config);

    console.log(
      "✅ Authorization 헤더:",
      configAfterInterceptor.headers.Authorization
        ? configAfterInterceptor.headers.Authorization.substring(0, 30) + "..."
        : "없음",
    );

    // fetch 호출
    console.log("fetch() 호출");
    const response = await fetch(fullUrl, configAfterInterceptor);

    console.log("응답 상태:", response.status);

    // 응답 처리
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 에러 응답:", errorText);
      throw new Error(
        `API 에러: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const data = await response.json();
    console.log("✅ getChatRoomList 성공");

    return data;
  } catch (error) {
    console.error("❌ getChatRoomList 실패:", error.message);
    throw error;
  }
}

/**
 * ============================================================
 * 대화방 상세 조회
 * ============================================================
 *
 * 수정사항:
 * - validateAgentIds()로 Agent 이름 검증
 * - "[RELEASE]OCI WEB Portal" 같은 일반 Agent는 agents = []로 변환
 * - MainPage.vue에서 agents.length로 일반/Agent 채팅 판단
 */
async function getChatRoomDetail(roomId, params = {}) {
  console.log("🔍 [chatRoomApi] getChatRoomDetail 호출");
  console.log("roomId:", roomId);
  console.log("params:", params);

  try {
    // ============================================================
    // ✅ [수정] 로컬/배포 동일한 경로 사용
    // ============================================================
    const endpoint = "/api/chat/rooms/detail";

    let fullUrl = endpoint;
    if (ENV.IS_DEVELOPMENT && API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${endpoint}`;
    }

    console.log("환경:", ENV.IS_DEVELOPMENT ? "🔨 로컬" : "🌐 배포");
    console.log("fullUrl:", fullUrl);

    const requestBody = {
      roomId: roomId,
      page: params.page || 0,
      size: params.size || 50,
    };

    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };

    const configAfterInterceptor = requestInterceptor(config);

    console.log("fetch() 호출");
    const response = await fetch(fullUrl, configAfterInterceptor);

    console.log("응답 상태:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 에러 응답:", errorText);
      throw new Error(
        `API 에러: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    let data = await response.json();
    console.log("✅ getChatRoomDetail 성공 (검증 전):", data);

    // ============================================================
    // ✅ 핵심: validateAgentIds() 호출!
    // ============================================================
    console.log("");
    console.log("═══════════════════════════════════════════");
    console.log("🔍 [getChatRoomDetail] Agent 이름 검증 시작");
    console.log("═══════════════════════════════════════════");

    // Agent 이름 검증
    const validatedAgents = validateAgentIds(data.agents || []);

    // 검증된 agents로 업데이트
    data = {
      ...data,
      agents: validatedAgents, // ← agents: [] 또는 유효한 배열
    };

    console.log("");
    console.log("최종 응답 데이터:");
    console.log("   room:", data.room?.id);
    console.log("   messages:", data.messages?.length || 0);
    console.log("   agents (검증됨):", {
      count: data.agents?.length || 0,
      agents: data.agents,
    });
    console.log("");

    return data;
  } catch (error) {
    console.error("❌ getChatRoomDetail 실패:", error.message);
    throw error;
  }
}

/**
 * ============================================================
 * 대화방 생성
 * ============================================================
 */
async function createChatRoom(params = {}) {
  console.log("➕ [chatRoomApi] createChatRoom 호출");
  console.log("params:", params);

  try {
    // ============================================================
    // ✅ [수정] 로컬/배포 동일한 경로 사용
    // ============================================================
    const endpoint = "/api/chat/rooms/create";

    let fullUrl = endpoint;
    if (ENV.IS_DEVELOPMENT && API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${endpoint}`;
    }

    console.log("환경:", ENV.IS_DEVELOPMENT ? "🔨 로컬" : "🌐 배포");
    console.log("fullUrl:", fullUrl);

    const requestBody = {
      ...(params.title && { title: params.title }),
    };

    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };

    const configAfterInterceptor = requestInterceptor(config);

    console.log("fetch() 호출");
    const response = await fetch(fullUrl, configAfterInterceptor);

    console.log("응답 상태:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 에러 응답:", errorText);
      throw new Error(
        `API 에러: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const data = await response.json();
    console.log("✅ createChatRoom 성공");

    return data;
  } catch (error) {
    console.error("❌ createChatRoom 실패:", error.message);
    throw error;
  }
}

/**
 * ============================================================
 * 대화방 제목 수정
 * ============================================================
 */
async function updateChatRoomTitle(roomId, title) {
  console.log("✏️ [chatRoomApi] updateChatRoomTitle 호출");
  console.log("roomId:", roomId);
  console.log("title:", title);

  try {
    // ============================================================
    // ✅ [수정] 로컬/배포 동일한 경로 사용
    // ============================================================
    const endpoint = "/api/chat/rooms/update-title";

    let fullUrl = endpoint;
    if (ENV.IS_DEVELOPMENT && API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${endpoint}`;
    }

    console.log("환경:", ENV.IS_DEVELOPMENT ? "🔨 로컬" : "🌐 배포");
    console.log("fullUrl:", fullUrl);

    const requestBody = {
      roomId: roomId,
      title: title,
    };

    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };

    const configAfterInterceptor = requestInterceptor(config);

    console.log("fetch() 호출");
    const response = await fetch(fullUrl, configAfterInterceptor);

    console.log("응답 상태:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 에러 응답:", errorText);
      throw new Error(
        `API 에러: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const data = await response.json();
    console.log("✅ updateChatRoomTitle 성공");

    return data;
  } catch (error) {
    console.error("❌ updateChatRoomTitle 실패:", error.message);
    throw error;
  }
}

/**
 * ============================================================
 * 대화방 삭제
 * ============================================================
 */
async function deleteChatRoom(roomId) {
  console.log("🗑️ [chatRoomApi] deleteChatRoom 호출");
  console.log("roomId:", roomId);

  try {
    // ============================================================
    // ✅ [수정] 로컬/배포 동일한 경로 사용
    // ============================================================
    const endpoint = "/api/chat/rooms/delete";

    let fullUrl = endpoint;
    if (ENV.IS_DEVELOPMENT && API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${endpoint}`;
    }

    console.log("환경:", ENV.IS_DEVELOPMENT ? "🔨 로컬" : "🌐 배포");
    console.log("fullUrl:", fullUrl);

    const requestBody = {
      roomId: roomId,
    };

    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };

    const configAfterInterceptor = requestInterceptor(config);

    console.log("fetch() 호출");
    const response = await fetch(fullUrl, configAfterInterceptor);

    console.log("응답 상태:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 에러 응답:", errorText);
      throw new Error(
        `API 에러: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const data = await response.json();
    console.log("✅ deleteChatRoom 성공");

    return data;
  } catch (error) {
    console.error("❌ deleteChatRoom 실패:", error.message);
    throw error;
  }
}

/**
 * ============================================================
 * Export
 * ============================================================
 */

export {
  getChatRoomList,
  getChatRoomDetail,
  createChatRoom,
  updateChatRoomTitle,
  deleteChatRoom,
};

export default {
  getChatRoomList,
  getChatRoomDetail,
  createChatRoom,
  updateChatRoomTitle,
  deleteChatRoom,
};
