/**
 * ============================================================
 * useChatMessageStore.js
 * ============================================================
 *
 * 역할:
 * - 채팅 메시지 목록 관리
 * - 메시지 스트리밍 상태 관리
 * - 타이핑 애니메이션 관리
 * - 에러 상태 관리
 *
 * 스트리밍 플로우:
 * 1. startStreaming() 호출 → isStreaming = true
 * 2. updateStreamingMessage(chunk) 호출 → 메시지 증가
 * 3. completeStreaming() 호출 → isStreaming = false
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { STORAGE_KEYS } from "@/utils/constants";

export const useChatMessageStore = defineStore(
  "chatMessage",
  () => {
    // ================================
    // STATE: 메시지
    // ================================
    const messages = ref([]);

    // ================================
    // STATE: 스트리밍 상태
    // ================================

    /**
     * 메시지 표시 모드
     * - "initial": 초기 상태 (인사말 + 카드 표시)
     * - "streaming": 메시지 스트리밍 중
     * - "complete": 메시지 수신 완료
     */
    const chatDisplayMode = ref("initial");

    /**
     * 메시지 스트리밍 진행 중 여부
     * - true: 서버에서 메시지 수신 중
     * - false: 수신 완료 또는 대기 중
     */
    const isStreaming = ref(false);

    /**
     * 현재 스트리밍 중인 메시지 내용
     * - 서버에서 받은 청크(chunk)들이 누적됨
     * - 스트리밍 완료 후 messages에 추가
     */
    const currentStreamingMessage = ref("");

    /**
     * 타이핑 애니메이션을 시작할 메시지
     * - null: 애니메이션 없음
     * - string: 글자 단위로 표시할 메시지
     */
    const typingMessage = ref(null);

    // ================================
    // STATE: 에러
    // ================================

    /**
     * 현재 에러 메시지
     * - null: 에러 없음
     * - string: 에러 메시지
     */
    const errorMessage = ref(null);

    // ================================
    // COMPUTED
    // ================================

    /**
     * 메시지 입력 가능 여부
     * - 스트리밍 중이면 입력 불가
     */
    const canInputMessage = computed(() => {
      return !isStreaming.value;
    });

    /**
     * 메시지 개수
     */
    const messageCount = computed(() => {
      return messages.value.length;
    });

    // ================================
    // ACTIONS: 메시지 관리
    // ================================
    const addMessage = (message) => {
      console.group("[addMessage] 메시지 추가");

      const newMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: message.role || "user",
        content: message.content || "",
        agent: message.agent || "unknown",
        createdAt: Date.now(),
        metadata: message.metadata || {},
      };

      messages.value.push(newMessage);

      console.log("메시지 추가 완료:", {
        id: newMessage.id,
        role: newMessage.role,
        length: newMessage.content.length,
      });

      console.groupEnd();

      return newMessage.id;
    };

    /**
     * 모든 메시지 조회
     */
    const getMessages = () => {
      console.log(`총 ${messages.value.length}개 메시지 조회`);
      return messages.value;
    };

    /**
     * 모든 메시지 삭제
     */
    const deleteMessages = () => {
      console.log("[deleteMessages] 모든 메시지 삭제");
      messages.value = [];
      console.log("모든 메시지 삭제 완료");
    };

    // ================================
    // ACTIONS: 스트리밍
    // ================================

    /**
     * 스트리밍 시작
     * - isStreaming을 true로 설정
     * - 현재 스트리밍 메시지 초기화
     * - 에러 메시지 초기화
     */
    const startStreaming = () => {
      console.log("[startStreaming] 스트리밍 시작");

      isStreaming.value = true;
      chatDisplayMode.value = "streaming";
      currentStreamingMessage.value = "";
      errorMessage.value = null;

      console.log("스트리밍 상태 업데이트 완료");
    };

    /**
     * 스트리밍 중인 메시지 업데이트
     * - 서버에서 받은 청크를 누적
     *
     * 매개변수:
     * - chunk: string (스트리밍 청크)
     */
    const updateStreamingMessage = (chunk) => {
      if (chunk) {
        currentStreamingMessage.value += chunk;
      }
    };

    /**
     * 스트리밍 완료
     * - isStreaming을 false로 설정
     * - 스트리밍 메시지를 messages에 자동 추가는 안 함 (분리 관심사)
     *
     * 매개변수:
     * - metadata?: object (usage, latency 등)
     */
    const completeStreaming = (metadata = null) => {
      console.log("스트리밍 완료", {
        tokens: metadata?.usage?.total_tokens,
        latency: metadata?.usage?.latency,
      });

      isStreaming.value = false;
      chatDisplayMode.value = "complete";
      currentStreamingMessage.value = "";

      console.log("스트리밍 상태 정리 완료");
    };

    // ================================
    // ACTIONS: 타이핑 애니메이션
    // ================================

    /**
     * 타이핑 애니메이션 시작
     *
     * 매개변수:
     * - message: string (애니메이션할 메시지)
     */
    const setTypingAnimation = (message) => {
      if (!message || typeof message !== "string") {
        console.warn("✗ setTypingAnimation: 유효하지 않은 메시지");
        return;
      }

      console.log(
        `[setTypingAnimation] 타이핑 애니메이션 시작: ${message.length}자`,
      );
      typingMessage.value = message;
    };

    // ================================
    // ACTIONS: 에러 관리
    // ================================
    const setError = (error) => {
      console.error("[setError] 에러 발생:", error);

      errorMessage.value = error;
      isStreaming.value = false;
      chatDisplayMode.value = "complete";
    };

    /**
     * 에러 초기화
     */
    const clearError = () => {
      errorMessage.value = null;
    };

    // ================================
    // EXPORT
    // ================================

    return {
      // State
      messages,
      chatDisplayMode,
      isStreaming,
      currentStreamingMessage,
      typingMessage,
      errorMessage,

      // Computed
      canInputMessage,
      messageCount,

      // Methods
      addMessage,
      getMessages,
      deleteMessages,
      startStreaming,
      updateStreamingMessage,
      completeStreaming,
      setTypingAnimation,
      setError,
      clearError,
    };
  },
  {
    /**
     * Pinia Persistence 설정
     * - 메시지는 대화방별로 관리되므로
     *   현재는 저장하지 않음
     */
    persist: {
      storage: sessionStorage,
      paths: ["messages"],
      key: STORAGE_KEYS.SESSION_STORAGE_DATA.MESSAGE_KEY,
    },
  },
);
