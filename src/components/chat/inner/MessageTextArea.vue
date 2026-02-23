<!-- src/components/chat/inner/MessageTextArea.vue -->
<template>
  <div class="message-text-area">
    <ul class="mode-list">
      <li
        v-for="wholeTagInfo in dataStore.wholeTagInfoList"
        :key="`${wholeTagInfo.type}-${wholeTagInfo.index}`"
        class="mode-tag no-drag"
        :class="{
          agent: wholeTagInfo.type === INPUT_TAG_TYPES.AGENT,
          file: wholeTagInfo.type === INPUT_TAG_TYPES.FILE,
        }"
      >
        <!-- 파일 첨부 아이콘 (파일 태그일 때만 표시) -->
        <img
          v-show="wholeTagInfo.type === INPUT_TAG_TYPES.FILE"
          :src="fileAttachIconPath"
          alt="file attach icon"
          class="file-attach-icon"
        />

        <!-- 태그 텍스트 -->
        {{ formatTag(wholeTagInfo.value) }}

        <!-- 태그 삭제 버튼 -->
        <img
          :src="tagDeleteIconPath"
          alt="tag delete icon"
          class="tag-delete-icon"
          @click="handleDeleteTag(wholeTagInfo.index, wholeTagInfo.type)"
        />
      </li>
    </ul>

    <!-- 메시지 입력창 -->
    <textarea
      :value="modelValue"
      class="message-text"
      :placeholder="displayMessage"
      :disabled="!chatMessageStore.canInputMessage"
      maxlength="2000"
      @input="handleTextareaInput"
      @keydown.enter="handleEnter"
    />
  </div>
</template>

<script setup>
/**
 * MessageTextArea.vue - 메시지 입력창 + 태그 관리
 */

import { useDataStore } from "@/stores/model/dataStore";
import { useFileStore } from "@/stores/model/module/useFileStore";
import { useChatMessageStore } from "@/stores/model/module/useChatMessageStore";
import tagDeleteIconPath from "@/assets/images/icon/tag_delete.png";
import fileAttachIconPath from "@/assets/images/icon/file_attach.png";
import { INPUT_TAG_TYPES } from "@/utils/constants";

// ==================== Props ====================
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  displayMessage: {
    type: String,
    default: "무엇이든 물어보세요.",
  },
});

// ==================== Emits ====================
const emit = defineEmits(["update:modelValue", "send-message"]);

// ==================== Stores ====================
const dataStore = useDataStore();
const fileStore = useFileStore();
const chatMessageStore = useChatMessageStore();

// ==================== Methods ====================
/**
 * handleDeleteTag: 태그 삭제
 *
 * 동작:
 * 1. dataStore.deleteAllAgentsAndFiles() 호출 (Agent 또는 File 삭제)
 * 2. 부모 컴포넌트에게 delete-tag 이벤트 전달 (필요시)
 *
 * @param {number} index - 태그 인덱스
 * @param {string} type - 태그 타입 ('agent' | 'file')
 */
const handleDeleteTag = (index, type) => {
  console.log("handleDeleteTag -  태그 삭제:", { index, type });
  dataStore.deleteAllAgentsAndFiles(index, type);
  console.log("✅ handleDeleteTag - 태그 삭제 완료, 현재 파일:", {
    count: fileStore.attachedFiles.length,
    files: fileStore.attachedFiles.map((f) => f.name),
  });
};

/**
 * handleTextareaInput: 자동 높이 조정
 *
 * 동작:
 * 1. 사용자 입력 감지
 * 2. textarea 높이를 내용에 맞게 조정
 * 3. v-model 업데이트
 */
const handleTextareaInput = (e) => {
  // 1. v-model 업데이트
  emit("update:modelValue", e.target.value);
  // 2. textarea 높이 자동 조정
  e.target.style.height = "auto"; // 일단 최소값으로
  e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"; // 최대 200px
};

// Enter 키 처리 (Shift+Enter는 줄바꿈)
const handleEnter = (e) => {
  if (e.shiftKey) {
    // Shift+Enter: 줄바꿈 (기본 동작)
    return;
  }

  e.preventDefault();

  if (props.modelValue.trim() || fileStore.attachedFiles.length > 0) {
    console.log("✉️ [MessageTextArea] Enter 키로 전송 시작");
    emit("send-message");
  }
};

const formatTag = (value) => {
  console.log("formatTag:value", value);

  if (!value) return "";

  // Step 1: 양쪽 공백 제거 (trim)
  const trimmed = value.trim();

  // Step 2: 내부 공백도 모두 제거 (replace)
  const noSpace = trimmed.replace(/\s+/g, "");

  // Step 3: @ 추가
  return noSpace.startsWith("@") ? noSpace : "@" + noSpace;
};
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;

.message-text-area {
  min-height: 100px;

  /* 태그 목록 */
  .mode-list {
    margin: 0;
    padding: 0;
    margin-bottom: 5px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .mode-tag {
      min-height: 35px;
      display: inline-flex;
      align-items: center;
      border-radius: 10px;
      padding: 6px 10px;
      font-size: $font-size-sm;
      font-weight: 700;
      animation: tagSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;

      /* Agent 태그 스타일 */
      &.agent {
        background-color: var(--primary-hover-color);
        color: $black !important;
      }

      /* File 태그 스타일 */
      &.file {
        background-color: $white;
        border: 1px solid $gray-300;
        color: $primary-text;
      }

      /* 파일 첨부 아이콘 */
      .file-attach-icon {
        width: 20px;
        height: 20px;
        margin-right: $spacing-2;
      }

      /* 태그 삭제 버튼 */
      .tag-delete-icon {
        width: 20px;
        height: 20px;
        margin-left: $spacing-2;
        cursor: pointer;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.2);
        }
      }
    }
  }

  /* textarea 스타일 */
  .message-text {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    font-size: $font-size-base;
    line-height: 1.2;
    color: $primary-text;
    word-break: break-word;

    /*  자동 높이 조정을 위한 필수 설정 */
    resize: none; /* 사용자 수동 resize 비활성화 */
    overflow: hidden; /* 스크롤 안 생김 */
    min-height: 50px; /* 최소 높이 */
    max-height: 100px; /* 최대 높이 */

    font-family: inherit; /* 부모의 폰트 상속 */

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:focus {
      outline: none;
    }
  }
}

/* 애니메이션 */
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
</style>
