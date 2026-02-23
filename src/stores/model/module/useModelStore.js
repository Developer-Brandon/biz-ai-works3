/**
 * ============================================================
 * useModelStore.js
 * ============================================================
 *
 * 역할:
 * - 모델 정보 관리 (목록, 선택 상태)
 * - 사용량 데이터 로드 및 관리
 * - 모델 드롭다운 상태 관리
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { modelUsageApi } from "@/api/modules/modelUsageApi";
import { STORAGE_KEYS } from "@/utils/constants";

export const useModelStore = defineStore(
  "model",
  () => {
    // ================================
    // STATE: 모델 정보 및 선택 상태
    // ================================

    const modelInfoList = ref([
      {
        value: "모델선택",
        label: "모델선택",
        desc: "",
        provider: null,
        modelName: null,
        currentUsage: 0,
        maxCalls: 0,
        remainingCalls: 0,
      },
    ]);

    const selectedModel = ref("모델선택");
    const selectedModelData = ref(null);
    const selectedProvider = ref("");

    // ================================
    // STATE: 사용량 정보
    // ================================

    const chatUsageCount = ref({
      realUsageCount: "0",
      wholeUsageCount: "0",
    });

    // ================================
    // STATE: UI 상태 (저장 안 함)
    // ================================

    const isModelDropdownOpen = ref(false);
    const isModelLoading = ref(false);
    const modelLoadError = ref(null);

    // ================================
    // COMPUTED: 파생 상태
    // ================================

    /**
     * 현재 모델의 사용량 백분율 계산
     * 예: realUsageCount=50, wholeUsageCount=100 → 50%
     */
    const usagePercentage = computed(() => {
      const whole = parseInt(chatUsageCount.value.wholeUsageCount);
      const real = parseInt(chatUsageCount.value.realUsageCount);
      if (whole === 0) return 0;
      return Math.round((real / whole) * 100);
    });

    // ================================
    // ACTIONS: 모델 데이터 로드
    // ================================

    /**
     * 모델 사용량 데이터 API 호출
     * - API에서 모델 목록과 사용량 정보 가져오기
     * - 응답 형식 처리 (배열 또는 객체)
     * - 첫 번째 모델 기준으로 사용량 초기화
     */
    const loadModelUsageData = async () => {
      isModelLoading.value = true;
      modelLoadError.value = null;

      try {
        console.group("[모델 사용량 API] 데이터 로드 시작");

        const response = await modelUsageApi.getModelDailyUsage();

        console.log("=== loadModelUsageData API 응답 분석 ===");
        console.log("response.success:", response.success);
        console.log("response.data:", response.data);

        if (!response.success || !response.data) {
          throw new Error(
            response.message || "모델 사용량 데이터를 가져올 수 없습니다.",
          );
        }

        // 응답 데이터 형식 정규화 (배열 또는 객체 모두 처리)
        let modelsArray = [];

        if (Array.isArray(response.data)) {
          console.log("response.data는 배열");
          modelsArray = response.data;
        } else if (
          !Array.isArray(response.data) &&
          typeof response.data === "object"
        ) {
          console.log("response.data는 객체");

          if (Array.isArray(response.data.data)) {
            modelsArray = response.data.data;
          } else {
            modelsArray = Object.values(response.data);
          }
        } else {
          throw new Error(`예상하지 못한 데이터 형식: ${typeof response.data}`);
        }

        console.log("최종 modelsArray:", modelsArray);

        // 모델 데이터 변환
        const convertedModels = modelsArray.map((model) => {
          return {
            value: `${model.provider}/${model.modelName}`,
            label: model.modelName,
            desc: model.desc || "",
            provider: model.provider,
            modelName: model.modelName,
            currentUsage: model.currentUsage || 0,
            maxCalls: model.maxCalls || 0,
            remainingCalls: model.remainingCalls || 0,
          };
        });

        console.log("변환된 모델 목록:", convertedModels);

        // 모델 목록 업데이트 (기본값 + 변환된 모델)
        modelInfoList.value = [
          {
            value: "모델선택",
            label: "모델선택",
            desc: "",
            provider: null,
            modelName: null,
            currentUsage: 0,
            maxCalls: 0,
            remainingCalls: 0,
          },
          ...convertedModels,
        ];

        // 첫 번째 모델의 사용량으로 초기화
        if (convertedModels.length > 0) {
          const firstModel = convertedModels[0];
          setUsageCount(firstModel.currentUsage, firstModel.maxCalls);
          console.log("사용량 초기화:", {
            current: firstModel.currentUsage,
            total: firstModel.maxCalls,
          });
        }

        console.groupEnd();
      } catch (error) {
        console.error("✗ 모델 사용량 API 오류:", error.message);
        modelLoadError.value = error.message;

        // 오류 시 기본값으로 초기화
        modelInfoList.value = [
          {
            value: "모델선택",
            label: "모델선택",
            desc: "",
            provider: null,
            modelName: null,
            currentUsage: 0,
            maxCalls: 0,
            remainingCalls: 0,
          },
        ];
        setUsageCount(0, 0);

        console.groupEnd();
      } finally {
        isModelLoading.value = false;
      }
    };

    // ================================
    // ACTIONS: 모델 선택
    // ================================

    /**
     * 모델 선택 처리
     * - selectedModel 업데이트
     * - 선택된 모델의 전체 데이터 저장
     * - 사용량 정보 업데이트
     * - 드롭다운 닫기
     */
    const selectModel = (modelLabel) => {
      console.group("[selectModel] 모델 선택 처리");
      console.log("선택 모델:", modelLabel);

      selectedModel.value = modelLabel;

      // 선택된 모델의 전체 데이터 조회
      const modelData = modelInfoList.value.find(
        (model) => model.label === modelLabel,
      );

      console.log("모델 데이터:", modelData);

      selectedModelData.value = modelData;

      // 사용량 정보 업데이트
      if (modelData && modelData.maxCalls !== undefined) {
        chatUsageCount.value = {
          realUsageCount: String(modelData.currentUsage || 0),
          wholeUsageCount: String(modelData.maxCalls || 0),
        };
      } else if (modelLabel === "모델선택") {
        // 모델선택 상태로 돌아갔을 때
        chatUsageCount.value = {
          realUsageCount: "0",
          wholeUsageCount: "0",
        };
        selectedModelData.value = null;
      }

      isModelDropdownOpen.value = false;

      if (modelData) {
        selectedProvider.value = modelData.provider;
      }

      console.log("모델 선택 완료:", {
        label: modelLabel,
        provider: modelData?.provider,
      });

      console.groupEnd();
    };

    // ================================
    // ACTIONS: 모델 드롭다운
    // ================================

    /**
     * 모델 드롭다운 토글
     * - Agent가 선택되었으면 비활성화
     */
    const toggleAiModelDropdown = (isAgentSelected) => {
      if (!isAgentSelected) {
        isModelDropdownOpen.value = !isModelDropdownOpen.value;
      } else {
        console.log("AI Agent 선택 상태이므로 모델 드롭다운 비활성화");
      }
    };

    const closeModelDropdown = () => {
      isModelDropdownOpen.value = false;
    };

    // ================================
    // ACTIONS: 모델 초기화
    // ================================

    /**
     * 모든 모델 상태 초기화
     * - 선택된 모델을 "모델선택"으로 리셋
     * - 사용량 정보 초기화
     * - 드롭다운 닫기
     */
    const deleteModel = () => {
      console.log("[deleteModel] 모델 상태 초기화");

      selectedModel.value = "모델선택";
      selectedProvider.value = "";
      selectedModelData.value = null;
      isModelDropdownOpen.value = false;
      chatUsageCount.value = {
        realUsageCount: "0",
        wholeUsageCount: "0",
      };

      console.log("모델 상태 초기화 완료");
    };

    /**
     * 사용량 수동 설정
     */
    const setUsageCount = (current, total) => {
      chatUsageCount.value = {
        realUsageCount: String(current),
        wholeUsageCount: String(total),
      };
    };

    /**
     * 모델 에러 메시지 초기화
     */
    const clearModelError = () => {
      modelLoadError.value = null;
    };

    // ================================
    // EXPORT
    // ================================

    return {
      // State
      modelInfoList,
      selectedModel,
      selectedModelData,
      selectedProvider,
      chatUsageCount,
      isModelDropdownOpen,
      isModelLoading,
      modelLoadError,

      // Computed
      usagePercentage,

      // Methods
      loadModelUsageData,
      selectModel,
      toggleAiModelDropdown,
      closeModelDropdown,
      deleteModel,
      setUsageCount,
      clearModelError,
    };
  },
  {
    /**
     * Pinia Persistence 설정
     * - sessionStorage에만 저장
     * - 선택된 모델과 사용량만 유지
     */
    persist: {
      storage: sessionStorage,
      paths: ["selectedModel", "selectedProvider", "chatUsageCount"],
      key: STORAGE_KEYS.SESSION_STORAGE_DATA.MODEL_KEY,
    },
  },
);
