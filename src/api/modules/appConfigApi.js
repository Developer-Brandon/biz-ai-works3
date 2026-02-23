/**
 * 앱 설정 관련 API
 */
import { http } from "../http";
import { getEndpoint } from "@/utils/common";

/**
 * 서버 설정 정보 조회
 */
async function fetchAppInfo(office) {
  const endpoint = getEndpoint("/api/app/info", "/api/app/info");
  const response = http.post(endpoint, { office });
  return response;
}

export const appConfigApi = {
  fetchAppInfo,
};

export default appConfigApi;
