<!-- src/components/main/sections/ChatInputSection.vue -->
<template>
  <section class="chat-input-section">
    <div class="chat-input-field">
      <!-- ==================== 입력 영역 ==================== -->
      <div class="chat-inner-area">
        <MessageTextArea
          v-model="inputMessage"
          @send-message="handleSendMessage"
        />
        <ActionIconsArea @send-message="handleSendMessage" />
      </div>

      <!-- ==================== 하단 섹션 (AI Agent + 모델 선택) ==================== -->
      <div class="input-bottom-section no-drag">
        <!-- 좌측: AI Agent 버튼 -->
        <Button
          class="ai-agent-button"
          type="submit"
          :loading="agentStore.isAiAgentLoading || modelStore.isModelLoading"
          @click="toggleAiAgentDropdown"
        >
          <div class="ai-agent-button__text">
            <CommonIcon
              class="white-bright-icon"
              :src="aiAgentBrightIcon"
              :size="16"
              alt="AI agent 불빛 아이콘"
            />
            AI Agent
          </div>

          <!-- ✅ AI Agent 드롭다운 -->
          <div
            v-if="agentStore.isAiAgentDropdownOpen"
            class="ai-agent-dropdown"
            @click.stop
          >
            <!-- ✅ 정상 데이터 표시 -->
            <div>
              <div
                v-for="aiAgent in agentStore.aiAgentInfoList.slice(0, 2)"
                :key="aiAgent.agentId"
                class="dropdown-option"
                :class="{
                  selected: agentStore.selectedAiAgent === aiAgent.name,
                }"
                @click="selectAiAgent(aiAgent.name, aiAgent)"
              >
                <div class="option-text">
                  <p class="option-text__title">{{ aiAgent.name }}</p>
                  <p class="option-text__explain">
                    {{ aiAgent.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Button>

        <!-- 우측: 모델 선택 드롭다운 -->
        <div class="ai-model-info">
          <!-- 현재 사용현황 (모델이 선택된 경우에만 표시) -->
          <template v-if="modelStore.selectedModel !== '모델선택'">
            <span class="ai-model-info__usage">
              <span class="current">{{
                modelStore.chatUsageCount.realUsageCount
              }}</span>
              <span class="separator">/</span>
              <span class="total">{{
                modelStore.chatUsageCount.wholeUsageCount
              }}</span>
            </span>
          </template>

          <div class="ai-model-info__label">
            <!-- Model 드롭다운 배지 -->
            <div
              class="model-badge"
              :class="{
                'model-badge__disabled': isAiModelDropdownDisabled,
              }"
              @click="toggleModelDropdown"
            >
              <!-- 모델 아이콘 표시 -->
              <AIModelLabel
                class="model-badge__image"
                :modelName="modelStore.selectedModel"
                :size="18"
              />

              <!-- 모델명 텍스트 표시 -->
              <span class="model-badge__text">
                {{ modelStore.selectedModel }}
              </span>

              <!-- 드롭다운 화살표 (회전 애니메이션) -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                :class="{ 'rotate-180': modelStore.isModelDropdownOpen }"
                class="dropdown-arrow"
              >
                <path
                  d="M4 6L7 9L10 6"
                  stroke="#000000"
                  stroke-width="1.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <!-- 모델 드롭다운 메뉴 (조건부 렌더링) -->
            <Transition name="dropdown-fade">
              <div
                v-if="modelStore.isModelDropdownOpen"
                class="ai-model-dropdown"
                @click.stop
              >
                <!-- ⚠️ 에러 상태 -->
                <div v-if="modelStore.modelLoadError" class="dropdown-error">
                  <div class="error-content">
                    <span>⚠️ {{ modelStore.modelLoadError }}</span>
                    <button class="retry-btn" @click="handleRetry">
                      다시 시도
                    </button>
                  </div>
                </div>

                <!-- ✅ 정상 모델 목록 렌더링 -->
                <div v-else class="dropdown-options-container">
                  <div
                    v-for="model in modelStore.modelInfoList"
                    :key="model.value"
                    class="dropdown-option"
                    :class="{
                      selected: modelStore.selectedModel === model.label,
                    }"
                    @click="selectModel(model)"
                  >
                    <!-- 모델 정보 섹션 -->
                    <div class="option-text">
                      <!-- 모델 선택 옵션이 아닐 때 렌더링 -->
                      <template v-if="model.label !== '모델선택'">
                        <!-- 모델명 -->
                        <span class="option-text__title">
                          <AIModelLabel
                            class="option-text__icon"
                            :modelName="model.label"
                            :size="14"
                          />
                          {{ model.label }}</span
                        >

                        <!-- 사용량 표시 (현재/최대) -->
                        <span class="usage-info">
                          <span class="current">{{
                            model.currentUsage || 0
                          }}</span>
                          <span class="separator">/</span>
                          <span class="total">{{ model.maxCalls || 0 }}</span>
                        </span>

                        <!-- 모델 설명 (한 줄 아래) -->
                        <div class="option-text__desc">{{ model.desc }}</div>
                      </template>

                      <!-- 모델 선택 옵션 (첫 번째 항목) -->
                      <template v-else>
                        <span class="option-text__title">{{
                          model.label
                        }}</span>
                      </template>
                    </div>

                    <!-- 선택 표시 (체크 아이콘) -->
                    <svg
                      v-if="modelStore.selectedModel === model.label"
                      class="check-icon"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M13.5 4.5L6 12L2.5 8.5"
                        :stroke="configStore.mainColorHexCode"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- ==================== 에러 배너 ==================== -->
      <ErrorBanner :errorMessage="modelStore.errorMessage" />
    </div>

    <!-- ==================== 하단 안내 문구 ==================== -->
    <p class="chat-announce no-drag">
      ®AI의 답변에 잘못된 정보가 있을 수 있습니다.
      <span class="mobile-break"></span>
      중요한 정보는 확인해 주세요.
    </p>
  </section>
</template>

<script setup>
/**
 * ChatInputSection.vue - 채팅 입력 섹션 (통합 버전)
 */

import { watch, onMounted, computed, ref } from "vue";
import {
  CHAT_ROOM_TYPES,
  CHAT_ROLE_TYPES,
  INPUT_TAG_TYPES,
} from "@/utils/constants";
import { useModelStore } from "@/stores/model/module/useModelStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { useAgentStore } from "@/stores/model/module/useAgentStore";
import { useFileStore } from "@/stores/model/module/useFileStore";
import { useChatMessageStore } from "@/stores/model/module/useChatMessageStore";
import { useRoomStore } from "@/stores/model/module/useRoomStore";
import { chatApi } from "@/api/modules/chatApi";
import { getChatRoomList } from "@/api/modules/chatRoomApi";

// ==================== 컴포넌트 임포트 ====================
import MessageTextArea from "@/components/chat/inner/MessageTextArea.vue";
import ActionIconsArea from "@/components/chat/inner/ActionIconsArea.vue";
import ErrorBanner from "@/components/chat/inner/banner/ErrorBanner.vue";
import CommonIcon from "@/components/icon/CommonIcon.vue";
import AIModelLabel from "@/components/common/AIModelLabel.vue";
import Button from "@/components/common/Button.vue";

// ==================== 아이콘 임포트 ====================
import aiAgentBrightIcon from "@/assets/images/icon/ai_agent_bright.png";

// ==================== Props & Emits ====================
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "before-send-message"]);

// ==================== Stores ====================
/**
 * 상태 관리 저장소 초기화
 * - modelStore: UI 상태 (드롭다운, 모델 선택 등)
 * - modelStore: 데이터 (메시지, AI Agent, 모델 목록)
 * - configStore: 설정 (메인 색상 등)
 */
const modelStore = useModelStore();
const configStore = useConfigStore();
const agentStore = useAgentStore();
const chatMessageStore = useChatMessageStore();
const fileStore = useFileStore();
const roomStore = useRoomStore();

// ==================== State ====================

const chatRooms = roomStore.chatRooms;

/**
 * 로컬 상태
 * - inputMessage: 사용자 입력 메시지
 *
 * 동기화:
 * - MainPage에서 chatMessage 변경 → modelValue props 변경
 * - watch가 감지 → inputMessage 동기화
 * - 사용자가 입력 → inputMessage 변경 → emit 발생
 */
const inputMessage = ref(props.modelValue || "");

// ==================== Computed Properties ====================
/**
 * - currentRoomType === "chat" → disabled (일반 대화방에서는 Agent 변경 불가)
 * - 그 외 → enabled
 */
const isAiAgentButtonDisabled = computed(() => {
  return roomStore.currentRoomType === CHAT_ROOM_TYPES.CHAT;
});

/**
 * 로직:
 * - currentRoomType === "agent" → disabled (Agent 대화방에서는 모델 변경 불가)
 * - 그 외 → enabled
 */
const isAiModelDropdownDisabled = computed(() => {
  return roomStore.currentRoomType === CHAT_ROOM_TYPES.AGENT;
});

// ==================== Methods ====================
const callAiAgentsAndModelStatus = async () => {
  console.group("ChatInputSection 초기화");

  try {
    console.log("AI Agent 목록 로드 시작");
    await agentStore.loadAiAgentList();
    console.log("✅ AI Agent 목록 로드 완료");

    console.log("모델 데이터 로드 시작");
    await modelStore.loadModelUsageData();
    console.log("✅ 모델 데이터 초기 로드 완료");

    console.log("✅ ChatInputSection 초기화 완료");
  } catch (error) {
    console.error("❌ 초기화 중 오류 발생:", error.message);
  } finally {
    console.groupEnd();
  }
};

/**
 * toggleAiAgentDropdown - AI Agent 드롭다운 토글
 *
 * 역할:
 * 1. disabled 상태 확인
 * 2. 드롭다운 열기/닫기 전환
 *
 * 호출 시점:
 * - AI Agent 버튼 클릭 시
 */
/**
 * toggleAiAgentDropdown - AI Agent 드롭다운 토글
 *
 * 개선사항:
 * - 데이터가 이미 로드되어 있으면 API 재호출 안 함
 * - 로딩 상태 충돌 방지
 * - 불필요한 네트워크 요청 제거
 */
const toggleAiAgentDropdown = async () => {
  console.group("[toggleAiAgentDropdown] 시작");

  // ✅ 드롭다운 상태 토글
  agentStore.isAiAgentDropdownOpen = !agentStore.isAiAgentDropdownOpen;
  console.log("드롭다운 상태:", agentStore.isAiAgentDropdownOpen);

  // ✅ 열릴 때만 데이터 확인
  if (agentStore.isAiAgentDropdownOpen) {
    // ⚠️ 데이터가 없을 때만 로드
    if (
      !agentStore.aiAgentInfoList ||
      agentStore.aiAgentInfoList.length === 0
    ) {
      console.log("AI Agent 목록 없음 - 로드 시작");
      try {
        await agentStore.loadAiAgentList();
        console.log("✅ AI Agent 목록 로드 완료");
      } catch (error) {
        console.error("❌ AI Agent 목록 로드 실패:", error.message);
        // 로드 실패 시 드롭다운 다시 닫기
        agentStore.isAiAgentDropdownOpen = false;
      }
    } else {
      console.log("ℹ️ 기존 AI Agent 목록 사용 (API 호출 안 함)");
    }
  }

  console.groupEnd();
};

/**
 * ============================================================
 *  selectAiAgent - AI Agent 선택 + 새 채팅방 생성
 * ============================================================
 */
const selectAiAgent = async (aiAgent, aiAgentData) => {
  console.group("[selectAiAgent] Agent 선택 + 새 채팅방 생성");
  console.log("선택된 에이전트:", aiAgent);

  try {
    // modelStore에 Agent 정보 저장
    agentStore.selectedAiAgent = aiAgent;
    agentStore.selectedAiAgentData = aiAgentData;
    agentStore.aiAgentTagList = [
      {
        index: 0,
        type: INPUT_TAG_TYPES.AGENT,
        value: `@${aiAgent}`,
        agentId: aiAgentData.agentId, // ← 반드시 ID 저장!
      },
    ];
    agentStore.isAiAgentDropdownOpen = false;
    roomStore.setRoomType(CHAT_ROOM_TYPES.AGENT);
  } catch (error) {
    console.error("❌ selectAiAgent 실패:", error.message);
    chatMessageStore.setError(error.message || "Agent 선택에 실패했습니다");
  } finally {
    console.log("❌ 추가: 수동 복원 (watch 대비)");
    agentStore.selectedAiAgent = aiAgent;
    agentStore.selectedAiAgentData = aiAgentData;
    console.log("✅ 수동 복원 완료:", {
      selectedAiAgent: agentStore.selectedAiAgent,
      selectedAiAgentData: agentStore.selectedAiAgentData,
    });
    console.groupEnd();
  }
};

/**
 * toggleModelDropdown - AI Model 드롭다운 토글
 *
 * 역할:
 * 1. disabled 상태 확인
 * 2. 드롭다운 토글
 * 3. 필요시 모델 데이터 로드
 *
 * 호출 시점:
 * - model-badge 클릭 시
 */
const toggleModelDropdown = async () => {
  // if (isAiModelDropdownDisabled.value) {
  //   console.log("⚠️ AI Agent 기반 대화방이므로 모델 변경 불가");
  //   console.groupEnd();
  //   return;
  // }
  console.group("[toggleModelDropdown] 시작");
  modelStore.toggleAiModelDropdown();
  const nowOpen = modelStore.isModelDropdownOpen;
  if (nowOpen) {
    if (modelStore.modelInfoList?.length === 0) {
      try {
        await loadModelData();
      } catch (error) {
        console.error("❌ loadModelData() 실패:", error.message);
      }
    }
  }
  console.groupEnd();
};

/**
 * selectModel - 모델 선택 처리
 * 매개변수:
 * @param {object} model - 선택된 모델 정보
 *
 * 역할:
 * 1. 선택된 모델을 chatUiStore에 저장
 * 2. 사용량 업데이트
 * 3. 드롭다운 닫기
 *
 * 호출 시점:
 * - 드롭다운에서 모델 옵션 클릭 시
 */
const selectModel = async (model) => {
  console.group("모델 선택");
  console.log("선택된 모델:", model.label);
  console.log("✅ 모델 선택 완료");
  try {
    roomStore.setRoomType(CHAT_ROOM_TYPES.CHAT);
    modelStore.selectModel(model.label);
    modelStore.setUsageCount(model.currentUsage || 0, model.maxCalls || 0);
    setTimeout(() => {
      modelStore.closeModelDropdown();
    }, 200);
  } catch (error) {
    console.error("❌ 모델 선택 실패:", error.message);
  } finally {
    console.groupEnd();
  }
};

/**
 * loadModelData - 모델 데이터 로드
 * 역할:
 * - modelStore에서 모델 사용량 데이터 로드
 * 호출 시점:
 * - 모델 드롭다운 열 때
 * - 초기 마운트 시
 */
const loadModelData = async () => {
  console.group("[loadModelData] 모델 데이터 로드");
  try {
    await modelStore.loadModelUsageData();
    console.log("✅ 로드 성공");
  } catch (error) {
    console.error("❌ 로드 실패:", error.message);
    throw error;
  } finally {
    console.groupEnd();
  }
};

/**
 * handleRetry - 모델 데이터 로드 재시도
 *
 * 역할:
 * 1. 에러 상태 초기화
 * 2. 모델 데이터 다시 로드
 *
 * 호출 시점:
 * - 드롭다운 에러 배너의 "다시 시도" 버튼 클릭 시
 */
const handleRetry = async () => {
  console.group("데이터 로드 재시도");
  try {
    modelStore.clearModelError();
    await modelStore.loadModelUsageData();
    console.log("✅ 재시도 성공");
  } catch (error) {
    console.error("❌ 재시도 실패:", error.message);
  } finally {
    console.groupEnd();
  }
};

/**
 * calculateTypingDuration - 타이핑 애니메이션 시간 계산
 *
 * 매개변수:
 * @param {number} messageLength - 메시지 길이
 *
 * 역할:
 * - 메시지 길이에 따라 타이핑 애니메이션 시간을 계산
 * - 긴 메시지는 빠르게, 짧은 메시지는 느리게 애니메이션
 * - 기본 속도: 15ms/글자
 * - 200글자 이상: 30% 속도 증가 (더 빨라짐)
 * - 500글자 이상: 70% 속도 증가
 * - 1000글자 이상: 최대 속도 (5ms/글자)
 *
 * 반환값:
 * - 타이핑 애니메이션 시간 (밀리초)
 */
const calculateTypingDuration = (messageLength) => {
  const baseSpeed = 15;
  let typingSpeed = baseSpeed;

  if (messageLength > 1000) {
    typingSpeed = 5;
  } else if (messageLength > 500) {
    typingSpeed = Math.max(baseSpeed * 0.3, 5);
  } else if (messageLength > 200) {
    typingSpeed = baseSpeed * 0.6;
  }

  return messageLength * typingSpeed + 200;
};

const handleSendMessage = async () => {
  // emit("before-send-message");
  modelStore.displayedMessage = "";
  // ============================================================
  // 1.입력값 검증
  // ============================================================
  const attachedFiles = fileStore.attachedFiles || [];
  const message = inputMessage.value.trim();
  // inputMessage.value = ""; // 변수 할당 직후 초기화

  if (!message && attachedFiles.length === 0) {
    console.warn("⚠️ 빈 메시지는 전송할 수 없습니다.");
    return;
  }

  // ============================================================
  // 2.중복 전송 방지
  // ============================================================
  if (chatMessageStore.isStreaming) {
    console.warn("⚠️ 이미 메시지가 전송 중입니다.");
    return;
  }

  console.group("[handleSendMessage] 메시지 전송 시작");

  try {
    // ============================================================
    // 3.스트리밍 시작
    // ============================================================
    chatMessageStore.startStreaming();

    // ============================================================
    // 4.사용자 메시지 저장 (UI에 표시)
    // ============================================================
    const agentName = agentStore.isAiAgentSelected
      ? agentStore.selectedAiAgent
      : modelStore.selectedModel;

    chatMessageStore.addMessage({
      role: "user",
      content: message,
      agent: agentName,
    });

    let apiResult;

    if (
      !agentStore.isAiAgentSelected &&
      modelStore.selectedModel === "모델선택"
    ) {
      throw new Error("에이전트 혹은 모델을 선택해주세요");
    }

    if (agentStore.isAiAgentSelected) {
      console.log("에이전트 호출 시작");

      if (!agentStore.selectedAiAgentData?.agentId) {
        throw new Error("에이전트 ID가 없습니다. 다시 선택해주세요.");
      }

      const agentData = {
        agentId: agentStore.selectedAiAgentData.agentId,
        query: message,
        executionMode: CHAT_ROOM_TYPES.AGENT,
        currentModel: modelStore.selectedModel,
        currentProvider: "azure_openai",
        roomId: "", // 처음에는 빈 값으로 보냄
        files: attachedFiles,
      };

      console.log(
        "✅ 에이전트 roomStore.currentRoomId:",
        roomStore.currentRoomId,
      );

      if (roomStore.currentRoomId) {
        agentData.roomId = roomStore.currentRoomId;
        roomStore.setCreatingNewRoom(false); // ← 여기서 플래그 ON
      } else {
        agentData.roomId = "";
        console.log(" 새 채팅 생성됨 - 플래그 ON");
        roomStore.setCreatingNewRoom(true); // ← 여기서 플래그 ON
      }

      console.log("✅ 에이전트 데이터 준비 완료:", { agentData });
      apiResult = await chatApi.invokeAgent(agentData, handleStreamingEvent);

      // Agent 호출 후 roomId 저장!
      if (apiResult?.roomId) {
        console.log("Agent 응답에서 roomId 저장:", apiResult.roomId);
        roomStore.setRoomId(apiResult.roomId);
      }
    } else {
      console.log("💬 일반 채팅 시작");
      if (modelStore.selectedModel === "모델선택") {
        throw new Error("모델을 선택해주세요.");
      }

      const modelData = modelStore.selectedModelData;
      console.log("✅ 일반 데이터 준비 완료:", { modelData });

      if (!modelData) {
        throw new Error("모델 정보를 찾을 수 없습니다.");
      }

      let messageData = {};

      // ============================================================
      // [수정 사항] 첫 메시지 시 roomId 없이 전송
      // ============================================================
      // 기존 로직:
      //   1. createChatRoom()으로 roomId 미리 생성
      //   2. 생성된 roomId를 API에 전송
      //   3. API 응답 저장
      //
      // 수정 로직 (현재):
      //   1. roomId 미리 생성 안 함 (undefined로 보냄)
      //   2. 백엔드에서 새 roomId 생성 & 응답에 포함
      //   3. API 응답에서 받은 roomId만 저장 ✅
      // ============================================================

      if (!roomStore.currentRoomId) {
        console.log("새 채팅 시작 (roomId 없이 전송)");

        messageData = {
          query: message,
          currentModel: modelData.label,
          currentProvider: modelData.provider,
          executionMode: CHAT_ROOM_TYPES.CHAT,
          files: fileStore.attachedFiles,
        };

        console.log("✅ 첫 메시지 데이터 준비 완료 (roomId 없음):", {
          messageData,
        });

        apiResult = await chatApi.sendChatMessage(
          messageData,
          handleStreamingEvent,
        );

        // 백엔드 응답에서 받은 roomId만 저장!
        // ✅ 이제는 API 응답에 포함된 roomId를 신뢰함
        if (apiResult?.roomId) {
          console.log(
            "첫 메시지 완료 - API 응답에서 받은 roomId 저장:",
            apiResult.roomId,
          );
          // ✅ 새 채팅 생성 플래그 ON (중복 로드 방지!)
          roomStore.setCreatingNewRoom(true);
          roomStore.setRoomId(apiResult.roomId);
        } else {
          console.warn(
            "⚠️ API 응답에 roomId가 없습니다. 백엔드 응답 형식 확인 필요",
          );
        }
      } else {
        // ============================================================
        // 두 번째 이상 메시지: 기존 roomId 사용
        // ============================================================
        console.log("기존 채팅방 유지:", roomStore.currentRoomId);

        messageData = {
          query: message,
          currentModel: modelData.label,
          currentProvider: modelData.provider,
          executionMode: CHAT_ROOM_TYPES.CHAT,
          roomId: roomStore.currentRoomId, // ✅ 저장된 roomId 사용
          files: fileStore.attachedFiles,
        };

        console.log("✅ 추가 메시지 데이터 준비 완료:", { messageData });

        apiResult = await chatApi.sendChatMessage(
          messageData,
          handleStreamingEvent,
        );

        // 기존 채팅방 roomId도 업데이트 (혹시 모를 경우 대비)
        if (apiResult?.roomId) {
          console.log(
            "기존 채팅방 roomId 업데이트 (안정성):",
            apiResult.roomId,
          );
          roomStore.setRoomId(apiResult.roomId);
        }
      }

      // 공통: 응답 데이터 저장
      if (apiResult) {
        if (apiResult.conversationId) {
          roomStore.setConversationId(apiResult.conversationId);
        }
        if (apiResult.messageId) {
          roomStore.setMessageId(apiResult.messageId);
        }
      }
    }

    // ============================================================
    // 7.메세지 응답받고 마지막에 메세지 초기화 및 파일첨부 초기화
    // ============================================================
    inputMessage.value = "";
    fileStore.attachedFiles = [];

    console.log("✅ 메시지 전송 및 처리 완료");
    console.groupEnd();
  } catch (error) {
    console.error("❌ handleSendMessage 실패:", error.message);
    console.groupEnd();

    chatMessageStore.setError(error.message || "메시지 전송에 실패했습니다.");

    if (chatMessageStore.isStreaming) {
      chatMessageStore.completeStreaming();
    }
  }
};

const loadChatRooms = async () => {
  console.log("채팅 목록 로드 (API)");

  isLoadingChatRooms.value = true;

  try {
    const response = await getChatRoomList({
      page: 0,
      size: 1000,
      status: "active",
    });

    console.log("✅ 채팅 목록 로드 성공:", response);

    chatRooms.value = response.content || [];

    console.log(`로드된 채팅: ${chatRooms.value.length}개`);
  } catch (error) {
    console.error("❌ 채팅 목록 로드 실패:", error);
    chatRooms.value = [];
  } finally {
    isLoadingChatRooms.value = false;
  }
};

const handleStreamingEvent = (eventType, eventData) => {
  switch (eventType) {
    case "message":
    case "agent_message":
      // ✅ 받은 텍스트를 스트리밍 메시지에 추가
      if (eventData.answer) {
        chatMessageStore.updateStreamingMessage(eventData.answer);
      }
      break;

    case "message_end":
      // ✅ 최종 메시지 가져오기
      const finalMessage = chatMessageStore.currentStreamingMessage;
      const agentName = modelStore.isAiAgentSelected
        ? agentStore.selectedAiAgent
        : modelStore.selectedModel;

      // ✅ 타이핑 애니메이션 시작
      chatMessageStore.setTypingAnimation(finalMessage);

      // ✅ 메시지 길이에 따라 애니메이션 시간 계산
      const typingDuration = calculateTypingDuration(finalMessage.length);
      setTimeout(() => {
        // ✅ 애니메이션 완료 후 최종 메시지 저장
        chatMessageStore.addMessage({
          role: CHAT_ROLE_TYPES.ASSISTANT,
          content: finalMessage,
          agent: agentName,
          metadata: eventData.metadata || {},
        });

        // ✅ 스트리밍 완료
        chatMessageStore.completeStreaming(eventData.metadata);
      }, typingDuration);
      break;

    case "error":
      // ✅ 에러 처리
      console.error("❌ 스트리밍 에러:", eventData.message);
      chatMessageStore.setError(eventData.message || "오류가 발생했습니다.");
      break;
  }
};

// ==================== Watchers ====================
/**
 * ============================================================
 * watch: aiAgentTagList 변경 감지 → Agent 자동 복원
 * ============================================================
 *
 * 언제 호출되나?
 * 1.selectAiAgent()에서 aiAgentTagList 저장할 때
 * 2.채팅방 전환 시 aiAgentTagList 변경될 때
 * 3.MainPage.vue에서 Agent 태그 갱신할 때
 *
 * 역할:
 * - aiAgentTagList[0].agentId 감지
 * - aiAgentInfoList에서 해당 Agent 찾기
 * - selectedAiAgent & selectedAiAgentData 자동 복원
 *
 * 옵션:
 * - { deep: true }: 배열 내부 변경도 감지 (필수!)
 */
watch(
  () => agentStore.aiAgentTagList,
  (newTagList) => {
    console.group("[watch] aiAgentTagList 변경 감지");
    console.log("새로운 tagList:", newTagList);

    // ✅ 조건 체크
    if (
      newTagList &&
      newTagList.length > 0 &&
      agentStore.aiAgentInfoList &&
      agentStore.aiAgentInfoList.length > 0
    ) {
      const tagId = newTagList[0].agentId;
      console.log("태그 ID 발견:", tagId);

      // ✅ ID로 Agent 찾기
      const foundAgent = agentStore.aiAgentInfoList.find(
        (agent) => agent.agentId === tagId,
      );

      if (foundAgent) {
        console.log("✅ Agent 자동 복원:", foundAgent.name);

        // ✅ 상태 복원
        agentStore.selectedAiAgent = foundAgent.name;
        agentStore.selectedAiAgentData = foundAgent;

        console.log("✅ selectedAiAgent, selectedAiAgentData 복원 완료");
      } else {
        console.log("⚠️ 해당 ID의 Agent를 찾을 수 없음");
      }
    } else {
      console.log("ℹ️ Agent 복원 조건 미충족");
    }

    console.groupEnd();
  },
  { deep: true },
);

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== inputMessage.value) {
      console.log("[watch] props.modelValue 변경 감지:", {
        oldValue: inputMessage.value.substring(0, 30),
        newValue: newVal.substring(0, 30),
      });
      inputMessage.value = newVal;
      console.log("✅ inputMessage 동기화 완료:", newVal.substring(0, 30));
    }
  },
);

/**
 * ============================================================
 * watch: inputMessage 변경 감지 → 부모에 emit
 * ============================================================
 *
 * 역할:
 * - 사용자가 입력하거나 inputMessage가 변경될 때
 * - 부모 컴포넌트(MainPage)의 chatMessage도 동기화
 * - v-model의 양방향 바인딩 완성!
 *
 * 흐름:
 * 1.사용자 입력 또는 inputMessage 변경
 * 2.watch 감지
 * 3.emit('update:modelValue', newVal) 발생
 * 4.MainPage: chatMessage.value 업데이트
 *
 * ⚠️ 주의:
 * - debounce를 사용하지 않으면 매번 emit 발생 (성능 저하 가능)
 * - 하지만 v-model 양방향 바인딩을 위해서는 필요함
 */
watch(
  () => inputMessage.value,
  (newVal) => {
    if (newVal !== props.modelValue) {
      emit("update:modelValue", newVal);
    }
  },
);

/**
 * ============================================================
 *  watch: 스트리밍 완료 후 사용량 갱신
 * ============================================================
 *
 * Vue 2 vs Vue 3:
 * - Vue 2: watch: { isStreaming(newVal, oldVal) { ... } }
 * - Vue 3: watch(() => isStreaming, (newVal, oldVal) => { ... }) ← 더 명확함
 *
 * 언제 호출되나?
 * - isStreaming이 true → false로 변할 때 (스트리밍 완료)
 *
 * 역할:
 * - 메시지 전송 완료 후 API 호출량 갱신
 * - 드롭다운에 최신 사용량 표시
 *
 * 흐름:
 * 1.스트리밍 완료 감지 (true → false)
 * 2.모델 사용량 데이터 로드
 * 3.현재 선택된 모델 찾기
 * 4.UI에 사용량 반영
 */
watch(
  () => chatMessageStore.isStreaming,
  async (newIsStreaming, oldIsStreaming) => {
    if (oldIsStreaming === true && newIsStreaming === false) {
      console.group(" [스트리밍 완료 후] 사용량 갱신");

      try {
        // ✅ 최신 사용량 데이터 로드
        await modelStore.loadModelUsageData();

        // ✅ 현재 선택된 모델 찾기
        const updatedModel = modelStore.modelInfoList?.find(
          (model) => model.label === modelStore.selectedModel,
        );

        // ✅ UI 업데이트
        if (updatedModel) {
          modelStore.setUsageCount(
            updatedModel.currentUsage || 0,
            updatedModel.maxCalls || 0,
          );

          console.log("✅ UI에 사용량 반영됨");
        }
      } catch (error) {
        console.error("❌ 사용량 갱신 실패:", error.message);
      } finally {
        console.groupEnd();
      }
    }
  },
);

// ==================== Lifecycle ====================

/**
 * ============================================================
 * ✅ onMounted - ChatInputSection 초기 데이터 로드
 * ============================================================
 *
 * Vue 2 vs Vue 3:
 * - Vue 2: mounted() { ... }
 * - Vue 3: onMounted(() => { ... }) ← 더 명확하고 composable 친화적
 *
 * 역할:
 * 1.드롭다운 닫기 이벤트 리스너 등록
 * 2.AI Agent 목록 로드
 * 3.모델 데이터 로드
 *
 * Note: 채팅방 전환 시에는 onMounted가 호출되지 않음
 *    → watch로 aiAgentTagList 변경을 감지해서 복원함
 *
 * Cleanup: 컴포넌트 언마운트 시 이벤트 리스너 제거
 */
onMounted(async () => {
  console.group("[ChatInputSection] onMounted 시작");

  try {
    // ============================================================
    // 1.드롭다운 닫기 이벤트 리스너 등록
    // ============================================================
    console.log("1.드롭다운 이벤트 리스너 등록");

    const handleDocumentClick = (event) => {
      const clickedElement = event.target;
      const isInsideAiAgentButton = clickedElement.closest(".ai-agent-button");
      const isInsideAiAgentDropdown =
        clickedElement.closest(".ai-agent-dropdown");
      const isInsideModelBadge = clickedElement.closest(".model-badge");
      const isInsideCustomDropdown =
        clickedElement.closest(".ai-model-dropdown");

      // ✅ 모델 드롭다운 바깥 클릭 → 닫기
      if (!isInsideModelBadge && !isInsideCustomDropdown) {
        modelStore.isModelDropdownOpen = false;
      }

      // ✅ Agent 드롭다운 바깥 클릭 → 닫기
      if (!isInsideAiAgentButton && !isInsideAiAgentDropdown) {
        agentStore.isAiAgentDropdownOpen = false;
      }
    };

    document.addEventListener("click", handleDocumentClick);
    console.log("✅ 드롭다운 이벤트 리스너 등록 완료");

    callAiAgentsAndModelStatus();
    // ============================================================
    // Cleanup: 언마운트 시 이벤트 리스너 제거
    // ============================================================
    return () => {
      console.log("ChatInputSection 언마운트 - 이벤트 리스너 제거");
      document.removeEventListener("click", handleDocumentClick);
    };
  } catch (error) {
    console.error("❌ ChatInputSection onMounted 중 에러:", error);
    console.groupEnd();
  }
});

defineExpose({
  handleSendMessage,
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;
@use "@/assets/styles/whole_animations.scss" as *;

/* ==================== 섹션 컨테이너 ==================== */
.chat-input-section {
  min-width: 1064px;
  max-width: 1264px;
  width: 100%;
  margin: 3rem auto 0;

  @media (max-width: 768px) {
    margin: 0;
    margin-top: -20px;
  }
}

/* ==================== 메인 입력 필드 컨테이너 ==================== */
.chat-input-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  padding: $spacing-4;
  border-radius: $border-radius-custom;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.08);

  /* ==================== 입력 영역 ==================== */
  .chat-inner-area {
    width: 100%;
    min-height: 175px;
    display: flex;
    flex-direction: column;
    padding: $spacing-4 $spacing-5;
    background-color: $white;
    border-radius: $border-radius-lg;
    animation: fadeIn 0.3s ease-out;
    border: 1px solid var(--main-color);
  }
}

/* ==================== 하단 섹션 (AI Agent + 모델 선택) ==================== */
.input-bottom-section {
  display: flex;
  gap: $spacing-1;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    gap: 8px;
  }
}

/* ==================== AI Agent 버튼 ==================== */
.ai-agent-button {
  position: relative;
  display: flex;
  width: 127px;
  height: 32px;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  border: 1px solid var(--primary-color);
  border-radius: $border-radius-full;
  cursor: pointer;
  font-size: $font-size-sm;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
  background: var(--primary-color);
  color: $white;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.08);

  &__disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  &__disabled-overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: $border-radius-full;
    z-index: 10;
    pointer-events: none;
  }

  &__text {
    font-size: 15px;
    color: $white;
    display: flex;
    align-items: center;
    gap: $spacing-2;

    @media (max-width: 768px) {
      font-size: $font-size-base;
    }
  }
}

/* ==================== AI Agent 드롭다운 ==================== */
.ai-agent-dropdown {
  min-width: 273px;
  min-height: 128px;
  position: absolute;
  bottom: 100%;
  left: -8px;
  right: -8px;
  margin-bottom: 8px;
  background: $white;
  border: 1px solid $gray-200;
  border-radius: 12px;
  z-index: 1000;
  overflow: hidden;
  animation: dropdownSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);

  @media (max-width: 768px) {
    min-width: 146px;
    min-height: 125px;
  }

  .dropdown-error {
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 128px;

    p {
      text-align: center;
      font-size: 14px;
      color: $gray-600;
      margin: 0;
    }
  }

  .dropdown-error p {
    color: #d32f2f;
    font-weight: 600;
  }

  .dropdown-option {
    padding: 8px 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid $gray-100;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:last-child {
      border-bottom: none;
    }

    @media (max-width: 768px) {
      padding: 5px 12px;
    }

    &:hover {
      background-color: var(--primary-hover-color);
      border-radius: 10px;
    }

    &.selected {
      background-color: var(--primary-hover-color);

      .option-text__title {
        color: var(--primary-color);
        font-weight: 600;
      }
    }

    .option-text {
      padding: 5px 0;
      color: $black;
      transition: all 0.2s ease;

      &__title {
        text-align: left;
        font-weight: 600;
        font-size: 18px;
        line-height: 1;
        margin: 0;
        margin-bottom: 10px;

        @media (max-width: 768px) {
          font-size: 14px;
          margin: 7px 0;
        }
      }

      &__explain {
        font-weight: 400;
        text-align: left;
        font-size: 12px;
        line-height: 1;
        margin: 0;
        color: $gray-400;

        @media (max-width: 768px) {
          font-size: 10px;
          margin: 5px 0;
        }
      }
    }
  }
}

/* ==================== 모델 선택 드롭다운 ==================== */
.ai-model-info {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: 0 $spacing-3;
  flex-shrink: 0;

  &__usage {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: $font-size-sm;
    color: $secondary-text;

    .current {
      font-weight: 600;
      color: var(--sub-color);
    }

    .separator {
      color: $gray-400;
      margin: 0 2px;
    }

    .total {
      font-weight: 600;
      color: $secondary-text;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    font-size: $font-size-sm;
    font-weight: 500;
    position: relative;
  }
}

.model-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  padding: 6px 10px;
  height: 32px;
  cursor: pointer;
  position: relative;
  background: $white;
  border: 1px solid $gray-200;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (max-width: 768px) {
    padding: 4px 8px;
    gap: 4px;
  }

  &__disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  &__disabled-overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: $border-radius-full;
    z-index: 10;
    pointer-events: none;
  }

  &__image {
    flex-shrink: 0;
  }

  &__text {
    color: $black;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;

    @media (max-width: 768px) {
      font-size: 11px;
    }
  }
}

.dropdown-arrow {
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: $secondary-text;

  &.rotate-180 {
    transform: rotate(180deg);
  }
}

.ai-model-dropdown {
  position: absolute;
  bottom: calc(100% + 8px);
  left: -8px;
  right: -8px;
  min-width: 300px;
  background: $white;
  border: 1px solid $gray-200;
  border-radius: 12px;
  z-index: 1000;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    min-width: 200px;
    left: auto;
    right: auto;
    bottom: auto;
    top: calc(100% + 8px);
  }

  .dropdown-options-container {
    max-height: 400px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: $white;
    }

    &::-webkit-scrollbar-thumb {
      background: $gray-300;
      border-radius: 3px;

      &:hover {
        background: $gray-400;
      }
    }
  }
}

.dropdown-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid $gray-100;
  position: relative;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
  }

  &:hover {
    background: linear-gradient(
      135deg,
      var(--primary-hover-color) 0%,
      $white 100%
    );
  }

  &.selected {
    background: var(--primary-hover-color);

    .option-text__title {
      color: var(--primary-color);
      font-weight: 600;
    }
  }

  .option-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;

    &__title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 500;
      color: $black;
    }

    &__icon {
      flex-shrink: 0;
      margin-right: -2px;
    }

    &__desc {
      font-size: 12px;
      color: $secondary-text;
      line-height: 1.4;
      white-space: normal;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;

      @media (max-width: 768px) {
        display: none;
      }
    }
  }

  .usage-info {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
    color: $secondary-text;

    .current {
      font-weight: 600;
      color: var(--primary-color);
    }

    .separator {
      color: $gray-300;
      margin: 0 1px;
    }

    .total {
      font-weight: 600;
    }
  }
}

.dropdown-error {
  padding: 16px;
  text-align: center;
  color: #d32f2f;
  font-size: 13px;
  animation: fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  .error-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;

    .retry-btn {
      padding: 6px 16px;
      background: var(--primary-color);
      color: $white;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--primary-hover-color);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

.check-icon {
  flex-shrink: 0;
  animation: checkmark 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ==================== 하단 안내 문구 ==================== */
.chat-announce {
  color: $gray-400;
  font-size: 1.3rem;
  text-align: center;
  margin-top: $spacing-3;

  @media (min-width: $more-than-breakpoint-phone) and (max-width: $breakpoint-desktop-x-large-screen) {
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }

  .mobile-break {
    @media (max-width: 768px) {
      display: block;
    }
  }
}

/* ==================== Transitions ==================== */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ==================== Animations ==================== */
@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes checkmark {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-45deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

@keyframes dropdownSlideUp {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes tagSlideIn {
  from {
    opacity: 0;
    transform: translateX(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
