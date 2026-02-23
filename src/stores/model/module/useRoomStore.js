/**
 * ============================================================
 * useRoomStore.js
 * ============================================================
 *
 * 역할:
 * - 대화방(Chat Room) 관리
 * - 대화 세션(Conversation) 관리
 * - 대화방 타입 관리 (Agent 기반 vs 모델 기반)
 * - 서비스 에이전트 선택 관리
 *
 * 대화방 타입:
 * - "agent": AI Agent 기반 대화
 * - "chat": 모델 선택 기반 대화
 * - null: 초기 상태
 */

import { defineStore } from "pinia";
import { ref } from "vue";
import { STORAGE_KEYS, CHAT_ROOM_TYPES } from "@/utils/constants";

export const useRoomStore = defineStore(
  "room",
  () => {
    // STATE: 대화방 정보

    /**
     * 현재 대화방 ID (room_id)
     * - 각 채팅 세션의 고유 식별자
     */
    const currentRoomId = ref("");

    /**
     * 현재 대화 ID (conversation_id)
     * - 하나의 대화방 내에서 여러 대화 가능
     */
    const currentConversationId = ref("");

    /**
     * 현재 메시지 ID (message_id)
     * - 각 메시지의 고유 식별자
     */
    const currentMessageId = ref("");

    /**
     * 대화방 타입
     * - "agent": AI Agent 기반
     * - "chat": 모델 선택 기반
     * - null: 초기 상태 (미정)
     */
    const currentRoomType = ref(null);

    // ================================
    // STATE: 대화방 목록
    // ================================

    /**
     * 사용자의 모든 대화방 목록
     */
    const chatRooms = ref([]);

    // ================================
    // STATE: 새 대화방 생성
    // ================================

    /**
     * 새 채팅방 생성 중 플래그
     * - true: 새로운 대화방을 생성 중
     * - false: 기존 대화방을 사용 중
     */
    const isCreatingNewRoom = ref(false);

    // ================================
    // STATE: 서비스 에이전트 선택
    // ================================

    /**
     * ExpandSidebar에서 선택한 서비스 에이전트
     * 예: {
     *   id: "agent-1",
     *   name: "Agent1",
     *   desc: "설명",
     *   timestamp: 123456
     * }
     */
    const selectedServiceAgent = ref(null);

    // ================================
    // ACTIONS: 대화방 ID 관리
    // ================================

    /**
     * 현재 대화방 ID 설정
     *
     * 매개변수:
     * - roomId: string (설정할 대화방 ID)
     */
    const setRoomId = (roomId) => {
      console.log("[setRoomId] 대화방 ID 설정:", roomId);
      currentRoomId.value = roomId;
    };

    /**
     * 현재 대화 ID 설정
     */
    const setConversationId = (conversationId) => {
      console.log("[setConversationId] 대화 ID 설정:", conversationId);
      currentConversationId.value = conversationId;
    };

    /**
     * 현재 메시지 ID 설정
     */
    const setMessageId = (messageId) => {
      console.log("[setMessageId] 메시지 ID 설정:", messageId);
      currentMessageId.value = messageId;
    };

    // ACTIONS: 대화방 타입 관리

    /**
     * 대화방 타입 설정
     * - "agent": AI Agent 기반 (모델 선택 버튼 비활성)
     * - "chat": 모델 기반 (Agent 버튼 비활성)
     * - null: 초기화 (모두 활성)
     */
    const setRoomType = (roomType) => {
      console.group("[setRoomType] 대화방 타입 설정");
      console.log("설정할 타입:", roomType);

      if (roomType === CHAT_ROOM_TYPES.AGENT) {
        console.log("AI Agent 기반 대화방");
        console.log("  → 모델선택: 비활성");
        console.log("  → AI Agent: 활성");
      } else if (roomType === CHAT_ROOM_TYPES.CHAT) {
        console.log("모델 기반 대화방");
        console.log("  → AI Agent: 비활성");
        console.log("  → 모델선택: 활성");
      } else if (roomType === null) {
        console.log("타입 초기화 (모두 활성)");
      } else {
        console.warn("✗ 유효하지 않은 타입:", roomType);
      }

      currentRoomType.value = roomType;

      console.log("최종 타입:", currentRoomType.value);
      console.groupEnd();
    };

    // ================================
    // ACTIONS: 새 대화방 생성
    // ================================

    /**
     * 새 채팅방 생성 플래그 설정
     */
    const setCreatingNewRoom = (value) => {
      console.log(`[setCreatingNewRoom] 새 대화방 생성 플래그: ${value}`);
      isCreatingNewRoom.value = value;
    };

    // ================================
    // ACTIONS: 서비스 에이전트 선택
    // ================================

    /**
     * ExpandSidebar에서 서비스 에이전트 선택
     * - 새 대화방 생성 시 트리거
     *
     * 매개변수:
     * - agentPayload: object (선택된 에이전트 정보)
     */
    const selectServiceAgent = (agentPayload) => {
      console.group("[selectServiceAgent] 서비스 에이전트 선택");
      console.log("선택된 에이전트:", agentPayload);

      selectedServiceAgent.value = {
        ...agentPayload,
        timestamp: Date.now(),
      };

      console.log("서비스 에이전트 저장 완료");
      console.log("MainPage의 watch가 자동 감지할 예정");
      console.groupEnd();
    };

    /**
     * 서비스 에이전트 선택 초기화
     */
    const clearServiceAgentSelection = () => {
      console.log("[clearServiceAgentSelection] 서비스 에이전트 선택 초기화");
      selectedServiceAgent.value = null;
    };

    // ================================
    // ACTIONS: 전체 상태 초기화
    // ================================

    /**
     * 새 대화 시작 시 대화방 상태 초기화
     */
    const deleteAllChatState = () => {
      console.group("[deleteAllChatState] 채팅 상태 초기화");

      isCreatingNewRoom.value = false;
      currentRoomId.value = "";
      currentRoomType.value = null;
      currentConversationId.value = "";
      currentMessageId.value = "";

      console.log("채팅 상태 초기화 완료");
      console.groupEnd();
    };

    /**
     * 세션 종료 시 모든 대화방 정보 초기화
     */
    const clearAllRoomState = () => {
      console.log("[clearAllRoomState] 모든 대화방 상태 초기화");

      deleteAllChatState();
      chatRooms.value = [];
      selectedServiceAgent.value = null;

      console.log("모든 대화방 상태 초기화 완료");
    };

    // ================================
    // EXPORT
    // ================================

    return {
      // State
      currentRoomId,
      currentConversationId,
      currentMessageId,
      currentRoomType,
      chatRooms,
      isCreatingNewRoom,
      selectedServiceAgent,

      // Methods
      setRoomId,
      setConversationId,
      setMessageId,
      setRoomType,
      setCreatingNewRoom,
      selectServiceAgent,
      clearServiceAgentSelection,
      deleteAllChatState,
      clearAllRoomState,
    };
  },
  {
    /**
     * Pinia Persistence 설정
     */
    persist: {
      storage: sessionStorage,
      paths: [
        "currentRoomId",
        "currentConversationId",
        "currentMessageId",
        "currentRoomType",
        "chatRooms",
      ],
      key: STORAGE_KEYS.SESSION_STORAGE_DATA.ROOM_KEY,
    },
  },
);
