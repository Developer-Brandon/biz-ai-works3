<template>
  <button
    class="icon-button"
    :class="{ 'icon-button__has-file': attachedFiles.length > 0 }"
    title="파일 첨부"
    @click="toggleUploadDropdown"
  >
    <!-- ==================== 클립 아이콘 ==================== -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M5 12.6667V7C5 4.23858 7.23858 2 10 2V2C12.7614 2 15 4.23858 15 7V14.6667C15 16.5076 13.5076 18 11.6667 18V18C9.82572 18 8.33333 16.5076 8.33333 14.6667V7.22222C8.33333 6.30175 9.07953 5.55556 10 5.55556V5.55556C10.9205 5.55556 11.6667 6.30175 11.6667 7.22222V14.4444"
        :stroke="
          attachedFiles.length > 0
            ? configStore.mainColorHexCode
            : 'var(--primary-icon-color)'
        "
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>

    <!-- ==================== 파일 업로드 드롭다운 ==================== -->
    <transition name="upload-dropdown-fade">
      <div v-if="isUploadDropdownOpen" class="upload-dropdown" @click.stop>
        <!-- 드롭다운 옵션 -->
        <div
          v-for="uploadOption in uploadOptionList"
          :key="uploadOption.id"
          class="dropdown-option"
          @click="selectUploadOption(uploadOption.id)"
        >
          <!-- 좌측: 아이콘 -->
          <div class="dropdown-option__icon">
            <img :src="uploadOption.icon" :alt="uploadOption.title" />
          </div>

          <!-- 중앙: 텍스트 (제목 + 설명) -->
          <div class="dropdown-option__info">
            <p class="dropdown-option__info__title">{{ uploadOption.title }}</p>
            <p class="dropdown-option__info__explain">
              {{ uploadOption.explain }}
            </p>
          </div>
        </div>
      </div>
    </transition>
  </button>

  <!-- ==================== 숨겨진 파일 input ==================== -->
  <input
    ref="fileInputEl"
    type="file"
    multiple
    style="display: none"
    @change="handleFileSelect"
  />

  <div
    v-if="isUploadDropdownOpen"
    class="upload-dropdown-overlay"
    @click="closeUploadDropdown"
  ></div>
</template>

<script setup>
/**
 * UploadButton.vue - 파일 첨부 버튼
 *
 * 기능:
 * - 파일 선택 드롭다운 메뉴 (아이콘 + 텍스트)
 * - 문서 업로드 / 이미지 업로드 옵션
 * - 선택된 파일 개수 표시
 * - 드롭다운 자동 닫기 (외부 클릭)
 */

import { useConfigStore } from "@/stores/useConfigStore";
// import docUploadIcon from "@/assets/images/icon/file_attach.png"; // 추후 문서 업로드 기능 추가 시 주석 해제
import imageUploadIcon from "@/assets/images/icon/chat-image-upload.png";
import { ref, computed, onMounted } from "vue";

/* ==================== 상태 관리 ==================== */

/**
 * isUploadDropdownOpen: 드롭다운 메뉴 열림/닫힘 상태
 *
 * - true: 드롭다운 메뉴 표시
 * - false: 드롭다운 메뉴 숨김
 */
const isUploadDropdownOpen = ref(false);
const fileInputEl = ref(null);
const configStore = useConfigStore();

/* ==================== Props ==================== */

const props = defineProps({
  attachedFiles: {
    type: Array,
    default: () => [],
  },
});

/* ==================== 데이터 ==================== */

/**
 * uploadOptionList: 파일 업로드 옵션 목록
 *
 * 구조:
 * - id: 옵션 고유 ID
 * - icon: 옵션 아이콘 이미지 경로
 * - title: 옵션 제목
 * - explain: 옵션 설명 (지원 형식)
 * - accept: input accept 속성값
 *
 * 추후 서버 API에서 동적으로 받아올 데이터
 */
const uploadOptionList = computed(() => [
  // {
  //   id: "document",
  //   icon: docUploadIcon,
  //   title: "문서 업로드",
  //   explain: "txt, pdf, doc, csv, excel, md, html",
  //   accept: ".txt,.pdf,.doc,.docx,.csv,.xls,.xlsx,.md,.html",
  // },
  {
    id: "image",
    icon: imageUploadIcon,
    title: "이미지 업로드",
    explain: "png, jpeg, jpg, gif",
    accept: ".png,.jpg,.jpeg,.gif,.webp",
  },
]);

const emit = defineEmits(["attach-file"]);

const toggleUploadDropdown = () => {
  isUploadDropdownOpen.value = !isUploadDropdownOpen.value;
  console.log(
    `ðŸ”„ ì—…ë¡œë“œ ë“œë¡­ë‹¤ìš´ í† ê¸€: ${
      isUploadDropdownOpen.value ? "ì—´ìŒ" : "ë‹«ìŒ"
    }`,
  );
};

const closeUploadDropdown = () => {
  isUploadDropdownOpen.value = false;
  console.log("âŒ ì—…ë¡œë“œ ë“œë¡­ë‹¤ìš´ ë‹«ìŒ");
};

const selectUploadOption = (optionId) => {
  const selectedOption = uploadOptionList.value.find(
    (opt) => opt.id === optionId,
  );

  if (selectedOption && fileInputEl.value) {
    fileInputEl.value.accept = selectedOption.accept;
    fileInputEl.value.click();
    console.log(`âœ… ì—…ë¡œë“œ ì˜µì…˜ ì„ íƒ: ${selectedOption.title}`);
  }

  closeUploadDropdown();
};

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);

  if (files.length > 0) {
    emit("attach-file", files);
    console.log(`ðŸ“ íŒŒì¼ ì„ íƒë¨: ${files.length}ê°œ`, files);
  }

  e.target.value = "";
};

onMounted(() => {
  const handleDocumentClick = (event) => {
    const clickedElement = event.target;
    const isInsideIconButton = clickedElement.closest(".icon-button");
    const isInsideUploadDropdown = clickedElement.closest(".upload-dropdown");

    if (!isInsideIconButton && !isInsideUploadDropdown) {
      isUploadDropdownOpen.value = false;
    }
  };

  document.addEventListener("click", handleDocumentClick);

  return () => {
    document.removeEventListener("click", handleDocumentClick);
  };
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;
@use "@/assets/styles/whole_animations.scss" as *;

.icon-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: $spacing-1;
  border-radius: $border-radius-base;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: $gray-100;
  }

  &:active {
    // transform: scale(0.95);
  }

  &__has-file {
    color: var(--primary-color);
  }
}

.upload-dropdown {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  z-index: $z-popover;
  min-width: 240px;
  background-color: $white;
  border: 1px solid $gray-200;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-lg;
  overflow: hidden;
  animation: fadeIn $transition-base ease-out;
}

.dropdown-option {
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
  padding: $spacing-3 $spacing-4;
  cursor: pointer;
  transition: all $transition-base;
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
  @media (max-width: 768px) {
    gap: $spacing-1;
  }
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--primary-hover-color);
  }
  &__icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    @media (max-width: 768px) {
      width: 18px;
      height: 18px;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      @media (max-width: 768px) {
        margin-top: 2px;
      }
    }
  }
  &__info {
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
    flex: 1;
    min-width: 0;
    &__title {
      margin: 0;
      line-height: 1.5;
      text-align: start;
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $primary-text;
      transition: color $transition-base;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &__explain {
      margin: 0;
      line-height: 0.5;
      text-align: start;
      font-size: $font-size-xs;
      color: $gray-500;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.upload-dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-popover - 1;
  background-color: transparent;
  cursor: auto;
  pointer-events: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px) translateX(-50%);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(-50%);
  }
}

.upload-dropdown-fade-enter-active,
.upload-dropdown-fade-leave-active {
  transition: all $transition-base ease-out;
}

.upload-dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px) translateX(-50%);
}

.upload-dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) translateX(-50%);
}
</style>
