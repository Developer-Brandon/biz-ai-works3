/**
 * ============================================================
 * [API 모듈] 채팅 관련 API - v9-FIXED (경로 수정)
 * ============================================================
 *
 * 수정사항:
 * - ✅ invokeAgent, sendChatMessage의 endpoint 경로 수정
 * - ✅ 배포 환경에서도 로컬과 동일한 경로 사용
 * - ✅ Vercel rewrites가 자동으로 프록시 처리
 */

import { CHAT_ROOM_TYPES, API_BASE_URL, ENV } from "@/utils/constants";
import { requestInterceptor } from "../interceptor";

/**
 * ============================================================
 * 에이전트 채팅 호출
 * ============================================================
 */
async function invokeAgent(params, onEvent) {
  const {
    agentId,
    query,
    currentModel = "",
    currentProvider = "",
    executionMode = CHAT_ROOM_TYPES.AGENT,
    roomId = "",
    files = [],
  } = params;

  if (!agentId) throw new Error("agentId는 필수입니다");
  if (!query) throw new Error("query는 필수입니다");
  if (!onEvent || typeof onEvent !== "function") {
    throw new Error("onEvent 콜백은 필수입니다");
  }

  // ============================================================
  // ✅ [수정] endpoint 경로 통일
  // ============================================================
  // 이유:
  // - Vercel rewrites가 /api/:path*를 자동으로 프록시
  // - 로컬/배포 모두 동일한 경로 사용
  //
  // 변경 전:
  // - 로컬: /api/chat/agents/invoke
  // - 배포: /api/chat?endpoint=agents ❌ 잘못됨
  //
  // 변경 후:
  // - 로컬: /api/chat/agents/invoke
  // - 배포: /api/chat/agents/invoke ✅ 올바름
  // ============================================================
  const endpoint = "/api/chat/agents/invoke";

  console.log("==== [invokeAgent] 시작 ====");
  console.log("params:", params);
  console.log("endpoint:", endpoint);
  console.log("files:", files);
  console.log("files type:", typeof files);
  console.log("Array.isArray(files):", Array.isArray(files));

  try {
    // 1️⃣ 요청 데이터
    const requestData = {
      agentId,
      query,
      executionMode,
      currentModel: "gpt-4",
      ...(currentProvider && { currentProvider }),
      roomId,
    };

    console.log("requestData:", requestData);

    // 2️⃣ FormData 생성
    console.log("FormData 생성 시작...");

    const formData = new FormData();
    const requestJsonString = JSON.stringify(requestData);

    console.log("request JSON:", requestJsonString);
    formData.append("request", requestJsonString);
    console.log("✅ 'request' part 추가됨");

    // 3️⃣ files 추가
    console.log("파일 추가 확인:");
    console.log("files:", files);
    console.log(
      "files && Array.isArray(files):",
      files && Array.isArray(files),
    );
    console.log("files.length > 0:", files && files.length > 0);

    if (files && Array.isArray(files) && files.length > 0) {
      console.log(`📦 ${files.length}개 파일 추가 중...`);
      files.forEach((file, index) => {
        console.log(`  [${index}] ${file.name || file}`);
        formData.append("files", file);
      });
      console.log("✅ 파일 추가 완료");
    } else {
      console.log("📄 파일 없음");
    }

    // 4️⃣ FormData 확인
    console.log("FormData 최종 확인:");
    console.log(
      "  formData instanceof FormData:",
      formData instanceof FormData,
    );
    let count = 0;
    for (let [key, value] of formData) {
      count++;
      if (value instanceof File) {
        console.log(`  [${count}] ${key}: File(${value.name})`);
      } else {
        console.log(`  [${count}] ${key}: ${value.substring(0, 50)}...`);
      }
    }

    // ============================================================
    // 5️⃣ URL 구성
    // ============================================================
    // 로컬 환경:
    //   - API_BASE_URL = "http://172.190.116.61:18080"
    //   - endpoint = "/api/chat/agents/invoke"
    //   - fullUrl = "http://172.190.116.61:18080/api/chat/agents/invoke"
    //
    // 배포 환경:
    //   - API_BASE_URL = ""
    //   - endpoint = "/api/chat/agents/invoke"
    //   - fullUrl = "/api/chat/agents/invoke" (상대 경로)
    //   - Vercel이 자동으로 http://172.190.116.61:18080/api/chat/agents/invoke로 프록시
    // ============================================================
    let fullUrl = endpoint;
    if (ENV.IS_DEVELOPMENT && API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${endpoint}`;
    }

    console.log("환경:", ENV.IS_DEVELOPMENT ? "로컬" : "배포");
    console.log("fullUrl:", fullUrl);

    // 6️⃣ Config 준비
    const config = {
      method: "POST",
      headers: {},
      body: formData,
    };

    console.log("Config 준비:");
    console.log("  method:", config.method);
    console.log("  headers:", config.headers);
    console.log("  body instanceof FormData:", config.body instanceof FormData);

    // 7️⃣ Interceptor 호출
    console.log("requestInterceptor 호출 전:");
    console.log("  body instanceof FormData:", config.body instanceof FormData);

    const configAfterInterceptor = requestInterceptor(config);

    console.log("requestInterceptor 호출 후:");
    console.log("  headers:", configAfterInterceptor.headers);
    console.log(
      "  body instanceof FormData:",
      configAfterInterceptor.body instanceof FormData,
    );

    // 8️⃣ fetch 호출
    console.log("fetch() 호출:");
    console.log("URL:", fullUrl);
    console.log(
      "body instanceof FormData:",
      configAfterInterceptor.body instanceof FormData,
    );

    const response = await fetch(fullUrl, configAfterInterceptor);

    console.log("응답:");
    console.log("  status:", response.status);
    console.log("  statusText:", response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ 에러 응답:");
      console.log(errorText);

      onEvent("error", {
        status: response.status,
        message: errorText,
      });

      throw new Error(
        `API 에러: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const roomIdFromResponse = response.headers.get("X-Room-Id") || roomId;

    console.log("[invokeAgent] roomId 확인:");
    console.log("  응답 헤더 X-Room-Id:", response.headers.get("X-Room-Id"));
    console.log("  roomIdFromResponse:", roomIdFromResponse);
    console.log("  roomId (요청값):", roomId);

    const result = await processStreamingResponse(response, onEvent);

    console.log("✅ 완료");
    console.log("==== [invokeAgent] 종료 ====\n");

    return {
      ...result,
      roomId: roomIdFromResponse,
    };
  } catch (error) {
    console.error("❌ invokeAgent 실패:", error.message);
    console.log("==== [invokeAgent] 종료 (에러) ====\n");
    throw error;
  }
}

/**
 * ============================================================
 * 일반 채팅 메시지 전송
 * ============================================================
 */
async function sendChatMessage(params, onEvent) {
  const {
    query,
    currentModel,
    currentProvider,
    executionMode = CHAT_ROOM_TYPES.CHAT,
    roomId = "",
    files = [],
  } = params;

  if (!query) throw new Error("query는 필수입니다");
  if (!currentModel) throw new Error("currentModel은 필수입니다");
  if (!currentProvider) throw new Error("currentProvider는 필수입니다");
  if (!onEvent || typeof onEvent !== "function") {
    throw new Error("onEvent 콜백은 필수입니다");
  }

  // ============================================================
  // ✅ [수정] endpoint 경로 통일
  // ============================================================
  // 변경 전:
  // - 로컬: /api/chat/messages
  // - 배포: /api/chat?endpoint=messages ❌
  //
  // 변경 후:
  // - 로컬: /api/chat/messages
  // - 배포: /api/chat/messages ✅
  // ============================================================
  const endpoint = "/api/chat/messages";

  console.log("==== [sendChatMessage] 시작 ====");
  console.log("endpoint:", endpoint);

  try {
    const requestData = {
      query,
      currentModel,
      currentProvider,
      executionMode,
      autoGenerateName: true,
      ...(roomId && { roomId }),
    };

    const formData = new FormData();
    formData.append("request", JSON.stringify(requestData));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
      console.log(`✅ ${files.length}개 파일 추가됨`);
    }

    // URL 구성
    let fullUrl = endpoint;
    if (ENV.IS_DEVELOPMENT && API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${endpoint}`;
    }

    console.log("환경:", ENV.IS_DEVELOPMENT ? "로컬" : "배포");
    console.log("fullUrl:", fullUrl);

    const config = {
      method: "POST",
      headers: {},
      body: formData,
    };

    const configAfterInterceptor = requestInterceptor(config);
    const response = await fetch(fullUrl, configAfterInterceptor);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 에러: ${response.status}\n${errorText}`);
    }

    const roomIdFromResponse = response.headers.get("X-Room-Id") || roomId;
    const result = await processStreamingResponse(response, onEvent);

    console.log("✅ 완료");
    console.log("==== [sendChatMessage] 종료 ====\n");

    return {
      ...result,
      roomId: roomIdFromResponse,
    };
  } catch (error) {
    console.error("❌ sendChatMessage 실패:", error.message);
    console.log("==== [sendChatMessage] 종료 (에러) ====\n");
    throw error;
  }
}

/**
 * ============================================================
 * SSE 스트리밍 응답 처리
 * ============================================================
 */
async function processStreamingResponse(response, onEvent) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let conversationId = "";
  let messageId = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const jsonStr = line.slice(6);
          if (!jsonStr.trim()) continue;

          const eventData = JSON.parse(jsonStr);

          switch (eventData.event) {
            case "message":
            case "agent_message":
              if (eventData.answer) {
                onEvent(eventData.event, eventData);
              }
              if (!conversationId && eventData.conversation_id) {
                conversationId = eventData.conversation_id;
              }
              if (!messageId && eventData.message_id) {
                messageId = eventData.message_id;
              }
              break;

            case "message_end":
              conversationId = eventData.conversation_id;
              messageId = eventData.message_id;
              onEvent("message_end", eventData);
              break;

            case "error":
              onEvent("error", eventData);
              break;

            case "agent_thought":
              onEvent("agent_thought", eventData);
              break;

            default:
              if (eventData.event) {
                onEvent(eventData.event, eventData);
              }
          }
        } catch (parseError) {
          // JSON 파싱 실패 무시
          console.log("⚠️ 이벤트 데이터 파싱 실패:", parseError.message);
        }
      }
    }
  }

  return {
    conversationId,
    messageId,
  };
}

// ============================================================
// Export
// ============================================================

export const chatApi = {
  sendChatMessage,
  invokeAgent,
};

export default chatApi;
