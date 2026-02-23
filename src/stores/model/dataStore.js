/**
 * ============================================================
 * dataStore.js (리팩토링 버전)
 * ============================================================
 *
 * 역할:
 * - 모든 개별 스토어를 통합 조합
 * - 통합 계산 속성 (computed) 제공
 * - 필요시 여러 스토어의 상태를 조합하여 사용
 *
 * 아키텍처:
 * - useModelStore: 모델 선택 및 사용량
 * - useAgentStore: AI Agent 관리
 * - useFileStore: 파일 첨부
 * - useChatMessageStore: 메시지 및 스트리밍
 * - useRoomStore: 대화방 및 세션
 */

import { defineStore } from "pinia";
import { computed } from "vue";
import { useModelStore } from "@/stores/model/module/useModelStore";
import { useAgentStore } from "@/stores/model/module/useAgentStore";
import { useFileStore } from "@/stores/model/module/useFileStore";
import { useChatMessageStore } from "@/stores/model/module/useChatMessageStore";
import { useRoomStore } from "@/stores/model/module/useRoomStore";

export const useDataStore = defineStore("data", () => {
  // ================================
  // 개별 스토어 인스턴스 생성
  // ================================

  const modelStore = useModelStore();
  const agentStore = useAgentStore();
  const fileStore = useFileStore();
  const chatMessageStore = useChatMessageStore();
  const roomStore = useRoomStore();

  // ================================
  // COMPUTED: 통합 계산 속성
  // ================================

  /**
   * 전체 태그 목록 (Agent + File)
   * - 입력창에 표시되는 모든 태그
   */
  const wholeTagInfoList = computed(() => {
    return [...agentStore.aiAgentTagList, ...fileStore.fileTagInfoList];
  });

  /**
   * deleteAllAgentsAndFiles: 태그 삭제 (Agent or File)
   */
  const deleteAllAgentsAndFiles = (index, type) => {
    console.log(
      `🗑️ [dataStore] deleteAllAgentsAndFiles 호출: type=${type}, index=${index}`,
    );
    // 만약, agent 태그라면?
    if (type === "agent") {
      agentStore.aiAgentTagList.value = agentStore.aiAgentTagList.filter(
        (tag) => tag.type !== "agent",
      );
      agentStore.deleteAgent();
      modelStore.deleteModel();
      roomStore.clearAllRoomState();
      console.log("✅ AI Agent 삭제됨, 모델 선택 재활성화");
      // 만약, file 태그라면?
    } else if (type === "file") {
      if (index >= 0 && index < fileStore.attachedFiles.value.length) {
        const deletedFile = fileStore.attachedFiles.value[index];
        fileStore.attachedFiles.value.splice(index, 1);
        console.log(`✅ 파일 삭제됨 (index: ${index})`, {
          fileName: deletedFile.name,
          remainingFiles: fileStore.attachedFiles.value.length,
        });
      } else {
        console.warn(`⚠️ 파일 인덱스 범위 초과: ${index}`);
      }
    }
  };

  // ================================
  // ACTIONS: 통합 작업
  // ================================

  /**
   * 새 대화 시작
   * - Agent 또는 모델 선택 필수
   * - 메시지 초기화
   * - 채팅 상태 초기화
   * - 새 대화방 플래그 설정
   */
  // const startNewChat = (type) => {
  //   console.group("[startNewChat] 새 대화 시작");
  //   console.log("대화 타입:", type);

  //   // 1. 대화방 타입 설정
  //   roomStore.setRoomType(type);

  //   // 2. 채팅 상태 초기화
  //   chatMessageStore.deleteMessages();
  //   chatMessageStore.setChatDisplayMode("initial");

  //   // 3. 새 대화방 플래그 설정
  //   roomStore.setCreatingNewRoom(true);

  //   console.log("새 대화 시작 준비 완료");
  //   console.groupEnd();
  // };

  /**
   * 전체 세션 초기화 (로그아웃 등)
   * - 모든 상태 초기화
   * - 모든 메시지 삭제
   * - 대화방 정보 초기화
   */
  const initializeSessionFields = () => {
    console.group("[initializeSessionFields] 전체 세션 초기화");

    // 1. Agent 초기화
    agentStore.deleteAgent();

    // 2. 모델 초기화
    modelStore.deleteModel();

    // 3. 파일 초기화
    fileStore.deleteAllFiles();

    // 4. 메시지 초기화
    chatMessageStore.deleteMessages();

    // 5. 대화방 초기화
    roomStore.clearAllRoomState();

    console.log("전체 세션 초기화 완료");
    console.groupEnd();
  };

  /**
   * 현재 대화 정보 조회
   * - Room ID, Conversation ID, Message ID
   */
  // const getCurrentChatInfo = () => {
  //   return {
  //     roomId: roomStore.currentRoomId,
  //     conversationId: roomStore.currentConversationId,
  //     messageId: roomStore.currentMessageId,
  //     roomType: roomStore.currentRoomType,
  //   };
  // };

  // ================================
  // EXPORT: 모든 스토어 상태 및 메서드 노출
  // ================================

  return {
    // 개별 스토어들 (직접 접근 가능)
    modelStore,
    agentStore,
    fileStore,
    chatMessageStore,
    roomStore,

    // 통합 계산 속성
    wholeTagInfoList,
    // canInputMessage,
    // isReadyToChat,

    // 통합 액션
    // startNewChat,
    initializeSessionFields,
    // getCurrentChatInfo,

    // 편의 메서드: 자주 사용되는 조합
    // (필요시 추가)
    deleteAllAgentsAndFiles,
  };
});
