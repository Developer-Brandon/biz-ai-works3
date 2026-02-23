/**
 * [프록시] AI Agent API 프록시 (Vercel 함수)
 */

export default async function handler(req, res) {
  console.group("=== Vercel AI Agent 프록시 함수 시작 ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", {
    "content-type": req.headers["content-type"],
    authorization: req.headers.authorization
      ? req.headers.authorization.substring(0, 20) + "..."
      : "없음",
  });
  console.groupEnd();

  // ============================================================
  // 1.CORS 헤더 설정
  // ============================================================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );

  // ============================================================
  // 2.OPTIONS 요청 처리 (Preflight)
  // ============================================================
  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS preflight 요청 처리됨");
    return res.status(200).end();
  }

  // ============================================================
  // 3.POST/GET 요청만 허용
  // ============================================================
  if (req.method !== "POST" && req.method !== "GET") {
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
    // 요청 경로에서 실제 백엔드 엔드포인트 결정
    // ============================================================
    //
    // 클라이언트에서 보낸 URL을 분석하여 올바른 백엔드 엔드포인트 선택
    //
    // 요청 경로 분석:
    // - /api/chat/agents/list → /api/chat/agents/list
    // - /api/chat/agents/detail → /api/chat/agents/detail
    // - /api/chat/agents/invoke → /api/chat/agents/invoke
    //

    let backendEndpoint = "/api/chat/agents/list"; // 기본값

    if (req.url && req.url.includes("detail")) {
      backendEndpoint = "/api/chat/agents/detail";
    } else if (req.url && req.url.includes("invoke")) {
      backendEndpoint = "/api/chat/agents/invoke";
    }

    const backendUrl = `http://172.190.116.61:18080${backendEndpoint}`;

    console.log("백엔드 요청 준비");
    console.log("엔드포인트:", backendEndpoint);
    console.log("전체 URL:", backendUrl);
    console.log("Method:", req.method);

    // ============================================================
    // 백엔드로 요청 (Authorization 헤더 포함)
    // ============================================================

    const fetchOptions = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        // ✅ 클라이언트 Authorization 헤더를 그대로 백엔드로 전달
        Authorization: clientAuthToken,
      },
      timeout: 30000,
    };

    // POST 요청일 때만 body 포함
    if (req.method === "POST") {
      fetchOptions.body = JSON.stringify(req.body || {});
      console.log("Body:", JSON.stringify(req.body || {}));
    }

    console.log("fetch 요청 시작...");

    const response = await fetch(backendUrl, fetchOptions);

    console.log("백엔드 응답 상태:", response.status);

    // ============================================================
    // 응답 처리
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
      // (이미 JSON 형식일 가능성이 높음)
      return res.status(response.status).json(
        errorData || {
          success: false,
          code: "BACKEND_ERROR",
          message: "백엔드 요청 실패",
          data: null,
        },
      );
    }

    // 2.성공 응답
    const data = await response.json();
    console.log("✅ 백엔드 응답 성공");
    console.log("응답 데이터:", {
      success: data.success,
      code: data.code,
      message: data.message,
      dataKeys: data.data ? Object.keys(data.data) : "null",
    });

    // ✅ 백엔드 응답을 그대로 클라이언트로 반환
    return res.status(200).json(data);
  } catch (error) {
    console.error("❌ [AI Agent 프록시 에러] 예외 발생");
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
