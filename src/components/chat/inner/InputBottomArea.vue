<!-- src/components/chat/inner/InputBottomArea.vue -->
<!--
  역할: 하단 AI Agent 버튼 + 모델 선택 드롭다운
  추출 부분: .input-bottom-area
-->
<template>
  <div class="input-bottom-area no-drag">
    <!-- 좌측: AI Agent 버튼 -->
    <AIAgentButton />
    <!-- 우측: 모델 선택 드롭다운 -->
    <AIModelInfoDropdown />
  </div>
</template>

<script setup>
/**
 * InputBottomArea.vue - 하단 섹션 (AI Agent + 모델 선택)
 * ============================================================
 * 역할:
 * ============================================================
 * - ChatInputArea.vue에서 추출된 컴포넌트
 * - .input-bottom-area 섹션을 독립 컴포넌트화
 * - AI Agent 버튼과 모델 선택 드롭다운을 함께 관리
 * ============================================================
 * chatMode 상태 관리:
 * ============================================================
 * chatMode 값:
 *   - null: 초기 상태 (아무것도 선택 안 함)
 *   - "chat": 일반 채팅 모드 (모델 선택)
 *   - "agent": AI Agent 채팅 모드 (에이전트 선택)
 *
 * 버튼 상태:
 *   - null: 초기화
 */

import AIAgentButton from "@/components/chat/inner/button/AIAgentButton.vue";
import AIModelInfoDropdown from "@/components/chat/inner/dropdown/AIModelInfoDropdown.vue";
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;

/**
 * ============================================================
 * 입력 필드 하단 섹션
 * ============================================================
 *
 * 레이아웃:
 * - display: flex로 좌우 배치
 * - gap으로 컴포넌트 간 간격 조정
 * - justify-content: space-between으로 양쪽 끝에 배치
 */
.input-bottom-area {
  display: flex;
  gap: $spacing-1;
  justify-content: space-between;

  /**
   * 반응형 처리 : 모바일에서는 간격을 조금 줄임
   */
  @media (max-width: 768px) {
    gap: 8px;
  }
}
</style>
