/**
 * src/utils/constants.js
 * 프로젝트 전체에서 사용되는 상수들을 중앙에서 관리합니다.
 *
 * 사용 예시:
 * import { API_BASE_URL, AGENT_TYPES } from '@/utils/constants'
 * fetch(`${API_BASE_URL}/${AGENT_TYPES.GPT5}`)
 */

/* ==================== 1.API 설정 및 API 엔드포인트 ==================== */
/**
 * 1-(1).API 기본 주소
 *
 * 🔀 환경에 따라 자동으로 결정됨:
 */

import { toBoolean } from "@/utils/common";

/**
 * HTTP 요청 기본 옵션 값 모음
 * 모든 요청에 공통으로 적용될 설정
 */
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

export const STATIC_HEADERS_KEY = {
  CONTENT_TYPE: "Content-Type",
  CACHE_CONTROL: "Cache-Control",
  CONNECTION: "Connection",
  X_ROOM_ID: "X-Room-Id",
};

/**
 * 1-(2).API 엔드포인트
 */
const PREFIX = "/api";

export const API_ENDPOINTS = {
  PREFIX,
  // 채팅
  CHAT_SEND: `${PREFIX}/chat/send`,
  CHAT_HISTORY: `${PREFIX}/chat/history`,
  // AI 에이전트
  AGENTS: `${PREFIX}/agents`,
  AGENT_DETAIL: `${PREFIX}/agents/:id`,
  // 사용자
  USER_PROFILE: `${PREFIX}/user/profile`,
  // 이미지 / 콘텐츠
  IMAGES: `${PREFIX}/images`,
  CONTENT: `${PREFIX}/content`,
  // 인증 (authApi.js에서 사용)
  AUTH: {
    PUBLIC_KEY: `${PREFIX}/auth/public-key`,
    LOGIN: `${PREFIX}/auth/login`,
    REFRESH: `${PREFIX}/auth/refresh`,
    CHANGE_PASSWORD: `${PREFIX}/auth/change-password`,
    CHANGE_INITIAL_PASSWORD: `${PREFIX}/auth/change-initial-password`,
    LOGIN_PAYLOAD: `${PREFIX}/auth/login-payload`,
  },
};

/* ==================== 3.타입(구분자) ==================== */

//* 3-(1).TAG 타입
export const INPUT_TAG_TYPES = {
  AGENT: "agent",
  FILE: "file",
};

//* 3-(2).FAQ 타입
export const FAQ_TYPES = {
  Q_PENDING: "질문대기",
  A_COMPLETED: "질문완료",
};

//* 3-(3).CHAT EXECUTION MODE 타입
export const CHAT_ROOM_TYPES = {
  AGENT: "agent", // AI Agent 기반
  CHAT: "chat", // 일반 채팅
  NOTHING: null, // 화면 초기화 하고싶은 경우
};

//* 3-(4).CHAT ROLE 타입
export const CHAT_ROLE_TYPES = {
  USER: "user",
  ASSISTANT: "assistant",
};

/* ==================== 4.상태 메시지 ==================== */

// 4-(1).사용자에게 보여줄 메시지들
export const MESSAGES = {
  LOADING: "로딩 중입니다...",
  ERROR_NETWORK: "네트워크 연결을 확인해주세요.",
  ERROR_SERVER: "서버 오류가 발생했습니다.",
  ERROR_EMPTY_MESSAGE: "메시지를 입력해주세요.",
  SUCCESS_MESSAGE_SENT: "메시지가 전송되었습니다.",
  ERROR_MESSAGE_SEND: "메시지 전송에 실패했습니다.",
};

/* ==================== 5.브라우저 저장소 키 ==================== */

// 5-(1).pianaStorage에서 사용되는 키들
export const STORAGE_KEYS = {
  LOCAL_STORAGE_DATA: {
    AUTH_KEY: "biz-ai-works-auth",
  },
  SESSION_STORAGE_DATA: {
    DATA_KEY: "biz-ai-works-data",
    CONFIG_KEY: "biz-ai-works-config",
  },
};

/* ==================== 6.유효성 검사 ==================== */

// 6-(1).입력값 검증 규칙
export const VALIDATION_RULES = {
  MESSAGE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 6000,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 255,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 15,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,15}$/, // 숫자, 대문자, 소문자 포함 필수
  },
};

/* ==================== 7.타임아웃 설정 ==================== */

// 7-(1).다양한 작업의 타임아웃 시간 (밀리초)
export const TIMEOUTS = {
  API_REQUEST: 30000, // API 요청 : 30초
  MESSAGE_DEBOUNCE: 300, // 메세지 입력 디바운스: 300ms
  TOAST_NOTIFICATION: 3000, // 토스트 알림: 3초
  DEFAULT: 30000, // 30초
  CHAT: 300000, // 5분 (채팅은 오래 걸릴 수 있음)
  FILE_UPLOAD: 600000, // 10분 (파일 업로드)
};

/* ==================== 8.페이지 구성(대메뉴, TODO: 추후 작업 예정) ==================== */

/* ==================== 9.파일 업로드 설정 ==================== */

/**
 * 9-(1).문서 업로드 설정
 */
export const DOCUMENT_UPLOAD = {
  ALLOWED_TYPES: ["txt", "pdf", "doc", "docx", "csv", "excel", "md", "html"],
  ALLOWED_MIME: [
    "text/plain",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
    "text/markdown",
    "text/html",
  ],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

/**
 * 9-(2).이미지 업로드 설정
 */
export const IMAGE_UPLOAD = {
  ALLOWED_TYPES: ["png", "jpeg", "jpg", "gif", "webp"],
  ALLOWED_MIME: ["image/png", "image/jpeg", "image/gif", "image/webp"],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

/* ==================== 10. VITE 환경 변수 ==================== */

/**
 * Vite 환경 변수
 */

export const ENV = {
  BASE_API_URL: import.meta.env.VITE_API_URL,
  BASE_APP_NAME: import.meta.env.VITE_APP_NAME,
  IS_DEVELOPMENT: toBoolean(import.meta.env.VITE_DEV), // true = 로컬, false = 배포
  LOGIN_PAGE_TITLE: "Biz.AI - 로그인",
  MAIN_PAGE_TITLE: "Biz.AI - 메인",

  // ============================================================
  // ✅ [추가] Mixed Content 해결을 위한 백엔드 URL 설정
  // ============================================================
  // 역할:
  // - interceptor에서 배포 환경 시 이 URL들을 제거하여 상대 경로로 변환
  // - Vercel rewrites가 이 상대 경로를 다시 백엔드로 프록시
  //
  // 사용 예시:
  // - 로컬: "http://172.190.116.61:18080/api/..." → 그대로 사용
  // - 배포: "http://172.190.116.61:18080/api/..." → "/api/..." 변환
  // ============================================================
  BACKEND_URLS: [
    "http://172.190.116.61:18080", // 메인 API 서버 (포트 18080)
    "http://172.190.116.61:8080", // 파일 서버 (포트 8080)
    "http://172.190.116.61:18000", // 기타 API 서버 (포트 18000)
  ],
};

export const API_BASE_URL = (() => {
  // API_BASE_URL은 로컬 개발 시에만 필요
  if (ENV.IS_DEVELOPMENT) {
    return "http://172.190.116.61:18080";
  }
  // 배포: 상대경로 사용하므로 빈 문자열 반환
  return "";
})();
