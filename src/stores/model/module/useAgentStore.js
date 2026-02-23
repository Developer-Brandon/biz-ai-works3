/**
 * ============================================================
 * useAgentStore.js
 * ============================================================
 *
 * 역할:
 * - AI Agent 목록 로드 및 관리
 * - Agent 태그 추가/제거
 * - 선택된 Agent 상태 관리
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useTestAuthStore } from "@/stores/useTestAuthStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { INPUT_TAG_TYPES, STORAGE_KEYS } from "@/utils/constants";
import agentApi from "../../../api/modules/agentApi";

export const useAgentStore = defineStore(
  "agent",
  () => {
    // ================================
    // STATE: Agent 정보
    // ================================

    /**
     * AI Agent 목록
     * 예: [
     *   { id: 1, name: "Agent1", desc: "설명" },
     *   { id: 2, name: "Agent2", desc: "설명" }
     * ]
     */
    const aiAgentInfoList = ref([]);

    /**
     * 선택된 Agent 이름 (태그용)
     * 예: "@Agent1"
     */
    const selectedAiAgent = ref("");

    /**
     * 선택된 Agent의 전체 데이터
     * 예: { id: 1, name: "Agent1", desc: "설명" }
     */
    const selectedAiAgentData = ref(null);

    /**
     * 현재 에이전트 이름 (추적용)
     */
    const currentAgentName = ref("");

    // ================================
    // STATE: UI 상태 (저장 안 함)
    // ================================

    const isAiAgentDropdownOpen = ref(false);
    const isAiAgentLoading = ref(false);
    const aiAgentLoadError = ref(null);

    // ================================
    // COMPUTED: Agent 태그 정보
    // ================================

    /**
     * Agent 태그 목록
     *
     * 용도: 입력창에 표시되는 태그들
     */
    const aiAgentTagList = computed(() => {
      if (selectedAiAgent.value) {
        return [
          {
            index: 0,
            type: INPUT_TAG_TYPES.AGENT,
            value: `@${selectedAiAgent.value}`,
            agentId: selectedAiAgentData.value?.agentId || "",
          },
        ];
      }
      return [];
    });
    /**
     * Agent이 선택되었는지 여부
     */
    const isAiAgentSelected = computed(() => {
      return aiAgentTagList.value.length > 0;
    });

    // ================================
    // ACTIONS: Agent 로드
    // ================================

    /**
     * AI Agent 목록 로드
     * - Mock 데이터 또는 API에서 조회
     * - 서버 설정에서 Agent 정보 가져오기
     */
    const loadAiAgentList = async () => {
      try {
        console.group("[AI Agent List] 데이터 로드 시작");
        isAiAgentLoading.value = true;
        const configStore = useConfigStore();
        const realAgents = configStore.aiAgentCards || [];
        console.log("fallbakcMode:총 에이전트 수:", realAgents.length);
        console.log("fallbakcMode:에이전트 목록:", realAgents);
        aiAgentInfoList.value = realAgents;
        console.log("AI Agent 로드 완료");
        console.groupEnd();
      } catch (error) {
        console.error("✗ AI Agent 로드 오류:", error.message);
        aiAgentLoadError.value = error.message;
        console.groupEnd();
      } finally {
        isAiAgentLoading.value = false;
      }
    };

    // ================================
    // ACTIONS: Agent 태그 관리
    // ================================

    /**
     * Agent 태그 추가
     * - 새로운 대화 시작 시 호출
     * - 선택된 Agent 정보 저장
     */
    const addAgentTag = (agentName, agentData) => {
      console.group("[addAgentTag] Agent 태그 추가");
      console.log("Agent 이름:", agentName);
      console.log("Agent ID:", agentData?.agentId);

      selectedAiAgent.value = agentName;
      selectedAiAgentData.value = agentData;

      console.log("Agent 태그 추가 완료");
      console.log("aiAgentTagList:", aiAgentTagList.value);
      console.groupEnd();
    };

    /**
     * Agent 태그 제거
     */
    const deleteAgent = () => {
      console.log("[deleteAgent] Agent 태그 제거");

      selectedAiAgent.value = "";
      selectedAiAgentData.value = null;

      console.log("Agent 태그 제거 완료");
    };

    // ================================
    // ACTIONS: Agent 정보 관리
    // ================================

    /**
     * 현재 에이전트 이름 설정
     */
    const setCurrentAgentName = (agentName) => {
      currentAgentName.value = agentName;
      console.log("현재 에이전트 설정:", agentName);
    };

    /**
     * Agent 에러 메시지 초기화
     */
    const clearAgentError = () => {
      aiAgentLoadError.value = null;
    };

    /**
     * Agent 드롭다운 토글
     */
    const toggleAiAgentDropdown = () => {
      isAiAgentDropdownOpen.value = !isAiAgentDropdownOpen.value;
    };

    const closeAiAgentDropdown = () => {
      isAiAgentDropdownOpen.value = false;
    };

    // ================================
    // EXPORT
    // ================================

    return {
      // State
      aiAgentInfoList,
      selectedAiAgent,
      selectedAiAgentData,
      currentAgentName,
      isAiAgentDropdownOpen,
      isAiAgentLoading,
      aiAgentLoadError,

      // Computed
      aiAgentTagList,
      isAiAgentSelected,

      // Methods
      loadAiAgentList,
      addAgentTag,
      deleteAgent,
      setCurrentAgentName,
      clearAgentError,
      toggleAiAgentDropdown,
      closeAiAgentDropdown,
    };
  },
  {
    /**
     * Pinia Persistence 설정
     */
    persist: {
      storage: sessionStorage,
      paths: ["selectedAiAgent", "selectedAiAgentData", "aiAgentInfoList"],
      key: STORAGE_KEYS.SESSION_STORAGE_DATA.AGENT_KEY,
    },
  },
);
