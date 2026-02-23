import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getMockConfigData } from "@/api/mocking";
import appConfigApi from "@/api/modules/appConfigApi.js";
import { useTestAuthStore } from "@/stores/useTestAuthStore";
import { STORAGE_KEYS } from "@/utils/constants";
import { toBoolean } from "@/utils/common";

export const useConfigStore = defineStore(
  "config",
  () => {
    /* ============================================================
     * State
     * ============================================================ */

    /**
     * 서버에서 받은 설정 데이터
     */
    const serverConfig = ref(null);

    /**
     * 에러 메시지
     *
     * persist에 포함하지 않음 (임시 상태, 저장 불필요)
     */
    const error = ref(null);

    // test auth 데이터
    const testAuthStore = useTestAuthStore();

    /* ============================================================
     * Getters - Common
     * ============================================================ */

    const office = computed(() => {
      return serverConfig.value?.data?.info?.common?.office || "";
    });

    const imageServerUrl = computed(() => {
      return serverConfig.value?.data?.info?.common?.imageServerUrl || "";
    });

    const faviconImageUrl = computed(() => {
      return (
        imageServerUrl.value +
        (serverConfig.value?.data?.info?.common?.faviconImageUrl || "")
      );
    });

    const logoImageUrl = computed(() => {
      return (
        imageServerUrl.value +
        (serverConfig.value?.data?.info?.common?.logoImageUrl || "")
      );
    });

    const mainColorHexCode = computed(() => {
      return serverConfig.value?.data?.info?.common?.mainColorHexCode || "";
    });

    const mainHoverColorHexCode = computed(() => {
      return (
        serverConfig.value?.data?.info?.common?.mainHoverColorHexCode || ""
      );
    });

    const subColorHexCode = computed(() => {
      return serverConfig.value?.data?.info?.common?.subColorHexCode || "";
    });

    const subHoverColorHexCode = computed(() => {
      return serverConfig.value?.data?.info?.common?.subHoverColorHexCode || "";
    });

    /* ============================================================
     * Getters - Login
     * ============================================================ */

    const defaultProfileImage = computed(() => {
      return (
        imageServerUrl.value +
        (serverConfig.value?.data?.info?.login?.defaultProfileImageUrl || "")
      );
    });

    const loginPannelImageUrl = computed(() => {
      return (
        imageServerUrl.value +
        (serverConfig.value?.data?.info?.login?.pannelImageUrl || "")
      );
    });

    /* ============================================================
     * Getters - Main
     * ============================================================ */

    const aiAgentCards = computed(() => {
      return serverConfig.value?.data?.info?.main?.aiAgentCards || [];
    });

    const aiAgentButtonConfig = computed(() => {
      return (
        serverConfig.value?.data?.info?.main?.aiAgentButtonConfig || {
          startGradientColor: "",
          endGradientColor: "",
        }
      );
    });

    const uploadFeatureConfig = computed(() => {
      return (
        serverConfig.value?.data?.info?.main?.uploadFeatureConfig || {
          fileUploadUsage: "false",
          imageUploadUsage: "false",
        }
      );
    });

    const isFileUploadEnabled = computed(() => {
      return uploadFeatureConfig.value.fileUploadUsage === "true";
    });

    const isImageUploadEnabled = computed(() => {
      return uploadFeatureConfig.value.imageUploadUsage === "true";
    });

    /* ============================================================
     * Getters - Expand
     * ============================================================ */

    const expandConfig = computed(() => {
      return serverConfig.value?.data?.info?.main?.expand || null;
    });

    const hasExpandFeature = computed(() => {
      return !!expandConfig.value && Object.keys(expandConfig.value).length > 0;
    });

    const expandBannerPannelImageUrl = computed(() => {
      if (!expandConfig.value) return "";
      return (
        imageServerUrl.value + expandConfig.value.expandBannerPannelImageUrl
      );
    });

    const expandBannerPannelBackgroundImageUrl = computed(() => {
      if (!expandConfig.value) return "";
      return (
        imageServerUrl.value +
        expandConfig.value.expandBannerPannelBackgroundImageUrl
      );
    });

    const expandServices = computed(() => {
      return expandConfig.value?.aiAgentCards || [];
    });

    /* ============================================================
     * Computed
     * ============================================================ */

    const isConfigLoaded = computed(() => {
      return serverConfig.value !== null;
    });

    /* ============================================================
     * Actions
     * ============================================================ */

    /**
     * 서버에서 설정 데이터 가져오기
     * TODO: 비상대응 관련 분기처리 필요
     *
     * 주의:
     * - fetchConfig() 후 상태가 자동으로 pianaStorage에 저장됨
     * - 페이지 새로고침 시 저장된 데이터가 자동으로 복원됨
     *
     * @param {string} apiUrl - API 엔드포인트 (기본값: '/api/app/info')
     * @returns {Promise<Object>} - 설정 데이터
     */
    async function fetchConfig() {
      error.value = null;

      try {
        // fallbackMode에 의한 설정
        const fallBackMode = toBoolean(import.meta.env.VITE_FALLBACK_MODE);
        console.log("fetchConfig:fallBackMode:", fallBackMode);
        let data;
        if (fallBackMode) {
          data = await getMockConfigData("KT-DS", testAuthStore);
        } else {
          const office = import.meta.env.VITE_OFFICE;
          data = await appConfigApi.fetchAppInfo(office);
        }
        serverConfig.value = data;
        console.log("serverConfig.value:", serverConfig.value);
        applyThemeToDOM();
        console.log("✅ Config loaded");
        return data;
      } catch (err) {
        error.value = err?.message || "Config load failed";
        console.error(err);
        throw err;
      }
    }

    /**
     * 테마 컬러를 DOM의 CSS 변수로 적용
     *
     * 역할:
     * - fetchConfig() 내부에서 자동 호출됨
     * - 필요시 직접 호출 가능
     */
    function applyThemeToDOM() {
      if (!serverConfig.value) return;

      const root = document.documentElement;

      const themeValues = {
        "--primary-color": mainColorHexCode.value,
        "--primary-hover-color": mainHoverColorHexCode.value,
        "--primary-icon-color": `#868e96`,
        "--sub-color": subColorHexCode.value,
        "--sub-hover-color": subHoverColorHexCode.value,
        "--login-pannel-image": `url(${loginPannelImageUrl.value})`,
      };

      Object.entries(themeValues).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      console.dir(themeValues);
    }

    /* ============================================================
     * Exports
     * ============================================================ */

    return {
      // State
      serverConfig,
      error,

      // Common
      office,
      imageServerUrl,
      faviconImageUrl,
      logoImageUrl,
      mainColorHexCode,
      mainHoverColorHexCode,
      subColorHexCode,
      subHoverColorHexCode,

      // Login
      defaultProfileImage,
      loginPannelImageUrl,

      // Main
      aiAgentCards,
      aiAgentButtonConfig,
      uploadFeatureConfig,
      isFileUploadEnabled,
      isImageUploadEnabled,

      // Expand
      expandConfig,
      hasExpandFeature,
      expandBannerPannelImageUrl,
      expandBannerPannelBackgroundImageUrl,
      expandServices,

      // Computed
      isConfigLoaded,

      // Actions
      fetchConfig,
      applyThemeToDOM,
    };
  },
  {
    /**
     * ============================================================
     * Pinia Persistence 설정
     * ============================================================
     *
     * 서버에서 받은 설정 데이터를 pianaStorage에 자동 저장
     * 페이지 새로고침 시 자동으로 복원됨
     */
    persist: {
      // 저장소 지정
      storage: sessionStorage,

      // 저장할 상태만 선택
      // serverConfig만 저장 (error는 임시 상태이므로 저장 불필요)
      paths: [
        "serverConfig", // 서버 설정 데이터
      ],

      // 브라우저 F12에서 노출되는 저장소 키 이름
      key: STORAGE_KEYS.SESSION_STORAGE_DATA.CONFIG_KEY,
    },
  },
);
