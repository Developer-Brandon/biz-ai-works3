/**
 * ============================================================
 * [API 모듈] 인증 관련 API
 * ============================================================
 *
 * 역할:
 * - 로그인, 토큰 갱신, 비밀번호 변경 등 인증 관련 API
 * - RSA Public Key 조회
 * - 초기 비밀번호 변경
 */

import { http } from "../http";
import { ENV } from "@/utils/constants";
import { getEndpoint } from "@/utils/common";

/**
 * ============================================================
 * 1️.RSA Public Key 조회
 * ============================================================
 *
 * 역할:
 * - 로그인 시 사용할 RSA Public Key를 조회합니다
 * - 조회한 Public Key로 AES Key를 암호화하여 전송합니다
 */
async function getPublicKey() {
  const endpoint = getEndpoint("/api/auth/public-key", "/api/auth/public-key");
  console.log(`[RSA Public Key 조회] ${endpoint}`);
  return http.post(endpoint, {});
}

/**
 * ============================================================
 * 2.로그인 (하이브리드 암호화)
 * ============================================================
 *
 * 인증: 불필요 (로그인 전이므로)
 *
 * 역할 및 암호화 방식:
 * 1. 비밀번호를 SHA-256으로 해싱
 * 2. JSON {email, hashedPassword}을 AES로 암호화
 * 3. AES Key를 RSA Public Key로 암호화
 * 4. 암호화된 데이터, AES Key, IV를 전송
 *
 * 응답 헤더:
 * - Authorization: Bearer {accessToken}
 * - RefreshToken: {refreshToken}
 *
 * 응답 바디:
 * {
 *   success: true,
 *   data: {
 *     accessToken: "JWT_TOKEN",
 *     refreshToken: "REFRESH_TOKEN",
 *     tokenType: "Bearer",
 *     expiresIn: 3600,
 *     isInitialPassword: false
 *   }
 * }
 */
async function login(encryptedData, encryptedAesKey, iv) {
  const endpoint = getEndpoint("/api/auth/login", "/api/auth/login");
  console.log(`[로그인] ${endpoint}`);
  return http.post(endpoint, {
    encryptedData,
    encryptedAesKey,
    iv,
  });
}

/**
 * ============================================================
 * 3️.토큰 갱신
 * ============================================================
 *
 * 엔드포인트 (로컬): POST /api/auth/refresh
 * 엔드포인트 (배포): POST /api/auth/refresh (Vercel 프록시)
 * 인증: 필요 (Bearer Token)
 *
 * 역할:
 * - Refresh Token을 사용하여 새로운 Access Token 발급
 * - Access Token 만료 시 사용
 *
 * 응답 헤더:
 * - Authorization: Bearer {newAccessToken}
 *
 * 응답 바디:
 * {
 *   success: true,
 *   data: {}
 * }
 *
 * @returns {Promise<Object>} 갱신된 토큰 정보
 */
async function refresh() {
  const endpoint = getEndpoint("/api/auth/refresh", "/api/auth/refresh");
  console.log(`[토큰 갱신] ${endpoint}`);
  return http.post(endpoint, {});
}

/**
 * ============================================================
 * 4. 비밀번호 변경
 * ============================================================
 *
 * 엔드포인트 (로컬): POST /api/auth/change-password
 * 엔드포인트 (배포): POST /api/auth/change-password (Vercel 프록시)
 * 인증: 필요 (Bearer Token)
 *
 * 역할:
 * - 로그인한 사용자의 비밀번호 변경
 * - 현재 비밀번호 확인 후 변경
 *
 * 요청 데이터:
 * {
 *   currentPassword: "SHA256_해시된_현재_비밀번호",
 *   newPassword: "새로운_비밀번호",
 *   confirmPassword: "새로운_비밀번호_확인",
 *   passwordMatch: true
 * }
 *
 * 응답 바디:
 * {
 *   success: true,
 *   data: {
 *     success: true,
 *     message: "비밀번호가 변경되었습니다"
 *   }
 * }
 *
 * @param {Object} passwordData - 비밀번호 변경 데이터
 * @param {string} passwordData.currentPassword - SHA256 해시된 현재 비밀번호
 * @param {string} passwordData.newPassword - 새로운 비밀번호 (최소 8자)
 * @param {string} passwordData.confirmPassword - 새로운 비밀번호 확인
 * @returns {Promise<Object>} 비밀번호 변경 결과
 */
async function changePassword(passwordData) {
  // 필수 필드 검증
  if (!passwordData.currentPassword || !passwordData.newPassword) {
    throw new Error("currentPassword와 newPassword는 필수입니다");
  }

  // 비밀번호 길이 검증
  if (passwordData.newPassword.length < 8) {
    throw new Error("새 비밀번호는 최소 8자 이상이어야 합니다");
  }

  // 비밀번호 일치 검증
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    throw new Error("새 비밀번호가 일치하지 않습니다");
  }

  const endpoint = getEndpoint(
    "/api/auth/change-password",
    "/api/auth/change-password",
  );

  console.log(`[비밀번호 변경] ${endpoint}`);
  return http.post(endpoint, {
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    confirmPassword: passwordData.confirmPassword,
    passwordMatch: true,
  });
}

/**
 * ============================================================
 * 5️.초기 비밀번호 변경
 * ============================================================
 *
 * 역할:
 * - 초기(임시) 비밀번호를 새 비밀번호로 변경
 * - 로그인 후 isInitialPassword가 true일 때 사용
 *
 * 요청 데이터:
 * {
 *   email: "user@example.com",
 *   currentPassword: "SHA256_해시된_초기_비밀번호",
 *   newPassword: "새로운_비밀번호",
 *   confirmPassword: "새로운_비밀번호_확인",
 *   passwordMatch: true
 * }
 *
 */
async function changeInitialPassword(passwordData) {
  if (
    !passwordData.email ||
    !passwordData.currentPassword ||
    !passwordData.newPassword
  ) {
    throw new Error("email, currentPassword, newPassword는 필수입니다");
  }
  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(passwordData.email)) {
    throw new Error("유효한 이메일 주소를 입력하세요");
  }
  // 비밀번호 길이 검증
  if (passwordData.newPassword.length < 8) {
    throw new Error("새 비밀번호는 최소 8자 이상이어야 합니다");
  }
  // 비밀번호 일치 검증
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    throw new Error("새 비밀번호가 일치하지 않습니다");
  }
  const endpoint = getEndpoint(
    "/api/auth/change-initial-password",
    "/auth/change-initial-password",
  );
  console.log(`[초기 비밀번호 변경] ${endpoint}`);
  return http.post(endpoint, {
    email: passwordData.email,
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    confirmPassword: passwordData.confirmPassword,
    passwordMatch: true,
  });
}

/**
 * ============================================================
 * 6️. 로그인 페이로드 생성
 * ============================================================
 *
 * 엔드포인트 (로컬): POST /api/auth/test/generate-login-payload
 * 엔드포인트 (배포): POST /api/auth/login-payload (Vercel 프록시)
 * 인증: 불필요
 *
 * 역할:
 * - 개발/테스트용 API
 * - 평문 이메일/비밀번호를 받아 암호화된 페이로드 자동 생성
 * - 실제 개발 시 이 API로 암호화된 데이터를 받아 login() 호출
 *
 * 요청 데이터:
 * {
 *   email: "user@example.com",
 *   password: "plainPassword123"
 * }
 *
 * 응답 바디:
 * {
 *   success: true,
 *   data: {
 *     encryptedData: "Base64...",
 *     encryptedAesKey: "Base64...",
 *     iv: "Base64..."
 *   }
 * }
 *
 * @param {Object} credentials - 로그인 정보 (평문)
 * @param {string} credentials.email - 이메일
 * @param {string} credentials.password - 비밀번호 (평문)
 * @returns {Promise<Object>} 암호화된 페이로드
 */
async function generateLoginPayload(credentials) {
  const endpoint = getEndpoint(
    "/api/auth/test/generate-login-payload",
    "/api/auth/login-payload",
  );

  console.log(`[로그인 페이로드 생성] ${endpoint}`);
  console.log(`환경: ${ENV.IS_DEVELOPMENT ? "로컬" : "배포"}`);

  console.log(`[로그인 페이로드 생성] ${endpoint}`);
  return http.post(endpoint, {
    email: credentials.email,
    password: credentials.password,
  });
}

// ============================================================
// Export
// ============================================================

export const authApi = {
  getPublicKey,
  login,
  refresh,
  changePassword,
  changeInitialPassword,
  generateLoginPayload,
};

export default authApi;
