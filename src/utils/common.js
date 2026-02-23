// src/utils/common.js
import { marked } from "marked";
import { API_BASE_URL, ENV } from "@/utils/constants";

/**
 *  마크다운 파싱 함수
 *
 * @param {string} content - 원본 텍스트 (마크다운 포함)
 * @returns {string} - HTML 문자열
 */
export const parseMarkdown = (content) => {
  if (!content) return "";

  let html = marked.parse(content, {
    breaks: true,
    gfm: true,
  });

  html = html.replace(
    /\[([^\]]+\.(pdf|docx?|xlsx?|pptx?|txt|csv|hwp))\]/gi,
    (_, filename) => `<span class="reference-tag file-tag">${filename}</span>`,
  );

  // ============================================================
  // Step 3: 백엔드 URL을 프록시 URL로 변환 (HTTPS Mixed Content 해결)
  // ============================================================
  // 이게 핵심!
  // ============================================================
  // 변환 규칙:
  // ============================================================
  // 1.포트 8080 (파일 서버)
  //    기존: http://172.190.116.61:8080/files/...
  //    변환: /api/files/...
  //    역할: 파일 다운로드
  //
  // 2.포트 18000 (API 서버)
  //    기존: http://172.190.116.61:18000/...
  //    변환: /api/v1/...
  //    역할: REST API 호출
  //
  // 3.✅ [추가] 포트 18080 (메인 API 서버)
  //    기존: http://172.190.116.61:18080/...
  //    변환: /... (상대 경로)
  //    역할: 메인 API, 이미지, 파일 등
  // ============================================================
  // vercel.json의 rewrite 규칙에 의해 자동으로 백엔드로 프록시됨
  // ============================================================

  // Rule 1: 포트 8080 (파일 서버) → /api/files
  html = html.replace(
    /href="http:\/\/172\.190\.116\.61:8080\/files\//g,
    'href="/api/files/',
  );

  // Rule 2: 포트 18000 (API 서버) → /api/v1
  // ⚠️ 주의: 정규표현식 설명
  // - http:\/\/172\.190\.116\.61:18000\/ : 정확히 이 URL로 시작하는 부분
  // - g 플래그: 문서 전체에서 모든 매칭 찾기 (global)
  // - replace의 두 번째 인자: 교체할 문자열
  html = html.replace(
    /href="http:\/\/172\.190\.116\.61:18000\//g,
    'href="/api/v1/',
  );

  // ============================================================
  // ✅ [추가] Rule 3: 포트 18080 (메인 API 서버) → 상대 경로
  // ============================================================
  // 역할:
  // - interceptor를 통과한 URL이 있을 경우 2차 방어선
  // - 링크 href와 이미지 src 모두 처리
  //
  // 변환 예시:
  // - <a href="http://172.190.116.61:18080/api/..."> → <a href="/api/...">
  // - <img src="http://172.190.116.61:18080/api/..."> → <img src="/api/...">
  // ============================================================

  // Rule 3-1: 링크 href
  html = html.replace(/href="http:\/\/172\.190\.116\.61:18080/g, 'href="');

  // Rule 3-2: 이미지 src
  html = html.replace(/src="http:\/\/172\.190\.116\.61:18080/g, 'src="');

  // Step 4: 링크에 target="_blank" 추가 (새 탭에서 열기)
  html = html.replace(
    /<a href=/g,
    '<a target="_blank" rel="noopener noreferrer" href=',
  );

  return html;
};

/**
 * 타임스탬프 포맷팅
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/* 
  local에서 정해놓은 phase에 따라 동적으로 enpoint주소 가져오기
*/
export const getEndpoint = (localPath, proxyPath) => {
  if (ENV.IS_DEVELOPMENT) {
    console.log("🔨 로컬 환경: 직접 백엔드로 요청", localPath);
    return localPath;
  } else {
    console.log("배포 환경: Vercel 프록시로 요청", proxyPath);
    return proxyPath;
  }
};

export const getEndpointDetail = (localPath, proxyPath) => {
  if (ENV.IS_DEVELOPMENT) {
    console.log("🔨 로컬 환경: 직접 백엔드로 요청", localPath);
    return localPath;
  } else {
    console.log("배포 환경: Vercel 프록시로 요청", proxyPath);
    return import.meta.env.VITE_API_URL + proxyPath;
  }
};

/**
 * ============================================================
 * ✅ validateAgentIds - Agent 이름으로 필터링
 * ============================================================
 *
 * 역할:
 * - agents[].name에 제외할 문자열이 포함되면 → agents = []
 * - 예: "[RELEASE]OCI WEB Portal" → 일반 채팅이므로 agents = []
 * - EXCLUDED_AGENT_NAMES 배열에 포함된 문자열이 agent.name에 있으면
 * - agents 배열 전체를 빈 배열로 변환
 * - 이렇게 하면 일반 채팅방으로 분류됨 (Agent 태그 안 나옴)
 *
 * @param {Array} agents - API 응답의 agents 배열
 * @returns {Array} 검증된 agents 배열 (없으면 빈 배열)
 */
export const validateAgentIds = (agents) => {
  console.group(" [validateAgentIds] Agent 이름 검증 시작");

  // 1.agents가 없으면 그냥 반환
  if (!agents || !Array.isArray(agents) || agents.length === 0) {
    console.log("agents 배열이 비어있음");
    console.groupEnd();
    return agents;
  }

  console.log("검증할 agents:", {
    count: agents.length,
    agents: agents.map((a) => ({
      id: a.id,
      name: a.name,
    })),
  });

  // ❌ 제외할 문자열 리스트 (일반 채팅으로 분류될 Agent들)
  // 이 문자열이 agents[].name에 포함되면 agents = []로 변환
  const EXCLUDED_AGENT_NAMES = [
    "WEB Portal", // "[RELEASE]OCI WEB Portal" 필터링
  ];

  console.log("제외할 Agent 이름 목록:", EXCLUDED_AGENT_NAMES);

  // 2.agents의 name에 제외 문자열이 포함되는지 확인
  const hasExcludedName = agents.some((agent) =>
    EXCLUDED_AGENT_NAMES.some((excludedName) =>
      agent.name.includes(excludedName),
    ),
  );

  if (hasExcludedName) {
    // ❌ 제외 문자열 포함 → agents = []
    console.log("❌ Agent 이름에 제외 문자열 포함됨");
    agents.forEach((agent) => {
      const isExcluded = EXCLUDED_AGENT_NAMES.some((excludedName) =>
        agent.name.includes(excludedName),
      );
      console.log(
        `   ${agent.name}: ${isExcluded ? "❌ 제외됨" : "✅ 포함됨"}`,
      );
    });
    console.log("❌ → agents를 빈 배열로 변환 (일반 채팅으로 분류됨)");
    console.groupEnd();
    return [];
  }

  // ✅ 모든 검증 통과
  console.log("✅ 모든 Agent가 포함되어야 할 이름임 - agents 그대로 반환");
  console.groupEnd();
  return agents;
};

export const isValidHex = (color) => {
  const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;
  return hexRegex.test(color);
};

export const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase().trim() === "true";
  }
  return false;
};
