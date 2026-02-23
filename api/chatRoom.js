/**
 * ============================================================
 * [프록시] 대화방(Chat Room) API 프록시 (Vercel 함수)
 * ============================================================
 *
 * 위치: /api/chatRoom.js (Vercel 함수)
 *
 * 역할:
 * - 클라이언트(Vue.js/Vercel)에서 백엔드(http://172.190.116.61:18080)로의 프록시
 * - CORS 처리 (Vercel 도메인 → 백엔드)
 * - Authorization 헤더 자동 전달
 * - JSON 응답 처리 (SSE 스트리밍 아님)
 *
 * 요청 흐름:
 * 브라우저 (https://example.vercel.app)
 *   ↓ (클라이언트에서 /api/chatRoom?endpoint=list 로 요청)
 * Vercel 함수 (이 파일)
 *   ↓ (Authorization 헤더를 포함해서 백엔드로 전달)
 * 백엔드 (http://172.190.116.61:18080/api/chat/rooms/list 등)
 *   ↓ (JSON 응답)
 * Vercel 함수 (응답을 그대로 전달)
 *   ↓
 * 브라우저 (JSON 응답 수신)
 *
 * 쿼리 파라미터로 엔드포인트 결정:
 * - ?endpoint=list → /api/chat/rooms/list
 * - ?endpoint=detail → /api/chat/rooms/detail
 * - ?endpoint=create → /api/chat/rooms/create
 * - ?endpoint=update-title → /api/chat/rooms/update-title
 * - ?endpoint=delete → /api/chat/rooms/delete
 *
 * 중요:
 * - Authorization 헤더 반드시 전달
 * - JSON Content-Type 처리
 * - JSON 응답을 그대로 클라이언트에 반환
 */

export default async function handler(req, res) {
  console.log("=== Vercel ChatRoom 프록시 함수 시작 ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Query:", req.query);
  console.log("Headers:", {
    "content-type": req.headers["content-type"],
    authorization: req.headers.authorization
      ? req.headers.authorization.substring(0, 20) + "..."
      : "없음",
  });

  // ============================================================
  // 1.CORS 헤더 설정
  // ============================================================
  //
  // 프로덕션 배포 시:
  // 와일드카드 "*" 대신 정확한 도메인 설정
  // res.setHeader("Access-Control-Allow-Origin", "https://example.vercel.app");
  //
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ============================================================
  // 2.OPTIONS 요청 처리 (Preflight)
  // ============================================================
  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS preflight 요청 처리됨");
    return res.status(200).end();
  }

  // ============================================================
  // 3.POST 요청만 허용
  // ============================================================
  if (req.method !== "POST") {
    console.error(`❌ 허용되지 않는 메서드: ${req.method}`);
    return res.status(405).json({
      success: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Method not allowed",
      data: null,
    });
  }

  try {
    // ============================================================
    // 핵심: 클라이언트 Authorization 헤더 추출
    // ============================================================

    const clientAuthToken = req.headers.authorization;

    // 토큰이 없으면 에러
    if (!clientAuthToken) {
      console.error("❌ Authorization 헤더가 없습니다");
      return res.status(401).json({
        success: false,
        code: "AU001",
        message: "인증 토큰이 없습니다. 로그인이 필요합니다.",
        data: null,
      });
    }

    console.log(
      "✅ Authorization 헤더 확인됨:",
      clientAuthToken.substring(0, 30) + "...",
    );

    // ============================================================
    // 4.쿼리 파라미터로 엔드포인트 결정
    // ============================================================
    //
    // ?endpoint=list → /api/chat/rooms/list
    // ?endpoint=detail → /api/chat/rooms/detail
    // ?endpoint=create → /api/chat/rooms/create
    // ?endpoint=update-title → /api/chat/rooms/update-title
    // ?endpoint=delete → /api/chat/rooms/delete
    //
    const endpointType = req.query.endpoint || "list";
    let backendPath = "";

    switch (endpointType) {
      case "list":
        backendPath = "/api/chat/rooms/list";
        break;
      case "detail":
        backendPath = "/api/chat/rooms/detail";
        break;
      case "create":
        backendPath = "/api/chat/rooms/create";
        break;
      case "update-title":
        backendPath = "/api/chat/rooms/update-title";
        break;
      case "delete":
        backendPath = "/api/chat/rooms/delete";
        break;
      default:
        console.error(`❌ 알 수 없는 엔드포인트 타입: ${endpointType}`);
        return res.status(400).json({
          success: false,
          code: "INVALID_ENDPOINT",
          message: "유효하지 않은 엔드포인트입니다",
          data: null,
        });
    }

    const backendUrl = `http://172.190.116.61:18080${backendPath}`;

    console.log("백엔드 요청 준비");
    console.log("URL:", backendUrl);
    console.log("Method:", req.method);
    console.log("Endpoint Type:", endpointType);

    // ============================================================
    // 5.Content-Type 확인
    // ============================================================
    //
    // 대화방 API는 JSON만 처리
    //
    const contentType = req.headers["content-type"];

    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Content-Type이 application/json이 아닙니다");
      return res.status(400).json({
        success: false,
        code: "INVALID_CONTENT_TYPE",
        message: "Content-Type must be application/json",
        data: null,
      });
    }

    console.log("Content-Type:", contentType);

    // ============================================================
    // 7.요청 본문 읽기
    // ============================================================

    let body = "";
    for await (const chunk of req) {
      body += chunk.toString();
    }

    console.log("요청 본문 (처음 100자):", body.substring(0, 100));

    // ============================================================
    // 7.백엔드로 요청 (Authorization 헤더 포함)
    // ============================================================

    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Authorization: clientAuthToken, // 클라이언트 토큰 그대로 전달
      },
      body: body,
    };

    console.log("fetch 요청 시작...");

    const response = await fetch(backendUrl, fetchOptions);

    console.log("백엔드 응답 상태:", response.status);
    console.log(
      "백엔드 응답 Content-Type:",
      response.headers.get("content-type"),
    );

    // ============================================================
    // 8.응답 처리
    // ============================================================

    // 1.응답이 실패한 경우
    if (!response.ok) {
      let errorData = null;
      let errorText = "";

      try {
        errorText = await response.text();
        // 텍스트를 JSON으로 파싱 시도
        if (errorText) {
          errorData = JSON.parse(errorText);
        }
      } catch (parseError) {
        errorData = { message: errorText };
      }

      console.error("❌ 백엔드 에러 발생");
      console.error("상태 코드:", response.status);
      console.error("에러 데이터:", errorData);

      // ✅ 백엔드 에러 응답을 그대로 클라이언트로 반환
      return res.status(response.status).json(
        errorData || {
          success: false,
          code: "BACKEND_ERROR",
          message: "백엔드 요청 실패",
          data: null,
        },
      );
    }

    // 2.성공 응답 - JSON 반환
    //
    // 대화방 API는 일반 JSON 응답만 반환
    //

    const responseData = await response.json();

    console.log("✅ JSON 응답 반환");
    console.log(
      "응답 데이터 (처음 100자):",
      JSON.stringify(responseData).substring(0, 100),
    );

    // ✅ 백엔드 응답을 그대로 클라이언트로 반환
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ [프록시 에러] 예외 발생");
    console.error("에러 메시지:", error.message);
    console.error("에러 스택:", error.stack);

    return res.status(500).json({
      success: false,
      code: "PROXY_ERROR",
      message: "프록시 처리 중 에러 발생",
      data: null,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// ============================================================
// Vercel 함수 설정
// ============================================================
//
// bodyParser 활성화 (JSON 본문 자동 파싱)
//
export const config = {
  api: {
    bodyParser: true, // JSON은 일반 파싱 사용 (multipart 아님)
  },
};
