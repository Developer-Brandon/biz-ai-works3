/**
 * ============================================================
 * useFileStore.js
 * ============================================================
 *
 * 역할:
 * - 첨부 파일 목록 관리
 * - 파일 추가/제거
 * - 파일 태그 정보 생성
 * 특징:
 * - 최대 3개 파일까지만 첨부 가능
 * - 파일 객체는 태그 형태로 변환
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { STORAGE_KEYS } from "@/utils/constants";

export const useFileStore = defineStore(
  "file",
  () => {
    // ================================
    // STATE: 첨부 파일
    // ================================

    /**
     * 첨부된 파일 배열
     * 예: [
     *   { name: "document.pdf", size: 1024 },
     *   { name: "image.png", size: 2048 }
     * ]
     *
     * 저장 안 함: 임시 상태로 관리
     */
    const attachedFiles = ref([]);

    /**
     * 카드에서 선택 여부
     * - true: CardListSection에서 선택된 상태
     * - false: 초기 상태
     */
    const isFromCard = ref(false);

    // ================================
    // COMPUTED: 파일 태그
    // ================================

    /**
     * 파일 태그 목록
     * 예: [
     *   { index: 0, type: "file", value: "document.pdf" },
     *   { index: 1, type: "file", value: "image.png" }
     * ]
     *
     * 용도: 입력창에 표시되는 파일 태그들
     */
    const fileTagInfoList = computed(() => {
      const fileTags = [];

      if (attachedFiles.value && attachedFiles.value.length > 0) {
        attachedFiles.value.forEach((file, index) => {
          fileTags.push({
            index: index,
            type: "file",
            value: `${file.name}`,
          });
        });
      }

      return fileTags;
    });

    /**
     * 파일이 첨부되었는지 여부
     */
    const hasAttachedFiles = computed(() => {
      return attachedFiles.value.length > 0;
    });

    // ================================
    // ACTIONS: 파일 관리
    // ================================

    /**
     * 파일 첨부 처리
     * - 최대 3개까지만 허용
     * - 초과 시 경고 및 자동 제한
     *
     * 매개변수:
     * - files: File[] (추가할 파일 배열)
     */
    const handleAttachFile = (files) => {
      console.group("[handleAttachFile] 파일 첨부");

      const newAttachedFiles = [...attachedFiles.value, ...files];

      // 최대 3개 파일 제한 확인
      if (newAttachedFiles.length > 3) {
        console.warn("✗ 최대 3개까지만 파일을 첨부할 수 있습니다.");
        attachedFiles.value = newAttachedFiles.slice(0, 3);
      } else {
        attachedFiles.value = newAttachedFiles;
      }

      console.log("파일 첨부 완료:", {
        count: attachedFiles.value.length,
        files: attachedFiles.value.map((f) => f.name),
      });

      console.groupEnd();
    };

    /**
     * 파일 삭제
     * - 특정 인덱스의 파일 제거
     *
     * 매개변수:
     * - index: number (삭제할 파일의 인덱스)
     */
    const deleteFile = (index) => {
      console.group("[deleteFile] 파일 삭제");
      console.log("삭제 인덱스:", index);

      if (index >= 0 && index < attachedFiles.value.length) {
        const deletedFile = attachedFiles.value[index];
        attachedFiles.value.splice(index, 1);

        console.log("파일 삭제 완료:", {
          fileName: deletedFile.name,
          remainingFiles: attachedFiles.value.length,
        });
      } else {
        console.warn("✗ 파일 인덱스 범위 초과:", index);
      }

      console.groupEnd();
    };

    /**
     * 모든 파일 초기화
     */
    const deleteAllFiles = () => {
      console.log("[deleteAllFiles] 모든 파일 초기화");
      attachedFiles.value = [];
      console.log("모든 파일 초기화 완료");
    };

    /**
     * 카드 선택 상태 설정
     */
    const setFromCard = (value) => {
      isFromCard.value = value;
      console.log(`isFromCard: ${value}`);
    };

    // ================================
    // EXPORT
    // ================================

    return {
      // State
      attachedFiles,
      isFromCard,

      // Computed
      fileTagInfoList,
      hasAttachedFiles,

      // Methods
      handleAttachFile,
      deleteFile,
      deleteAllFiles,
      setFromCard,
    };
  },
  {
    /**
     * Pinia Persistence 설정
     * - 파일 목록은 저장하지 않음 (임시 상태)
     * - 필요 시 나중에 추가 가능
     */
    persist: {
      storage: sessionStorage,
      paths: [],
      key: STORAGE_KEYS.SESSION_STORAGE_DATA.FILE_KEY,
    },
  },
);
