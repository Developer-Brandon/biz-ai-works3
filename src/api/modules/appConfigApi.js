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
  const response = await http.post(endpoint, { office });

  console.log("appConfigApi.js - fetchAppInfo - response:", response);

  if (!response.success) {
    const error = new Error(response.message || "Failed to fetch app info");
    error.code = response.code;
    error.status = response.status;
    throw error;
  }

  return response;
}

export const appConfigApi = {
  fetchAppInfo,
};

export default appConfigApi;
